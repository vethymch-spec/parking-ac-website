/**
 * Extract blog post data from BlogPost.tsx and BlogList.tsx into JSON files
 * This reduces the JS bundle by ~800KB by moving content to static JSON files
 * that are loaded on-demand via fetch()
 */
import fs from 'fs';
import path from 'path';

const BLOG_POST_FILE = 'client/src/pages/BlogPost.tsx';
const BLOG_LIST_FILE = 'client/src/pages/BlogList.tsx';

// ===== Extract BlogPost data =====
const blogPostSrc = fs.readFileSync(BLOG_POST_FILE, 'utf8');

// Find the data object between type definition and export
const typeEnd = blogPostSrc.indexOf('}> = {');
const exportStart = blogPostSrc.indexOf('export default function BlogPost()');

if (typeEnd === -1 || exportStart === -1) {
  console.error('Could not find BlogPost data markers');
  process.exit(1);
}

// Extract the JS object literal
const objStart = typeEnd + 5; // '}> = {'  -> start at '{'
const objStr = blogPostSrc.substring(objStart, exportStart).trim();

// We need to evaluate this as JS to get the data
// Write a temporary file that exports the data
const tempFile = '/tmp/blog-data-extract.mjs';
fs.writeFileSync(tempFile, `
const posts = ${objStr}
export default posts;
`);

const postsModule = await import(tempFile);
const posts = postsModule.default;

const slugs = Object.keys(posts);
console.log(`Extracted ${slugs.length} blog posts from BlogPost.tsx`);

// Create output directory
const outDir = 'client/public/data/blog';
fs.mkdirSync(outDir, { recursive: true });

// Write individual post files for on-demand loading
for (const slug of slugs) {
  const post = posts[slug];
  fs.writeFileSync(
    path.join(outDir, `${slug}.json`),
    JSON.stringify(post)
  );
}
console.log(`Written ${slugs.length} individual post JSON files`);

// Write a manifest with metadata (no content) for BlogList
const manifest = slugs.map(slug => ({
  slug,
  title: posts[slug].title,
  date: posts[slug].date,
  category: posts[slug].category,
  image: posts[slug].image,
  imageAlt: posts[slug].imageAlt,
  excerpt: posts[slug].metaDescription,
}));
fs.writeFileSync(
  path.join(outDir, 'manifest.json'),
  JSON.stringify(manifest)
);
console.log('Written blog manifest.json');

// ===== Extract BlogList data =====
const blogListSrc = fs.readFileSync(BLOG_LIST_FILE, 'utf8');
const allPostsStart = blogListSrc.indexOf('const allPosts = [');
const allPostsEnd = blogListSrc.indexOf('];\n\nconst categories');

if (allPostsStart === -1 || allPostsEnd === -1) {
  console.error('Could not find BlogList data markers');
  process.exit(1);
}

const listArrayStr = blogListSrc.substring(
  allPostsStart + 'const allPosts = '.length,
  allPostsEnd + 1
);

const tempFile2 = '/tmp/blog-list-extract.mjs';
fs.writeFileSync(tempFile2, `
const allPosts = ${listArrayStr};
export default allPosts;
`);

const listModule = await import(tempFile2);
const allPosts = listModule.default;
console.log(`Extracted ${allPosts.length} blog list entries from BlogList.tsx`);

// Write blog list data (this is the same as manifest but from BlogList perspective)
fs.writeFileSync(
  path.join(outDir, 'list.json'),
  JSON.stringify(allPosts)
);
console.log('Written blog list.json');

// Summary
const totalSize = slugs.reduce((acc, slug) => {
  const stat = fs.statSync(path.join(outDir, `${slug}.json`));
  return acc + stat.size;
}, 0);
const manifestSize = fs.statSync(path.join(outDir, 'manifest.json')).size;
const listSize = fs.statSync(path.join(outDir, 'list.json')).size;

console.log(`\nTotal individual posts: ${(totalSize / 1024).toFixed(1)} KB`);
console.log(`Manifest: ${(manifestSize / 1024).toFixed(1)} KB`);
console.log(`List: ${(listSize / 1024).toFixed(1)} KB`);
console.log(`Grand total: ${((totalSize + manifestSize + listSize) / 1024).toFixed(1)} KB`);

// Clean up temp files
fs.unlinkSync(tempFile);
fs.unlinkSync(tempFile2);
