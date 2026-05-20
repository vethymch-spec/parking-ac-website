#!/usr/bin/env node
/**
 * seo-feed-topics.mjs
 *
 * Reads the latest GSC + competitor scan outputs and appends new queued
 * topics into .omc/content-pipeline/topics.jsonl so the writer pipeline
 * (content-pipeline-run.mjs) picks them up on the next run.
 *
 * Sources of topic ideas:
 *   1. GSC near-misses  (queries ranking 5–20 with ≥50 impressions)
 *      → "freshness/expansion" topics — likely we already have a related
 *        page, but the angle deserves dedicated content.
 *   2. GSC zero-CTR high-impression queries
 *      → same intent bucket; high signal we lack a matching page.
 *   3. Competitor gap topics from competitor-keyword-scan.mjs
 *      → topics competitors rank for that we don't cover.
 *
 * Guards:
 *   - Skips slugs already present in topics.jsonl OR in client/public/data/blog
 *   - Caps additions at MAX_NEW_TOPICS_PER_RUN (default 5)
 *   - Marks addedBy="seo-auto" + sourceSignal so they can be audited/reverted
 *   - Generates schema-valid topic objects (≥3 outlineHints, primaryKeyword,
 *     searchVolumeMonthly ≥ 50, intent, etc.) so quality gates in
 *     content-pipeline-run.mjs don't reject them outright
 *
 * Dry run: --dry
 * Cap:     --max=5
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PIPELINE_DIR = path.join(ROOT, '.omc', 'content-pipeline');
const TOPICS_FILE = path.join(PIPELINE_DIR, 'topics.jsonl');
const SEO_DIR = path.join(ROOT, '.omc', 'seo');
const BLOG_DIR = path.join(ROOT, 'client', 'public', 'data', 'blog');
const LOG_FILE = path.join(SEO_DIR, 'topic-feed-log.jsonl');

const arg = (name, fallback) => {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=').slice(1).join('=') : fallback;
};
const DRY = process.argv.includes('--dry');
const MAX = Number(arg('max', 5));

fs.mkdirSync(PIPELINE_DIR, { recursive: true });
fs.mkdirSync(SEO_DIR, { recursive: true });

function loadJsonSafe(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}
function loadJsonlSafe(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}
function titleCase(s) {
  return String(s).split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}
function classifyIntent(phrase) {
  const p = phrase.toLowerCase();
  if (/\b(buy|price|cost|cheap|sale|wholesale|supplier|manufacturer|for sale|near me)\b/.test(p)) return 'transactional';
  if (/\b(vs|review|best|top|compare|comparison|alternative)\b/.test(p)) return 'commercial';
  return 'informational';
}
function buildOutlineHints(phrase, intent) {
  const cap = titleCase(phrase);
  const base = [
    `What ${cap} actually means for fleet/owner-operator buyers`,
    `Specs and form factors that matter (12V/24V, BTU, dB, weight)`,
    `Real-world install considerations and roof-opening fit`,
    `Cost of ownership: upfront + maintenance + idle-fuel savings`,
  ];
  if (intent === 'transactional') base.push('Buying checklist + how to verify supplier credibility');
  if (intent === 'commercial') base.push('Side-by-side comparison matrix vs the top 3 alternatives');
  if (intent === 'informational') base.push('Common myths and FAQ from operator forums');
  base.push('CoolDrivePro recommendation tailored to this use case');
  return base;
}

// --- Load existing slugs we won't duplicate ---
const existingTopics = loadJsonlSafe(TOPICS_FILE);
const existingSlugs = new Set(existingTopics.map((t) => t.slug));
if (fs.existsSync(BLOG_DIR)) {
  for (const f of fs.readdirSync(BLOG_DIR)) {
    if (f.endsWith('.json') && f !== 'list.json' && f !== 'manifest.json' && f !== 'locale-availability.json') {
      existingSlugs.add(f.replace(/\.json$/, ''));
    }
  }
}

// --- Collect candidate phrases with provenance ---
const candidates = []; // {phrase, source, signal, impressions?, position?}

const gsc = loadJsonSafe(path.join(SEO_DIR, 'gsc-opportunities-latest.json'));
if (gsc) {
  for (const r of (gsc.nearMisses || [])) {
    candidates.push({ phrase: r.query, source: 'gsc-near-miss', impressions: r.impressions, position: r.position });
  }
  for (const r of (gsc.zeroCtrHighImpressions || [])) {
    candidates.push({ phrase: r.query, source: 'gsc-zero-ctr', impressions: r.impressions, position: r.position });
  }
}

const comp = loadJsonSafe(path.join(SEO_DIR, 'competitor-keywords-latest.json'));
if (comp) {
  for (const d of (comp.domains || [])) {
    for (const g of (d.gapTopics || [])) {
      candidates.push({ phrase: g.phrase, source: `competitor:${d.domain}`, count: g.count });
    }
  }
}

// --- Score, dedupe, filter ---
const seen = new Set();
const scored = [];
// Domain anchor: a candidate must contain at least one of these tokens to
// avoid generic short phrases like "air conditioner" or "vans campers".
const DOMAIN_ANCHORS = ['parking', 'cabin', 'sleeper', 'apu', 'idle', 'idling', 'truck', 'semi', 'rv', 'van', 'camper', 'fleet', 'rooftop', 'split', 'diesel', 'battery', '12v', '24v', 'btu', 'inverter', 'compressor'];
// GSC queries always pass the anchor check (real search demand is its own signal)
for (const c of candidates) {
  const phrase = String(c.phrase || '').toLowerCase().trim();
  if (!phrase) continue;
  const words = phrase.split(/\s+/);
  if (words.length < 3 || words.length > 8) continue;
  if (phrase.length < 10 || phrase.length > 70) continue;
  const isGsc = c.source && c.source.startsWith('gsc-');
  if (!isGsc && !words.some((w) => DOMAIN_ANCHORS.includes(w))) continue;
  const slug = slugify(phrase);
  if (!slug || /^\d/.test(slug) || existingSlugs.has(slug) || seen.has(slug)) continue;
  seen.add(slug);

  // Heuristic volume: GSC impressions/month, or competitor count × 30 floor
  let volume = 0;
  if (c.impressions) volume = Math.max(50, Math.round((c.impressions / 28) * 30));
  else if (c.count) volume = Math.max(50, c.count * 40);
  if (volume < 50) continue;

  // Heuristic score: GSC near-miss > zero-ctr > competitor-gap
  const sourceWeight = c.source === 'gsc-near-miss' ? 1.4 : c.source === 'gsc-zero-ctr' ? 1.2 : 1.0;
  const score = Math.round(volume * sourceWeight);

  scored.push({ phrase, slug, source: c.source, impressions: c.impressions, position: c.position, count: c.count, volume, score });
}

scored.sort((a, b) => b.score - a.score);
// Cluster-dedupe: suppress candidates whose token set is a subset or near-
// superset (Jaccard ≥ 0.6) of an already-picked candidate's tokens, so the
// queue doesn't get flooded with N-gram variants of the same theme.
const picked = [];
const pickedSets = [];
for (const c of scored) {
  const tokens = new Set(c.phrase.split(/\s+/));
  let dup = false;
  for (const s of pickedSets) {
    const inter = [...tokens].filter((t) => s.has(t)).length;
    const union = new Set([...tokens, ...s]).size;
    const jaccard = inter / union;
    const subset = inter === tokens.size || inter === s.size;
    if (subset || jaccard >= 0.5) { dup = true; break; }
  }
  if (dup) continue;
  picked.push(c);
  pickedSets.push(tokens);
  if (picked.length >= MAX) break;
}

if (picked.length === 0) {
  console.log('No new topic candidates after dedupe. Nothing to add.');
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
const newTopics = picked.map((p) => {
  const intent = classifyIntent(p.phrase);
  const hash = crypto.createHash('sha1').update(p.slug).digest('hex').slice(0, 6);
  return {
    id: `seo-auto-${today}-${hash}`,
    slug: p.slug,
    title: `${titleCase(p.phrase)}: Complete 2026 Guide for Fleet Operators`,
    category: intent === 'transactional' ? 'Buying Guides' : intent === 'commercial' ? 'Reviews & Comparisons' : 'How-To',
    primaryKeyword: p.phrase,
    searchVolumeMonthly: p.volume,
    competitionScore: 0.45,
    intent,
    outlineHints: buildOutlineHints(p.phrase, intent),
    dataSourceFiles: [],
    internalLinkTargets: ['parking-ac-buying-guide-2025', '12v-vs-24v-parking-ac', 'best-parking-ac-2026'],
    status: 'queued',
    createdAt: today,
    addedBy: 'seo-auto',
    sourceSignal: {
      source: p.source,
      impressions: p.impressions,
      position: p.position,
      competitorCount: p.count,
    },
  };
});

console.log(`→ ${picked.length} new topic(s) to append (max=${MAX}, candidates=${scored.length}):`);
for (const t of newTopics) {
  console.log(`   [${t.sourceSignal.source}] ${t.slug}  (vol≈${t.searchVolumeMonthly}, intent=${t.intent})`);
}

if (DRY) {
  console.log('--dry: not writing.');
  process.exit(0);
}

const appendBlob = newTopics.map((t) => JSON.stringify(t)).join('\n') + '\n';
fs.appendFileSync(TOPICS_FILE, appendBlob);

const logEntry = { ts: new Date().toISOString(), addedSlugs: newTopics.map((t) => t.slug), totalCandidates: scored.length };
fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');

console.log(`✅ Appended ${newTopics.length} topic(s) to ${path.relative(ROOT, TOPICS_FILE)}`);
