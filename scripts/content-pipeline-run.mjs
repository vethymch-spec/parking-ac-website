#!/usr/bin/env node
/**
 * content-pipeline-run.mjs
 * Generate N articles per day from topic queue.
 *
 * QUALITY GATES (any failure → topic rejected, NOT published):
 *   1. Slug uniqueness
 *   2. Min outline depth (≥3 hints OR ≥1 dataSourceFile)
 *   3. Min searchVolumeMonthly ≥ 50
 *   4. Generated word count ≥ 2500
 *   5. Generated content has ≥3 unique numeric data points
 *   6. Primary keyword + a healthy set of secondary keywords are covered
 *
 * LLM usage:
 *   - If ANTHROPIC_API_KEY set: uses claude-sonnet-4-5 via REST
 *   - If OPENAI_API_KEY set: uses gpt-4o-mini via REST
 *   - Else: data-driven template (only safe for topics with dataSourceFiles)
 *
 * After generation:
 *   - Writes client/public/data/blog/{slug}.json
 *   - Marks topic as published in topics.jsonl
 *   - Logs to .omc/content-pipeline/daily-log/YYYY-MM-DD.json
 *   - Does NOT translate/build/deploy — orchestrator does that
 *
 * Flags: --max=N (default 10), --dry, --topic=slug (single topic)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PIPELINE_DIR = path.join(ROOT, '.omc', 'content-pipeline');
const TOPICS_FILE = path.join(PIPELINE_DIR, 'topics.jsonl');
const REJECTS_FILE = path.join(PIPELINE_DIR, 'quality-rejects.jsonl');
const PAUSED_FLAG = path.join(PIPELINE_DIR, 'PAUSED');
const BLOG_DIR = path.join(ROOT, 'client', 'public', 'data', 'blog');

const MAX = (() => { const a = process.argv.find(x => x.startsWith('--max=')); return a ? parseInt(a.split('=')[1], 10) : 10; })();
const DRY = process.argv.includes('--dry');
const ONE_TOPIC = (() => { const a = process.argv.find(x => x.startsWith('--topic=')); return a ? a.split('=')[1] : null; })();
const MIN_WORDS = 2500;
const MIN_DATA_POINTS = 3;
const MIN_SEARCH_VOLUME = 50;
const MIN_SECONDARY_KEYWORDS = 8;

if (fs.existsSync(PAUSED_FLAG)) {
  console.log('⏸  Pipeline PAUSED (remove .omc/content-pipeline/PAUSED to resume).');
  process.exit(0);
}

// === Load topics ===
const lines = fs.readFileSync(TOPICS_FILE, 'utf8').split('\n').filter(l => l.trim());
const topics = lines.map(l => JSON.parse(l));
function topicHeatScore(topic) {
  if (topic.keywordResearch?.heatScore) return Number(topic.keywordResearch.heatScore);
  const volume = Number(topic.searchVolumeMonthly || 0);
  const competition = Math.min(Math.max(Number(topic.competitionScore ?? 0.5), 0), 1);
  const intentWeight = { transactional: 1.55, commercial: 1.35, informational: 1, navigational: 0.45 }[topic.intent] || 1;
  return Math.round(volume * intentWeight * (1 - competition * 0.25));
}

let queued = topics
  .filter(t => t.status === 'queued')
  .sort((a, b) => topicHeatScore(b) - topicHeatScore(a) || Number(b.searchVolumeMonthly || 0) - Number(a.searchVolumeMonthly || 0));
if (ONE_TOPIC) queued = queued.filter(t => t.slug === ONE_TOPIC);

if (queued.length === 0) {
  console.log('No queued topics. Add topics to .omc/content-pipeline/topics.jsonl');
  process.exit(0);
}

// === Existing slugs ===
const existingSlugs = new Set(
  fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''))
);

// === Quality gates (pre-generation) ===
function preGate(topic) {
  if (existingSlugs.has(topic.slug)) return 'slug exists';
  if ((topic.searchVolumeMonthly || 0) < MIN_SEARCH_VOLUME) return `search vol < ${MIN_SEARCH_VOLUME}`;
  const hints = (topic.outlineHints || []).length;
  const sources = (topic.dataSourceFiles || []).length;
  if (hints < 3 && sources < 1) return 'thin: needs ≥3 outlineHints OR ≥1 dataSourceFile';
  return null;
}

// === Quality gates (post-generation) ===
function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function topicKeywords(topic) {
  const keywords = [topic.primaryKeyword, ...(topic.secondaryKeywords || [])]
    .map(normalizeText)
    .filter(Boolean);
  return [...new Set(keywords)].slice(0, 24);
}

function keywordCoverage(article, topic) {
  const text = normalizeText([
    article.title,
    article.metaDescription,
    ...(article.content || []).flatMap(s => [s.heading || '', s.body || '']),
  ].join(' '));
  const keywords = topicKeywords(topic).filter(k => k.split(' ').length >= 2);
  const primary = normalizeText(topic.primaryKeyword);
  const covered = keywords.filter(k => text.includes(k));
  return { primaryCovered: primary ? text.includes(primary) : true, covered, total: keywords.length };
}

function postGate(article, topic) {
  const text = (article.content || []).map(s => s.body || '').join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS) return `word count ${words} < ${MIN_WORDS}`;
  const dataMatches = text.match(/\$[\d,]+|\d+(\.\d+)?\s*(%|hp|kW|W|Ah|V|BTU|mph|km|mi|hours?|hrs?|gallons?|liters?|trucks?|dB|°[CF])/gi) || [];
  const unique = new Set(dataMatches);
  if (unique.size < MIN_DATA_POINTS) return `data points ${unique.size} < ${MIN_DATA_POINTS}`;
  const coverage = keywordCoverage(article, topic);
  if (!coverage.primaryCovered) return `primary keyword missing: ${topic.primaryKeyword}`;
  if ((topic.secondaryKeywords || []).length >= MIN_SECONDARY_KEYWORDS && coverage.covered.length < 5) {
    return `secondary keyword coverage ${coverage.covered.length}/${coverage.total} < 5`;
  }
  return null;
}

// === LLM call ===
async function callLLM(topic) {
  const relatedKeywords = topicKeywords(topic).filter(k => k !== normalizeText(topic.primaryKeyword));
  const heat = topic.keywordResearch || {};
  const sources = await Promise.all(
    (topic.dataSourceFiles || []).map(f => {
      try { return fs.readFileSync(path.join(ROOT, f), 'utf8').slice(0, 8000); }
      catch { return ''; }
    })
  );
  const sourceBlock = sources.length ? `\n\n## REAL DATA SOURCES (cite these, do NOT invent numbers):\n${sources.join('\n---\n')}\n` : '';

  const prompt = `You are an expert technical writer for CoolDrivePro, a parking AC manufacturer. Write a comprehensive article in JSON format.

Topic: ${topic.title}
Primary keyword: ${topic.primaryKeyword}
Keyword heat: ${heat.priorityTier || 'unranked'} (estimated monthly volume: ${topic.searchVolumeMonthly || 0}, heat score: ${heat.heatScore || topicHeatScore(topic)})
Secondary / semantic keywords to weave in naturally: ${relatedKeywords.join(', ')}
Category: ${topic.category}
Outline hints: ${(topic.outlineHints || []).join('; ')}
Internal links to weave in: ${(topic.internalLinkTargets || []).map(s => `/blog/${s}`).join(', ')}
${sourceBlock}

REQUIREMENTS:
- 2500–3500 words, 9–15 H2 sections
- E-E-A-T signals: cite real data sources, mention specific brands/models when comparing
- Include ≥1 comparison table (markdown table syntax in body)
- Include FAQ section at end with 5+ questions in this exact format: **Question?**\\n\\nAnswer paragraph.
- Use [link text](/internal/url) for internal links (weave 2–4 naturally)
- Primary keyword must appear in the title or first 100 words, one H2 where natural, and metaDescription.
- Use 10–16 secondary/semantic keywords naturally across headings and body copy. Do not stuff keywords; do not repeat any exact phrase more than 4 times.
- Include 4–6 related search questions or problem phrases in the FAQ and troubleshooting/buyer sections.
- Numbers: use real ones from data sources or omit. Never invent prices/specs.
- Tone: technical, helpful, conversational. NO marketing fluff.
- Year references: use 2026.

Return ONLY valid JSON matching this exact schema (no markdown wrapper, no commentary):
{
  "title": "...",
  "category": "${topic.category}",
  "metaDescription": "150-165 chars, include 2026 + a number/$",
  "content": [
    {"heading": null, "body": "intro paragraph"},
    {"heading": "Section 1 H2", "body": "..."},
    ...,
    {"heading": "Frequently Asked Questions", "body": "**Q1?**\\n\\nA1\\n\\n**Q2?**\\n\\nA2..."}
  ]
}`;

  if (process.env.ANTHROPIC_API_KEY) {
    const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
    const isOpenRouter = baseUrl.includes('openrouter.ai') || process.env.ANTHROPIC_API_KEY.startsWith('sk-or-');
    if (isOpenRouter) {
      // OpenRouter uses OpenAI-compatible chat/completions API
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
          'content-type': 'application/json',
          'http-referer': 'https://cooldrivepro.com',
          'x-title': 'CoolDrivePro Content Pipeline',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'anthropic/claude-sonnet-4.5',
          max_tokens: 8000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${(await r.text()).slice(0,200)}`);
      const j = await r.json();
      const text = j.choices?.[0]?.message?.content || '';
      return JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').replace(/^```\s*|\s*```$/g, ''));
    }
    const r = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`);
    const j = await r.json();
    const text = j.content?.[0]?.text || '';
    return JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''));
  }
  if (process.env.OPENAI_API_KEY) {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });
    if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`);
    const j = await r.json();
    return JSON.parse(j.choices[0].message.content);
  }

  // No LLM — refuse rather than ship template slop
  throw new Error('No LLM API key. Set ANTHROPIC_API_KEY or OPENAI_API_KEY. Refusing to generate template-only content (would fail Helpful Content review).');
}

// === Build full article JSON ===
function buildArticleJson(topic, llmOutput) {
  const today = new Date().toISOString().slice(0, 10);
  const keywords = topicKeywords(topic);
  return {
    title: llmOutput.title || topic.title,
    date: today,
    dateModified: today,
    category: topic.category,
    image: '/og/blog-default.jpg',
    imageAlt: llmOutput.title || topic.title,
    imageWidth: 1200,
    imageHeight: 630,
    keywords,
    keywordResearch: topic.keywordResearch || null,
    metaDescription: llmOutput.metaDescription || '',
    content: llmOutput.content || [],
  };
}

// === Main loop ===
const today = new Date().toISOString().slice(0, 10);
const dailyLog = { date: today, dryRun: DRY, published: [], rejected: [], errors: [] };
let producedCount = 0;

for (const topic of queued) {
  if (producedCount >= MAX) break;

  const preErr = preGate(topic);
  if (preErr) {
    console.log(`⊘ ${topic.slug} — ${preErr}`);
    dailyLog.rejected.push({ slug: topic.slug, reason: preErr, stage: 'pre' });
    if (!DRY) fs.appendFileSync(REJECTS_FILE, JSON.stringify({ ...topic, rejectReason: preErr, rejectedAt: today }) + '\n');
    continue;
  }

  console.log(`→ Generating: ${topic.slug}`);
  let article;
  try {
    const llm = await callLLM(topic);
    article = buildArticleJson(topic, llm);
  } catch (e) {
    console.error(`✗ ${topic.slug} — ${e.message}`);
    dailyLog.errors.push({ slug: topic.slug, error: e.message });
    continue;
  }

  const postErr = postGate(article, topic);
  if (postErr) {
    console.log(`⊘ ${topic.slug} — ${postErr}`);
    dailyLog.rejected.push({ slug: topic.slug, reason: postErr, stage: 'post' });
    if (!DRY) fs.appendFileSync(REJECTS_FILE, JSON.stringify({ ...topic, rejectReason: postErr, rejectedAt: today }) + '\n');
    continue;
  }

  if (!DRY) {
    const outPath = path.join(BLOG_DIR, `${topic.slug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(article, null, 2) + '\n', 'utf8');
    topic.status = 'published';
    topic.publishedAt = today;
  }
  producedCount++;
  const words = article.content.map(s => (s.body || '').split(/\s+/).length).reduce((a, b) => a + b, 0);
  const coverage = keywordCoverage(article, topic);
  dailyLog.published.push({
    slug: topic.slug,
    title: article.title,
    words,
    heatScore: topicHeatScore(topic),
    keywordCount: article.keywords?.length || 0,
    secondaryKeywordsCovered: coverage.covered.length,
  });
  console.log(`✓ ${topic.slug} (${words} words, heat ${topicHeatScore(topic)}, ${coverage.covered.length}/${coverage.total} keywords covered)`);
}

// === Persist ===
if (!DRY) {
  fs.writeFileSync(TOPICS_FILE, topics.map(t => JSON.stringify(t)).join('\n') + '\n');
  const logDir = path.join(PIPELINE_DIR, 'daily-log');
  fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(path.join(logDir, `${today}.json`), JSON.stringify(dailyLog, null, 2));
}

console.log(`\n=== Daily Run ${DRY ? '(DRY)' : ''} ===`);
console.log(`Published: ${dailyLog.published.length}`);
console.log(`Rejected:  ${dailyLog.rejected.length}`);
console.log(`Errors:    ${dailyLog.errors.length}`);
if (dailyLog.published.length > 0) {
  console.log(`\nNext: build + deploy:`);
  console.log(`  npm run build && npx wrangler pages deploy dist/client --project-name=cooldrivepro --commit-dirty=true --branch=main`);
  console.log(`  npm run indexnow`);
}
