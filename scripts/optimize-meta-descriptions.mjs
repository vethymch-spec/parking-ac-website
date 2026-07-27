#!/usr/bin/env node
/**
 * optimize-meta-descriptions.mjs (v2 — surgical augmentation)
 * PRESERVES existing meta. Only adds missing year/number/hook for CTR.
 *
 * Rules:
 *  SKIP if length ≥130 AND has year (2025/2026) AND has digit/$.
 *  Otherwise: add year prefix, then category-appropriate quantitative hook, then pad to ≥130.
 *
 * Skips: A-class slugs, hand-tuned pillars, list/manifest files.
 * Usage: node scripts/optimize-meta-descriptions.mjs [--dry] [--limit=N]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { A_CLASS_SLUGS } from './lib/blog-a-class.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'client', 'public', 'data', 'blog');
const DRY = process.argv.includes('--dry');
const LIMIT = (() => {
  const a = process.argv.find(x => x.startsWith('--limit='));
  return a ? parseInt(a.split('=')[1], 10) : Infinity;
})();

const HANDS_OFF = new Set([
  'best-parking-ac-2026',
  '12v-vs-24v-parking-ac',
  'parking-ac-buying-guide-2025',
  'parking-ac-fuel-savings-calculator',
]);
const SKIP_FILES = new Set(['list.json', 'manifest.json', 'locale-availability.json', 'related-posts.json']);
const MAX = 168;

const HOOKS = {
  'Tools & Calculators': ' Free 2026 calculator with diesel prices.',
  'Reviews & Comparisons': ' 9 units compared, 2026 pricing.',
  'Buying Guides': ' 2026 specs, $1500–$3500 price ranges.',
  'Installation Guides': ' 2026 step-by-step, 4–8 hour install.',
  'Troubleshooting': ' 2026 fixes from certified technicians.',
  'Industry News': ' 2026 anti-idling laws, $25–$25,000 fines.',
  'Product Maintenance': ' 2026 service intervals, 6–12 month checks.',
  'How-To Guides': ' Step-by-step 2026 procedure.',
  'RV & Van Life': ' 2026 RV/van builds, real-world data.',
  'Truck & Fleet': ' 2026 fleet ROI, 8–14 hr idle replacement.',
};
const FALLBACK_HOOK = ' Updated 2026 with real-world data and pricing.';

const hasYear = (s) => /20(25|26)/.test(s);
const hasNumber = (s) => /[$€£¥]|\d/.test(s);
const isOptimized = (s) => s && s.length >= 130 && hasYear(s) && hasNumber(s);

function clip(s) {
  if (s.length <= MAX) return s;
  return s.slice(0, MAX - 1).replace(/\s+\S*$/, '') + '…';
}
function enhance(meta, category) {
  let out = (meta || '').trim().replace(/\s+/g, ' ');
  if (!hasYear(out)) {
    if (out.length + 8 <= MAX) out = `[2026] ${out}`;
    else out = clip(out.replace(/[\.\!\?]?\s*$/, '') + ' (2026 update).');
  }
  if (!hasNumber(out)) {
    out = clip(out.replace(/[\.\!\?]?\s*$/, '.') + (HOOKS[category] || FALLBACK_HOOK));
  }
  if (out.length < 130) {
    out = clip(out.replace(/[\.\!\?]?\s*$/, '.') + ' Compare specs, prices, lifetime ROI.');
  }
  return clip(out);
}

const files = fs.readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.json') && !SKIP_FILES.has(f))
  .filter((f) => !A_CLASS_SLUGS.has(f.replace(/\.json$/, '')))
  .filter((f) => !HANDS_OFF.has(f.replace(/\.json$/, '')));

const updated = [];
const skipped = [];
let n = 0;
for (const file of files) {
  if (n >= LIMIT) break;
  const fp = path.join(BLOG_DIR, file);
  let json;
  try { json = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { skipped.push(`${file}(parse)`); continue; }
  const before = json.metaDescription || '';
  if (isOptimized(before)) { skipped.push(file); continue; }
  const after = enhance(before, json.category);
  if (after === before) { skipped.push(file); continue; }
  if (!DRY) { json.metaDescription = after; fs.writeFileSync(fp, JSON.stringify(json, null, 2) + '\n', 'utf8'); }
  updated.push({ file, b: before.length, a: after.length, sample: after });
  n++;
}

console.log(`\n=== Meta CTR Enhancement ${DRY ? '(DRY)' : ''} ===`);
console.log(`Scanned: ${files.length}  Updated: ${updated.length}  Skipped: ${skipped.length}\n`);
updated.slice(0, 6).forEach((u) => console.log(`✓ ${u.file} [${u.b}→${u.a}c]\n  ${u.sample}\n`));
if (updated.length > 6) console.log(`...and ${updated.length - 6} more.`);
