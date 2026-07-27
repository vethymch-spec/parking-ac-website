#!/usr/bin/env node
/**
 * Generate RSS 2.0 + Atom 1.0 feeds for the blog.
 * Outputs:
 *   client/public/feed.xml      (RSS 2.0)
 *   client/public/atom.xml      (Atom 1.0)
 * Includes WebSub hub link for instant feed propagation.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const BLOG_DIR = path.join(ROOT, 'client/public/data/blog');
const PUB_DIR = path.join(ROOT, 'client/public');
const DOMAIN = 'https://cooldrivepro.com';
const SITE_NAME = 'CoolDrivePro';
const SITE_DESC = 'Parking air conditioner engineering, fleet ROI analysis, and anti-idling resources for trucks, RVs, and vans.';
const HUB = 'https://pubsubhubbub.appspot.com/';
const MAX_ITEMS = 50;

const escXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const manifest = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, 'manifest.json'), 'utf8'));

// Sort newest first; A-class noindex slugs excluded

function loadAClassSlugs() {
  try {
    const src = fs.readFileSync(path.join(ROOT, 'scripts/lib/blog-a-class.mjs'), 'utf8');
    const m = src.match(/A_CLASS_SLUGS\s*=\s*new\s+Set\(\s*\[([\s\S]*?)\]\s*\)/);
    if (!m) return new Set();
    const slugs = m[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    return new Set(slugs);
  } catch { return new Set(); }
}
const AC = loadAClassSlugs();

const items = manifest
  .filter(p => !AC.has(p.slug))
  .map(p => ({
    ...p,
    pubDate: new Date(p.date || '2026-01-01').toUTCString(),
    isoDate: new Date(p.date || '2026-01-01').toISOString(),
    url: `${DOMAIN}/blog/${p.slug}/`,
    guid: `${DOMAIN}/blog/${p.slug}/`,
  }))
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, MAX_ITEMS);

const lastBuild = items[0]?.pubDate || new Date().toUTCString();
const lastBuildIso = items[0]?.isoDate || new Date().toISOString();

// RSS 2.0
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escXml(SITE_NAME)} Blog</title>
    <link>${DOMAIN}/blog/</link>
    <description>${escXml(SITE_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${DOMAIN}/feed.xml" rel="self" type="application/rss+xml" />
    <atom:link href="${HUB}" rel="hub" />
    <generator>CoolDrivePro Custom Feed</generator>
    <image>
      <url>${DOMAIN}/logo.png</url>
      <title>${escXml(SITE_NAME)}</title>
      <link>${DOMAIN}/</link>
    </image>
${items.map(i => `    <item>
      <title>${escXml(i.title)}</title>
      <link>${i.url}</link>
      <guid isPermaLink="true">${i.guid}</guid>
      <pubDate>${i.pubDate}</pubDate>
      <description>${escXml(i.excerpt || i.title)}</description>
      <dc:creator>${escXml(SITE_NAME)}</dc:creator>${i.image ? `
      <enclosure url="${escXml(i.image)}" type="image/webp" length="0" />` : ''}${i.category ? `
      <category>${escXml(i.category)}</category>` : ''}
    </item>`).join('\n')}
  </channel>
</rss>
`;

// Atom 1.0
const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escXml(SITE_NAME)} Blog</title>
  <subtitle>${escXml(SITE_DESC)}</subtitle>
  <link href="${DOMAIN}/atom.xml" rel="self" />
  <link href="${DOMAIN}/blog/" />
  <link href="${HUB}" rel="hub" />
  <id>${DOMAIN}/</id>
  <updated>${lastBuildIso}</updated>
  <author><name>${escXml(SITE_NAME)}</name><uri>${DOMAIN}</uri></author>
  <icon>${DOMAIN}/logo.png</icon>
  <logo>${DOMAIN}/logo.png</logo>
${items.map(i => `  <entry>
    <title>${escXml(i.title)}</title>
    <link href="${i.url}" />
    <id>${i.guid}</id>
    <updated>${i.isoDate}</updated>
    <published>${i.isoDate}</published>
    <summary>${escXml(i.excerpt || i.title)}</summary>${i.category ? `
    <category term="${escXml(i.category)}" />` : ''}
  </entry>`).join('\n')}
</feed>
`;

fs.writeFileSync(path.join(PUB_DIR, 'feed.xml'), rss);
fs.writeFileSync(path.join(PUB_DIR, 'atom.xml'), atom);
console.log(`Generated feed.xml + atom.xml with ${items.length} items`);
