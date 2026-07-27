#!/usr/bin/env node
/**
 * Promote only validated campaign drafts through a reversible local build and,
 * when explicitly requested, deployment plus production URL verification.
 *
 * Usage:
 *   node scripts/content-campaign-promote.mjs --dry --run=<campaign>-day-<n>
 *   node scripts/content-campaign-promote.mjs --build-only --run=<campaign>-day-<n> --limit=10
 *   node scripts/content-campaign-promote.mjs --release --indexnow --run=<campaign>-day-<n> --limit=100
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { validateCompanyImagePlan } from './content-campaign-assets.mjs';
import { classifyCampaignLink, normalizeHttpsUrl } from './content-campaign-links.mjs';
import {
  acquireOwnedLock,
  createShutdownSignal,
  isSafePipelineIdentifier,
  isValidTimerDuration,
  MAX_TIMER_MS,
  resolvePathWithin,
  runBoundedCommand,
} from './content-campaign-runtime.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PIPELINE_DIR = path.join(ROOT, '.omc', 'content-pipeline');
const STAGING_DIR = path.join(PIPELINE_DIR, 'staging');
const CAMPAIGN_DIR = path.join(PIPELINE_DIR, 'campaigns');
const RELEASES_DIR = path.join(PIPELINE_DIR, 'releases');
const LOCK_PATH = path.join(PIPELINE_DIR, 'locks', 'promotion.lock');
const BLOG_DIR = path.join(ROOT, 'client', 'public', 'data', 'blog');
const PUBLIC_DIR = path.join(ROOT, 'client', 'public');
const DIST_DIR = path.join(ROOT, 'dist', 'client');
const MIN_WORDS = 2500;
const MIN_H2_SECTIONS = 8;
const SIMILARITY_THRESHOLD = 0.16;
const MAX_RELEASE_LIMIT = 100;
const LOCK_STALE_MS = 12 * 60 * 60 * 1000;
const COMMAND_TIMEOUT_MS = Number(process.env.CAMPAIGN_PROMOTION_COMMAND_TIMEOUT_MS || 90 * 60 * 1000);

const args = process.argv.slice(2);
const getArg = (name, fallback = '') => {
  const value = args.find((arg) => arg.startsWith(`--${name}=`));
  return value ? value.slice(name.length + 3) : fallback;
};

const runId = getArg('run');
const releaseMode = args.includes('--release');
const buildOnly = args.includes('--build-only');
const dryRun = args.includes('--dry') || (!releaseMode && !buildOnly);
const submitIndexNow = args.includes('--indexnow');
const limit = Number(getArg('limit', String(MAX_RELEASE_LIMIT)));
const now = new Date();
const today = now.toISOString().slice(0, 10);
const releaseStem = isSafePipelineIdentifier(runId) ? runId : 'invalid-run';
const releaseId = `${releaseStem}-${now.toISOString().replace(/[:.]/g, '-')}`;

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read ${label}: ${error.message}`);
  }
}

function atomicWrite(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

function isSafeSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeContent(content) {
  if (!Array.isArray(content)) return [];
  return content.map((section) => ({
    heading: typeof section?.heading === 'string' ? section.heading.trim() || null : null,
    body: typeof section?.body === 'string' ? section.body.trim() : typeof section === 'string' ? section.trim() : '',
  }));
}

function articleText(article) {
  return [article.title, article.metaDescription, ...normalizeContent(article.content).flatMap((section) => [section.heading || '', section.body])].join(' ');
}

function wordCount(article) {
  return articleText(article).split(/\s+/).filter(Boolean).length;
}

function markdownLinks(article) {
  return [...articleText(article).matchAll(/\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((match) => match[1]);
}

function shingles(value, size = 8) {
  const words = normalizeText(value).split(' ').filter(Boolean);
  const set = new Set();
  for (let index = 0; index + size <= words.length; index += 1) {
    set.add(words.slice(index, index + size).join(' '));
  }
  return set;
}

function similarity(left, right) {
  if (left.size === 0 || right.size === 0) return 0;
  const [smaller, larger] = left.size <= right.size ? [left, right] : [right, left];
  let overlap = 0;
  for (const phrase of smaller) if (larger.has(phrase)) overlap += 1;
  return overlap / (left.size + right.size - overlap);
}

function loadLiveFingerprints() {
  const fingerprints = new Map();
  const excluded = new Set(['list.json', 'manifest.json', 'locale-availability.json', 'related-posts.json']);
  for (const fileName of fs.readdirSync(BLOG_DIR)) {
    if (!fileName.endsWith('.json') || excluded.has(fileName)) continue;
    const slug = fileName.replace(/\.json$/, '');
    fingerprints.set(slug, shingles(articleText(readJson(path.join(BLOG_DIR, fileName), `live blog ${fileName}`))));
  }
  return fingerprints;
}

function validateCompanyAsset(article, task) {
  const errors = [...validateCompanyImagePlan(task.imagePlan, ROOT)];
  const provenance = article.imageProvenance || {};
  if (article.image !== task.imagePlan?.publicPath
    || article.imageAlt !== task.imagePlan?.alt
    || provenance.type !== 'company'
    || provenance.assetCatalog !== task.imagePlan?.assetCatalog
    || provenance.assetId !== task.imagePlan?.assetId
    || provenance.approval !== task.imagePlan?.approval
    || provenance.assetPath !== task.imagePlan?.publicPath
    || provenance.localPath !== task.imagePlan?.localPath
    || provenance.localHash !== task.imagePlan?.localHash) {
    errors.push('article image provenance does not match the verified company asset plan');
  }
  return { asset: null, errors };
}

function validateDraft(task, article, fingerprints, runDir) {
  const errors = [];
  if (!article || typeof article !== 'object') return { errors: ['draft is not an object'], imageAsset: null };
  if (!Array.isArray(task.sources) || !Array.isArray(task.internalLinkTargets)) {
    return { errors: ['task sources and internal link targets must be arrays'], imageAsset: null };
  }
  const sections = normalizeContent(article.content);
  const headings = sections.map((section) => section.heading).filter(Boolean);
  const links = markdownLinks(article);
  const allowedSources = new Set();
  for (const source of task.sources) {
    const normalized = normalizeHttpsUrl(source?.url);
    if (!normalized) errors.push(`task source must use HTTPS: ${source?.url || '<missing>'}`);
    else allowedSources.add(normalized);
  }
  const allowedInternal = new Set();
  for (const target of task.internalLinkTargets) {
    const classification = classifyCampaignLink(target);
    if (classification.kind !== 'internal') errors.push(`task internal link target is invalid: ${target}`);
    else allowedInternal.add(classification.path);
  }
  const citedSources = new Set();
  const internalLinks = new Set();

  if (typeof article.title !== 'string' || article.title.length < 20 || article.title.length > 100) errors.push('title must be 20-100 characters');
  if (typeof article.metaDescription !== 'string' || article.metaDescription.length < 120 || article.metaDescription.length > 165) {
    errors.push('meta description must be 120-165 characters');
  }
  if (wordCount(article) < MIN_WORDS) errors.push(`word count ${wordCount(article)} < ${MIN_WORDS}`);
  if (headings.length < MIN_H2_SECTIONS) errors.push(`requires at least ${MIN_H2_SECTIONS} H2 sections`);
  if (new Set(headings.map(normalizeText)).size !== headings.length) errors.push('duplicate H2 headings');

  const primaryKeyword = normalizeText(task.primaryKeyword);
  if (!normalizeText(article.title).includes(primaryKeyword)) errors.push('primary keyword missing from title');
  if (!normalizeText(article.metaDescription).includes(primaryKeyword)) errors.push('primary keyword missing from meta description');
  if (!normalizeText(sections[0]?.body || '').slice(0, 900).includes(primaryKeyword)) errors.push('primary keyword missing from first 120 words');
  if (!headings.some((heading) => normalizeText(heading).includes(primaryKeyword))) errors.push('primary keyword missing from an H2');

  const text = articleText(article);
  if (!headings.some((heading) => /faq|frequently asked/i.test(heading)) || (text.match(/\*\*[^*\n]{8,250}\?\*\*/g) || []).length < 5) {
    errors.push('requires FAQ section with at least five questions');
  }
  if (/\[content continues\]|todo:|lorem ipsum|as an ai/i.test(text)) errors.push('contains draft placeholder language');

  for (const link of links) {
    const normalized = normalizeHttpsUrl(link);
    if (allowedSources.has(normalized)) {
      citedSources.add(normalized);
      continue;
    }
    const classification = classifyCampaignLink(link);
    if (classification.kind === 'internal') {
      internalLinks.add(classification.path);
      continue;
    }
    errors.push(classification.kind === 'external'
      ? `unapproved external citation: ${link}`
      : `invalid link: ${link} (${classification.error})`);
  }
  if ([...internalLinks].filter((link) => allowedInternal.has(link)).length < 2) errors.push('requires at least two approved internal links');
  for (const link of internalLinks) if (!allowedInternal.has(link)) errors.push(`unapproved internal link: ${link}`);
  if (citedSources.size < 2) errors.push('requires at least two visible source citations');

  for (const source of task.sources) {
    if (!source.localPath) continue;
    let sourcePath;
    try {
      sourcePath = resolvePathWithin(ROOT, source.localPath);
    } catch (error) {
      errors.push(`source path escapes the repository: ${source.localPath}`);
      continue;
    }
    if (!fs.existsSync(sourcePath)) errors.push(`source disappeared: ${source.localPath}`);
    else if (source.localHash && hashFile(sourcePath) !== source.localHash) errors.push(`source changed: ${source.localPath}`);
  }
  const companyAsset = validateCompanyAsset(article, task);
  errors.push(...companyAsset.errors);

  const draftShingles = shingles(text);
  for (const [slug, fingerprint] of fingerprints) {
    const score = similarity(draftShingles, fingerprint);
    if (score >= SIMILARITY_THRESHOLD) {
      errors.push(`near-duplicate of ${slug} (${Math.round(score * 100)}% shingle overlap)`);
      break;
    }
  }
  return { errors, imageAsset: companyAsset.asset };
}

function generatedPaths(selected) {
  const paths = [
    ...selected.map((candidate) => path.join(BLOG_DIR, `${candidate.slug}.json`)),
    ...selected.flatMap((candidate) => candidate.imageAsset ? [candidate.imageAsset.destinationPath] : []),
    path.join(BLOG_DIR, 'list.json'),
    path.join(BLOG_DIR, 'manifest.json'),
    path.join(BLOG_DIR, 'locale-availability.json'),
    ...fs.readdirSync(PUBLIC_DIR)
      .filter((fileName) => /^sitemap.*\.xml$/.test(fileName) || ['feed.xml', 'atom.xml', '_redirects'].includes(fileName))
      .map((fileName) => path.join(PUBLIC_DIR, fileName)),
  ];
  const localesDir = path.join(BLOG_DIR, 'locales');
  if (fs.existsSync(localesDir)) {
    for (const entry of fs.readdirSync(localesDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      paths.push(path.join(localesDir, entry.name, 'list.json'), path.join(localesDir, entry.name, 'manifest.json'));
    }
  }
  return [...new Set(paths)];
}

function snapshotFiles(paths, transactionDir) {
  const backupDir = path.join(transactionDir, 'backup');
  fs.mkdirSync(backupDir, { recursive: true });
  const records = paths.map((filePath, index) => {
    const existed = fs.existsSync(filePath);
    const backupPath = path.join(backupDir, `${index}.snapshot`);
    if (existed) fs.copyFileSync(filePath, backupPath);
    return { filePath, existed, backupPath: existed ? backupPath : null };
  });
  atomicWrite(path.join(transactionDir, 'snapshot.json'), { createdAt: new Date().toISOString(), records });
  return records;
}

function restoreFiles(records) {
  for (const record of [...records].reverse()) {
    if (record.existed) {
      fs.mkdirSync(path.dirname(record.filePath), { recursive: true });
      fs.copyFileSync(record.backupPath, record.filePath);
    } else {
      fs.rmSync(record.filePath, { force: true });
    }
  }
}

function snapshotDirectory(sourceDir, transactionDir) {
  const existed = fs.existsSync(sourceDir);
  const backupDir = path.join(transactionDir, 'dist-before-promotion');
  if (existed) fs.cpSync(sourceDir, backupDir, { recursive: true, force: true });
  return { sourceDir, existed, backupDir };
}

function restoreDirectory(snapshot) {
  fs.rmSync(snapshot.sourceDir, { recursive: true, force: true });
  if (snapshot.existed) fs.cpSync(snapshot.backupDir, snapshot.sourceDir, { recursive: true, force: true });
}

function runCommand(command, commandArgs, label, signal) {
  return runBoundedCommand(command, commandArgs, {
    label,
    cwd: ROOT,
    timeoutMs: COMMAND_TIMEOUT_MS,
    signal,
  });
}

function runCommandCapture(command, commandArgs, label, signal) {
  return runBoundedCommand(command, commandArgs, {
    label,
    cwd: ROOT,
    timeoutMs: COMMAND_TIMEOUT_MS,
    signal,
    captureOutput: true,
  });
}

function previewBranchName() {
  return `campaign-${releaseId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 63);
}

function deploymentUrlFromOutput(output) {
  const matches = [...String(output || '').matchAll(/https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.pages\.dev\/?/gi)];
  return matches.at(-1)?.[0]?.replace(/\/$/, '') || null;
}

function verifyLocalArtifacts(selected) {
  const errors = [];
  const list = readJson(path.join(BLOG_DIR, 'list.json'), 'generated blog list');
  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap-en.xml');
  const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
  if (!sitemap) errors.push('missing generated English sitemap');
  if (/www\.cooldrivepro\.com/i.test(sitemap)) errors.push('English sitemap contains www URLs');

  for (const candidate of selected) {
    const article = candidate.article;
    const canonical = `https://cooldrivepro.com/blog/${candidate.slug}/`;
    if (!list.some((item) => item.slug === candidate.slug)) errors.push(`${candidate.slug} is missing from list.json`);
    if (!sitemap.includes(`<loc>${canonical}</loc>`)) errors.push(`${candidate.slug} is missing from sitemap-en.xml`);

    const outputPath = path.join(DIST_DIR, 'blog', candidate.slug, 'index.html');
    if (!fs.existsSync(outputPath)) {
      errors.push(`${candidate.slug} is missing from prerender output`);
      continue;
    }
    const html = fs.readFileSync(outputPath, 'utf8');
    if (!html.includes(`<link rel="canonical" href="${canonical}"`)) errors.push(`${candidate.slug} prerender canonical is incorrect`);
    if (!html.includes(`<title>${article.title} | CoolDrivePro</title>`)) errors.push(`${candidate.slug} prerender title is incorrect`);
    if (!html.includes(`name="description" content="${article.metaDescription}"`)) errors.push(`${candidate.slug} prerender description is incorrect`);
    if (!html.includes('"@type":"BlogPosting"')) errors.push(`${candidate.slug} prerender lacks BlogPosting JSON-LD`);
    for (const source of article.sources || []) {
      if (source.url && !html.includes(source.url)) errors.push(`${candidate.slug} prerender lacks source ${source.id}`);
    }
  }
  return errors;
}

function collectCandidates(runDir, manifest, state, writerResults) {
  const resultBySlug = new Map((writerResults.results || []).map((result) => [result.slug, result]));
  const fingerprints = loadLiveFingerprints();
  const accepted = [];
  const rejected = [];

  for (const task of manifest.tasks) {
    if (accepted.length >= limit) break;
    const stateRecord = state.tasks?.[task.slug];
    const writerRecord = resultBySlug.get(task.slug);
    if (stateRecord?.status !== 'draft_ready' || writerRecord?.status !== 'draft_ready') continue;
    if (!isSafeSlug(task.slug)) {
      rejected.push({ slug: task.slug, errors: ['draft is missing or slug is unsafe'] });
      continue;
    }
    const draftPath = resolvePathWithin(runDir, 'drafts', `${task.slug}.json`);
    if (!fs.existsSync(draftPath)) {
      rejected.push({ slug: task.slug, errors: ['draft is missing or slug is unsafe'] });
      continue;
    }
    const destination = resolvePathWithin(BLOG_DIR, `${task.slug}.json`);
    if (fs.existsSync(destination)) {
      rejected.push({ slug: task.slug, errors: ['destination blog slug already exists'] });
      continue;
    }
    const article = readJson(draftPath, `staging draft ${task.slug}`);
    const validation = validateDraft(task, article, fingerprints, runDir);
    if (validation.errors.length > 0) {
      rejected.push({ slug: task.slug, errors: validation.errors });
      continue;
    }
    fingerprints.set(task.slug, shingles(articleText(article)));
    accepted.push({ slug: task.slug, task, article, draftPath, destination, imageAsset: validation.imageAsset });
  }
  return { accepted, rejected };
}

function promoteDrafts(selected) {
  for (const candidate of selected) {
    if (candidate.imageAsset) {
      fs.mkdirSync(path.dirname(candidate.imageAsset.destinationPath), { recursive: true });
      fs.copyFileSync(candidate.imageAsset.sourcePath, candidate.imageAsset.destinationPath, fs.constants.COPYFILE_EXCL);
    }
    fs.copyFileSync(candidate.draftPath, candidate.destination, fs.constants.COPYFILE_EXCL);
  }
}

function updateReleaseState(statePath, resultsPath, state, writerResults, selected, releaseReport) {
  const verifiedAt = new Date().toISOString();
  const resultBySlug = new Map((writerResults.results || []).map((result) => [result.slug, result]));
  for (const candidate of selected) {
    state.tasks[candidate.slug] = {
      ...state.tasks[candidate.slug],
      status: 'url_verified',
      releasedAt: today,
      releaseId,
      verifiedAt,
      retryNotBefore: null,
      lastError: null,
    };
    resultBySlug.set(candidate.slug, {
      ...resultBySlug.get(candidate.slug),
      status: 'url_verified',
      releaseId,
      url: `https://cooldrivepro.com/blog/${candidate.slug}/`,
      verifiedAt,
    });
  }
  state.updatedAt = today;
  state.runs[runId] = { ...state.runs[runId], status: 'url_verified', releaseId, verifiedAt };
  writerResults.updatedAt = verifiedAt;
  writerResults.results = [...resultBySlug.values()].sort((left, right) => left.slug.localeCompare(right.slug));
  atomicWrite(statePath, state);
  atomicWrite(resultsPath, writerResults);
  atomicWrite(path.join(RELEASES_DIR, `${releaseId}.json`), releaseReport);
}

async function main() {
  const releaseReport = {
    releaseId,
    runId: runId || null,
    campaignId: null,
    mode: dryRun ? 'dry' : releaseMode ? 'release' : 'build-only',
    createdAt: new Date().toISOString(),
    accepted: [],
    rejected: [],
    localValidation: null,
    preview: null,
    previewVerification: null,
    productionVerification: null,
    indexNow: null,
    outcome: 'started',
  };
  const failedReportPath = resolvePathWithin(RELEASES_DIR, `${releaseId}.failed.json`);
  let transactionDir = null;
  let fileSnapshot = [];
  let distSnapshot = null;
  let keepPromotion = false;
  let productionDeployed = false;
  let productionDeploymentAttempted = false;
  let releaseLock = null;
  let shutdown = null;
  let executionError = null;
  let pendingCompletion = null;

  try {
    if (!isSafePipelineIdentifier(runId)) throw new Error('Pass --run=<campaign>-day-<n> using only letters, numbers, and single hyphens.');
    if (releaseMode && buildOnly) throw new Error('Use either --release or --build-only, not both.');
    if (submitIndexNow && !releaseMode) throw new Error('--indexnow is only available with --release.');
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_RELEASE_LIMIT) {
      throw new Error(`--limit must be an integer from 1 to ${MAX_RELEASE_LIMIT}.`);
    }
    if (!isValidTimerDuration(COMMAND_TIMEOUT_MS)) {
      throw new Error(`CAMPAIGN_PROMOTION_COMMAND_TIMEOUT_MS must be a positive integer no greater than ${MAX_TIMER_MS} milliseconds.`);
    }
    if (releaseMode && !process.env.CLOUDFLARE_API_TOKEN) {
      throw new Error('Refusing production deployment without CLOUDFLARE_API_TOKEN in the noninteractive environment.');
    }

    const runDir = resolvePathWithin(STAGING_DIR, runId);
    const manifestPath = resolvePathWithin(runDir, 'manifest.json');
    const resultsPath = resolvePathWithin(runDir, 'writer-results.json');
    if (!fs.existsSync(manifestPath)) throw new Error(`Staging manifest does not exist: ${path.relative(ROOT, manifestPath)}`);
    if (!fs.existsSync(resultsPath)) throw new Error(`Writer results do not exist: ${path.relative(ROOT, resultsPath)}`);

    const manifest = readJson(manifestPath, 'staging manifest');
    if (manifest.runId !== runId) throw new Error('Staging manifest runId does not match the requested run.');
    if (!isSafePipelineIdentifier(manifest.campaignId)) throw new Error('Staging manifest campaignId must use only letters, numbers, and single hyphens.');
    if (!Array.isArray(manifest.tasks)) throw new Error('Staging manifest tasks must be an array.');
    for (const task of manifest.tasks) {
      if (!task || !isSafeSlug(task.slug)) throw new Error('Every staging task slug must use only letters, numbers, and single hyphens.');
    }
    const statePath = resolvePathWithin(CAMPAIGN_DIR, `${manifest.campaignId}.state.json`);
    const state = readJson(statePath, 'campaign state');
    const writerResults = readJson(resultsPath, 'writer results');
    const { accepted, rejected } = collectCandidates(runDir, manifest, state, writerResults);
    releaseReport.campaignId = manifest.campaignId;
    releaseReport.accepted = accepted.map((candidate) => candidate.slug);
    releaseReport.rejected = rejected;

    console.log(`Run: ${runId}`);
    console.log(`Mode: ${releaseReport.mode}`);
    console.log(`Eligible drafts: ${accepted.length}; rejected: ${rejected.length}`);
    for (const rejection of rejected) console.log(`  HOLD ${rejection.slug}: ${rejection.errors.join('; ')}`);
    if (accepted.length === 0) throw new Error('No draft_ready articles passed promotion validation.');

    if (dryRun) {
      releaseReport.outcome = 'dry_ready';
      releaseReport.completedAt = new Date().toISOString();
      atomicWrite(resolvePathWithin(RELEASES_DIR, `${releaseId}.dry-run.json`), releaseReport);
      for (const candidate of accepted) console.log(`  READY ${candidate.slug}`);
      console.log('Dry promotion validation passed; no blog file, generated index, build artifact, deployment, or state was changed.');
      return;
    }

    shutdown = createShutdownSignal('Campaign promotion');
    releaseLock = acquireOwnedLock(LOCK_PATH, {
      label: 'campaign promotion',
      staleMs: LOCK_STALE_MS,
    });
    transactionDir = resolvePathWithin(RELEASES_DIR, releaseId);
    fs.mkdirSync(transactionDir, { recursive: true });
    fileSnapshot = snapshotFiles(generatedPaths(accepted), transactionDir);
    distSnapshot = snapshotDirectory(DIST_DIR, transactionDir);
    promoteDrafts(accepted);
    await runCommand('npm', ['run', 'sync:blog-index'], 'blog index sync', shutdown.signal);
    await runCommand('npm', ['run', 'build'], 'production build', shutdown.signal);

    const localErrors = verifyLocalArtifacts(accepted);
    releaseReport.localValidation = { passed: localErrors.length === 0, errors: localErrors };
    if (localErrors.length > 0) throw new Error(`local release validation failed: ${localErrors.join('; ')}`);
    console.log(`Local release validation passed for ${accepted.length} URL(s).`);

    if (buildOnly) {
      releaseReport.outcome = 'local_validation_pending_cleanup';
      releaseReport.passed = true;
      pendingCompletion = { type: 'build-only' };
      console.log('Build-only promotion validation passed; restoring the prior local files and build output before recording success.');
    } else {

    const previewBranch = previewBranchName();
    const previewDeploymentOutput = await runCommandCapture(
      'npx',
      ['wrangler', 'pages', 'deploy', 'dist/client', '--project-name', 'cooldrivepro', '--branch', previewBranch, '--commit-dirty=true'],
      'Cloudflare Pages preview deployment',
      shutdown.signal,
    );
    const previewUrl = deploymentUrlFromOutput(previewDeploymentOutput);
    if (!previewUrl) throw new Error('Preview deployment completed but Wrangler did not report a pages.dev preview URL. Refusing production deployment.');
    releaseReport.preview = { branch: previewBranch, url: previewUrl, deployedAt: new Date().toISOString() };
    const previewVerificationOutput = path.relative(ROOT, path.join(transactionDir, 'preview-verification.json'));
    await runCommand(
      'node',
      ['scripts/verify-campaign-production.mjs', `--run=${runId}`, `--slugs=${accepted.map((candidate) => candidate.slug).join(',')}`, `--base-url=${previewUrl}`, `--output=${previewVerificationOutput}`],
      'campaign preview verification',
      shutdown.signal,
    );
    releaseReport.previewVerification = readJson(path.join(transactionDir, 'preview-verification.json'), 'preview verification report');

    productionDeploymentAttempted = true;
    await runCommand(
      'npx',
      ['wrangler', 'pages', 'deploy', 'dist/client', '--project-name', 'cooldrivepro', '--branch', 'main', '--commit-dirty=true'],
      'Cloudflare Pages production deployment',
      shutdown.signal,
    );
    productionDeployed = true;
    await runCommand('node', ['scripts/verify-production-hosts.mjs'], 'production host verification', shutdown.signal);
    const verificationOutput = path.relative(ROOT, path.join(transactionDir, 'production-verification.json'));
    try {
      await runCommand(
        'node',
        ['scripts/verify-campaign-production.mjs', `--run=${runId}`, `--slugs=${accepted.map((candidate) => candidate.slug).join(',')}`, `--output=${verificationOutput}`],
        'campaign production verification',
        shutdown.signal,
      );
    } catch (error) {
      if (fs.existsSync(path.join(transactionDir, 'production-verification.json'))) {
        releaseReport.productionVerification = readJson(path.join(transactionDir, 'production-verification.json'), 'production verification report');
      }
      releaseReport.manualRecoveryRequired = {
        reason: 'Production verification failed after a preview-verified deployment. No local dist rollback was attempted because it is not an authoritative production baseline.',
        previewUrl,
        error: error.message,
      };
      throw error;
    }
    releaseReport.productionVerification = readJson(path.join(transactionDir, 'production-verification.json'), 'production verification report');

    if (submitIndexNow) {
      try {
        await runCommand('node', ['scripts/indexnow.mjs', ...accepted.map((candidate) => `/blog/${candidate.slug}`)], 'batch IndexNow submission', shutdown.signal);
        releaseReport.indexNow = { attempted: true, passed: true, urls: accepted.map((candidate) => `https://cooldrivepro.com/blog/${candidate.slug}/`) };
      } catch (error) {
        releaseReport.indexNow = { attempted: true, passed: false, error: error.message };
        console.error(`IndexNow submission failed after verified deployment: ${error.message}`);
      }
    }

    releaseReport.passed = true;
    releaseReport.outcome = 'url_verified_pending_cleanup';
    keepPromotion = true;
    pendingCompletion = {
      type: 'release',
      statePath,
      resultsPath,
      state,
      writerResults,
      accepted,
    };
    console.log(`Production URLs were verified for ${accepted.length} article(s); recording final success after cleanup.`);
    }
  } catch (error) {
    executionError = error;
    releaseReport.completedAt = new Date().toISOString();
    releaseReport.passed = false;
    releaseReport.outcome = releaseReport.outcome === 'started' ? 'failed' : releaseReport.outcome;
    releaseReport.error = error.message;

    if (productionDeploymentAttempted || productionDeployed) {
      releaseReport.manualRecoveryRequired ??= {
        reason: 'A production deployment was attempted but the release did not finish cleanly. Automatic rollback is intentionally disabled because local dist is not an authoritative production baseline.',
        error: error.message,
      };
      releaseReport.localWorkspaceRetained = {
        reason: 'Promoted sources and dist were retained for manual recovery because production state may be indeterminate.',
        transactionDir: transactionDir ? path.relative(ROOT, transactionDir) : null,
      };
    }
    try {
      atomicWrite(failedReportPath, releaseReport);
      if (transactionDir) atomicWrite(path.join(transactionDir, 'failed-release.json'), releaseReport);
    } catch (reportError) {
      console.error(`Unable to persist promotion failure report: ${reportError.message}`);
    }
    throw error;
  } finally {
    const cleanupErrors = [];
    try {
      if (!keepPromotion && !productionDeploymentAttempted) {
        if (fileSnapshot.length > 0) restoreFiles(fileSnapshot);
        if (distSnapshot) restoreDirectory(distSnapshot);
      }
    } catch (error) {
      cleanupErrors.push({ stage: 'local_restore', error: error.message });
    }
    try {
      releaseLock?.();
    } catch (error) {
      cleanupErrors.push({ stage: 'promotion_lock_release', error: error.message });
    }
    shutdown?.dispose();

    if (cleanupErrors.length > 0) {
      releaseReport.completedAt = new Date().toISOString();
      releaseReport.passed = false;
      releaseReport.outcome = 'cleanup_failed';
      releaseReport.error ??= cleanupErrors.map((entry) => `${entry.stage}: ${entry.error}`).join('; ');
      releaseReport.cleanupFailures = cleanupErrors;
      releaseReport.manualRecoveryRequired ??= {
        reason: productionDeploymentAttempted
          ? 'A production deployment was attempted and promotion cleanup failed. Inspect the retained transaction and lock before retrying.'
          : 'Promotion cleanup failed. Inspect the transaction and lock before retrying.',
        errors: cleanupErrors,
      };
      if (!productionDeploymentAttempted && cleanupErrors.some((entry) => entry.stage === 'local_restore')) {
        releaseReport.localWorkspaceRetained = {
          reason: 'Local restoration failed. Inspect the transaction snapshots before retrying.',
          transactionDir: transactionDir ? path.relative(ROOT, transactionDir) : null,
        };
      }
      try {
        atomicWrite(failedReportPath, releaseReport);
        if (transactionDir) atomicWrite(resolvePathWithin(transactionDir, 'cleanup-failed.json'), releaseReport);
      } catch (reportError) {
        console.error(`Unable to persist promotion cleanup failure report: ${reportError.message}`);
      }
      if (!executionError) throw new Error(`Promotion cleanup failed: ${cleanupErrors.map((entry) => `${entry.stage}: ${entry.error}`).join('; ')}`);
    } else if (!executionError && pendingCompletion) {
      try {
        releaseReport.completedAt = new Date().toISOString();
        if (pendingCompletion.type === 'build-only') {
          releaseReport.outcome = 'local_validation_passed';
          releaseReport.passed = true;
          atomicWrite(resolvePathWithin(transactionDir, 'build-only-report.json'), releaseReport);
          atomicWrite(resolvePathWithin(RELEASES_DIR, `${releaseId}.build-only.json`), releaseReport);
          console.log('Build-only promotion validation passed and local restoration completed.');
        } else {
          releaseReport.outcome = 'url_verified';
          releaseReport.passed = true;
          updateReleaseState(
            pendingCompletion.statePath,
            pendingCompletion.resultsPath,
            pendingCompletion.state,
            pendingCompletion.writerResults,
            pendingCompletion.accepted,
            releaseReport,
          );
          console.log(`Released and URL-verified ${pendingCompletion.accepted.length} article(s).`);
        }
      } catch (error) {
        releaseReport.completedAt = new Date().toISOString();
        releaseReport.passed = false;
        releaseReport.outcome = 'finalization_failed';
        releaseReport.error = error.message;
        releaseReport.manualRecoveryRequired ??= {
          reason: 'Campaign verification completed, but the final state could not be persisted after cleanup. Inspect the release transaction before retrying.',
          error: error.message,
        };
        try {
          atomicWrite(failedReportPath, releaseReport);
          if (transactionDir) atomicWrite(resolvePathWithin(transactionDir, 'finalization-failed.json'), releaseReport);
        } catch (reportError) {
          console.error(`Unable to persist promotion finalization failure report: ${reportError.message}`);
        }
        throw error;
      }
    }
  }
}

main().catch((error) => {
  console.error(`Campaign promotion failed: ${error.message}`);
  process.exitCode = 1;
});