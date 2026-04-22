#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing, Yandex, Naver, Seznam, Yep).
 *
 * Usage:
 *   node scripts/indexnow-submit.mjs                # submit all blog + sitemap URLs
 *   node scripts/indexnow-submit.mjs --updated-only # only URLs whose JSON was modified < 7 days ago
 *   node scripts/indexnow-submit.mjs --url=https://cooldrivepro.com/blog/foo
 *
 * Setup: place {KEY}.txt in client/public/ before running.
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = 'f32965d125afdc1e96d9a0aafa0b300c';
const HOST = 'cooldrivepro.com';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);
const updatedOnly = args.includes('--updated-only');
const singleUrl = (args.find(a => a.startsWith('--url=')) || '').split('=')[1];
const dryRun = args.includes('--dry');

function collectBlogUrls() {
  const blogDir = path.resolve('client/public/data/blog');
  const files = fs.readdirSync(blogDir).filter(f =>
    f.endsWith('.json') &&
    !['list.json', 'manifest.json', 'related-posts.json', 'locale-availability.json'].includes(f)
  );
  const urls = [];
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const f of files) {
    const slug = f.replace(/\.json$/, '');
    const fullPath = path.join(blogDir, f);
    if (updatedOnly) {
      try {
        const mt = fs.statSync(fullPath).mtimeMs;
        if (mt < cutoff) continue;
      } catch { continue; }
    }
    urls.push(`https://${HOST}/blog/${slug}`);
  }
  return urls;
}

function collectStaticUrls() {
  return [
    `https://${HOST}/`,
    `https://${HOST}/products`,
    `https://${HOST}/products/top-mounted-ac`,
    `https://${HOST}/products/mini-split-ac`,
    `https://${HOST}/products/heating-cooling-ac`,
    `https://${HOST}/products/nano-max`,
    `https://${HOST}/blog`,
    `https://${HOST}/about`,
    `https://${HOST}/contact`,
    `https://${HOST}/sitemap.xml`,
  ];
}

async function submit(urls) {
  // IndexNow accepts up to 10000 URLs per call, but recommend ≤ 10000. We'll chunk by 1000 to be safe.
  const CHUNK = 1000;
  for (let i = 0; i < urls.length; i += CHUNK) {
    const batch = urls.slice(i, i + CHUNK);
    const body = {
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch,
    };
    if (dryRun) {
      console.log(`[DRY] Would submit ${batch.length} URLs (sample: ${batch.slice(0, 3).join(', ')}...)`);
      continue;
    }
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    const txt = await res.text();
    console.log(`Batch ${Math.floor(i / CHUNK) + 1}: ${res.status} ${res.statusText} ${txt.slice(0, 100)}`);
    // Throttle a bit between batches
    if (i + CHUNK < urls.length) await new Promise(r => setTimeout(r, 1000));
  }
}

async function main() {
  // Verify key file exists
  const keyPath = path.resolve(`client/public/${KEY}.txt`);
  if (!fs.existsSync(keyPath)) {
    console.error(`ERROR: key file missing at ${keyPath}`);
    process.exit(1);
  }

  let urls;
  if (singleUrl) {
    urls = [singleUrl];
  } else {
    urls = [...collectStaticUrls(), ...collectBlogUrls()];
  }

  console.log(`Submitting ${urls.length} URLs to IndexNow (key=${KEY.slice(0, 8)}..., updatedOnly=${updatedOnly})\n`);
  await submit(urls);
  console.log('\nDone. Bing, Yandex, Naver, Seznam, Yep should pick up changes within minutes.');
}

main().catch(e => { console.error(e); process.exit(1); });
