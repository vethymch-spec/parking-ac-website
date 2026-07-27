#!/usr/bin/env node
/**
 * refresh-old-articles.mjs
 * Higher-ROI alternative to writing new articles: refresh old ones.
 * Google's freshness signal often boosts rankings more than new thin content.
 *
 * Picks N articles where dateModified is oldest (or missing).
 * For each, uses LLM to do a small refresh:
 *   - Update year references (2024→2026)
 *   - Add 1–2 new data points
 *   - Update prices/spec mentions if dataset has newer values
 *   - Improve title/meta if currently weak
 * Sets dateModified=today.
 *
 * Skips: pillars (hand-tuned), A-class slugs.
 * Flags: --max=N (default 5), --dry, --slug=foo (single)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { A_CLASS_SLUGS } from './lib/blog-a-class.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'client', 'public', 'data', 'blog');
const PIPELINE_DIR = path.join(ROOT, '.omc', 'content-pipeline');
const PAUSED = path.join(PIPELINE_DIR, 'PAUSED');

const MAX = (() => { const a = process.argv.find(x => x.startsWith('--max=')); return a ? parseInt(a.split('=')[1], 10) : 5; })();
const DRY = process.argv.includes('--dry');
const ONE = (() => { const a = process.argv.find(x => x.startsWith('--slug=')); return a ? a.split('=')[1] : null; })();

const HANDS_OFF = new Set([
  'best-parking-ac-2026',
  '12v-vs-24v-parking-ac',
  'parking-ac-buying-guide-2025',
  'parking-ac-fuel-savings-calculator',
]);
const SKIP = new Set(['list.json', 'manifest.json', 'related-posts.json', 'locale-availability.json']);

if (fs.existsSync(PAUSED)) { console.log('⏸  PAUSED'); process.exit(0); }

// Pick candidates
const today = new Date().toISOString().slice(0, 10);
const candidates = fs.readdirSync(BLOG_DIR)
  .filter(f => f.endsWith('.json') && !SKIP.has(f))
  .map(f => f.replace(/\.json$/, ''))
  .filter(s => !A_CLASS_SLUGS.has(s) && !HANDS_OFF.has(s))
  .map(slug => {
    const json = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, `${slug}.json`), 'utf8'));
    return { slug, dateModified: json.dateModified || json.date || '2000-01-01', json };
  })
  .filter(c => ONE ? c.slug === ONE : true)
  .filter(c => c.dateModified < today)
  .sort((a, b) => a.dateModified.localeCompare(b.dateModified))
  .slice(0, MAX);

async function callRefresh(article) {
  const prompt = `Refresh this article for 2026. Make MINIMAL edits to preserve rankings:
- Update any year references to 2026
- Update dateModified context
- Add 1–2 new specific data points (numbers, $, %) if currently weak
- Tighten metaDescription if <140 chars or missing 2026/numbers
- Do NOT rewrite extensively. Do NOT change slug or title structure.
- Return updated JSON with same shape.

Original article:
${JSON.stringify(article).slice(0, 12000)}

Return ONLY valid JSON (same shape, no markdown wrapper).`;

  if (process.env.ANTHROPIC_API_KEY) {
    const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
    const isOpenRouter = baseUrl.includes('openrouter.ai') || process.env.ANTHROPIC_API_KEY.startsWith('sk-or-');
    if (isOpenRouter) {
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
          'content-type': 'application/json',
          'http-referer': 'https://cooldrivepro.com',
          'x-title': 'CoolDrivePro Refresh',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'anthropic/claude-sonnet-4.5',
          max_tokens: 8000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!r.ok) throw new Error(`OpenRouter ${r.status}`);
      const j = await r.json();
      const text = j.choices?.[0]?.message?.content || '';
      return JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').replace(/^```\s*|\s*```$/g, ''));
    }
    const r = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929', max_tokens: 8000, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!r.ok) throw new Error(`Anthropic ${r.status}`);
    const j = await r.json();
    return JSON.parse((j.content?.[0]?.text || '').replace(/^```json\s*|\s*```$/g, ''));
  }
  if (process.env.OPENAI_API_KEY) {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } }),
    });
    if (!r.ok) throw new Error(`OpenAI ${r.status}`);
    const j = await r.json();
    return JSON.parse(j.choices[0].message.content);
  }
  // No LLM — do safe local refresh: just bump year + dateModified
  const out = JSON.parse(JSON.stringify(article));
  out.dateModified = today;
  out.metaDescription = (out.metaDescription || '').replace(/202[345]/g, '2026');
  out.content = out.content.map(s => typeof s === 'string'
    ? s.replace(/202[345]/g, '2026')
    : { ...s, body: (s.body || '').replace(/202[345]/g, '2026') });
  return out;
}

const refreshed = [];
const errored = [];
for (const c of candidates) {
  try {
    const out = await callRefresh(c.json);
    out.dateModified = today;
    if (!DRY) fs.writeFileSync(path.join(BLOG_DIR, `${c.slug}.json`), JSON.stringify(out, null, 2) + '\n');
    refreshed.push(c.slug);
    console.log(`✓ refreshed ${c.slug} (was ${c.dateModified})`);
  } catch (e) {
    errored.push({ slug: c.slug, err: e.message });
    console.error(`✗ ${c.slug} — ${e.message}`);
  }
}

console.log(`\n=== Refresh Run ${DRY ? '(DRY)' : ''} ===`);
console.log(`Refreshed: ${refreshed.length}  Errored: ${errored.length}`);
