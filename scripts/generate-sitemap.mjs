
/**
 * Generate sitemap.xml with:
 *   • Multi-locale routing (xhtml:link rel="alternate" hreflang="...")
 *   • Google Image Sitemap extension (image:image)
 *   • Real lastmod from JSON file mtime
 *
 * URL contract:
 *   • English (default):  https://cooldrivepro.com/foo/
 *   • Other locales:      https://cooldrivepro.com/{lang}/foo/
 *   • x-default → English
 *
 * Localized alternates follow each page's real language availability.
 *
 * Usage: node scripts/generate-sitemap.mjs
 */
import fs from 'fs';
import path from 'path';
import { A_CLASS_SLUGS } from './lib/blog-a-class.mjs';

const DOMAIN = 'https://cooldrivepro.com';
const OUT = path.resolve('client/public/sitemap.xml');
const TODAY = new Date().toISOString().slice(0, 10);
const DEFAULT_LANG = 'en';

// Must match client/src/i18n supportedLanguages
const LANGS = [
  'en','zh-CN','zh-TW','ja','ko','de','fr','es','it','pt','ru','ar','hi','th','vi','id',
  'tr','pl','nl','sv','no','da','fi','el','cs','hu','ro','uk','he','ms'
];
// Blog posts are only indexed in these high-value markets. Other localized
// blog pages stay reachable for users but are noindex (see prerender) and not
// announced in sitemap — frees crawl budget for commercial pages.
const STRONG_BLOG_LANGS = new Set(['en','de','es','fr','it','pl','pt','ja']);

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
  const cleanPath = withTrailingSlash(pathWithoutLocale.startsWith('/') ? pathWithoutLocale : `/${pathWithoutLocale}`);
  if (lang === DEFAULT_LANG) return `${DOMAIN}${cleanPath}`;
  return `${DOMAIN}/${lang}${cleanPath}`;
}

function withTrailingSlash(p) {
  if (!p || p === '/') return '/';
  return p.endsWith('/') ? p : `${p}/`;
}

// ─── Static pages ────────────────────────────────────────────────────────────
const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: TODAY },
  { loc: '/products/top-mounted-ac', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products/mini-split-ac', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products/heating-cooling-ac', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products/nano-max', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/products', priority: '0.8', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/tools/parking-ac-fitment-planner', priority: '0.8', changefreq: 'monthly', lastmod: TODAY, langs: [DEFAULT_LANG] },
  { loc: '/vehicle-compatibility', priority: '0.8', changefreq: 'monthly', lastmod: TODAY, langs: [DEFAULT_LANG] },
  { loc: '/vehicle-compatibility/semi-truck-parking-ac', priority: '0.75', changefreq: 'monthly', lastmod: TODAY, langs: [DEFAULT_LANG] },
  { loc: '/vehicle-compatibility/rv-parking-ac', priority: '0.75', changefreq: 'monthly', lastmod: TODAY, langs: [DEFAULT_LANG] },
  { loc: '/vehicle-compatibility/12v-vs-24v-parking-ac', priority: '0.75', changefreq: 'monthly', lastmod: TODAY, langs: [DEFAULT_LANG] },
  { loc: '/dealer-guide/parking-ac-local-market-fitment', priority: '0.75', changefreq: 'monthly', lastmod: TODAY, langs: [DEFAULT_LANG] },
  { loc: '/about', priority: '0.7', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/about/factory', priority: '0.6', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/about/certifications', priority: '0.6', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/about/exhibitions', priority: '0.6', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/contact', priority: '0.7', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/blog', priority: '0.8', changefreq: 'daily', lastmod: TODAY },
  { loc: '/support', priority: '0.5', changefreq: 'monthly', lastmod: TODAY },
  { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly', lastmod: '2026-01-01' },
  { loc: '/terms-of-service', priority: '0.3', changefreq: 'yearly', lastmod: TODAY },
  { loc: '/payment-method', priority: '0.3', changefreq: 'yearly', lastmod: TODAY },
  { loc: '/billing-terms', priority: '0.3', changefreq: 'yearly', lastmod: TODAY },
];

const features = ['power', 'efficiency', 'installation', 'battery', 'durability', 'noise'];
for (const f of features) {
  staticPages.push({ loc: `/features/${f}`, priority: '0.7', changefreq: 'monthly', lastmod: TODAY });
}

const commercialHubs = [
  '/solutions/truck-ac',
  '/solutions/12v-air-conditioner',
  '/solutions/12v-rv-air-conditioner',
  '/solutions/12v-air-conditioner-for-van',
  '/solutions/12v-rooftop-air-conditioner',
  '/solutions/12v-mini-split-air-conditioner',
  '/solutions/portable-ac-for-truck',
  '/solutions/semi-truck-parking-ac',
  '/solutions/sleeper-cab-air-conditioner',
  '/solutions/fleet-parking-ac',
  '/solutions/parking-ac-distributor',
  '/solutions/rv-parking-ac',
  '/solutions/van-parking-ac',
  '/solutions/battery-powered-truck-cab-air-conditioner',
  '/solutions/no-idle-truck-air-conditioner',
  '/solutions/off-grid-rv-air-conditioner',
  '/solutions/camper-van-parking-ac',
  '/compare/12v-vs-24v-parking-ac',
  '/compare/rooftop-vs-mini-split-parking-ac',
  '/compare/parking-ac-battery-runtime',
  '/compare/cooling-only-vs-heating-cooling-parking-ac',
  '/compare/parking-ac-roof-fitment-guide',
];
for (const loc of commercialHubs) {
  staticPages.push({ loc, priority: '0.7', changefreq: 'monthly', lastmod: TODAY, langs: [DEFAULT_LANG] });
}

// ─── APU theme hub & sub-pages (English only for now) ───────────────────────
const apuPages = [
  { loc: '/apu/', priority: '0.85' },
  { loc: '/apu/what-is-a-truck-apu/', priority: '0.75' },
  { loc: '/apu/how-it-works/', priority: '0.75' },
  { loc: '/apu/electric/', priority: '0.8' },
  { loc: '/apu/diesel/', priority: '0.8' },
  { loc: '/apu/hybrid/', priority: '0.8' },
  { loc: '/apu/builder/', priority: '0.7' },
  { loc: '/apu/roi-calculator/', priority: '0.7' },
  { loc: '/apu/compliance/', priority: '0.7' },
  { loc: '/apu/compare/', priority: '0.75' },
  { loc: '/apu/case-studies/', priority: '0.7' },
  { loc: '/apu/r-and-d/', priority: '0.6' },
  { loc: '/apu/install/', priority: '0.7' },
  { loc: '/apu/faq/', priority: '0.7' },
];
for (const p of apuPages) {
  staticPages.push({ loc: p.loc, priority: p.priority, changefreq: 'monthly', lastmod: TODAY, langs: [DEFAULT_LANG] });
}

// ─── Blog articles ───────────────────────────────────────────────────────────
const blogDir = path.resolve('client/public/data/blog');
const listPath = path.join(blogDir, 'list.json');
const localeDir = path.join(blogDir, 'locales');
const localeAvailabilityPath = path.join(blogDir, 'locale-availability.json');
const blogArticles = [];
const NON_ARTICLE_SLUGS = new Set(['related-posts']);
const LANG_SET = new Set(LANGS);
let BLOG_LOCALE_AVAILABILITY = {};

try {
  BLOG_LOCALE_AVAILABILITY = JSON.parse(fs.readFileSync(localeAvailabilityPath, 'utf8')).posts || {};
} catch {
  BLOG_LOCALE_AVAILABILITY = {};
}

function blogLangsForSlug(slug) {
  const langs = new Set([DEFAULT_LANG]);
  const listed = BLOG_LOCALE_AVAILABILITY[slug];

  if (Array.isArray(listed)) {
    for (const lang of listed) {
      if (LANG_SET.has(lang)) langs.add(lang);
    }
    return LANGS.filter(lang => langs.has(lang) && STRONG_BLOG_LANGS.has(lang));
  }

  for (const lang of LANGS) {
    if (lang === DEFAULT_LANG) continue;
    if (fs.existsSync(path.join(localeDir, lang, `${slug}.json`))) langs.add(lang);
  }

  return LANGS.filter(lang => langs.has(lang) && STRONG_BLOG_LANGS.has(lang));
}

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
    if (!article?.slug || NON_ARTICLE_SLUGS.has(article.slug) || A_CLASS_SLUGS.has(article.slug)) continue; // exclude non-articles and A-class
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
    // SEO guard: never emit lastmod in the future — Google ignores or flags it.
    if (lastmod > TODAY) lastmod = TODAY;
    blogArticles.push({
      loc: `/blog/${article.slug}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod,
      images,
      langs: blogLangsForSlug(article.slug),
    });
  }
}

const allSlugs = new Set(blogArticles.map(a => a.loc));
const jsonFiles = fs.readdirSync(blogDir).filter(f =>
  f.endsWith('.json') && !['list.json', 'manifest.json', 'related-posts.json', 'locale-availability.json'].includes(f)
);
for (const f of jsonFiles) {
  const slug = f.replace('.json', '');
  if (NON_ARTICLE_SLUGS.has(slug) || A_CLASS_SLUGS.has(slug)) continue; // exclude non-articles and A-class
  const loc = `/blog/${slug}`;
  if (!allSlugs.has(loc)) {
    const fullPath = path.join(blogDir, f);
    let images = [];
    try {
      const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      images = collectArticleImages(full);
    } catch {}
    let lastmod = fileMtimeISO(fullPath);
    if (lastmod > TODAY) lastmod = TODAY;
    blogArticles.push({
      loc,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod,
      images,
      langs: blogLangsForSlug(slug),
    });
  }
}

// ─── XML emission ────────────────────────────────────────────────────────────
const allUrls = [...staticPages.map(p => ({ ...p, images: [] })), ...blogArticles];

let totalUrlEntries = 0;
let totalImageEntries = 0;

function buildUrlBlock(pathWithoutLocale, lang, meta) {
  const fullLoc = localizedUrl(lang, pathWithoutLocale);
  const pageLangs = meta.langs || LANGS;
  const alternates = pageLangs.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEscape(localizedUrl(l, pathWithoutLocale))}" />`
  ).join('\n');
  const xDefault = pageLangs.includes(DEFAULT_LANG)
    ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(localizedUrl(DEFAULT_LANG, pathWithoutLocale))}" />`
    : '';
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
    <priority>${meta.priority}</priority>${alternates ? `\n${alternates}` : ''}${xDefault ? `\n${xDefault}` : ''}${imgXml ? '\n' + imgXml : ''}
  </url>`;
}

// ─── Per-language sitemaps + sitemap-index ───────────────────────────────────
// Single 20+MB sitemap exceeded Google's recommended 10MB. Split by language so
// each file stays small and reflows independently.
const PUBLIC_DIR = path.resolve('client/public');
const indexEntries = [];
const sizesByLang = {};

for (const lang of LANGS) {
  const langBlocks = [];
  for (const u of allUrls) {
    if (u.langs && !u.langs.includes(lang)) continue;
    langBlocks.push(buildUrlBlock(u.loc, lang, u));
  }
  const langXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${langBlocks.join('\n')}
</urlset>`;
  const fileName = `sitemap-${lang}.xml`;
  const filePath = path.join(PUBLIC_DIR, fileName);
  fs.writeFileSync(filePath, langXml);
  sizesByLang[lang] = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2);
  indexEntries.push(`  <sitemap>
    <loc>${DOMAIN}/${fileName}</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>`);
}

const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexEntries.join('\n')}
</sitemapindex>`;
fs.writeFileSync(OUT, indexXml);

const totalSize = LANGS.reduce((s, l) => s + parseFloat(sizesByLang[l]), 0);
console.log(`Sitemap generated:`);
console.log(`  Pages: ${allUrls.length} (static ${allUrls.length - blogArticles.length} + blog ${blogArticles.length})`);
console.log(`  Locales: ${LANGS.length}`);
console.log(`  URL entries: ${totalUrlEntries} (across ${LANGS.length} per-language files)`);
console.log(`  Image entries: ${totalImageEntries}`);
console.log(`  Index: ${OUT}`);
console.log(`  Per-language: sitemap-{lang}.xml, total ${totalSize.toFixed(2)} MB, max ${Math.max(...LANGS.map(l => parseFloat(sizesByLang[l]))).toFixed(2)} MB`);
if (totalUrlEntries > 50000) {
  console.warn(`  ⚠ Exceeds 50k URL limit per sitemap! Consider splitting.`);
}

