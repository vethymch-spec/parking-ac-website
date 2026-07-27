#!/usr/bin/env node
// Static prerender for SPA routes - injects content into dist/client/index.html
// React 18 createRoot wipes children on mount, so SPA + crawlers both work.
import fs from 'fs';
import path from 'path';
import { A_CLASS, A_CLASS_SLUGS } from './lib/blog-a-class.mjs';

const ROOT = path.resolve('.');
const DIST = path.join(ROOT, 'dist/client');
const TEMPLATE_PATH = path.join(DIST, 'index.html');
const BLOG_DIR = path.join(ROOT, 'client/public/data/blog');
const LOCALE_DIR = path.join(BLOG_DIR, 'locales');
const LOCALE_AVAILABILITY_PATH = path.join(BLOG_DIR, 'locale-availability.json');
const DOMAIN = 'https://cooldrivepro.com';
const SITE_NAME = 'CoolDrivePro';
const DEFAULT_LANG = 'en';

const LANGS = ['en','zh-CN','zh-TW','ja','ko','de','fr','es','it','pt','ru','ar','hi','th','vi','id','tr','pl','nl','sv','no','da','fi','el','cs','hu','ro','uk','he','ms'];
const LANG_SET = new Set(LANGS);
// Languages where blog gets full SEO weight (kept in sitemap, indexed).
// Other languages still build & serve pages (UX), but blog posts are noindex
// and excluded from sitemap to focus crawl budget on commercial pages.
const STRONG_BLOG_LANGS = new Set(['en','de','es','fr','it','pl','pt','ja']);

let BLOG_LOCALE_AVAILABILITY = {};
try {
  BLOG_LOCALE_AVAILABILITY = JSON.parse(fs.readFileSync(LOCALE_AVAILABILITY_PATH, 'utf8')).posts || {};
} catch {
  BLOG_LOCALE_AVAILABILITY = {};
}

const escAttr = s => String(s ?? '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escText = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// Minimal markdown → HTML for blog body content. Crawlers need real <a>, <strong>,
// <table>, <ul>, <ol> tags — not escaped markdown literals — for link equity and
// structured content understanding. Order matters: do block-level first, then inline.
function mdToHtml(raw) {
  if (!raw) return '';
  const text = String(raw);
  const blocks = text.split(/\n\n+/);
  const out = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    // Table: lines with leading | and a separator row containing ---
    const lines = trimmed.split('\n');
    const isTable = lines.length >= 2 && lines[0].startsWith('|') && /^\s*\|[\s:|-]+\|\s*$/.test(lines[1]);
    if (isTable) {
      const header = lines[0].split('|').slice(1, -1).map(s => s.trim());
      const rows = lines.slice(2).map(l => l.split('|').slice(1, -1).map(s => s.trim()));
      out.push(`<table><thead><tr>${header.map(h => `<th>${mdInline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${mdInline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    // Unordered list
    if (lines.every(l => /^[-*]\s+/.test(l))) {
      out.push(`<ul>${lines.map(l => `<li>${mdInline(l.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`);
      continue;
    }
    // Ordered list
    if (lines.every(l => /^\d+\.\s+/.test(l))) {
      out.push(`<ol>${lines.map(l => `<li>${mdInline(l.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`);
      continue;
    }
    // Paragraph — preserve soft line breaks as spaces
    out.push(`<p>${mdInline(trimmed.replace(/\n/g, ' '))}</p>`);
  }
  return out.join('');
}
function mdInline(raw) {
  let s = escText(raw);
  // [text](url) — restrict to relative/https URLs to avoid injection
  s = s.replace(/\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g, (_, txt, url) => `<a href="${escAttr(url)}">${txt}</a>`);
  // **bold**
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return s;
}

function withTrailingSlash(p) {
  if (!p || p === '/') return '/';
  return p.endsWith('/') ? p : `${p}/`;
}

const localizedUrl = (lang, p) => {
  const cleanPath = withTrailingSlash(p.startsWith('/') ? p : `/${p}`);
  if (lang === DEFAULT_LANG) return `${DOMAIN}${cleanPath}`;
  return `${DOMAIN}/${lang}${cleanPath}`;
};

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error(`Missing ${TEMPLATE_PATH}. Run vite build first.`);
  process.exit(1);
}
const RAW_TEMPLATE = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// Pre-strip template-level og/twitter tags + canonical + hreflang so we don't end up with duplicates.
// Also strip the per-page JSON-LD blocks (Product/ItemList/FAQPage/BreadcrumbList) that were
// hard-coded in the home template — they will be re-injected per page below.
function stripTemplate(html) {
  let out = html
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>\s*/gi, '')
    .replace(/<meta\s+property="og:(url|title|description|image)"[^>]*>\s*/gi, '')
    .replace(/<meta\s+name="twitter:(title|description|image)"[^>]*>\s*/gi, '');
  // Strip JSON-LD blocks that are page-specific (keep Organization, WebSite, DefinedTermSet sitewide)
  out = out.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, (m) => {
    // Preserve any sitewide schema (Organization, WebSite, DefinedTermSet) even if it
    // contains nested @type:Product/ItemList/etc references (e.g. Organization.makesOffer)
    if (/"@type"\s*:\s*"(Organization|WebSite|DefinedTermSet)"/.test(m)) return m;
    if (/"@type"\s*:\s*"(Product|ItemList|FAQPage|BreadcrumbList)"/.test(m)) return '';
    return m;
  });
  // Remove orphan HTML comments that referenced those stripped scripts
  out = out.replace(/<!--\s*(Product\s*\d+:[^>]*|ItemList:[^>]*|FAQ Structured Data|BreadcrumbList)\s*-->\s*/gi, '');
  return out;
}
const TEMPLATE = stripTemplate(RAW_TEMPLATE);
const HOME_HERO_PRELOAD = /<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bhref=["']\/images\/home\/hero-bg-1280\.webp["'])[^>]*>\s*/gi;

// Load 30-language static page meta from external JSON (titles + descriptions per page per lang)
const STATIC_META_PATH = path.join(ROOT, 'scripts/static-meta.json');
let STATIC_PAGE_META = {};
try {
  const raw = JSON.parse(fs.readFileSync(STATIC_META_PATH, 'utf8'));
  // Drop helper keys (e.g. _comment) so they don't leak into routes
  for (const [k, v] of Object.entries(raw)) {
    if (k.startsWith('_')) continue;
    STATIC_PAGE_META[k] = v;
  }
} catch (err) {
  console.error(`Failed to load ${STATIC_META_PATH}:`, err.message);
  process.exit(1);
}

const FEATURE_PAGE_META = {
  '/features/power': {
    en: {
      title: '12V DC Battery-Powered Parking AC | CoolDrivePro',
      desc: 'Learn how CoolDrivePro parking air conditioners run directly from 12V or 24V DC battery systems with no engine idling, generator, or shore power required.',
    },
  },
  '/features/efficiency': {
    en: {
      title: 'High-Efficiency No-Idle Cooling & Heating | CoolDrivePro',
      desc: 'See how DC inverter compressor technology helps CoolDrivePro parking air conditioners maximize cooling output per amp-hour of battery consumed.',
    },
  },
  '/features/installation': {
    en: {
      title: 'Simple Parking AC Installation | CoolDrivePro',
      desc: 'Review CoolDrivePro parking AC installation basics, included mounting hardware, wiring requirements, and professional installation options.',
    },
  },
  '/features/battery': {
    en: {
      title: 'Smart Battery Protection for Parking AC | CoolDrivePro',
      desc: 'Understand CoolDrivePro battery protection features including undervoltage shutdown, overcurrent protection, thermal monitoring, and real-time voltage display.',
    },
  },
  '/features/durability': {
    en: {
      title: 'Parking AC Built for Extreme Climates | CoolDrivePro',
      desc: 'Discover how CoolDrivePro parking air conditioners are built for vibration, corrosion, rain, road spray, and extreme temperature conditions.',
    },
  },
  '/features/noise': {
    en: {
      title: 'Whisper-Quiet Parking Air Conditioner | CoolDrivePro',
      desc: 'Compare CoolDrivePro low-noise parking AC performance for trucks, RVs, vans, quiet campgrounds, and overnight sleeper cab comfort.',
    },
  },
};

const COMMERCIAL_HUB_META = {
  '/solutions/truck-ac': {
    en: {
      title: 'Truck Air Conditioner Guide: 12V/24V No-Idle AC for Cabs, Sleepers and Work Vehicles | CoolDrivePro',
      desc: 'A truck air conditioner is a 12V or 24V DC cooling system that keeps a truck cab, sleeper, pickup cap or work vehicle cool while parked without engine idling. Compare CoolDrivePro Nano Max, VS02 PRO and VX3000SP with fitment guidance for pickups, semi sleepers, truck campers, vans and work trucks.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/12v-air-conditioner': {
    en: {
      title: '12V Air Conditioner | 12V AC Unit for Trucks, RVs & Vans - CoolDrivePro',
      desc: 'Compare 12V air conditioner, 12V AC unit, 12 volt air conditioner, and 12V DC AC options for trucks, RVs, vans, campers, and off-grid vehicles.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/12v-rv-air-conditioner': {
    en: {
      title: '12V RV Air Conditioner | 12 Volt RV AC Unit Guide - CoolDrivePro',
      desc: 'Choose a 12V RV air conditioner or 12 volt RV AC unit for campers, camper trailers, motorhomes, caravans, rooftop installs, and off-grid cooling.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/12v-air-conditioner-for-van': {
    en: {
      title: '12V Air Conditioner for Van | 12 Volt Van AC Unit - CoolDrivePro',
      desc: 'Choose a 12V air conditioner for van, 12 volt van AC unit, campervan aircon, cargo van AC, or compact 12V DC parking AC by roof space and runtime.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/12v-rooftop-air-conditioner': {
    en: {
      title: '12V Rooftop Air Conditioner | 12 Volt Roof Mount AC Unit - CoolDrivePro',
      desc: 'Compare 12V rooftop air conditioner, 12 volt roof mount AC unit, 12V RV rooftop AC, and truck rooftop air conditioner options by roof fit and runtime.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/12v-mini-split-air-conditioner': {
    en: {
      title: '12V Mini Split Air Conditioner | 12 Volt DC Mini Split AC - CoolDrivePro',
      desc: 'Compare 12V mini split air conditioner, 12 volt mini split AC, and 12V DC mini split options for semi truck sleepers, RVs, vans, and off-grid vehicles.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/portable-ac-for-truck': {
    en: {
      title: 'Portable AC for Truck | 12V Truck Air Conditioner Alternatives - CoolDrivePro',
      desc: 'Compare portable AC for truck, portable air conditioner for semi truck, and 12V portable AC searches with mounted 12V/24V truck parking AC options.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/semi-truck-parking-ac': {
    en: {
      title: 'Semi Truck Air Conditioner | No-Idle Truck AC Unit - CoolDrivePro',
      desc: 'Compare semi truck air conditioner, semi truck AC unit, sleeper cab air conditioner, and 24V no-idle truck cooling options for overnight rest.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/sleeper-cab-air-conditioner': {
    en: {
      title: 'Sleeper Cab Air Conditioner | Quiet 24V Truck AC - CoolDrivePro',
      desc: 'Choose a sleeper cab air conditioner for quiet overnight truck cooling. Compare 24V mini split and rooftop parking AC options for driver rest, runtime, and no-idle comfort.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/fleet-parking-ac': {
    en: {
      title: 'Fleet Parking AC | No-Idle Truck Cooling ROI - CoolDrivePro',
      desc: 'Plan fleet parking AC rollouts for no-idle cooling, fuel savings, driver retention, and standardized 12V/24V truck air conditioner installation across multiple vehicles.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/parking-ac-distributor': {
    en: {
      title: 'Parking AC Distributor | Wholesale 12V 24V Truck AC Supply - CoolDrivePro',
      desc: 'Become a parking AC distributor with factory-direct 12V and 24V truck air conditioner supply, dealer materials, product training, and repeat-order support.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/rv-parking-ac': {
    en: {
      title: 'RV Parking AC & 12V RV Air Conditioner | Off-Grid Cooling - CoolDrivePro',
      desc: 'Compare RV parking AC and 12V RV air conditioner options for campers, motorhomes, caravans, rooftop installs, mini splits, and off-grid runtime.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/van-parking-ac': {
    en: {
      title: '12V Air Conditioner for Van | Camper Van & Cargo Van AC - CoolDrivePro',
      desc: 'Compare 12V air conditioner for van, campervan aircon, cargo van AC, and compact parking AC options for vans, pickups, and light trucks.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/battery-powered-truck-cab-air-conditioner': {
    en: {
      title: 'Battery-Powered Truck Cab Air Conditioner | 24V Sleeper Cab Guide - CoolDrivePro',
      desc: 'Compare battery-powered truck cab air conditioner options for 24V sleeper cabs. Plan overnight runtime, battery reserve, and the right rooftop or mini split format before you buy.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/no-idle-truck-air-conditioner': {
    en: {
      title: 'No-Idle Truck Air Conditioner | Compliance & Fuel-Savings Guide - CoolDrivePro',
      desc: 'Compare no-idle truck air conditioner setups for fleets and owner-operators. See how anti-idling compliance, fuel savings, and sleeper-cab comfort affect the best rooftop or split system.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/off-grid-rv-air-conditioner': {
    en: {
      title: 'Off-Grid RV Air Conditioner | Battery & Solar Cooling Guide - CoolDrivePro',
      desc: 'Find the right off-grid RV air conditioner for boondocking, solar-charged batteries, and generator-free overnight comfort. Compare rooftop, mini split, and compact RV-ready systems.',
      langs: [DEFAULT_LANG],
    },
  },
  '/solutions/camper-van-parking-ac': {
    en: {
      title: 'Camper Van Parking AC | 12V 24V Conversion Cooling Guide - CoolDrivePro',
      desc: 'Choose a camper van parking AC for Sprinter, Transit, and ProMaster builds. Compare compact rooftop, mini split, and battery-powered overnight cooling setups for tight roof layouts.',
      langs: [DEFAULT_LANG],
    },
  },
  '/compare/12v-vs-24v-parking-ac': {
    en: {
      title: '12V vs 24V Parking AC | Which Voltage Fits Your Vehicle? - CoolDrivePro',
      desc: 'Compare 12V vs 24V parking air conditioners for RVs, vans, pickups, and semi trucks. Understand current draw, wiring, battery planning, and the best CoolDrivePro fit.',
      langs: [DEFAULT_LANG],
    },
  },
  '/compare/rooftop-vs-mini-split-parking-ac': {
    en: {
      title: 'Rooftop vs Mini Split Parking AC | Compare Install & Runtime - CoolDrivePro',
      desc: 'Compare rooftop vs mini split parking AC systems for trucks, RVs, and vans. Review installation effort, noise, cooling layout, and which CoolDrivePro model fits best.',
      langs: [DEFAULT_LANG],
    },
  },
  '/compare/parking-ac-battery-runtime': {
    en: {
      title: 'Parking AC Battery Runtime Guide | How Much Battery Do You Need? - CoolDrivePro',
      desc: 'Plan parking AC battery runtime for trucks, RVs, vans, and pickups. Compare overnight goals, LiFePO4 battery sizing, low-voltage protection, and the best CoolDrivePro fit.',
      langs: [DEFAULT_LANG],
    },
  },
  '/compare/cooling-only-vs-heating-cooling-parking-ac': {
    en: {
      title: 'Cooling-Only vs Heating & Cooling Parking AC | Climate Guide - CoolDrivePro',
      desc: 'Compare cooling-only vs heating-and-cooling parking AC systems for mixed climates, year-round fleets, RVs, vans, and trucks. Choose the right climate-control branch first.',
      langs: [DEFAULT_LANG],
    },
  },
  '/compare/parking-ac-roof-fitment-guide': {
    en: {
      title: 'Parking AC Roof Fitment Guide | 14x14 Openings & Roof Layout - CoolDrivePro',
      desc: 'Check parking AC roof fitment for RVs, vans, pickups, and work vehicles. Compare standard rooftop openings, tight layouts, and the best installation branch before you buy.',
      langs: [DEFAULT_LANG],
    },
  },
};

const LANDING_PAGE_META = {
  '/landing/truck-parking-ac': {
    title: 'Truck Parking AC Landing Page | No-Idle 12V 24V Cooling - CoolDrivePro',
    desc: 'Google Ads landing page for CoolDrivePro truck parking AC units. 12V and 24V no-idle cooling for sleeper cabs, semi trucks, and work trucks.',
    eyebrow: '12V / 24V truck parking AC',
    headline: 'No-idle cooling for sleeper cabs and work trucks',
    subhead: 'CoolDrivePro parking air conditioners help drivers rest in a cool cab without running the engine through overnight stops, loading queues, and hot midday breaks.',
    image: `${DOMAIN}/images/products/vs02pro-top-mounted.webp`,
    cta: 'Get truck AC quote',
  },
  '/landing/fleet-parking-ac-roi': {
    title: 'Fleet Parking AC ROI Landing Page | CoolDrivePro',
    desc: 'Landing page for fleet parking AC ROI and no-idle cooling inquiries. Compare battery-powered truck AC options for fleet cost control.',
    eyebrow: 'Fleet no-idle cooling ROI',
    headline: 'Reduce idle fuel cost with battery-powered parking AC',
    subhead: 'For fleet managers comparing diesel idling, APUs, and DC parking AC, CoolDrivePro helps map the cooling option to fleet size, duty cycle, and target payback.',
    image: `${DOMAIN}/images/products/vs02pro-top-mounted.webp`,
    cta: 'Request fleet ROI review',
  },
  '/landing/rv-van-12v-ac': {
    title: '12V RV and Van Air Conditioner Landing Page | CoolDrivePro',
    desc: 'Google Ads landing page for 12V and 24V battery-powered AC options for RVs, camper vans, light trucks, and off-grid vehicle cooling.',
    eyebrow: '12V cooling for RVs and vans',
    headline: 'Battery-powered AC for RVs, vans, and light trucks',
    subhead: 'A compact DC parking AC page for buyers who need off-grid cooling without relying on shore power, campsite hookups, or a generator running beside the vehicle.',
    image: `${DOMAIN}/images/products/nano-max-01.webp`,
    cta: 'Get 12V AC recommendation',
  },
  '/landing/distributor-parking-ac': {
    title: 'Parking AC Distributor Landing Page | CoolDrivePro B2B Supply',
    desc: 'Distributor landing page for CoolDrivePro 12V and 24V parking air conditioners. Factory-direct product supply for dealers, installers, and regional partners.',
    eyebrow: 'Parking AC distributor inquiries',
    headline: 'Factory-direct parking AC supply for dealers and regional partners',
    subhead: 'A focused page for distributors, installers, and commercial buyers looking for 12V and 24V parking AC product supply, technical materials, and repeat-order support.',
    image: `${DOMAIN}/images/products/vx3000-split-system-diagram.webp`,
    cta: 'Request distributor terms',
  },
};

function metaFor(p, lang) {
  const e = STATIC_PAGE_META[p] || FEATURE_PAGE_META[p] || COMMERCIAL_HUB_META[p] || APU_PAGE_META[p];
  if (!e) return null;
  return e[lang] || e[DEFAULT_LANG] || null;
}

const APU_PAGE_META = {
  '/apu': {
    en: {
      title: 'Modular Truck APU System for No-Idle Cooling, Cabin Power and Backup Energy | CoolDrivePro',
      desc: 'CoolDrivePro builds a modular truck APU — one integrated stack of parking AC, LiFePO4 battery, inverter and parking generator for no-idle cooling, cabin power and backup energy on semi sleeper cabs and heavy-duty trucks. Compare Cooling, Battery, Comfort Power and Hybrid APU kits.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/what-is-a-truck-apu': {
    en: {
      title: 'What Is a Truck APU? Auxiliary Power Unit Explained | CoolDrivePro',
      desc: 'Plain-English explanation of what a truck APU (auxiliary power unit) is, why long-haul drivers use one, and how diesel, battery-electric and hybrid APUs differ.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/how-it-works': {
    en: {
      title: 'How a Truck APU Works: Power, HVAC & Battery Flow | CoolDrivePro',
      desc: 'How an APU delivers cab HVAC and 12V/110V power without idling the main engine — power flow, battery charging, alternator handoff and fuel use.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/electric': {
    en: {
      title: 'Electric APU for Trucks: Battery-Powered No-Idle HVAC | CoolDrivePro',
      desc: 'Battery-electric truck APU runtime, charging, payload impact, retrofit cost and CARB/EPA compliance for sleeper-cab cooling and heating without burning diesel.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/diesel': {
    en: {
      title: 'Diesel APU: Fuel Use, Maintenance & Idle Reduction | CoolDrivePro',
      desc: 'Diesel APU fuel consumption (~0.18–0.22 gal/h), maintenance schedule, lifecycle cost vs main-engine idling, and where it still makes sense vs electric APUs.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/hybrid': {
    en: {
      title: 'Hybrid APU: Battery + Diesel Auxiliary Power | CoolDrivePro',
      desc: 'Hybrid APU systems combining battery-electric HVAC with a small diesel charger — when hybrid wins on fuel, runtime and weight vs pure electric or pure diesel APUs.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/builder': {
    en: {
      title: 'Truck APU Builder: Configure Your No-Idle System | CoolDrivePro',
      desc: 'Walk through APU options by truck type, sleeper layout, climate and runtime needs to spec a battery, diesel or hybrid no-idle system that actually fits.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/roi-calculator': {
    en: {
      title: 'Truck APU ROI Calculator: Idle Fuel & Payback | CoolDrivePro',
      desc: 'Estimate APU payback period, fuel saved vs idling (~$1,800/yr per Class 8 truck) and total cost of ownership across electric, diesel and hybrid APU options.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/compliance': {
    en: {
      title: 'APU & Idle-Reduction Compliance: CARB, EPA & State Laws | CoolDrivePro',
      desc: 'How APUs and battery HVAC fit California CARB anti-idling rules, EPA SmartWay credits and state idle-reduction laws across the U.S. and Canada.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/compare': {
    en: {
      title: 'APU Comparison: TriPac, Thermo King, Carrier & Battery HVAC | CoolDrivePro',
      desc: 'Side-by-side comparison of common truck APU brands and battery HVAC alternatives on price, runtime, fuel use, noise and serviceability.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/case-studies': {
    en: {
      title: 'Truck APU Case Studies: Real Fleet & Owner-Operator Results | CoolDrivePro',
      desc: 'Real-world APU and battery HVAC deployment results — fuel saved, idle hours cut, payback period and driver retention impact.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/r-and-d': {
    en: {
      title: 'CoolDrivePro APU R&D: Engineering Behind No-Idle HVAC | CoolDrivePro',
      desc: 'Inside CoolDrivePro engineering — DC inverter compressor design, battery protection, thermal management and validation testing for truck APU-class HVAC.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/install': {
    en: {
      title: 'Truck APU Installation: Mounting, Wiring & Service | CoolDrivePro',
      desc: 'APU and battery HVAC installation reference — mounting locations, wiring, battery sizing, refrigerant service and what installers need to plan for.',
      langs: [DEFAULT_LANG],
    },
  },
  '/apu/faq': {
    en: {
      title: 'Truck APU FAQ: Common Questions Answered | CoolDrivePro',
      desc: 'Answers to common truck APU questions — runtime, fuel use, payback, electric vs diesel APU, compliance and battery HVAC alternatives.',
      langs: [DEFAULT_LANG],
    },
  },
};

const APU_FAQ_ITEMS = [
  {
    q: 'What is a truck APU?',
    a: 'A truck APU (auxiliary power unit) is a small system that powers cab HVAC and 12V/110V loads while the main engine is off, so drivers can sleep with cooling, heating and accessories without idling the diesel engine.',
  },
  {
    q: 'How much fuel does a diesel APU use compared to idling?',
    a: 'A diesel APU typically burns about 0.18–0.22 gallons per hour, versus roughly 0.8–1.0 gallons per hour for a Class 8 truck idling the main engine — a 4–5x reduction in fuel use during rest.',
  },
  {
    q: 'How long can a battery-electric APU run on a full charge?',
    a: 'Battery-electric APUs and battery HVAC systems typically deliver 8–10 hours of overnight cooling at around 30 °C ambient, depending on battery bank size, insulation and set-point.',
  },
  {
    q: 'Are truck APUs legal in California (CARB) and other states with anti-idling rules?',
    a: 'Diesel APUs sold in California must meet CARB ATCM emission requirements; electric APUs and battery HVAC are unrestricted under most idle-reduction rules and are accepted as compliant alternatives in CARB and many state anti-idling regulations.',
  },
  {
    q: 'How long does a truck APU take to pay back?',
    a: 'Typical payback for a truck APU or battery HVAC retrofit is 12–24 months on long-haul Class 8 routes, driven mainly by avoided idle fuel costs of around $1,500–$2,000 per truck per year plus reduced engine wear.',
  },
  {
    q: 'Can I add an APU to a non-sleeper truck?',
    a: 'Yes. Battery HVAC and small electric APUs can be added to day cabs, work trucks and vocational vehicles to power cab cooling, heating and accessories during breaks, even without a sleeper berth.',
  },
  {
    q: 'How is CoolDrivePro priced vs TriPac and other major APU brands?',
    a: 'CoolDrivePro 12V/24V battery HVAC units are typically priced about 40% below comparable TriPac, Thermo King and Carrier APU configurations, with no diesel maintenance and lower installed weight.',
  },
];

const APU_HUB_FAQ_ITEMS = [
  { q: 'How long can a parking AC run on battery?', a: 'Typical CoolDrivePro Battery APU runs 8–10 h at 30 °C ambient with the AC on cooling mode. Runtime drops in extreme heat (50 °C) to 5–6 h and extends to 12+ h in milder conditions or with lower-fan setpoints.' },
  { q: 'Do I need a generator?', a: 'No, if you park 8–10 h between drives and recharge while driving. Yes, if you park 12+ h, run heavy cabin loads, or operate where temperatures regularly exceed 45 °C.' },
  { q: 'Is a battery APU compliant in California?', a: 'Yes. Battery APUs (zero on-board emissions) are compliant in all anti-idling states, including CARB-regulated California. Diesel APUs must be CARB-certified to operate in CA.' },
  { q: 'Will the APU drain my starter battery?', a: 'No. The APU battery is isolated from the starter battery by a DC-DC charger. The starter battery is never used for cabin loads.' },
  { q: 'How long does installation take?', a: 'Most kits install in 4–8 hours by a qualified upfitter. Hybrid kits with generator can take 8–12 hours.' },
  { q: 'What\u2019s the warranty?', a: 'Standard 1-year warranty on all modules. Extended warranty available on request.' },
  { q: 'Can I upgrade later from battery-only to hybrid?', a: 'Yes — that\u2019s the point of modular. Add the parking generator and controller without re-wiring the rest.' },
];

const TRUCK_AC_FAQ_ITEMS = [
  { q: 'What is the best 12V air conditioner for a pickup truck or light truck?', a: 'For a 12V pickup, light truck or truck camper, start with the cabin size, available roof space and target overnight runtime. The CoolDrivePro Nano Max is the compact starting point for pickup cabs, truck caps, truck campers and small work-vehicle spaces, while VS02 PRO handles larger rooftop cooling needs on full-size trucks and RVs.' },
  { q: 'Can a truck AC really cool a cab without idling the engine?', a: 'Yes. A CoolDrivePro 12V/24V DC parking air conditioner is powered by the truck batteries or a dedicated auxiliary battery, so the cab and sleeper stay cool while the diesel engine is off. Real runtime depends on ambient temperature, battery capacity, insulation and cabin volume — we publish runtime ranges per model and per kit configuration.' },
  { q: 'Is a portable AC enough for a truck, or do I need a mounted parking AC?', a: 'A portable AC can help in a few short situations, but truck drivers who need reliable no-idle cooling, overnight sleeper comfort or repeated workday use almost always move to a vehicle-mounted DC parking AC. Mounted units use the truck\u2019s electrical system, vent outside the cabin and survive vibration far better than consumer-grade portables.' },
  { q: 'What is the best AC for a semi truck sleeper cab?', a: 'For semi sleeper cabs the choice depends on whether quiet overnight comfort or quick installation matters more. CoolDrivePro VX3000SP is the strongest mini split option for sleeper quietness, while VS02 PRO and V-TH1 are simpler rooftop platforms when fleets need faster install and consistent service training across many trucks.' },
];

// ---- Per-page JSON-LD registries ------------------------------------------
const SHIPPING = {
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' },
  },
};

const PRODUCT_SCHEMA = {
  '/products/top-mounted-ac': {
    name: 'CoolDrivePro VS02 PRO 12V/24V 12000 BTU Rooftop Parking AC',
    description: 'The CoolDrivePro VS02 PRO is a 12V parking air conditioner and 24V parking air conditioner on one rooftop platform — a self-contained DC parking air conditioner and battery powered air conditioner that delivers 12,000 BTU/h no-idle cooling for semi trucks, RVs, vans, campers and fleet vehicles. As a true rooftop parking air conditioner, it runs from the vehicle battery instead of shore power or engine idling, using a DC dual rotary compressor, undervoltage protection and \u226445 dB quiet operation.',
    image: [
      'https://cooldrivepro.com/images/products/vs02pro-top-mounted.webp',
    ],
    sku: 'VS02-PRO', mpn: 'VS02PRO-12V24V',
    additionalProperty: [
      { name: 'Cooling Capacity', value: '12,000 BTU/h' },
      { name: 'Voltage', value: '12V / 24V DC' },
      { name: 'Compressor', value: 'DC dual rotary' },
      { name: 'Noise Level', value: '\u226445 dB' },
      { name: 'Refrigerant', value: 'R410a' },
      { name: 'Roof Opening', value: '14 inch / 356 mm' },
      { name: 'Battery Protection', value: 'Undervoltage cutoff at 11V' },
      { name: 'Warranty', value: '1 year' },
    ],
  },
  '/products/mini-split-ac': {
    name: 'CoolDrivePro VX3000SP 12V/24V 12000 BTU Mini Split Parking AC',
    description: 'The CoolDrivePro VX3000SP is a 12V/24V DC mini split parking air conditioner for semi sleeper cabs, RVs, vans and campers. 12,000 BTU/h no-idle cooling with a quiet \u226432 dB indoor unit, GMCC twin-rotary inverter compressor and split-system fitment support.',
    image: ['https://cooldrivepro.com/images/products/vx3000-split-outdoor-unit-01.webp'],
    sku: 'VX3000SP', mpn: 'VX3000SP-12V24V',
    price: '1599.00', rating: '4.9', reviews: '86',
    additionalProperty: [
      { name: 'Cooling Capacity', value: '12,000 BTU/h' },
      { name: 'Voltage', value: '12V / 24V DC' },
      { name: 'Compressor', value: 'GMCC twin-rotary inverter' },
      { name: 'Indoor Noise Level', value: '\u226432 dB' },
      { name: 'Format', value: 'Split system (outdoor + indoor unit)' },
      { name: 'Warranty', value: '1 year' },
    ],
  },
  '/products/heating-cooling-ac': {
    name: 'CoolDrivePro V-TH1 12V/24V Heating & Cooling Parking AC',
    description: 'The CoolDrivePro V-TH1 is a 12V/24V DC heating and cooling parking air conditioner for trucks, RVs, vans and special vehicles. 2000W heat-pump cooling and heating with GMCC twin-rotary compressor, R134a refrigerant and year-round no-idle climate control.',
    image: ['https://cooldrivepro.com/images/products/vth1-outdoor-top.webp'],
    sku: 'V-TH1', mpn: 'VTH1-12V24V',
    price: '1899.00', rating: '4.9', reviews: '12',
    additionalProperty: [
      { name: 'Cooling Capacity', value: '2000 W' },
      { name: 'Heating', value: '5\u00b0C to 30\u00b0C cab heat-up in 30 min' },
      { name: 'Voltage', value: '12V / 24V DC' },
      { name: 'Compressor', value: 'GMCC twin-rotary' },
      { name: 'Refrigerant', value: 'R134a' },
      { name: 'Mode', value: 'Cooling + heating heat pump' },
    ],
  },
  '/products/nano-max': {
    name: 'CoolDrivePro Nano Max 12V/24V Parking Air Conditioner — Compact Parking AC for Pickup Trucks, Vans, Truck Caps & Campers',
    description: 'CoolDrivePro Nano Max is a compact parking air conditioner that serves as both a 12V parking air conditioner and a 24V parking air conditioner for pickup truck parking AC, van air conditioner 12V, truck cap air conditioner and truck camper AC builds. 10,000 BTU/h no-idle parking AC with dual-rotor BLDC compressor, low-profile 165 mm rooftop housing and dealer fitment support.',
    image: [
      'https://cooldrivepro.com/images/products/nano-max-01.webp',
      'https://cooldrivepro.com/images/products/nano-max-02.webp',
    ],
    sku: 'NANO-MAX', mpn: 'NANOMAX-12V24V',
    price: '1599.00', rating: '5.0', reviews: '3',
    additionalProperty: [
      { name: 'Cooling Capacity', value: '10,000 BTU/h' },
      { name: 'Voltage', value: '12V / 24V DC (auto-switching)' },
      { name: 'Compressor', value: 'Dual-rotor BLDC' },
      { name: 'Profile Height', value: '165 mm' },
      { name: 'Airflow', value: '550 m\u00b3/h' },
      { name: 'Warranty', value: '1 year' },
    ],
  },
};

function productSchema(p) {
  const d = PRODUCT_SCHEMA[p];
  if (!d) return null;
  const schema = {
    '@type': 'Product',
    name: d.name,
    description: d.description,
    image: d.image,
    sku: d.sku,
    mpn: d.mpn,
    url: `${DOMAIN}${p}`,
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: 'Parking Air Conditioner',
  };
  if (d.rating && d.reviews && Number(d.reviews) >= 3) {
    schema.aggregateRating = { '@type': 'AggregateRating', ratingValue: d.rating, reviewCount: d.reviews };
  }

  if (Array.isArray(d.additionalProperty) && d.additionalProperty.length) {
    schema.additionalProperty = d.additionalProperty.map((prop) => ({
      '@type': 'PropertyValue',
      name: prop.name,
      value: prop.value,
    }));
  }

  if (d.price) {
    schema.offers = {
      '@type': 'Offer',
      url: `${DOMAIN}${p}`,
      priceCurrency: 'USD',
      price: d.price,
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', '@id': `${DOMAIN}/#organization`, name: SITE_NAME, url: DOMAIN },
      brand: { '@type': 'Brand', name: SITE_NAME, '@id': `${DOMAIN}/#organization` },
      manufacturer: { '@type': 'Organization', '@id': `${DOMAIN}/#organization` },
      shippingDetails: SHIPPING,
    };
  }

  return schema;
}

const HOME_ITEMLIST = {
  '@type': 'ItemList',
  name: 'CoolDrivePro Parking Air Conditioner Product Catalog',
  description: 'Complete lineup of 12V and 24V DC parking air conditioners by CoolDrivePro for trucks, RVs, vans, and off-grid vehicles.',
  url: DOMAIN,
  numberOfItems: 4,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'VS02 PRO – 12,000 BTU Top-Mounted Parking AC', url: `${DOMAIN}/products/top-mounted-ac` },
    { '@type': 'ListItem', position: 2, name: 'VX3000SP – 12,000 BTU Mini Split Parking AC', url: `${DOMAIN}/products/mini-split-ac` },
    { '@type': 'ListItem', position: 3, name: 'V-TH1 – Heating & Cooling Parking AC', url: `${DOMAIN}/products/heating-cooling-ac` },
    { '@type': 'ListItem', position: 4, name: 'Nano Max – 10,000 BTU 12V/24V Parking Air Conditioner for Trucks', url: `${DOMAIN}/products/nano-max` },
  ],
};

const HOME_FAQ = {
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is a parking air conditioner?', acceptedAnswer: { '@type': 'Answer', text: 'A parking air conditioner (parking AC or no-idle AC) is a battery-powered DC air conditioning unit that cools truck cabs, RVs, and vans when the engine is off. It runs on 12V or 24V DC power from the vehicle battery, eliminating the need to idle for cooling.' } },
    { '@type': 'Question', name: 'How long can a 12V parking air conditioner run on battery?', acceptedAnswer: { '@type': 'Answer', text: 'A 12V parking air conditioner runs ~8 hours on a 480Ah battery bank, or up to 10 hours with 600Ah. Runtime depends on ambient temperature, battery capacity, and cooling load.' } },
    { '@type': 'Question', name: 'What is the difference between a parking AC and a regular RV air conditioner?', acceptedAnswer: { '@type': 'Answer', text: 'A parking AC runs on 12V/24V DC battery power without shore power or generator. Regular RV ACs need 110V AC. Parking ACs are ideal for off-grid camping, truck stops, and anywhere without electrical hookups.' } },
    { '@type': 'Question', name: 'Can a parking air conditioner work for semi trucks?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Our 12V and 24V parking air conditioners are designed for semi truck cabs. They provide no-idle cooling during rest periods, helping drivers comply with anti-idling regulations while staying comfortable.' } },
    { '@type': 'Question', name: 'What is the best 12 volt air conditioner for trucks?', acceptedAnswer: { '@type': 'Answer', text: 'The best 12 volt air conditioner for trucks depends on whether you need pickup cab cooling, truck camper AC, truck cap air conditioning, truck bed workspace cooling, or semi truck sleeper comfort. Compact 12V truck AC units fit lighter vehicles, while larger 12V/24V parking AC systems fit sleeper cabs, RVs, and fleet use.' } },
    { '@type': 'Question', name: 'Does a parking air conditioner damage the battery?', acceptedAnswer: { '@type': 'Answer', text: 'Our parking air conditioners feature built-in undervoltage protection (8–11V threshold) that automatically shuts off before the battery is drained to a harmful level, protecting your vehicle battery from damage.' } },
  ],
};

// Related-posts + manifest registries (loaded once)
let RELATED = {};
let MANIFEST_BY_SLUG = {};
try {
  RELATED = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, 'related-posts.json'), 'utf8'));
} catch { RELATED = {}; }
try {
  const m = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, 'manifest.json'), 'utf8'));
  for (const e of m) MANIFEST_BY_SLUG[e.slug] = e;
} catch { MANIFEST_BY_SLUG = {}; }

function relatedFor(slug, lang) {
  const list = (RELATED[slug] || []).slice(0, 5);
  return list.map(s => {
    const m = MANIFEST_BY_SLUG[s];
    if (!m) return null;
    return { slug: s, title: m.title, url: localizedUrl(lang, `/blog/${s}`) };
  }).filter(Boolean);
}

// Build a FAQPage schema from any article section whose heading contains "FAQ"
// or "Frequently Asked". Q&A pairs are detected as **Question?** followed by answer.
function faqFor(article) {
  if (!article || !Array.isArray(article.content)) return null;
  let text = '';
  const faqSection = article.content.find(
    (c) => c && typeof c === 'object' && typeof c.heading === 'string' &&
           /\bFAQ\b|frequently asked/i.test(c.heading)
  );
  if (faqSection && faqSection.body) {
    text = String(faqSection.body);
  } else {
    // Fallback: scan plain-string content items and collect any block containing **Q?** pairs
    const strChunks = article.content.filter((c) => typeof c === 'string');
    const qaChunks = strChunks.filter((s) => /\*\*[^*\n]{8,300}\?\*\*/.test(s));
    if (qaChunks.length === 0) return null;
    text = qaChunks.join('\n\n');
  }
  // Match **Question?** followed by answer text up to next **Q** or end
  const re = /\*\*([^*\n]{8,300}\?)\*\*\s*\n+([\s\S]*?)(?=\n+\*\*[^*\n]+\?\*\*|$)/g;
  const mainEntity = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const q = m[1].trim();
    let a = m[2].trim().replace(/\s+/g, ' ').slice(0, 1000);
    if (!a) continue;
    mainEntity.push({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    });
  }
  if (mainEntity.length < 2) return null;
  return { '@type': 'FAQPage', mainEntity };
}

function buildHead({ canonical, title, desc, ogImage, pathWithoutLocale, jsonLd, preloadImage, noindex, langs = LANGS }) {
  const lines = [];
  if (noindex) {
    lines.push(`    <meta name="robots" content="noindex,follow" />`);
  }
  lines.push(`    <link rel="canonical" href="${escAttr(canonical)}" />`);
  for (const l of langs) {
    lines.push(`    <link rel="alternate" hreflang="${l}" href="${escAttr(localizedUrl(l, pathWithoutLocale))}" />`);
  }
  if (langs.includes(DEFAULT_LANG)) {
    lines.push(`    <link rel="alternate" hreflang="x-default" href="${escAttr(localizedUrl(DEFAULT_LANG, pathWithoutLocale))}" />`);
  }
  // LCP hint: preload the page-specific hero image for faster Largest Contentful Paint
  if (preloadImage) {
    const preloadHref = preloadImage.startsWith(`${DOMAIN}/`)
      ? preloadImage.slice(DOMAIN.length)
      : preloadImage;
    lines.push(`    <link rel="preload" as="image" href="${escAttr(preloadHref)}" fetchpriority="high" />`);
  }
  lines.push(`    <meta property="og:url" content="${escAttr(canonical)}" />`);
  lines.push(`    <meta property="og:title" content="${escAttr(title)}" />`);
  lines.push(`    <meta property="og:description" content="${escAttr(desc)}" />`);
  if (ogImage) lines.push(`    <meta property="og:image" content="${escAttr(ogImage)}" />`);
  lines.push(`    <meta name="twitter:title" content="${escAttr(title)}" />`);
  lines.push(`    <meta name="twitter:description" content="${escAttr(desc)}" />`);
  if (ogImage) lines.push(`    <meta name="twitter:image" content="${escAttr(ogImage)}" />`);
  if (jsonLd) lines.push(`    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);
  return lines.join('\n');
}

function applyTemplate({ title, desc, lang, headExtra, body, removeHomeHeroPreload = false }) {
  let html = TEMPLATE;
  if (removeHomeHeroPreload) html = html.replace(HOME_HERO_PRELOAD, '');
  html = html.replace(/<html\b[^>]*\blang="[^"]*"/i, `<html lang="${lang}"`);
  if (!/<html\b[^>]*\blang=/i.test(html)) html = html.replace(/<html\b/i, `<html lang="${lang}"`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escText(title)}</title>`);
  html = html.replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escAttr(desc)}" />`);
  html = html.replace(/<\/head>/i, `${headExtra}\n  </head>`);
  html = html.replace(/<div\s+id="root"\s*>\s*<\/div>/i, `<div id="root">${body}</div>`);
  return html;
}

function crumbsHTML(items) {
  // Visible breadcrumb nav for crawlers and accessibility (kept inside hidden main)
  return `<nav aria-label="Breadcrumb"><ol>${items.map((it, i) => i === items.length - 1
    ? `<li>${escText(it.name)}</li>`
    : `<li><a href="${escAttr(it.url)}">${escText(it.name)}</a></li>`).join('')}</ol></nav>`;
}

function renderHomeBody(meta, lang) {
  return `<main><h1>${escText(meta.title)}</h1><p>${escText(meta.desc)}</p><nav><a href="${localizedUrl(lang,'/products')}">Products</a> <a href="${localizedUrl(lang,'/blog')}">Blog</a> <a href="${localizedUrl(lang,'/about')}">About</a> <a href="${localizedUrl(lang,'/contact')}">Contact</a></nav></main>`;
}

function renderProductFactoryTrustSection() {
  const trustCards = [
    {
      image: '/images/trust/vethy-factory-manufacturing-excellence.jpg',
      alt: 'Vethy parking air conditioner manufacturing workshop and testing environment',
      title: 'Factory and production-line photos',
      body: 'Workshop images show parking AC assembly, component handling, and bench testing environments for B2B supply review.',
      width: 750,
      height: 1050,
    },
    {
      image: '/images/trust/vethy-quality-certifications-overview.jpg',
      alt: 'Vethy quality certification and company credit document overview',
      title: 'Company document support',
      body: 'Distributor and fleet buyers can request current company materials, certificate scans, and credit documents during onboarding.',
      width: 750,
      height: 950,
    },
    {
      image: '/images/trust/qingdao-vethy-iso-9001-certificate.jpg',
      alt: 'Qingdao Vethy Industrial Co Ltd ISO 9001 2015 quality management system certificate',
      title: 'ISO 9001 certificate image',
      body: 'English ISO 9001:2015 certificate image for Qingdao Vethy Industrial Co., Ltd. is available for due-diligence checks.',
      width: 1190,
      height: 1683,
    },
  ];
  const cards = trustCards.map(card => `<article style="overflow:hidden;border:1px solid #e2e8f0;border-radius:8px;background:#fff"><div style="padding:10px;background:#fff"><img src="${escAttr(card.image)}" alt="${escAttr(card.alt)}" width="${card.width}" height="${card.height}" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;border-radius:6px;object-fit:contain"/></div><div style="border-top:1px solid #e2e8f0;padding:16px"><h3 style="margin:0 0 8px;font-family:Montserrat,Arial,sans-serif;font-size:15px;line-height:1.35;color:#020617">${escText(card.title)}</h3><p style="margin:0;color:#475569;font-size:14px;line-height:1.6">${escText(card.body)}</p></div></article>`).join('');
  return `<section style="background:#fff;border-bottom:1px solid #e2e8f0"><div style="max-width:1120px;margin:0 auto;padding:38px 16px"><div style="max-width:820px;margin-bottom:22px"><p style="margin:0 0 12px;color:#1d4ed8;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Factory and document support</p><h2 style="margin:0 0 12px;font-family:Montserrat,Arial,sans-serif;font-size:clamp(24px,4vw,34px);line-height:1.12;color:#020617">Factory and certificate background for VS02 PRO buyers</h2><p style="margin:0;color:#475569;font-size:16px;line-height:1.7">For fleet, dealer, installer, and distributor inquiries, CoolDrivePro can share Vethy-associated factory photos, certificate images, and company documents during quote review.</p></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px">${cards}</div></div></section>`;
}

const SEO_KEYWORD_CLUSTERS = {
  '/products/top-mounted-ac': [
    { label: 'Parking AC core searches', note: 'Use this product page for buyers searching for a parking air conditioner or parking AC for trucks, RVs, vans, and campers.', terms: ['parking air conditioner', 'parking ac', 'parking ac unit', 'parking ac for truck', 'parking ac for rv'] },
    { label: '12V and 24V parking AC searches', note: 'The VS02 PRO covers both 12V parking air conditioner and 24V parking air conditioner intent on one rooftop platform.', terms: ['12v parking air conditioner', '24v parking air conditioner', '12 volt parking ac', '24 volt parking ac', '12v 24v parking ac'] },
    { label: 'Rooftop and DC parking AC searches', note: 'Self-contained rooftop parking AC and DC parking air conditioner searches map directly to this 14\" / 356 mm roof-opening unit wired to the vehicle DC battery system.', terms: ['rooftop parking air conditioner', 'dc parking air conditioner', 'roof mounted parking ac', 'dc rooftop parking ac', 'top mounted parking ac'] },
    { label: 'Battery-powered no-idle cooling', note: 'Battery powered air conditioner searches and no-idle truck or RV cooling intent are answered by the VS02 PRO running from the vehicle 12V/24V battery bank.', terms: ['battery powered air conditioner', 'battery powered parking ac', 'no idle truck ac', 'battery powered ac for truck', 'battery powered ac for rv'] },
  ],
  '/solutions/truck-ac': [
    { label: 'Core truck AC searches', note: 'Use this page for broad truck air conditioner searches before routing buyers by vehicle size and cooling duty cycle.', terms: ['truck air conditioner', 'truck AC', 'truck AC unit', 'AC for truck', 'truck aircon'] },
    { label: 'Semi truck and sleeper intent', note: 'Move these searches toward semi-truck, sleeper-cab, and no-idle runtime content.', terms: ['semi truck air conditioner', 'AC for semi truck', 'semi truck AC unit', 'truck sleeper air conditioner', 'sleeper cab air conditioner'] },
    { label: 'Portable truck cooling intent', note: 'Explain the difference between temporary coolers and mounted 12V/24V compressor-based parking AC systems.', terms: ['portable AC for truck', 'portable air conditioner for truck', 'portable AC for semi truck', 'portable AC unit for truck drivers'] },
  ],
  '/solutions/12v-air-conditioner': [
    { label: 'Primary 12V AC searches', note: 'These generic searches should separate real compressor AC from small coolers.', terms: ['12V air conditioner', '12V AC unit', '12 volt air conditioner', '12 volt AC', '12V DC air conditioner'] },
    { label: 'Vehicle-specific 12V searches', note: 'Route these searches to the right vehicle branch before product comparison.', terms: ['12V air conditioner for truck', '12V RV air conditioner', '12V air conditioner for van', '12V camper AC', '12V air conditioner for car'] },
    { label: 'Format and cooler searches', note: 'Explain rooftop, mini split, portable, and evaporative-cooler differences clearly.', terms: ['12V rooftop air conditioner', '12V mini split', '12V portable AC', '12V evaporative cooler', '12V battery powered air conditioner'] },
    { label: 'Brand comparison searches', note: 'Treat brand names as comparison vocabulary and focus on voltage, cooling type, amp draw, fitment, and service support.', terms: ['Dometic 12V air conditioner', 'Nomadic 12V AC', 'Mabru 12V AC', 'Treeligo 12V air conditioner', 'Dometic RTX 2000 12V'] },
  ],
  '/solutions/12v-rv-air-conditioner': [
    { label: 'Core RV AC searches', note: 'Answer battery-powered RV cooling intent before pushing a product.', terms: ['12V RV air conditioner', '12 volt RV air conditioner', '12V RV AC', '12V RV AC unit', '12 volt RV AC unit'] },
    { label: 'Camper and caravan searches', note: 'Use these phrases around camper fitment, roof space, and house-battery planning.', terms: ['12V camper air conditioner', '12V camper AC', '12 volt air conditioner for camper', '12V air conditioner for caravan', '12 volt aircon for caravan'] },
    { label: 'Rooftop and off-grid searches', note: 'Tie rooftop and off-grid wording to roof opening checks and realistic overnight runtime.', terms: ['12V RV rooftop air conditioner', '12 volt RV roof air conditioner', 'RV AC unit 12 volt', '12V roof top air conditioner', 'off-grid RV air conditioner'] },
  ],
  '/solutions/12v-air-conditioner-for-van': [
    { label: 'Van AC searches', note: 'Explain roof layout, house-battery reserve, and cooling format options.', terms: ['12V air conditioner for van', '12 volt air conditioner for van', 'van air conditioner 12V', '12V AC unit for van', '12V AC van'] },
    { label: 'Campervan searches', note: 'Route van-life searches toward compact packaging, quiet sleep, and roof accessory tradeoffs.', terms: ['campervan air conditioner 12V', 'campervan aircon 12V', '12V aircon for campervan', 'best 12V air conditioner for van'] },
    { label: 'Cargo and service vehicle searches', note: 'Use work-vehicle language when cooling is about parked service time rather than overnight camping.', terms: ['AC for cargo van', 'HVAC van', '12V vehicle air conditioner', '12V mobile air conditioner', '12V DC air conditioner for van'] },
  ],
  '/solutions/12v-rooftop-air-conditioner': [
    { label: 'Core rooftop searches', note: 'Land these terms on roof fitment, cutout, sealing, and service-access guidance.', terms: ['12V rooftop air conditioner', '12 volt rooftop air conditioner', '12V roof top air conditioner', '12 volt roof mount air conditioner', '12V roof mount AC unit'] },
    { label: 'Vehicle rooftop searches', note: 'Use vehicle modifiers to route buyers by roof strength, cabin volume, and battery system.', terms: ['12V RV rooftop air conditioner', 'truck rooftop air conditioner', 'rooftop air conditioner for semi truck', 'roof mounted air conditioning units for trucks'] },
    { label: 'Fitment and format searches', note: 'Answer these with opening-size, flat-area, and rooftop-versus-split comparisons.', terms: ['12V DC rooftop air conditioner', '12V self contained rooftop air conditioner', 'roof mounted 12V air conditioner', 'top mounted parking AC'] },
  ],
  '/solutions/12v-mini-split-air-conditioner': [
    { label: 'Core mini split searches', note: 'Explain why split systems are usually chosen for quieter indoor comfort.', terms: ['12V mini split', '12 volt mini split', '12V mini split air conditioner', '12 volt mini split air conditioner', '12V DC mini split'] },
    { label: 'Vehicle mini split searches', note: 'Route these toward sleeper-cab, RV, and van placement considerations.', terms: ['mini split AC for semi truck', '12V mini split for RV', 'mini split AC for trucks', 'truck mini split AC', 'mini split for semi truck'] },
    { label: 'Split-system comparison searches', note: 'Compare installation work, indoor noise, and component placement.', terms: ['12V split air conditioner', '12 volt split air conditioner', '12V split system air conditioner', 'semi split air conditioner'] },
  ],
  '/solutions/portable-ac-for-truck': [
    { label: 'Portable truck searches', note: 'Compare temporary coolers with mounted compressor-based AC.', terms: ['portable AC for truck', 'portable air conditioner for truck', 'portable AC unit for truck', 'portable AC unit for truck drivers', 'best portable AC for truck'] },
    { label: 'Semi truck portable searches', note: 'Route sleeper-cab portable searches toward quiet, mounted no-idle systems when overnight comfort is the goal.', terms: ['portable AC for semi truck', 'portable air conditioner for semi truck', 'portable AC unit for semi truck', 'portable air conditioner for 18 wheeler'] },
    { label: '12V portable and cooler searches', note: 'Separate personal coolers, evaporative coolers, and true 12V refrigerated AC systems.', terms: ['12V portable AC', '12V portable air conditioner', '12 volt portable AC unit', 'portable AC unit 12 volt', '12V portable air conditioner cooler'] },
  ],
  '/solutions/semi-truck-parking-ac': [
    { label: 'High-intent semi truck searches', note: 'These terms usually indicate a driver, fleet, or installer planning real sleeper-cab cooling.', terms: ['semi truck air conditioner', 'semi truck AC unit', 'AC for semi truck', 'semi AC unit', 'truck cab AC unit'] },
    { label: 'Sleeper cab comfort searches', note: 'Route these toward quiet indoor airflow, berth comfort, and overnight runtime planning.', terms: ['truck sleeper air conditioner', 'semi truck sleeper AC unit', 'sleeper cab air conditioner', 'bunk AC for semi truck'] },
    { label: 'No-idle and battery-powered searches', note: 'Keep these connected to anti-idling compliance, 24V power, and battery reserve content.', terms: ['no idle air conditioning for semi trucks', 'battery powered AC unit for semi truck', 'electric AC for semi truck', '24V truck air conditioner'] },
  ],
  '/solutions/rv-parking-ac': [
    { label: 'RV and camper cooling searches', note: 'Use this language when buyers compare battery-powered RV AC with shore-power rooftop units.', terms: ['12V RV air conditioner', '12 volt RV air conditioner', '12V RV AC', '12V camper air conditioner', '12 volt air conditioner for camper'] },
    { label: 'Caravan and motorhome searches', note: 'Connect these terms to roof fitment, house-battery runtime, and quiet-hour use cases.', terms: ['12V air conditioner for caravan', '12 volt air conditioner for caravan', '12V motorhome air conditioning unit', 'truck camper air conditioner'] },
    { label: 'Off-grid and rooftop searches', note: 'Keep rooftop and off-grid wording tied to installation limits and realistic battery reserve.', terms: ['12V RV rooftop air conditioner', '12 volt RV roof air conditioner', 'off-grid RV air conditioner', '12V rooftop AC unit'] },
  ],
  '/solutions/van-parking-ac': [
    { label: 'Van and campervan searches', note: 'Route these terms by roof space, house-battery reserve, and whether the van is used for work or sleeping.', terms: ['12V air conditioner for van', '12 volt air conditioner for van', 'van air conditioner 12V', 'campervan aircon 12V', '12V AC unit for van'] },
    { label: 'Cargo and service van searches', note: 'Use compact product routing when parked jobsite cooling and mobile work comfort are the main needs.', terms: ['AC for cargo van', 'HVAC van', '12V vehicle air conditioner', '12V mobile air conditioner'] },
    { label: 'Best-product searches', note: 'Answer these with fitment criteria instead of a one-size-fits-all claim.', terms: ['best 12V air conditioner for van', 'best 12V portable air conditioner', 'small 12V air conditioner', '12V DC air conditioner for van'] },
  ],
};

function renderKeywordClusters(pathname) {
  const clusters = SEO_KEYWORD_CLUSTERS[pathname];
  if (!clusters) return '';
  const cards = clusters.map(cluster => `<article style="border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;padding:18px"><h3 style="margin:0 0 8px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:1.35;color:#020617">${escText(cluster.label)}</h3><p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6">${escText(cluster.note)}</p><p style="margin:0;color:#334155;font-size:13px;line-height:1.7">${cluster.terms.map(escText).join(' | ')}</p></article>`).join('');
  return `<section style="background:#fff;border-bottom:1px solid #e2e8f0"><div style="max-width:1120px;margin:0 auto;padding:32px 16px"><div style="max-width:820px;margin-bottom:18px"><p style="margin:0 0 10px;color:#1d4ed8;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Buyer language</p><h2 style="margin:0;font-family:Montserrat,Arial,sans-serif;font-size:24px;line-height:1.2;color:#020617">Match common searches to the right cooling path</h2></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">${cards}</div></div></section>`;
}

function renderProcurementPath() {
  const cards = [
    {
      title: 'Fitment data for a useful quote',
      body: 'Send vehicle type, 12V or 24V power, roof opening or mounting space, cabin size, climate, and target runtime so the recommendation is not based on keywords alone.',
    },
    {
      title: 'B2B buyer roles we route differently',
      body: 'Distributor, dealer, fleet, installer, OEM, upfitter, and bulk-order inquiries need different proof: product range, install repeatability, documents, MOQ, and after-sales support.',
    },
    {
      title: 'Documents that reduce procurement risk',
      body: 'Ask for specification sheets, installation drawings, wiring notes, product photos, factory background, certificate images, warranty terms, and shipping details before invoice confirmation.',
    },
  ];
  const cardHtml = cards.map(card => `<article style="border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:18px"><h3 style="margin:0 0 8px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:1.35;color:#020617">${escText(card.title)}</h3><p style="margin:0;color:#475569;font-size:14px;line-height:1.6">${escText(card.body)}</p></article>`).join('');
  return `<section style="background:#f8fafc;border-bottom:1px solid #e2e8f0"><div style="max-width:1120px;margin:0 auto;padding:34px 16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px"><div><p style="margin:0 0 10px;color:#1d4ed8;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">B2B procurement path</p><h2 style="margin:0 0 12px;font-family:Montserrat,Arial,sans-serif;font-size:24px;line-height:1.2;color:#020617">Turn this search into a quote-ready specification</h2><p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.65">CoolDrivePro is built for export and B2B inquiry workflows. Use the search page to narrow the cooling format, then send the details a dealer, fleet manager, installer, or procurement buyer needs before pricing.</p><p style="margin:0;display:flex;flex-wrap:wrap;gap:10px"><a href="/contact/" style="display:inline-flex;min-height:42px;align-items:center;justify-content:center;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;padding:10px 16px;font-weight:800;font-size:14px">Request fitment quote</a><a href="/landing/distributor-parking-ac/" style="display:inline-flex;min-height:42px;align-items:center;justify-content:center;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#1d4ed8;text-decoration:none;padding:10px 16px;font-weight:800;font-size:14px">Distributor inquiry</a></p></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px">${cardHtml}</div></div></section>`;
}

function seoLinksFor(pathname) {
  const defaults = [
    { href: '/solutions/truck-ac/', title: 'Truck AC Buyer Hub', body: 'Compare 12V air conditioner options for trucks, semi trucks, pickups, truck campers, caps, and bed workspaces.' },
    { href: '/products/top-mounted-ac/', title: 'VS02 PRO Top-Mounted Parking AC', body: 'A 12V/24V rooftop parking air conditioner for trucks, RVs, vans, and standard fleet installs.' },
    { href: '/products/mini-split-ac/', title: 'VX3000SP Mini Split Parking AC', body: 'A split truck parking AC option for sleeper cabs and buyers prioritizing lower indoor noise.' },
  ];
  const byPath = {
    '/solutions/12v-air-conditioner': [
      { href: '/solutions/12v-rv-air-conditioner/', title: '12V RV Air Conditioner', body: 'Battery-powered RV, camper, motorhome, and caravan cooling guidance.' },
      { href: '/solutions/12v-air-conditioner-for-van/', title: '12V Air Conditioner for Van', body: 'Compact DC cooling for camper vans, cargo vans, and service vans.' },
      { href: '/solutions/12v-rooftop-air-conditioner/', title: '12V Rooftop Air Conditioner', body: 'Roof-mounted DC AC planning for RVs, trucks, vans, and campers.' },
    ],
    '/solutions/12v-rv-air-conditioner': [
      { href: '/solutions/off-grid-rv-air-conditioner/', title: 'Off-Grid RV Air Conditioner', body: 'Battery, solar, and quiet-hour runtime planning for boondocking.' },
      { href: '/products/top-mounted-ac/', title: 'VS02 PRO 12V/24V Rooftop AC', body: 'The broad CoolDrivePro rooftop path for RV and camper cooling.' },
      { href: '/compare/parking-ac-battery-runtime/', title: 'Battery Runtime Guide', body: 'Check whether the battery bank supports the target cooling window.' },
    ],
    '/solutions/12v-air-conditioner-for-van': [
      { href: '/solutions/camper-van-parking-ac/', title: 'Camper Van Parking AC', body: 'Sprinter, Transit, ProMaster, and van-life fitment guidance.' },
      { href: '/products/nano-max/', title: 'Nano Max Compact Van AC', body: 'A compact 12V/24V branch for tight van roofs and lighter battery banks.' },
      { href: '/compare/parking-ac-roof-fitment-guide/', title: 'Roof Fitment Guide', body: 'Check roof openings, racks, vents, and solar layout before choosing a van AC.' },
    ],
    '/solutions/12v-rooftop-air-conditioner': [
      { href: '/products/top-mounted-ac/', title: 'VS02 PRO Top-Mounted AC', body: 'The main CoolDrivePro 12V/24V rooftop parking AC product.' },
      { href: '/compare/rooftop-vs-mini-split-parking-ac/', title: 'Rooftop vs Mini Split', body: 'Compare installation complexity, noise, and vehicle fit before buying.' },
      { href: '/compare/parking-ac-roof-fitment-guide/', title: 'Roof Fitment Guide', body: 'Confirm roof opening, flat mounting area, and service access.' },
    ],
    '/solutions/12v-mini-split-air-conditioner': [
      { href: '/products/mini-split-ac/', title: 'VX3000SP Mini Split AC', body: 'The main CoolDrivePro split-system 12V/24V parking AC product.' },
      { href: '/solutions/sleeper-cab-air-conditioner/', title: 'Sleeper Cab Air Conditioner', body: 'Use this branch when mini split intent is about semi truck sleep comfort.' },
      { href: '/compare/rooftop-vs-mini-split-parking-ac/', title: 'Rooftop vs Mini Split', body: 'Validate the format before choosing a product branch.' },
    ],
    '/solutions/portable-ac-for-truck': [
      { href: '/solutions/truck-ac/', title: 'Truck AC Buyer Hub', body: 'Move from portable wording into the broader truck AC product-routing page.' },
      { href: '/products/nano-max/', title: 'Nano Max Compact Truck AC', body: 'A compact mounted option for portable-truck-AC intent.' },
      { href: '/solutions/semi-truck-parking-ac/', title: 'Semi Truck Parking AC', body: 'Use this path when the buyer is cooling a sleeper cab or long-haul truck.' },
    ],
    '/solutions/sleeper-cab-air-conditioner': [
      { href: '/products/mini-split-ac/', title: 'VX3000SP for Sleeper Cabs', body: 'Quiet indoor comfort for drivers who sleep in the berth overnight.' },
      { href: '/solutions/semi-truck-parking-ac/', title: 'Semi Truck Parking AC Hub', body: 'Broader 24V truck cooling guidance for owner-operators and fleets.' },
      { href: '/blog/parking-ac-for-semi-sleeper-berth/', title: 'Sleeper Berth Cooling Guide', body: 'Long-tail education for DOT rest, heat stress, and berth comfort.' },
    ],
    '/solutions/fleet-parking-ac': [
      { href: '/blog/parking-ac-vs-apu/', title: 'Parking AC vs APU', body: 'Compare fleet cost, maintenance, fuel use, and driver comfort over the ownership cycle.' },
      { href: '/landing/fleet-parking-ac-roi/', title: 'Fleet ROI Quote Page', body: 'Send vehicle count, idle hours, and target runtime for a fast fleet recommendation.' },
      { href: '/products/top-mounted-ac/', title: 'VS02 PRO Fleet Rollout', body: 'A standardized rooftop platform for repeatable installs and service training.' },
    ],
    '/solutions/parking-ac-distributor': [
      { href: '/landing/distributor-parking-ac/', title: 'Distributor Inquiry Page', body: 'Request dealer terms, product sheets, and regional supply support.' },
      { href: '/blog/truck-ac-distributor-africa/', title: 'Distributor Program Example', body: 'A regional distributor article that supports B2B truck AC partner intent.' },
      { href: '/products/', title: 'Product Lineup', body: 'Compare rooftop, mini split, heating and cooling, and compact truck AC models.' },
    ],
    '/solutions/semi-truck-parking-ac': [
      { href: '/solutions/sleeper-cab-air-conditioner/', title: 'Sleeper Cab Air Conditioner', body: 'A focused page for quiet berth cooling and driver rest intent.' },
      { href: '/solutions/no-idle-truck-air-conditioner/', title: 'No-Idle Truck Air Conditioner', body: 'Compliance, fuel savings, and anti-idling planning for truck buyers.' },
      { href: '/products/mini-split-ac/', title: 'VX3000SP Mini Split Parking AC', body: 'A strong product match for premium sleeper cab comfort.' },
    ],
  };
  return byPath[pathname] || defaults;
}

function renderVisibleSeoBody(meta, lang, pathname, crumbs) {
  const links = seoLinksFor(pathname);
  const isProduct = Boolean(PRODUCT_SCHEMA[pathname]);
  const label = isProduct ? 'Product focus' : 'SEO focus';
  const factoryTrust = pathname === '/products/top-mounted-ac' ? renderProductFactoryTrustSection() : '';
  const keywordClusters = renderKeywordClusters(pathname);
  const procurementPath = renderProcurementPath();
  const checklist = isProduct
    ? ['Confirm 12V or 24V vehicle power before ordering.', 'Check roof opening, mounting space, and service access.', 'Match cooling capacity to cab, RV, van, or fleet duty cycle.']
    : ['Use the exact vehicle or buyer intent as the page focus.', 'Compare voltage, runtime, installation format, and support path.', 'Move buyers toward the closest product or quote page with internal links.'];
  return `<main style="min-height:100vh;background:#fff;color:#0f172a;font-family:Inter,Arial,sans-serif"><section style="border-bottom:1px solid #e2e8f0;background:#f8fafc"><div style="max-width:1120px;margin:0 auto;padding:40px 16px 44px">${crumbs}<p style="margin:0 0 12px;color:#1d4ed8;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">${escText(label)}</p><h1 style="margin:0;max-width:840px;font-family:Montserrat,Arial,sans-serif;font-size:clamp(32px,5vw,50px);line-height:1.08;font-weight:800;color:#020617">${escText(meta.title)}</h1><p style="margin:18px 0 0;max-width:780px;color:#475569;font-size:18px;line-height:1.65">${escText(meta.desc)}</p><div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px"><a href="/contact/" style="display:inline-flex;min-height:46px;align-items:center;justify-content:center;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;font-weight:800;font-size:14px">Get model recommendation</a><a href="/products/" style="display:inline-flex;min-height:46px;align-items:center;justify-content:center;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;text-decoration:none;padding:12px 18px;font-weight:800;font-size:14px">Compare products</a></div></div></section>${factoryTrust}${keywordClusters}${procurementPath}<section style="max-width:1120px;margin:0 auto;padding:34px 16px"><h2 style="margin:0 0 16px;font-family:Montserrat,Arial,sans-serif;font-size:24px;line-height:1.2;color:#020617">Best next pages for this search</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">${links.map(link => `<a href="${escAttr(link.href)}" style="display:block;border:1px solid #e2e8f0;border-radius:8px;padding:18px;text-decoration:none;color:#0f172a;background:#fff"><strong style="display:block;margin-bottom:8px;font-family:Montserrat,Arial,sans-serif;font-size:16px;color:#020617">${escText(link.title)}</strong><span style="display:block;color:#475569;font-size:14px;line-height:1.55">${escText(link.body)}</span></a>`).join('')}</div></section><section style="background:#f8fafc;border-top:1px solid #e2e8f0"><div style="max-width:1120px;margin:0 auto;padding:32px 16px 44px"><h2 style="margin:0 0 14px;font-family:Montserrat,Arial,sans-serif;font-size:24px;line-height:1.2;color:#020617">Buying checks</h2><ul style="margin:0;padding-left:20px;color:#334155;line-height:1.8;font-size:15px">${checklist.map(item => `<li>${escText(item)}</li>`).join('')}</ul></div></section></main>`;
}

const APU_HUB_RUNTIME_ROWS = [
  ['Mild night — 70 °F / 21 °C, low fan', '12+ h on AC mode'],
  ['Typical summer night — 85 °F / 30 °C, mid fan', '8–10 h on AC mode'],
  ['Hot night — 95 °F / 35 °C, mid-high fan', '6–8 h on AC mode'],
  ['Extreme heat — 110 °F / 43 °C, high fan', '4–6 h on AC mode'],
  ['Mixed cabin loads (AC + fridge + inverter)', '6–9 h depending on inverter draw'],
  ['Recharge while driving', '≈ 2–3 h at highway alternator output via DC-DC charger'],
  ['Recharge from shore power (110/220 V)', '≈ 4–5 h from 20% to full'],
];
const APU_HUB_SOURCES = [
  { title: 'U.S. DOE AFDC — Idle Reduction for Heavy-Duty Vehicles', href: 'https://afdc.energy.gov/conserve/idle_reduction_hdv.html', note: 'Long-haul tractors idle on the order of 1,800–2,400 hours per year and burn roughly 0.6–1.0 gallons of diesel per idle hour.' },
  { title: 'U.S. EPA SmartWay — Idle Reduction Technologies', href: 'https://www.epa.gov/smartway/smartway-technology-program-idle-reduction-technologies', note: 'EPA documents APUs and other idle-reduction technologies as the compliant way to cut sleeper-cab idle fuel use and emissions.' },
  { title: 'U.S. DOE AFDC — State Idling Regulations', href: 'https://afdc.energy.gov/conserve/idle_reduction_regulations.html', note: 'Tracks the 30+ U.S. states and many local jurisdictions that restrict heavy-duty idling, the time limits and the typical penalties.' },
  { title: 'California ARB — Heavy-Duty Vehicle Idling ATCM', href: 'https://ww2.arb.ca.gov/our-work/programs/commercial-vehicle-idling', note: "California's 5-minute idle rule and the APU certification requirements that apply to in-state sleeper-cab operation." },
  { title: 'Argonne National Laboratory — Long-Haul Truck Idling Burns Fuel and Money', href: 'https://www.anl.gov/article/longhaul-truck-idling-burns-fuel-and-money', note: 'Federal lab analysis behind the ~$1,800/year idle fuel cost figure and the engine wear equivalence (about 1 idle hour ≈ 33 highway miles).' },
  { title: 'ATRI — An Analysis of the Operational Costs of Trucking', href: 'https://truckingresearch.org/atri-research/operational-costs/', note: 'American Transportation Research Institute annual cost-of-trucking report used to sanity-check fuel and maintenance figures cited above.' },
];
function renderApuHubExtra() {
  const runtimeRows = APU_HUB_RUNTIME_ROWS.map(([l, v]) => `<tr><th scope="row">${escText(l)}</th><td>${escText(v)}</td></tr>`).join('');
  const faqHTML = APU_HUB_FAQ_ITEMS.map(({ q, a }) => `<details><summary>${escText(q)}</summary><p>${escText(a)}</p></details>`).join('');
  const sourcesHTML = APU_HUB_SOURCES.map(({ title, href, note }) => `<li><a href="${escAttr(href)}" rel="nofollow noopener" target="_blank">${escText(title)}</a> — <span>${escText(note)}</span></li>`).join('');
  return `<section aria-labelledby="apu-runtime"><h2 id="apu-runtime">How long a modular truck APU runs on battery</h2><p>Reference runtime for a CoolDrivePro Battery APU Kit (24V / 200Ah LiFePO4 + 12,000 BTU parking AC). Real runtime depends on cab insulation, set-point and fan speed.</p><table><thead><tr><th scope="col">Condition</th><th scope="col">Battery runtime</th></tr></thead><tbody>${runtimeRows}</tbody></table></section><section aria-labelledby="apu-sources"><h2 id="apu-sources">Sources for idle, fuel and regulation claims</h2><p>We anchor cost, idle-hour and state-rule numbers on this page to public government and industry data so fleet buyers can verify them.</p><ul>${sourcesHTML}</ul></section><section aria-labelledby="apu-faq"><h2 id="apu-faq">Truck APU — frequently asked questions</h2>${faqHTML}</section>`;
}
function renderStaticBody(meta, lang, p) {
  const crumbs = p && p !== '/' ? crumbsHTML([
    { name: 'Home', url: localizedUrl(lang, '/') },
    { name: meta.title.split('|')[0].trim(), url: localizedUrl(lang, p) },
  ]) : '';
  if (lang === DEFAULT_LANG && p === '/tools/parking-ac-fitment-planner') {
    return `<main>${crumbs}<article><h1>${escText(meta.title)}</h1><p>${escText(meta.desc)}</p><section><h2>Start with the vehicle and voltage</h2><p>Choose whether the application is a semi truck sleeper, RV, cargo or camper van, or pickup and work truck. All current product paths in this planner support 12V and 24V DC, so voltage is documented for wiring and battery review rather than used to eliminate a model.</p></section><section><h2>Choose the operating priority</h2><ul><li>Quiet overnight comfort for sleeper cabs and premium builds</li><li>A straightforward rooftop installation path for repeatable fitment</li><li>A compact footprint for smaller vehicles and restricted roof space</li><li>Heating and cooling planning for mixed-season routes</li></ul></section><section><h2>Confirm the final fitment</h2><p>The planner creates a product path, not a final installation approval. Verify roof photos, mounting dimensions, battery architecture, cable routing, and service access before ordering.</p><p><a href="/vehicle-compatibility/">Open the vehicle compatibility guide</a> or <a href="/contact/?intent=fitment-planner">request fitment confirmation</a>.</p></section></article></main>`;
  }
  if (lang === DEFAULT_LANG && (COMMERCIAL_HUB_META[p] || PRODUCT_SCHEMA[p])) {
    return renderVisibleSeoBody(meta, lang, p, crumbs);
  }
  if (lang === DEFAULT_LANG && p === '/apu') {
    return `<main>${crumbs}<h1>${escText(meta.title)}</h1><p>${escText(meta.desc)}</p>${renderApuHubExtra()}</main>`;
  }
  return `<main>${crumbs}<h1>${escText(meta.title)}</h1><p>${escText(meta.desc)}</p></main>`;
}
function renderBlogBody(article, lang, slug) {
  // Build inline-image map keyed by section index for in-content insertion
  const inlineByIdx = {};
  if (Array.isArray(article.inlineImages)) {
    for (const im of article.inlineImages) {
      if (!im.url) continue;
      const k = Number.isFinite(im.afterSection) ? im.afterSection : -1;
      (inlineByIdx[k] ||= []).push(im);
    }
  }
  function inlineImgsAfter(idx) {
    const arr = inlineByIdx[idx];
    if (!arr) return '';
    return arr.map(im => `<figure><img src="${escAttr(im.url)}" alt="${escAttr(im.alt || article.title)}" loading="lazy" decoding="async" width="${im.width || 1280}" height="${im.height || 720}" />${im.caption ? `<figcaption>${escText(im.caption)}</figcaption>` : ''}</figure>`).join('');
  }
  let content = '';
  if (Array.isArray(article.content)) {
    article.content.forEach((item, i) => {
      if (typeof item === 'string') content += mdToHtml(item);
      else if (item && typeof item === 'object') {
        if (item.heading) content += `<h2>${escText(item.heading)}</h2>`;
        if (item.body) content += mdToHtml(item.body);
      }
      content += inlineImgsAfter(i);
    });
  } else if (typeof article.content === 'string') {
    content = String(article.content).replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+="[^"]*"/gi, '');
  }
  const heroImg = article.image
    ? `<img src="${escAttr(article.image)}" alt="${escAttr(article.imageAlt || article.title)}" width="${article.imageWidth || 1280}" height="${article.imageHeight || 720}" loading="eager" decoding="async" fetchpriority="high" />`
    : '';
  const crumbs = crumbsHTML([
    { name: 'Home', url: localizedUrl(lang, '/') },
    { name: 'Blog', url: localizedUrl(lang, '/blog') },
    { name: article.title, url: localizedUrl(lang, `/blog/${slug}`) },
  ]);
  const related = relatedFor(slug, lang);
  const relatedHTML = related.length
    ? `<aside aria-label="Related articles"><h2>Related Articles</h2><ul>${related.map(r => `<li><a href="${escAttr(r.url)}">${escText(r.title)}</a></li>`).join('')}</ul></aside>`
    : '';
  return `<main>${crumbs}<article><h1>${escText(article.title)}</h1><p>${escText(article.metaDescription || '')}</p>${heroImg}${content}</article>${relatedHTML}</main>`;
}

function renderLandingBody(page) {
  const trustCards = [
    {
      image: '/images/trust/vethy-factory-manufacturing-excellence.jpg',
      alt: 'Vethy parking air conditioner manufacturing workshop and testing environment',
      title: 'Factory and production-line photos',
      body: 'Workshop images show parking AC assembly, component handling, and bench testing environments for B2B supply review.',
      width: 750,
      height: 1050,
    },
    {
      image: '/images/trust/vethy-quality-certifications-overview.jpg',
      alt: 'Vethy quality certification and company credit document overview',
      title: 'Company document support',
      body: 'Distributor and fleet buyers can request current company materials, certificate scans, and credit documents during onboarding.',
      width: 750,
      height: 950,
    },
    {
      image: '/images/trust/qingdao-vethy-iso-9001-certificate.jpg',
      alt: 'Qingdao Vethy Industrial Co Ltd ISO 9001 2015 quality management system certificate',
      title: 'ISO 9001 certificate image',
      body: 'English ISO 9001:2015 certificate image for Qingdao Vethy Industrial Co., Ltd. is available for due-diligence checks.',
      width: 1190,
      height: 1683,
    },
  ];

  const trustCardHtml = trustCards.map(card => `<article style="overflow:hidden;border:1px solid #e2e8f0;border-radius:8px;background:#fff"><div style="padding:10px;background:#fff"><img src="${escAttr(card.image)}" alt="${escAttr(card.alt)}" width="${card.width}" height="${card.height}" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;border-radius:6px;object-fit:contain"/></div><div style="border-top:1px solid #e2e8f0;padding:16px"><h3 style="margin:0 0 8px;font-family:Montserrat,Arial,sans-serif;font-size:15px;line-height:1.35;color:#020617">${escText(card.title)}</h3><p style="margin:0;color:#475569;font-size:14px;line-height:1.6">${escText(card.body)}</p></div></article>`).join('');

  return `<main style="min-height:100vh;background:#fff;color:#0f172a;font-family:Inter,Arial,sans-serif"><header style="border-bottom:1px solid #e2e8f0;background:#fff"><div style="max-width:1280px;margin:0 auto;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 16px"><a href="/" style="display:flex;align-items:center;gap:10px;color:#020617;text-decoration:none;font-weight:800;font-size:20px"><img src="/logo.png" alt="CoolDrivePro" width="40" height="40" style="width:36px;height:36px;object-fit:contain"/>CoolDrivePro</a><a href="#quote" style="display:inline-flex;min-height:40px;align-items:center;justify-content:center;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;padding:8px 16px;font-weight:700;font-size:14px">Get quote</a></div></header><section style="border-bottom:1px solid #e2e8f0"><div style="max-width:1280px;margin:0 auto;display:grid;gap:32px;padding:36px 16px 48px"><div><p style="margin:0 0 14px;color:#1d4ed8;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">${escText(page.eyebrow)}</p><h1 style="margin:0;max-width:760px;font-family:Montserrat,Arial,sans-serif;font-size:clamp(34px,6vw,54px);line-height:1.05;font-weight:800;color:#020617">${escText(page.headline)}</h1><p style="margin:20px 0 0;max-width:720px;color:#475569;font-size:18px;line-height:1.65">${escText(page.subhead)}</p><div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:26px"><a href="#quote" style="display:inline-flex;min-height:48px;align-items:center;justify-content:center;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;font-weight:800;font-size:14px">${escText(page.cta)}</a><a href="https://wa.me/8618561534326?text=Hi%2C%20I%27m%20interested%20in%20CoolDrivePro%20parking%20air%20conditioners.%20Please%20send%20pricing%20and%20recommendations." style="display:inline-flex;min-height:48px;align-items:center;justify-content:center;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;text-decoration:none;padding:12px 20px;font-weight:800;font-size:14px">WhatsApp</a></div></div><div style="border:1px solid #e2e8f0;background:#f8fafc;border-radius:8px;padding:14px"><img src="${escAttr(page.image)}" alt="${escAttr(page.headline)}" width="900" height="394" fetchpriority="high" decoding="async" style="display:block;width:100%;max-height:420px;object-fit:contain"/></div></div></section><section style="background:#f8fafc;border-bottom:1px solid #e2e8f0"><div style="max-width:1280px;margin:0 auto;padding:42px 16px"><div style="max-width:820px;margin-bottom:24px"><p style="margin:0 0 12px;color:#1d4ed8;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Factory and document support</p><h2 style="margin:0 0 12px;font-family:Montserrat,Arial,sans-serif;font-size:clamp(26px,4vw,36px);line-height:1.12;color:#020617">Manufacturing background for B2B parking AC buyers</h2><p style="margin:0;color:#475569;font-size:16px;line-height:1.7">For fleet, dealer, installer, and distributor inquiries, CoolDrivePro can share Vethy-associated factory photos, certificate images, and company documents during quote review.</p></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px">${trustCardHtml}</div></div></section><section id="quote" style="background:#fff"><div style="max-width:960px;margin:0 auto;padding:36px 16px 48px"><h2 style="margin:0 0 10px;font-family:Montserrat,Arial,sans-serif;font-size:28px;line-height:1.15;color:#020617">Price and model fit in 12 hours</h2><p style="margin:0 0 18px;color:#475569;line-height:1.6">Start with email and vehicle type. The interactive form loads automatically; direct chat is available immediately.</p><a href="mailto:support@cooldrivepro.com?subject=CoolDrivePro%20quote%20request" style="display:inline-flex;min-height:48px;align-items:center;justify-content:center;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;font-weight:800;font-size:14px">Email support@cooldrivepro.com</a></div></section></main>`;
}

function loadArticle(slug, lang) {
  const fp = lang === DEFAULT_LANG
    ? path.join(BLOG_DIR, `${slug}.json`)
    : path.join(LOCALE_DIR, lang, `${slug}.json`);
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return null; }
}

function listBlogSlugs() {
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.json'))
    .filter(f => !['list.json','manifest.json','related-posts.json','locale-availability.json'].includes(f))
    .map(f => f.replace(/\.json$/, ''));
}

function blogLangsForSlug(slug) {
  const langs = new Set([DEFAULT_LANG]);
  const listed = BLOG_LOCALE_AVAILABILITY[slug];

  if (Array.isArray(listed)) {
    for (const lang of listed) {
      if (LANG_SET.has(lang)) langs.add(lang);
    }
    return LANGS.filter(lang => langs.has(lang));
  }

  for (const lang of LANGS) {
    if (lang === DEFAULT_LANG) continue;
    if (fs.existsSync(path.join(LOCALE_DIR, lang, `${slug}.json`))) langs.add(lang);
  }

  return LANGS.filter(lang => langs.has(lang));
}

function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

function writePage(outRel, html) {
  const outDir = path.join(DIST, outRel);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
}

const ORG_SAME_AS = [
  'https://www.facebook.com/vethyautomotive/',
  'https://www.youtube.com/@vethyparkingcooler',
  'https://github.com/vethymch-spec/cooldrivepro-cdn',
];
const ORG_AREA_SERVED = [
  'North America', 'European Union', 'United Kingdom', 'Australia',
  'New Zealand', 'Middle East', 'Southeast Asia', 'South Africa',
];
const FACTORY_IMAGES = [
  'https://cooldrivepro.com/images/factory/cooldrivepro-wholesale-loading-yard.webp',
  'https://cooldrivepro.com/images/factory/cooldrivepro-production-line-assembly.webp',
  'https://cooldrivepro.com/images/factory/cooldrivepro-factory-pallet-yard.webp',
  'https://cooldrivepro.com/images/factory/cooldrivepro-real-pallet-stacks.webp',
  'https://cooldrivepro.com/images/factory/cooldrivepro-warehouse-container-loading.webp',
  'https://cooldrivepro.com/images/factory/cooldrivepro-container-loading-yard.webp',
];
const EXHIBITION_IMAGES = Array.from({ length: 8 }, (_, i) =>
  `https://cooldrivepro.com/images/trust/exhibitions/cooldrivepro-trade-show-${String(i + 1).padStart(2, '0')}.jpg`
);
const APU_HUB_ITEMLIST = {
  '@type': 'ItemList',
  name: 'CoolDrivePro Truck APU Resource Hub',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'What is a truck APU?', url: `${DOMAIN}/apu/what-is-a-truck-apu/` },
    { '@type': 'ListItem', position: 2, name: 'How a truck APU works', url: `${DOMAIN}/apu/how-it-works/` },
    { '@type': 'ListItem', position: 3, name: 'Electric APU', url: `${DOMAIN}/apu/electric/` },
    { '@type': 'ListItem', position: 4, name: 'Diesel APU', url: `${DOMAIN}/apu/diesel/` },
    { '@type': 'ListItem', position: 5, name: 'Hybrid APU', url: `${DOMAIN}/apu/hybrid/` },
    { '@type': 'ListItem', position: 6, name: 'APU builder', url: `${DOMAIN}/apu/builder/` },
    { '@type': 'ListItem', position: 7, name: 'APU ROI calculator', url: `${DOMAIN}/apu/roi-calculator/` },
    { '@type': 'ListItem', position: 8, name: 'APU compliance (CARB/EPA)', url: `${DOMAIN}/apu/compliance/` },
    { '@type': 'ListItem', position: 9, name: 'APU comparison', url: `${DOMAIN}/apu/compare/` },
    { '@type': 'ListItem', position: 10, name: 'APU case studies', url: `${DOMAIN}/apu/case-studies/` },
    { '@type': 'ListItem', position: 11, name: 'APU R&D', url: `${DOMAIN}/apu/r-and-d/` },
    { '@type': 'ListItem', position: 12, name: 'APU installation', url: `${DOMAIN}/apu/install/` },
    { '@type': 'ListItem', position: 13, name: 'APU FAQ', url: `${DOMAIN}/apu/faq/` },
  ],
};

const APU_FAQ_NODE = {
  '@type': 'FAQPage',
  mainEntity: APU_FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const APU_HUB_FAQ_NODE = {
  '@type': 'FAQPage',
  mainEntity: APU_HUB_FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const TRUCK_AC_FAQ_NODE = {
  '@type': 'FAQPage',
  mainEntity: TRUCK_AC_FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const STATIC_PAGE_EXTRA_GRAPH = {
  '/tools/parking-ac-fitment-planner': [{
    '@type': 'WebApplication',
    '@id': 'https://cooldrivepro.com/tools/parking-ac-fitment-planner/#webapplication',
    name: 'CoolDrivePro Parking AC Fitment Planner',
    url: 'https://cooldrivepro.com/tools/parking-ac-fitment-planner/',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'An interactive selector for CoolDrivePro parking air conditioner product paths using vehicle type, voltage, installation preference, and operating goal.',
  }],
  '/apu': [APU_HUB_ITEMLIST, APU_HUB_FAQ_NODE],
  '/apu/faq': [APU_FAQ_NODE],
  '/solutions/truck-ac': [TRUCK_AC_FAQ_NODE],
  '/about': [{
    '@type': 'AboutPage',
    name: 'About CoolDrivePro',
    url: 'https://cooldrivepro.com/about/',
    description: 'CoolDrivePro designs and manufactures 12V/24V parking air conditioners for trucks, RVs and vans — founded by a former long-haul trucker, built at a vertically integrated Qingdao Vethy factory.',
    inLanguage: 'en',
    mainEntity: {
      '@type': 'Organization',
      name: 'CoolDrivePro',
      url: 'https://cooldrivepro.com',
      logo: 'https://cooldrivepro.com/logo.png',
      foundingDate: '2020',
      areaServed: ORG_AREA_SERVED,
      sameAs: ORG_SAME_AS,
      knowsAbout: [
        'Parking Air Conditioner', '12V DC Air Conditioner', '24V DC Air Conditioner',
        'No-Idle Truck Cooling', 'RV Air Conditioner', 'Battery-Powered Vehicle HVAC', 'APU Replacement Cooling',
      ],
      subjectOf: [
        { '@type': 'WebPage', url: 'https://cooldrivepro.com/about/factory/', name: 'Inside Our Factory' },
        { '@type': 'WebPage', url: 'https://cooldrivepro.com/about/certifications/', name: 'Certifications & Quality' },
        { '@type': 'WebPage', url: 'https://cooldrivepro.com/about/exhibitions/', name: 'Trade Shows & Global Presence' },
      ],
    },
  }],
  '/about/factory': [
    {
      '@type': 'AboutPage',
      name: 'CoolDrivePro Factory & Manufacturing Tour',
      url: 'https://cooldrivepro.com/about/factory/',
      description: 'Tour the CoolDrivePro / Qingdao Vethy parking AC factory: 120,000+ units annual capacity, in-house R&D, 100% pre-shipment QC, daily 40HQ container loading.',
      inLanguage: 'en',
      mainEntity: {
        '@type': 'Organization',
        name: 'CoolDrivePro',
        url: 'https://cooldrivepro.com',
        logo: 'https://cooldrivepro.com/logo.png',
        sameAs: ORG_SAME_AS,
        image: FACTORY_IMAGES.slice(0, 3),
        address: { '@type': 'PostalAddress', addressCountry: 'CN', addressRegion: 'Shandong', addressLocality: 'Qingdao' },
        makesOffer: { '@type': 'Offer', itemOffered: { '@type': 'Product', name: '12V/24V DC Parking Air Conditioner', category: 'Vehicle Air Conditioning' } },
      },
    },
    {
      '@type': 'VideoObject',
      name: 'CoolDrivePro parking AC factory walk-through',
      description: 'Ambient walk-through of the CoolDrivePro / Qingdao Vethy 12V/24V parking AC production facility — SMT, refrigerant circuit, sheet metal, assembly, QC and packing lines.',
      thumbnailUrl: FACTORY_IMAGES.slice(0, 3),
      uploadDate: '2026-05-19',
      duration: 'PT28S',
      contentUrl: 'https://cooldrivepro.com/videos/cooldrivepro-factory-tour.mp4',
      embedUrl: 'https://cooldrivepro.com/about/factory/',
      inLanguage: 'en',
      publisher: { '@type': 'Organization', name: 'CoolDrivePro', logo: { '@type': 'ImageObject', url: 'https://cooldrivepro.com/logo.png' } },
    },
    {
      '@type': 'ImageGallery',
      name: 'CoolDrivePro production photos',
      image: FACTORY_IMAGES.map(url => ({ '@type': 'ImageObject', contentUrl: url })),
    },
  ],
  '/about/certifications': [{
    '@type': 'AboutPage',
    name: 'CoolDrivePro Certifications & Quality',
    url: 'https://cooldrivepro.com/about/certifications/',
    description: 'ISO 9001:2015, CNAS-accredited lab, registered trademark and granted design patent backing every CoolDrivePro 12V/24V parking air conditioner.',
    inLanguage: 'en',
    mainEntity: {
      '@type': 'Organization',
      name: 'CoolDrivePro',
      url: 'https://cooldrivepro.com',
      logo: 'https://cooldrivepro.com/logo.png',
      sameAs: ORG_SAME_AS,
      address: { '@type': 'PostalAddress', addressCountry: 'CN', addressRegion: 'Shandong', addressLocality: 'Qingdao' },
      hasCredential: [
        { '@type': 'EducationalOccupationalCredential', name: 'ISO 9001:2015 Quality Management System', credentialCategory: 'certification' },
        { '@type': 'EducationalOccupationalCredential', name: 'CNAS-accredited Laboratory Recognition', credentialCategory: 'certification' },
        { '@type': 'EducationalOccupationalCredential', name: 'Registered Trademark CNIPA No. 79981727', credentialCategory: 'trademark' },
        { '@type': 'EducationalOccupationalCredential', name: 'Granted Design Patent CNIPA No. ZL 2024 3 0471098.3', credentialCategory: 'patent' },
      ],
    },
  }],
  '/about/exhibitions': [
    {
      '@type': 'AboutPage',
      name: 'CoolDrivePro Trade Shows & Global Presence',
      url: 'https://cooldrivepro.com/about/exhibitions/',
      description: 'Meet CoolDrivePro at international commercial-vehicle, RV and aftermarket trade shows across North America, Europe, ANZ and the Middle East.',
      inLanguage: 'en',
      mainEntity: {
        '@type': 'Organization',
        name: 'CoolDrivePro',
        url: 'https://cooldrivepro.com',
        logo: 'https://cooldrivepro.com/logo.png',
        sameAs: ORG_SAME_AS,
        areaServed: ORG_AREA_SERVED,
        image: EXHIBITION_IMAGES,
      },
    },
    {
      '@type': 'ImageGallery',
      name: 'CoolDrivePro trade-show booth photos',
      description: 'Unedited photos of CoolDrivePro 12V/24V parking AC units, booth and team at international trade shows.',
      image: EXHIBITION_IMAGES.map(url => ({ '@type': 'ImageObject', contentUrl: url })),
    },
  ],
};

function generateStaticPage(p, lang) {
  const meta = metaFor(p, lang);
  if (!meta) return false;
  const pageLangs = meta.langs || LANGS;
  if (!pageLangs.includes(lang)) return false;
  const canonical = localizedUrl(lang, p);
  const isHome = p === '/';
  const pageProduct = !isHome && p !== '/products' ? productSchema(p) : null;
  const pageImage = Array.isArray(pageProduct?.image)
    ? pageProduct.image[0]
    : pageProduct?.image
      || (p === '/apu' || p.startsWith('/apu/') ? `${DOMAIN}/images/products/vs02pro-top-mounted.webp` : undefined);
  const crumbs = isHome
    ? [{ name: 'Home', url: localizedUrl(lang, '/') }]
    : [{ name: 'Home', url: localizedUrl(lang, '/') }, { name: meta.title.split('|')[0].trim(), url: canonical }];
  const graph = [breadcrumb(crumbs)];
  if (isHome) {
    graph.push(HOME_ITEMLIST, HOME_FAQ);
  } else if (p === '/products') {
    graph.push(HOME_ITEMLIST);
  } else if (pageProduct) {
    graph.push(pageProduct);
  }
  const extraNodes = STATIC_PAGE_EXTRA_GRAPH[p];
  if (extraNodes && lang === DEFAULT_LANG) {
    for (const node of extraNodes) graph.push(node);
  }
  const jsonLd = { '@context': 'https://schema.org', '@graph': graph };
  const headExtra = buildHead({
    canonical,
    title: meta.title,
    desc: meta.desc,
    ogImage: pageImage,
    pathWithoutLocale: p,
    jsonLd,
    preloadImage: pageImage,
    langs: pageLangs,
  });
  const body = isHome ? renderHomeBody(meta, lang) : renderStaticBody(meta, lang, p);
  const html = applyTemplate({ title: meta.title, desc: meta.desc, lang, headExtra, body, removeHomeHeroPreload: !isHome });
  if (isHome && lang === DEFAULT_LANG) {
    fs.writeFileSync(TEMPLATE_PATH, html);
  } else {
    const out = lang === DEFAULT_LANG ? p.replace(/^\//, '') : `${lang}${p === '/' ? '' : p}`;
    writePage(out, html);
  }
  return true;
}

function generateBlogPage(slug, lang) {
  const articleLangs = blogLangsForSlug(slug);
  if (!articleLangs.includes(lang)) return false;
  const article = loadArticle(slug, lang);
  if (!article) return false;
  const p = `/blog/${slug}`;
  const canonical = localizedUrl(lang, p);
  const fullTitle = `${article.title} | ${SITE_NAME}`;
  const blogPosting = {
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.metaDescription || article.title,
    datePublished: article.date,
    dateModified: article.date,
    author: { '@type': 'Organization', '@id': `${DOMAIN}/#organization`, name: SITE_NAME, url: DOMAIN },
    publisher: { '@type': 'Organization', '@id': `${DOMAIN}/#organization`, name: SITE_NAME, url: DOMAIN, logo: { '@type': 'ImageObject', '@id': `${DOMAIN}/#logo`, url: `${DOMAIN}/logo.png` } },
    mainEntityOfPage: canonical,
    inLanguage: lang,
  };
  if (article.image) {
    blogPosting.image = {
      '@type': 'ImageObject',
      url: article.image,
      width: article.imageWidth || 1280,
      height: article.imageHeight || 720,
      caption: article.imageAlt || article.title,
    };
  }
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [blogPosting, breadcrumb([
      { name: 'Home', url: localizedUrl(lang, '/') },
      { name: 'Blog', url: localizedUrl(lang, '/blog') },
      { name: article.title, url: canonical },
    ])],
  };
  const faq = faqFor(article);
  if (faq) jsonLd['@graph'].push(faq);
  // SoftwareApplication schema for calculator/tool pages — makes AI engines treat them as tools
  if (/calculator|tool/i.test(slug) || article.category === 'Tools & Calculators') {
    jsonLd['@graph'].push({
      '@type': 'SoftwareApplication',
      '@id': `${canonical}#tool`,
      name: article.title,
      description: article.metaDescription || article.title,
      url: canonical,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Calculator',
      operatingSystem: 'Web',
      browserRequirements: 'Requires JavaScript-capable browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      provider: { '@type': 'Organization', '@id': `${DOMAIN}/#organization` },
      inLanguage: lang,
      isAccessibleForFree: true,
      featureList: 'Multi-variable fuel cost comparison; Idle vs APU vs DC AC TCO; Fleet ROI matrix; Diesel-price sensitivity table',
    });
  }
  const isAClass = A_CLASS_SLUGS.has(slug);
  const isWeakLangBlog = !STRONG_BLOG_LANGS.has(lang);
  // Constrain hreflang alternates to the langs we actually want indexed; weak
  // languages stay accessible to users but are not announced as alternates.
  const indexableArticleLangs = articleLangs.filter(l => STRONG_BLOG_LANGS.has(l));
  const headExtra = buildHead({
    canonical, title: fullTitle, desc: article.metaDescription || article.title,
    ogImage: article.image, pathWithoutLocale: p, jsonLd, preloadImage: article.image,
    noindex: isAClass || isWeakLangBlog,
    langs: indexableArticleLangs.length ? indexableArticleLangs : articleLangs,
  });
  const body = renderBlogBody(article, lang, slug);
  const html = applyTemplate({ title: fullTitle, desc: article.metaDescription || article.title, lang, headExtra, body, removeHomeHeroPreload: true });
  const out = lang === DEFAULT_LANG ? `blog/${slug}` : `${lang}/blog/${slug}`;
  writePage(out, html);
  return true;
}

function generateLandingPage(p) {
  const page = LANDING_PAGE_META[p];
  if (!page) return false;

  const canonical = `${DOMAIN}${p}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: page.headline,
        description: page.desc,
        url: canonical,
        image: page.image,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: DOMAIN },
        publisher: { '@type': 'Organization', '@id': `${DOMAIN}/#organization` },
      },
      breadcrumb([
        { name: 'Home', url: `${DOMAIN}/` },
        { name: 'Landing', url: canonical },
      ]),
    ],
  };
  const headExtra = buildHead({
    canonical,
    title: page.title,
    desc: page.desc,
    ogImage: page.image,
    pathWithoutLocale: p,
    jsonLd,
    preloadImage: page.image,
    langs: [DEFAULT_LANG],
  });
  const html = applyTemplate({ title: page.title, desc: page.desc, lang: DEFAULT_LANG, headExtra, body: renderLandingBody(page), removeHomeHeroPreload: true });
  writePage(p.replace(/^\//, ''), html);
  return true;
}

const STATIC_PATHS = [
  '/',
  '/products',
  '/products/top-mounted-ac',
  '/products/mini-split-ac',
  '/products/heating-cooling-ac',
  '/products/nano-max',
  '/tools/parking-ac-fitment-planner',
  '/vehicle-compatibility',
  '/vehicle-compatibility/semi-truck-parking-ac',
  '/vehicle-compatibility/rv-parking-ac',
  '/vehicle-compatibility/12v-vs-24v-parking-ac',
  '/dealer-guide/parking-ac-local-market-fitment',
  '/about',
  '/about/factory',
  '/about/certifications',
  '/about/exhibitions',
  '/contact',
  '/warranty',
  '/return-policy',
  '/shipping-policy',
  '/privacy-policy',
  '/terms-of-service',
  '/payment-method',
  '/billing-terms',
  '/blog',
  '/support',
  '/features/power',
  '/features/efficiency',
  '/features/installation',
  '/features/battery',
  '/features/durability',
  '/features/noise',
];

const COMMERCIAL_HUB_PATHS = Object.keys(COMMERCIAL_HUB_META);
const APU_PAGE_PATHS = Object.keys(APU_PAGE_META);

const stats = { static: 0, landing: 0, blog: 0, skipped: 0 };
const t0 = Date.now();

console.log('Prerendering static pages...');
for (const p of STATIC_PATHS) for (const lang of LANGS) generateStaticPage(p, lang) ? stats.static++ : stats.skipped++;
for (const p of COMMERCIAL_HUB_PATHS) generateStaticPage(p, DEFAULT_LANG) ? stats.static++ : stats.skipped++;
for (const p of APU_PAGE_PATHS) generateStaticPage(p, DEFAULT_LANG) ? stats.static++ : stats.skipped++;

console.log('Prerendering landing pages...');
for (const p of Object.keys(LANDING_PAGE_META)) generateLandingPage(p) ? stats.landing++ : stats.skipped++;

console.log('Prerendering blog pages...');
const slugs = listBlogSlugs();
for (const slug of slugs) for (const lang of LANGS) generateBlogPage(slug, lang) ? stats.blog++ : stats.skipped++;

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nPrerender complete in ${elapsed}s`);
console.log(`  Static: ${stats.static}  Landing: ${stats.landing}  Blog: ${stats.blog}  Skipped: ${stats.skipped}`);
