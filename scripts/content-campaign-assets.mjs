import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const COMPANY_ASSET_CATALOG_VERSION = 'company-assets-2026-07';

export const COMPANY_IMAGE_ASSETS = Object.freeze([
  {
    id: 'vs02pro-truck-hero',
    approval: 'company-owned',
    sha256: 'f312897f72170fd8abd3bfc7453912159565faa842815325176b64452c02c28e',
    matches: ['product-vs02-pro', 'semi-truck', 'class-8', 'freightliner', 'kenworth', 'peterbilt', 'volvo-vnl', 'international-lt', 'western-star', 'service-truck'],
    publicPath: '/images/products/vs02pro/vs02pro-01-hero.webp',
    alt: 'CoolDrivePro VS02 PRO top-mounted parking air conditioner installed for truck sleeper cooling',
  },
  {
    id: 'vx3000-rv-hero',
    approval: 'company-owned',
    sha256: '9847a3803b97c7b891935388ac8a0b28fba65f8e0684a681d89336f085173a09',
    matches: ['product-vx3000sp', 'rv', 'motorhome', 'truck-camper', 'skoolie', 'horse-trailer'],
    publicPath: '/images/products/vx3000-mini-split.webp',
    alt: 'CoolDrivePro VX3000SP mini-split parking air conditioner for RV and custom installations',
  },
  {
    id: 'nano-max-van-hero',
    approval: 'company-owned',
    sha256: 'f1ba4bb4905fa27971ceb07e998ac02aaf0ae03eec17fb61e320aef67f787512',
    matches: ['product-nano-max', 'van', 'sprinter', 'transit', 'promaster', 'cargo-van', 'food-truck', 'mobile-workshop'],
    publicPath: '/images/scenes/ac-scene-van-rooftop.jpg',
    alt: 'Rooftop parking air conditioner on a commercial van',
  },
  {
    id: 'vth1-hero',
    approval: 'company-owned',
    sha256: '2c27b2cf933d9e9272d7dc5f42b4cc7b0c74557debbccfca4f09b33330de451b',
    matches: ['product-v-th1'],
    publicPath: '/images/products/vth1-outdoor-top.webp',
    alt: 'CoolDrivePro V-TH1 heating and cooling parking air conditioner unit',
  },
  {
    id: 'factory-assembly',
    approval: 'company-owned',
    sha256: '3489b59a80acaa715268080a6b1deabe431a04a312e6609a32921562cf2c58b7',
    matches: ['b2b-procurement', 'distributor', 'supplier', 'wholesale', 'oem', 'private-label', 'factory'],
    publicPath: '/images/factory/cooldrivepro-production-line-assembly.webp',
    alt: 'CoolDrivePro parking air conditioner production line assembly',
  },
  {
    id: 'vx3000-power-diagram',
    approval: 'company-owned',
    sha256: 'aa788696db6bc90c7594f37d85787785151feffb54d00d7701793a90c59d655b',
    matches: ['power-system', 'electrical', 'battery', 'solar', 'charger', 'lifepo4'],
    publicPath: '/images/products/vx3000-split-system-diagram.webp',
    alt: 'Parking air conditioner electrical system and component diagram',
  },
  {
    id: 'vs02pro-service-detail',
    approval: 'company-owned',
    sha256: '168aa6f3cfc941b8d007a7a4da906c223fd27a89af01e73e97ac5015f8a26db7',
    matches: ['troubleshooting', 'maintenance', 'service'],
    publicPath: '/images/products/vs02pro/vs02pro-10-indoor-closeup.webp',
    alt: 'CoolDrivePro parking air conditioner indoor unit and service-access detail',
  },
  {
    id: 'rooftop-installation-default',
    approval: 'company-owned',
    sha256: 'e4faeebf86e9bace3e26e63ce10ba72a213b74ef22e9abcb1c9b7cff91dd5cb6',
    matches: [],
    publicPath: '/images/scenes/ac-scene-rooftop-unit.jpg',
    alt: 'Rooftop parking air conditioner installation scene',
  },
]);

const SHA256_PATTERN = /^[a-f0-9]{64}$/i;
const COMPANY_ASSET_APPROVAL = 'company-owned';

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function assetPath(root, publicPath) {
  const publicDir = path.resolve(root, 'client', 'public');
  const resolved = path.resolve(publicDir, publicPath.replace(/^\//, ''));
  return resolved.startsWith(`${publicDir}${path.sep}`) ? resolved : null;
}

function selectedAsset(topic) {
  const haystack = `${topic.clusterId || ''} ${topic.slug || ''} ${topic.pageType || ''}`.toLowerCase();
  return COMPANY_IMAGE_ASSETS.find((asset) => asset.matches.some((match) => haystack.includes(match)))
    || COMPANY_IMAGE_ASSETS.at(-1);
}

function canonicalImagePlan(asset, root) {
  const localAssetPath = assetPath(root, asset.publicPath);
  if (!localAssetPath || !fs.existsSync(localAssetPath)) {
    return { ok: false, error: `company image asset is missing: ${asset.publicPath}` };
  }
  if (asset.approval !== COMPANY_ASSET_APPROVAL) {
    return { ok: false, error: `company image asset is not approved: ${asset.id}` };
  }
  if (!SHA256_PATTERN.test(String(asset.sha256 || ''))) {
    return { ok: false, error: `company image asset has no valid approved SHA-256: ${asset.id}` };
  }
  if (hashFile(localAssetPath) !== asset.sha256) {
    return { ok: false, error: `company image asset hash does not match its approved catalog baseline: ${asset.publicPath}` };
  }
  return {
    ok: true,
    imagePlan: {
      type: 'company',
      assetCatalog: COMPANY_ASSET_CATALOG_VERSION,
      assetId: asset.id,
      approval: asset.approval,
      publicPath: asset.publicPath,
      alt: asset.alt,
      localPath: path.relative(root, localAssetPath),
      localHash: hashFile(localAssetPath),
      usage: 'Use this verified CoolDrivePro company asset as the article hero image.',
    },
  };
}

export function createCompanyImagePlan(topic, root) {
  const asset = selectedAsset(topic);
  return canonicalImagePlan(asset, root);
}

export function validateCompanyImagePlan(imagePlan, root) {
  const errors = [];
  if (!imagePlan || typeof imagePlan !== 'object') return ['missing company image plan'];
  if (imagePlan.type !== 'company') errors.push('image plan type must be company');
  if (imagePlan.assetCatalog !== COMPANY_ASSET_CATALOG_VERSION) errors.push('image plan uses an untrusted company asset catalog');
  if (imagePlan.approval !== COMPANY_ASSET_APPROVAL) errors.push('image plan is not approved as a company-owned asset');
  if (!SHA256_PATTERN.test(String(imagePlan.localHash || ''))) errors.push('image plan requires a SHA-256 local hash');

  const asset = COMPANY_IMAGE_ASSETS.find((candidate) => candidate.id === imagePlan.assetId);
  if (!asset) return [...errors, 'image plan asset ID is not in the trusted company catalog'];
  if (asset.approval !== COMPANY_ASSET_APPROVAL) errors.push('company asset catalog approval is invalid');
  if (!SHA256_PATTERN.test(String(asset.sha256 || ''))) errors.push('company asset catalog SHA-256 is invalid');
  if (imagePlan.publicPath !== asset.publicPath) errors.push('image plan public path does not match its company asset ID');
  if (imagePlan.alt !== asset.alt) errors.push('image plan alt text does not match its company asset ID');
  if (imagePlan.approval !== asset.approval) errors.push('image plan approval does not match its company asset ID');
  if (imagePlan.localHash !== asset.sha256) errors.push('image plan hash does not match its company asset ID');

  const localAssetPath = assetPath(root, asset.publicPath);
  if (!localAssetPath || !fs.existsSync(localAssetPath)) return [...errors, `company image asset is missing: ${asset.publicPath}`];
  const expectedLocalPath = path.relative(root, localAssetPath);
  if (path.normalize(String(imagePlan.localPath || '')) !== expectedLocalPath) {
    errors.push('image plan local path does not match its company asset ID');
  }
  if (hashFile(localAssetPath) !== asset.sha256) {
    errors.push('company image asset hash does not match its approved catalog baseline');
  }
  return errors;
}

export function upgradeLegacyCompanyImagePlan(imagePlan, root) {
  if (!imagePlan || typeof imagePlan !== 'object') {
    return { ok: false, errors: ['missing legacy company image plan'] };
  }
  if ('assetCatalog' in imagePlan || 'assetId' in imagePlan || 'approval' in imagePlan) {
    return { ok: false, errors: ['partially identified image plans must be rejected instead of migrated'] };
  }
  if (imagePlan.type !== 'company') return { ok: false, errors: ['legacy image plan type must be company'] };
  if (!SHA256_PATTERN.test(String(imagePlan.localHash || ''))) {
    return { ok: false, errors: ['legacy image plan requires a SHA-256 local hash'] };
  }
  const asset = COMPANY_IMAGE_ASSETS.find((candidate) => candidate.publicPath === imagePlan.publicPath);
  if (!asset) return { ok: false, errors: ['legacy image plan public path is not in the trusted company catalog'] };
  if (imagePlan.alt !== asset.alt) return { ok: false, errors: ['legacy image plan alt text does not match the trusted company catalog'] };

  const canonical = canonicalImagePlan(asset, root);
  if (!canonical.ok) return { ok: false, errors: [canonical.error] };
  if (imagePlan.localPath !== canonical.imagePlan.localPath) {
    return { ok: false, errors: ['legacy image plan local path does not match the trusted company catalog'] };
  }
  if (imagePlan.localHash !== canonical.imagePlan.localHash) {
    return { ok: false, errors: ['legacy image plan hash does not match the current company asset'] };
  }
  return canonical;
}