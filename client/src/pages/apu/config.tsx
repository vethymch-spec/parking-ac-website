/**
 * APU pages — config-driven content for all draft sub-pages.
 * Edit copy here; the renderer (ApuPage.tsx) consumes this map.
 */
import type {
  HeroBlock, PainBlock, HowWorksBlock, ModuleGridBlock, SolutionMatrixBlock,
  TwoColBlock, TechCenterBlock, CaseBlock, CompareBlock, SpecTableBlock,
  ResourceBlock, FAQBlock, CtaFormBlock, PlaceholderBlock, PageNavBlock, SectionShell,
} from "./sections";

export type Block =
  | ({ kind: "hero" } & HeroBlock)
  | ({ kind: "painWall" } & PainBlock)
  | ({ kind: "diagram" } & SectionShell & { caption?: string })
  | ({ kind: "howWorks" } & HowWorksBlock)
  | ({ kind: "moduleGrid" } & ModuleGridBlock)
  | ({ kind: "solutionMatrix" } & SolutionMatrixBlock)
  | ({ kind: "twoCol" } & TwoColBlock)
  | ({ kind: "techCenter" } & TechCenterBlock)
  | ({ kind: "cases" } & CaseBlock)
  | ({ kind: "compareTable" } & CompareBlock)
  | ({ kind: "specTable" } & SpecTableBlock)
  | ({ kind: "resourceHub" } & ResourceBlock)
  | ({ kind: "faq" } & FAQBlock)
  | ({ kind: "ctaForm" } & CtaFormBlock)
  | ({ kind: "placeholder" } & PlaceholderBlock)
  | ({ kind: "pageNav" } & PageNavBlock);

export interface ApuPageConfig {
  slug: string;            // empty string = /apu/
  path: string;            // canonical path with trailing slash
  title: string;           // <title>
  description: string;     // meta description
  breadcrumb: string;      // breadcrumb leaf label
  blocks: Block[];
}

// ─────────────────────────────────────────────────────────────
// Reusable navigation row across all APU pages
// ─────────────────────────────────────────────────────────────
const PAGE_NAV: PageNavBlock = {
  items: [
    { label: "APU Hub", href: "/apu/" },
    { label: "What is a Truck APU?", href: "/apu/what-is-a-truck-apu/" },
    { label: "How It Works", href: "/apu/how-it-works/" },
    { label: "Electric APU", href: "/apu/electric/" },
    { label: "Diesel APU", href: "/apu/diesel/" },
    { label: "Hybrid APU", href: "/apu/hybrid/" },
    { label: "APU Builder", href: "/apu/builder/" },
    { label: "ROI Calculator", href: "/apu/roi-calculator/" },
    { label: "Compliance Map", href: "/apu/compliance/" },
    { label: "Compare vs TriPac", href: "/apu/compare/" },
    { label: "Case Studies", href: "/apu/case-studies/" },
    { label: "R&D", href: "/apu/r-and-d/" },
    { label: "Install", href: "/apu/install/" },
    { label: "FAQ", href: "/apu/faq/" },
  ],
};

// ─────────────────────────────────────────────────────────────
// Reusable module list — APU components
// ─────────────────────────────────────────────────────────────
const APU_MODULES: ModuleGridBlock["items"] = [
  { name: "Parking AC", role: "HVAC", spec: "12V/24V DC rooftop or split, 7,500–12,000 BTU, 32 dB indoor.", href: "/products/" },
  { name: "APU Battery Pack", role: "Storage", spec: "LiFePO4 12V/24V, 200–600 Ah, BMS-protected, deep-cycle." },
  { name: "Parking Generator", role: "Backup", spec: "Diesel/gasoline 2–5 kW silent generator for extended runtime." },
  { name: "Pure Sine Inverter", role: "AC out", spec: "1000–3000 W 110V/220V for cabin appliances." },
  { name: "Smart Charger", role: "Charging", spec: "DC-DC + shore power charger, BMS-aware, multi-stage." },
  { name: "Wiring Harness", role: "Cabling", spec: "Pre-terminated, color-coded, MIL-spec lugs and seals." },
  { name: "Fuse / Breaker / Controller", role: "Protection", spec: "Per-circuit fusing, master cutoff, remote control logic." },
  { name: "Mounting Kit", role: "Install", spec: "Roof rails, battery tray, anti-vibration pads, sealing gasket." },
];

// ─────────────────────────────────────────────────────────────
// Reusable CTA form
// ─────────────────────────────────────────────────────────────
const CTA_FORM = {
  kind: "ctaForm" as const,
  title: "Get a custom APU system recommendation",
  note: "Tell us the truck, the parking pattern, and the loads. We reply with a wiring diagram, BOM, and a runtime estimate — not just a product link.",
} satisfies Block;

// ─────────────────────────────────────────────────────────────
// PAGE 1 — Hub
// ─────────────────────────────────────────────────────────────
const HUB: ApuPageConfig = {
  slug: "",
  path: "/apu/",
  title: "Modular Truck APU System for No-Idle Cooling, Cabin Power and Backup Energy | CoolDrivePro",
  description: "CoolDrivePro builds a modular truck APU — one integrated stack of parking AC, LiFePO4 battery, inverter and parking generator for no-idle cooling, cabin power and backup energy on semi sleeper cabs and heavy-duty trucks.",
  breadcrumb: "APU Solutions",
  blocks: [
    {
      kind: "hero",
      eyebrow: "Modular Parking APU System",
      title: "Modular Truck APU System for No-Idle Cooling, Cabin Power and Backup Energy.",
      subtitle: "Your truck engine should not run all night just to keep the cab livable. CoolDrivePro combines parking AC, LiFePO4 battery, inverter, and parking generator into one integrated APU — sized for the way you actually park.",
      diagram: true,
      stats: [
        { label: "No-idle runtime", value: "8–10h" },
        { label: "Fuel saved / yr", value: "1,800gal" },
        { label: "Modules", value: "8" },
      ],
      primaryCta: { label: "Build my APU", href: "/apu/builder/" },
      secondaryCta: { label: "See how it works", href: "/apu/how-it-works/" },
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "painWall",
      eyebrow: "Why this exists",
      title: "Idling is the most expensive habit on the road.",
      intro: "Every long-haul truck idles 1,800–2,400 hours a year. That's the pain a real APU solves — and where a parking AC alone isn't enough.",
      items: [
        { title: "$1,800/yr fuel waste", body: "A modern Class 8 burns ~0.8 gal/h at idle. CoolDrivePro APU cuts most of that to zero." },
        { title: "$300+ per anti-idle fine", body: "30+ US states regulate idling. APUs are the compliant path to sleeper-cab comfort." },
        { title: "Tired nights, bad sleep", body: "Heat, noise, vibration — nobody sleeps well in a running cab. A real APU finally lets the engine shut off." },
        { title: "Premature engine wear", body: "1 idle hour ≈ 33 highway miles of wear. APU offload extends overhaul intervals." },
      ],
    },
    {
      kind: "resourceHub",
      eyebrow: "Where these numbers come from",
      title: "Idle, fuel and regulation sources we cite on this page.",
      intro: "We anchor cost, idle-hour and state-rule claims to public government and industry data so fleet buyers can verify them before signing.",
      items: [
        { title: "U.S. DOE AFDC — Idle Reduction for Heavy-Duty Vehicles", href: "https://afdc.energy.gov/conserve/idle_reduction_hdv.html", note: "Long-haul tractors idle on the order of 1,800–2,400 hours per year and burn roughly 0.6–1.0 gallons of diesel per idle hour." },
        { title: "U.S. EPA SmartWay — Idle Reduction Technologies", href: "https://www.epa.gov/smartway/smartway-technology-program-idle-reduction-technologies", note: "EPA documents APUs and other idle-reduction technologies as the compliant way to cut sleeper-cab idle fuel use and emissions." },
        { title: "U.S. DOE AFDC — State Idling Regulations", href: "https://afdc.energy.gov/conserve/idle_reduction_regulations.html", note: "Tracks the 30+ U.S. states and many local jurisdictions that restrict heavy-duty idling, the time limits and the typical penalties." },
        { title: "California ARB — Heavy-Duty Vehicle Idling ATCM", href: "https://ww2.arb.ca.gov/our-work/programs/commercial-vehicle-idling", note: "California's 5-minute idle rule and the APU certification requirements that apply to in-state sleeper-cab operation." },
        { title: "Argonne National Laboratory — Long-Haul Truck Idling Burns Fuel and Money", href: "https://www.anl.gov/article/longhaul-truck-idling-burns-fuel-and-money", note: "Federal lab analysis behind the ~$1,800/year idle fuel cost figure and the engine wear equivalence (about 1 idle hour ≈ 33 highway miles)." },
        { title: "ATRI — An Analysis of the Operational Costs of Trucking", href: "https://truckingresearch.org/atri-research/operational-costs/", note: "American Transportation Research Institute annual cost-of-trucking report used to sanity-check fuel and maintenance figures cited above." },
      ],
    },
    {
      kind: "diagram",
      eyebrow: "The CoolDrivePro System",
      title: "How the modules connect on a real truck.",
      intro: "Click any hotspot on the side view to see what the part does and where it lives.",
      caption: "Schematic — not drawn to scale. Final layout depends on cab geometry, battery box location, and generator mounting.",
    },
    {
      kind: "solutionMatrix",
      eyebrow: "Choose your configuration",
      title: "Four kits, sized by how long you park and what you need to power.",
      intro: "Start with cooling. Add storage when you want to sleep through the night. Add inverter for 110V/220V appliances. Add a generator for indefinite runtime.",
      kits: [
        { name: "Cooling APU Kit", bestFor: "Entry-level setup — no-idle cab cooling, nothing more.", modules: ["Parking AC", "Wiring + mounting"], runtime: "Engine-on / shore power", price: "$1,495", href: "/products/" },
        { name: "Battery APU Kit", bestFor: "Standard overnight setup — sleep 8 hours, engine off.", modules: ["Parking AC", "LiFePO4 battery", "Smart charger"], runtime: "8–10 h", price: "$2,795", href: "/apu/electric/", highlight: true },
        { name: "Comfort Power Kit", bestFor: "For cabins running fridge, microwave, or TV through the night.", modules: ["Parking AC", "Battery", "Pure-sine inverter", "Controller"], runtime: "6–9 h mixed load", price: "$3,495", href: "/apu/electric/" },
        { name: "Hybrid APU Kit", bestFor: "Long stops, heavy loads, extreme hot or cold climates.", modules: ["Parking AC", "Battery", "Inverter", "Parking generator"], runtime: "Unlimited", price: "$4,995", href: "/apu/hybrid/" },
      ],
    },
    {
      kind: "moduleGrid",
      eyebrow: "APU product modules",
      title: "Everything in one stack — pick what you need.",
      intro: "All modules ship pre-spec'd to work together. Buy as a kit or à la carte.",
      items: APU_MODULES,
    },
    {
      kind: "techCenter",
      eyebrow: "Technical center",
      title: "The professional layer most parking-AC sites skip.",
      intro: "Engineering depth for anyone planning a real install.",
      items: [
        { title: "Wiring diagram library", body: "Per-kit single-line and physical-layout drawings." },
        { title: "Battery runtime tables", body: "kWh available vs. ambient temperature and load profile." },
        { title: "Fuse + cable sizing guide", body: "AWG/mm² selection by run length and inrush current." },
        { title: "12V / 24V compatibility", body: "Voltage matrix across truck OEMs and aftermarket BMS." },
        { title: "Generator backup logic", body: "Auto-start thresholds, SoC bands, anti-cycling rules." },
        { title: "BMS protection", body: "Over-current, over-temperature, low-voltage cutoff." },
        { title: "Noise & vibration tests", body: "dB(A) at 1 m, cabin and bunk measurements." },
        { title: "High-temperature qualification", body: "+50 °C chamber testing for desert deployments." },
        { title: "Install position guide", body: "Roof opening ranges, battery box volume, generator clearance." },
      ],
    },
    {
      kind: "cases",
      eyebrow: "Proof",
      title: "Real trucks, real configurations, real numbers.",
      intro: "Drafts — full case library coming. Each entry follows the same evidence template.",
      cases: [
        { country: "USA · TX", vehicle: "Freightliner Cascadia 126", problem: "Anti-idling fines and overnight idle fuel cost.", config: "Battery APU Kit, 24V/200Ah, 12,000 BTU", runtime: "8.5 h avg @ 95 °F ambient", feedback: "Fines went to zero, sleeper stays cool all night.", href: "/apu/case-studies/" },
        { country: "Germany · BY", vehicle: "Mercedes Actros L GigaSpace", problem: "EU sleeper noise + diesel cost pressure.", config: "Comfort Power Kit + 230V inverter", runtime: "9 h cooling + fridge", feedback: "I sleep through the night for the first time in 12 years.", href: "/apu/case-studies/" },
      ],
    },
    {
      kind: "resourceHub",
      eyebrow: "APU resource hub",
      title: "Read deeper before you buy.",
      intro: "SEO-grade explainers that link back to product configurations.",
      items: [
        { title: "What is a truck APU?", href: "/apu/what-is-a-truck-apu/" },
        { title: "Battery APU vs diesel APU", href: "/apu/compare/" },
        { title: "Parking AC vs APU — what's the real difference?", href: "/apu/what-is-a-truck-apu/" },
        { title: "Parking generator vs battery APU", href: "/apu/hybrid/" },
        { title: "How to size an APU battery", href: "/apu/r-and-d/" },
        { title: "Truck APU wiring diagram (downloadable)", href: "/apu/r-and-d/" },
        { title: "Best APU for semi-truck sleeper cab", href: "/apu/electric/" },
        { title: "How long can a parking AC run on battery?", href: "/apu/roi-calculator/" },
      ],
    },
    {
      kind: "specTable",
      eyebrow: "Runtime guidance",
      title: "How long a modular truck APU runs on battery.",
      intro: "Reference runtime for a CoolDrivePro Battery APU Kit (24V / 200Ah LiFePO4 + 12,000 BTU parking AC). Real runtime depends on cab insulation, set-point and fan speed.",
      rows: [
        { label: "Mild night — 70 °F / 21 °C, low fan", value: "12+ h on AC mode" },
        { label: "Typical summer night — 85 °F / 30 °C, mid fan", value: "8–10 h on AC mode" },
        { label: "Hot night — 95 °F / 35 °C, mid-high fan", value: "6–8 h on AC mode" },
        { label: "Extreme heat — 110 °F / 43 °C, high fan", value: "4–6 h on AC mode" },
        { label: "Mixed cabin loads (AC + fridge + inverter)", value: "6–9 h depending on inverter draw" },
        { label: "Recharge while driving", value: "≈ 2–3 h at highway alternator output via DC-DC charger" },
        { label: "Recharge from shore power (110/220 V)", value: "≈ 4–5 h from 20% to full" },
      ],
    },
    {
      kind: "faq",
      eyebrow: "APU FAQ",
      title: "Common questions about modular truck APU systems.",
      items: [
        {
          q: "What exactly is a truck APU and how is it different from a parking AC?",
          a: "A truck APU (Auxiliary Power Unit) is the full stack that keeps a parked truck livable without idling the main engine — cooling, heating, cabin power and battery charging in one system. A parking AC is just the cooling module. CoolDrivePro\u2019s modular APU lets you start with parking AC and add battery, inverter and a parking generator as your needs grow.",
        },
        {
          q: "How long can a battery APU run the parking AC overnight?",
          a: "A typical CoolDrivePro Battery APU Kit (24V/200Ah LiFePO4 + 12,000 BTU parking AC) delivers 8\u201310 hours of overnight cooling at 90\u201395 \u00b0F ambient. Hot desert conditions, poor cab insulation or extra inverter loads (fridge, microwave) will shorten runtime; we publish a full runtime guidance table by ambient temperature, load and battery size.",
        },
        {
          q: "Battery APU, diesel APU or hybrid \u2014 which one should I choose?",
          a: "Battery APU is the cleanest, quietest option for drivers who park 8\u201310 hours and can plug in or recharge during driving. Diesel APU still wins for very long stops in extreme heat where unlimited runtime matters. Hybrid APU combines battery storage with a parking generator and is the right answer for owner-operators in hot climates or long over-the-road duty cycles.",
        },
        {
          q: "Does a CoolDrivePro APU keep me compliant with US anti-idling rules?",
          a: "Yes \u2014 anti-idling regulations in 30+ US states are written around running the main engine. A correctly sized parking AC + battery APU lets you shut the engine off and stay legal. We can ship per-state compliance notes and the APU configuration that matches your typical parking pattern.",
        },
      ],
    },
    CTA_FORM,
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 2 — What is a truck APU? (C-end SEO traffic)
// ─────────────────────────────────────────────────────────────
const WHAT_IS: ApuPageConfig = {
  slug: "what-is-a-truck-apu",
  path: "/apu/what-is-a-truck-apu/",
  title: "What Is a Truck APU? Diesel vs Battery vs Hybrid Explained | CoolDrivePro",
  description: "A truck APU (Auxiliary Power Unit) lets a parked truck cool, heat, and power its cabin without idling the main engine. Diesel APU, battery APU, hybrid APU explained.",
  breadcrumb: "What is a truck APU",
  blocks: [
    {
      kind: "hero",
      eyebrow: "APU 101",
      title: "What is a truck APU?",
      subtitle: "A truck APU (Auxiliary Power Unit) is a self-contained system that powers the cabin and HVAC while the main engine is off. It replaces idling — saving fuel, reducing emissions, and keeping the driver comfortable.",
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "techCenter",
      eyebrow: "Three types",
      title: "Diesel, battery, or hybrid — pick the right power source.",
      items: [
        { title: "Diesel APU", body: "A small diesel engine drives a generator + HVAC. Unlimited runtime, but it still burns fuel and emits. Example: Thermo King TriPac, Carrier ComfortPro." },
        { title: "Battery APU / Electric APU (eAPU)", body: "LiFePO4 battery + electric compressor parking AC + inverter. Zero emissions, silent, regulation-friendly. 8–10 h runtime per charge." },
        { title: "Hybrid APU", body: "Battery system + optional parking generator. Best when parking is long, climate is extreme, or shore power is unavailable." },
      ],
    },
    {
      kind: "compareTable",
      eyebrow: "Quick comparison",
      title: "Diesel vs Battery vs Hybrid at a glance.",
      headers: ["Dimension", "Diesel APU", "Battery APU", "Hybrid APU"],
      rows: [
        ["Fuel use", "0.18–0.25 gal/h", "Zero on-board", "Low — generator runs only when needed"],
        ["Emissions", "Reduced vs idle, still NOx", "Zero on-board", "Low — minutes/hour generator only"],
        ["Noise", "55–65 dB", "< 35 dB", "< 35 dB until generator triggers"],
        ["Runtime", "Unlimited (fuel-bound)", "8–10 h per charge", "Unlimited"],
        ["Compliance", "CARB-restricted in some states", "Allowed everywhere", "Allowed everywhere"],
        ["Maintenance", "Oil + filter every 500 h", "BMS check yearly", "Combined — generator service required"],
        ["Up-front cost", "$8–12k", "$2.5–4k", "$5–7k"],
      ],
    },
    {
      kind: "twoCol",
      eyebrow: "Parking AC vs APU",
      title: "A parking AC alone is not an APU.",
      left: {
        tag: "Parking AC alone",
        title: "Cools the cabin — but where does the power come from?",
        bullets: [
          "Needs an external source: starter battery, aux battery, shore power.",
          "Runtime depends entirely on the storage you pair it with.",
          "Risk of draining the start battery if undersized.",
          "Best entry point — but not the full no-idle system.",
        ],
      },
      right: {
        tag: "Full APU",
        title: "Cooling + storage + (optional) backup, integrated.",
        bullets: [
          "Battery sized for the parking duration.",
          "Inverter for AC appliances (microwave, fridge, TV).",
          "Charging logic: alternator while driving, shore at the stop.",
          "Generator backup for unlimited runtime.",
        ],
      },
    },
    { ...CTA_FORM, title: "Not sure which APU fits your truck?" },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 3 — How it works
// ─────────────────────────────────────────────────────────────
const HOW_IT_WORKS: ApuPageConfig = {
  slug: "how-it-works",
  path: "/apu/how-it-works/",
  title: "How a CoolDrivePro APU System Works — Wiring, Charging, Backup | CoolDrivePro",
  description: "Visual walk-through of the CoolDrivePro modular APU: parking AC on the roof, battery in the toolbox, inverter and generator on the chassis. See power flow while driving, parking, and on backup.",
  breadcrumb: "How it works",
  blocks: [
    {
      kind: "hero",
      eyebrow: "System walk-through",
      title: "How the CoolDrivePro APU system works.",
      subtitle: "Three phases — Driving, Parking, Backup — and where every electron flows in between.",
      diagram: true,
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "diagram",
      eyebrow: "Side view",
      title: "Where each module lives on the truck.",
      intro: "Generator on the chassis. Battery in the toolbox. Parking AC on the roof (or split). Inverter + controller next to the battery. Control panel in the cab.",
    },
    {
      kind: "howWorks",
      eyebrow: "Power flow",
      title: "Three phases of the APU lifecycle.",
      steps: [
        { tag: "Phase 1 · Driving", title: "Alternator charges the APU battery.", body: "While the main engine runs, the alternator (via a DC-DC charger) refills the APU battery in parallel with the starter battery — without affecting cranking reserve." },
        { tag: "Phase 2 · Parking", title: "Battery powers the AC and cabin loads.", body: "Engine off. The battery feeds the DC parking AC directly, and the inverter supplies 110V/220V to cabin appliances. BMS protects against over-discharge." },
        { tag: "Phase 3 · Backup", title: "Generator or shore power extends runtime.", body: "If SoC drops below a threshold (typically 30%), the parking generator auto-starts to top up the battery — or, at a truck stop, shore power takes over." },
      ],
    },
    {
      kind: "specTable",
      eyebrow: "Reference specs",
      title: "Typical Battery APU Kit configuration.",
      rows: [
        { label: "Parking AC", value: "12V or 24V DC, 12,000 BTU, 32 dB indoor" },
        { label: "Battery pack", value: "LiFePO4, 24V × 200 Ah (4.8 kWh)" },
        { label: "Inverter", value: "2000 W pure sine, 110V or 220V" },
        { label: "DC-DC charger", value: "40 A, BMS-aware multi-stage" },
        { label: "Shore-power input", value: "110/220V auto-detect" },
        { label: "Master fuse", value: "200 A class-T" },
        { label: "Avg parking runtime", value: "8.5 h @ 30 °C / 50% load" },
        { label: "Weight added to truck", value: "~ 95 kg" },
      ],
    },
    {
      kind: "techCenter",
      eyebrow: "Engineering depth",
      title: "The decisions behind a real APU install.",
      items: [
        { title: "DC-DC vs direct alternator tap", body: "Why we recommend isolated DC-DC chargers over direct paralleling." },
        { title: "Cable sizing & voltage drop", body: "Minimum AWG per run length to stay under 3% drop." },
        { title: "Fuse coordination", body: "Per-circuit fusing strategy and master cutoff placement." },
        { title: "Charge controller logic", body: "SoC bands, generator auto-start, anti-cycling guards." },
        { title: "Thermal management", body: "Battery box ventilation, derating curves, heater pad sizing." },
        { title: "EMI/RFI hygiene", body: "Inverter placement to avoid cab radio interference." },
      ],
    },
    { ...CTA_FORM },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 4 — Electric APU
// ─────────────────────────────────────────────────────────────
const ELECTRIC: ApuPageConfig = {
  slug: "electric",
  path: "/apu/electric/",
  title: "Electric APU (Battery APU) for Trucks — Zero-Idle, Zero-Emission | CoolDrivePro",
  description: "All-electric APU: LiFePO4 battery + DC parking AC + pure-sine inverter. 8–10 h runtime, zero emissions, silent, compliant in all 50 states.",
  breadcrumb: "Electric APU",
  blocks: [
    {
      kind: "hero",
      eyebrow: "Battery APU · eAPU",
      title: "Sleep 8–10 hours, engine off, zero emissions.",
      subtitle: "Our most popular configuration. LiFePO4 storage, electric-compressor parking AC, pure-sine inverter, smart charger. Compliant in every anti-idling state.",
      stats: [
        { label: "Runtime", value: "8–10h" },
        { label: "Emissions", value: "Zero" },
        { label: "Noise", value: "< 35 dB" },
      ],
      primaryCta: { label: "Build my electric APU", href: "/apu/builder/" },
      secondaryCta: { label: "See full BOM", href: "/apu/how-it-works/" },
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "specTable",
      eyebrow: "What's included",
      title: "BOM — Electric APU Kit (24V example).",
      rows: [
        { label: "Parking AC", value: "VS02 PRO 24V top-mount, 12,000 BTU" },
        { label: "Battery pack", value: "LiFePO4 24V × 200 Ah (4.8 kWh)" },
        { label: "Inverter", value: "2000 W pure sine 110V or 220V" },
        { label: "DC-DC charger", value: "40 A multi-stage" },
        { label: "BMS", value: "Bluetooth, low-temp cutoff" },
        { label: "Wiring harness", value: "Pre-terminated, color-coded" },
        { label: "Mounting kit", value: "Roof rails + battery tray + sealing gasket" },
        { label: "Documentation", value: "Wiring diagram PDF + install manual" },
      ],
    },
    {
      kind: "techCenter",
      eyebrow: "Why electric",
      title: "What you get from going battery-only.",
      items: [
        { title: "Anti-idling compliant", body: "Approved in all states with idling restrictions." },
        { title: "True silent operation", body: "No combustion. Cab noise floor below ambient." },
        { title: "Zero exhaust in sleeper", body: "No CO/NOx exposure during rest." },
        { title: "Lower TCO", body: "No oil changes, no fuel filters, no carbon fouling." },
        { title: "Standardized stack", body: "Documented configurations, repeatable installs, predictable spares." },
        { title: "Modular upgrades", body: "Add inverter or generator later without re-wiring." },
      ],
    },
    { ...CTA_FORM },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 5 — Diesel APU (positioned as TriPac alternative)
// ─────────────────────────────────────────────────────────────
const DIESEL: ApuPageConfig = {
  slug: "diesel",
  path: "/apu/diesel/",
  title: "Diesel APU Alternative — Lower-Cost Replacement for TriPac & ComfortPro | CoolDrivePro",
  description: "CoolDrivePro diesel APU configuration — parking generator + DC parking AC. Lower up-front cost than Thermo King TriPac or Carrier ComfortPro, modular upgrades.",
  breadcrumb: "Diesel APU",
  blocks: [
    {
      kind: "hero",
      eyebrow: "Diesel APU configuration",
      title: "The classic diesel APU — without the price tag.",
      subtitle: "When you want unlimited runtime and don't have shore power, our diesel APU configuration pairs a parking generator with our DC parking AC at a fraction of the cost of a fixed-housing OEM APU.",
      stats: [
        { label: "Runtime", value: "Unlimited" },
        { label: "Fuel use", value: "0.18–0.22 gal/h" },
        { label: "vs TriPac", value: "−40%" },
      ],
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "compareTable",
      eyebrow: "Diesel APU comparison",
      title: "CoolDrivePro vs incumbent diesel APUs.",
      headers: ["Dimension", "Thermo King TriPac", "Carrier ComfortPro", "CoolDrivePro Diesel"],
      rows: [
        ["Up-front cost", "$10–12k", "$9–11k", "$5–7k"],
        ["HVAC", "Integrated", "Integrated", "Modular — pick your AC"],
        ["Fuel use", "0.20–0.25 gal/h", "0.18–0.22 gal/h", "0.18–0.22 gal/h"],
        ["Maintenance", "OEM-only parts", "OEM-only parts", "Standard generator service"],
        ["Upgrade to battery", "Replace unit", "Replace unit", "Add battery module"],
        ["Warranty", "2 yr", "2 yr", "2 yr + extended"],
      ],
    },
    {
      kind: "twoCol",
      eyebrow: "When diesel still wins",
      title: "Pick diesel when battery-only doesn't fit.",
      left: {
        tag: "Diesel APU is right when",
        title: "Long stops, no shore power, extreme climates.",
        bullets: [
          "Driver parks 12–24 h between charges.",
          "No reliable shore power at typical stops.",
          "Desert / extreme cold ambient that drains batteries fast.",
          "Refrigerated trailer cabs needing constant high-output cooling.",
        ],
      },
      right: {
        tag: "Battery APU is better when",
        title: "8–10 h overnight, anti-idle states, modern sleeper-cab.",
        bullets: [
          "Standard 8–10 h sleeper-cab rest cycle.",
          "Routes through CARB / EPA SmartWay states.",
          "Lower total cost of ownership and easier maintenance.",
          "Shore-power-equipped truck stops in operating area.",
        ],
      },
    },
    { ...CTA_FORM },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 6 — Hybrid APU
// ─────────────────────────────────────────────────────────────
const HYBRID: ApuPageConfig = {
  slug: "hybrid",
  path: "/apu/hybrid/",
  title: "Hybrid Truck APU — Battery + Parking Generator | CoolDrivePro",
  description: "Hybrid APU: LiFePO4 battery handles overnight, parking generator auto-starts on low SoC. Unlimited runtime with minimal fuel burn — ideal for long stops and heavy loads.",
  breadcrumb: "Hybrid APU",
  blocks: [
    {
      kind: "hero",
      eyebrow: "Hybrid APU",
      title: "Best of both worlds — silent battery, generator only when needed.",
      subtitle: "Battery handles the night. If state-of-charge drops below your threshold, the parking generator auto-starts, recharges, and stops. You get unlimited runtime with a fraction of the fuel.",
      diagram: true,
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "howWorks",
      eyebrow: "Hybrid logic",
      title: "How the auto-start logic decides when to fire the generator.",
      steps: [
        { tag: "Default", title: "Battery-first operation.", body: "AC and cabin loads pull from the LiFePO4 pack. Silent, zero emissions." },
        { tag: "Threshold", title: "SoC trigger at 30% (configurable).", body: "When the BMS reports SoC < threshold, controller wakes the parking generator." },
        { tag: "Top-up", title: "Recharge to 80%, then stop.", body: "Generator runs ~60–90 min, recharges to target SoC, then shuts down. Anti-cycling prevents short bursts." },
      ],
    },
    {
      kind: "specTable",
      eyebrow: "Hybrid kit BOM",
      title: "What's in the Hybrid APU Kit.",
      rows: [
        { label: "Parking AC", value: "VS02 PRO 24V, 12,000 BTU" },
        { label: "Battery", value: "LiFePO4 24V × 300 Ah (7.2 kWh)" },
        { label: "Parking generator", value: "Diesel 3 kW silent enclosure" },
        { label: "Inverter", value: "3000 W pure sine 110V/220V" },
        { label: "Controller", value: "Auto-start, SoC band, anti-cycling" },
        { label: "Avg generator runtime", value: "~ 75 min / 24 h cycle" },
        { label: "Fuel use", value: "< 0.05 gal/h averaged" },
      ],
    },
    { ...CTA_FORM },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 7 — Builder (placeholder)
// ─────────────────────────────────────────────────────────────
const BUILDER: ApuPageConfig = {
  slug: "builder",
  path: "/apu/builder/",
  title: "Build Your Truck APU — Custom Configuration Tool | CoolDrivePro",
  description: "Configure your APU step by step: truck type, parking pattern, modules. Get a BOM and runtime estimate.",
  breadcrumb: "APU Builder",
  blocks: [
    {
      kind: "hero",
      eyebrow: "Build your APU",
      title: "Tell us how you park. We'll spec the system.",
      subtitle: "Four steps — truck, pattern, modules, result. We email back a BOM, a wiring diagram, and a runtime estimate.",
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "placeholder",
      title: "Interactive APU configurator — coming online",
      note: "The four-step wizard lives here. Until the React component is wired up, use the inquiry form below — we'll build the configuration manually within one business day.",
      checklist: [
        "Step 1 — Truck type: sleeper / day cab / RV / work / reefer.",
        "Step 2 — Use pattern: hours/night, climate zone, shore-power access.",
        "Step 3 — Module sizing: HVAC capacity / battery kWh / generator kW.",
        "Step 4 — Result: BOM, runtime estimate, savings projection, one-click RFQ.",
      ],
    },
    { ...CTA_FORM, title: "Skip the wizard — get a custom build now." },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 8 — ROI calculator (placeholder)
// ─────────────────────────────────────────────────────────────
const ROI: ApuPageConfig = {
  slug: "roi-calculator",
  path: "/apu/roi-calculator/",
  title: "APU ROI Calculator — Fuel Savings, Idle Fines, Payback | CoolDrivePro",
  description: "Calculate the payback period of a CoolDrivePro APU based on your trucks, idle hours, diesel price, and state-level idling restrictions.",
  breadcrumb: "ROI Calculator",
  blocks: [
    {
      kind: "hero",
      eyebrow: "APU economics",
      title: "How fast does an APU pay for itself?",
      subtitle: "Most CoolDrivePro APUs pay back in 9–18 months — even before counting anti-idling fines.",
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "placeholder",
      title: "ROI calculator — interactive version coming",
      note: "Will accept: parking hours/year, local diesel price, state. Will output: annual fuel savings, fines avoided, CO₂ reduced, payback months, downloadable PDF.",
      checklist: [
        "Inputs: trucks · idle h/yr · diesel $ · state · expected APU usage rate.",
        "Outputs: $ saved/yr · gal saved/yr · CO₂ tons · fines avoided · payback months.",
        "PDF report — sent by email after lead capture.",
      ],
    },
    {
      kind: "specTable",
      eyebrow: "Ballpark numbers",
      title: "Reference savings — one Class 8 sleeper.",
      rows: [
        { label: "Idle hours / year", value: "2,000 h" },
        { label: "Idle fuel burn", value: "0.8 gal/h" },
        { label: "Diesel price (assumed)", value: "$3.90 /gal" },
        { label: "Annual fuel saved", value: "1,600 gal ≈ $6,240" },
        { label: "Anti-idle fines avoided", value: "$300–1,500 /yr" },
        { label: "Engine wear reduction", value: "≈ 66,000 mi equivalent" },
        { label: "Typical CoolDrivePro APU cost", value: "$2.8–5.0k" },
        { label: "Typical payback", value: "9–14 months" },
      ],
    },
    { ...CTA_FORM },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 9 — Compliance map (placeholder)
// ─────────────────────────────────────────────────────────────
const COMPLIANCE: ApuPageConfig = {
  slug: "compliance",
  path: "/apu/compliance/",
  title: "US Anti-Idling Laws Map — APU Compliance by State | CoolDrivePro",
  description: "State-by-state truck idling restrictions and fines. See which CoolDrivePro APU configuration keeps you compliant on every route.",
  breadcrumb: "Compliance Map",
  blocks: [
    {
      kind: "hero",
      eyebrow: "Anti-idling compliance",
      title: "30+ states regulate truck idling. We map them.",
      subtitle: "Idling rules vary by state, county, and even truck stop. Battery APUs are compliant everywhere. Diesel APUs face restrictions in California, New Jersey, Massachusetts, and others.",
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "placeholder",
      title: "Interactive 50-state map — drop-in coming",
      note: "The compliance map will show: idle limit (minutes), exemptions, APU allowance, fine schedule, and the CoolDrivePro configuration we recommend for that state's profile.",
      checklist: [
        "Color-coded state map: strict / moderate / minimal.",
        "Per-state pop-up: idle limit, fine, APU rules, statute link.",
        "Filter by 'diesel APU allowed' vs 'battery only'.",
      ],
    },
    {
      kind: "compareTable",
      eyebrow: "Top regulated states",
      title: "Sample state idling rules.",
      headers: ["State", "Idle limit", "Diesel APU?", "Typical fine"],
      rows: [
        ["California (CARB)", "5 min", "CARB-certified only", "$300–1,800"],
        ["New Jersey", "3 min", "Yes, certified", "$250–1,000"],
        ["Massachusetts", "5 min", "Yes, certified", "$100–25,000"],
        ["Texas (TCEQ counties)", "5 min", "Yes", "$200–500"],
        ["New York", "5 min (3 min in NYC)", "Yes", "$250–18,000"],
        ["Illinois", "10 min", "Yes", "$50–500"],
      ],
    },
    { ...CTA_FORM, title: "Need to stay compliant on every route?" },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 10 — Compare vs competitors
// ─────────────────────────────────────────────────────────────
const COMPARE: ApuPageConfig = {
  slug: "compare",
  path: "/apu/compare/",
  title: "CoolDrivePro APU vs TriPac, ComfortPro, Idle Free, Bergstrom | Comparison",
  description: "Side-by-side comparison of CoolDrivePro modular APU vs Thermo King TriPac, Carrier ComfortPro, Idle Free eAPU, and Bergstrom NITE.",
  breadcrumb: "Compare APUs",
  blocks: [
    {
      kind: "hero",
      eyebrow: "Competitive comparison",
      title: "Modular vs fixed — why CoolDrivePro is different.",
      subtitle: "Incumbent APUs lock you into one box. CoolDrivePro is a stack of modules — replace one part without scrapping the system.",
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "compareTable",
      eyebrow: "Head-to-head",
      title: "CoolDrivePro vs the incumbents.",
      headers: ["Dimension", "TK TriPac", "Carrier ComfortPro", "Idle Free eAPU", "Bergstrom NITE", "CoolDrivePro"],
      rows: [
        ["Type", "Diesel", "Diesel", "Battery", "Battery", "Modular (any)"],
        ["Price band", "$10–12k", "$9–11k", "$8–10k", "$8–10k", "$2.8–5.0k"],
        ["HVAC modular?", "No", "No", "No", "No", "Yes"],
        ["Battery upgradable?", "No", "No", "Limited", "Limited", "Yes"],
        ["Generator add-on?", "Integrated", "Integrated", "No", "No", "Yes"],
        ["Single-point failure?", "High", "High", "High", "High", "Per-module"],
        ["Telematics?", "Optional", "Optional", "Yes", "Yes", "Roadmap"],
        ["Anti-idling compliance", "CARB-restricted", "CARB-restricted", "Universal", "Universal", "Universal (battery) / state-rule (diesel)"],
      ],
    },
    { ...CTA_FORM, title: "Get an apples-to-apples quote." },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 11 — Case studies
// ─────────────────────────────────────────────────────────────
const CASES: ApuPageConfig = {
  slug: "case-studies",
  path: "/apu/case-studies/",
  title: "Truck APU Case Studies — Real Deployments | CoolDrivePro",
  description: "Real CoolDrivePro APU deployments around the world. Country, vehicle, configuration, runtime, customer feedback.",
  breadcrumb: "Case Studies",
  blocks: [
    {
      kind: "hero",
      eyebrow: "Field deployments",
      title: "Real trucks. Real numbers. Real nights of sleep.",
      subtitle: "Each case follows the same evidence template — country, vehicle, problem, recommended configuration, photos, runtime, feedback. New entries every month.",
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "cases",
      eyebrow: "Featured deployments",
      title: "Battery, hybrid, and long-haul examples.",
      cases: [
        { country: "USA · TX", vehicle: "Freightliner Cascadia 126", problem: "Anti-idling fines and overnight idle fuel cost.", config: "Battery APU Kit, 24V/200Ah, 12,000 BTU", runtime: "8.5 h avg @ 95 °F", feedback: "Fines went to zero, sleeper stays cool all night." },
        { country: "Germany · BY", vehicle: "Mercedes Actros L GigaSpace", problem: "EU sleeper noise + diesel cost.", config: "Comfort Power Kit + 230V inverter", runtime: "9 h cooling + fridge", feedback: "First quiet sleep in 12 years on the road." },
        { country: "UAE · Dubai", vehicle: "Volvo FH16 Globetrotter XL", problem: "Desert heat, +48 °C overnight.", config: "Hybrid APU + 300 Ah pack + 3 kW generator", runtime: "Unlimited; gen runs ~90 min total/night", feedback: "Slept cool through every leg from Jebel Ali to Riyadh." },
        { country: "Australia · QLD", vehicle: "Kenworth T610", problem: "Outback heat, long stops, no shore power.", config: "Hybrid APU Kit", runtime: "Unlimited", feedback: "Finally a setup that handles a full Outback night." },
      ],
    },
    { ...CTA_FORM, title: "Want to be the next case study?" },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 12 — R&D
// ─────────────────────────────────────────────────────────────
const RD: ApuPageConfig = {
  slug: "r-and-d",
  path: "/apu/r-and-d/",
  title: "APU R&D Center — Engineering, Testing, Certification | CoolDrivePro",
  description: "How we engineer the CoolDrivePro APU system: BMS, thermal management, vibration & noise testing, environmental chambers, and certifications (CE, RoHS, UN38.3, MSDS).",
  breadcrumb: "R&D",
  blocks: [
    {
      kind: "hero",
      eyebrow: "Engineering & quality",
      title: "Designed to outlast the truck it sits on.",
      subtitle: "Modules are designed, tested, and qualified at the Qingdao Vethy facility. Environmental chambers from −20 °C to +55 °C, vibration table, full BMS test rig.",
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "techCenter",
      eyebrow: "Test programs",
      title: "What every module survives before shipping.",
      items: [
        { title: "Environmental chamber", body: "−20 °C cold soak + +55 °C hot soak. AC startup verified at both extremes." },
        { title: "Vibration table", body: "ISO 16750-3 truck-grade random vibration profile, 8h per axis." },
        { title: "BMS abuse rig", body: "Over-charge, over-discharge, short-circuit, thermal runaway containment." },
        { title: "Noise chamber", body: "dB(A) at 1 m, cabin / bunk measurements, post-mount confirmation." },
        { title: "Run-out test", body: "200+ continuous hours at rated load before lot release." },
        { title: "Salt-spray", body: "Coastal-route hardware: connectors, mounts, fasteners." },
      ],
    },
    {
      kind: "resourceHub",
      eyebrow: "Downloadable engineering library",
      title: "Drawings, manuals, certificates.",
      items: [
        { title: "Wiring diagrams (PDF) — coming", href: "/apu/r-and-d/" },
        { title: "Install manuals (PDF) — coming", href: "/apu/install/" },
        { title: "Spec sheets per module — coming", href: "/apu/r-and-d/" },
        { title: "CE / RoHS / UN38.3 / MSDS — coming", href: "/apu/r-and-d/" },
        { title: "Battery runtime tables — coming", href: "/apu/r-and-d/" },
        { title: "Fuse & cable sizing chart — coming", href: "/apu/r-and-d/" },
      ],
    },
    { ...CTA_FORM },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 13 — Install
// ─────────────────────────────────────────────────────────────
const INSTALL: ApuPageConfig = {
  slug: "install",
  path: "/apu/install/",
  title: "Truck APU Installation — Service Network & Self-Install Guide | CoolDrivePro",
  description: "Install a CoolDrivePro APU via our certified upfitter network or with our documented self-install guides. Roof opening ranges, battery box placement, generator clearance.",
  breadcrumb: "Install",
  blocks: [
    {
      kind: "hero",
      eyebrow: "Installation",
      title: "Two paths — certified upfitters or documented self-install.",
      subtitle: "Most kits install in 4–8 hours. We provide every drawing, harness, and torque spec — or we ship to a network upfitter near you.",
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "techCenter",
      eyebrow: "Install requirements",
      title: "Plan the cab, the toolbox, and the chassis.",
      items: [
        { title: "Parking AC opening", body: "Min/max roof cutout ranges per AC model (e.g. VS02 PRO: 510×380 mm → 800×490 mm)." },
        { title: "Battery box volume", body: "Reference dimensions for under-bunk and side-toolbox installs." },
        { title: "Generator clearance", body: "Frame-rail mounting points, exhaust routing, intake clearance." },
        { title: "Inverter placement", body: "Within 1 m of battery, away from cab radio, ventilated." },
        { title: "Cab panel mounting", body: "Standard DIN cutout or surface bracket." },
        { title: "Sealing & weatherproofing", body: "Roof gasket spec, harness grommets, IP-rated connectors." },
      ],
    },
    {
      kind: "placeholder",
      title: "Vehicle fitment compatibility matrix — interactive table coming",
      note: "Pick your truck (Freightliner Cascadia, Volvo FH, Kenworth T680, Peterbilt 579, Mack Anthem, International LT, Scania S, Mercedes Actros…) and see which APU configurations fit and the install time estimate.",
    },
    { ...CTA_FORM, title: "Find a certified upfitter or request install support." },
  ],
};

// ─────────────────────────────────────────────────────────────
// PAGE 14 — FAQ
// ─────────────────────────────────────────────────────────────
const APU_FAQ: ApuPageConfig = {
  slug: "faq",
  path: "/apu/faq/",
  title: "Truck APU FAQ — Runtime, Install, Compliance, Warranty | CoolDrivePro",
  description: "Top questions about truck APUs: runtime, installation, anti-idling compliance, batteries, generators, warranty, and after-sales.",
  breadcrumb: "FAQ",
  blocks: [
    {
      kind: "hero",
      eyebrow: "APU FAQ",
      title: "Everything you'd want to know before buying.",
      subtitle: "Plain-language answers, technical when needed.",
    },
    { kind: "pageNav", ...PAGE_NAV },
    {
      kind: "faq",
      items: [
        { q: "How long can a parking AC run on battery?", a: "Typical CoolDrivePro Battery APU runs 8–10 h at 30 °C ambient with the AC on cooling mode. Runtime drops in extreme heat (50 °C) to 5–6 h and extends to 12+ h in milder conditions or with lower-fan setpoints." },
        { q: "Do I need a generator?", a: "No, if you park 8–10 h between drives and recharge while driving. Yes, if you park 12+ h, run heavy cabin loads, or operate where temperatures regularly exceed 45 °C." },
        { q: "Is a battery APU compliant in California?", a: "Yes. Battery APUs (zero on-board emissions) are compliant in all anti-idling states, including CARB-regulated California. Diesel APUs must be CARB-certified to operate in CA." },
        { q: "Will the APU drain my starter battery?", a: "No. The APU battery is isolated from the starter battery by a DC-DC charger. The starter battery is never used for cabin loads." },
        { q: "How long does installation take?", a: "Most kits install in 4–8 hours by a qualified upfitter. Hybrid kits with generator can take 8–12 hours." },
        { q: "What's the warranty?", a: "Standard 1-year warranty on all modules. Extended warranty available on request." },
        { q: "Can I upgrade later from battery-only to hybrid?", a: "Yes — that's the point of modular. Add the parking generator and controller without re-wiring the rest." },
      ],
    },
    { ...CTA_FORM },
  ],
};

// ─────────────────────────────────────────────────────────────
// Map
// ─────────────────────────────────────────────────────────────
export const APU_PAGES: Record<string, ApuPageConfig> = {
  "": HUB,
  "what-is-a-truck-apu": WHAT_IS,
  "how-it-works": HOW_IT_WORKS,
  "electric": ELECTRIC,
  "diesel": DIESEL,
  "hybrid": HYBRID,
  "builder": BUILDER,
  "roi-calculator": ROI,
  "compliance": COMPLIANCE,
  "compare": COMPARE,
  "case-studies": CASES,
  "r-and-d": RD,
  "install": INSTALL,
  "faq": APU_FAQ,
};
