#!/usr/bin/env node
/**
 * Add immutable company-asset catalog identity to legacy staging work orders.
 *
 * Only legacy plans that exactly match a current trusted company asset by
 * public path, alt text, local path, and SHA-256 can be upgraded. The command
 * snapshots every modified staging file and records an audit before writing.
 *
 * Usage:
 *   node scripts/content-campaign-migrate-assets.mjs --run=<campaign>-day-<n>
 *   node scripts/content-campaign-migrate-assets.mjs --run=<campaign>-day-<n> --apply
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  COMPANY_ASSET_CATALOG_VERSION,
  upgradeLegacyCompanyImagePlan,
  validateCompanyImagePlan,
} from './content-campaign-assets.mjs';
import { isSafePipelineIdentifier, resolvePathWithin } from './content-campaign-runtime.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const STAGING_DIR = path.join(ROOT, '.omc', 'content-pipeline', 'staging');
const args = process.argv.slice(2);
const getArg = (name, fallback = '') => {
  const value = args.find((arg) => arg.startsWith(`--${name}=`));
  return value ? value.slice(name.length + 3) : fallback;
};
const runId = getArg('run');
const apply = args.includes('--apply');

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

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function isLegacyProvenance(provenance) {
  return provenance
    && typeof provenance === 'object'
    && !('assetCatalog' in provenance)
    && !('assetId' in provenance)
    && !('approval' in provenance);
}

function migrateDraft(article, legacyPlan, canonicalPlan) {
  const provenance = article.imageProvenance;
  const errors = [];
  if (article.image !== legacyPlan.publicPath) errors.push('draft image does not match its legacy work order');
  if (article.imageAlt !== legacyPlan.alt) errors.push('draft image alt text does not match its legacy work order');
  if (!isLegacyProvenance(provenance)) errors.push('draft provenance is partially identified and cannot be migrated');
  if (provenance?.type !== 'company') errors.push('draft provenance type must be company');
  if (provenance?.assetPath !== legacyPlan.publicPath) errors.push('draft asset path does not match its legacy work order');
  if (provenance?.localPath !== legacyPlan.localPath) errors.push('draft local path does not match its legacy work order');
  if (provenance?.localHash !== legacyPlan.localHash) errors.push('draft hash does not match its legacy work order');
  if (errors.length > 0) return { errors };
  return {
    errors: [],
    article: {
      ...article,
      image: canonicalPlan.publicPath,
      imageAlt: canonicalPlan.alt,
      imageProvenance: {
        ...provenance,
        type: 'company',
        assetCatalog: canonicalPlan.assetCatalog,
        assetId: canonicalPlan.assetId,
        approval: canonicalPlan.approval,
        assetPath: canonicalPlan.publicPath,
        localPath: canonicalPlan.localPath,
        localHash: canonicalPlan.localHash,
        usage: canonicalPlan.usage,
      },
    },
  };
}

function validateCanonicalDraft(article, canonicalPlan) {
  const provenance = article.imageProvenance;
  const errors = [];
  if (article.image !== canonicalPlan.publicPath) errors.push('draft image does not match its canonical company asset plan');
  if (article.imageAlt !== canonicalPlan.alt) errors.push('draft image alt text does not match its canonical company asset plan');
  if (provenance?.type !== 'company') errors.push('draft provenance type must be company');
  if (provenance?.assetCatalog !== canonicalPlan.assetCatalog) errors.push('draft asset catalog does not match its canonical company asset plan');
  if (provenance?.assetId !== canonicalPlan.assetId) errors.push('draft asset ID does not match its canonical company asset plan');
  if (provenance?.approval !== canonicalPlan.approval) errors.push('draft approval does not match its canonical company asset plan');
  if (provenance?.assetPath !== canonicalPlan.publicPath) errors.push('draft asset path does not match its canonical company asset plan');
  if (provenance?.localPath !== canonicalPlan.localPath) errors.push('draft local path does not match its canonical company asset plan');
  if (provenance?.localHash !== canonicalPlan.localHash) errors.push('draft hash does not match its canonical company asset plan');
  return { errors, article };
}

function restoreSnapshot(backupPath, destinationPath) {
  const temporaryPath = `${destinationPath}.${process.pid}.restore.tmp`;
  fs.copyFileSync(backupPath, temporaryPath);
  fs.renameSync(temporaryPath, destinationPath);
}

function writeAudit(auditPath, audit) {
  try {
    atomicWrite(auditPath, audit);
  } catch (error) {
    console.error(`Unable to persist company asset migration audit: ${error.message}`);
  }
}

function main() {
  if (!isSafePipelineIdentifier(runId)) throw new Error('Pass --run=<campaign>-day-<n> using only letters, numbers, and single hyphens.');
  const runDir = resolvePathWithin(STAGING_DIR, runId);
  const manifestPath = resolvePathWithin(runDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) throw new Error(`Staging manifest does not exist: ${path.relative(ROOT, manifestPath)}`);
  const manifest = readJson(manifestPath, 'staging manifest');
  if (manifest.runId !== runId) throw new Error('Staging manifest runId does not match the requested run.');
  if (!Array.isArray(manifest.tasks)) throw new Error('Staging manifest tasks must be an array.');
  const plannedDrafts = [];
  const changes = [];
  const errors = [];
  const slugs = new Set();

  for (const task of manifest.tasks) {
    if (!task || !isSafePipelineIdentifier(task.slug)) {
      errors.push({ slug: String(task?.slug || '<missing>'), errors: ['task slug must use only letters, numbers, and single hyphens'] });
      continue;
    }
    if (slugs.has(task.slug)) {
      errors.push({ slug: task.slug, errors: ['staging manifest contains a duplicate task slug'] });
      continue;
    }
    slugs.add(task.slug);
    const existingPlan = task.imagePlan;
    const validPlanErrors = validateCompanyImagePlan(existingPlan, ROOT);
    const canonicalResult = validPlanErrors.length === 0
      ? { ok: true, imagePlan: existingPlan }
      : upgradeLegacyCompanyImagePlan(existingPlan, ROOT);
    if (!canonicalResult.ok) {
      errors.push({ slug: task.slug, errors: canonicalResult.errors || validPlanErrors });
      continue;
    }
    const canonicalPlan = canonicalResult.imagePlan;
    const manifestChanged = JSON.stringify(existingPlan) !== JSON.stringify(canonicalPlan);
    if (manifestChanged) task.imagePlan = canonicalPlan;

    const draftPath = resolvePathWithin(runDir, 'drafts', `${task.slug}.json`);
    let draftChanged = false;
    if (fs.existsSync(draftPath)) {
      const article = readJson(draftPath, `staging draft ${task.slug}`);
      const draftResult = manifestChanged
        ? migrateDraft(article, existingPlan, canonicalPlan)
        : validateCanonicalDraft(article, canonicalPlan);
      if (draftResult.errors.length > 0) {
        errors.push({ slug: task.slug, errors: draftResult.errors });
        continue;
      }
      draftChanged = JSON.stringify(article) !== JSON.stringify(draftResult.article);
      if (draftChanged) plannedDrafts.push({ slug: task.slug, draftPath, article: draftResult.article });
    }
    if (manifestChanged || draftChanged) changes.push({ slug: task.slug, manifestChanged, draftChanged });
  }

  if (errors.length > 0) {
    for (const error of errors) console.error(`  HOLD ${error.slug}: ${error.errors.join('; ')}`);
    throw new Error(`Company asset migration rejected ${errors.length} staging task(s). No files were changed.`);
  }

  console.log(`Run: ${runId}`);
  console.log(`Company asset migration: ${changes.length} task(s) need metadata upgrades.`);
  for (const change of changes) console.log(`  ${change.slug}: manifest=${change.manifestChanged}, draft=${change.draftChanged}`);
  if (!apply) {
    console.log('Dry migration validation passed; no staging manifest or draft was changed. Pass --apply to snapshot and upgrade exact legacy catalog matches.');
    return;
  }
  if (changes.length === 0) {
    console.log('All staging tasks already use the trusted company asset catalog.');
    return;
  }

  const migrationId = `company-assets-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const migrationDir = resolvePathWithin(runDir, 'migrations', migrationId);
  const manifestBackupPath = resolvePathWithin(migrationDir, 'manifest.before.json');
  const auditPath = resolvePathWithin(migrationDir, 'audit.json');
  const draftBackups = plannedDrafts.map((draft) => ({
    ...draft,
    backupPath: resolvePathWithin(migrationDir, 'drafts', `${draft.slug}.before.json`),
  }));
  const audit = {
    migrationId,
    runId,
    policy: 'verified_company_assets_only',
    createdAt: new Date().toISOString(),
    manifestBeforeSha256: hashFile(manifestPath),
    changes,
    backups: {
      manifest: 'manifest.before.json',
      drafts: draftBackups.map((draft) => `drafts/${draft.slug}.before.json`),
    },
  };
  fs.mkdirSync(path.join(migrationDir, 'drafts'), { recursive: true });
  fs.copyFileSync(manifestPath, manifestBackupPath);
  for (const draft of draftBackups) fs.copyFileSync(draft.draftPath, draft.backupPath);
  writeAudit(auditPath, audit);

  try {
    manifest.version = Math.max(Number(manifest.version) || 1, 2);
    manifest.assetPolicy = 'verified_company_assets_only';
    manifest.assetCatalog = COMPANY_ASSET_CATALOG_VERSION;
    manifest.assetMigration = {
      migrationId,
      appliedAt: new Date().toISOString(),
      changedTasks: changes.map((change) => change.slug),
    };
    atomicWrite(manifestPath, manifest);
    for (const draft of draftBackups) atomicWrite(draft.draftPath, draft.article);
    audit.appliedAt = new Date().toISOString();
    audit.manifestAfterSha256 = hashFile(manifestPath);
    audit.status = 'applied';
    writeAudit(auditPath, audit);
  } catch (error) {
    const rollbackErrors = [];
    try {
      restoreSnapshot(manifestBackupPath, manifestPath);
    } catch (rollbackError) {
      rollbackErrors.push({ file: path.relative(ROOT, manifestPath), error: rollbackError.message });
    }
    for (const draft of draftBackups) {
      try {
        restoreSnapshot(draft.backupPath, draft.draftPath);
      } catch (rollbackError) {
        rollbackErrors.push({ file: path.relative(ROOT, draft.draftPath), error: rollbackError.message });
      }
    }
    audit.failedAt = new Date().toISOString();
    audit.status = rollbackErrors.length === 0 ? 'rolled_back' : 'partial_failure_manual_recovery';
    audit.error = error.message;
    audit.rollback = { attempted: true, restored: rollbackErrors.length === 0, errors: rollbackErrors };
    writeAudit(auditPath, audit);
    const recovery = rollbackErrors.length === 0 ? 'All staging files were restored from snapshots.' : 'Some staging files could not be restored; manual recovery is required.';
    throw new Error(`Company asset migration failed after snapshots were saved at ${path.relative(ROOT, migrationDir)}: ${error.message}. ${recovery}`);
  }
  console.log(`Migrated ${changes.length} task(s); audit and snapshots: ${path.relative(ROOT, migrationDir)}`);
}

try {
  main();
} catch (error) {
  console.error(`Company asset migration failed: ${error.message}`);
  process.exitCode = 1;
}