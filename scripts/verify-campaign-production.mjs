#!/usr/bin/env node
/**
 * Verify a promoted campaign batch against its deployed HTML and sitemap.
 *
 * Usage:
 *   node scripts/verify-campaign-production.mjs --run=<campaign>-day-<n> --slugs=slug-a,slug-b
 *   node scripts/verify-campaign-production.mjs --run=<campaign>-day-<n> --base-url=https://preview.pages.dev
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const STAGING_DIR = path.join(ROOT, '.omc', 'content-pipeline', 'staging');
const DEFAULT_BASE_URL = 'https://cooldrivepro.com';
const REQUEST_TIMEOUT_MS = 20000;

const args = process.argv.slice(2);
const getArg = (name, fallback = '') => {
  const value = args.find((arg) => arg.startsWith(`--${name}=`));
  return value ? value.slice(name.length + 3) : fallback;
};

const runId = getArg('run');
const requestedSlugs = getArg('slugs')
  .split(',')
  .map((slug) => slug.trim())
  .filter(Boolean);
const baseUrl = getArg('base-url', DEFAULT_BASE_URL).replace(/\/$/, '');
const outputPath = getArg('output');
const checkWww = !args.includes('--skip-www') && baseUrl === DEFAULT_BASE_URL;

if (!runId) throw new Error('Pass --run=<campaign>-day-<n>.');
if (!/^https:\/\/[a-z0-9.-]+$/i.test(baseUrl)) throw new Error('--base-url must be an HTTPS origin without a path.');

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read ${label}: ${error.message}`);
  }
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function isSafeSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function htmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function expectedSlugs(runDir) {
  const resultsPath = path.join(runDir, 'writer-results.json');
  const results = fs.existsSync(resultsPath) ? readJson(resultsPath, 'writer results') : { results: [] };
  return (results.results || [])
    .filter((result) => ['draft_ready', 'url_verified'].includes(result.status))
    .map((result) => result.slug)
    .filter(isSafeSlug);
}

async function request(url, options = {}) {
  return fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      'user-agent': 'CoolDrivePro Campaign Production Verifier',
      ...options.headers,
    },
    ...options,
  });
}

function canonicalFor(slug) {
  return `${DEFAULT_BASE_URL}/blog/${slug}/`;
}

function pageUrlFor(slug) {
  return `${baseUrl}/blog/${slug}/`;
}

async function verifyImage(article) {
  if (!article.image) return { ok: false, error: 'article does not define a hero image' };
  const imageUrl = new URL(article.image, `${baseUrl}/`).href;
  try {
    let response = await request(imageUrl, { method: 'HEAD' });
    if (response.status === 405) response = await request(imageUrl, { method: 'GET' });
    if (response.status < 200 || response.status >= 300) {
      return { ok: false, error: `${imageUrl} returned ${response.status}` };
    }
    return { ok: true, url: imageUrl, status: response.status };
  } catch (error) {
    return { ok: false, error: `${imageUrl} failed with ${error.message}` };
  }
}

function pageChecks(html, article, slug) {
  const errors = [];
  const expectedCanonical = canonicalFor(slug);
  const expectedTitle = `${article.title} | CoolDrivePro`;
  const expectedDescription = htmlEscape(article.metaDescription);

  if (!html.includes(`<link rel="canonical" href="${expectedCanonical}"`)) {
    errors.push(`missing canonical ${expectedCanonical}`);
  }
  if (!html.includes(`<title>${htmlEscape(expectedTitle)}</title>`)) {
    errors.push('title does not match the staging draft');
  }
  if (!html.includes(`name="description" content="${expectedDescription}"`)) {
    errors.push('meta description does not match the staging draft');
  }
  if (!html.includes('"@type":"BlogPosting"')) errors.push('missing BlogPosting JSON-LD');
  if (/name="robots"[^>]+content="[^"]*noindex/i.test(html)) errors.push('unexpected noindex directive');

  for (const source of article.sources || []) {
    if (source.url && !html.includes(source.url)) errors.push(`source citation missing from HTML: ${source.url}`);
  }
  return errors;
}

async function verifyWwwRedirect(slug) {
  const url = `https://www.cooldrivepro.com/blog/${slug}/`;
  try {
    const response = await request(url);
    const location = response.headers.get('location');
    const resolved = location ? new URL(location, url).href.replace(/\/$/, '') : null;
    const expected = canonicalFor(slug);
    if (response.status < 300 || response.status >= 400 || resolved !== expected) {
      return { ok: false, error: `${url} returned ${response.status}${resolved ? ` -> ${resolved}` : ''}` };
    }
    return { ok: true, status: response.status, location: resolved };
  } catch (error) {
    return { ok: false, error: `${url} failed with ${error.message}` };
  }
}

async function verifyPage(slug, article, sitemap) {
  const url = pageUrlFor(slug);
  const result = { slug, url, errors: [] };
  try {
    const response = await request(url);
    result.status = response.status;
    if (response.status < 200 || response.status >= 300) {
      result.errors.push(`${url} returned ${response.status}`);
      return result;
    }
    const html = await response.text();
    result.errors.push(...pageChecks(html, article, slug));
  } catch (error) {
    result.errors.push(`${url} failed with ${error.message}`);
  }

  if (!sitemap.includes(`<loc>${canonicalFor(slug)}</loc>`)) {
    result.errors.push(`sitemap does not include ${canonicalFor(slug)}`);
  }

  const image = await verifyImage(article);
  result.image = image;
  if (!image.ok) result.errors.push(`hero image verification failed: ${image.error}`);

  if (checkWww) {
    result.www = await verifyWwwRedirect(slug);
    if (!result.www.ok) result.errors.push(`www redirect verification failed: ${result.www.error}`);
  }
  return result;
}

async function main() {
  const runDir = path.join(STAGING_DIR, runId);
  if (!fs.existsSync(runDir)) throw new Error(`Staging run does not exist: ${path.relative(ROOT, runDir)}`);
  const slugs = requestedSlugs.length ? requestedSlugs : expectedSlugs(runDir);
  if (slugs.length === 0) throw new Error('No draft_ready or url_verified slugs were found.');
  for (const slug of slugs) if (!isSafeSlug(slug)) throw new Error(`Unsafe slug: ${slug}`);

  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const sitemapResponse = await request(sitemapUrl);
  if (sitemapResponse.status < 200 || sitemapResponse.status >= 300) {
    throw new Error(`${sitemapUrl} returned ${sitemapResponse.status}`);
  }
  const sitemap = await sitemapResponse.text();
  const results = [];

  for (const slug of slugs) {
    const draftPath = path.join(runDir, 'drafts', `${slug}.json`);
    if (!fs.existsSync(draftPath)) {
      results.push({ slug, errors: [`staging draft is missing: ${path.relative(ROOT, draftPath)}`] });
      continue;
    }
    results.push(await verifyPage(slug, readJson(draftPath, `staging draft ${slug}`), sitemap));
  }

  const payload = {
    runId,
    baseUrl,
    verifiedAt: new Date().toISOString(),
    passed: results.every((result) => result.errors.length === 0),
    results,
  };
  if (outputPath) writeJson(path.resolve(ROOT, outputPath), payload);
  for (const result of results) {
    console.log(`${result.errors.length === 0 ? 'PASS' : 'FAIL'} ${result.slug}${result.status ? ` (${result.status})` : ''}`);
    for (const error of result.errors) console.log(`  - ${error}`);
  }
  if (!payload.passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Campaign production verification failed: ${error.message}`);
  process.exitCode = 1;
});