import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import worker, {
  ENGLISH_ONLY_PAGE_PATHS,
  NON_ENGLISH_LOCALE_PREFIXES,
} from '../workers/pages-worker.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST_ROOT = path.join(ROOT, 'dist', 'client');
const DOMAIN = 'https://cooldrivepro.com';
const PAGES = {
  '/vehicle-compatibility': 'Parking Air Conditioner Vehicle Compatibility Guide | CoolDrivePro',
  '/vehicle-compatibility/semi-truck-parking-ac': 'Semi Truck Parking Air Conditioner Compatibility | CoolDrivePro',
  '/vehicle-compatibility/rv-parking-ac': 'RV Parking Air Conditioner Compatibility | CoolDrivePro',
  '/vehicle-compatibility/12v-vs-24v-parking-ac': '12V vs 24V Parking Air Conditioner Compatibility | CoolDrivePro',
  '/dealer-guide/parking-ac-local-market-fitment': 'Parking AC Dealer Guide for Local Market Fitment | CoolDrivePro',
};
const SITEMAP_LANGUAGES = [
  'en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ar', 'hi', 'th', 'vi', 'id',
  'tr', 'pl', 'nl', 'sv', 'no', 'da', 'fi', 'el', 'cs', 'hu', 'ro', 'uk', 'he', 'ms',
];

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required build artifact: ${path.relative(ROOT, filePath)}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function pageOutputPath(pagePath, lang = 'en') {
  const segments = pagePath.split('/').filter(Boolean);
  return path.join(DIST_ROOT, ...(lang === 'en' ? [] : [lang]), ...segments, 'index.html');
}

function documentHead(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  if (!head) {
    throw new Error('Missing document head');
  }
  return head.replace(/<!--[\s\S]*?-->/g, '');
}

function linkTags(html) {
  return [...documentHead(html).matchAll(/<link\b(?:[^>"']+|"[^"]*"|'[^']*')*>/gi)].map(([tag]) => tag);
}

function attributes(tag) {
  const values = new Map();
  const source = tag.slice(5, -1);
  for (const match of source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    values.set(name.toLowerCase(), doubleQuoted ?? singleQuoted ?? unquoted ?? '');
  }
  return values;
}

function hasRelation(values, relation) {
  return values.get('rel')?.toLowerCase().split(/\s+/).includes(relation) ?? false;
}

function alternateLinks(html) {
  return linkTags(html)
    .map((tag) => attributes(tag))
    .filter((values) => hasRelation(values, 'alternate'))
    .map((values) => ({
      language: values.get('hreflang')?.toLowerCase(),
      href: values.get('href'),
    }))
    .filter(({ language, href }) => language && href);
}

function canonicalLinks(html) {
  return linkTags(html)
    .map((tag) => attributes(tag))
    .filter((values) => hasRelation(values, 'canonical'))
    .map((values) => values.get('href'));
}

function runtimeTitle(title) {
  return title.replace(/ \| CoolDrivePro$/, '');
}

function pageConfigTitle(source, pagePath) {
  const pathMarker = `path: "${pagePath}",`;
  const start = source.indexOf(pathMarker);
  if (start === -1) {
    return undefined;
  }
  const nextConfig = source.indexOf('\n  "/', start + pathMarker.length);
  const block = source.slice(start, nextConfig === -1 ? undefined : nextConfig);
  return block.match(/\n\s+title:\s+"([^"]+)",/)?.[1];
}

function applicationRoutePaths(source) {
  return new Set(
    [...source.matchAll(/<Route\b[^>]*\bpath=(?:"([^"]+)"|'([^']+)')/g)]
      .map(([, doubleQuotedPath, singleQuotedPath]) => doubleQuotedPath ?? singleQuotedPath),
  );
}

function sitemapIndexFiles(xml) {
  return new Set(
    [...xml.matchAll(/<loc>\s*https:\/\/cooldrivepro\.com\/(sitemap-[^<]+\.xml)\s*<\/loc>/gi)]
      .map(([, fileName]) => fileName),
  );
}

function sitemapLocations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(([, location]) => location);
}

function sameSet(actual, expected) {
  return actual.size === expected.size && [...expected].every((value) => actual.has(value));
}

function localizedPath(pagePath, language) {
  return language === 'en' ? pagePath : `/${language}${pagePath}`;
}

function isCompatibilityPageLocation(location, pagePath) {
  try {
    const url = new URL(location);
    if (url.origin !== DOMAIN) {
      return false;
    }
    const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
    return SITEMAP_LANGUAGES.some((language) => normalizedPath === localizedPath(pagePath, language));
  } catch {
    return false;
  }
}

async function verifyEnglishOnlyWorkerRedirects() {
  const assetRequests = [];
  const assets = {
    fetch: async (request) => {
      assetRequests.push(request.url);
      return new Response('asset', { status: 418 });
    },
  };

  async function request(source) {
    return worker.fetch(new Request(source), { ASSETS: assets });
  }

  async function assertRedirect(source, expected) {
    const response = await request(source);
    if (response.status !== 301 || response.headers.get('location') !== expected) {
      throw new Error(`Worker redirect mismatch for ${source}`);
    }
  }

  async function assertPassThrough(source, expectedAssetUrl = source) {
    const requestsBefore = assetRequests.length;
    const response = await request(source);
    if (response.status !== 418 || assetRequests.length !== requestsBefore + 1
      || assetRequests.at(-1) !== expectedAssetUrl) {
      throw new Error(`Worker should pass through ${source}`);
    }
  }

  for (const language of NON_ENGLISH_LOCALE_PREFIXES) {
    for (const pagePath of ENGLISH_ONLY_PAGE_PATHS) {
      const source = `${DOMAIN}/${language}${pagePath}?verify=locale`;
      const expected = `${DOMAIN}${pagePath}/?verify=locale`;
      await assertRedirect(source, expected);
    }
  }

  for (const pagePath of ENGLISH_ONLY_PAGE_PATHS) {
    await assertPassThrough(`${DOMAIN}${pagePath}/?verify=english`);
  }

  await assertPassThrough(`${DOMAIN}/de/vehicle-compatibility/not-a-real-page/?verify=unknown`);
  await assertPassThrough(`${DOMAIN}/fr/dealer-guide/not-a-real-page/?verify=unknown`);
  await assertPassThrough(`${DOMAIN}/xx/vehicle-compatibility/?verify=unknown-locale`);

  await assertRedirect(
    `https://www.cooldrivepro.com/de/vehicle-compatibility/?verify=www`,
    `${DOMAIN}/de/vehicle-compatibility/?verify=www`,
  );

  const assetRequestsBeforeCheckout = assetRequests.length;
  const checkoutResponse = await request(`${DOMAIN}/api/create-checkout-session`);
  if (checkoutResponse.status !== 405 || assetRequests.length !== assetRequestsBeforeCheckout) {
    throw new Error('Worker checkout route must remain ahead of static assets');
  }

  await assertRedirect(
    `${DOMAIN}/de/blog/parking-ac-noise-levels?verify=legacy`,
    `${DOMAIN}/de/blog/parking-ac-noise-comparison-db-tested/?verify=legacy`,
  );

  await assertPassThrough(
    `${DOMAIN}/vehicle-compatibility.html?verify=html`,
    `${DOMAIN}/vehicle-compatibility?verify=html`,
  );
}

const meta = JSON.parse(readFile(path.join(ROOT, 'scripts', 'static-meta.json')));
const appSource = readFile(path.join(ROOT, 'client', 'src', 'App.tsx'));
const compatibilityPageSource = readFile(path.join(ROOT, 'client', 'src', 'pages', 'VehicleCompatibilityPage.tsx'));
const expectedSitemapFiles = new Set(SITEMAP_LANGUAGES.map((language) => `sitemap-${language}.xml`));
const indexedSitemapFiles = sitemapIndexFiles(readFile(path.join(DIST_ROOT, 'sitemap.xml')));
if (!sameSet(indexedSitemapFiles, expectedSitemapFiles)) {
  throw new Error('Deployment sitemap index must contain the complete language sitemap set');
}
const sitemapsByLanguage = new Map(
  SITEMAP_LANGUAGES.map((language) => [
    language,
    readFile(path.join(DIST_ROOT, `sitemap-${language}.xml`)),
  ]),
);
const englishSitemap = sitemapsByLanguage.get('en');
const routePaths = applicationRoutePaths(appSource);
const expectedRoutePaths = new Set(Object.keys(PAGES).flatMap((pagePath) => [pagePath, `${pagePath}/`]));
const expectedEnglishOnlyPaths = new Set(Object.keys(PAGES));
const expectedNonEnglishLocales = new Set(SITEMAP_LANGUAGES.filter((language) => language !== 'en'));
const relevantRoutePaths = new Set(
  [...routePaths].filter((routePath) => routePath === '/vehicle-compatibility'
    || routePath.startsWith('/vehicle-compatibility/')
    || routePath === '/dealer-guide'
    || routePath.startsWith('/dealer-guide/')),
);

if (!sameSet(relevantRoutePaths, expectedRoutePaths)) {
  throw new Error('Vehicle compatibility routes must remain explicit and complete');
}
if (expectedEnglishOnlyPaths.size !== 5
  || expectedNonEnglishLocales.size !== 29
  || !sameSet(ENGLISH_ONLY_PAGE_PATHS, expectedEnglishOnlyPaths)
  || !sameSet(NON_ENGLISH_LOCALE_PREFIXES, expectedNonEnglishLocales)) {
  throw new Error('Worker English-only page and locale contracts must remain exact');
}
if (!compatibilityPageSource.includes('canonical: `${BASE_URL}${page.path}/`,')
  || !compatibilityPageSource.includes('alternateLanguages: ["en"],')
  || !compatibilityPageSource.includes('title: `${page.title} | CoolDrivePro`,')) {
  throw new Error('Vehicle compatibility runtime SEO must use the English canonical and hreflang contract');
}

for (const [pagePath, title] of Object.entries(PAGES)) {
  const pageMeta = meta[pagePath]?.en;
  if (pageMeta?.langs?.join(',') !== 'en') {
    throw new Error(`Expected ${pagePath} to be English-only in static metadata`);
  }

  if (pageConfigTitle(compatibilityPageSource, pagePath) !== runtimeTitle(title)) {
    throw new Error(`Runtime title mismatch for ${pagePath}`);
  }

  const url = `${DOMAIN}${pagePath}/`;
  const html = readFile(pageOutputPath(pagePath));
  if (!html.includes(`<title>${title}</title>`)) {
    throw new Error(`Static title mismatch for ${pagePath}`);
  }
  const canonicals = canonicalLinks(html);
  if (canonicals.length !== 1 || canonicals[0] !== url) {
    throw new Error(`Canonical mismatch for ${pagePath}`);
  }

  const alternates = alternateLinks(html);
  const languages = alternates.map(({ language }) => language).sort().join(',');
  if (alternates.length !== 2
    || languages !== 'en,x-default'
    || alternates.some(({ href }) => href !== url)) {
    throw new Error(`Hreflang mismatch for ${pagePath}`);
  }
  if (!englishSitemap?.includes(`<loc>${url}</loc>`)) {
    throw new Error(`English sitemap is missing ${pagePath}`);
  }

  for (const language of SITEMAP_LANGUAGES) {
    if (language === 'en') {
      continue;
    }
    const sitemap = sitemapsByLanguage.get(language);
    if (sitemapLocations(sitemap).some((location) => isCompatibilityPageLocation(location, pagePath))) {
      throw new Error(`sitemap-${language}.xml contains a compatibility page entry for ${pagePath}`);
    }
    if (fs.existsSync(pageOutputPath(pagePath, language))) {
      throw new Error(`False localized static output exists for ${pagePath}: ${language}`);
    }
  }
}

await verifyEnglishOnlyWorkerRedirects();
console.log(`Verified ${Object.keys(PAGES).length} English-only compatibility pages.`);