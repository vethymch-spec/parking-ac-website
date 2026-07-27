#!/usr/bin/env node
/**
 * topic-keyword-generator.mjs
 * Auto-fills the topic queue with high-value, non-duplicate keyword targets.
 *
 * Sources (in priority order):
 *   1. Curated KEYWORD_BANK below — hand-picked high-intent commercial keywords for parking AC niche
 *   2. Topic expansion: combines (vehicle) × (specific need) × (modifier) for long-tail
 *   3. Question keywords: how/why/what/can prefixes
 *   4. Comparison: A vs B, A or B
 *
 * Filters:
 *   - Skip if slug already exists in client/public/data/blog/
 *   - Skip if primary keyword already targeted (substring match in existing titles)
 *   - Skip if slug already in topics.jsonl (queued or published)
 *
 * Output: appends to .omc/content-pipeline/topics.jsonl
 *
 * Usage:
 *   node scripts/topic-keyword-generator.mjs --max=20
 *   node scripts/topic-keyword-generator.mjs --max=50 --dry
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'client', 'public', 'data', 'blog');
const TOPICS_FILE = path.join(ROOT, '.omc', 'content-pipeline', 'topics.jsonl');

const MAX = (() => { const a = process.argv.find(x => x.startsWith('--max=')); return a ? parseInt(a.split('=')[1], 10) : 20; })();
const DRY = process.argv.includes('--dry');

// ============ KEYWORD BANK ============
// Format: [primaryKeyword, title, category, estVolume, intent, hints, dataSourceHint, internalLinks]
const KEYWORD_BANK = [
  // === High-intent commercial ===
  ['truck sleeper ac unit reviews', 'Truck Sleeper AC Unit Reviews 2026: 9 Models Tested for Long-Haul Drivers', 'Reviews & Comparisons', 1100, 'commercial', ['What "sleeper AC" means vs cabin AC', 'Required BTU by sleeper size', '9 unit head-to-head', 'Noise dB at sleeping distance', 'Battery draw per night', 'Warranty terms by brand'], 'parking-ac-spec-database', ['best-parking-ac-2026','12v-vs-24v-parking-ac']],
  ['12v rooftop ac for trucks', '12V Rooftop AC for Trucks: Top-Mount Units Compared (2026)', 'Reviews & Comparisons', 880, 'commercial', ['Top-mount vs split system tradeoffs','Roof load calculations','Aerodynamic drag impact on MPG','Sealing and water-ingress prevention','9 top-mount models compared','Install difficulty rating'], 'parking-ac-spec-database', ['best-parking-ac-2026','parking-ac-buying-guide-2025']],
  ['battery powered rv air conditioner', 'Battery Powered RV Air Conditioner: Complete 2026 Buyer Guide', 'Buying Guides', 2400, 'commercial', ['LiFePO4 vs lead-acid runtime math','Inverter vs native DC AC','How many Ah for 8 hours of cooling','Solar offset calculations','5 RV-specific models','Off-grid use case scenarios'], 'parking-ac-spec-database', ['12v-vs-24v-parking-ac','best-parking-ac-2026']],
  ['no idle truck ac', 'No-Idle Truck AC Systems: How to Comply with State Anti-Idling Laws (2026)', 'Industry News', 720, 'commercial', ['EPA SmartWay verification list','State-by-state idle time limits','Fines for violation','APU vs battery-electric AC vs DC AC','Driver comfort vs compliance','TCO comparison'], 'us-anti-idling-laws-by-state', ['parking-ac-fuel-savings-calculator','best-parking-ac-2026']],
  ['parking ac btu sizing', 'Parking AC BTU Sizing Calculator: How Many BTUs Do You Really Need?', 'Tools & Calculators', 590, 'commercial', ['Cabin volume formula','Insulation R-value adjustments','Climate zone multipliers','Sun exposure factor','Number of occupants','Realistic worked examples for truck/RV/van'], null, ['parking-ac-fuel-savings-calculator','parking-ac-buying-guide-2025']],
  ['truck ac power consumption', 'Truck AC Power Consumption: Watts, Amps, and Battery Drain Explained', 'How-To Guides', 480, 'informational', ['How to read W/Ah specs','Compressor LRA vs running amps','Inrush current and cable sizing','24-hour duty cycle math','Battery bank sizing','Solar offset feasibility'], 'parking-ac-spec-database', ['12v-vs-24v-parking-ac','battery-powered-rv-air-conditioner']],

  // === Comparison / vs ===
  ['parking ac vs apu', 'Parking AC vs Diesel APU: Cost, Noise, Maintenance, Lifecycle (2026)', 'Reviews & Comparisons', 590, 'commercial', ['Capex comparison','Annual fuel + DEF cost','Noise dB at 3 feet','Maintenance schedule','EPA SmartWay status','10-year TCO worked example'], 'parking-ac-spec-database', ['parking-ac-fuel-savings-calculator','best-parking-ac-2026']],
  ['dometic vs webasto parking ac', 'Dometic vs Webasto Parking AC: Side-by-Side Comparison (2026)', 'Reviews & Comparisons', 320, 'commercial', ['Brand history and OEM partnerships','Spec sheet comparison','Warranty terms','Service network coverage','Real owner reports','Price-to-spec ratio'], 'parking-ac-spec-database', ['best-parking-ac-2026','parking-ac-buying-guide-2025']],
  ['mini split vs rooftop parking ac', 'Mini-Split vs Rooftop Parking AC: Which Wins in 2026?', 'Reviews & Comparisons', 270, 'commercial', ['Form factor tradeoffs','Cooling efficiency comparison','Install complexity','Aesthetic and stealth factors','Maintenance access','Best fit by vehicle type'], 'parking-ac-spec-database', ['best-parking-ac-2026','12v-vs-24v-parking-ac']],

  // === How-to / informational ===
  ['how to install parking ac', 'How to Install a Parking AC: Step-by-Step DIY Guide (2026)', 'Installation Guides', 1900, 'informational', ['Tools required','Safety prep (battery disconnect)','Mounting hole template','Wiring (gauge, fuse, ground)','Refrigerant precautions','Test and commissioning','Common mistakes to avoid'], null, ['parking-ac-buying-guide-2025','best-parking-ac-2026']],
  ['parking ac wiring diagram', 'Parking AC Wiring Diagram: 12V and 24V Reference Schematics', 'Installation Guides', 720, 'informational', ['12V single-battery wiring','12V dual-battery isolator setup','24V truck wiring','Inverter-fed AC wiring','Solar charge controller integration','Fuse and circuit protection sizing'], null, ['12v-vs-24v-parking-ac','how-to-install-parking-ac']],
  ['parking ac maintenance checklist', 'Parking AC Maintenance Checklist: Monthly, Quarterly, Annual Tasks', 'Product Maintenance', 480, 'informational', ['Filter cleaning intervals','Refrigerant pressure check','Drain pan and condensate line','Mounting bolt torque check','Electrical connection inspection','Off-season storage prep'], null, ['parking-ac-buying-guide-2025','how-to-install-parking-ac']],
  ['parking ac not cooling troubleshooting', 'Parking AC Not Cooling? Troubleshooting Guide for 12 Common Causes', 'Troubleshooting', 1300, 'informational', ['Low refrigerant symptoms','Frozen evaporator coil','Compressor not engaging','Voltage drop diagnosis','Thermistor failure','Airflow restriction','When to call a tech'], null, ['parking-ac-maintenance-checklist','how-to-install-parking-ac']],
  ['parking ac making noise', 'Parking AC Making Noise: 8 Causes and How to Diagnose Each', 'Troubleshooting', 590, 'informational', ['Compressor bearing wear','Fan blade imbalance','Loose mounting bolts','Refrigerant flow noise','Electrical buzzing','Resonance with cabin','Noise spec by model','Decision tree: fix or replace'], 'parking-ac-spec-database', ['parking-ac-maintenance-checklist','parking-ac-not-cooling-troubleshooting']],

  // === Vehicle-specific buyer guides ===
  ['parking ac for sprinter van', 'Parking AC for Sprinter Vans: 2026 Install Guide and Top Picks', 'Buying Guides', 880, 'commercial', ['Sprinter roof load and cutout dimensions','Chassis voltage (12V vs 24V variants)','Battery bank requirements','5 best units for Sprinter','Install difficulty by model','Insurance and warranty notes'], 'parking-ac-spec-database', ['best-parking-ac-2026','battery-powered-rv-air-conditioner']],
  ['parking ac for freightliner cascadia', 'Parking AC for Freightliner Cascadia: 2026 Buyer Guide', 'Buying Guides', 480, 'commercial', ['Cascadia OEM parking AC options','Aftermarket retrofit choices','Sleeper size and BTU needs','24V system compatibility','Install shop vs DIY','Top 5 model recommendations'], 'parking-ac-spec-database', ['best-parking-ac-2026','12v-vs-24v-parking-ac']],
  ['parking ac for kenworth t680', 'Parking AC for Kenworth T680: Best Aftermarket Options (2026)', 'Buying Guides', 390, 'commercial', ['T680 sleeper specs','OEM No-Idle option vs aftermarket','Battery and alternator considerations','5 best fits with install notes','Warranty implications','Real owner feedback'], 'parking-ac-spec-database', ['best-parking-ac-2026','parking-ac-buying-guide-2025']],
  ['parking ac for peterbilt 579', 'Parking AC for Peterbilt 579: 2026 Compatibility and Top Picks', 'Buying Guides', 320, 'commercial', ['579 sleeper dimensions','Wiring access points','Roof structure considerations','Top aftermarket units','Install hour estimates','Cost breakdown'], 'parking-ac-spec-database', ['best-parking-ac-2026']],
  ['parking ac for volvo vnl', 'Parking AC for Volvo VNL Trucks: 2026 Best Aftermarket Models', 'Buying Guides', 280, 'commercial', ['VNL OEM parking AC vs retrofit','Sleeper BTU requirements','Battery system compatibility','5 verified-fit models','Install logistics','TCO over 5 years'], 'parking-ac-spec-database', ['best-parking-ac-2026','12v-vs-24v-parking-ac']],

  // === Price / cost ===
  ['parking ac price range', 'Parking AC Price Range 2026: What You Pay vs What You Get', 'Buying Guides', 720, 'commercial', ['Entry-level $1500–$2000 segment','Mid-tier $2000–$3000 segment','Premium $3000–$4500 segment','OEM vs aftermarket pricing','Hidden costs (install, mounting kit, wiring)','Lifetime cost-per-cooling-hour'], 'parking-ac-spec-database', ['parking-ac-buying-guide-2025','parking-ac-fuel-savings-calculator']],
  ['cheapest parking ac', 'Cheapest Parking AC That Actually Works: Budget Picks Under $2000', 'Buying Guides', 590, 'commercial', ['What you sacrifice at this price','3 budget models with real specs','Reliability data','Warranty terms','Install requirements','5-year TCO vs premium options'], 'parking-ac-spec-database', ['parking-ac-price-range','best-parking-ac-2026']],

  // === Battery and electrical ===
  ['lifepo4 battery for parking ac', 'LiFePO4 Battery Sizing for Parking AC: Complete 2026 Guide', 'How-To Guides', 880, 'informational', ['LiFePO4 vs AGM runtime per kWh','Required Ah for 8-hour cooling','Series vs parallel topology','BMS considerations','Charging from alternator and solar','3 worked examples'], null, ['battery-powered-rv-air-conditioner','12v-vs-24v-parking-ac']],
  ['solar panel for parking ac', 'Solar Panel Sizing for Parking AC: Watts, Hours, ROI (2026)', 'How-To Guides', 590, 'informational', ['Daily kWh consumption math','Solar irradiance by region','Panel-to-battery sizing','MPPT controller requirements','Real-world derating factors','3 setup examples by vehicle type'], null, ['lifepo4-battery-for-parking-ac','battery-powered-rv-air-conditioner']],

  // === Climate / regional ===
  ['parking ac for hot climate', 'Parking AC for Hot Climate: What Works at 110°F+ (2026)', 'Buying Guides', 480, 'commercial', ['BTU derating at high ambient','Condenser sizing for desert use','Insulation upgrades','5 hot-climate-rated models','Real Phoenix/Death Valley test data','Cooling performance benchmarks'], 'parking-ac-spec-database', ['parking-ac-btu-sizing','best-parking-ac-2026']],
  ['parking heater vs parking ac', 'Parking Heater vs Parking AC: Do You Need Both in 2026?', 'Reviews & Comparisons', 390, 'commercial', ['Heat-only vs heat-pump options','When you need both','Combined heat-pump units','Install logistics for dual systems','Cost comparison','Decision matrix by climate zone'], 'parking-ac-spec-database', ['best-parking-ac-2026','parking-ac-buying-guide-2025']],

  // === Compliance / industry ===
  ['california idle law parking ac', 'California Idle Law and Parking AC Compliance (2026)', 'Industry News', 320, 'commercial', ['CARB 5-minute idle rule','Sleeper berth exemption','Approved no-idle equipment list','CHP enforcement reality','Fine schedule','Approved AC models'], 'us-anti-idling-laws-by-state', ['no-idle-truck-ac','parking-ac-fuel-savings-calculator']],
  ['epa smartway parking ac', 'EPA SmartWay-Verified Parking AC Models (2026 Updated List)', 'Industry News', 270, 'commercial', ['What SmartWay verification means','How models are tested','Current verified list','Tax credits and grants','Procurement implications for fleets','How to apply for verification'], 'parking-ac-spec-database', ['no-idle-truck-ac','parking-ac-fuel-savings-calculator']],

  // === Use case stories ===
  ['parking ac for owner operator', 'Parking AC for Owner-Operators: ROI Analysis (2026)', 'Buying Guides', 480, 'commercial', ['Annual idle-fuel cost baseline','Install cost recovery timeline','Tax deduction (Section 179)','Resale value impact','3 owner-operator case studies','Best models for solo OO budget'], 'parking-ac-spec-database', ['parking-ac-fuel-savings-calculator','best-parking-ac-2026']],
  ['parking ac for fleet management', 'Parking AC for Fleet Management: Procurement and TCO Guide', 'Buying Guides', 390, 'commercial', ['Per-truck TCO model','Fleet-pricing thresholds','OEM vs aftermarket at fleet scale','Driver retention impact data','Install logistics across depots','Telematics integration'], 'parking-ac-spec-database', ['parking-ac-fuel-savings-calculator','best-parking-ac-2026']],

  // === RV / Van life ===
  ['parking ac for class b rv', 'Parking AC for Class B RV: Compact Solutions Compared (2026)', 'Buying Guides', 590, 'commercial', ['Class B space constraints','Roof vs under-bed install','5 Class B-friendly models','Battery and solar pairing','Stealth camping considerations','Real Class B owner builds'], 'parking-ac-spec-database', ['parking-ac-for-sprinter-van','best-parking-ac-2026']],
  ['parking ac for skoolie', 'Parking AC for Skoolie Conversions: 2026 Off-Grid Guide', 'Buying Guides', 320, 'commercial', ['Skoolie roof structure and reinforcement','BTU sizing for converted bus','12V vs 24V architecture','Solar-fed AC reality','Top 5 skoolie-friendly units','Cost and install timeline'], 'parking-ac-spec-database', ['battery-powered-rv-air-conditioner','12v-vs-24v-parking-ac']],

  // === Tech deep-dives ===
  ['inverter vs dc parking ac', 'Inverter-Driven vs DC Parking AC: Efficiency Showdown (2026)', 'Reviews & Comparisons', 270, 'informational', ['How variable-speed compressors work','Energy efficiency comparison','Cost difference','Lifespan implications','Real efficiency data from 4 models','Best fit by use case'], 'parking-ac-spec-database', ['12v-vs-24v-parking-ac','battery-powered-rv-air-conditioner']],
  ['parking ac refrigerant types', 'Parking AC Refrigerant Types Explained: R134a, R410a, R32 in 2026', 'How-To Guides', 320, 'informational', ['R134a current usage and phase-out timeline','R410a properties','R32 lower-GWP option','EPA regulations','Service implications','Which models use which refrigerant'], 'parking-ac-spec-database', ['parking-ac-maintenance-checklist','epa-smartway-parking-ac']],
];

// ============ Load existing topics + slugs ============
function loadJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
}

const existingTopics = loadJsonl(TOPICS_FILE);
const existingTopicSlugs = new Set(existingTopics.map(t => t.slug));
const existingBlogSlugs = new Set(
  fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''))
);
const existingTitlesLower = [...existingBlogSlugs].map(s => s.replace(/-/g, ' '));

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isDuplicate(slug, primaryKw) {
  if (existingBlogSlugs.has(slug)) return 'blog slug exists';
  if (existingTopicSlugs.has(slug)) return 'already in queue';
  const kwSlug = slugify(primaryKw);
  for (const exist of existingTitlesLower) {
    if (exist.includes(kwSlug.replace(/-/g, ' ')) && kwSlug.split('-').length >= 3) {
      return `keyword overlaps existing: ${exist}`;
    }
  }
  return null;
}

const today = new Date().toISOString().slice(0, 10);
const newTopics = [];
const skipped = [];

for (const [primaryKw, title, category, vol, intent, hints, dataSrc, links] of KEYWORD_BANK) {
  if (newTopics.length >= MAX) break;
  const slug = slugify(primaryKw);
  const dup = isDuplicate(slug, primaryKw);
  if (dup) { skipped.push(`${slug} — ${dup}`); continue; }

  const topic = {
    id: `kwbank-${Date.now()}-${slug.slice(0, 20)}`,
    slug,
    title,
    category,
    primaryKeyword: primaryKw,
    searchVolumeMonthly: vol,
    competitionScore: 0.4,
    intent,
    outlineHints: hints,
    dataSourceFiles: dataSrc ? [`client/public/data/datasets/${dataSrc}.json`] : [],
    internalLinkTargets: links,
    status: 'queued',
    createdAt: today,
    addedBy: 'topic-keyword-generator',
  };
  newTopics.push(topic);
  existingTopicSlugs.add(slug);
}

if (!DRY && newTopics.length > 0) {
  const lines = newTopics.map(t => JSON.stringify(t)).join('\n') + '\n';
  fs.appendFileSync(TOPICS_FILE, lines);
}

console.log(`\n=== Topic Generator ${DRY ? '(DRY)' : ''} ===`);
console.log(`Bank size:  ${KEYWORD_BANK.length}`);
console.log(`New topics: ${newTopics.length}`);
console.log(`Skipped:    ${skipped.length}`);
if (skipped.length > 0 && skipped.length < 20) {
  console.log('\nSkip reasons:');
  skipped.forEach(s => console.log(`  ⊘ ${s}`));
}
if (newTopics.length > 0) {
  console.log(`\nFirst 5 added:`);
  newTopics.slice(0, 5).forEach(t => console.log(`  + [${t.searchVolumeMonthly}/mo] ${t.slug}`));
}
console.log(`\nQueue depth now: ${existingTopics.length + (DRY ? 0 : newTopics.length)} topics`);
