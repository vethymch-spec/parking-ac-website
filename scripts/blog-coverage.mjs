/**
 * Blog locale coverage — count per-slug, per-lang translation files.
 */
import fs from 'node:fs';
import path from 'node:path';
const LANGS = [
  'zh-CN','zh-TW','ja','ko','de','fr','es','it','pt','ru','ar','hi','th','vi','id',
  'tr','pl','nl','sv','no','da','fi','el','cs','hu','ro','uk','he','ms'
];
const ROOT = 'client/public/data/blog';
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
const slugs = (Array.isArray(manifest) ? manifest : manifest.posts).map(p => p.slug);

const missing = [];
let total = 0, present = 0;
for (const slug of slugs) {
  for (const lang of LANGS) {
    total++;
    const p = path.join(ROOT, 'locales', lang, `${slug}.json`);
    if (fs.existsSync(p)) present++;
    else missing.push(`${lang}/${slug}`);
  }
}
console.log(`Coverage: ${present}/${total}  (${(present/total*100).toFixed(1)}%)`);
console.log(`Slugs: ${slugs.length}  Langs: ${LANGS.length}  Expected: ${slugs.length*LANGS.length}`);
if (missing.length) {
  console.log(`\nMissing ${missing.length} combos:`);
  // Group by lang
  const byLang = {};
  for (const m of missing) { const [l] = m.split('/'); byLang[l] = (byLang[l]||0)+1; }
  for (const [l, n] of Object.entries(byLang).sort((a,b)=>b[1]-a[1])) {
    console.log(`  ${l}: ${n} missing`);
  }
}
