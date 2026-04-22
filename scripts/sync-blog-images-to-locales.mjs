#!/usr/bin/env node
/**
 * Sync hero + inline images from English master to all locale variants.
 *
 * Safe by design:
 * - Only writes `image`, `imageAlt`, `imageWidth`, `imageHeight`, `inlineImages`
 * - Image URLs copied verbatim (CDN URLs are language-neutral)
 * - alt text built from locale's OWN translated title + heading (better i18n SEO than English alt)
 * - Skips files that already have `inlineImages` unless --force
 * - Never touches `title`, `content`, `metaDescription`, etc.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'client/public/data/blog');
const LOCALES_DIR = path.join(BLOG_DIR, 'locales');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const DRY = args.includes('--dry');
const onlyLocale = (args.find(a => a.startsWith('--locale=')) || '').split('=')[1];

function buildLocaleInlineAlt(localeArticle, enInline) {
  // Prefer locale's section heading if same index exists, else fallback to locale's title
  const idx = enInline.afterSection;
  const localeHeading = Array.isArray(localeArticle.content) && localeArticle.content[idx]?.heading;
  const localeTitle = localeArticle.title || '';
  if (localeHeading && localeTitle) return `${localeHeading} — ${localeTitle}`;
  if (localeTitle) return `${localeTitle}`;
  return enInline.alt;
}

function syncOne(slug, enArticle, locale) {
  const localePath = path.join(LOCALES_DIR, locale, `${slug}.json`);
  if (!fs.existsSync(localePath)) return { skipped: 'no-locale-file' };
  const localeArticle = JSON.parse(fs.readFileSync(localePath, 'utf8'));

  const hasInline = Array.isArray(localeArticle.inlineImages) && localeArticle.inlineImages.length > 0;
  const enHero = enArticle.image && enArticle.image.includes('cdn.jsdelivr.net/gh/vethymch-spec/cooldrivepro-cdn');
  const enInline = Array.isArray(enArticle.inlineImages) && enArticle.inlineImages.length > 0;

  // If locale already fully synced and not forced, skip
  if (!FORCE && hasInline && localeArticle.image === enArticle.image) {
    return { skipped: 'already-synced' };
  }

  let changed = false;

  // 1. Hero: only update if EN has a CDN image (newer than legacy hash url)
  if (enHero && (FORCE || localeArticle.image !== enArticle.image)) {
    localeArticle.image = enArticle.image;
    localeArticle.imageWidth = enArticle.imageWidth;
    localeArticle.imageHeight = enArticle.imageHeight;
    // Build localized hero alt: use locale's title (already translated) — best SEO
    if (localeArticle.title) {
      localeArticle.imageAlt = `${localeArticle.title}`;
    } else {
      localeArticle.imageAlt = enArticle.imageAlt;
    }
    changed = true;
  }

  // 2. Inline images
  if (enInline && (FORCE || !hasInline)) {
    localeArticle.inlineImages = enArticle.inlineImages.map(img => ({
      afterSection: img.afterSection,
      url: img.url,
      alt: buildLocaleInlineAlt(localeArticle, img),
      width: img.width,
      height: img.height,
    }));
    changed = true;
  }

  if (changed && !DRY) {
    fs.writeFileSync(localePath, JSON.stringify(localeArticle, null, 2) + '\n');
  }
  return changed ? { changed: true } : { skipped: 'nothing-to-do' };
}

function main() {
  const enFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  const locales = onlyLocale
    ? [onlyLocale]
    : fs.readdirSync(LOCALES_DIR).filter(d => fs.statSync(path.join(LOCALES_DIR, d)).isDirectory());

  console.log(`Syncing ${enFiles.length} articles × ${locales.length} locales (${DRY ? 'DRY' : 'WRITE'}, force=${FORCE})\n`);

  const stats = { changed: 0, skippedSynced: 0, skippedNoFile: 0, skippedNoOp: 0, articlesNoImage: 0 };

  for (const file of enFiles) {
    const slug = file.replace(/\.json$/, '');
    const enArticle = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, file), 'utf8'));
    const enHasNewImage = enArticle.image && enArticle.image.includes('cooldrivepro-cdn');
    const enHasInline = Array.isArray(enArticle.inlineImages) && enArticle.inlineImages.length > 0;
    if (!enHasNewImage && !enHasInline) {
      stats.articlesNoImage++;
      continue;
    }

    for (const loc of locales) {
      const r = syncOne(slug, enArticle, loc);
      if (r.changed) stats.changed++;
      else if (r.skipped === 'already-synced') stats.skippedSynced++;
      else if (r.skipped === 'no-locale-file') stats.skippedNoFile++;
      else stats.skippedNoOp++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Updated locale files: ${stats.changed}`);
  console.log(`Already in sync:      ${stats.skippedSynced}`);
  console.log(`No locale file:       ${stats.skippedNoFile}`);
  console.log(`Nothing to do:        ${stats.skippedNoOp}`);
  console.log(`EN articles w/o new image: ${stats.articlesNoImage}`);
}

main();
