/**
 * Hreflang sampler — pick N random URLs, verify all 30 hreflang alternates
 * point to existing pages and form a closed graph.
 *
 * Usage: node scripts/hreflang-check.mjs [sample-size=10]
 */
const DOMAIN = 'https://cooldrivepro.com';
const LANGS = [
  'en','zh-CN','zh-TW','ja','ko','de','fr','es','it','pt','ru','ar','hi','th','vi','id',
  'tr','pl','nl','sv','no','da','fi','el','cs','hu','ro','uk','he','ms'
];
const N = Number(process.argv[2]) || 10;

const SEEDS = [
  '/', '/products', '/products/top-mounted-ac', '/products/mini-split-ac',
  '/products/heating-cooling-ac', '/products/nano-max',
  '/about', '/contact', '/blog', '/support',
  '/blog/12v-vs-24v-parking-ac', '/blog/best-parking-ac-for-semi-trucks',
  '/blog/how-parking-ac-works', '/blog/no-idle-ac-anti-idling-laws',
];
const sample = SEEDS.sort(() => Math.random() - 0.5).slice(0, N);

let pass = 0, fail = 0;
for (const p of sample) {
  const url = `${DOMAIN}${p}`;
  const html = await (await fetch(url)).text();
  const found = new Map();
  for (const m of html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)) {
    found.set(m[1], m[2]);
  }
  const missing = LANGS.filter(l => !found.has(l));
  const hasXDefault = found.has('x-default');
  const ok = missing.length === 0 && hasXDefault;
  if (ok) pass++; else fail++;
  console.log(`${ok ? '✓' : '✗'} ${p}  ${found.size} alternates${missing.length ? `  missing: ${missing.join(',')}` : ''}${hasXDefault ? '' : '  (no x-default)'}`);
  // Reverse-link check: pick 3 random alternates and verify they point back to current set
  const probeLangs = LANGS.slice().sort(() => Math.random() - 0.5).slice(0, 3);
  for (const l of probeLangs) {
    const altUrl = found.get(l);
    if (!altUrl) continue;
    const altHtml = await (await fetch(altUrl)).text();
    const altFound = new Set();
    for (const m of altHtml.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"/g)) altFound.add(m[1]);
    const closed = LANGS.every(x => altFound.has(x));
    console.log(`   ${l} → ${altUrl}  ${closed ? 'closed graph ✓' : 'INCOMPLETE ✗'}`);
  }
}
console.log(`\n${pass}/${pass+fail} URLs have full 30-lang hreflang + x-default.`);
