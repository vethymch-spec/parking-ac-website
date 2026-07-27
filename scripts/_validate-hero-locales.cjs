const fs = require('fs');
const path = require('path');
const dir = 'client/src/i18n/locales';
let miss = 0, leak = 0;
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json') || f === 'en.json') continue;
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const [k, brand] of [['miniSplit', 'VX3000SP'], ['heatingCoolingAC', 'V-TH1']]) {
    const t = (d.products?.[k]?.title || '') + ' ' + (d.products?.[k]?.subtitle || '');
    if (!t.includes('CoolDrivePro')) { miss++; console.log('MISS-brand', f, k); }
    if (!t.includes(brand)) { miss++; console.log('MISS-' + brand, f, k); }
    if (/QQAA\d{2}/i.test(t)) { leak++; console.log('LEAK', f, k, t); }
  }
}
console.log('miss:', miss, 'leak:', leak);
