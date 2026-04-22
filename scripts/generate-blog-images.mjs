#!/usr/bin/env node
/**
 * Generate inline images for blog articles using Gemini 2.5 Flash Image.
 *
 * Usage:
 *   GEMINI_API_KEY=xxx node scripts/generate-blog-images.mjs --limit 5
 *   GEMINI_API_KEY=xxx node scripts/generate-blog-images.mjs --all
 *   GEMINI_API_KEY=xxx node scripts/generate-blog-images.mjs --slug 12v-vs-24v-parking-ac
 *
 * For each article:
 *   - Generates 1 NEW hero image (replaces existing thumbnail)
 *   - Generates 1 inline image (positioned mid-article)
 * Saves as webp to /Users/mac/Desktop/cooldrivepro-cdn/, commits & pushes
 * Updates client/public/data/blog/<slug>.json with new image URLs.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('ERROR: GEMINI_API_KEY env var not set');
  process.exit(1);
}

const MODEL = 'gemini-2.5-flash-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
const BLOG_DIR = path.resolve('client/public/data/blog');
const ARTICLES_DIR = path.join(BLOG_DIR, 'articles');
const CDN_DIR = path.resolve('../cooldrivepro-cdn');
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/vethymch-spec/cooldrivepro-cdn@main';

// CLI args
const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--limit='));
const slugArg = args.find(a => a.startsWith('--slug='));
const all = args.includes('--all');
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : (all ? Infinity : 5);
const onlySlug = slugArg ? slugArg.split('=')[1] : null;
const skipHero = args.includes('--skip-hero');
const skipInline = args.includes('--skip-inline');

console.log(`Mode: limit=${limit === Infinity ? 'ALL' : limit}, slug=${onlySlug || 'auto'}, skipHero=${skipHero}, skipInline=${skipInline}`);

function shortHash(input) {
  return crypto.createHash('md5').update(input).digest('hex').slice(0, 8);
}

async function generateImage(prompt) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  let retries = 3;
  let lastErr;
  while (retries > 0) {
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`HTTP ${r.status}: ${txt.slice(0, 300)}`);
      }
      const data = await r.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      for (const p of parts) {
        if (p.inlineData?.data) {
          return Buffer.from(p.inlineData.data, 'base64');
        }
      }
      throw new Error('No inlineData in response: ' + JSON.stringify(data).slice(0, 300));
    } catch (e) {
      lastErr = e;
      retries--;
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  throw lastErr;
}

async function saveAsWebp(pngBuffer, outPath, width = 1200, metadata = {}) {
  // SEO: include IPTC metadata (description, copyright) so search engines and downstream sites get context
  let pipeline = sharp(pngBuffer)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 });
  // Sharp can pass metadata through; embed IPTC for SEO crawlers
  if (metadata.description || metadata.copyright) {
    pipeline = pipeline.withMetadata({
      iptc: {
        Caption: metadata.description || '',
        CopyrightNotice: metadata.copyright || 'CoolDrivePro',
      },
    });
  }
  const buf = await pipeline.toBuffer();
  fs.writeFileSync(outPath, buf);
  // Get final dimensions
  const meta = await sharp(buf).metadata();
  return { size: buf.length, width: meta.width, height: meta.height };
}

// --- Topic inference (avoid passing raw titles — Gemini renders them as overlay text) ---
function inferSubject(article) {
  const text = ((article.title || '') + ' ' + (article.category || '')).toLowerCase();
  if (/\brv\b|motorhome|camper|caravan/.test(text))
    return 'a modern RV motorhome interior with a rooftop air conditioner unit visible';
  if (/van life|sprinter|cargo van/.test(text))
    return 'a converted camper van interior with a compact rooftop air conditioner';
  if (/semi[- ]?truck|18[- ]?wheeler|long haul|sleeper cab/.test(text))
    return 'a modern semi-truck sleeper cabin interior with a rooftop parking air conditioner';
  if (/mini[- ]?split/.test(text))
    return 'a compact mini-split air conditioner installed in a vehicle, indoor and outdoor units visible';
  if (/solar|mppt|off[- ]?grid/.test(text))
    return 'an RV with rooftop solar panels and a parking air conditioner under sunny sky';
  if (/battery|lifepo4|lithium|bms/.test(text))
    return 'a lithium battery pack and inverter system installed inside a truck cabin';
  if (/install|mount|setup|diy/.test(text))
    return 'a technician installing a parking air conditioner unit on a truck cabin roof, hands and tools visible';
  if (/maintenance|cleaning|repair|service/.test(text))
    return 'a mechanic servicing the filter and coils of a parking air conditioner';
  if (/africa|nigeria|kenya|ghana|tanzania|egypt|cape town|nairobi|lagos|cairo|alexandria|johannesburg|arusha|kumasi|accra|kano|dar/.test(text))
    return 'a commercial truck parked in an African urban or roadside scene under hot sun, with a rooftop parking air conditioner';
  if (/fleet|logistics|cold chain|delivery|commercial/.test(text))
    return 'a fleet of commercial delivery trucks at a logistics depot with rooftop parking air conditioners';
  if (/tourism|safari|wildlife/.test(text))
    return 'a safari tour vehicle in a savanna landscape with a rooftop parking air conditioner';
  return 'a modern truck cabin interior with a parking air conditioner mounted on the roof';
}

const NO_TEXT = ' STRICTLY NO TEXT, NO words, NO letters, NO numbers, NO captions, NO labels, NO subtitles, NO logos, NO watermarks, NO signage, NO digital readouts. Pure stock-photography style only — if any text appears the image is unusable.';

function buildHeroPrompt(article) {
  const subject = inferSubject(article);
  return `Photorealistic editorial stock photograph of ${subject}. ` +
    `Cinematic golden-hour or natural daylight, professional commercial photography, ` +
    `shallow depth of field, 16:9 widescreen, high resolution, clean composition, modern aesthetic.` +
    NO_TEXT;
}

function buildInlinePrompt(article, midSection) {
  const subject = inferSubject(article);
  const h = (midSection?.heading || '').toLowerCase();
  let composition = 'a different angle of the same scene, mid-range shot';
  if (/install/.test(h)) composition = 'a close-up of installation hardware and mounting brackets';
  else if (/maintenance|clean|filter/.test(h)) composition = 'a close-up of an air filter being replaced by gloved hands';
  else if (/battery|power|lithium|lifepo4/.test(h)) composition = 'a close-up of a wired lithium battery pack and inverter';
  else if (/solar/.test(h)) composition = 'a close-up of rooftop solar panels with cabling';
  else if (/compressor|cooling/.test(h)) composition = 'a cutaway technical view of an air conditioner compressor and fan';
  else if (/faq|question/.test(h)) composition = 'a wide environmental shot of the same product context';
  return `Photorealistic editorial stock photograph of ${subject}, composed as ${composition}. ` +
    `Professional commercial photography, natural lighting, 16:9 widescreen, high resolution.` +
    NO_TEXT;
}

// SEO: build descriptive alt text from article context
function buildAlt(article, kind, midSection) {
  const subject = inferSubject(article);
  const cleanSubject = subject.replace(/^a (modern |compact |converted )?/, '').replace(/^an /, '');
  if (kind === 'hero') {
    return `${article.title} — ${cleanSubject}`;
  }
  const heading = midSection?.heading || 'technical details';
  return `${heading} — ${cleanSubject} (${article.title})`;
}

function findArticleFiles() {
  const files = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.json') && !['list.json', 'locale-availability.json', 'manifest.json', 'related-posts.json'].includes(f));
  return files;
}

async function processArticle(filename) {
  const slug = filename.replace(/\.json$/, '');
  const articlePath = path.join(BLOG_DIR, filename);
  const article = JSON.parse(fs.readFileSync(articlePath, 'utf8'));

  // Per-image idempotency: skip hero if article.image already a CDN url; skip inline if inlineImages exists.
  // Only skip the whole article when BOTH are present (unless --force).
  const hasHero = typeof article.image === 'string' && article.image.includes(CDN_BASE);
  const hasInline = Array.isArray(article.inlineImages) && article.inlineImages.length > 0;
  if (hasHero && hasInline && !args.includes('--force')) {
    console.log(`  [SKIP] ${slug} already has hero + inline`);
    return false;
  }

  console.log(`\n[GEN] ${slug}`);
  console.log(`  title: ${article.title?.slice(0, 80)}`);
  let touched = false;

  // 1. Hero image — skip if already present (unless --force)
  if (!skipHero && (!hasHero || args.includes('--force'))) {
    try {
      const heroPrompt = buildHeroPrompt(article);
      const png = await generateImage(heroPrompt);
      const hash = shortHash(slug + '_hero_' + Date.now());
      // SEO: descriptive filename with slug + 'hero' keyword
      const filename = `${slug}-hero.webp`;
      const outPath = path.join(CDN_DIR, filename);
      const alt = buildAlt(article, 'hero');
      const { size, width, height } = await saveAsWebp(png, outPath, 1280, {
        description: alt,
        copyright: 'CoolDrivePro',
      });
      const cdnUrl = `${CDN_BASE}/${filename}`;
      article.image = cdnUrl;
      article.imageAlt = alt;
      article.imageWidth = width;
      article.imageHeight = height;
      console.log(`  hero: ${filename} ${(size/1024).toFixed(0)}KB ${width}x${height}`);
      touched = true;
    } catch (e) {
      console.error(`  hero FAIL: ${e.message}`);
    }
  }

  // 2. Inline image — skip if already present (unless --force)
  if (!skipInline && (!hasInline || args.includes('--force')) && Array.isArray(article.content) && article.content.length >= 2) {
    try {
      const midIndex = Math.floor(article.content.length / 2);
      const midSection = article.content[midIndex];
      const inlinePrompt = buildInlinePrompt(article, midSection);
      const png = await generateImage(inlinePrompt);
      // SEO: descriptive filename including section topic
      const sectionSlug = (midSection.heading || 'detail').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'detail';
      const filename = `${slug}-${sectionSlug}.webp`;
      const outPath = path.join(CDN_DIR, filename);
      const alt = buildAlt(article, 'inline', midSection);
      const { size, width, height } = await saveAsWebp(png, outPath, 1200, {
        description: alt,
        copyright: 'CoolDrivePro',
      });
      const cdnUrl = `${CDN_BASE}/${filename}`;
      article.inlineImages = [{
        afterSection: midIndex,
        url: cdnUrl,
        alt,
        width,
        height,
      }];
      console.log(`  inline: ${filename} ${(size/1024).toFixed(0)}KB ${width}x${height}`);
      touched = true;
    } catch (e) {
      console.error(`  inline FAIL: ${e.message}`);
    }
  }

  if (touched) {
    fs.writeFileSync(articlePath, JSON.stringify(article, null, 2) + '\n');
    // Mirror to articles/ duplicate if it exists (some articles have both)
    const altPath = path.join(ARTICLES_DIR, filename);
    if (fs.existsSync(altPath)) {
      const alt = JSON.parse(fs.readFileSync(altPath, 'utf8'));
      alt.image = article.image;
      alt.inlineImages = article.inlineImages;
      fs.writeFileSync(altPath, JSON.stringify(alt, null, 2) + '\n');
    }
  }
  return touched;
}

async function main() {
  let files = findArticleFiles();
  if (onlySlug) {
    files = files.filter(f => f.replace(/\.json$/, '') === onlySlug);
  }
  files = files.slice(0, limit);
  console.log(`Processing ${files.length} articles...`);

  let success = 0, failed = 0;
  for (const f of files) {
    try {
      const ok = await processArticle(f);
      if (ok) success++;
      // Small delay to be nice to the API (free tier RPM limits)
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(`FATAL ${f}: ${e.message}`);
      failed++;
    }
  }
  console.log(`\nDone. success=${success} failed=${failed} skipped=${files.length - success - failed}`);

  // Push CDN repo
  if (success > 0) {
    console.log('\nPushing CDN repo...');
    try {
      execSync('git add -A', { cwd: CDN_DIR, stdio: 'inherit' });
      execSync(`git commit -m "feat: add ${success} blog images via Gemini"`, { cwd: CDN_DIR, stdio: 'inherit' });
      execSync('git push origin main', { cwd: CDN_DIR, stdio: 'inherit' });
      console.log('CDN push complete.');
    } catch (e) {
      console.log('CDN push skipped (no changes or already up to date).');
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
