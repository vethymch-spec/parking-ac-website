#!/usr/bin/env node
/**
 * Generate related posts for each blog article based on category + keyword overlap.
 * Writes a single `related-posts.json` map: { [slug]: string[] }
 * 
 * Usage: node scripts/generate-related-posts.mjs
 */
import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.resolve('client/public/data/blog');
const OUTPUT = path.join(BLOG_DIR, 'related-posts.json');
const MAX_RELATED = 5;

// Load all articles
const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.json') && f !== 'list.json' && f !== 'manifest.json' && f !== 'related-posts.json' && f !== 'locale-availability.json');

const articles = files.map(f => {
  const data = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, f), 'utf8'));
  const slug = f.replace('.json', '');
  // Extract keywords from title + headings
  const headings = (data.content || [])
    .filter(s => typeof s === 'object' && s.heading)
    .map(s => s.heading.toLowerCase());
  const titleWords = new Set(
    data.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
  );
  const headingWords = new Set(
    headings.join(' ')
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
  );
  return {
    slug,
    title: data.title,
    category: data.category || '',
    titleWords,
    headingWords,
    allWords: new Set([...titleWords, ...headingWords])
  };
});

// Compute similarity between two articles
function similarity(a, b) {
  if (a.slug === b.slug) return -1;
  let score = 0;
  
  // Same category: +3
  if (a.category && a.category === b.category) score += 3;
  
  // Title word overlap (most important)
  for (const w of a.titleWords) {
    if (b.titleWords.has(w)) score += 2;
  }
  
  // Heading word overlap
  for (const w of a.headingWords) {
    if (b.allWords.has(w)) score += 0.5;
  }
  
  return score;
}

// Generate related posts map
const relatedMap = {};
for (const article of articles) {
  const scored = articles
    .map(other => ({ slug: other.slug, score: similarity(article, other) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RELATED)
    .map(x => x.slug);
  
  // If not enough related by similarity, fill with same category
  if (scored.length < MAX_RELATED) {
    const sameCategory = articles
      .filter(a => a.slug !== article.slug && a.category === article.category && !scored.includes(a.slug))
      .slice(0, MAX_RELATED - scored.length)
      .map(a => a.slug);
    scored.push(...sameCategory);
  }
  
  relatedMap[article.slug] = scored.slice(0, MAX_RELATED);
}

fs.writeFileSync(OUTPUT, JSON.stringify(relatedMap, null, 2));
console.log(`Generated related posts for ${Object.keys(relatedMap).length} articles → ${OUTPUT}`);

// Stats
const withRelated = Object.values(relatedMap).filter(v => v.length > 0).length;
const avgRelated = Object.values(relatedMap).reduce((s, v) => s + v.length, 0) / Object.keys(relatedMap).length;
console.log(`  ${withRelated}/${Object.keys(relatedMap).length} articles have related posts (avg: ${avgRelated.toFixed(1)})`);
