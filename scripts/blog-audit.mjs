/**
 * Blog audit — classify 146 articles into A (delete/merge/noindex),
 * B (keep + deep rewrite), and C-gap (missing commercial intent).
 *
 * Heuristic classifier (human review required before execution).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'client/public/data/blog';
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
const arr = Array.isArray(manifest) ? manifest : manifest.posts;

// ----- A. Geo-template spam detection -----
// Pattern: "parking-ac-<country>-<city>-<descriptor>"
// These articles target near-zero search volume long-tails and are heavily
// templated. Should be merged into country-level pillar or noindex'd.
const COUNTRIES = [
  'egypt','ghana','kenya','nigeria','south-africa','morocco','algeria','tunisia',
  'ethiopia','tanzania','uganda','rwanda','senegal','cameroon','ivory-coast',
  'zambia','zimbabwe','mozambique','angola','libya','sudan','mali','botswana',
  'uae','saudi-arabia','qatar','kuwait','bahrain','oman','iran','iraq','jordan',
  'lebanon','syria','yemen','israel','turkey','pakistan','bangladesh','india',
  'myanmar','vietnam','thailand','indonesia','malaysia','philippines','cambodia',
  'laos','nepal','sri-lanka','china','japan','korea','mongolia','kazakhstan',
  'uzbekistan','russia','ukraine','poland','germany','france','spain','italy',
  'portugal','netherlands','belgium','uk','ireland','sweden','norway','finland',
  'denmark','iceland','greece','romania','bulgaria','hungary','czech','slovakia',
  'austria','switzerland','croatia','serbia','albania','mexico','brazil',
  'argentina','chile','colombia','peru','venezuela','ecuador','bolivia','uruguay',
  'paraguay','cuba','panama','guatemala','honduras','usa','canada','australia',
  'new-zealand'
];

function classify(post) {
  const s = post.slug.toLowerCase();
  const t = (post.title || '').toLowerCase();

  // Rule A1: "parking-ac-<country>-<city>" = geo template spam
  const geoPattern = /^parking-ac-([a-z-]+)-([a-z-]+)-([a-z-]+)$/;
  const geoMatch = s.match(geoPattern);
  if (geoMatch) {
    const [, word1, word2] = geoMatch;
    // Check if word1 is a country
    if (COUNTRIES.includes(word1) || COUNTRIES.some(c => s.startsWith(`parking-ac-${c}-`))) {
      return { class: 'A', reason: 'geo-template-spam', country: COUNTRIES.find(c => s.startsWith(`parking-ac-${c}-`)) || word1 };
    }
  }

  // Rule A2: very long slug with >5 tokens = likely template noise
  const tokenCount = s.split('-').length;
  if (tokenCount >= 7) {
    return { class: 'A', reason: 'over-tokenized-slug', tokens: tokenCount };
  }

  // Rule B candidates: commercial/how-to/comparison keywords (high intent)
  const hiIntent = [
    /\b(how-to|how-do|how-does|how-long|how-much)\b/,
    /\b(best|top|review|vs|versus|compar|alternative)\b/,
    /\b(guide|buying|buy|cost|price|install)\b/,
    /\b(12v|24v|dc|solar|lithium|battery)\b/,
    /\b(troubleshoot|maintain|clean|fix|repair)\b/,
  ];
  if (hiIntent.some(r => r.test(s))) {
    return { class: 'B', reason: 'commercial-or-howto-intent' };
  }

  // Everything else: B-lite (keep, review case by case)
  return { class: 'B-lite', reason: 'generic-topic' };
}

const classified = arr.map(p => ({ ...p, audit: classify(p) }));

const byClass = {};
for (const p of classified) {
  (byClass[p.audit.class] = byClass[p.audit.class] || []).push(p);
}

console.log('=== CLASSIFICATION SUMMARY ===');
for (const [c, ps] of Object.entries(byClass)) {
  console.log(`${c}: ${ps.length}`);
}

console.log('\n=== A: DELETE / MERGE / NOINDEX (geo-template spam) ===');
// Group by country for merge planning
const byCountry = {};
for (const p of byClass.A || []) {
  const key = p.audit.country || 'unknown';
  (byCountry[key] = byCountry[key] || []).push(p.slug);
}
for (const [country, slugs] of Object.entries(byCountry).sort((a,b)=>b[1].length - a[1].length)) {
  console.log(`\n  [${country}] ${slugs.length} articles → merge into 1 pillar "Parking AC in ${country}: Climate & Fleet Guide"`);
  for (const s of slugs) console.log(`    - ${s}`);
}

console.log('\n=== B: KEEP + DEEP REWRITE (high commercial intent) ===');
for (const p of byClass.B || []) {
  console.log(`  ${p.slug}  [${p.category}]`);
}

console.log(`\n=== B-lite: REVIEW (generic, ${(byClass['B-lite']||[]).length} articles) ===`);
for (const p of byClass['B-lite'] || []) {
  console.log(`  ${p.slug}  [${p.category}]`);
}

// Write JSON report for next-stage scripts
fs.writeFileSync('.omc/blog-audit.json', JSON.stringify(classified, null, 2));
console.log('\nWrote .omc/blog-audit.json');
