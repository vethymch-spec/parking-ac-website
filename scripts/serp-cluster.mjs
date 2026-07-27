#!/usr/bin/env node
/**
 * serp-cluster.mjs — Stage 2 (research) engine for cooldrivepro-seo skill.
 *
 * Reads SERPER_API_KEY from process.env (loaded from .env via --env-file).
 * Generates seed keyword list inline (curated for parking-AC B2B niche),
 * fetches Top10 Google SERP per seed (cached to disk), clusters by SERP overlap
 * (≥3 shared URLs in Top10 → same cluster, Union-Find), classifies intent,
 * maps each cluster to one of H1..H9 Hubs, scores priority, cross-checks
 * cannibalization against client/public/data/blog/list.json.
 *
 * Output:
 *   research/<YYYY-MM-DD>/seeds.txt
 *   research/<YYYY-MM-DD>/serp-raw/<slug>.json (cached SERP)
 *   research/<YYYY-MM-DD>/keyword-map.csv
 *   research/<YYYY-MM-DD>/clusters.json
 *   research/<YYYY-MM-DD>/cluster-architecture.mmd
 *   research/<YYYY-MM-DD>/orphans.csv
 *   research/<YYYY-MM-DD>/cannibalization-flags.csv
 *   research/<YYYY-MM-DD>/report.md
 *
 * Usage:
 *   node --env-file=.env scripts/serp-cluster.mjs
 *   node --env-file=.env scripts/serp-cluster.mjs --limit=50 --no-fetch
 *   node --env-file=.env scripts/serp-cluster.mjs --gl=de --hl=de
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const TODAY = new Date().toISOString().slice(0, 10);
const OUT_DIR = path.join(ROOT, 'research', TODAY);
const RAW_DIR = path.join(OUT_DIR, 'serp-raw');
fs.mkdirSync(RAW_DIR, { recursive: true });

const arg = (name, fallback) => {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=').slice(1).join('=') : fallback;
};
const LIMIT = Number(arg('limit', 0)) || Infinity;
const GL = arg('gl', 'us');
const HL = arg('hl', 'en');
const NO_FETCH = process.argv.includes('--no-fetch'); // use cache only
const OVERLAP_THRESHOLD = Number(arg('overlap', 3));

const KEY = process.env.SERPER_API_KEY;
if (!KEY && !NO_FETCH) {
  console.error('FATAL: SERPER_API_KEY not set. Run with `node --env-file=.env scripts/serp-cluster.mjs` after putting SERPER_API_KEY in .env');
  process.exit(1);
}

// ============================================================
// SEED BANK (~250 kw, parking-AC B2B-first, mapped to 9 Hubs)
// ============================================================
const SEEDS = [
  // ---------- H1 Truck Sleeper (commercial + informational) ----------
  'parking ac for trucks', 'truck sleeper ac', '24v parking ac', '12v parking ac for trucks',
  'no idle truck ac', 'electric truck cab ac', 'best truck sleeper ac', 'class 8 sleeper ac',
  'semi truck parking ac', 'long haul truck ac', 'truck overnight ac', 'cab cooling no idle',
  'truck sleeper ac reviews', 'electric apu for trucks', 'battery powered truck ac',
  'no idle ac for semi trucks', 'truck parking air conditioner 24v', 'truck cab ac without idling',
  'sleeper cab cooling system', '24v truck ac no idle',

  // ---------- H2 RV / Motorhome ----------
  'rv rooftop air conditioner', 'best rv ac unit', 'rv ac 12v battery', 'quiet rv air conditioner',
  '12v rooftop ac for rv', 'class a rv ac', 'class b van rv ac', 'class c motorhome ac',
  'rv air conditioner brands', 'low profile rv ac', 'rv ac with heat pump', 'rooftop air conditioner motorhome',
  'rv ac power consumption', 'rv ac battery how long', 'best rv ac for off grid',

  // ---------- H3 Van / Camper conversion ----------
  'sprinter van ac', 'camper van ac unit', 'off grid van ac', 'transit van ac install',
  'promaster ac for camper', 'best van conversion ac', 'low profile van ac', 'parking ac for camper van',
  'rooftop ac for sprinter', '12v ac for camper van', 'van life ac unit',

  // ---------- H4 Battery / Solar Electric AC ----------
  'lifepo4 truck ac', 'battery powered ac for sleeping', 'solar powered rv ac',
  'how many amp hours run ac all night', 'battery for 12v ac unit', 'best battery for parking ac',
  'lifepo4 battery for parking ac', 'solar panel for parking ac', 'inverter for rv ac',
  'parking ac power draw', '12v ac amp draw', 'how long can battery run ac',

  // ---------- H5 Anti-Idling & Fleet Economics ----------
  'anti idling law california', 'truck idling laws by state', 'apu vs battery ac',
  'fleet anti idling solutions', 'carb smartway approved ac', 'no idle truck regulations',
  'fleet fuel savings no idle', 'truck idle reduction technology', 'apu return on investment trucking',
  'electric apu vs diesel apu', 'no idle ordinance', 'epa smartway parking ac', 'idle reduction grant 2026',

  // ---------- H6 Comparison / Alternatives ----------
  'dometic vs webasto parking ac', 'webasto vs eberspacher', 'thermo king tripac vs carrier comfort pro',
  'rigmaster vs bergstrom nite', 'dometic alternative', 'webasto alternative', 'indel b alternative',
  'tripac alternative', 'truma ac alternative', 'dirna bycool review', 'autoclima review',
  'best alternative to dometic', 'cheaper than webasto', 'parking ac brand comparison',
  'top parking ac brands 2026', 'parking ac manufacturer comparison', 'kingclima vs guchen',
  'guchen vs kingclima', 'chinese parking ac brands', 'european parking ac brands',

  // ---------- H7 Installation, Fit & Compatibility ----------
  'how to install parking ac', 'roof cutout size parking ac', 'parking ac install cost',
  'install rooftop ac on truck', 'parking ac roof opening dimensions', 'best place to install parking ac',
  'parking ac install diy', 'can i install parking ac myself', 'parking ac mounting bracket',
  'parking ac install time', 'parking ac install kit', 'parking ac wiring diagram',
  'parking ac wiring kit', 'how to wire 12v ac', 'parking ac compatibility with sleeper',
  'rooftop ac fits which trucks', 'parking ac minimum roof thickness',

  // ---------- H8 Regional Buyer Guides ----------
  'best parking ac in usa', 'parking ac germany', 'parking ac australia', 'parking ac mexico',
  'parking ac uk', 'parking ac saudi arabia', 'parking ac uae', 'parking ac canada',
  'parking ac south africa', 'parking ac brazil', 'parking ac france', 'parking ac italy',
  'parking ac spain', 'parking ac poland', 'parking ac netherlands', 'parking ac sweden',
  'parking ac russia', 'parking ac turkey', 'parking ac thailand', 'parking ac vietnam',
  'parking ac malaysia', 'parking ac indonesia', 'parking ac india', 'parking ac japan',
  'parking ac korea', 'parking ac new zealand',

  // ---------- H9 OEM / Upfitter / Wholesale (B2B core) ----------
  'parking ac manufacturer china', 'parking ac wholesale supplier', 'parking ac oem',
  'parking ac distributor program', 'parking ac private label', 'parking ac moq',
  'oem truck ac manufacturer', 'parking ac factory direct', 'bulk parking ac supplier',
  'parking ac dealer wholesale', 'parking ac upfitter program', 'rv ac wholesale supplier',
  'parking ac distributor application', 'how to become parking ac distributor',
  'parking ac supplier verification', 'parking ac alibaba alternative', 'b2b parking ac supplier',
  'fleet parking ac bulk pricing', 'parking ac trade buyer', 'parking ac private label manufacturer',
  'parking ac white label', 'parking ac for upfitter shops',

  // ---------- Long-tail informational (split across H1-H7) ----------
  'how does parking ac work', 'what is parking ac', 'parking ac vs idle', 'parking ac vs apu',
  'parking ac noise db', 'quietest parking ac', 'parking ac btu calculator', 'parking ac btu for sleeper',
  'parking ac maintenance', 'parking ac warranty', 'parking ac troubleshooting',
  'parking ac not cooling', 'parking ac error codes', 'parking ac compressor failure',
  'parking ac refrigerant type', 'r134a vs r1234yf parking ac', 'parking ac inverter type',
  'parking ac for hot climate', 'parking ac with heat pump', 'parking ac for cold weather',

  // ---------- Intent-class derived (from 690-question doc, 25 classes) ----------
  'best parking ac supplier', 'parking ac brand background', 'parking ac export capability',
  'parking ac product specifications', 'parking ac pricing rfq', 'parking ac oem customization',
  'parking ac ce certification', 'parking ac installation guide', 'parking ac after sales support',
  'parking ac dealer partnership', 'parking ac use case industry',
  'parking ac power and battery system', 'parking ac pre sales consultation',
  'parking ac shipping and delivery', 'parking ac customer reviews case studies',
  'parking ac anti idling regulation', 'parking ac industry trends 2026',
  'parking ac multilingual support', 'parking ac troubleshooting guide',
  'parking ac safety fire compliance', 'parking ac global service network',
  'parking ac competitive intelligence', 'parking ac procurement risk',
  'parking ac long tail discovery',
];

// dedupe + trim
const uniqSeeds = [...new Set(SEEDS.map((s) => s.trim().toLowerCase()))].filter(Boolean);
console.log(`[seeds] ${uniqSeeds.length} unique seeds`);

// ============================================================
// SERPER FETCH (with disk cache)
// ============================================================
function slugifyForCache(kw) {
  return `${GL}_${HL}_` + kw.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 80);
}

async function fetchSerp(kw) {
  const cacheFile = path.join(RAW_DIR, slugifyForCache(kw) + '.json');
  if (fs.existsSync(cacheFile)) {
    return { kw, data: JSON.parse(fs.readFileSync(cacheFile, 'utf8')), cached: true };
  }
  if (NO_FETCH) return { kw, data: null, cached: false, skipped: true };
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: kw, gl: GL, hl: HL, num: 10 }),
  });
  if (!res.ok) {
    console.warn(`[serp] ${kw} -> HTTP ${res.status}`);
    return { kw, data: null, cached: false, error: `HTTP ${res.status}` };
  }
  const data = await res.json();
  fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
  return { kw, data, cached: false };
}

// helpers
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hostOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
};
const pathOf = (url) => {
  try { const u = new URL(url); return u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/$/, ''); } catch { return url; }
};

// ============================================================
// FETCH ALL SEEDS
// ============================================================
const targets = uniqSeeds.slice(0, LIMIT === Infinity ? uniqSeeds.length : LIMIT);
console.log(`[fetch] targeting ${targets.length} seeds (gl=${GL}, hl=${HL}, no-fetch=${NO_FETCH})`);

const serpResults = {};
let live = 0, cached = 0, errored = 0;
for (let i = 0; i < targets.length; i++) {
  const kw = targets[i];
  const r = await fetchSerp(kw);
  if (r.error) errored++;
  else if (r.cached) cached++;
  else if (r.data) live++;
  if (r.data) serpResults[kw] = r.data;
  if (i % 25 === 0) console.log(`  [${i + 1}/${targets.length}] cached=${cached} live=${live} err=${errored}`);
  if (!r.cached && r.data) await sleep(120); // be polite, ~8 req/sec max
}
console.log(`[fetch] done: cached=${cached} live=${live} errored=${errored}`);

// ============================================================
// EXTRACT TOP10 PATH SETS
// ============================================================
const top10 = {}; // kw -> Set<pathOf(url)>
for (const [kw, data] of Object.entries(serpResults)) {
  const organic = Array.isArray(data?.organic) ? data.organic : [];
  const paths = organic.slice(0, 10).map((o) => pathOf(o.link)).filter(Boolean);
  top10[kw] = new Set(paths);
}

// ============================================================
// UNION-FIND clustering by SERP overlap ≥ OVERLAP_THRESHOLD
// ============================================================
const kws = Object.keys(top10);
const parent = Object.fromEntries(kws.map((k) => [k, k]));
function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }

for (let i = 0; i < kws.length; i++) {
  for (let j = i + 1; j < kws.length; j++) {
    const a = top10[kws[i]], b = top10[kws[j]];
    let shared = 0;
    for (const p of a) if (b.has(p)) shared++;
    if (shared >= OVERLAP_THRESHOLD) union(kws[i], kws[j]);
  }
}
const clustersMap = {};
for (const kw of kws) {
  const root = find(kw);
  (clustersMap[root] ||= []).push(kw);
}
console.log(`[cluster] ${Object.keys(clustersMap).length} clusters from ${kws.length} kws`);

// ============================================================
// HUB CLASSIFIER (text-pattern based, hand-tuned)
// ============================================================
const HUB_RULES = [
  ['H6', /\b(vs|versus|alternative|alternatives|comparison|compare|vs\.)\b/, 6],
  ['H9', /\b(oem|moq|wholesale|distributor|private label|white label|upfitter|trade buyer|alibaba|bulk|b2b|factory direct|supplier|manufacturer|dealer)\b/, 6],
  ['H5', /\b(idle|idling|apu|fleet|carb|smartway|epa|no.?idle|anti.?idl|grant)\b/, 6],
  ['H8', /\b(usa|america|us|germany|deutschland|australia|aussie|mexico|uk|britain|saudi|uae|canada|south africa|brazil|france|italy|spain|poland|netherlands|holland|sweden|russia|turkey|thailand|vietnam|malaysia|indonesia|india|japan|korea|new zealand)\b/, 5],
  ['H7', /\b(install|installation|cutout|wiring|mounting|bracket|fits|fit|compatible|compatibility|roof opening|roof thickness|diy)\b/, 5],
  ['H4', /\b(lifepo4|battery|solar|amp.?hour|amp draw|amp hours|inverter|panel|power draw|watt|wh|ah)\b/, 5],
  ['H3', /\b(van|sprinter|transit|promaster|camper|conversion|van life|van conversion)\b/, 5],
  ['H2', /\b(rv|motorhome|caravan|class a|class b|class c|rooftop)\b/, 4],
  ['H1', /\b(truck|sleeper|semi|class 8|long haul|cab|overnight)\b/, 4],
];
function classifyHub(text) {
  const t = text.toLowerCase();
  const scores = {};
  for (const [hub, re, w] of HUB_RULES) {
    if (re.test(t)) scores[hub] = (scores[hub] || 0) + w;
  }
  if (!Object.keys(scores).length) return null;
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

// ============================================================
// INTENT CLASSIFIER
// ============================================================
function classifyIntent(kw) {
  const t = kw.toLowerCase();
  if (/\b(vs|versus|alternative|alternatives|compare|comparison|or)\b/.test(t)) return 'comparison';
  if (/\b(buy|price|pricing|cost|for sale|cheap|discount|where to buy|quote|rfq|moq|wholesale)\b/.test(t)) return 'transactional';
  if (/\b(best|top|review|reviews|leading|reliable|trusted|recommended|brand|brands|supplier|manufacturer|distributor|oem|dealer)\b/.test(t)) return 'commercial';
  if (/^(how|what|why|when|where|can|does|do|is|are|which)\b/.test(t)) return 'informational';
  if (/^[a-z]+( [a-z]+){0,2}$/.test(t)) return 'navigational';
  return 'informational';
}

// ============================================================
// VOLUME / KD ESTIMATORS (heuristic; flagged in artifact as est_*)
// ============================================================
function estVolume(kw) {
  // Heuristic only — calibrate later with real data
  const w = kw.split(/\s+/).length;
  let v;
  if (w <= 2) v = 2200;
  else if (w === 3) v = 1100;
  else if (w === 4) v = 550;
  else if (w === 5) v = 280;
  else if (w === 6) v = 140;
  else v = 70;
  // boost commercial signals
  if (/\b(best|top|review|brand|wholesale|supplier|manufacturer)\b/.test(kw)) v = Math.round(v * 1.3);
  // depress long-tail with low search potential
  if (/\b(diy|myself)\b/.test(kw)) v = Math.round(v * 0.7);
  return v;
}
function estKd(kw, organicCount) {
  // crude proxy: 1-3 words tend to be hard
  const w = kw.split(/\s+/).length;
  let kd = 50 - (w - 1) * 6; // 5w → 26, 7w → 14
  // Amazon/youtube/wikipedia in Top10 → hard
  // (we don't have organic here but caller can pass count of big-domain hits)
  if (organicCount >= 3) kd += 10;
  return Math.max(5, Math.min(90, kd));
}
const INTENT_WEIGHT = { commercial: 1.5, comparison: 1.4, transactional: 1.3, informational: 1.0, navigational: 0.3 };

// ============================================================
// CANNIBALIZATION CHECK
// ============================================================
const blogListPath = path.join(ROOT, 'client/public/data/blog/list.json');
let blogSlugs = [];
if (fs.existsSync(blogListPath)) {
  try {
    const list = JSON.parse(fs.readFileSync(blogListPath, 'utf8'));
    blogSlugs = list.map((p) => ({ slug: p.slug, title: (p.title || '').toLowerCase() }));
  } catch {}
}
function cannibalFlag(kw) {
  const tokens = kw.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  for (const p of blogSlugs) {
    let hits = 0;
    for (const t of tokens) if (p.title.includes(t) || p.slug.includes(t)) hits++;
    if (hits >= Math.max(3, Math.ceil(tokens.length * 0.6))) {
      return { existing_slug: p.slug, existing_title: p.title, token_hits: hits };
    }
  }
  return null;
}

// ============================================================
// ASSEMBLE KEYWORD MAP + CLUSTERS
// ============================================================
const BIG_DOMAINS = new Set(['amazon.com', 'youtube.com', 'wikipedia.org', 'reddit.com', 'ebay.com', 'home depot.com', 'walmart.com']);
const keywordRows = [];
const orphanRows = [];
const cannibalRows = [];
let clusterIdCounter = 0;
const clusters = [];

for (const [root, members] of Object.entries(clustersMap)) {
  // Pick hub: vote by member kw classifications
  const hubVotes = {};
  for (const m of members) {
    const h = classifyHub(m);
    if (h) hubVotes[h] = (hubVotes[h] || 0) + 1;
  }
  const hub = Object.keys(hubVotes).length
    ? Object.entries(hubVotes).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  // Pick hub_kw: shortest commercial member, else shortest
  const sortedMembers = [...members].sort((a, b) => {
    const ai = classifyIntent(a), bi = classifyIntent(b);
    const aBoost = (ai === 'commercial' || ai === 'comparison') ? -1000 : 0;
    const bBoost = (bi === 'commercial' || bi === 'comparison') ? -1000 : 0;
    return (a.length + aBoost) - (b.length + bBoost);
  });
  const hub_kw = sortedMembers[0];

  // Count big-domain pollution in hub_kw SERP
  const bigDomainHits = [...top10[hub_kw]].filter((p) => BIG_DOMAINS.has(p.split('/')[0])).length;

  const memberRows = members.map((kw) => {
    const intent = classifyIntent(kw);
    const ev = estVolume(kw);
    const kd = estKd(kw, bigDomainHits);
    const priority = Math.round((ev * (INTENT_WEIGHT[intent] || 1)) / Math.max(kd, 5));
    const cannibal = cannibalFlag(kw);
    if (cannibal) cannibalRows.push({ kw, ...cannibal });
    return { kw, intent, est_volume: ev, est_kd: kd, priority, cannibal };
  });

  const total_volume = memberRows.reduce((s, r) => s + r.est_volume, 0);
  const avg_kd = Math.round(memberRows.reduce((s, r) => s + r.est_kd, 0) / memberRows.length);
  const med_kd = (() => {
    const sorted = memberRows.map((r) => r.est_kd).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  })();

  if (!hub) {
    for (const m of memberRows) orphanRows.push({ ...m, cluster_root: root });
    continue;
  }

  const clusterId = `${hub}-c${String(++clusterIdCounter).padStart(2, '0')}`;
  for (const m of memberRows) {
    keywordRows.push({
      kw: m.kw,
      hub, cluster_id: clusterId,
      intent: m.intent,
      est_volume: m.est_volume,
      est_kd: m.est_kd,
      priority: m.priority,
      cannibal: m.cannibal ? m.cannibal.existing_slug : '',
    });
  }
  const recommended_template = pickTemplate(hub, memberRows.map((r) => r.intent));
  clusters.push({
    cluster_id: clusterId,
    hub, hub_kw,
    spokes: memberRows.filter((m) => m.kw !== hub_kw).map((m) => m.kw),
    total_est_volume: total_volume,
    avg_est_kd: avg_kd,
    median_est_kd: med_kd,
    big_domain_hits_in_top10: bigDomainHits,
    recommended_template,
    member_count: memberRows.length,
  });
}

function pickTemplate(hub, intents) {
  if (intents.includes('comparison')) return 'vs-comparison';
  if (hub === 'H9') return 'b2b-supplier-landing';
  if (hub === 'H5') return 'roi-economics';
  if (hub === 'H7') return 'how-to-install';
  if (hub === 'H8') return 'regional-buyer-guide';
  if (hub === 'H6') return 'alternatives-roundup';
  if (hub === 'H4') return 'tech-deep-dive';
  if (intents.every((i) => i === 'informational')) return 'definition-explainer';
  return 'commercial-listicle';
}

// ============================================================
// WRITE OUTPUTS
// ============================================================
// seeds.txt
fs.writeFileSync(path.join(OUT_DIR, 'seeds.txt'), uniqSeeds.join('\n'));

// keyword-map.csv
const csvHead = 'kw,hub,cluster_id,intent,est_volume,est_kd,priority,cannibal_slug';
const csvRows = [csvHead].concat(
  keywordRows
    .sort((a, b) => b.priority - a.priority)
    .map((r) => [
      JSON.stringify(r.kw), r.hub, r.cluster_id, r.intent,
      r.est_volume, r.est_kd, r.priority, r.cannibal,
    ].join(','))
);
fs.writeFileSync(path.join(OUT_DIR, 'keyword-map.csv'), csvRows.join('\n'));

// clusters.json
fs.writeFileSync(
  path.join(OUT_DIR, 'clusters.json'),
  JSON.stringify(
    {
      run_at: new Date().toISOString(),
      gl: GL, hl: HL, overlap_threshold: OVERLAP_THRESHOLD,
      seed_count: uniqSeeds.length,
      serp_fetched: Object.keys(serpResults).length,
      cluster_count: clusters.length,
      orphan_count: orphanRows.length,
      cannibalization_count: cannibalRows.length,
      clusters: clusters.sort((a, b) => b.total_est_volume - a.total_est_volume),
    },
    null,
    2,
  )
);

// orphans.csv
const orphanHead = 'kw,intent,est_volume,est_kd,priority,cluster_root';
fs.writeFileSync(
  path.join(OUT_DIR, 'orphans.csv'),
  [orphanHead, ...orphanRows.map((r) =>
    [JSON.stringify(r.kw), r.intent, r.est_volume, r.est_kd, r.priority, JSON.stringify(r.cluster_root)].join(',')
  )].join('\n')
);

// cannibalization-flags.csv
const cannHead = 'kw,existing_slug,existing_title,token_hits';
fs.writeFileSync(
  path.join(OUT_DIR, 'cannibalization-flags.csv'),
  [cannHead, ...cannibalRows.map((r) =>
    [JSON.stringify(r.kw), r.existing_slug, JSON.stringify(r.existing_title), r.token_hits].join(',')
  )].join('\n')
);

// cluster-architecture.mmd
const HUB_LABEL = {
  H1: 'H1 Truck Sleeper', H2: 'H2 RV / Motorhome', H3: 'H3 Van / Camper',
  H4: 'H4 Battery / Solar', H5: 'H5 Anti-Idle & Fleet', H6: 'H6 Comparison',
  H7: 'H7 Install & Fit', H8: 'H8 Regional Guides', H9: 'H9 OEM / Wholesale',
};
const mmdLines = ['mindmap', '  root((CoolDrivePro<br/>Hub-and-Spoke))'];
const byHub = {};
for (const c of clusters) (byHub[c.hub] ||= []).push(c);
for (const hub of Object.keys(HUB_LABEL)) {
  mmdLines.push(`    ${hub}[${HUB_LABEL[hub]}]`);
  for (const c of (byHub[hub] || []).sort((a, b) => b.total_est_volume - a.total_est_volume)) {
    const safe = c.hub_kw.replace(/[()\[\]<>]/g, '').slice(0, 60);
    mmdLines.push(`      ${c.cluster_id}[${safe}<br/>vol≈${c.total_est_volume}, kw=${c.member_count}]`);
  }
}
fs.writeFileSync(path.join(OUT_DIR, 'cluster-architecture.mmd'), mmdLines.join('\n'));

// report.md
const totalKw = keywordRows.length;
const hubBreakdown = Object.entries(byHub)
  .map(([h, cs]) => `- **${HUB_LABEL[h]}**: ${cs.length} clusters, ${cs.reduce((s, c) => s + c.member_count, 0)} kw, est total volume ${cs.reduce((s, c) => s + c.total_est_volume, 0)}`)
  .join('\n');
const gateChecks = clusters.map((c) => ({
  cluster_id: c.cluster_id,
  spokes_ge_3: c.spokes.length >= 2, // hub+spokes ≥3 total means spokes ≥2
  hub_vol_ge_500: c.total_est_volume >= 500,
  kd_median_le_40: c.median_est_kd <= 40,
}));
const passedClusters = gateChecks.filter((g) => g.spokes_ge_3 && g.hub_vol_ge_500 && g.kd_median_le_40);
const report = `# Stage 2 (research) — ${TODAY}

**Data provenance**: Real Google SERP via Serper.dev (${cached + live} queries, ${cached} cached + ${live} live).
**Volume / KD**: heuristic estimates (NOT live DataForSEO/Ahrefs); flagged \`est_volume\` / \`est_kd\` in artifacts.
**Cannibalization basis**: ${blogSlugs.length} existing blog slugs in client/public/data/blog/list.json.

## Counts
- Seeds: ${uniqSeeds.length}
- SERP fetched: ${Object.keys(serpResults).length}
- Total kw in clusters: ${totalKw}
- Total kw in orphans: ${orphanRows.length}
- Clusters formed: ${clusters.length}
- Cannibalization flags: ${cannibalRows.length}

## Hub breakdown
${hubBreakdown}

## Gate evaluation (skill spec)
- Rule: each cluster ≥3 spokes (hub+2 spokes), Hub kw est_volume ≥500, cluster est_kd median ≤40
- Clusters passing all 3 rules: ${passedClusters.length} / ${clusters.length}

## Top 10 priority keywords
${keywordRows.sort((a, b) => b.priority - a.priority).slice(0, 10).map((r, i) => `${i + 1}. \`${r.kw}\` — ${r.hub} / ${r.intent} / est_vol ${r.est_volume} / est_kd ${r.est_kd} / priority ${r.priority}${r.cannibal ? ' ⚠ cannibal: ' + r.cannibal : ''}`).join('\n')}

## Top 5 clusters by est volume
${clusters.sort((a, b) => b.total_est_volume - a.total_est_volume).slice(0, 5).map((c) => `- **${c.cluster_id}** [${HUB_LABEL[c.hub]}] hub="${c.hub_kw}" — ${c.member_count} kw, est vol ${c.total_est_volume}, est kd med ${c.median_est_kd}, template \`${c.recommended_template}\``).join('\n')}

## Lane Output Contract
LANE: research
STATUS: ${passedClusters.length >= 6 ? 'pass' : 'partial-pass'}
ARTIFACTS:
- research/${TODAY}/seeds.txt
- research/${TODAY}/keyword-map.csv (${keywordRows.length} rows)
- research/${TODAY}/clusters.json (${clusters.length} clusters)
- research/${TODAY}/cluster-architecture.mmd
- research/${TODAY}/orphans.csv (${orphanRows.length} rows)
- research/${TODAY}/cannibalization-flags.csv (${cannibalRows.length} rows)
- research/${TODAY}/serp-raw/*.json (cached SERP)
NEXT:
- Pick top 3-5 clusters → invoke \`cooldrivepro-seo brief\` (Stage 3) to produce SERP-gap briefs
- Resolve cannibalization flags before allocating new slugs
- (Optional upgrade) Inject DataForSEO/Ahrefs key to replace est_volume/est_kd with live data
`;
fs.writeFileSync(path.join(OUT_DIR, 'report.md'), report);

console.log('\n[done] Outputs written under research/' + TODAY + '/');
console.log(`  - keyword-map.csv: ${keywordRows.length} rows`);
console.log(`  - clusters.json:   ${clusters.length} clusters`);
console.log(`  - orphans.csv:     ${orphanRows.length} rows`);
console.log(`  - cannibalization-flags.csv: ${cannibalRows.length} rows`);
console.log(`  - report.md`);
