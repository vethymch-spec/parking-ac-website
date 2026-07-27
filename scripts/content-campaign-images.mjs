#!/usr/bin/env node
/**
 * Generate provenance-tracked AI hero images for staging campaign drafts.
 *
 * This script never writes client/public/data/blog, a CDN repository, or Git.
 * Promotion copies only a hash-verified staging asset into public images.
 *
 * Usage:
 *   node scripts/content-campaign-images.mjs --dry --run=<campaign>-day-<n>
 *   GEMINI_API_KEY=... node scripts/content-campaign-images.mjs --write --run=<campaign>-day-<n> --limit=10
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const STAGING_DIR = path.join(ROOT, '.omc', 'content-pipeline', 'staging');
const MODEL = process.env.CAMPAIGN_IMAGE_MODEL || 'gemini-2.5-flash-image';
const REQUEST_TIMEOUT_MS = 60000;

const args = process.argv.slice(2);
const getArg = (name, fallback = '') => {
  const value = args.find((arg) => arg.startsWith(`--${name}=`));
  return value ? value.slice(name.length + 3) : fallback;
};
const runId = getArg('run');
const writeMode = args.includes('--write');
const dryRun = args.includes('--dry') || !writeMode;
const force = args.includes('--force');
const limit = Number(getArg('limit', '100'));
const today = new Date().toISOString().slice(0, 10);

if (!runId) throw new Error('Pass --run=<campaign>-day-<n>.');
if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('--limit must be an integer from 1 to 100.');

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read ${label}: ${error.message}`);
  }
}

function atomicWrite(filePath, payload) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function isSafeSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function dateOffset(dateText, days) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function articleSubject(task) {
  const text = `${task.title} ${task.clusterId} ${task.primaryKeyword}`.toLowerCase();
  if (/semi|truck|sleeper|fleet|freight/.test(text)) return 'a parked heavy-duty truck sleeper cab with an unbranded rooftop parking air conditioner';
  if (/rv|motorhome|camper|caravan/.test(text)) return 'a modern camper van or compact RV parked in natural daylight with an unbranded rooftop air conditioner';
  if (/van|sprinter|transit|promaster|cargo/.test(text)) return 'a commercial van parked at a work site with an unbranded rooftop air conditioner';
  if (/solar|battery|power|electrical/.test(text)) return 'a vehicle auxiliary battery and rooftop solar planning scene with a compact vehicle air conditioner';
  if (/service|troubleshoot|maintenance|repair/.test(text)) return 'a qualified technician inspecting an unbranded vehicle air conditioner service panel';
  return 'a parked commercial vehicle with an unbranded rooftop parking air conditioner in a practical operating environment';
}

function buildPrompt(task) {
  return `Create one photorealistic editorial hero image for an English technical guide titled "${task.title}". `
    + `Scene: ${articleSubject(task)}. `
    + 'Use natural daylight, realistic materials, a documentary commercial-photography composition, and a 16:9 landscape frame. '
    + 'This is an illustrative planning image, not proof of a specific product specification or vehicle compatibility. '
    + 'Do not include words, letters, numbers, logos, trademarks, watermarks, signs, gauges, captions, UI overlays, or readable labels.';
}

function buildAlt(task) {
  return `Editorial illustration for ${task.primaryKeyword}: ${articleSubject(task)}.`;
}

async function generateImage(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!response.ok) throw new Error(`Gemini image generation returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const payload = await response.json();
  const imagePart = payload?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) throw new Error('Gemini response did not contain inline image data.');
  return {
    buffer: Buffer.from(imagePart.inlineData.data, 'base64'),
    mimeType: imagePart.inlineData.mimeType || 'image/png',
  };
}

async function writeWebp(buffer, outputPath) {
  const output = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 900, fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toBuffer();
  fs.writeFileSync(outputPath, output);
  const metadata = await sharp(output).metadata();
  return { bytes: output.length, width: metadata.width, height: metadata.height };
}

function readyTasks(runDir) {
  const manifest = readJson(path.join(runDir, 'manifest.json'), 'staging manifest');
  const resultsPath = path.join(runDir, 'writer-results.json');
  const results = fs.existsSync(resultsPath) ? readJson(resultsPath, 'writer results') : { results: [] };
  const readySlugs = new Set((results.results || []).filter((result) => result.status === 'draft_ready').map((result) => result.slug));
  return manifest.tasks.filter((task) => readySlugs.has(task.slug) && isSafeSlug(task.slug));
}

async function main() {
  const runDir = path.join(STAGING_DIR, runId);
  if (!fs.existsSync(runDir)) throw new Error(`Staging run does not exist: ${path.relative(ROOT, runDir)}`);
  const tasks = readyTasks(runDir).slice(0, limit);
  console.log(`Run: ${runId}`);
  console.log(`Mode: ${dryRun ? 'dry run' : 'write'}, model: ${MODEL}`);
  console.log(`Eligible drafts: ${tasks.length}`);
  if (tasks.length === 0) return;

  if (dryRun) {
    for (const task of tasks.slice(0, 8)) {
      const draftPath = path.join(runDir, 'drafts', `${task.slug}.json`);
      if (!fs.existsSync(draftPath)) throw new Error(`draft is missing: ${task.slug}`);
      console.log(`  READY ${task.slug}`);
    }
    console.log(`Gemini key configured: ${Boolean(process.env.GEMINI_API_KEY)}. No image request or draft mutation occurred.`);
    return;
  }

  const imagesDir = path.join(runDir, 'images');
  const resultsPath = path.join(runDir, 'image-results.json');
  const priorResults = fs.existsSync(resultsPath) ? readJson(resultsPath, 'image results') : { runId, results: [] };
  const resultsBySlug = new Map((priorResults.results || []).map((result) => [result.slug, result]));
  fs.mkdirSync(imagesDir, { recursive: true });

  for (const task of tasks) {
    const draftPath = path.join(runDir, 'drafts', `${task.slug}.json`);
    const article = readJson(draftPath, `staging draft ${task.slug}`);
    const priorResult = resultsBySlug.get(task.slug);
    if (article.imageProvenance?.type === 'ai' && !force) {
      console.log(`  SKIP ${task.slug}: already has an AI image provenance record`);
      continue;
    }
    if (!force && priorResult?.status === 'image_failed' && priorResult.retryNotBefore > today) {
      console.log(`  SKIP ${task.slug}: image retry is deferred until ${priorResult.retryNotBefore}`);
      continue;
    }
    const prompt = buildPrompt(task);
    const outputName = `${task.slug}-hero.webp`;
    const outputPath = path.join(imagesDir, outputName);
    try {
      console.log(`  GENERATE ${task.slug}`);
      const generated = await generateImage(prompt);
      const dimensions = await writeWebp(generated.buffer, outputPath);
      const localHash = hashFile(outputPath);
      const publicPath = `/images/campaign/${outputName}`;
      article.image = publicPath;
      article.imageAlt = buildAlt(task);
      article.imageWidth = dimensions.width;
      article.imageHeight = dimensions.height;
      article.imageProvenance = {
        type: 'ai',
        provider: 'Google Gemini',
        model: MODEL,
        prompt,
        generatedAt: new Date().toISOString(),
        sourceMimeType: generated.mimeType,
        stagedAssetPath: path.relative(ROOT, outputPath),
        publicPath,
        localHash,
        bytes: dimensions.bytes,
        usage: 'AI-generated illustrative editorial image; not product-specification evidence.',
        fallbackCompanyAsset: task.imagePlan.publicPath,
      };
      atomicWrite(draftPath, article);
      resultsBySlug.set(task.slug, {
        slug: task.slug,
        status: 'image_ready',
        publicPath,
        localHash,
        bytes: dimensions.bytes,
        width: dimensions.width,
        height: dimensions.height,
        generatedAt: article.imageProvenance.generatedAt,
      });
      console.log(`  READY ${task.slug}: ${dimensions.width}x${dimensions.height}, ${Math.round(dimensions.bytes / 1024)} KB`);
    } catch (error) {
      const attempts = (priorResult?.attempts || 0) + 1;
      const creditBlocked = /\b429\b|prepayment credits|resource_exhausted/i.test(error.message);
      const retryDays = creditBlocked ? 7 : 2 ** Math.min(attempts - 1, 3);
      resultsBySlug.set(task.slug, {
        slug: task.slug,
        status: 'image_failed',
        attempts,
        retryNotBefore: dateOffset(today, retryDays),
        error: error.message,
        updatedAt: today,
      });
      console.error(`  HOLD ${task.slug}: ${error.message}`);
    }
  }

  priorResults.updatedAt = new Date().toISOString();
  priorResults.results = [...resultsBySlug.values()].sort((left, right) => left.slug.localeCompare(right.slug));
  atomicWrite(resultsPath, priorResults);
}

main().catch((error) => {
  console.error(`Campaign image generation failed: ${error.message}`);
  process.exitCode = 1;
});