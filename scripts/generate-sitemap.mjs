#!/usr/bin/env node
/**
 * Auto-generate sitemap.xml from blog data + static pages.
 * Fixes: www → non-www, adds all products including Nano Max,
 * includes all 146 blog articles with correct lastmod dates.
 * 
 * Usage: node scripts/generate-sitemap.mjs
 */
import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://cooldrivepro.com';
const OUT = path.resolve('client/public/sitemap.xml');
const TODAY = new Date().toISOString().slice(0, 10);

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

// Blog articles from list.json
const blogDir = path.resolve('client/public/data/blog');
const listPath = path.join(blogDir, 'list.json');
const blogArticles = [];

if (fs.existsSync(listPath)) {
  const list = JSON.parse(fs.readFileSync(listPath, 'utf8'));
  for (const article of list) {
    blogArticles.push({
      loc: `/blog/${article.slug}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: article.date || TODAY
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
    blogArticles.push({ loc, priority: '0.6', changefreq: 'monthly', lastmod: TODAY });
  }
}

// Generate XML
const allUrls = [...staticPages, ...blogArticles];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${DOMAIN}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(OUT, xml);
console.log(`Sitemap generated: ${allUrls.length} URLs → ${OUT}`);
console.log(`  Static: ${staticPages.length} | Blog: ${blogArticles.length}`);
