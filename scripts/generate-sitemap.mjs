#!/usr/bin/env node
/**
 * Generate sitemap.xml with:
 *   • Multi-locale routing (xhtml:link rel="alternate" hreflang="...")
 *   • Google Image Sitemap extension (image:image)
 *   • Real lastmod from JSON file mtime
 *
 * URL contract:
 *   • English (default):  https://cooldrivepro.com/foo
 *   • Other locales:      https://cooldrivepro.com/{lang}/foo
 *   • x-default → English
 *
 * Each <url> entry emits xhtml:link for ALL 30 locales (Google requirement).
 *
 * Usage: node scripts/generate-sitemap.mjs
 */
import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://cooldrivepro.com';
const OUT = path.resolve('client/public/sitemap.xml');
const TODAY = new Date().toISOString().slice(0, 10);
const DEFAULT_LANG = 'en';

// Must match client/src/i18n supportedLanguages
const LANGS = [
  'en','zh-CN','zh-TW','ja','ko','de','fr','es','it','pt','ru','ar','hi','th','vi','id',
  'tr','pl','nl','sv','no','da','fi','el','cs','hu','ro','uk','he','ms'
];

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function fileMtimeISO(p) {
  try { return fs.statSync(p).mtime.toISOString().slice(0, 10); }
  catch { return TODAY; }
}

function localizedUrl(lang, pathWithoutLocale) {
  if (lang === DEFAULT_LANG) return `${DOMAIN}${pathWithoutLocale}`;
  return `${DOMAIN}/${lang}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
}

// ─── Static pages ────────────────────────────────────────────────────────────
const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: TODAY },
  { loc: '/products/top-mounted-ac', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products/mini-split-ac', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products/heating-cooling-ac', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products/nano-max', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products', priority: '0.8', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/about', priority: '0.7', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/contact', priority: '0.7', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/blog', priority: '0.8', changefreq: 'daily', lastmod: TODAY },
  { loc: '/support', priority: '0.5', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly', lastmod: '2026-01-01' },
];

const features = ['power', 'quiet', 'solar', 'install', 'battery', 'smart'];
for (const f of features) {
  staticPages.push({ loc: `/features/${f}`, priority: '0.7', changefreq: 'monthly', lastmod: TODAY });
}

// ─── Blog articles ───────────────────────────────────────────────────────────
const blogDir = path.resolve('client/public/data/blog');
const listPath = path.join(blogDir, 'list.json');
const blogArticles = [];

function collectArticleImages(articleObj) {
  const imgs = [];
  if (articleObj.image) {
    imgs.push({ url: articleObj.image, caption: articleObj.imageAlt || articleObj.title || '' });
  }
  if (Array.isArray(articleObj.inlineImages)) {
    for (const im of articleObj.inlineImages) {
      if (im.url) imgs.push({ url: im.url, caption: im.alt || articleObj.title || '' });
    }
  }
  return imgs;
}

if (fs.existsSync(listPath)) {
  const list = JSON.parse(fs.readFileSync(listPath, 'utf8'));
  for (const article of list) {
    const fullPath = path.join(blogDir, `${article.slug}.json`);
    let images = [];
    let lastmod = article.date || TODAY;
    if (fs.existsSync(fullPath)) {
      try {
        const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        images = collectArticleImages(full);
        const mt = fileMtimeISO(fullPath);
        if (mt > lastmod) lastmod = mt;
      } catch {}
    }
    blogArticles.push({
      loc: `/blog/${article.slug}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod,
      images,
    });
  }
}

const allSlugs = new Set(blogArticles.map(a => a.loc));
const jsonFiles = fs.readdirSync(blogDir).filter(f =>
  f.endsWith('.json') && !['list.json', 'manifest.json', 'related-posts.json', 'locale-availability.json'].includes(f)
);
for (const f of jsonFiles) {
  const slug = f.replace('.json', '');
  const loc = `/blog/${slug}`;
  if (!allSlugs.has(loc)) {
    const fullPath = path.join(blogDir, f);
    let images = [];
    try {
      const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      images = collectArticleImages(full);
    } catch {}
    blogArticles.push({
      loc,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: fileMtimeISO(fullPath),
      images,
    });
  }
}

// ─── XML emission ────────────────────────────────────────────────────────────
const allUrls = [...staticPages.map(p => ({ ...p, images: [] })), ...blogArticles];

let totalUrlEntries = 0;
let totalImageEntries = 0;

function buildUrlBlock(pathWithoutLocale, lang, meta) {
  const fullLoc = localizedUrl(lang, pathWithoutLocale);
  const alternates = LANGS.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEscape(localizedUrl(l, pathWithoutLocale))}" />`
  ).join('\n');
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(localizedUrl(DEFAULT_LANG, pathWithoutLocale))}" />`;
  const imgXml = (meta.images || []).map(img => {
    totalImageEntries++;
    return `    <image:image>
      <image:loc>${xmlEscape(img.url)}</image:loc>${img.caption ? `
      <image:caption>${xmlEscape(img.caption)}</image:caption>` : ''}
    </image:image>`;
  }).join('\n');
  totalUrlEntries++;
  return `  <url>
    <loc>${xmlEscape(fullLoc)}</loc>
    <lastmod>${meta.lastmod}</lastmod>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${meta.priority}</priority>
${alternates}
${xDefault}${imgXml ? '\n' + imgXml : ''}
  </url>`;
}

const blocks = [];
for (const u of allUrls) {
  for (const lang of LANGS) {
    blocks.push(buildUrlBlock(u.loc, lang, u));
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${blocks.join('\n')}
</urlset>`;

fs.writeFileSync(OUT, xml);
const sizeMb = (fs.statSync(OUT).size / 1024 / 1024).toFixed(2);
console.log(`Sitemap generated:`);
console.log(`  Pages: ${allUrls.length} (static ${allUrls.length - blogArticles.length} + blog ${blogArticles.length})`);
console.log(`  Locales: ${LANGS.length}`);
console.log(`  URL entries: ${totalUrlEntries}`);
console.log(`  Image entries: ${totalImageEntries}`);
console.log(`  File: ${OUT} (${sizeMb} MB)`);
if (totalUrlEntries > 50000) {
  console.warn(`  ⚠ Exceeds 50k URL limit per sitemap! Consider splitting.`);
}
if (parseFloat(sizeMb) > 50) {
  console.warn(`  ⚠ Exceeds 50 MB sitemap size limit! Consider splitting.`);
}
#!/usr/bin/env node
/**
 * Auto-generate sitemap.xml with Google Image Sitemap extension.
 * - Adds <image:image> entries so Google Images indexes all hero + inline images
 * - Uses real lastmod from JSON file mtime (not always TODAY)
 * - Includes all 150 blog articles with images
 *
 * Usage: node scripts/generate-sitemap.mjs
 */
import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://cooldrivepro.com';
const OUT = path.resolve('client/public/sitemap.xml');
const TODAY = new Date().toISOString().slice(0, 10);

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function fileMtimeISO(p) {
  try { return fs.statSync(p).mtime.toISOString().slice(0, 10); }
  catch { return TODAY; }
}

// Static pages
const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: TODAY },
  { loc: '/products/top-mounted-ac', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products/mini-split-ac', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products/heating-cooling-ac', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products/nano-max', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products', priority: '0.8', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/about', priority: '0.7', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/contact', priority: '0.7', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/blog', priority: '0.8', changefreq: 'daily', lastmod: TODAY },
  { loc: '/support', priority: '0.5', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly', lastmod: '2026-01-01' },
  { loc: '/shop', priority: '0.7', changefreq: 'monthly', lastmod: TODAY },
];

// Feature pages
const features = ['power', 'quiet', 'solar', 'install', 'battery', 'smart'];
for (const f of features) {
  staticPages.push({ loc: `/features/${f}`, priority: '0.7', changefreq: 'monthly', lastmod: TODAY });
}

// Blog articles from list.json — collect images too
const blogDir = path.resolve('client/public/data/blog');
const listPath = path.join(blogDir, 'list.json');
const blogArticles = [];

function collectArticleImages(articleObj) {
  const imgs = [];
  if (articleObj.image) {
    imgs.push({ url: articleObj.image, caption: articleObj.imageAlt || articleObj.title || '' });
  }
  if (Array.isArray(articleObj.inlineImages)) {
    for (const im of articleObj.inlineImages) {
      if (im.url) imgs.push({ url: im.url, caption: im.alt || articleObj.title || '' });
    }
  }
  return imgs;
}

if (fs.existsSync(listPath)) {
  const list = JSON.parse(fs.readFileSync(listPath, 'utf8'));
  for (const article of list) {
    const fullPath = path.join(blogDir, `${article.slug}.json`);
    let images = [];
    let lastmod = article.date || TODAY;
    if (fs.existsSync(fullPath)) {
      try {
        const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        images = collectArticleImages(full);
        const mt = fileMtimeISO(fullPath);
        if (mt > lastmod) lastmod = mt;
      } catch {}
    }
    blogArticles.push({
      loc: `/blog/${article.slug}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod,
      images,
    });
  }
}

// Also catch any articles not in list.json
const allSlugs = new Set(blogArticles.map(a => a.loc));
const jsonFiles = fs.readdirSync(blogDir).filter(f => 
  f.endsWith('.json') && !['list.json', 'manifest.json', 'related-posts.json', 'locale-availability.json'].includes(f)
);
for (const f of jsonFiles) {
  const slug = f.replace('.json', '');
  const loc = `/blog/${slug}`;
  if (!allSlugs.has(loc)) {
    const fullPath = path.join(blogDir, f);
    let images = [];
    try {
      const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      images = collectArticleImages(full);
    } catch {}
    blogArticles.push({
      loc,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: fileMtimeISO(fullPath),
      images,
    });
  }
}

// Generate XML with image: namespace extension
const allUrls = [...staticPages.map(p => ({ ...p, images: [] })), ...blogArticles];
const totalImages = allUrls.reduce((n, u) => n + (u.images?.length || 0), 0);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls.map(u => {
  const imgXml = (u.images || []).map(img =>
    `    <image:image>
      <image:loc>${xmlEscape(img.url)}</image:loc>${img.caption ? `
      <image:caption>${xmlEscape(img.caption)}</image:caption>` : ''}
    </image:image>`
  ).join('\n');
  return `  <url>
    <loc>${DOMAIN}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${imgXml ? '\n' + imgXml : ''}
  </url>`;
}).join('\n')}
</urlset>`;

fs.writeFileSync(OUT, xml);
console.log(`Sitemap generated: ${allUrls.length} URLs, ${totalImages} images → ${OUT}`);
console.log(`  Static: ${staticPages.length} | Blog: ${blogArticles.length} | Image entries: ${totalImages}`);
