#!/usr/bin/env node
/**
 * Prepare one safe content-production batch for the active campaign.
 *
 * This controller never calls a model, writes a live blog JSON file, builds, or deploys.
 * Its sole responsibility is to reserve up to the campaign's daily cap after verifying
 * source provenance, existing URLs, internal links, and retry eligibility. Downstream
 * writer and publisher steps consume its immutable staging manifest.
 *
 * Usage:
 *   node scripts/content-campaign-run.mjs --dry --company-assets-only --no-ai-media --day=1
 *   node scripts/content-campaign-run.mjs --prepare --company-assets-only --no-ai-media
 *   node scripts/content-campaign-run.mjs --prepare --company-assets-only --no-ai-media --day=1 --check-remote
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { COMPANY_ASSET_CATALOG_VERSION, createCompanyImagePlan } from './content-campaign-assets.mjs';
import { acquireOwnedLock, isSafePipelineIdentifier, resolvePathWithin } from './content-campaign-runtime.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PIPELINE_DIR = path.join(ROOT, '.omc', 'content-pipeline');
const CAMPAIGN_DIR = path.join(PIPELINE_DIR, 'campaigns');
const STAGING_DIR = path.join(PIPELINE_DIR, 'staging');
const ACTIVE_CAMPAIGN_PATH = path.join(PIPELINE_DIR, 'active-campaign.json');
const SOURCE_CATALOG_PATH = path.join(__dirname, 'content-source-catalog.json');
const BLOG_DIR = path.join(ROOT, 'client', 'public', 'data', 'blog');
const ENGLISH_SITEMAP_PATH = path.join(ROOT, 'client', 'public', 'sitemap-en.xml');
const REQUEST_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 3;

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const value = args.find((arg) => arg.startsWith(`--${name}=`));
  return value ? value.slice(name.length + 3) : fallback;
};
const PREPARE = args.includes('--prepare');
const DRY = args.includes('--dry') || !PREPARE;
const requestedCampaignId = getArg('campaign', '');
const requestedDay = getArg('day', '');
const requestedLimit = getArg('limit', '');
const CHECK_REMOTE = args.includes('--check-remote') || (PREPARE && !args.includes('--skip-remote-check'));
const COMPANY_ASSETS_ONLY = args.includes('--company-assets-only');
const NO_AI_MEDIA = args.includes('--no-ai-media');
const today = new Date().toISOString().slice(0, 10);

function assertCompanyAssetPolicy() {
  if (!COMPANY_ASSETS_ONLY || !NO_AI_MEDIA) {
    throw new Error('Campaign preparation requires both --company-assets-only and --no-ai-media.');
  }
  if (process.env.CAMPAIGN_ASSET_POLICY && process.env.CAMPAIGN_ASSET_POLICY !== 'company_only') {
    throw new Error('CAMPAIGN_ASSET_POLICY must be company_only when set.');
  }
  if (process.env.CAMPAIGN_NO_AI_MEDIA && process.env.CAMPAIGN_NO_AI_MEDIA !== 'true') {
    throw new Error('CAMPAIGN_NO_AI_MEDIA must be true when set.');
  }
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read ${label}: ${error.message}`);
  }
}

function readJsonl(filePath, label) {
  try {
    return fs.readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    throw new Error(`Cannot read ${label}: ${error.message}`);
  }
}

function atomicWrite(filePath, payload) {
  const tempPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, filePath);
}

function normalizePath(value) {
  const pathname = new URL(value, 'https://cooldrivepro.com').pathname;
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function imagePlanFor(topic) {
  return createCompanyImagePlan(topic, ROOT);
}

function dateOffset(dateText, days) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  return Math.floor((end - start) / 86400000);
}

function loadCampaign() {
  if (!fs.existsSync(ACTIVE_CAMPAIGN_PATH)) {
    throw new Error('No active campaign. Create one with content-campaign-plan.mjs --write first.');
  }
  const active = readJson(ACTIVE_CAMPAIGN_PATH, 'active campaign');
  const campaignId = requestedCampaignId || active.id;
  if (!isSafePipelineIdentifier(campaignId)) throw new Error('Active campaign id must use only letters, numbers, and single hyphens.');
  const campaignPath = resolvePathWithin(CAMPAIGN_DIR, `${campaignId}.json`);
  const campaign = fs.existsSync(campaignPath) ? readJson(campaignPath, 'campaign manifest') : active;
  if (campaign.status !== 'active') throw new Error(`Campaign ${campaignId} is ${campaign.status}, not active.`);
  if (!campaign.topicsPath) throw new Error(`Campaign ${campaignId} has no isolated topicsPath.`);
  return {
    campaign,
    topicsPath: path.resolve(ROOT, campaign.topicsPath),
    statePath: resolvePathWithin(CAMPAIGN_DIR, `${campaign.id}.state.json`),
  };
}

function loadState(statePath, campaignId) {
  if (!fs.existsSync(statePath)) {
    return { campaignId, updatedAt: null, runs: {}, tasks: {} };
  }
  const state = readJson(statePath, 'campaign state');
  if (state.campaignId !== campaignId) {
    throw new Error(`Campaign state at ${statePath} does not belong to ${campaignId}.`);
  }
  return {
    campaignId,
    updatedAt: state.updatedAt || null,
    runs: state.runs || {},
    tasks: state.tasks || {},
  };
}

function existingBlogIndex() {
  const excluded = new Set(['list.json', 'manifest.json', 'locale-availability.json', 'related-posts.json']);
  const slugs = new Set();
  const titles = new Set();
  const keywords = new Set();
  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith('.json') || excluded.has(file)) continue;
    const article = readJson(path.join(BLOG_DIR, file), `blog article ${file}`);
    slugs.add(file.replace(/\.json$/, ''));
    titles.add(normalizeText(article.title));
    for (const keyword of article.keywords || []) keywords.add(normalizeText(keyword));
  }
  return { slugs, titles, keywords };
}

function sitemapPaths() {
  if (!fs.existsSync(ENGLISH_SITEMAP_PATH)) {
    throw new Error(`English sitemap is missing: ${ENGLISH_SITEMAP_PATH}`);
  }
  const xml = fs.readFileSync(ENGLISH_SITEMAP_PATH, 'utf8');
  const paths = new Set();
  for (const match of xml.matchAll(/<loc>(https:\/\/cooldrivepro\.com[^<]+)<\/loc>/g)) {
    paths.add(normalizePath(match[1]));
  }
  return paths;
}

function sourceIndex() {
  const catalog = readJson(SOURCE_CATALOG_PATH, 'source catalog');
  if (!Array.isArray(catalog.sources)) throw new Error('Source catalog must contain a sources array.');
  return new Map(catalog.sources.map((source) => [source.id, source]));
}

async function checkRemoteSource(source) {
  if (!source.url) return { status: 'not_applicable' };
  if (source.remoteCheck === 'manual') return { status: 'manual_validation_required' };
  try {
    const response = await fetch(source.url, {
      method: 'GET',
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        range: 'bytes=0-1024',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if ((response.status === 403 || response.status === 429) && source.allowBotBlocked) {
      return { status: 'blocked_but_cataloged', reason: `HTTP ${response.status}` };
    }
    if (!response.ok) return { status: 'failed', reason: `HTTP ${response.status}` };
    return {
      status: 'verified',
      finalUrl: response.url,
      etag: response.headers.get('etag') || null,
      lastModified: response.headers.get('last-modified') || null,
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
}

async function validateSources(topic, sources, remoteCache) {
  const errors = [];
  const sourceIds = Array.isArray(topic.sourceIds) ? [...new Set(topic.sourceIds)] : [];
  if (sourceIds.length < 2) errors.push('requires at least two source ids');
  const provenance = [];

  for (const sourceId of sourceIds) {
    const source = sources.get(sourceId);
    if (!source) {
      errors.push(`unknown source id: ${sourceId}`);
      continue;
    }
    const entry = {
      id: source.id,
      kind: source.kind,
      title: source.title,
      publisher: source.publisher || 'CoolDrivePro',
      evidenceLevel: source.evidenceLevel || 'unknown',
      url: source.url || null,
      localPath: source.localPath || null,
      license: source.license || null,
      usage: source.usage || null,
      checkedAt: today,
    };
    if (source.localPath) {
      const localPath = path.resolve(ROOT, source.localPath);
      if (!fs.existsSync(localPath)) {
        errors.push(`missing local source: ${source.localPath}`);
      } else {
        entry.localHash = hashFile(localPath);
        entry.localStatus = 'verified';
      }
    }
    if (source.url) {
      if (CHECK_REMOTE) {
        if (!remoteCache.has(source.id)) remoteCache.set(source.id, checkRemoteSource(source));
        entry.remote = await remoteCache.get(source.id);
        if (entry.remote.status === 'failed') errors.push(`source unavailable: ${source.id} (${entry.remote.reason})`);
      } else {
        entry.remote = { status: 'not_checked' };
      }
    }
    provenance.push(entry);
  }
  if (topic.requiresPrimarySource && !provenance.some((source) => source.evidenceLevel === 'primary')) {
    errors.push('requires a source cataloged as primary evidence');
  }
  return { ok: errors.length === 0, errors, provenance };
}

function retryEligible(record) {
  if (!record) return true;
  if (record.status === 'planned') return true;
  const sourceAttempts = record.sourceAttempts ?? 0;
  return record.status === 'retry_wait'
    && record.retryStage === 'source'
    && record.retryNotBefore <= today
    && sourceAttempts < MAX_ATTEMPTS;
}

function validateTopic(topic, campaignTopics, existing, knownSitemapPaths) {
  const errors = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.slug || '')) errors.push('invalid slug');
  if (existing.slugs.has(topic.slug)) errors.push('slug already exists in live blog');
  if (!topic.title || existing.titles.has(normalizeText(topic.title))) errors.push('title already exists in live blog');
  const primaryKeyword = normalizeText(topic.primaryKeyword);
  if (!primaryKeyword) errors.push('missing primary keyword');
  if (primaryKeyword && existing.keywords.has(primaryKeyword)) errors.push('primary keyword already exists in live blog keywords');
  if (!Array.isArray(topic.outlineHints) || topic.outlineHints.length < 3) errors.push('requires at least three outline hints');
  if (!Array.isArray(topic.internalLinkTargets) || topic.internalLinkTargets.length < 2) errors.push('requires at least two internal links');
  for (const linkTarget of topic.internalLinkTargets || []) {
    if (!knownSitemapPaths.has(normalizePath(linkTarget))) errors.push(`unknown internal link target: ${linkTarget}`);
  }
  const imagePlan = imagePlanFor(topic);
  if (!imagePlan.ok) errors.push(imagePlan.error);
  const duplicatePrimary = campaignTopics.filter((candidate) => candidate.slug !== topic.slug
    && normalizeText(candidate.primaryKeyword) === primaryKeyword);
  if (duplicatePrimary.length > 0) errors.push(`duplicate campaign primary keyword: ${primaryKeyword}`);
  return errors;
}

function taskRecord(topic, sourceResult, imagePlan) {
  return {
    slug: topic.slug,
    title: topic.title,
    pageType: topic.pageType,
    clusterId: topic.clusterId,
    primaryKeyword: topic.primaryKeyword,
    secondaryKeywords: topic.secondaryKeywords || [],
    intent: topic.intent,
    priority: topic.priority,
    outlineHints: topic.outlineHints,
    internalLinkTargets: topic.internalLinkTargets,
    sources: sourceResult.provenance,
    imagePlan,
  };
}

function acquireLock(campaignId) {
  const lockPath = resolvePathWithin(CAMPAIGN_DIR, `${campaignId}.lock`);
  return acquireOwnedLock(lockPath, {
    label: `campaign ${campaignId} preparation`,
    staleMs: 12 * 60 * 60 * 1000,
  });
}

async function main() {
  assertCompanyAssetPolicy();
  const { campaign, topicsPath, statePath } = loadCampaign();
  const day = requestedDay ? Number(requestedDay) : daysBetween(campaign.startDate, today) + 1;
  if (!Number.isInteger(day) || day < 1) throw new Error('--day must be a positive integer.');
  if (day > campaign.totalDays) {
    console.log(`Campaign ${campaign.id} has no new scheduled batch after day ${campaign.totalDays}.`);
    return;
  }
  const limit = requestedLimit ? Number(requestedLimit) : campaign.dailyLimit;
  if (!Number.isInteger(limit) || limit < 1 || limit > campaign.dailyLimit) {
    throw new Error(`--limit must be an integer from 1 to ${campaign.dailyLimit}.`);
  }

  const topics = readJsonl(topicsPath, 'campaign topics');
  const state = loadState(statePath, campaign.id);
  const existing = existingBlogIndex();
  const paths = sitemapPaths();
  const sources = sourceIndex();
  const runId = `${campaign.id}-day-${day}`;
  const runDir = resolvePathWithin(STAGING_DIR, runId);
  const manifestPath = resolvePathWithin(runDir, 'manifest.json');
  if (!DRY && fs.existsSync(manifestPath)) {
    const existingManifest = readJson(manifestPath, 'existing staging manifest');
    if (existingManifest.runId !== runId
      || existingManifest.campaignId !== campaign.id
      || existingManifest.day !== day
      || existingManifest.assetPolicy !== 'verified_company_assets_only'
      || existingManifest.assetCatalog !== COMPANY_ASSET_CATALOG_VERSION) {
      throw new Error(`Existing staging manifest is incompatible with ${runId}; refusing to overwrite an immutable work order.`);
    }
    console.log(`Reusing immutable staging manifest: ${path.relative(ROOT, manifestPath)}`);
    return;
  }
  const candidates = topics
    .filter((topic) => topic.campaignDay <= day && retryEligible(state.tasks[topic.slug]))
    .sort((left, right) => left.campaignDay - right.campaignDay || right.priority - left.priority || left.campaignSlot - right.campaignSlot)
    .slice(0, limit);

  const remoteCache = new Map();
  const manifest = {
    version: 2,
    runId,
    campaignId: campaign.id,
    day,
    generatedAt: new Date().toISOString(),
    mode: DRY ? 'dry' : 'prepare',
    language: campaign.language,
    dailyLimit: campaign.dailyLimit,
    requestedLimit: limit,
    assetPolicy: 'verified_company_assets_only',
    assetCatalog: COMPANY_ASSET_CATALOG_VERSION,
    sourceRemoteChecks: CHECK_REMOTE,
    tasks: [],
    rejected: [],
    shortfall: 0,
  };

  for (const topic of candidates) {
    const topicErrors = validateTopic(topic, topics, existing, paths);
    const sourceResult = topicErrors.length === 0
      ? await validateSources(topic, sources, remoteCache)
      : { ok: false, errors: [], provenance: [] };
    const imagePlanResult = topicErrors.length === 0 ? imagePlanFor(topic) : { ok: false, error: null };
    const errors = [...topicErrors, ...sourceResult.errors, ...(imagePlanResult.ok ? [] : imagePlanResult.error ? [imagePlanResult.error] : [])];
    if (errors.length > 0) {
      manifest.rejected.push({ slug: topic.slug, errors });
      if (!DRY) {
        const previous = state.tasks[topic.slug] || {};
        const sourceAttempts = (previous.sourceAttempts ?? 0) + 1;
        state.tasks[topic.slug] = {
          ...previous,
          status: sourceAttempts >= MAX_ATTEMPTS ? 'rejected' : 'retry_wait',
          sourceAttempts,
          retryStage: 'source',
          retryNotBefore: sourceAttempts >= MAX_ATTEMPTS ? null : dateOffset(today, 2 ** (sourceAttempts - 1)),
          lastError: errors,
          updatedAt: today,
        };
      }
      continue;
    }
    manifest.tasks.push(taskRecord(topic, sourceResult, imagePlanResult.imagePlan));
    if (!DRY) {
      const previous = state.tasks[topic.slug] || {};
      state.tasks[topic.slug] = {
        ...previous,
        status: 'source_validated',
        sourceAttempts: (previous.sourceAttempts ?? 0) + 1,
        writeAttempts: previous.writeAttempts ?? 0,
        retryStage: null,
        retryNotBefore: null,
        runId,
        sourceValidatedAt: today,
        updatedAt: today,
      };
    }
  }
  manifest.shortfall = Math.max(0, limit - manifest.tasks.length);

  console.log(`Campaign: ${campaign.id}, day ${day}/${campaign.totalDays}`);
  console.log(`Mode: ${DRY ? 'dry run' : 'prepare'}, remote source checks: ${CHECK_REMOTE ? 'on' : 'off'}`);
  console.log(`Ready for staging: ${manifest.tasks.length}/${limit}`);
  console.log(`Rejected or deferred: ${manifest.rejected.length}`);
  console.log(`Shortfall: ${manifest.shortfall}`);
  for (const task of manifest.tasks.slice(0, 8)) console.log(`  READY ${task.slug}`);
  for (const rejected of manifest.rejected.slice(0, 8)) console.log(`  HOLD  ${rejected.slug}: ${rejected.errors.join('; ')}`);

  if (DRY) return;
  const releaseLock = acquireLock(campaign.id);
  try {
    fs.mkdirSync(runDir, { recursive: true });
    atomicWrite(manifestPath, manifest);
    state.runs[runId] = {
      runId,
      day,
      status: manifest.tasks.length > 0 ? 'source_validated' : 'shortfall',
      createdAt: today,
      stagingManifest: path.relative(ROOT, manifestPath),
      readyCount: manifest.tasks.length,
      rejectedCount: manifest.rejected.length,
      shortfall: manifest.shortfall,
    };
    state.updatedAt = today;
    atomicWrite(statePath, state);
    console.log(`Staged work order: ${path.relative(ROOT, manifestPath)}`);
  } finally {
    releaseLock();
  }
}

main().catch((error) => {
  console.error(`Content campaign batch failed: ${error.message}`);
  process.exit(1);
});