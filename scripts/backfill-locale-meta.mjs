#!/usr/bin/env node
/**
 * Backfill missing metaDescription and imageAlt in locale blog JSONs.
 * Falls back to that locale's `title`. Truncates desc to 160 chars.
 */
import fs from 'fs';
import path from 'path';

const LOCALE_DIR = path.resolve('client/public/data/blog/locales');
let metaFix = 0, altFix = 0, scanned = 0;

for (const lang of fs.readdirSync(LOCALE_DIR)) {
  const langDir = path.join(LOCALE_DIR, lang);
  if (!fs.statSync(langDir).isDirectory()) continue;
  for (const f of fs.readdirSync(langDir)) {
    if (!f.endsWith('.json')) continue;
    const p = path.join(langDir, f);
    let data;
    try { data = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { continue; }
    scanned++;
    let changed = false;
    if (!data.metaDescription && data.title) {
      data.metaDescription = String(data.title).slice(0, 160);
      metaFix++; changed = true;
    }
    if (!data.imageAlt && data.title) {
      data.imageAlt = data.title;
      altFix++; changed = true;
    }
    if (changed) fs.writeFileSync(p, JSON.stringify(data, null, 2));
  }
}
console.log(`Scanned ${scanned} files. Backfilled metaDescription: ${metaFix}, imageAlt: ${altFix}`);
