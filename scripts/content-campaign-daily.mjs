#!/usr/bin/env node
/**
 * Run one bounded daily content campaign batch.
 *
 * This scheduler never calls the legacy direct-to-live pipeline and never
 * translates new articles until their English canonical URL is verified.
 * It uses the verified company asset selected in each work order and never
 * blocks a campaign on AI image or video generation.
 *
 * Usage:
 *   node scripts/content-campaign-daily.mjs --dry
 *   node scripts/content-campaign-daily.mjs --day=1
 *   node scripts/content-campaign-daily.mjs --day=1 --release
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  acquireOwnedLock,
  createShutdownSignal,
  isValidTimerDuration,
  MAX_TIMER_MS,
  NESTED_COMMAND_SHUTDOWN_GRACE_MS,
  runBoundedCommand,
} from './content-campaign-runtime.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PIPELINE_DIR = path.join(ROOT, '.omc', 'content-pipeline');
const CAMPAIGN_DIR = path.join(PIPELINE_DIR, 'campaigns');
const STAGING_DIR = path.join(PIPELINE_DIR, 'staging');
const ACTIVE_CAMPAIGN_PATH = path.join(PIPELINE_DIR, 'active-campaign.json');
const DAILY_LOG_DIR = path.join(PIPELINE_DIR, 'daily-log');
const LOCK_PATH = path.join(PIPELINE_DIR, 'locks', 'daily-campaign.lock');
const MAX_WRITE_LIMIT = 100;
const WRITE_TIMEOUT_MS = Number(process.env.CAMPAIGN_WRITE_TIMEOUT_MS || 4 * 60 * 60 * 1000);
const RELEASE_TIMEOUT_MS = Number(process.env.CAMPAIGN_RELEASE_TIMEOUT_MS || 90 * 60 * 1000);
const LOCK_STALE_MS = 12 * 60 * 60 * 1000;

const args = process.argv.slice(2);
const getArg = (name, fallback = '') => {
  const value = args.find((arg) => arg.startsWith(`--${name}=`));
  return value ? value.slice(name.length + 3) : fallback;
};
const requestedDay = getArg('day');
const requestedLimit = getArg('limit');
const dryRun = args.includes('--dry');
const releaseRequested = args.includes('--release');
const releaseEnabled = releaseRequested && !args.includes('--no-release');
const indexNowEnabled = !args.includes('--no-indexnow');
const writeConcurrency = Number(getArg('concurrency', process.env.CAMPAIGN_WRITE_CONCURRENCY || '2'));
const today = new Date().toISOString().slice(0, 10);
const runTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
const COMMAND_ENVIRONMENT_KEYS = new Set([
  'ANTHROPIC_API_KEY',
  'ANTHROPIC_BASE_URL',
  'ANTHROPIC_MODEL',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN',
  'HOME',
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'INDEXNOW_KEY',
  'LANG',
  'LC_ALL',
  'LC_CTYPE',
  'NODE_EXTRA_CA_CERTS',
  'NO_PROXY',
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'PATH',
  'CAMPAIGN_PROMOTION_COMMAND_TIMEOUT_MS',
  'SSL_CERT_FILE',
  'SSL_CERT_DIR',
  'TEMP',
  'TMP',
  'TMPDIR',
  'TZ',
]);

function createCommandEnvironment() {
  const environment = {};
  for (const [name, value] of Object.entries(process.env)) {
    if (COMMAND_ENVIRONMENT_KEYS.has(name)) {
      environment[name] = value;
    }
  }
  return {
    ...environment,
    CAMPAIGN_ASSET_POLICY: 'company_only',
    CAMPAIGN_NO_AI_MEDIA: 'true',
  };
}

const commandEnvironment = createCommandEnvironment();

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

function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  return Math.floor((end - start) / 86400000);
}

function runCommand(command, commandArgs, label, timeoutMs, signal, shutdownGraceMs) {
  return runBoundedCommand(command, commandArgs, {
    label,
    cwd: ROOT,
    env: commandEnvironment,
    timeoutMs,
    signal,
    shutdownGraceMs,
  });
}

function reportPath(runId, isDryRun = false) {
  const suffix = isDryRun ? `.dry-${runTimestamp}` : `.run-${runTimestamp}`;
  return path.join(DAILY_LOG_DIR, `campaign-${runId}${suffix}.json`);
}

function countStatus(results, status) {
  return (results.results || []).filter((result) => result.status === status).length;
}

async function main() {
  let report = {
    runId: null,
    campaignId: null,
    day: null,
    startedAt: new Date().toISOString(),
    mode: dryRun ? 'dry' : 'run',
    limit: requestedLimit || null,
    writeConcurrency: Number.isInteger(writeConcurrency) ? writeConcurrency : null,
    releaseEnabled,
    indexNowEnabled,
    assetPolicy: 'verified_company_assets_only',
    stages: [],
    outcome: 'started',
  };
  let reportDestination = reportPath('preflight', dryRun);
  let releaseLock = null;
  let shutdown = null;
  let executionError = null;
  try {
    if (releaseRequested && args.includes('--no-release')) {
      throw new Error('Use either --release or --no-release, not both.');
    }
    if (!Number.isInteger(writeConcurrency) || writeConcurrency < 1 || writeConcurrency > 4) {
      throw new Error('--concurrency must be an integer from 1 to 4.');
    }
    if (!isValidTimerDuration(WRITE_TIMEOUT_MS)) {
      throw new Error(`CAMPAIGN_WRITE_TIMEOUT_MS must be a positive integer no greater than ${MAX_TIMER_MS} milliseconds.`);
    }
    if (!isValidTimerDuration(RELEASE_TIMEOUT_MS)) {
      throw new Error(`CAMPAIGN_RELEASE_TIMEOUT_MS must be a positive integer no greater than ${MAX_TIMER_MS} milliseconds.`);
    }
    if (!fs.existsSync(ACTIVE_CAMPAIGN_PATH)) throw new Error('No active campaign is configured.');
    const campaign = readJson(ACTIVE_CAMPAIGN_PATH, 'active campaign');
    const day = requestedDay ? Number(requestedDay) : daysBetween(campaign.startDate, today) + 1;
    if (!Number.isInteger(day) || day < 1 || day > campaign.totalDays) {
      throw new Error(`No schedulable campaign day for ${today}. Requested day must be 1-${campaign.totalDays}.`);
    }
    const limit = requestedLimit ? Number(requestedLimit) : campaign.dailyLimit;
    if (!Number.isInteger(limit) || limit < 1 || limit > Math.min(campaign.dailyLimit, MAX_WRITE_LIMIT)) {
      throw new Error(`--limit must be an integer from 1 to ${Math.min(campaign.dailyLimit, MAX_WRITE_LIMIT)}.`);
    }
    const runId = `${campaign.id}-day-${day}`;
    const runDir = path.join(STAGING_DIR, runId);
    const manifestPath = path.join(runDir, 'manifest.json');
    report = {
      ...report,
      runId,
      campaignId: campaign.id,
      day,
      limit,
    };
    reportDestination = reportPath(runId, dryRun);

    console.log(`Campaign ${campaign.id}, day ${day}/${campaign.totalDays}`);
    console.log(`Run: ${runId}; limit: ${limit}; dry: ${dryRun}; release: ${releaseEnabled}`);
    if (dryRun) {
      report.stages.push({ name: 'manifest', reused: fs.existsSync(manifestPath), path: path.relative(ROOT, manifestPath) });
      report.outcome = 'dry_ready';
      console.log(`Dry scheduler check passed. Manifest ${fs.existsSync(manifestPath) ? 'will be reused' : 'will be prepared'}; no model, build, deployment, or state change occurred.`);
      return;
    }

    shutdown = createShutdownSignal('Daily campaign');
    releaseLock = acquireOwnedLock(LOCK_PATH, {
      label: 'daily campaign run',
      staleMs: LOCK_STALE_MS,
    });
    if (!fs.existsSync(manifestPath)) {
      await runCommand(
        process.execPath,
        ['scripts/content-campaign-run.mjs', '--prepare', '--company-assets-only', '--no-ai-media', `--campaign=${campaign.id}`, `--day=${day}`, `--limit=${limit}`, '--check-remote'],
        'campaign prepare',
        RELEASE_TIMEOUT_MS,
        shutdown.signal,
      );
      report.stages.push({ name: 'prepare', status: 'completed' });
    } else {
      report.stages.push({ name: 'prepare', status: 'reused_existing_manifest' });
      console.log(`Reusing immutable staging manifest: ${path.relative(ROOT, manifestPath)}`);
    }

    if (!fs.existsSync(manifestPath)) throw new Error('Campaign prepare completed without creating a staging manifest.');
    await runCommand(
      process.execPath,
      ['scripts/content-campaign-write.mjs', '--write', '--company-assets-only', '--no-ai-media', `--run=${runId}`, `--limit=${limit}`, `--concurrency=${writeConcurrency}`],
      'campaign staging writer',
      WRITE_TIMEOUT_MS,
      shutdown.signal,
    );
    const resultsPath = path.join(runDir, 'writer-results.json');
    const writerResults = fs.existsSync(resultsPath) ? readJson(resultsPath, 'writer results') : { results: [] };
    const draftReady = countStatus(writerResults, 'draft_ready');
    report.stages.push({ name: 'write', status: 'completed', draftReady, retryWait: countStatus(writerResults, 'retry_wait'), rejected: countStatus(writerResults, 'rejected') });

    report.stages.push({ name: 'assets', status: 'verified_company_assets_only' });

    if (draftReady === 0) {
      report.outcome = 'shortfall_no_draft_ready';
      console.log('No draft_ready articles exist. Skipping promotion, build, deployment, and IndexNow.');
      return;
    }
    if (!releaseEnabled) {
      report.outcome = 'drafts_ready_release_disabled';
      console.log(`${draftReady} draft_ready article(s) exist; release requires an explicit --release flag.`);
      return;
    }
    if (!process.env.CLOUDFLARE_API_TOKEN) {
      report.outcome = 'drafts_ready_deploy_credentials_missing';
      throw new Error('draft_ready articles exist, but CLOUDFLARE_API_TOKEN is not available to the scheduler. Refusing deployment.');
    }

    const promotionArgs = ['scripts/content-campaign-promote.mjs', '--release', `--run=${runId}`, `--limit=${limit}`];
    if (indexNowEnabled) promotionArgs.push('--indexnow');
    await runCommand(
      process.execPath,
      promotionArgs,
      'campaign promotion',
      RELEASE_TIMEOUT_MS,
      shutdown.signal,
      NESTED_COMMAND_SHUTDOWN_GRACE_MS,
    );
    report.stages.push({ name: 'release', status: 'url_verified', requested: draftReady, indexNow: indexNowEnabled });
    report.outcome = 'url_verified';
  } catch (error) {
    executionError = error;
    report.outcome = report.outcome === 'started' ? 'failed' : report.outcome;
    report.error = error.message;
    throw error;
  } finally {
    let cleanupError = null;
    try {
      releaseLock?.();
    } catch (error) {
      cleanupError = error;
    }
    shutdown?.dispose();
    report.completedAt = new Date().toISOString();
    if (cleanupError) {
      report.outcome = 'cleanup_failed';
      report.error ??= cleanupError.message;
      report.cleanupFailure = { stage: 'daily_lock_release', error: cleanupError.message };
      report.manualRecoveryRequired = {
        reason: 'The daily campaign lock could not be safely released. Inspect the lock before retrying.',
      };
    }
    try {
      atomicWrite(reportDestination, report);
    } catch (reportError) {
      console.error(`Unable to persist daily campaign audit report: ${reportError.message}`);
    }
    if (cleanupError && !executionError) throw cleanupError;
  }
}

main().catch((error) => {
  console.error(`Daily campaign failed: ${error.message}`);
  process.exitCode = 1;
});