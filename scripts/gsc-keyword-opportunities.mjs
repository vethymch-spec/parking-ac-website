#!/usr/bin/env node
/**
 * gsc-keyword-opportunities.mjs
 *
 * Pulls last 28 days of Google Search Console Search Analytics for
 * cooldrivepro.com and surfaces two opportunity buckets:
 *
 *   1. "ctr-leaks"  — pages with impressions ≥ MIN_IMPRESSIONS and CTR < CTR_THRESHOLD
 *                     → candidates for title / meta description rewrite
 *   2. "near-misses" — queries with avg position 5–20 and impressions ≥ 50
 *                      → candidates for new article / freshness refresh
 *
 * Output: .omc/seo/gsc-opportunities-YYYY-MM-DD.json
 *
 * Auth: requires env GSC_SERVICE_ACCOUNT_JSON (the raw JSON of a Google
 * service account that has been added as a "Full" user on the GSC property).
 * If the env var is not set, the script logs and exits 0 (graceful skip)
 * so the rest of the pipeline keeps running.
 *
 * Zero external deps — uses Node built-in crypto + fetch.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, '.omc', 'seo');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:cooldrivepro.com';
const MIN_IMPRESSIONS = Number(process.env.GSC_MIN_IMPRESSIONS || 200);
const CTR_THRESHOLD = Number(process.env.GSC_CTR_THRESHOLD || 0.02);
const DAYS = Number(process.env.GSC_DAYS || 28);

function exitSkip(reason) {
  console.log(`⏭  Skipping GSC opportunity scan: ${reason}`);
  process.exit(0);
}

const credsRaw = process.env.GSC_SERVICE_ACCOUNT_JSON;
if (!credsRaw) exitSkip('GSC_SERVICE_ACCOUNT_JSON env not set');

let creds;
try {
  creds = JSON.parse(credsRaw);
} catch (err) {
  exitSkip(`GSC_SERVICE_ACCOUNT_JSON is not valid JSON (${err.message})`);
}
if (!creds.client_email || !creds.private_key) {
  exitSkip('service account JSON missing client_email or private_key');
}

function base64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function fetchAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const signingInput = `${header}.${claim}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  const signature = signer.sign(creds.private_key);
  const jwt = `${signingInput}.${base64url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body.access_token;
}

async function searchAnalytics(token, dimensions) {
  const end = new Date();
  const start = new Date(end.getTime() - DAYS * 86400 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate: fmt(start),
      endDate: fmt(end),
      dimensions,
      rowLimit: 5000,
    }),
  });
  if (!res.ok) throw new Error(`GSC query failed (${dimensions.join('+')}): ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body.rows || [];
}

async function main() {
  console.log(`→ GSC opportunity scan: site=${SITE_URL}, days=${DAYS}`);
  const token = await fetchAccessToken();

  const pageRows = await searchAnalytics(token, ['page']);
  const queryRows = await searchAnalytics(token, ['query', 'page']);

  const ctrLeaks = pageRows
    .filter((r) => r.impressions >= MIN_IMPRESSIONS && r.ctr < CTR_THRESHOLD)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 50)
    .map((r) => ({
      page: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: Number(r.ctr.toFixed(4)),
      position: Number(r.position.toFixed(2)),
    }));

  const nearMisses = queryRows
    .filter((r) => r.position >= 5 && r.position <= 20 && r.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 100)
    .map((r) => ({
      query: r.keys[0],
      page: r.keys[1],
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: Number(r.ctr.toFixed(4)),
      position: Number(r.position.toFixed(2)),
    }));

  const zeroCtrHighImpressions = queryRows
    .filter((r) => r.clicks === 0 && r.impressions >= 100)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 50)
    .map((r) => ({
      query: r.keys[0],
      page: r.keys[1],
      impressions: r.impressions,
      position: Number(r.position.toFixed(2)),
    }));

  const today = new Date().toISOString().slice(0, 10);
  const out = {
    generatedAt: new Date().toISOString(),
    site: SITE_URL,
    windowDays: DAYS,
    thresholds: { minImpressions: MIN_IMPRESSIONS, ctrThreshold: CTR_THRESHOLD },
    counts: {
      ctrLeaks: ctrLeaks.length,
      nearMisses: nearMisses.length,
      zeroCtrHighImpressions: zeroCtrHighImpressions.length,
    },
    ctrLeaks,
    nearMisses,
    zeroCtrHighImpressions,
  };
  const outFile = path.join(OUT_DIR, `gsc-opportunities-${today}.json`);
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'gsc-opportunities-latest.json'), JSON.stringify(out, null, 2));
  console.log(`✅ Wrote ${outFile}`);
  console.log(`   CTR leaks: ${out.counts.ctrLeaks} | near-misses: ${out.counts.nearMisses} | zero-CTR-high-impr: ${out.counts.zeroCtrHighImpressions}`);
}

main().catch((err) => {
  console.error('❌ gsc-keyword-opportunities failed:', err.message);
  process.exit(1);
});
