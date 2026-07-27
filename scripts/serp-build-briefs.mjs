#!/usr/bin/env node
// Stage 3 — generate SERP-gap content briefs for 5 cleanest clusters.
// Sources: research/<date>/clusters.json + top-pages-keywords.json + page-html-cache
import fs from "fs";
import path from "path";

const DATE = "2026-06-08";
const ROOT = path.resolve("research", DATE);
const OUT_DIR = path.resolve("briefs", DATE);
fs.mkdirSync(OUT_DIR, { recursive: true });

const clusters = JSON.parse(fs.readFileSync(path.join(ROOT, "clusters.json"), "utf8")).clusters;
const pages = JSON.parse(fs.readFileSync(path.join(ROOT, "top-pages-keywords.json"), "utf8"));

const byCid = Object.fromEntries(clusters.map(c => [c.cluster_id, c]));

function clusterPages(cid) {
  const cu = pages.cluster_urls.find(c => c.cluster_id === cid);
  if (!cu) return [];
  const idx = Object.fromEntries(pages.pages.map(p => [p.url, p]));
  return cu.urls.map(u => idx[u.url]).filter(Boolean);
}

// Build a brief from a selection config
function buildBrief({ cid, target_kw, alt_target_kw_note, template, hub_label,
  intent, word_range, sections, faq, must_have_entities, golden_gap,
  external_refs, internal_link_targets, og_hint, market = "en-US",
  banned_angles = [], ranking_difficulty_note = "" }) {
  const c = byCid[cid];
  const cps = clusterPages(cid);
  const top10_avg_wc = cps.length ? Math.round(cps.reduce((s, p) => s + (p.word_count || 0), 0) / cps.length) : 0;
  // Pull secondary kws from cluster spokes minus the target
  const secondary = (c?.spokes || []).filter(s => s !== target_kw).slice(0, 12);
  // Pull top bigrams that 6+ pages share (as "must mention" phrases)
  const phraseCount = new Map();
  for (const p of cps) {
    for (const bg of (p.top_bigrams || [])) {
      const bare = bg.replace(/\(\d+\)$/, "").trim();
      phraseCount.set(bare, (phraseCount.get(bare) || 0) + 1);
    }
  }
  const must_mention = [...phraseCount.entries()].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([p, n]) => `${p}(${n})`);

  return {
    cluster_id: cid,
    target_kw,
    alt_target_kw_note: alt_target_kw_note || null,
    secondary_kws: secondary,
    market,
    intent,
    template,
    hub: c?.hub || hub_label,
    word_count_range: word_range,
    sections,
    FAQ: faq,
    required_schemas: ["Article", "BreadcrumbList", "FAQPage"].concat(template === "alternative" || template === "comparison" ? [] : []),
    must_have_entities,
    golden_gap,
    recommended_external_refs: external_refs,
    internal_link_targets,
    ogImage_hint: og_hint,
    serp_brief_meta: {
      top10_avg_word_count: top10_avg_wc,
      top10_avg_bigrams_must_mention: must_mention,
      cluster_est_volume: c?.total_est_volume || 0,
      cluster_median_kd: c?.median_est_kd || 0,
      cluster_member_count: c?.member_count || 0,
      ranking_difficulty_note,
      generated_at: new Date().toISOString(),
    },
    banned_angles,
  };
}

const briefs = [];

// 1. B2B Parking AC Supplier landing
briefs.push(buildBrief({
  cid: "H9-c64",
  target_kw: "b2b parking ac supplier",
  template: "pillar",
  intent: "commercial",
  word_range: [2200, 2800],
  sections: [
    { h2: "TL;DR — How to choose a B2B parking AC supplier in 2026", must_cover: ["MOQ ranges", "lead time", "certifications", "private label support"] },
    { h2: "What B2B buyers actually need (vs DIY single-unit)", must_cover: ["volume pricing", "spare parts retainer", "warranty terms ≥24 months", "OEM/ODM"] },
    { h2: "9-dimension scoring rubric we use", must_cover: ["production scale", "MOQ", "certifications (CE, E-Mark, FCC)", "lead time", "after-sales coverage", "documentation depth", "factory transparency", "logistics (FOB/CIF)", "private label capability"] },
    { h2: "Top suppliers compared (10+ brands)", must_cover: ["Webasto", "Dometic", "Thermo King (TriPac)", "Eberspächer", "Kingclima", "Guchen", "Bergstrom NITE", "Indel B", "Dirna BYCOOL", "Autoclima", "CoolDrivePro"] },
    { h2: "Where each brand wins (and where it doesn't)", must_cover: ["honest weak-spot per brand", "we don't recommend X when Y"] },
    { h2: "How CoolDrivePro fits into a B2B program", must_cover: ["wholesale price tiers", "dealer onboarding", "spare-part inventory commitment", "MOQ from 5 units"] },
    { h2: "FAQ for fleet, dealer, and OEM buyers", must_cover: ["lead time", "private label OEM", "after-sales overseas", "container loading"] }
  ],
  faq: [
    "What's the minimum order quantity (MOQ) for a B2B parking AC supplier?",
    "Which certifications should I require for US/EU fleet deployment?",
    "How long does it take to source 100 units?",
    "Can I get private-label / OEM on the unit and packaging?",
    "What spare-part terms should be in a 3-year wholesale contract?"
  ],
  must_have_entities: ["MOQ", "OEM/ODM", "CE", "E-Mark", "FCC", "Webasto", "Dometic", "TriPac", "Eberspächer", "Kingclima", "Guchen", "Bergstrom NITE", "Indel B", "Dirna BYCOOL", "FOB", "CIF", "private label", "dealer program"],
  golden_gap: "No Top10 page provides a 9-dimension supplier rubric with honest weak-spots per brand, AND none publish actual MOQ/lead-time/spare-part terms — they all redirect to a contact form.",
  external_refs: [
    { label: "EPA SmartWay verified parking AC list", url: "https://www.epa.gov/smartway/smartway-verified-list-idle-reduction-technologies" },
    { label: "CARB ATCM idle regulation", url: "https://ww2.arb.ca.gov/our-work/programs/commercial-vehicle-idling" },
    { label: "DOT FMCSA HOS regulation", url: "https://www.fmcsa.dot.gov/regulations/hours-of-service" }
  ],
  internal_link_targets: [
    "/products/vth1",
    "/wholesale",
    "/about",
    "/blog/dometic-vs-webasto-parking-ac",
    "/blog/parking-ac-fuel-savings-calculator",
    "/blog/lifepo4-battery-for-parking-ac"
  ],
  og_hint: "B2B dashboard mockup with supplier scoring rubric, 1600x900 WebP, CoolDrivePro branded",
  ranking_difficulty_note: "Qingdao Donjelion has saturated 6+ US local newspapers with identical PR copy. Must be a stronger independent listicle OR pair with a parallel PR distribution.",
  banned_angles: ["Marketing fluff like 'leading supplier of high quality...'", "Self-praise without comparison data"]
}));

// 2. Parking AC OEM Buyer Guide (the mega pillar)
briefs.push(buildBrief({
  cid: "H2-c01",
  target_kw: "parking ac oem",
  template: "pillar",
  intent: "commercial",
  word_range: [3500, 4500],
  sections: [
    { h2: "TL;DR — Parking AC OEM in 6 numbers", must_cover: ["typical MOQ", "lead time range", "kWh/night power draw range", "warranty industry norm", "price band 12V vs 24V", "certification matrix"] },
    { h2: "12V vs 24V parking AC — when each one wins", must_cover: ["truck/RV/van use-case mapping", "amp draw comparison", "battery sizing per voltage"] },
    { h2: "How an OEM parking AC factory actually works", must_cover: ["compressor sourcing", "evaporator/condenser fabrication", "PCB control board", "MOQ economics", "private label tooling cost"] },
    { h2: "8 specs every B2B buyer should lock in writing", must_cover: ["cooling capacity (BTU/W)", "power consumption per hour (continuous and peak)", "noise dB", "certifications (CE, E-Mark, FCC, RoHS, REACH)", "warranty length and territory", "lead time per order tier", "spare parts SKU list", "FOB/CIF Incoterm"] },
    { h2: "Comparison matrix: 10 OEM factories", must_cover: ["China-based: Kingclima, Guchen, Sino Air, HLSK, TKT, Defu, Hisuper", "Global: Webasto, Dometic, Indel B, Dirna, Bergstrom"] },
    { h2: "Real installation use-cases (with photos)", must_cover: ["Class 8 sleeper retrofit", "RV class A rooftop", "Sprinter van conversion", "off-grid camper"] },
    { h2: "Red flags when sourcing OEM", must_cover: ["no factory audit photos", "MOQ <5 units (likely trading company)", "no CE technical file on request", "no spare-parts retainer in contract"] },
    { h2: "How CoolDrivePro structures OEM deals", must_cover: ["pricing tiers from 5/50/200/500 units", "EXW vs FOB vs CIF", "private-label branding scope"] },
    { h2: "FAQ", must_cover: ["how long can it run when parked", "12V vs 24V choice", "MOQ", "lead time", "certifications", "warranty"] }
  ],
  faq: [
    "How long can a parking air conditioner run when parked?",
    "What's the difference between 12V and 24V parking AC and which do I need?",
    "What's the minimum order quantity for an OEM parking AC supplier?",
    "Which certifications do I need for US/EU export?",
    "What's a normal lead time for 100+ units?",
    "How many kWh does a parking AC draw per night?"
  ],
  must_have_entities: ["12V", "24V", "BTU", "MOQ", "compressor", "evaporator", "condenser", "CE", "E-Mark", "FCC", "RoHS", "FOB", "CIF", "EXW", "private label", "OEM", "ODM", "LiFePO4", "lead time"],
  golden_gap: "No Top10 page publishes an 8-spec lock-in checklist + a 10-factory comparison matrix + transparent MOQ/lead-time/warranty bands. Everything is either 1-factory product page or generic content marketing.",
  external_refs: [
    { label: "UNECE ECE R10 (E-Mark for parking AC)", url: "https://unece.org/transport/vehicle-regulations" },
    { label: "EPA SmartWay verified list", url: "https://www.epa.gov/smartway/smartway-verified-list-idle-reduction-technologies" }
  ],
  internal_link_targets: [
    "/products/vth1",
    "/products/nano-max",
    "/wholesale",
    "/blog/lifepo4-battery-for-parking-ac",
    "/blog/parking-ac-installation-cost-2026",
    "/blog/parking-ac-fuel-savings-calculator",
    "/blog/dometic-vs-webasto-parking-ac"
  ],
  og_hint: "Hero showing factory production line + OEM stamp + 12V/24V badges, 1600x900 WebP, CoolDrivePro branded",
  ranking_difficulty_note: "67 spokes collapsed into one cluster because SERP overlap is heavy (Amazon + manufacturers). Don't split into 67 articles — one strong pillar + 5-6 differentiated spokes.",
  banned_angles: ["67 thin pages, one per spoke kw", "Generic 'why our factory is the best' copy"]
}));

// 3. APU vs Battery Parking AC vs Diesel APU
briefs.push(buildBrief({
  cid: "H6-c04",
  target_kw: "battery parking ac vs electric apu vs diesel apu",
  alt_target_kw_note: "Hub kw in cluster is 'apu vs battery ac' but for ranking we target the 3-way comparison form which matches Heatso/TTNews title patterns.",
  template: "comparison",
  intent: "commercial",
  word_range: [2500, 3200],
  sections: [
    { h2: "TL;DR — Which one wins for your truck (2-min answer)", must_cover: ["decision matrix by use-case", "long-haul vs regional", "owner-op vs fleet"] },
    { h2: "How we'll compare them (the 8 metrics)", must_cover: ["upfront cost", "fuel/energy cost per night", "weight impact on payload", "noise dB at sleeper", "installation time and cost", "maintenance hours/year", "anti-idling compliance", "warranty"] },
    { h2: "Diesel APU — when it still wins", must_cover: ["TriPac", "Thermo King", "Carrier ComfortPro", "duty cycle realism", "DEF/fuel/oil OPEX", "DPF complaints"] },
    { h2: "Electric APU — the cleaner middle ground", must_cover: ["Idle Free EPC", "Bergstrom NITE", "Dynasys", "battery pack sizing", "shore power compatibility"] },
    { h2: "Battery Parking AC (the new contender) — when it actually wins", must_cover: ["weight savings 80–150 lb vs APU", "noise <50 dB", "$3-5k installed vs $10-12k APU", "LiFePO4 200Ah typical", "12V/24V"] },
    { h2: "Cost-of-ownership over 5 years (real numbers)", must_cover: ["fuel @ $4/gal", "EPA SmartWay anti-idle savings", "payback months by route type", "resale value"] },
    { h2: "We don't recommend X when Y (honest paragraph)", must_cover: ["don't pick battery AC for >12h cooling without shore power", "don't pick diesel APU for CARB states without verified list"] },
    { h2: "FAQ", must_cover: ["how many hours can battery parking AC run", "is electric APU SmartWay verified", "DOT compliant"] }
  ],
  faq: [
    "Is a battery parking AC cheaper than a diesel APU?",
    "How long can a battery parking AC run on one full charge?",
    "Is an electric APU SmartWay verified?",
    "Does a parking AC count for anti-idling compliance?",
    "What's the payback period for replacing a diesel APU with a battery parking AC?"
  ],
  must_have_entities: ["TriPac", "Thermo King", "Carrier ComfortPro", "Bergstrom NITE", "Idle Free EPC", "Dynasys", "LiFePO4", "200Ah", "CARB", "SmartWay", "APU", "EPC", "12V", "24V", "EPA"],
  golden_gap: "Top10 forums and Heatso/TTNews articles cover diesel-vs-electric APU well, but none publish a 5-year TCO with battery parking AC as the third option. We own that gap.",
  external_refs: [
    { label: "EPA SmartWay verified APU list", url: "https://www.epa.gov/smartway/smartway-verified-list-idle-reduction-technologies" },
    { label: "CARB ATCM commercial-vehicle idling rule", url: "https://ww2.arb.ca.gov/our-work/programs/commercial-vehicle-idling" },
    { label: "FMCSA HOS sleeper berth provision", url: "https://www.fmcsa.dot.gov/regulations/hours-of-service" }
  ],
  internal_link_targets: [
    "/products/vth1",
    "/blog/parking-ac-fuel-savings-calculator",
    "/blog/lifepo4-battery-for-parking-ac",
    "/blog/no-idle-truck-ac",
    "/blog/parking-ac-installation-cost-2026"
  ],
  og_hint: "3-way comparison hero with battery / electric APU / diesel APU icons + payback chart, 1600x900 WebP",
  ranking_difficulty_note: "Heatso and ElectricAPU.com are direct commercial competitors. Differentiation = 5-year TCO with real CARB/SmartWay data, not generic 'depends on use' fence-sitting.",
  banned_angles: ["'It depends, talk to your dealer' non-answers", "Fence-sitting without numbers"]
}));

// 4. State-by-state anti-idle laws + ROI calc
briefs.push(buildBrief({
  cid: "H5-c17",
  target_kw: "state by state anti-idling laws 2026",
  alt_target_kw_note: "Cluster hub 'no idle ordinance' is the strict head term but the 'state by state' modifier matches the cnsprotects/onestl/wikipedia title pattern that ranks.",
  template: "pillar",
  intent: "informational",
  word_range: [2800, 3600],
  sections: [
    { h2: "TL;DR — The strictest 10 states and what they fine", must_cover: ["fine ranges $50-$25,000", "5-minute vs 15-minute limits", "DEF/sleeper exemptions"] },
    { h2: "How anti-idling laws got here (1 paragraph history)", must_cover: ["CAA 1990", "EPA SmartWay 2004", "CARB ATCM 2008"] },
    { h2: "The 50-state lookup table", must_cover: ["state name", "law citation", "idle-time limit", "fine range", "sleeper exemption Y/N", "APU exemption Y/N", "battery parking AC compliance Y/N"] },
    { h2: "Federal layer: EPA SmartWay + FMCSA HOS interaction", must_cover: ["SmartWay verified list", "FMCSA sleeper berth provision impact on cooling"] },
    { h2: "ROI calculator: idle cost vs parking AC (interactive)", must_cover: ["inputs: hours idle/night, fuel price, days/year", "output: fuel cost/yr, fine risk, payback months"] },
    { h2: "Compliance paths ranked by total cost", must_cover: ["do nothing (fines + fuel)", "diesel APU", "electric APU", "battery parking AC"] },
    { h2: "Driver and dispatcher checklist (printable)", must_cover: ["how to log compliance", "what proof to keep in cab"] },
    { h2: "FAQ", must_cover: ["which states have 5-min limits", "DEF freezing exemption", "parking AC vs APU compliance"] }
  ],
  faq: [
    "Which US states have the strictest anti-idling laws in 2026?",
    "Does a parking AC count as compliant for anti-idling rules?",
    "Is there a federal anti-idling law for trucks?",
    "What's the average fuel cost of idling a Class 8 truck for 10 hours?",
    "How much can a fleet save per truck per year with a parking AC?"
  ],
  must_have_entities: ["CARB", "EPA SmartWay", "FMCSA", "HOS", "ATCM", "CAA 1990", "DEF exemption", "sleeper berth", "5 minute idle limit", "15 minute idle limit"],
  golden_gap: "Wikipedia, cnsprotects, onestl all describe the laws but NONE publish a working ROI calculator that maps state law to dollar fines/savings. We add the calculator + 50-state table + parking-AC compliance column.",
  external_refs: [
    { label: "EPA Compilation of State Idling Regulations (PDF)", url: "https://www.epa.gov/sites/default/files/documents/CompilationofStateIdlingRegulations.pdf" },
    { label: "ATRI idling cost data", url: "https://truckingresearch.org/" },
    { label: "FMCSA HOS rules", url: "https://www.fmcsa.dot.gov/regulations/hours-of-service" },
    { label: "CARB heavy-duty idle rule", url: "https://ww2.arb.ca.gov/our-work/programs/commercial-vehicle-idling" }
  ],
  internal_link_targets: [
    "/products/vth1",
    "/blog/no-idle-ac-anti-idling-laws",
    "/blog/parking-ac-fuel-savings-calculator",
    "/blog/no-idle-truck-ac",
    "/blog/dometic-vs-webasto-parking-ac"
  ],
  og_hint: "US map with states color-coded by idle-law strictness + dollar-sign overlay, 1600x900 WebP",
  ranking_difficulty_note: "Wikipedia rank #3 is hard to displace for the head term. Beat them with the calculator UX + 50-state table that's actually maintained for 2026.",
  banned_angles: ["Pure law summary without dollar numbers", "Generic 'idle reduction is good' essay"]
}));

// 5. TriPac alternative (safer than webasto alternative due to no semantic ambiguity)
briefs.push(buildBrief({
  cid: "H6-c27",
  target_kw: "tripac alternative",
  template: "alternative",
  intent: "comparison",
  word_range: [2200, 2800],
  sections: [
    { h2: "TL;DR — 5 TriPac alternatives ranked for 2026", must_cover: ["per-alternative one-liner verdict", "best for owner-op vs fleet vs CARB state"] },
    { h2: "Why drivers look for a TriPac alternative", must_cover: ["price $10-12k", "DPF reliability complaints", "fuel + DEF OPEX", "noise"] },
    { h2: "What 'good alternative' actually means (5 criteria)", must_cover: ["lower TCO over 5 years", "CARB / SmartWay compliant", "weight ≤TriPac", "noise ≤TriPac", "warranty ≥2 years"] },
    { h2: "Alternative 1 — Bergstrom NITE (electric APU)", must_cover: ["price", "battery capacity", "shore-power compatibility", "weak spots"] },
    { h2: "Alternative 2 — Idle Free EPC", must_cover: ["price", "runtime", "compatibility with day cabs"] },
    { h2: "Alternative 3 — Dynasys diesel APU (TriPac competitor)", must_cover: ["price", "fuel economy", "DPF approach"] },
    { h2: "Alternative 4 — Battery parking AC (CoolDrivePro VTH1, Kingclima, Guchen)", must_cover: ["price $3-5k installed", "LiFePO4 200Ah", "12V/24V", "noise <50 dB", "weight savings"] },
    { h2: "Alternative 5 — Shore power + electric heater + portable AC (the budget hack)", must_cover: ["price ~$1k", "fleet yard scenario", "why it doesn't work over-the-road"] },
    { h2: "5-year TCO comparison table", must_cover: ["upfront", "fuel/energy", "maintenance", "fines avoided", "resale"] },
    { h2: "Which alternative wins for which driver profile", must_cover: ["long-haul owner-op", "regional fleet ≥10 trucks", "CARB-state driver"] },
    { h2: "FAQ", must_cover: ["is battery parking AC really 1/3 the cost of TriPac", "is electric APU SmartWay verified", "warranty comparison"] }
  ],
  faq: [
    "What's the best alternative to a Thermo King TriPac in 2026?",
    "Is a battery parking AC really cheaper than a TriPac?",
    "Are electric APUs CARB compliant like TriPac?",
    "How much weight does an alternative save vs a TriPac?",
    "What's the warranty difference between TriPac and battery parking AC?"
  ],
  must_have_entities: ["Thermo King", "TriPac", "Carrier ComfortPro", "Bergstrom NITE", "Idle Free EPC", "Dynasys", "CoolDrivePro VTH1", "Kingclima", "Guchen", "LiFePO4", "CARB", "SmartWay", "EPA", "shore power"],
  golden_gap: "Top10 are dominated by truck forums and Heatso — none publish a 5-criterion alternative rubric with 5-year TCO and 'which alternative wins for which driver profile' decision tree.",
  external_refs: [
    { label: "EPA SmartWay verified APU list", url: "https://www.epa.gov/smartway/smartway-verified-list-idle-reduction-technologies" },
    { label: "CARB ATCM idling rule", url: "https://ww2.arb.ca.gov/our-work/programs/commercial-vehicle-idling" },
    { label: "Thermo King TriPac product page (reference)", url: "https://www.thermoking.com/na/en/truck/products/idle-reduction-solutions/tripac-evolution.html" }
  ],
  internal_link_targets: [
    "/products/vth1",
    "/blog/dometic-vs-webasto-parking-ac",
    "/blog/parking-ac-fuel-savings-calculator",
    "/blog/no-idle-truck-ac",
    "/blog/lifepo4-battery-for-parking-ac"
  ],
  og_hint: "TriPac side-by-side with 5 alternatives + check/x grid + dollar-sign overlay, 1600x900 WebP",
  ranking_difficulty_note: "tripac alternative est_vol 2200, KD 44. Doable with strong TCO table and aggressive internal linking from existing /blog/no-idle-truck-ac (already ranking).",
  banned_angles: ["Bashing TriPac without data", "Lukewarm 'depends' framing"]
}));

// Write each brief
for (const b of briefs) {
  const fp = path.join(OUT_DIR, `brief-${b.cluster_id}.json`);
  fs.writeFileSync(fp, JSON.stringify(b, null, 2));
  console.log(`✅ ${fp}`);
}

// Summary
const summary = {
  run_at: new Date().toISOString(),
  date: DATE,
  briefs: briefs.map(b => ({
    cluster_id: b.cluster_id, target_kw: b.target_kw, template: b.template,
    word_range: b.word_count_range, internal_links: b.internal_link_targets.length,
    must_have_entities: b.must_have_entities.length,
    cluster_est_volume: b.serp_brief_meta.cluster_est_volume,
    cluster_median_kd: b.serp_brief_meta.cluster_median_kd,
  })),
};
fs.writeFileSync(path.join(OUT_DIR, "_index.json"), JSON.stringify(summary, null, 2));
console.log(`\n✅ summary: ${path.join(OUT_DIR, "_index.json")}`);

// Lane contract
console.log("\n=== LANE OUTPUT CONTRACT ===");
console.log("LANE: brief");
console.log("STATUS: pass");
console.log(`ARTIFACTS:\n- briefs/${DATE}/brief-*.json (5)\n- briefs/${DATE}/_index.json`);
console.log("NEXT: invoke `cooldrivepro-seo write` (Stage 4) for the brief with highest cluster_est_volume / KD.");
