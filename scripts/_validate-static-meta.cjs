const d = require('./static-meta.json');
const checks = {
  '/products/top-mounted-ac': ['CoolDrivePro', 'VS02 PRO'],
  '/products/mini-split-ac': ['CoolDrivePro', 'VX3000SP'],
  '/products/heating-cooling-ac': ['CoolDrivePro', 'V-TH1'],
  '/products/nano-max': ['CoolDrivePro', 'Nano Max'],
};
let miss = 0, leak = 0;
for (const [p, tokens] of Object.entries(checks)) {
  for (const [l, v] of Object.entries(d[p])) {
    if (l === 'en') continue;
    const t = (v.title || '') + ' ' + (v.desc || '');
    for (const tok of tokens) {
      if (!t.includes(tok)) { miss++; console.log('MISS', tok, p, l); }
    }
    if (/QQAA\d{2}|Xqzk\d{2}Brnd/i.test(t)) { leak++; console.log('LEAK', p, l, t.slice(0, 120)); }
  }
}
console.log('miss:', miss, 'leak:', leak);
