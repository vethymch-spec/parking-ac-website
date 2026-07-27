/**
 * IndexNow ping — submit URLs to Bing/Yandex/Seznam in one call.
 *
 * Usage:
 *   node scripts/indexnow.mjs                 # submit all static + blog URLs (English canonical only)
 *   node scripts/indexnow.mjs <url> <url> ... # submit specific URLs
 *
 * Key file must exist at https://cooldrivepro.com/<KEY>.txt with KEY as content.
 * Docs: https://www.indexnow.org/documentation
 */
import fs from 'fs';
import path from 'path';

const HOST = 'cooldrivepro.com';
const DOMAIN = `https://${HOST}`;
const KEY = '78ca27ecba77d80d7912fb45022990be';
const KEY_LOCATION = `${DOMAIN}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

const STATIC = [
  '/', '/products', '/products/top-mounted-ac', '/products/mini-split-ac',
  '/products/heating-cooling-ac', '/products/nano-max',
  '/vehicle-compatibility', '/vehicle-compatibility/semi-truck-parking-ac',
  '/vehicle-compatibility/rv-parking-ac', '/vehicle-compatibility/12v-vs-24v-parking-ac',
  '/dealer-guide/parking-ac-local-market-fitment',
  '/about', '/contact', '/blog', '/support',
  '/warranty', '/return-policy', '/shipping-policy', '/privacy-policy',
  '/terms-of-service', '/payment-method', '/billing-terms',
];

function blogUrls() {
  const dir = path.resolve('client/public/data/blog');
  if (!fs.existsSync(dir)) return [];
  const skip = new Set(['list.json','manifest.json','related-posts.json','locale-availability.json']);
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && !skip.has(f))
    .map(f => `/blog/${f.replace(/\.json$/, '')}`);
}

const args = process.argv.slice(2);
const paths = args.length ? args : [...STATIC, ...blogUrls()];
const urlList = paths.map(p => p.startsWith('http') ? p : `${DOMAIN}${p}`);

console.log(`Submitting ${urlList.length} URLs to IndexNow...`);

const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

const txt = await res.text().catch(() => '');
console.log(`HTTP ${res.status} ${res.statusText}`);
if (txt) console.log(txt.slice(0, 500));
if (!res.ok && res.status !== 202) process.exit(1);

// --- Bonus: also ping search-engine sitemap endpoints + WebSub hub ---
const SITEMAP = `${DOMAIN}/sitemap.xml`;
const FEED = `${DOMAIN}/feed.xml`;

const pings = [
  // Bing sitemap submission (legacy but still works)
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
  // Yandex sitemap (works via webmaster.yandex)
  `https://blogs.yandex.ru/pings/?status=success&url=${encodeURIComponent(DOMAIN)}`,
  // WebSub (PubSubHubbub) — instant feed propagation to Feedly/Inoreader/Google subscribers
  // POST to hub with hub.mode=publish + hub.url=feed
];

await Promise.allSettled(pings.map(async (url) => {
  try {
    const r = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
    console.log(`Pinged: ${new URL(url).hostname} → ${r.status}`);
  } catch (e) {
    console.log(`Ping skipped: ${url.slice(0, 50)} (${e.message})`);
  }
}));

// WebSub hub publish
try {
  const hubRes = await fetch('https://pubsubhubbub.appspot.com/', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `hub.mode=publish&hub.url=${encodeURIComponent(FEED)}`,
    signal: AbortSignal.timeout(5000),
  });
  console.log(`WebSub hub publish: ${hubRes.status}`);
} catch (e) {
  console.log(`WebSub skipped: ${e.message}`);
}

