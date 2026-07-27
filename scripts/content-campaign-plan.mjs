#!/usr/bin/env node
/**
 * Plan a finite, evidence-backed content campaign for CoolDrivePro.
 *
 * This script plans one thousand distinct English canonical pages over ten days.
 * It creates tasks only; a separate writer stages, validates, and publishes them.
 * Each task has a page type, a topic cluster, an explicit source pack, and a
 * stable daily slot so the production job cannot refill itself with duplicates.
 *
 * Usage:
 *   node scripts/content-campaign-plan.mjs --dry
 *   node scripts/content-campaign-plan.mjs --write
 *   node scripts/content-campaign-plan.mjs --write --campaign=traffic-pages-2026-07
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PIPELINE_DIR = path.join(ROOT, '.omc', 'content-pipeline');
const CAMPAIGN_DIR = path.join(PIPELINE_DIR, 'campaigns');
const ACTIVE_CAMPAIGN_PATH = path.join(PIPELINE_DIR, 'active-campaign.json');
const TOPICS_PATH = path.join(PIPELINE_DIR, 'topics.jsonl');
const BLOG_DIR = path.join(ROOT, 'client', 'public', 'data', 'blog');

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const value = args.find((arg) => arg.startsWith(`--${name}=`));
  return value ? value.slice(name.length + 3) : fallback;
};
const WRITE = args.includes('--write');
const DRY = args.includes('--dry') || !WRITE;
const TODAY = new Date().toISOString().slice(0, 10);
const TARGET = Number(getArg('target', '1000'));
const DAILY_LIMIT = Number(getArg('daily-limit', '100'));
const requestedCampaignId = getArg('campaign', '');
const REPLACE = args.includes('--replace');

if (!Number.isInteger(TARGET) || TARGET < 100) {
  throw new Error('--target must be an integer of at least 100.');
}
if (!Number.isInteger(DAILY_LIMIT) || DAILY_LIMIT < 1) {
  throw new Error('--daily-limit must be a positive integer.');
}
if (TARGET % DAILY_LIMIT !== 0) {
  throw new Error('--target must divide evenly by --daily-limit so daily slots are deterministic.');
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const staticLinks = {
  truck: ['/solutions/truck-ac', '/solutions/semi-truck-parking-ac', '/products/mini-split-ac'],
  rv: ['/solutions/rv-parking-ac', '/solutions/off-grid-rv-air-conditioner', '/products/top-mounted-ac'],
  van: ['/solutions/van-parking-ac', '/solutions/camper-van-parking-ac', '/products/nano-max'],
  fleet: ['/solutions/fleet-parking-ac', '/solutions/no-idle-truck-air-conditioner', '/products/top-mounted-ac'],
  electrical: ['/compare/parking-ac-battery-runtime', '/compare/12v-vs-24v-parking-ac', '/products'],
  distributor: ['/solutions/parking-ac-distributor', '/products', '/about/factory'],
  generic: ['/products', '/solutions/truck-ac', '/contact'],
};

const sourcePacks = {
  truck: ['company-spec-database', 'doe-idle-reduction', 'doe-idle-equipment'],
  rv: ['company-spec-database', 'nrel-pvwatts', 'epa-mvac-service'],
  van: ['company-spec-database', 'nrel-pvwatts', 'epa-mvac-service'],
  fleet: ['company-spec-database', 'doe-idle-reduction', 'doe-idle-equipment', 'atri-trucking-costs'],
  electrical: ['company-spec-database', 'nrel-pvwatts', 'epa-mvac-service'],
  distributor: ['company-spec-database', 'doe-idle-equipment', 'atri-trucking-costs'],
  generic: ['company-spec-database', 'doe-idle-reduction', 'epa-mvac-service'],
};

const applications = [
  ['semi-truck-sleeper', 'Semi Truck Sleeper', 'semi truck sleeper air conditioner', 'truck'],
  ['class-8-truck', 'Class 8 Truck', 'Class 8 truck parking air conditioner', 'truck'],
  ['freightliner-cascadia', 'Freightliner Cascadia', 'Freightliner Cascadia parking air conditioner', 'truck'],
  ['kenworth-t680', 'Kenworth T680', 'Kenworth T680 parking air conditioner', 'truck'],
  ['peterbilt-579', 'Peterbilt 579', 'Peterbilt 579 parking air conditioner', 'truck'],
  ['volvo-vnl', 'Volvo VNL', 'Volvo VNL parking air conditioner', 'truck'],
  ['international-lt', 'International LT', 'International LT sleeper air conditioner', 'truck'],
  ['western-star-49x', 'Western Star 49X', 'Western Star 49X sleeper air conditioner', 'truck'],
  ['ford-transit-van', 'Ford Transit Van', 'Ford Transit van 12V air conditioner', 'van'],
  ['mercedes-sprinter-van', 'Mercedes Sprinter Van', 'Sprinter van 12V air conditioner', 'van'],
  ['ram-promaster-van', 'Ram ProMaster Van', 'Ram ProMaster 12V air conditioner', 'van'],
  ['cargo-van', 'Cargo Van', 'cargo van parking air conditioner', 'van'],
  ['camper-van', 'Camper Van', 'camper van 12V air conditioner', 'van'],
  ['class-b-rv', 'Class B RV', 'Class B RV battery air conditioner', 'rv'],
  ['class-c-motorhome', 'Class C Motorhome', 'Class C motorhome 12V air conditioner', 'rv'],
  ['truck-camper', 'Truck Camper', 'truck camper 12V air conditioner', 'rv'],
  ['skoolie', 'Skoolie Conversion', 'skoolie off-grid air conditioner', 'rv'],
  ['horse-trailer', 'Horse Trailer', 'horse trailer battery air conditioner', 'rv'],
  ['food-truck', 'Food Truck', 'food truck parking air conditioner', 'van'],
  ['construction-trailer', 'Construction Trailer', 'construction trailer battery air conditioner', 'van'],
  ['service-truck', 'Service Truck', 'service truck no-idle air conditioner', 'truck'],
  ['emergency-vehicle', 'Emergency Vehicle', 'emergency vehicle auxiliary air conditioner', 'van'],
  ['mobile-workshop', 'Mobile Workshop', 'mobile workshop 12V air conditioner', 'van'],
  ['fleet-yard', 'Fleet Yard', 'fleet truck no-idle cooling', 'fleet'],
];

const applicationAngles = [
  ['buyer-guide', 'Buyer Guide', 'commercial', 'Compare cooling formats, power planning, and the questions to confirm before buying.'],
  ['battery-runtime', 'Battery Runtime and Power Planning', 'commercial', 'Explain runtime planning with transparent assumptions rather than fixed promises.'],
  ['installation', 'Installation Planning Guide', 'informational', 'Cover roof space, wiring, service access, and where professional installation is appropriate.'],
  ['no-idle', 'No-Idle Cooling Guide', 'commercial', 'Connect parked cooling needs with idle reduction, driver comfort, and operational constraints.'],
  ['maintenance', 'Maintenance and Service Checklist', 'informational', 'Cover inspection, airflow, electrical checks, and when to use a qualified technician.'],
  ['cost', 'Cost and ROI Guide', 'commercial', 'Use sourced ranges and explain variables instead of presenting a universal saving claim.'],
  ['sizing', 'Sizing and Capacity Guide', 'commercial', 'Explain the cabin, insulation, ambient heat, and operating conditions that affect capacity selection.'],
  ['solar', 'Solar-Assisted Power Guide', 'commercial', 'Explain how solar can extend a documented power plan without presenting it as a replacement for battery sizing.'],
  ['hot-weather', 'Hot-Weather Cooling Guide', 'informational', 'Cover high-ambient planning, shading, airflow, and realistic performance expectations.'],
  ['overnight', 'Overnight Comfort Guide', 'commercial', 'Focus on overnight duty cycle, sleeping comfort, and quiet operation planning.'],
  ['comparison', 'Rooftop vs Mini-Split Comparison', 'commercial', 'Compare installation, service access, form factor, and power-planning tradeoffs.'],
  ['fitment', 'Fitment and Roof-Space Checklist', 'commercial', 'Help buyers measure roof openings, clearance, payload, and service access before asking for fitment confirmation.'],
  ['electrical-integration', 'Electrical Integration Guide', 'informational', 'Explain charging, protection, cable routing, and the checks that a qualified installer must complete.'],
  ['service-planning', 'Service and Repair Planning Guide', 'informational', 'Cover documentation, access, inspection, and service-network questions before installation.'],
  ['operating-cost', 'Operating-Cost Variables Guide', 'commercial', 'Explain the measurable duty-cycle and energy variables behind operating-cost comparisons.'],
];

const electricalProfiles = [
  ['12v-100ah', '12V 100Ah', '12V 100Ah battery parking AC runtime'],
  ['12v-200ah', '12V 200Ah', '12V 200Ah battery parking AC runtime'],
  ['12v-300ah', '12V 300Ah', '12V 300Ah battery parking AC runtime'],
  ['24v-100ah', '24V 100Ah', '24V 100Ah battery parking AC runtime'],
  ['24v-200ah', '24V 200Ah', '24V 200Ah battery parking AC runtime'],
  ['24v-280ah', '24V 280Ah', '24V 280Ah battery parking AC runtime'],
  ['24v-400ah', '24V 400Ah', '24V 400Ah battery parking AC runtime'],
  ['solar-400w', '400W Solar', '400W solar parking air conditioner setup'],
  ['solar-800w', '800W Solar', '800W solar parking air conditioner setup'],
  ['solar-1200w', '1200W Solar', '1200W solar parking air conditioner setup'],
  ['dc-dc-charger', 'DC-DC Charging', 'DC-DC charger for parking air conditioner battery'],
  ['shore-power', 'Shore Power Charging', 'shore power charging for parking AC battery'],
  ['alternator-charging', 'Alternator Charging', 'alternator charging for truck parking AC battery'],
  ['lithium-bms', 'LiFePO4 BMS', 'LiFePO4 BMS for parking air conditioner'],
  ['cable-fuse', 'Cable and Fuse Protection', 'parking AC cable and fuse sizing'],
];

const electricalAngles = [
  ['planning', 'Planning Guide', 'commercial', 'Explain the calculation inputs, efficiency losses, and the limits of a planning estimate.'],
  ['calculator', 'Calculator Inputs Explained', 'informational', 'Turn a generic calculator query into a transparent method with worked assumptions.'],
  ['mistakes', 'Common Design Mistakes', 'informational', 'Focus on preventable wiring, charging, and battery-protection mistakes.'],
  ['buyer-guide', 'Buyer Guide', 'commercial', 'Help buyers compare components without inventing component compatibility.'],
  ['installation', 'Installation Checklist', 'informational', 'List safe preparation, verification, and professional-service handoff steps.'],
  ['troubleshooting', 'Troubleshooting Guide', 'informational', 'Address low-voltage, charging, heat, and load-management symptoms.'],
  ['heat-loss', 'Heat Loss and Efficiency Guide', 'informational', 'Explain conversion and temperature-loss factors that turn nominal battery capacity into usable energy.'],
  ['upgrade', 'System Upgrade Guide', 'commercial', 'Help users identify which part of a documented power system is the limiting factor before upgrading.'],
  ['safety', 'Electrical Safety Checklist', 'informational', 'Cover isolation, overcurrent protection, cable routing, and technician boundaries.'],
  ['seasonal-use', 'Seasonal Use Guide', 'informational', 'Explain storage, charging, temperature, and periodic inspection considerations.'],
];

const productModels = [
  ['vs02-pro', 'CoolDrivePro VS02 PRO', 'top-mounted parking AC'],
  ['vx3000sp', 'CoolDrivePro VX3000SP', 'mini split parking AC'],
  ['nano-max', 'CoolDrivePro Nano Max', 'compact parking AC'],
  ['v-th1', 'CoolDrivePro V-TH1', 'heating and cooling parking AC'],
  ['dometic-rtx-2000', 'Dometic RTX 2000', 'Dometic RTX 2000 parking air conditioner'],
  ['webasto-cool-top-trail-20', 'Webasto Cool Top Trail 20', 'Webasto Cool Top Trail 20 parking air conditioner'],
  ['rigmaster-t-series', 'RigMaster T Series', 'RigMaster T Series truck APU'],
  ['indel-b-sleeping-well-oblo', 'Indel B Sleeping Well Oblo', 'Indel B Sleeping Well Oblo parking air conditioner'],
  ['carrier-comfort-pro-apu-ac', 'Carrier Comfort Pro APU-AC', 'Carrier Comfort Pro APU-AC']
];

const productAngles = [
  ['specs-explained', 'Specifications Explained', 'informational', 'Interpret published data fields without adding claims not present in the source.'],
  ['buyer-fit', 'Buyer Fit Guide', 'commercial', 'Explain which decision variables a buyer should compare before asking for a quote.'],
  ['power-planning', 'Power Planning Guide', 'commercial', 'Explain voltage and consumption planning using published values and assumptions.'],
  ['noise-maintenance', 'Noise and Maintenance Guide', 'informational', 'Use published noise figures as context, not a guarantee of in-vehicle noise.'],
  ['alternatives', 'Alternatives and Tradeoffs', 'commercial', 'Compare form factor and operating tradeoffs with neutral language.'],
  ['installation-review', 'Installation Review', 'informational', 'Explain what must be verified before any model-specific installation claim.'],
  ['fleet-review', 'Fleet Procurement Review', 'commercial', 'Frame procurement questions, documentation, and service planning.'],
  ['ownership-cost', 'Ownership Cost Questions', 'commercial', 'Describe the variables that drive ownership cost instead of fabricating a TCO number.'],
  ['service-parts', 'Service and Parts Planning Guide', 'commercial', 'Explain documentation, service access, and spare-parts questions to resolve before purchase.'],
  ['operating-limits', 'Operating Limits Guide', 'informational', 'Explain why the published installation and operating documentation controls model-specific limitations.']
];

const problems = [
  ['not-cooling', 'Parking AC Not Cooling', 'parking AC not cooling'],
  ['low-voltage', 'Parking AC Low Voltage Shutdown', 'parking AC low voltage shutdown'],
  ['compressor-not-starting', 'Parking AC Compressor Not Starting', 'parking AC compressor not starting'],
  ['making-noise', 'Parking AC Making Noise', 'parking AC making noise'],
  ['freezing-up', 'Parking AC Freezing Up', 'parking AC freezing up'],
  ['water-leak', 'Parking AC Water Leak', 'parking AC water leak'],
  ['poor-airflow', 'Parking AC Poor Airflow', 'parking AC poor airflow'],
  ['battery-drain', 'Parking AC Battery Drain', 'parking AC battery drain'],
  ['remote-not-working', 'Parking AC Remote Not Working', 'parking AC remote not working'],
  ['error-codes', 'Parking AC Error Codes', 'parking AC error codes'],
  ['vibration', 'Parking AC Vibration', 'parking AC vibration'],
  ['fuse-blowing', 'Parking AC Fuse Blowing', 'parking AC fuse blowing'],
  ['intermittent-power', 'Parking AC Intermittent Power', 'parking AC intermittent power'],
  ['hot-air', 'Parking AC Blowing Hot Air', 'parking AC blowing hot air'],
  ['condensation', 'Parking AC Condensation', 'parking AC condensation'],
  ['refrigerant-service', 'Parking AC Refrigerant Service', 'parking AC refrigerant service'],
  ['fan-not-spinning', 'Parking AC Fan Not Spinning', 'parking AC fan not spinning'],
  ['high-ambient', 'Parking AC in Extreme Heat', 'parking AC extreme heat performance'],
  ['winter-storage', 'Parking AC Winter Storage', 'parking AC winter storage'],
  ['filter-cleaning', 'Parking AC Filter Cleaning', 'parking AC filter cleaning'],
  ['roof-seal', 'Parking AC Roof Seal Leak', 'parking AC roof seal leak'],
  ['charger-not-keeping-up', 'Parking AC Charger Not Keeping Up', 'parking AC charger not keeping up'],
  ['solar-not-charging', 'Parking AC Solar Not Charging', 'parking AC solar not charging'],
  ['battery-overheat', 'Parking AC Battery Overheating', 'parking AC battery overheating'],
  ['noise-at-night', 'Parking AC Noise at Night', 'quiet parking AC at night'],
  ['reduced-runtime', 'Parking AC Reduced Runtime', 'parking AC reduced runtime'],
  ['smell', 'Parking AC Bad Smell', 'parking AC bad smell'],
  ['breaker-tripping', 'Parking AC Breaker Tripping', 'parking AC breaker tripping'],
  ['display-fault', 'Parking AC Display Fault', 'parking AC display fault'],
  ['service-interval', 'Parking AC Service Interval', 'parking AC service interval']
];

const problemAngles = [
  ['diagnose', 'Diagnosis Guide', 'informational', 'Provide a safety-first decision tree and identify when to stop and call a technician.'],
  ['causes', 'Common Causes and Checks', 'informational', 'Distinguish observable symptoms from repairs requiring refrigerant or electrical certification.'],
  ['prevention', 'Prevention Checklist', 'informational', 'Give maintenance and operating practices that reduce recurrence.'],
  ['repair-or-replace', 'Repair or Replace Decision Guide', 'commercial', 'Explain decision variables and link to product selection only when replacement is appropriate.'],
  ['technician-handoff', 'Technician Handoff Checklist', 'informational', 'Help an owner record symptoms, operating conditions, and visible checks before professional service.'],
  ['seasonal-prevention', 'Seasonal Prevention Guide', 'informational', 'Explain the seasonal inspections and storage practices relevant to the reported symptom.']
];

const procurementTopics = [
  'parking AC OEM supplier', 'parking AC wholesale supplier', 'parking AC distributor program',
  'parking AC private label manufacturer', 'truck AC factory direct supplier', 'fleet parking AC procurement',
  'parking AC supplier verification', 'parking AC MOQ', 'parking AC warranty for distributors',
  'parking AC after-sales service plan', 'parking AC container shipping', 'parking AC import documentation',
  'parking AC quality control checklist', 'parking AC product sample evaluation', 'parking AC dealer onboarding',
  'parking AC regional distributor strategy', 'parking AC B2B pricing request', 'parking AC installer program',
  'parking AC spare parts planning', 'parking AC fleet rollout plan'
];

const procurementAngles = [
  ['buyer-guide', 'Buyer Guide', 'commercial'],
  ['checklist', 'Checklist', 'informational'],
  ['questions', 'Questions to Ask', 'commercial'],
  ['process', 'Process Guide', 'informational'],
  ['risk-review', 'Risk Review', 'commercial'],
  ['comparison-framework', 'Comparison Framework', 'commercial']
];

const markets = [
  'United States', 'Canada', 'Mexico', 'Australia', 'New Zealand', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
  'Poland', 'Netherlands', 'Sweden', 'Norway', 'South Africa', 'Saudi Arabia', 'United Arab Emirates', 'Turkey', 'Brazil', 'Chile',
  'Japan', 'South Korea', 'Thailand', 'Vietnam', 'Malaysia', 'Indonesia', 'India', 'Philippines', 'Kenya', 'Nigeria'
];

const marketAngles = [
  ['buyer-guide', 'Buyer Guide', 'commercial'],
  ['distributor', 'Distributor Planning Guide', 'commercial'],
  ['climate-power', 'Climate and Power Planning Guide', 'informational'],
  ['service-planning', 'Service Planning Guide', 'commercial']
];

function buildTopic({ clusterId, pageType, slug, title, primaryKeyword, secondaryKeywords, intent, priority, outlineHints, sourceIds, linkGroup }) {
  return {
    id: `campaign-${slug}`,
    slug,
    title,
    category: pageType,
    pageType,
    clusterId,
    primaryKeyword,
    secondaryKeywords: unique(secondaryKeywords).slice(0, 12),
    intent,
    priority,
    outlineHints,
    sourceIds: unique(sourceIds),
    internalLinkTargets: staticLinks[linkGroup] || staticLinks.generic,
    status: 'planned',
    createdAt: TODAY,
    addedBy: 'content-campaign-plan',
  };
}

function buildCandidates() {
  const candidates = [];
  const add = (topic) => candidates.push(topic);

  for (const [applicationSlug, application, keyword, linkGroup] of applications) {
    for (const [angleSlug, angle, intent, detail] of applicationAngles) {
      add(buildTopic({
        clusterId: `application-${applicationSlug}`,
        pageType: 'Application Guide',
        slug: `${applicationSlug}-parking-ac-${angleSlug}`,
        title: `${application} Parking AC ${angle} (2026)`,
        primaryKeyword: `${keyword} ${angle.toLowerCase()}`,
        secondaryKeywords: [keyword, `${application.toLowerCase()} no-idle cooling`, '12V parking AC', '24V parking AC', 'battery-powered air conditioner'],
        intent,
        priority: intent === 'commercial' ? 92 : 78,
        outlineHints: [detail, 'Use actual product data only where it is cited.', 'Add a fitment-verification checklist.', 'Link to the closest product and solution page.'],
        sourceIds: sourcePacks[linkGroup] || sourcePacks.generic,
        linkGroup,
      }));
    }
  }

  for (const [profileSlug, profile, keyword] of electricalProfiles) {
    for (const [angleSlug, angle, intent, detail] of electricalAngles) {
      add(buildTopic({
        clusterId: `electrical-${profileSlug}`,
        pageType: 'Power System Guide',
        slug: `${profileSlug}-parking-ac-${angleSlug}`,
        title: `${profile} Parking AC ${angle} (2026)`,
        primaryKeyword: `${keyword} ${angle.toLowerCase()}`,
        secondaryKeywords: [keyword, 'parking AC battery runtime', '12V parking AC', '24V parking AC', 'LiFePO4 battery', 'DC-DC charger'],
        intent,
        priority: intent === 'commercial' ? 88 : 74,
        outlineHints: [detail, 'Show the formula and assumptions before any estimated runtime.', 'Avoid guaranteed runtime claims.', 'Include a safety and professional-installation boundary.'],
        sourceIds: sourcePacks.electrical,
        linkGroup: 'electrical',
      }));
    }
  }

  for (const [modelSlug, model, keyword] of productModels) {
    for (const [angleSlug, angle, intent, detail] of productAngles) {
      add(buildTopic({
        clusterId: `product-${modelSlug}`,
        pageType: 'Product Research Guide',
        slug: `${modelSlug}-${angleSlug}`,
        title: `${model}: ${angle} (2026)`,
        primaryKeyword: `${keyword} ${angle.toLowerCase()}`,
        secondaryKeywords: [keyword, 'parking air conditioner specifications', 'parking AC buyer guide', '12V parking AC', '24V parking AC'],
        intent,
        priority: intent === 'commercial' ? 90 : 76,
        outlineHints: [detail, 'Separate published specifications from buyer interpretation.', 'Do not claim unverified vehicle compatibility.', 'Provide a neutral comparison checklist.'],
        sourceIds: sourcePacks.generic,
        linkGroup: 'truck',
      }));
    }
  }

  for (const [problemSlug, problem, keyword] of problems) {
    for (const [angleSlug, angle, intent, detail] of problemAngles) {
      add(buildTopic({
        clusterId: `troubleshooting-${problemSlug}`,
        pageType: 'Troubleshooting Guide',
        slug: `${problemSlug}-${angleSlug}`,
        title: `${problem}: ${angle} (2026)`,
        primaryKeyword: `${keyword} ${angle.toLowerCase()}`,
        secondaryKeywords: [keyword, 'parking AC troubleshooting', 'parking air conditioner maintenance', 'battery-powered air conditioner service'],
        intent,
        priority: intent === 'commercial' ? 82 : 70,
        outlineHints: [detail, 'Put safety and high-voltage or refrigerant boundaries first.', 'Use symptom-based diagnostics.', 'Link to service and replacement paths only when justified.'],
        sourceIds: sourcePacks.electrical,
        linkGroup: 'electrical',
      }));
    }
  }

  for (const phrase of procurementTopics) {
    for (const [angleSlug, angle, intent] of procurementAngles) {
      add(buildTopic({
        clusterId: `procurement-${slugify(phrase)}`,
        pageType: 'B2B Procurement Guide',
        slug: `${slugify(phrase)}-${angleSlug}`,
        title: `${phrase.replace(/\b\w/g, (letter) => letter.toUpperCase())}: ${angle} (2026)`,
        primaryKeyword: `${phrase} ${angle.toLowerCase()}`,
        secondaryKeywords: [phrase, 'parking AC manufacturer', 'parking AC product specifications', 'parking AC quality control', 'parking AC after-sales support'],
        intent,
        priority: 86,
        outlineHints: ['Use company facts only where documented.', 'Give buyers a source-verification checklist.', 'Do not make unverified production, certification, or delivery promises.'],
        sourceIds: sourcePacks.distributor,
        linkGroup: 'distributor',
      }));
    }
  }

  for (const market of markets) {
    for (const [angleSlug, angle, intent] of marketAngles) {
      add(buildTopic({
        clusterId: `market-${slugify(market)}`,
        pageType: 'Market Guide',
        slug: `${slugify(market)}-parking-ac-${angleSlug}`,
        title: `${market} Parking AC ${angle} (2026)`,
        primaryKeyword: `${market.toLowerCase()} parking air conditioner ${angle.toLowerCase()}`,
        secondaryKeywords: [`${market.toLowerCase()} parking AC`, '12V parking AC', '24V parking AC', 'parking AC distributor'],
        intent,
        priority: 72,
        outlineHints: ['Use general planning language unless a primary local source is available.', 'Explain climate, voltage, service, and import questions to validate.', 'Never invent local dealer, regulation, or shipping facts.'],
        sourceIds: sourcePacks.generic,
        linkGroup: 'distributor',
      }));
    }
  }

  return candidates;
}

function selectCampaignId() {
  if (requestedCampaignId) return requestedCampaignId;
  if (fs.existsSync(ACTIVE_CAMPAIGN_PATH)) {
    try {
      const active = JSON.parse(fs.readFileSync(ACTIVE_CAMPAIGN_PATH, 'utf8'));
      if (active.status === 'active' && active.id) return active.id;
    } catch {}
  }
  return `traffic-pages-${TODAY}`;
}

const campaignId = selectCampaignId();
const campaignTopicsPath = path.join(CAMPAIGN_DIR, `${campaignId}.topics.jsonl`);
const campaignPath = path.join(CAMPAIGN_DIR, `${campaignId}.json`);
const existingTopics = readJsonl(TOPICS_PATH);
const knownSlugs = new Set([
  ...existingTopics.map((topic) => topic.slug),
  ...fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith('.json')).map((file) => file.replace(/\.json$/, '')),
]);
const candidates = buildCandidates();
const selected = [];
const seenKeywords = new Set();

for (const candidate of candidates
  .sort((left, right) => right.priority - left.priority || left.slug.localeCompare(right.slug))) {
  if (selected.length >= TARGET) break;
  const normalizedKeyword = slugify(candidate.primaryKeyword);
  if (knownSlugs.has(candidate.slug) || seenKeywords.has(normalizedKeyword)) continue;
  seenKeywords.add(normalizedKeyword);
  knownSlugs.add(candidate.slug);
  selected.push(candidate);
}

if (selected.length < TARGET) {
  throw new Error(`Only ${selected.length} non-duplicate candidates are available; target is ${TARGET}.`);
}

for (const [index, topic] of selected.entries()) {
  topic.campaignId = campaignId;
  topic.campaignDay = Math.floor(index / DAILY_LIMIT) + 1;
  topic.campaignSlot = (index % DAILY_LIMIT) + 1;
  topic.status = 'planned';
}

const campaign = {
  id: campaignId,
  status: 'active',
  createdAt: TODAY,
  startDate: TODAY,
  targetPages: TARGET,
  dailyLimit: DAILY_LIMIT,
  totalDays: TARGET / DAILY_LIMIT,
  language: 'en',
  indexable: true,
  sources: 'scripts/content-source-catalog.json',
  topicsPath: path.relative(ROOT, campaignTopicsPath),
  topicCount: selected.length,
};

const typeCounts = Object.entries(selected.reduce((counts, topic) => {
  counts[topic.pageType] = (counts[topic.pageType] || 0) + 1;
  return counts;
}, {})).sort((left, right) => right[1] - left[1]);

console.log(`Campaign: ${campaignId}`);
console.log(`Mode: ${DRY ? 'dry run' : 'write'}`);
console.log(`Pages: ${selected.length} across ${campaign.totalDays} days at ${DAILY_LIMIT}/day`);
console.log('Page types:');
for (const [type, count] of typeCounts) console.log(`  ${count.toString().padStart(4)} ${type}`);
console.log('First-day examples:');
for (const topic of selected.filter((topic) => topic.campaignDay === 1).slice(0, 8)) {
  console.log(`  ${topic.campaignSlot.toString().padStart(3)} ${topic.slug} [${topic.clusterId}]`);
}

if (!DRY) {
  fs.mkdirSync(CAMPAIGN_DIR, { recursive: true });
  if ((fs.existsSync(campaignPath) || fs.existsSync(campaignTopicsPath)) && !REPLACE) {
    throw new Error(`Campaign ${campaignId} already exists. Use --replace only after reviewing its prior state.`);
  }
  fs.writeFileSync(campaignPath, `${JSON.stringify(campaign, null, 2)}\n`);
  fs.writeFileSync(campaignTopicsPath, `${selected.map((topic) => JSON.stringify(topic)).join('\n')}\n`);
  fs.writeFileSync(ACTIVE_CAMPAIGN_PATH, `${JSON.stringify(campaign, null, 2)}\n`);
  console.log(`Wrote ${selected.length} planned topics and activated ${campaignId}.`);
}