#!/usr/bin/env node
/**
 * Inject contextual internal links into blog article body text.
 * Links product mentions to product pages + links topic mentions to related articles.
 * Safe: only adds 2-4 links per article, natural anchor text, no over-optimization.
 * 
 * Usage: node scripts/inject-internal-links.mjs
 */
import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.resolve('client/public/data/blog');
const MAX_LINKS_PER_ARTICLE = 4;
const MAX_PRODUCT_LINKS = 2;
const MAX_ARTICLE_LINKS = 2;

// Product link targets — anchor text → URL
const productLinks = [
  { patterns: ['VS02 PRO', 'VS02PRO', 'top-mounted parking', 'top mounted AC', 'rooftop parking AC'], url: '/products/top-mounted-ac', anchor: 'VS02 PRO Top-Mounted AC' },
  { patterns: ['VX3000SP', 'VX3000', 'mini split', 'mini-split AC', 'split system'], url: '/products/mini-split-ac', anchor: 'VX3000SP Mini Split' },
  { patterns: ['V-TH1', 'heating and cooling', 'heat pump parking'], url: '/products/heating-cooling-ac', anchor: 'V-TH1 Heating & Cooling' },
  { patterns: ['Nano Max', 'NanoMax', 'nano max'], url: '/products/nano-max', anchor: 'Nano Max' },
];

// Topic → article slug mappings for cross-linking
const topicLinks = [
  { patterns: ['anti-idling', 'anti idling', 'no-idle', 'idle law', 'idling regulation'], slug: 'no-idle-ac-anti-idling-laws' },
  { patterns: ['12V vs 24V', '12v or 24v', '12 volt vs 24 volt'], slug: '12v-vs-24v-parking-ac' },
  { patterns: ['solar charging', 'solar panel', 'MPPT controller', 'solar controller'], slug: 'mppt-solar-controller-rv-ac' },
  { patterns: ['LiFePO4', 'lithium battery', 'battery bank'], slug: 'lifepo4-battery-parking-ac' },
  { patterns: ['BTU rating', 'BTU sizing', 'how many BTU', 'cooling capacity'], slug: 'parking-ac-buying-guide-2025' },
  { patterns: ['installation cost', 'install cost', 'installation price'], slug: 'parking-ac-installation-cost' },
  { patterns: ['fuel savings', 'fuel cost', 'save fuel', 'fuel calculator'], slug: 'parking-ac-fuel-savings-calculator' },
  { patterns: ['inverter technology', 'inverter compressor', 'variable speed'], slug: 'parking-ac-inverter-technology' },
  { patterns: ['fleet management', 'fleet operation', 'fleet manager'], slug: 'parking-ac-fleet-management' },
  { patterns: ['DIY install', 'self install', 'install yourself'], slug: 'parking-ac-diy-installation' },
  { patterns: ['dual rotary compressor', 'twin rotary'], slug: 'dual-rotary-compressor-explained' },
  { patterns: ['off-grid', 'off grid', 'boondocking'], slug: 'off-grid-rv-air-conditioning' },
  { patterns: ['extreme heat', 'high temperature', 'desert heat'], slug: 'parking-ac-in-extreme-heat' },
  { patterns: ['carbon footprint', 'emissions reduction', 'eco-friendly'], slug: 'parking-ac-carbon-footprint' },
];

// Load list.json for article titles
const listPath = path.join(BLOG_DIR, 'list.json');
const articleList = JSON.parse(fs.readFileSync(listPath, 'utf8'));
const titleBySlug = new Map(articleList.map(a => [a.slug, a.title]));

// Process each article
const files = fs.readdirSync(BLOG_DIR).filter(f => 
  f.endsWith('.json') && !['list.json', 'manifest.json', 'related-posts.json', 'locale-availability.json'].includes(f)
);

let totalLinksAdded = 0;
let articlesModified = 0;

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  const slug = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.content || !Array.isArray(data.content)) continue;
  
  let linksAdded = 0;
  let productLinksAdded = 0;
  let articleLinksAdded = 0;
  const usedUrls = new Set();
  
  // Process content sections (skip first intro and last conclusion)
  for (let i = 1; i < data.content.length - 1 && linksAdded < MAX_LINKS_PER_ARTICLE; i++) {
    const section = data.content[i];
    if (typeof section === 'string') continue;
    if (!section.body) continue;
    
    let body = section.body;
    
    // Try product links first
    if (productLinksAdded < MAX_PRODUCT_LINKS) {
      for (const pl of productLinks) {
        if (linksAdded >= MAX_LINKS_PER_ARTICLE || productLinksAdded >= MAX_PRODUCT_LINKS) break;
        if (usedUrls.has(pl.url)) continue;
        
        for (const pattern of pl.patterns) {
          const idx = body.indexOf(pattern);
          if (idx !== -1) {
            // Check this exact match hasn't already been linked
            const before = body.substring(Math.max(0, idx - 30), idx);
            if (before.includes('[') || before.includes('](')) continue;
            
            body = body.substring(0, idx) + `[${pattern}](${pl.url})` + body.substring(idx + pattern.length);
            usedUrls.add(pl.url);
            linksAdded++;
            productLinksAdded++;
            break;
          }
        }
      }
    }
    
    // Try topic/article links
    if (articleLinksAdded < MAX_ARTICLE_LINKS) {
      for (const tl of topicLinks) {
        if (linksAdded >= MAX_LINKS_PER_ARTICLE || articleLinksAdded >= MAX_ARTICLE_LINKS) break;
        if (tl.slug === slug) continue; // Don't self-link
        const url = `/blog/${tl.slug}`;
        if (usedUrls.has(url)) continue;
        
        for (const pattern of tl.patterns) {
          const idx = body.indexOf(pattern);
          if (idx !== -1) {
            const before = body.substring(Math.max(0, idx - 30), idx);
            if (before.includes('[') || before.includes('](')) continue;
            
            body = body.substring(0, idx) + `[${pattern}](${url})` + body.substring(idx + pattern.length);
            usedUrls.add(url);
            linksAdded++;
            articleLinksAdded++;
            break;
          }
        }
      }
    }
    
    data.content[i].body = body;
  }
  
  if (linksAdded > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    totalLinksAdded += linksAdded;
    articlesModified++;
  }
}

console.log(`Internal links injected:`);
console.log(`  ${articlesModified}/${files.length} articles modified`);
console.log(`  ${totalLinksAdded} total links added (avg: ${(totalLinksAdded / Math.max(articlesModified, 1)).toFixed(1)} per article)`);
