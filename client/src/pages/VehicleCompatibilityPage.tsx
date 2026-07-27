import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Compass,
  Gauge,
  Home,
  MapPinned,
  PackageSearch,
  Ruler,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import CompactInquiryForm from "@/components/CompactInquiryForm";
import { useSEO } from "@/hooks/useSEO";

const BASE_URL = "https://cooldrivepro.com";

interface Fact {
  label: string;
  value: string;
}

interface CopyBlock {
  title: string;
  body: string;
  icon?: LucideIcon;
}

interface LinkBlock {
  href: string;
  title: string;
  body: string;
}

interface ProductMatch {
  name: string;
  href: string;
  fit: string;
  reason: string;
}

interface Faq {
  question: string;
  answer: string;
}

interface PageConfig {
  path: string;
  section: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  heroAlt: string;
  icon: LucideIcon;
  facts: Fact[];
  intro: CopyBlock[];
  checklistTitle: string;
  checklist: string[];
  productMatches: ProductMatch[];
  decisionTitle: string;
  decisionBlocks: CopyBlock[];
  related: LinkBlock[];
  faq: Faq[];
  primaryCta: LinkBlock;
  secondaryCta: LinkBlock;
}

const productImage = "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-top-mounted-opt_7f111736.webp";
const splitImage = "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-mini-split-opt_81dc95b4.webp";
const rvImage = "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-rv-outdoor-3S7bLnKiixmod8iB5Fjvih.webp";

const PAGES: Record<string, PageConfig> = {
  "/vehicle-compatibility": {
    path: "/vehicle-compatibility",
    section: "Compatibility",
    badge: "Vehicle Fitment Hub",
    title: "Parking Air Conditioner Vehicle Compatibility Guide",
    subtitle: "Match a no-idle parking air conditioner to semi trucks, RVs, vans, pickups, voltage, roof space, and local market demand before you buy or stock inventory.",
    description:
      "Use this guide to decide whether a CoolDrivePro parking air conditioner fits semi trucks, RVs, vans, pickups, box trucks, and dealer customer bases. It covers 12V/24V voltage, mounting format, battery runtime, and model selection.",
    heroImage: productImage,
    heroAlt: "CoolDrivePro rooftop parking air conditioner for vehicle compatibility planning",
    icon: Compass,
    facts: [
      { label: "Start With", value: "Vehicle class" },
      { label: "Then Check", value: "12V/24V power" },
      { label: "Final Proof", value: "Mounting + battery" },
    ],
    intro: [
      {
        title: "Vehicle class sets the real demand",
        body: "Semi trucks usually need overnight sleeper cooling, RVs need quiet off-grid comfort, and light trucks or vans need a smaller footprint. The best page, product, and sales angle should start from the vehicle your customer actually drives.",
        icon: Truck,
      },
      {
        title: "Voltage narrows the shortlist fast",
        body: "Most RV, van, pickup, and light truck customers think in 12V systems. Many commercial trucks and fleet vehicles need 24V planning. A dealer should sort leads by voltage before discussing BTU or price.",
        icon: Zap,
      },
      {
        title: "Fitment is more than a roof opening",
        body: "The roof, wall, cab size, battery reserve, cable route, weather exposure, and install skill all affect whether the customer has a good first experience with parking AC.",
        icon: Ruler,
      },
    ],
    checklistTitle: "Universal pre-purchase fitment checklist",
    checklist: [
      "Vehicle type: semi truck, RV, van, pickup, box truck, light truck, or special vehicle.",
      "Electrical system: confirm 12V, 24V, dual battery, house battery, or auxiliary battery architecture.",
      "Mounting area: check rooftop space, roof thickness, cutout size, indoor clearance, and service access.",
      "Cooling goal: short rest stop, overnight sleeper use, campground quiet hours, or worksite daytime cooling.",
      "Battery goal: estimate practical runtime before promising all-night cooling.",
      "Climate: hot desert, humid coastal, mixed-season, or cold-weather market demand.",
      "Buyer type: individual owner, installer, dealer, fleet buyer, or brand seller testing a new category.",
    ],
    productMatches: [
      {
        name: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        fit: "Mainstream rooftop installs",
        reason: "Best first-line SKU when the customer wants a clear rooftop format for RVs, trucks, vans, and mixed vehicle programs.",
      },
      {
        name: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        fit: "Quiet sleeper and premium builds",
        reason: "Best when indoor noise, sleeper comfort, and semi-truck cab layout matter more than the simplest install path.",
      },
      {
        name: "Nano Max Light Truck Parking AC",
        href: "/products/nano-max/",
        fit: "Pickups, vans, light trucks",
        reason: "Useful for compact vehicles, smaller local markets, and dealers testing demand beyond heavy truck and RV customers.",
      },
    ],
    decisionTitle: "Where buyers and dealers should start",
    decisionBlocks: [
      {
        title: "For semi-truck customers",
        body: "Lead with sleeper comfort, voltage, anti-idling savings, and night-time noise. The buyer wants to know whether the system will cool the cab while the engine stays off.",
        icon: Truck,
      },
      {
        title: "For RV and van customers",
        body: "Lead with roof space, battery runtime, campground quiet-hour use, and whether the customer needs a simple rooftop unit or quieter split layout.",
        icon: Home,
      },
      {
        title: "For local dealers",
        body: "Lead with the local vehicle mix. A hot region with many light trucks needs a different starter bundle than a freight corridor with sleeper cabs.",
        icon: Users,
      },
    ],
    related: [
      { href: "/vehicle-compatibility/semi-truck-parking-ac/", title: "Semi Truck Fitment", body: "Sleeper cab cooling, 24V planning, and fleet rollout logic." },
      { href: "/vehicle-compatibility/rv-parking-ac/", title: "RV Fitment", body: "Off-grid cooling, roof space, quiet hours, and house battery planning." },
      { href: "/vehicle-compatibility/12v-vs-24v-parking-ac/", title: "12V vs 24V", body: "Voltage selection for trucks, RVs, vans, pickups, and dealer quotes." },
      { href: "/tools/parking-ac-fitment-planner/", title: "Parking AC Fitment Planner", body: "Build a practical product shortlist from your vehicle, voltage, roof format, and operating goal." },
      { href: "/dealer-guide/parking-ac-local-market-fitment/", title: "Dealer Local Market Guide", body: "Choose starting SKUs by local vehicle mix and customer objections." },
    ],
    faq: [
      {
        question: "How do I know if a parking AC fits a customer's vehicle?",
        answer: "Start with vehicle class, system voltage, mounting space, and expected runtime. Photos of the roof or cab, battery details, and intended use are usually enough for an initial compatibility check.",
      },
      {
        question: "Should dealers stock one model or several models?",
        answer: "Most dealers should start with one mainstream rooftop model plus one specialized model for their strongest local segment. For example, a freight market can add a sleeper-focused split system, while a light-truck market can add Nano Max.",
      },
      {
        question: "Can the same parking AC cover trucks, RVs, and vans?",
        answer: "Some rooftop units can serve multiple vehicle types, but the best customer experience still depends on voltage, mounting space, battery capacity, and how the customer plans to use the vehicle.",
      },
    ],
    primaryCta: {
      href: "/contact?intent=compatibility&source=vehicle-compatibility",
      title: "Request Compatibility Check",
      body: "Send vehicle type, voltage, roof photos, and target runtime.",
    },
    secondaryCta: {
      href: "/products/",
      title: "Compare Products",
      body: "See the full CoolDrivePro parking AC lineup.",
    },
  },
  "/vehicle-compatibility/semi-truck-parking-ac": {
    path: "/vehicle-compatibility/semi-truck-parking-ac",
    section: "Compatibility",
    badge: "Semi Truck Fitment",
    title: "Semi Truck Parking Air Conditioner Compatibility",
    subtitle: "Choose the right semi truck parking AC for sleeper cabs, long-haul routes, hot freight lanes, and overnight rest stops.",
    description:
      "Semi truck parking air conditioner buyers should verify voltage, sleeper cab layout, battery reserve, install format, indoor noise, and expected overnight runtime before choosing a rooftop or mini split system.",
    heroImage: splitImage,
    heroAlt: "Mini split parking air conditioner for semi truck sleeper cab compatibility",
    icon: Truck,
    facts: [
      { label: "Common Vehicle", value: "Sleeper cab" },
      { label: "Key Check", value: "24V + runtime" },
      { label: "Strong Matches", value: "VX3000SP, VS02 PRO" },
    ],
    intro: [
      {
        title: "The sleeper cab is the product test",
        body: "For long-haul drivers, the real question is not only BTU. It is whether the cab stays comfortable and quiet enough for sleep after the engine shuts down.",
        icon: Gauge,
      },
      {
        title: "Voltage and wiring must be confirmed early",
        body: "Commercial trucks often need 24V planning or a known battery architecture. Confirming this before quoting prevents the most common mismatch between customer expectation and installation reality.",
        icon: Zap,
      },
      {
        title: "Fleet rollout favors repeatable installs",
        body: "If a dealer or fleet wants multiple units, standardizing cab photos, roof measurements, cable routes, and fuse protection makes each next installation faster.",
        icon: ClipboardCheck,
      },
    ],
    checklistTitle: "Semi-truck compatibility checklist",
    checklist: [
      "Confirm sleeper cab size, roof layout, and indoor mounting clearance.",
      "Verify 12V/24V electrical architecture and available battery reserve.",
      "Ask whether the customer needs overnight sleep comfort or only short break cooling.",
      "Check the main route climate: dry heat, humid heat, or mixed-season operation.",
      "Decide between rooftop simplicity and mini split quietness before quoting.",
      "Plan service access and replacement parts if the buyer operates a fleet.",
    ],
    productMatches: [
      {
        name: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        fit: "Best for quiet sleeper comfort",
        reason: "The split format is a strong match when the driver sleeps in the cab and lower indoor noise is a priority.",
      },
      {
        name: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        fit: "Best for standardized rooftop rollout",
        reason: "A simpler all-in-one format for installers and dealers that need a repeatable product path.",
      },
      {
        name: "V-TH1 Heating & Cooling Parking AC",
        href: "/products/heating-cooling-ac/",
        fit: "Best for mixed-season routes",
        reason: "Useful when fleets run through cold mornings, mountain lanes, or regions where heating matters as much as cooling.",
      },
    ],
    decisionTitle: "Semi-truck buyer decision points",
    decisionBlocks: [
      { title: "Owner-operator", body: "Prioritize sleep quality, cab noise, and real overnight runtime.", icon: ShieldCheck },
      { title: "Fleet buyer", body: "Prioritize installation repeatability, wiring standardization, and service training.", icon: PackageSearch },
      { title: "Dealer", body: "Keep both a rooftop path and a premium sleeper path if the local market includes long-haul trucks.", icon: Users },
    ],
    related: [
      { href: "/solutions/semi-truck-parking-ac/", title: "Semi Truck Solution Hub", body: "More product and route-planning context for truck AC buyers." },
      { href: "/compare/rooftop-vs-mini-split-parking-ac/", title: "Rooftop vs Mini Split", body: "Compare install speed against sleeper-cab quietness." },
      { href: "/vehicle-compatibility/12v-vs-24v-parking-ac/", title: "12V vs 24V", body: "Voltage checks before quoting or installation." },
    ],
    faq: [
      {
        question: "Is a mini split better for semi trucks?",
        answer: "It is often better when the driver values quieter sleeper-cab comfort. A rooftop unit may still be better for faster fleet rollout and simpler installation.",
      },
      {
        question: "What information should a dealer collect from a truck customer?",
        answer: "Collect truck make and model, sleeper cab photos, roof photos, battery voltage, target runtime, and whether the buyer is an owner-operator or fleet buyer.",
      },
      {
        question: "Does parking AC help with anti-idling concerns?",
        answer: "Yes. A battery-powered parking AC can reduce engine idling during rest periods, but actual savings depend on route, climate, fuel price, and battery setup.",
      },
    ],
    primaryCta: { href: "/contact?intent=compatibility&vehicle=semi-truck", title: "Check Semi-Truck Fitment", body: "Send cab photos, voltage, and target runtime." },
    secondaryCta: { href: "/products/mini-split-ac/", title: "See VX3000SP", body: "Review the sleeper-cab mini split option." },
  },
  "/vehicle-compatibility/rv-parking-ac": {
    path: "/vehicle-compatibility/rv-parking-ac",
    section: "Compatibility",
    badge: "RV Fitment",
    title: "RV Parking Air Conditioner Compatibility",
    subtitle: "Plan rooftop space, house battery runtime, campground quiet hours, and off-grid cooling before choosing an RV parking air conditioner.",
    description:
      "RV parking air conditioner compatibility depends on roof layout, 12V house battery capacity, solar or charging support, installation space, and whether the customer camps off-grid or mainly uses short stops.",
    heroImage: rvImage,
    heroAlt: "RV parked outdoors for parking AC compatibility and off-grid cooling planning",
    icon: Home,
    facts: [
      { label: "Common Vehicle", value: "RV / camper" },
      { label: "Key Check", value: "Roof + battery" },
      { label: "Strong Matches", value: "VS02 PRO, Nano Max" },
    ],
    intro: [
      {
        title: "RV buyers care about the full electrical system",
        body: "Runtime depends on battery capacity, solar input, charging habits, insulation, and temperature. A compatibility answer should include the electrical plan, not only the air conditioner model.",
        icon: BatteryCharging,
      },
      {
        title: "Roof layout changes the best format",
        body: "A clean rooftop opening favors a simple top-mounted path. Tight roof space, premium sleeping comfort, or custom builds may need a different layout.",
        icon: Ruler,
      },
      {
        title: "Quiet-hour use is a strong selling point",
        body: "Campground and boondocking customers often want cooling without generator noise. This makes battery-powered parking AC easier to explain than a traditional engine-idle or generator-dependent setup.",
        icon: ShieldCheck,
      },
    ],
    checklistTitle: "RV compatibility checklist",
    checklist: [
      "Confirm roof dimensions, existing vents, solar panels, and available cutout area.",
      "Confirm house battery type, voltage, amp-hour capacity, and charging method.",
      "Ask whether the RV is used for short trips, full-time travel, or off-grid camping.",
      "Check interior clearance, drain routing, sealing requirements, and service access.",
      "Estimate realistic night-time runtime before promising off-grid performance.",
      "Choose compact cooling when the RV is small or roof space is limited.",
    ],
    productMatches: [
      {
        name: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        fit: "Best general RV retrofit",
        reason: "A familiar rooftop format for RV owners who want a clear, easy-to-understand upgrade path.",
      },
      {
        name: "Nano Max Light Truck Parking AC",
        href: "/products/nano-max/",
        fit: "Best for compact rigs",
        reason: "A practical option for smaller RVs, campers, and builds where a full-size unit is more than the vehicle needs.",
      },
      {
        name: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        fit: "Best for quiet premium builds",
        reason: "Useful when a quieter indoor environment is the deciding factor for full-time or premium RV customers.",
      },
    ],
    decisionTitle: "RV buyer decision points",
    decisionBlocks: [
      { title: "Weekend camper", body: "Focus on simple install, fast comfort, and a reasonable battery plan.", icon: Home },
      { title: "Boondocking buyer", body: "Focus on full-night runtime, solar support, and generator-free quiet operation.", icon: BatteryCharging },
      { title: "Dealer", body: "Use roof photos and battery details as required quote inputs for RV customers.", icon: ClipboardCheck },
    ],
    related: [
      { href: "/solutions/rv-parking-ac/", title: "RV Solution Hub", body: "More RV-specific cooling and product guidance." },
      { href: "/solutions/off-grid-rv-air-conditioner/", title: "Off-Grid RV AC", body: "Battery and solar planning for quiet camping." },
      { href: "/compare/parking-ac-roof-fitment-guide/", title: "Roof Fitment Guide", body: "Check roof space before choosing a model." },
    ],
    faq: [
      {
        question: "Can an RV parking AC run overnight?",
        answer: "It can when the house battery and charging plan are sized correctly. Runtime depends on battery capacity, ambient temperature, insulation, and set temperature.",
      },
      {
        question: "Is rooftop AC always the best RV option?",
        answer: "Not always. Rooftop is often simplest, but compact or split options may be better for tight roof layouts, smaller vehicles, or premium sleeping comfort.",
      },
      {
        question: "What should RV dealers ask before recommending a model?",
        answer: "Ask for roof photos, roof measurements, battery details, camping pattern, expected runtime, and whether the customer needs quiet off-grid operation.",
      },
    ],
    primaryCta: { href: "/contact?intent=compatibility&vehicle=rv", title: "Check RV Fitment", body: "Send roof photos and battery details." },
    secondaryCta: { href: "/products/top-mounted-ac/", title: "See VS02 PRO", body: "Review the mainstream rooftop option." },
  },
  "/vehicle-compatibility/12v-vs-24v-parking-ac": {
    path: "/vehicle-compatibility/12v-vs-24v-parking-ac",
    section: "Compatibility",
    badge: "Voltage Guide",
    title: "12V vs 24V Parking Air Conditioner Compatibility",
    subtitle: "Use vehicle voltage to choose the correct 12V or 24V parking AC before quoting, installing, or stocking inventory.",
    description:
      "This guide explains how dealers and buyers should choose between 12V and 24V parking air conditioner systems for RVs, vans, pickups, semi trucks, box trucks, and local market inventories.",
    heroImage: productImage,
    heroAlt: "12V and 24V rooftop parking air conditioner compatibility guide",
    icon: Zap,
    facts: [
      { label: "12V Often Fits", value: "RV, van, pickup" },
      { label: "24V Often Fits", value: "Commercial trucks" },
      { label: "Best Practice", value: "Verify before quote" },
    ],
    intro: [
      {
        title: "12V is common in consumer vehicles",
        body: "RVs, camper vans, pickups, and light trucks often start from 12V battery architecture. These customers usually also care about house battery capacity and solar charging.",
        icon: Home,
      },
      {
        title: "24V is common in heavier commercial use",
        body: "Semi trucks and some fleet vehicles may require 24V compatibility. Dealers should ask for the electrical architecture before recommending a model.",
        icon: Truck,
      },
      {
        title: "Dual-voltage inventory can reduce risk",
        body: "Where the local market is mixed, stocking or promoting 12V/24V-capable products can help dealers cover more customers with fewer wrong-fit conversations.",
        icon: PackageSearch,
      },
    ],
    checklistTitle: "Voltage compatibility checklist",
    checklist: [
      "Ask the customer to confirm the vehicle battery voltage before discussing final price.",
      "Record whether the parking AC uses the starter battery, house battery, or auxiliary battery.",
      "Check cable length, fuse protection, and voltage drop risk for the planned install location.",
      "Do not assume RV equals 12V or truck equals 24V without confirming the real vehicle.",
      "For dealers, group leads into 12V, 24V, and unknown before quoting.",
      "When uncertain, request photos of battery labels, control panels, and existing electrical equipment.",
    ],
    productMatches: [
      {
        name: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        fit: "Mixed 12V/24V demand",
        reason: "A strong mainstream match when a dealer serves both RV and truck customers.",
      },
      {
        name: "Nano Max Light Truck Parking AC",
        href: "/products/nano-max/",
        fit: "Light trucks and compact vehicles",
        reason: "Useful for local markets where pickups, vans, and small commercial vehicles dominate.",
      },
      {
        name: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        fit: "Sleeper-focused semi truck buyers",
        reason: "A focused option when the buyer is asking about quiet cab comfort and truck-specific installation.",
      },
    ],
    decisionTitle: "How to explain voltage to customers",
    decisionBlocks: [
      { title: "Do not sell from BTU alone", body: "A powerful unit is still the wrong unit if the electrical system is mismatched.", icon: Gauge },
      { title: "Use voltage as a qualifying question", body: "It quickly separates easy quotes from jobs that need more installation review.", icon: ClipboardCheck },
      { title: "Give dealers a simple script", body: "Ask: What vehicle, what battery voltage, what target runtime, and where will the unit mount?", icon: Users },
    ],
    related: [
      { href: "/compare/12v-vs-24v-parking-ac/", title: "Detailed 12V vs 24V Comparison", body: "A deeper comparison page for search traffic and buyer education." },
      { href: "/vehicle-compatibility/", title: "Vehicle Compatibility Hub", body: "Return to the full vehicle fitment workflow." },
      { href: "/dealer-guide/parking-ac-local-market-fitment/", title: "Dealer Market Guide", body: "Turn voltage demand into a starter inventory plan." },
    ],
    faq: [
      {
        question: "Is 12V or 24V better for parking AC?",
        answer: "Neither is universally better. The right choice is the one that matches the vehicle electrical system, battery plan, cable routing, and intended runtime.",
      },
      {
        question: "Can dealers use one SKU for both 12V and 24V customers?",
        answer: "Dual-voltage models can help cover mixed demand, but dealers should still confirm installation details before accepting an order.",
      },
      {
        question: "What is the biggest voltage mistake?",
        answer: "The biggest mistake is quoting from the vehicle name alone without verifying the actual battery architecture and installation plan.",
      },
    ],
    primaryCta: { href: "/contact?intent=compatibility&topic=12v-24v", title: "Confirm Voltage Fit", body: "Send battery and vehicle details before ordering." },
    secondaryCta: { href: "/products/", title: "Browse 12V/24V Products", body: "Compare the available product paths." },
  },
  "/dealer-guide/parking-ac-local-market-fitment": {
    path: "/dealer-guide/parking-ac-local-market-fitment",
    section: "Dealer Guide",
    badge: "Local Market Fitment",
    title: "Parking AC Dealer Guide for Local Market Fitment",
    subtitle: "Help dealers, installers, and new brand sellers choose the right starter products for the vehicles their local customers already drive.",
    description:
      "This dealer guide turns local vehicle mix, customer objections, climate, voltage, and installation capacity into a practical parking AC starter lineup and content strategy.",
    heroImage: "/images/products/nano-max-01.webp",
    heroAlt: "CoolDrivePro Nano Max parking air conditioner for dealer local market fitment",
    icon: Users,
    facts: [
      { label: "Dealer Goal", value: "Avoid wrong SKUs" },
      { label: "Start With", value: "Local vehicle mix" },
      { label: "Best Output", value: "Starter bundle" },
    ],
    intro: [
      {
        title: "Local vehicle mix decides the first inventory",
        body: "A dealer near freight corridors should not start the same way as a dealer serving van conversions, pickups, RV parks, or municipal work vehicles.",
        icon: MapPinned,
      },
      {
        title: "Content should answer pre-purchase doubt",
        body: "Before customers ask price, they ask whether parking AC fits their vehicle. Dealer pages should answer fitment, voltage, mounting, runtime, and installation questions by vehicle type.",
        icon: Compass,
      },
      {
        title: "The safest starter lineup is focused",
        body: "A small, well-matched product mix is easier to sell, install, and support than a large inventory that does not match local demand.",
        icon: PackageSearch,
      },
    ],
    checklistTitle: "Dealer market audit checklist",
    checklist: [
      "List the top local vehicle groups: semi trucks, RVs, vans, pickups, box trucks, light trucks, buses, or work vehicles.",
      "Estimate whether local demand is mostly 12V, 24V, or mixed.",
      "Identify local climates and use cases: desert heat, humid summer, campground quiet hours, worksite cooling, or sleeper-cab rest.",
      "Choose one primary model and one backup model before expanding inventory.",
      "Create website pages for the top three local vehicle types before running ads.",
      "Train sales staff to request vehicle photos, voltage details, and target runtime before quoting.",
      "Track rejected leads by reason so the next content page answers the real market objection.",
    ],
    productMatches: [
      {
        name: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        fit: "Dealer starter SKU",
        reason: "A broad rooftop product story for mixed RV, truck, and van demand.",
      },
      {
        name: "Nano Max Light Truck Parking AC",
        href: "/products/nano-max/",
        fit: "Light truck and pickup markets",
        reason: "A focused product for dealers whose customers are not mainly heavy-truck or large RV buyers.",
      },
      {
        name: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        fit: "Premium semi-truck segment",
        reason: "A higher-intent option for long-haul truck customers who care about sleeper comfort.",
      },
    ],
    decisionTitle: "Dealer content pages to build first",
    decisionBlocks: [
      { title: "Local semi-truck page", body: "Use this if your market has freight routes, owner-operators, or fleets asking about anti-idling cooling.", icon: Truck },
      { title: "Local RV and van page", body: "Use this if your market has campers, upfitters, outdoor travel, or off-grid buyers.", icon: Home },
      { title: "Local voltage guide", body: "Use this when sales calls are slowed by 12V/24V confusion or mixed vehicle inquiries.", icon: Zap },
    ],
    related: [
      { href: "/vehicle-compatibility/", title: "Vehicle Compatibility Hub", body: "Use the hub as the main dealer education page." },
      { href: "/vehicle-compatibility/semi-truck-parking-ac/", title: "Semi Truck Fitment", body: "For dealers in freight-heavy markets." },
      { href: "/vehicle-compatibility/rv-parking-ac/", title: "RV Fitment", body: "For dealers serving RV, camper, and van customers." },
      { href: "/vehicle-compatibility/12v-vs-24v-parking-ac/", title: "12V vs 24V", body: "For quote qualification and installation planning." },
    ],
    faq: [
      {
        question: "What should a new parking AC dealer stock first?",
        answer: "Start with the product that matches the local vehicle majority, then add one complementary SKU for the most common objection. Do not start with a broad inventory before validating demand.",
      },
      {
        question: "How can a dealer use SEO to sell parking AC?",
        answer: "Build pages around real fitment questions: parking AC for local semi trucks, RVs, vans, pickups, 12V vs 24V, roof fitment, battery runtime, and installation readiness.",
      },
      {
        question: "What information should be required before a quote?",
        answer: "Vehicle type, voltage, roof or cab photos, target runtime, climate, installation location, and whether the customer is an owner, fleet, installer, or reseller.",
      },
    ],
    primaryCta: { href: "/contact?intent=dealer-fitment&source=dealer-guide", title: "Request Dealer Fitment Plan", body: "Send your local market and customer vehicle mix." },
    secondaryCta: { href: "/vehicle-compatibility/", title: "Open Compatibility Hub", body: "Use the buyer-facing fitment workflow." },
  },
};

function normalizePath(location: string): string {
  const clean = location.split("?")[0].split("#")[0] || "/";
  if (clean !== "/" && clean.endsWith("/")) return clean.slice(0, -1);
  return clean;
}

function buildJsonLd(page: PageConfig) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": page.section === "Dealer Guide" ? "Article" : "CollectionPage",
        name: page.title,
        headline: page.title,
        description: page.description,
        url: `${BASE_URL}${page.path}/`,
        image: page.heroImage.startsWith("http") ? page.heroImage : `${BASE_URL}${page.heroImage}`,
        publisher: { "@type": "Organization", name: "CoolDrivePro", url: BASE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
          { "@type": "ListItem", position: 2, name: page.section, item: `${BASE_URL}${page.path}/` },
          { "@type": "ListItem", position: 3, name: page.title, item: `${BASE_URL}${page.path}/` },
        ],
      },
      {
        "@type": "ItemList",
        name: `${page.title} recommended CoolDrivePro products`,
        itemListElement: page.productMatches.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.name,
          url: `${BASE_URL}${product.href}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="mb-7 max-w-3xl">
      <p
        className="mb-2 text-xs font-bold uppercase tracking-widest"
        style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
      >
        {eyebrow}
      </p>
      <h2
        className="text-2xl lg:text-3xl font-extrabold leading-tight"
        style={{ color: "oklch(0.23 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
      >
        {title}
      </h2>
      {body && (
        <p className="mt-3 text-base leading-relaxed" style={{ color: "oklch(0.43 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
          {body}
        </p>
      )}
    </div>
  );
}

export default function VehicleCompatibilityPage() {
  const [location] = useLocation();
  const normalizedPath = normalizePath(location);
  const page = PAGES[normalizedPath] || PAGES["/vehicle-compatibility"];
  const PageIcon = page.icon;

  useSEO({
    title: `${page.title} | CoolDrivePro`,
    description: page.description,
    canonical: `${BASE_URL}${page.path}/`,
    ogImage: page.heroImage.startsWith("http") ? page.heroImage : `${BASE_URL}${page.heroImage}`,
    alternateLanguages: ["en"],
    jsonLd: buildJsonLd(page),
  });

  return (
    <PageLayout>
      <nav
        className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm"
        style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}
      >
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <span>{page.section}</span>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>{page.title}</span>
      </nav>

      <section className="py-10 lg:py-16" style={{ backgroundColor: "oklch(0.96 0.02 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4" style={{ backgroundColor: "white" }}>
              <PageIcon size={16} style={{ color: "oklch(0.45 0.18 255)" }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {page.badge}
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {page.title}
            </h1>
            <p
              className="text-lg font-semibold mb-4 max-w-3xl"
              style={{ color: "oklch(0.42 0.13 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {page.subtitle}
            </p>
            <p className="text-base leading-relaxed max-w-3xl mb-7" style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
              {page.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
              {page.facts.map((fact) => (
                <div key={fact.label} className="rounded-lg border border-white/80 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "oklch(0.55 0.06 250)" }}>{fact.label}</p>
                  <p className="mt-1 text-sm font-extrabold" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{fact.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={page.primaryCta.href}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {page.primaryCta.title}
                <ArrowRight size={16} />
              </Link>
              <Link
                href={page.secondaryCta.href}
                className="inline-flex items-center gap-2 rounded-lg border-2 px-6 py-3 text-sm font-bold transition-colors hover:bg-white"
                style={{ borderColor: "oklch(0.45 0.18 255)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {page.secondaryCta.title}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-white/70 bg-white shadow-lg">
            <img src={page.heroImage} alt={page.heroAlt} width="900" height="650" className="h-full min-h-[320px] w-full object-cover" loading="eager" decoding="async" />
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <SectionHeading eyebrow="Fitment Logic" title="Compatibility starts before the product quote" body="These are the questions that remove uncertainty for buyers, dealers, installers, and local brand sellers." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {page.intro.map((item) => {
              const Icon = item.icon || CheckCircle2;
              return (
                <div key={item.title} className="rounded-lg border border-border bg-white p-6 shadow-sm">
                  <Icon size={24} style={{ color: "oklch(0.45 0.18 255)" }} />
                  <h3 className="mt-4 text-lg font-bold" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div>
            <SectionHeading eyebrow="Checklist" title={page.checklistTitle} body="Use this list as a pre-sales screen before accepting an order request or building a local product page." />
            <Link
              href={page.primaryCta.href}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {page.primaryCta.title}
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {page.checklist.map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-border bg-white p-4">
                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" style={{ color: "oklch(0.55 0.18 145)" }} />
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.38 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-10 lg:py-12">
        <div className="max-w-[960px] mx-auto px-4 lg:px-8">
          <CompactInquiryForm
            source={`vehicle_compatibility_${page.path}`}
            title="Send vehicle details for fitment review"
            subtitle="Vehicle type, voltage, roof space, and target runtime are enough for our team to recommend the next step."
            tone="blue"
          />
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <SectionHeading eyebrow="Product Match" title="Recommended CoolDrivePro paths" body="The right model depends on the vehicle segment, not only the listed cooling capacity." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {page.productMatches.map((product) => (
              <Link key={product.name} href={product.href} className="group rounded-lg border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>{product.fit}</p>
                <h3 className="mt-2 text-lg font-extrabold leading-snug" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{product.name}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{product.reason}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold" style={{ color: "oklch(0.45 0.18 255)" }}>
                  View product
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16" style={{ backgroundColor: "oklch(0.96 0.02 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <SectionHeading eyebrow="Decision Support" title={page.decisionTitle} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {page.decisionBlocks.map((block) => {
              const Icon = block.icon || Wrench;
              return (
                <div key={block.title} className="rounded-lg border border-white/80 bg-white p-6 shadow-sm">
                  <Icon size={24} style={{ color: "oklch(0.45 0.18 255)" }} />
                  <h3 className="mt-4 text-lg font-bold" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{block.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{block.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
          <div>
            <SectionHeading eyebrow="Related Guides" title="Build the full fitment path" body="These pages form the first content cluster for vehicle matching, voltage questions, and dealer market selection." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {page.related.map((item) => (
              <Link key={item.href} href={item.href} className="group rounded-lg border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-base font-bold" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold" style={{ color: "oklch(0.45 0.18 255)" }}>
                  Open guide
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[900px] mx-auto px-4 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Common fitment questions" />
          <div className="space-y-4">
            {page.faq.map((item) => (
              <div key={item.question} className="rounded-lg border border-border bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16" style={{ backgroundColor: "oklch(0.22 0.08 248)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "oklch(0.72 0.08 240)", fontFamily: "'Montserrat', sans-serif" }}>
              Compatibility Support
            </p>
            <h2 className="text-2xl lg:text-3xl font-extrabold" style={{ color: "white", fontFamily: "'Montserrat', sans-serif" }}>
              {page.primaryCta.body}
            </h2>
          </div>
          <Link
            href={page.primaryCta.href}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {page.primaryCta.title}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}