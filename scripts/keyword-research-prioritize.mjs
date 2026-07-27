#!/usr/bin/env node
/**
 * keyword-research-prioritize.mjs
 * Enrich queued content topics with a keyword plan and heat score before writing.
 *
 * This is intentionally conservative: it uses the topic queue's known estimated
 * search volume, competition score, intent, outline hints, and internal links.
 * If live keyword APIs are added later, this script is the single place to plug
 * them in before the writing pipeline consumes topics.
 *
 * Usage:
 *   node scripts/keyword-research-prioritize.mjs --top=10
 *   node scripts/keyword-research-prioritize.mjs --top=10 --dry
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PIPELINE_DIR = path.join(ROOT, '.omc', 'content-pipeline');
const TOPICS_FILE = path.join(PIPELINE_DIR, 'topics.jsonl');
const LOG_DIR = path.join(PIPELINE_DIR, 'daily-log');

const TOP = (() => {
  const arg = process.argv.find((x) => x.startsWith('--top='));
  return arg ? parseInt(arg.split('=')[1], 10) : 10;
})();
const DRY = process.argv.includes('--dry');

const today = new Date().toISOString().slice(0, 10);

function loadJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

function normalizePhrase(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(value) {
  return normalizePhrase(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

function pushKeyword(set, value) {
  const phrase = normalizePhrase(value);
  if (!phrase) return;
  const words = phrase.split(' ').filter(Boolean);
  if (words.length < 2 || words.length > 8) return;
  if (phrase.length < 6 || phrase.length > 80) return;
  set.add(phrase);
}

function addDomainVariants(set, primaryKeyword) {
  const kw = normalizePhrase(primaryKeyword);
  if (kw.includes('parking ac')) {
    pushKeyword(set, kw.replace(/parking ac/g, 'parking air conditioner'));
    pushKeyword(set, kw.replace(/parking ac/g, 'dc parking ac'));
    pushKeyword(set, kw.replace(/parking ac/g, 'no idle air conditioner'));
    pushKeyword(set, `${kw} 2026`);
  }
  if (kw.includes('truck')) {
    pushKeyword(set, 'truck sleeper air conditioner');
    pushKeyword(set, 'semi truck parking ac');
    pushKeyword(set, 'no idle truck ac');
  }
  if (kw.includes('rv')) {
    pushKeyword(set, 'battery powered rv air conditioner');
    pushKeyword(set, 'off grid rv air conditioning');
    pushKeyword(set, 'rv parking ac');
  }
  if (kw.includes('battery') || kw.includes('lifepo4')) {
    pushKeyword(set, 'lifepo4 battery sizing');
    pushKeyword(set, 'battery powered air conditioner runtime');
    pushKeyword(set, 'amp hour calculator for ac');
  }
  if (kw.includes('install') || kw.includes('wiring')) {
    pushKeyword(set, 'parking ac installation guide');
    pushKeyword(set, 'parking ac wiring diagram');
    pushKeyword(set, '12v 24v fuse size');
  }
  if (kw.includes('cost') || kw.includes('price') || kw.includes('roi')) {
    pushKeyword(set, 'parking ac cost');
    pushKeyword(set, 'parking ac payback period');
    pushKeyword(set, 'idle fuel savings');
  }
}

function secondaryKeywords(topic) {
  const set = new Set();
  pushKeyword(set, topic.primaryKeyword);
  pushKeyword(set, topic.slug?.replace(/-/g, ' '));
  addDomainVariants(set, topic.primaryKeyword);

  for (const hint of topic.outlineHints || []) {
    pushKeyword(set, hint);
    const normalized = normalizePhrase(hint);
    const chunks = normalized.split(/\b(?:and|or|vs|with|for|by|from|to)\b/g);
    for (const chunk of chunks) pushKeyword(set, chunk);
  }

  for (const target of topic.internalLinkTargets || []) {
    pushKeyword(set, target.replace(/-/g, ' '));
  }

  const category = normalizePhrase(topic.category);
  if (category.includes('comparison') || topic.intent === 'commercial') {
    pushKeyword(set, `${topic.primaryKeyword} comparison`);
    pushKeyword(set, `best ${topic.primaryKeyword}`);
    pushKeyword(set, `${topic.primaryKeyword} reviews`);
  }
  if (category.includes('guide') || topic.intent === 'informational') {
    pushKeyword(set, `${topic.primaryKeyword} guide`);
    pushKeyword(set, `how to choose ${topic.primaryKeyword}`);
  }

  return [...set]
    .filter((phrase) => phrase !== normalizePhrase(topic.primaryKeyword))
    .slice(0, 18);
}

function heatScore(topic) {
  const volume = Number(topic.searchVolumeMonthly || 0);
  const competition = Math.min(Math.max(Number(topic.competitionScore ?? 0.5), 0), 1);
  const intentWeight = {
    transactional: 1.55,
    commercial: 1.35,
    informational: 1,
    navigational: 0.45,
  }[topic.intent] || 1;
  const dataWeight = (topic.dataSourceFiles || []).length ? 1.08 : 1;
  const outlineWeight = Math.min(1.18, 1 + ((topic.outlineHints || []).length * 0.025));
  return Math.round(volume * intentWeight * dataWeight * outlineWeight * (1 - competition * 0.25));
}

function priorityTier(score) {
  if (score >= 1200) return 'hot';
  if (score >= 650) return 'warm';
  if (score >= 250) return 'niche';
  return 'low';
}

const topics = loadJsonl(TOPICS_FILE);
const queued = topics.filter((topic) => topic.status === 'queued');

for (const topic of queued) {
  const score = heatScore(topic);
  const keywords = secondaryKeywords(topic);
  topic.secondaryKeywords = keywords;
  topic.keywordResearch = {
    source: 'estimated-volume-queue',
    researchedAt: today,
    heatScore: score,
    priorityTier: priorityTier(score),
    volumeMonthly: Number(topic.searchVolumeMonthly || 0),
    competitionScore: Number(topic.competitionScore ?? 0.5),
    intent: topic.intent || 'unknown',
    secondaryKeywordCount: keywords.length,
  };
}

const ranked = [...queued].sort((a, b) => {
  const scoreDiff = (b.keywordResearch?.heatScore || 0) - (a.keywordResearch?.heatScore || 0);
  if (scoreDiff) return scoreDiff;
  return Number(b.searchVolumeMonthly || 0) - Number(a.searchVolumeMonthly || 0);
});

const report = {
  date: today,
  dryRun: DRY,
  queuedTopics: queued.length,
  topRequested: TOP,
  topTopics: ranked.slice(0, TOP).map((topic, index) => ({
    rank: index + 1,
    slug: topic.slug,
    title: topic.title,
    primaryKeyword: topic.primaryKeyword,
    volumeMonthly: topic.searchVolumeMonthly || 0,
    heatScore: topic.keywordResearch?.heatScore || 0,
    priorityTier: topic.keywordResearch?.priorityTier || 'low',
    secondaryKeywordCount: topic.secondaryKeywords?.length || 0,
    secondaryKeywords: topic.secondaryKeywords || [],
  })),
};

if (!DRY) {
  fs.writeFileSync(TOPICS_FILE, topics.map((topic) => JSON.stringify(topic)).join('\n') + '\n');
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(path.join(LOG_DIR, `keyword-research-${today}.json`), JSON.stringify(report, null, 2) + '\n');
}

console.log(`\n=== Keyword Research ${DRY ? '(DRY)' : ''} ===`);
console.log(`Queued topics: ${queued.length}`);
console.log(`Enriched topics: ${queued.length}`);
console.log(`Top ${Math.min(TOP, ranked.length)} by heat:`);
for (const item of report.topTopics) {
  console.log(`  ${item.rank}. [${item.priorityTier} ${item.heatScore}] ${item.slug} (${item.volumeMonthly}/mo, ${item.secondaryKeywordCount} secondary keywords)`);
}
console.log('\nTop topic keyword samples:');
for (const item of report.topTopics.slice(0, 3)) {
  console.log(`  - ${titleCase(item.primaryKeyword)}: ${item.secondaryKeywords.slice(0, 8).join(', ')}`);
}
