#!/usr/bin/env node
/**
 * competitor-keyword-scan.mjs
 *
 * For each competitor domain in --domains (or COMPETITOR_DOMAINS env), fetches
 * the sitemap, then pulls each URL's <title>, meta description, H1, and
 * og:title. Extracts candidate keyword phrases the writer can prioritize.
 *
 * Compares against our own blog slugs (client/public/data/blog) and flags
 * topics we don't yet cover.
 *
 * Output: .omc/seo/competitor-keywords-YYYY-MM-DD.json
 *
 * Defaults:
 *   --domains=outequippro.com
 *   --max-urls=80              cap per competitor
 *
 * Zero external deps. Polite: 600ms delay between page fetches.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, '.omc', 'seo');
const BLOG_DIR = path.join(ROOT, 'client', 'public', 'data', 'blog');
fs.mkdirSync(OUT_DIR, { recursive: true });

function arg(name, fallback) {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=').slice(1).join('=') : fallback;
}

const DOMAINS = (arg('domains', process.env.COMPETITOR_DOMAINS || 'outequippro.com'))
  .split(',').map((s) => s.trim()).filter(Boolean);
const MAX_URLS = Number(arg('max-urls', 80));
const DELAY_MS = Number(arg('delay-ms', 600));
const UA = 'CoolDriveProSEOBot/1.0 (+https://cooldrivepro.com/)';

const STOPWORDS = new Set('a an the of for with to from in on at by and or your you our we is are be best top how what why when where new vs site home page guide review reviews shop store buy 2024 2025 2026 ndash mdash amp nbsp this that these those it its product description'.split(' '));
const NOISE_PATTERNS = [/^description /, / description$/, /^this /, /^product /, / product$/];

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function fetchText(url, { timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA }, signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractUrlsFromSitemap(xml) {
  if (!xml) return [];
  const urls = [];
  const reLoc = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m;
  while ((m = reLoc.exec(xml)) !== null) urls.push(m[1]);
  return urls;
}

async function collectUrls(domain) {
  const candidates = [`https://${domain}/sitemap.xml`, `https://${domain}/sitemap_index.xml`];
  const collected = new Set();
  for (const sm of candidates) {
    const xml = await fetchText(sm);
    if (!xml) continue;
    const urls = extractUrlsFromSitemap(xml);
    // Detect sitemap index → recurse one level
    if (xml.includes('<sitemapindex')) {
      for (const child of urls.slice(0, 10)) {
        const childXml = await fetchText(child);
        for (const u of extractUrlsFromSitemap(childXml)) collected.add(u);
        await sleep(DELAY_MS);
      }
    } else {
      for (const u of urls) collected.add(u);
    }
    if (collected.size > 0) break;
  }
  return [...collected].filter((u) => u.startsWith(`https://${domain}`) || u.startsWith(`http://${domain}`)).slice(0, MAX_URLS);
}

function extractMeta(html, url) {
  const get = (re) => { const m = html.match(re); return m ? m[1].trim().replace(/\s+/g, ' ') : ''; };
  const decode = (s) => s
    .replace(/&(ndash|#8211);/gi, '-')
    .replace(/&(mdash|#8212);/gi, '-')
    .replace(/&(nbsp|#160);/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)));
  return {
    url,
    title: decode(get(/<title[^>]*>([^<]{1,300})<\/title>/i)),
    description: decode(get(/<meta\s+name=["']description["']\s+content=["']([^"']{1,400})["']/i)),
    h1: decode(get(/<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i).replace(/<[^>]+>/g, '')),
    ogTitle: decode(get(/<meta\s+property=["']og:title["']\s+content=["']([^"']{1,300})["']/i)),
  };
}

function phraseCandidates(text) {
  if (!text) return [];
  const cleaned = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const tokens = cleaned.split(' ').filter((t) => t && !STOPWORDS.has(t) && t.length > 1);
  const phrases = new Set();
  for (let n = 2; n <= 4; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const ph = tokens.slice(i, i + n).join(' ');
      if (ph.length >= 6 && ph.length <= 60) phrases.add(ph);
    }
  }
  return [...phrases];
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

async function scanDomain(domain) {
  console.log(`→ ${domain}: collecting URLs`);
  const urls = await collectUrls(domain);
  console.log(`   found ${urls.length} URLs (capped at ${MAX_URLS})`);
  const pages = [];
  const phraseFreq = new Map();
  for (const url of urls) {
    const html = await fetchText(url);
    if (!html) { await sleep(DELAY_MS); continue; }
    const meta = extractMeta(html, url);
    pages.push(meta);
    const corpus = [meta.title, meta.ogTitle, meta.h1, meta.description].filter(Boolean).join(' ');
    for (const ph of phraseCandidates(corpus)) {
      if (NOISE_PATTERNS.some((re) => re.test(ph))) continue;
      phraseFreq.set(ph, (phraseFreq.get(ph) || 0) + 1);
    }
    await sleep(DELAY_MS);
  }
  const topPhrases = [...phraseFreq.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([phrase, count]) => ({ phrase, count }));
  return { domain, urlsScanned: pages.length, pages, topPhrases };
}

function loadOurSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return new Set();
  return new Set(fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')));
}

async function main() {
  const ourSlugs = loadOurSlugs();
  const today = new Date().toISOString().slice(0, 10);
  const report = { generatedAt: new Date().toISOString(), domains: [] };

  for (const domain of DOMAINS) {
    const scan = await scanDomain(domain);
    const brandTokens = new Set(domain.replace(/\.[a-z]+$/i, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    const gapTopics = scan.topPhrases
      .filter((p) => !p.phrase.split(' ').some((tok) => brandTokens.has(tok)))
      .map((p) => ({ ...p, slug: slugify(p.phrase) }))
      .filter((p) => !ourSlugs.has(p.slug) && !ourSlugs.has(`${p.slug}-guide`))
      .slice(0, 40);
    report.domains.push({ ...scan, gapTopics });
  }

  const out = path.join(OUT_DIR, `competitor-keywords-${today}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'competitor-keywords-latest.json'), JSON.stringify(report, null, 2));
  console.log(`✅ Wrote ${out}`);
  for (const d of report.domains) {
    console.log(`   ${d.domain}: ${d.urlsScanned} pages, ${d.topPhrases.length} top phrases, ${d.gapTopics.length} gap topics`);
  }
}

main().catch((err) => {
  console.error('❌ competitor-keyword-scan failed:', err.message);
  process.exit(1);
});
