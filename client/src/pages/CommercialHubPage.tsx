import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Battery,
  BookOpen,
  Car,
  Check,
  ChevronRight,
  Compass,
  Home,
  Package,
  Shield,
  Truck,
  type LucideIcon,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { localizeBlogAwarePath } from "@/lib/blogPaths";
import { resolveBlogLanguage } from "@/lib/blogData";

const BASE_URL = "https://cooldrivepro.com";

interface HubQuickFact {
  label: string;
  value: string;
}

interface HubCard {
  title: string;
  body: string;
}

interface HubProduct {
  title: string;
  href: string;
  tag: string;
  description: string;
  bullets: string[];
}

interface HubCompareRow {
  label: string;
  left: string;
  right: string;
}

interface HubLink {
  href: string;
  title: string;
  description: string;
}

interface HubFaq {
  question: string;
  answer: string;
}

interface HubPageConfig {
  route: string;
  sectionLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  heroImage: string;
  heroImageAlt: string;
  heroStats: HubQuickFact[];
  signals: string[];
  fitCards: HubCard[];
  recommendedProducts: HubProduct[];
  compareBlock?: {
    title: string;
    subtitle: string;
    leftLabel: string;
    rightLabel: string;
    rows: HubCompareRow[];
  };
  checklistTitle: string;
  checklist: string[];
  faqs: HubFaq[];
  relatedReading: HubLink[];
  nextLinks: HubLink[];
  primaryCta: HubLink;
  secondaryCta: HubLink;
}

const HUB_PAGES: Record<string, HubPageConfig> = {
  "/solutions/semi-truck-parking-ac": {
    route: "/solutions/semi-truck-parking-ac",
    sectionLabel: "Solutions",
    badge: "Semi Truck Use-Case Hub",
    title: "Semi Truck Parking AC",
    subtitle: "24V-ready battery-powered truck cab air conditioner options for sleeper berths, quiet rest breaks, and no-idle compliance.",
    description:
      "This hub is for fleet buyers and owner-operators who need a no-idle truck air conditioner for overnight cooling without engine idling. Start here if your decision depends on sleeper-cab noise, 24V electrical compatibility, or truck-stop anti-idling rules.",
    icon: Truck,
    heroImage: "/images/products/vx3000-split-installation.webp",
    heroImageAlt: "Mini split parking air conditioner installed on a semi truck sleeper cab",
    heroStats: [
      { label: "Typical System", value: "24V sleeper cab" },
      { label: "Primary Goal", value: "Quiet overnight runtime" },
      { label: "Best Matches", value: "VX3000SP, VS02 PRO, V-TH1" },
    ],
    signals: ["Sleeper cabs", "24V DC", "Truck stop quiet hours", "Anti-idling compliance"],
    fitCards: [
      {
        title: "Prioritize berth comfort first",
        body: "Long-haul drivers notice cabin noise, air throw, and temperature stability more than headline BTU claims. Split systems usually win when quiet sleep is the deciding factor.",
      },
      {
        title: "Plan around 24V and overnight amp-hours",
        body: "Semi trucks usually give you the right voltage from day one, but runtime still depends on battery reserve, cable sizing, and whether the truck is resting for eight or ten hours.",
      },
      {
        title: "Choose install format by fleet reality",
        body: "Rooftop units simplify rollout and service training. Mini splits take longer to install but often deliver the better sleeper-cab experience for premium fleets and owner-operators.",
      },
    ],
    recommendedProducts: [
      {
        title: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        tag: "Best For Sleeper Quiet",
        description: "The strongest fit when drivers sleep in the cab and indoor noise matters every night.",
        bullets: [
          "12,000 BTU cooling for larger sleeper spaces",
          "Split layout keeps the indoor unit quieter at rest",
          "Strong fit for premium fleets and owner-operators",
        ],
      },
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Best For Faster Rollout",
        description: "A simpler all-in-one rooftop format for teams that want faster installation and fewer components.",
        bullets: [
          "12V/24V compatibility for mixed vehicle programs",
          "Rooftop all-in-one layout reduces installation complexity",
          "Good match for fleets standardizing on one format",
        ],
      },
      {
        title: "V-TH1 Heating & Cooling Parking AC",
        href: "/products/heating-cooling-ac/",
        tag: "Best For Year-Round Routes",
        description: "Choose this when winter stops and shoulder-season comfort matter as much as summer cooling.",
        bullets: [
          "Dual-mode heating and cooling in one rooftop unit",
          "Useful for mixed-climate or mountain freight lanes",
          "Keeps the spec simple for all-season fleets",
        ],
      },
    ],
    compareBlock: {
      title: "Rooftop or split for a sleeper cab?",
      subtitle: "Most semi-truck buyers narrow the decision to installation speed versus night-time cabin comfort.",
      leftLabel: "Rooftop all-in-one",
      rightLabel: "Mini split system",
      rows: [
        { label: "Install speed", left: "Faster fleet rollout", right: "More involved install" },
        { label: "Indoor noise", left: "Good", right: "Usually quieter" },
        { label: "Best fit", left: "Standardized fleet spec", right: "Premium sleeper comfort" },
        { label: "CoolDrivePro match", left: "VS02 PRO / V-TH1", right: "VX3000SP" },
      ],
    },
    checklistTitle: "Semi-truck buyer checklist",
    checklist: [
      "Confirm whether your rest pattern is nightly sleeper use or short staging breaks.",
      "Check battery reserve and target runtime before choosing a higher-capacity system.",
      "Decide whether rooftop simplicity or lower indoor noise matters more to drivers.",
      "Review anti-idling exposure on your main routes and truck-stop network.",
      "Choose heating capability if the same truck runs winter or mountain lanes.",
      "Standardize wiring and service access if multiple trucks will share the same spec.",
    ],
    faqs: [
      {
        question: "Is 24V support mandatory for a semi-truck parking AC?",
        answer:
          "For most North American sleeper cabs, yes. Semi trucks typically use 24V electrical systems, so your parking AC should either support 24V natively or match the truck's power architecture without extra conversion complexity.",
      },
      {
        question: "When should a fleet choose mini split over rooftop?",
        answer:
          "Choose mini split when driver sleep quality and indoor noise are the priority. Rooftop is usually the better choice when install speed, training simplicity, and parts commonality matter more.",
      },
      {
        question: "Do semi-truck buyers need heating and cooling or cooling only?",
        answer:
          "Cooling only is enough for hot-lane operators. Mixed-climate fleets, mountain routes, or all-season owner-operators usually benefit from a dual-mode option so one system covers more of the calendar.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/best-parking-ac-for-semi-trucks/",
        title: "Best Parking AC for Semi Trucks",
        description: "Use the blog guide for shortlist criteria, then come back here to match that criteria to real products.",
      },
      {
        href: "/blog/no-idle-ac-anti-idling-laws/",
        title: "No-Idle Laws & Anti-Idling Rules",
        description: "See why route compliance and truck-stop policies change the ROI of a semi-truck parking AC.",
      },
      {
        href: "/blog/truck-cab-cooling-without-engine/",
        title: "Cooling a Truck Cab Without Idling",
        description: "Operational planning for long rests, quiet hours, and overnight battery runtime.",
      },
    ],
    nextLinks: [
      {
        href: "/solutions/battery-powered-truck-cab-air-conditioner/",
        title: "Battery-Powered Truck Cab Air Conditioner",
        description: "Go deeper on overnight runtime, battery reserve, and 24V sleeper-cab power planning.",
      },
      {
        href: "/solutions/no-idle-truck-air-conditioner/",
        title: "No-Idle Truck Air Conditioner",
        description: "Move from route compliance and fuel savings into the best fleet-ready no-idle AC branch.",
      },
    ],
    primaryCta: {
      href: "/products/mini-split-ac/",
      title: "See VX3000SP for sleeper cabs",
      description: "Jump straight to the quietest truck-ready option in the lineup.",
    },
    secondaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See VS02 PRO rooftop AC",
      description: "Review the faster all-in-one format for broader fleet rollout.",
    },
  },
  "/solutions/rv-parking-ac": {
    route: "/solutions/rv-parking-ac",
    sectionLabel: "Solutions",
    badge: "RV Use-Case Hub",
    title: "RV Parking AC",
    subtitle: "Off-grid RV air conditioner planning for boondocking, quiet campgrounds, and battery-powered overnight comfort.",
    description:
      "Start here if your RV setup depends on house-battery runtime, low-noise campground operation, or choosing between rooftop simplicity and a quieter split layout for off-grid camping.",
    icon: Home,
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-rv-outdoor-3S7bLnKiixmod8iB5Fjvih.webp",
    heroImageAlt: "RV parked outdoors with a battery-powered parking air conditioner use case",
    heroStats: [
      { label: "Typical System", value: "12V house battery" },
      { label: "Primary Goal", value: "Boondocking comfort" },
      { label: "Best Matches", value: "VS02 PRO, VX3000SP, Nano Max" },
    ],
    signals: ["Boondocking", "Quiet hours", "Solar-ready", "Rooftop space"],
    fitCards: [
      {
        title: "Match the system to your camping pattern",
        body: "Weekend campers can bias toward simpler installs, while full-time or off-grid users benefit more from better noise control and refined overnight temperature stability.",
      },
      {
        title: "Roof space changes the shortlist fast",
        body: "A clean 14x14 cutout and open roof layout favor rooftop systems. If you are protecting roof real estate or optimizing sound inside the cabin, split layouts become more attractive.",
      },
      {
        title: "Battery and solar planning matter more than brochure specs",
        body: "Runtime depends on the full house system. RV buyers should plan around battery reserve, solar input, and whether they need cooling through one night or multiple quiet-hour stops.",
      },
    ],
    recommendedProducts: [
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Best All-Around RV Fit",
        description: "The easiest starting point for many RV owners who want a rooftop install with broad 12V/24V compatibility.",
        bullets: [
          "All-in-one rooftop format keeps the system easy to understand",
          "Good fit for standard RVs, campers, and van conversions",
          "Balanced choice for first-time buyers and retrofit projects",
        ],
      },
      {
        title: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        tag: "Best For Quiet Sleeping",
        description: "A stronger option when indoor noise matters, especially in larger RV builds or full-time travel setups.",
        bullets: [
          "12,000 BTU cooling for larger interior volumes",
          "Split design helps keep the indoor environment quieter",
          "Good match for full-time RVers and premium builds",
        ],
      },
      {
        title: "Nano Max Portable Parking AC",
        href: "/products/nano-max/",
        tag: "Best For Compact Builds",
        description: "Useful when roof space is tight, the vehicle is small, or you need a lighter-duty cooling option for mobile work and short-stay use.",
        bullets: [
          "Compact form factor for tighter footprints",
          "Works well for small rigs and flexible use cases",
          "Strong fit for lighter-duty overnight comfort goals",
        ],
      },
    ],
    compareBlock: {
      title: "What RV buyers usually compare first",
      subtitle: "Most RV selections come down to the tradeoff between easy rooftop installation and the quietest indoor experience.",
      leftLabel: "Rooftop simplicity",
      rightLabel: "Split-system quiet",
      rows: [
        { label: "Installation", left: "Simpler retrofit path", right: "More components to place" },
        { label: "Indoor noise", left: "Good", right: "Usually quieter" },
        { label: "Best fit", left: "General RV retrofits", right: "Full-time or premium builds" },
        { label: "CoolDrivePro match", left: "VS02 PRO", right: "VX3000SP" },
      ],
    },
    checklistTitle: "RV buyer checklist",
    checklist: [
      "Measure available roof space and confirm whether a standard cutout is already present.",
      "Estimate battery runtime for a full night, not just a short rest stop.",
      "Decide whether campground quiet-hour performance is a must-have.",
      "Check if your build prioritizes low roof height or the simplest possible install.",
      "Plan solar and charging support if you boondock frequently.",
      "Choose a compact system if the rig is small and cooling demand is moderate.",
    ],
    faqs: [
      {
        question: "What is the best parking AC format for most RV owners?",
        answer:
          "For many RV buyers, a rooftop all-in-one system is the simplest starting point because installation and service are easier to understand. Split systems are stronger when lower indoor noise is worth the extra install complexity.",
      },
      {
        question: "Can an RV parking AC work for off-grid camping?",
        answer:
          "Yes, if the battery bank and charging plan are sized correctly. Off-grid performance depends on the whole electrical system, including battery capacity, solar contribution, and charging strategy between stops.",
      },
      {
        question: "Should an RV buyer consider a compact unit like Nano Max?",
        answer:
          "Yes, especially for smaller rigs, constrained roof layouts, or lighter-duty overnight cooling goals. It is a practical option when a full-size rooftop or split system would be oversized for the vehicle.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/off-grid-rv-air-conditioning/",
        title: "Off-Grid RV Air Conditioning",
        description: "Battery, solar, and overnight runtime planning for boondocking builds.",
      },
      {
        href: "/blog/rv-air-conditioner-comparison-2025/",
        title: "RV Air Conditioner Comparison",
        description: "Use the comparison article for market context, then return here to pick the best CoolDrivePro path.",
      },
      {
        href: "/blog/rv-ac-vs-portable-ac/",
        title: "RV AC vs Portable AC",
        description: "Helpful when you are deciding between a permanent install and a smaller-footprint cooling option.",
      },
    ],
    nextLinks: [
      {
        href: "/solutions/off-grid-rv-air-conditioner/",
        title: "Off-Grid RV Air Conditioner",
        description: "Go deeper on boondocking runtime, solar assist, and full-night battery planning.",
      },
      {
        href: "/compare/parking-ac-battery-runtime/",
        title: "Open Battery Runtime Guide",
        description: "Check how battery reserve, LiFePO4 sizing, and duty cycle change the best RV setup.",
      },
    ],
    primaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See VS02 PRO for RVs",
      description: "Start with the broadest-fit rooftop option for general RV use.",
    },
    secondaryCta: {
      href: "/products/mini-split-ac/",
      title: "See VX3000SP mini split",
      description: "Move to the quieter split format for larger or full-time builds.",
    },
  },
  "/solutions/van-parking-ac": {
    route: "/solutions/van-parking-ac",
    sectionLabel: "Solutions",
    badge: "Van & Light Truck Hub",
    title: "Parking AC for Vans & Light Trucks",
    subtitle: "Compact 12V/24V cooling for camper vans, pickups, service trucks, and mobile work vehicles.",
    description:
      "Choose this hub when roof space is limited, battery banks are smaller than a heavy truck setup, or the vehicle has to balance work utility with overnight comfort.",
    icon: Car,
    heroImage: "/images/products/nano-max-01.webp",
    heroImageAlt: "Nano Max compact parking air conditioner for vans and light trucks",
    heroStats: [
      { label: "Typical System", value: "12V van or pickup" },
      { label: "Primary Goal", value: "Compact no-idle cooling" },
      { label: "Best Matches", value: "Nano Max, VS02 PRO, V-TH1" },
    ],
    signals: ["Camper vans", "Service trucks", "Pickups", "Tight roof space"],
    fitCards: [
      {
        title: "Compact packaging matters more here",
        body: "Van and light-truck buyers often run out of mounting space before they run out of product options. Prioritize roof real estate, overall profile, and how the system fits around racks or work equipment.",
      },
      {
        title: "Smaller battery banks change the ideal product",
        body: "A lighter-duty vehicle may not carry the same overnight reserve as a sleeper cab or large motorhome. That shifts the value toward compact, efficient systems matched to realistic runtime goals.",
      },
      {
        title: "Think about the workday, not only sleep",
        body: "Mobile trades, service teams, and delivery fleets often need cooling during breaks, loading windows, or parked jobsite time. The best system is the one that fits both the roof and the duty cycle.",
      },
    ],
    recommendedProducts: [
      {
        title: "Nano Max Portable Parking AC",
        href: "/products/nano-max/",
        tag: "Best Compact Fit",
        description: "The first stop for pickups, service bodies, and tighter van builds where packaging is the biggest constraint.",
        bullets: [
          "Compact footprint for smaller vehicle roofs",
          "12V/24V-ready for flexible light-duty applications",
          "Good match for pickups, vans, and mobile work vehicles",
        ],
      },
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Best Full-Size Upgrade",
        description: "Choose this when the vehicle can support a larger rooftop install and you want a broader-capacity all-in-one system.",
        bullets: [
          "Good upgrade path for larger vans and serious camper builds",
          "All-in-one rooftop layout keeps the spec straightforward",
          "Useful when compact units will be undersized for the space",
        ],
      },
      {
        title: "V-TH1 Heating & Cooling Parking AC",
        href: "/products/heating-cooling-ac/",
        tag: "Best For All-Season Work",
        description: "A strong option for service fleets and mobile work vehicles that need one system across hot and cold seasons.",
        bullets: [
          "Dual-mode heating and cooling in one rooftop package",
          "Useful for utility, field service, and shoulder-season work",
          "Reduces the need for separate seasonal climate solutions",
        ],
      },
    ],
    compareBlock: {
      title: "Compact versus full-size vehicle setups",
      subtitle: "Van and light-truck buyers usually choose between footprint efficiency and higher-capacity rooftop coverage.",
      leftLabel: "Compact footprint",
      rightLabel: "Full-size rooftop",
      rows: [
        { label: "Best fit", left: "Pickups, service vans", right: "Larger vans, camper builds" },
        { label: "Packaging priority", left: "Smaller roof footprint", right: "Higher capacity potential" },
        { label: "Duty cycle", left: "Breaks and lighter overnight use", right: "Longer overnight comfort" },
        { label: "CoolDrivePro match", left: "Nano Max", right: "VS02 PRO / V-TH1" },
      ],
    },
    checklistTitle: "Van and light-truck buyer checklist",
    checklist: [
      "Measure roof space around vents, racks, ladders, or work accessories.",
      "Match cooling size to the actual cabin volume and insulation quality.",
      "Verify the battery bank can support the length of your parked duty cycle.",
      "Choose compact packaging if the vehicle doubles as a work platform.",
      "Add heating capability if the same truck or van serves year-round routes.",
      "Keep service access simple if the vehicle supports mobile revenue work.",
    ],
    faqs: [
      {
        question: "What is the best parking AC for a pickup or light truck?",
        answer:
          "Start with the smallest system that still covers the cabin realistically. Light trucks and pickups usually benefit from compact packaging first, then capacity second, which is why Nano Max is the natural starting point.",
      },
      {
        question: "Can a van use the same parking AC strategy as an RV?",
        answer:
          "Sometimes, but vans usually have tighter roof layouts and smaller electrical reserves. Many van builds need a more packaging-efficient solution than a larger motorhome or travel trailer.",
      },
      {
        question: "When should a work vehicle choose heating and cooling together?",
        answer:
          "Pick a dual-mode system when crews, service techs, or mobile operators need one climate solution across hot summers and cold mornings. It simplifies the spec and supports more of the calendar.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/parking-ac-for-camper-van-conversion/",
        title: "Parking AC for Camper Van Conversion",
        description: "Good context for van layouts, battery planning, and smaller-footprint builds.",
      },
      {
        href: "/blog/parking-ac-for-utility-trucks/",
        title: "Parking AC for Utility Trucks",
        description: "Use this to think through workday downtime, jobsite stops, and utility fleet use.",
      },
      {
        href: "/blog/parking-ac-for-mobile-workshops/",
        title: "Parking AC for Mobile Workshops",
        description: "Useful when the vehicle is a revenue-generating workspace, not only a sleeper.",
      },
    ],
    nextLinks: [
      {
        href: "/solutions/camper-van-parking-ac/",
        title: "Camper Van Parking AC",
        description: "Move from a broad van shortlist into camper-van-specific fitment, roof layout, and sleep comfort.",
      },
      {
        href: "/compare/parking-ac-roof-fitment-guide/",
        title: "Parking AC Roof Fitment Guide",
        description: "Check roof openings, racks, and accessory layout before choosing a compact or full-size install.",
      },
    ],
    primaryCta: {
      href: "/products/nano-max/",
      title: "See Nano Max for compact builds",
      description: "Start with the most packaging-efficient option for vans and pickups.",
    },
    secondaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See VS02 PRO rooftop AC",
      description: "Move up to a full-size rooftop option when the vehicle can support it.",
    },
  },
  "/solutions/battery-powered-truck-cab-air-conditioner": {
    route: "/solutions/battery-powered-truck-cab-air-conditioner",
    sectionLabel: "Solutions",
    badge: "Truck Cab Power Hub",
    title: "Battery-Powered Truck Cab Air Conditioner",
    subtitle: "24V sleeper-cab cooling that runs from the battery bank without shore power, generators, or overnight idling.",
    description:
      "Choose this page when the real question is how to cool a truck cab from battery power alone. It focuses on overnight runtime, 24V fitment, sleeper-cab comfort, and which product formats make sense for battery-powered long-haul rest periods.",
    icon: Battery,
    heroImage: "/images/products/vx3000-split-installation.webp",
    heroImageAlt: "Battery-powered truck cab air conditioner installed on a sleeper cab",
    heroStats: [
      { label: "Typical System", value: "24V sleeper battery bank" },
      { label: "Primary Goal", value: "8-10 hour cab cooling" },
      { label: "Best Matches", value: "VX3000SP, VS02 PRO, V-TH1" },
    ],
    signals: ["Battery-powered cooling", "24V sleeper cabs", "Overnight runtime", "No shore power"],
    fitCards: [
      {
        title: "Start with the real rest window",
        body: "A truck stopping for one hour at a dock has a different battery requirement than a sleeper cab cooling through a full legal rest. Define the actual parked runtime first.",
      },
      {
        title: "Battery reserve matters more than headline BTU",
        body: "The strongest truck cab air conditioner on paper is still the wrong choice if the battery bank cannot support it overnight. Capacity, chemistry, and low-voltage protection drive the shortlist.",
      },
      {
        title: "Choose format by comfort and service reality",
        body: "Mini split systems usually win when sleeper-cab quiet matters most. Rooftop systems make more sense when fleets need a simpler install and a more repeatable service process.",
      },
    ],
    recommendedProducts: [
      {
        title: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        tag: "Best For Quiet Sleep",
        description: "The strongest fit when drivers sleep in the cab and want the quietest overnight battery-powered setup.",
        bullets: [
          "12,000 BTU cooling for sleeper cabs and larger interiors",
          "Quieter indoor unit for overnight rest quality",
          "Best match when comfort outweighs install simplicity",
        ],
      },
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Best Balanced 24V Fit",
        description: "A practical battery-powered truck cab AC for fleets and owner-operators that want one straightforward rooftop format.",
        bullets: [
          "12V/24V-ready for mixed retrofit programs",
          "All-in-one rooftop format keeps rollout simpler",
          "Useful when runtime and service simplicity need balance",
        ],
      },
      {
        title: "V-TH1 Heating & Cooling Parking AC",
        href: "/products/heating-cooling-ac/",
        tag: "Best For Mixed Seasons",
        description: "Useful when the same battery-powered truck cab setup must also cover colder stops and shoulder-season routes.",
        bullets: [
          "Heating and cooling in one rooftop package",
          "Strong fit for mixed-climate freight lanes",
          "Keeps one spec working across more of the calendar",
        ],
      },
    ],
    compareBlock: {
      title: "Smaller battery reserve versus full-night reserve",
      subtitle: "This is usually the first real split in battery-powered truck cab AC planning.",
      leftLabel: "300-400Ah style reserve",
      rightLabel: "500Ah+ style reserve",
      rows: [
        { label: "Best use", left: "Breaks or lighter overnight use", right: "Full-night sleeper comfort" },
        { label: "Main priority", left: "Efficiency and compact draw", right: "Comfort and runtime stability" },
        { label: "Likely fit", left: "VS02 PRO / efficient rooftop", right: "VX3000SP / larger-capacity systems" },
        { label: "Planning focus", left: "Current draw and reserve", right: "Cab comfort and long rests" },
      ],
    },
    checklistTitle: "Battery-powered truck cab AC checklist",
    checklist: [
      "Define whether the cab must stay cool for a short stop or a full overnight rest.",
      "Confirm the truck's electrical architecture before comparing models by price.",
      "Size the battery bank for the real duty cycle, not an optimistic brochure claim.",
      "Check low-voltage protection and charging recovery between stops.",
      "Choose mini split when berth quiet matters more than install simplicity.",
      "Use rooftop when service standardization matters more than premium sleeper comfort.",
    ],
    faqs: [
      {
        question: "Can a truck cab air conditioner run only on batteries?",
        answer:
          "Yes, if the vehicle has the right battery reserve and the system is matched to that reserve realistically. Battery-powered truck cab AC setups are common for sleeper cabs that need overnight cooling without engine idling.",
      },
      {
        question: "How much battery do you need for overnight truck cab cooling?",
        answer:
          "It depends on cabin size, ambient temperature, and the chosen AC format. Buyers aiming for a true overnight rest usually need to size the battery bank first and then choose the AC around that runtime target.",
      },
      {
        question: "Is mini split better than rooftop for a battery-powered sleeper cab?",
        answer:
          "Mini split is usually better when indoor noise matters most during sleep. Rooftop can still be the better business choice when fleets want easier rollout, fewer components, and simpler service access.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/truck-cab-cooling-without-engine/",
        title: "Cooling a Truck Cab Without Engine Idling",
        description: "Operational context for battery-powered cooling during long-haul rest periods.",
      },
      {
        href: "/blog/truck-ac-low-voltage-guide/",
        title: "Truck AC Low-Voltage Guide",
        description: "Useful if runtime planning and battery protection are the main blockers.",
      },
      {
        href: "/blog/no-idle-ac-anti-idling-laws/",
        title: "No-Idle AC & Anti-Idling Laws",
        description: "Helpful when compliance is driving the move toward battery-powered truck cab cooling.",
      },
    ],
    nextLinks: [
      {
        href: "/solutions/semi-truck-parking-ac/",
        title: "Semi Truck Parking AC Hub",
        description: "Return to the broader semi-truck buying path once the power architecture is clear.",
      },
      {
        href: "/compare/parking-ac-battery-runtime/",
        title: "Parking AC Battery Runtime Guide",
        description: "Go deeper on overnight reserve, LiFePO4 planning, and realistic battery sizing.",
      },
    ],
    primaryCta: {
      href: "/products/mini-split-ac/",
      title: "See VX3000SP for sleeper cabs",
      description: "Jump to the quieter battery-powered truck cab AC option first.",
    },
    secondaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See VS02 PRO rooftop AC",
      description: "Review the more standardized rooftop format for fleet rollout.",
    },
  },
  "/solutions/no-idle-truck-air-conditioner": {
    route: "/solutions/no-idle-truck-air-conditioner",
    sectionLabel: "Solutions",
    badge: "Compliance & ROI Hub",
    title: "No-Idle Truck Air Conditioner",
    subtitle: "A compliance-first guide for fleets and owner-operators replacing engine-idle cooling with 24V battery-powered cab AC.",
    description:
      "Start here when anti-idling laws, fuel burn, and driver-rest compliance are pushing the buying decision. This page helps buyers compare no-idle truck air conditioner setups by route exposure, installation format, and payback logic.",
    icon: Shield,
    heroImage: "/images/products/vx3000-split-installation.webp",
    heroImageAlt: "No-idle truck air conditioner setup for sleeper-cab compliance",
    heroStats: [
      { label: "Typical System", value: "24V sleeper fleet" },
      { label: "Primary Goal", value: "Idle-free rest compliance" },
      { label: "Best Matches", value: "VS02 PRO, VX3000SP, V-TH1" },
    ],
    signals: ["Anti-idling rules", "Fuel savings", "Driver rest", "Fleet rollout"],
    fitCards: [
      {
        title: "Compliance starts with how trucks actually rest",
        body: "A fleet that idles during every legal rest stop has a different no-idle AC requirement than a truck that only needs dock-side cooling. Match the equipment to the exposure.",
      },
      {
        title: "Payback depends on avoided idle hours",
        body: "The strongest no-idle business case comes from fuel savings, reduced engine wear, and lower compliance risk. Model those three together instead of treating AC as a comfort-only upgrade.",
      },
      {
        title: "Choose format by rollout speed versus driver comfort",
        body: "Rooftop units are often easier to standardize across fleets. Mini split systems become attractive when the cabin doubles as a sleeper and drivers care deeply about overnight quiet.",
      },
    ],
    recommendedProducts: [
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Best For Fast Fleet Rollout",
        description: "A strong no-idle truck AC when standardization, install speed, and service simplicity matter most.",
        bullets: [
          "All-in-one rooftop layout for simpler fleet deployment",
          "12V/24V flexibility across mixed applications",
          "Useful when payback speed matters more than premium cabin quiet",
        ],
      },
      {
        title: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        tag: "Best For Sleeper Comfort",
        description: "Choose this when the no-idle upgrade also needs to improve driver sleep quality during overnight rest.",
        bullets: [
          "Quieter indoor unit for sleeper-cab use",
          "Strong fit for owner-operators and premium fleets",
          "Better when comfort is part of driver-retention strategy",
        ],
      },
      {
        title: "V-TH1 Heating & Cooling Parking AC",
        href: "/products/heating-cooling-ac/",
        tag: "Best For Mixed Seasons",
        description: "Useful when fleets want no-idle compliance in summer but also need heating support during colder route segments.",
        bullets: [
          "Heating and cooling from one rooftop system",
          "Strong for mixed-climate freight operations",
          "Keeps one compliance-ready spec working all year",
        ],
      },
    ],
    compareBlock: {
      title: "Fleet standardization versus premium sleeper comfort",
      subtitle: "Most no-idle truck AC programs narrow the choice to easier rollout or a better overnight cabin experience.",
      leftLabel: "Fast rollout",
      rightLabel: "Premium sleeper comfort",
      rows: [
        { label: "Installation", left: "Simpler rooftop path", right: "More involved split install" },
        { label: "Driver noise", left: "Good", right: "Usually quieter" },
        { label: "Best fit", left: "Large fleet standardization", right: "Premium fleets and owner-operators" },
        { label: "CoolDrivePro match", left: "VS02 PRO / V-TH1", right: "VX3000SP" },
      ],
    },
    checklistTitle: "No-idle truck AC checklist",
    checklist: [
      "Map which routes, truck stops, or terminals expose the fleet to anti-idling rules.",
      "Estimate current idle hours and fuel burn before setting a payback target.",
      "Decide whether one standardized rooftop spec or a comfort-first split spec fits the operation better.",
      "Check battery reserve and charging recovery between legal rest periods.",
      "Plan training and service access if the no-idle rollout covers multiple trucks.",
      "Use mixed-season models when the same fleet faces both hot summers and cold overnight stops.",
    ],
    faqs: [
      {
        question: "Does a no-idle truck air conditioner help with anti-idling compliance?",
        answer:
          "Yes. A no-idle truck air conditioner gives fleets and owner-operators a way to keep the cab comfortable during rest periods without running the engine, which directly supports anti-idling compliance on many routes.",
      },
      {
        question: "How quickly can a no-idle truck AC pay back?",
        answer:
          "Payback depends on idle hours avoided, fuel price, and the size of the fleet. Operators with frequent overnight idling often see the strongest payback because fuel savings and engine-wear reduction compound quickly.",
      },
      {
        question: "What is the best no-idle truck AC format for fleets?",
        answer:
          "Rooftop systems are usually easiest to standardize across fleets. Split systems become the stronger choice when sleeper-cab quiet and driver comfort are important enough to justify the extra installation complexity.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/no-idle-ac-anti-idling-laws/",
        title: "No-Idle AC & Anti-Idling Laws",
        description: "Use the compliance article for route context, then come back here to choose the install branch.",
      },
      {
        href: "/blog/parking-ac-roi-total-cost-ownership/",
        title: "Parking AC ROI & Total Cost of Ownership",
        description: "Helpful when you need to justify the no-idle rollout with savings math.",
      },
      {
        href: "/blog/best-parking-ac-for-semi-trucks/",
        title: "Best Parking AC for Semi Trucks",
        description: "Broader buyer guidance for fleets narrowing the shortlist before product selection.",
      },
    ],
    nextLinks: [
      {
        href: "/solutions/semi-truck-parking-ac/",
        title: "Semi Truck Parking AC Hub",
        description: "Return to the broader truck-cooling shortlist once the compliance angle is clear.",
      },
      {
        href: "/compare/rooftop-vs-mini-split-parking-ac/",
        title: "Compare Rooftop vs Mini Split",
        description: "Go deeper on install speed, sleeper-cab noise, and maintenance tradeoffs.",
      },
    ],
    primaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See VS02 PRO for fleet rollout",
      description: "Start with the most standardized rooftop no-idle option.",
    },
    secondaryCta: {
      href: "/products/mini-split-ac/",
      title: "See VX3000SP for sleeper comfort",
      description: "Move to the quieter split option when driver rest quality matters more.",
    },
  },
  "/solutions/off-grid-rv-air-conditioner": {
    route: "/solutions/off-grid-rv-air-conditioner",
    sectionLabel: "Solutions",
    badge: "Boondocking Power Hub",
    title: "Off-Grid RV Air Conditioner",
    subtitle: "Battery-powered RV cooling for boondocking, solar-charged rigs, and campground quiet hours without generator noise.",
    description:
      "Use this page when the real constraint is off-grid power, not just rooftop fitment. It helps RV owners compare off-grid RV air conditioner options by battery bank size, solar contribution, overnight runtime, and sleep noise.",
    icon: Battery,
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-rv-outdoor-3S7bLnKiixmod8iB5Fjvih.webp",
    heroImageAlt: "Off-grid RV air conditioner setup for battery-powered boondocking",
    heroStats: [
      { label: "Typical System", value: "12V house battery + solar" },
      { label: "Primary Goal", value: "Full-night boondocking comfort" },
      { label: "Best Matches", value: "VS02 PRO, VX3000SP, Nano Max" },
    ],
    signals: ["Boondocking", "Solar assist", "Quiet hours", "House battery runtime"],
    fitCards: [
      {
        title: "Start with the night, not the catalog",
        body: "An off-grid RV air conditioner only works if the battery bank supports the actual quiet-hour window. Define the real overnight target before comparing rooftop and split layouts.",
      },
      {
        title: "Solar helps, but battery reserve is still the foundation",
        body: "Solar can extend runtime and improve recovery between stops, but the overnight result still depends on usable battery capacity and how hard the AC must work in hot weather.",
      },
      {
        title: "Choose format by roof space and sleep quality",
        body: "Rooftop systems are easier to retrofit in many RVs. Split systems become attractive when lower indoor noise and more refined sleeping comfort are worth the extra installation complexity.",
      },
    ],
    recommendedProducts: [
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Best All-Around Off-Grid Fit",
        description: "A practical off-grid RV air conditioner for owners who want a straightforward rooftop install with broad 12V/24V compatibility.",
        bullets: [
          "Balanced rooftop option for many RV retrofits",
          "Easy starting point for boondocking builds",
          "Works well with serious lithium battery planning",
        ],
      },
      {
        title: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        tag: "Best For Quiet Sleeping",
        description: "A stronger fit for larger rigs and full-time RVers who want the quietest overnight interior possible.",
        bullets: [
          "Quieter indoor environment for sleep-focused builds",
          "12,000 BTU cooling for larger RV interiors",
          "Best when comfort justifies the more involved install",
        ],
      },
      {
        title: "Nano Max Portable Parking AC",
        href: "/products/nano-max/",
        tag: "Best For Compact Rigs",
        description: "A good fit when the RV is small, the roof is crowded, or the goal is lighter-duty overnight comfort.",
        bullets: [
          "Compact footprint for smaller off-grid builds",
          "Useful when roof space is the main limiter",
          "Strong match for moderate overnight cooling goals",
        ],
      },
    ],
    compareBlock: {
      title: "Weekend battery bank versus full-time battery bank",
      subtitle: "This is often the key split in off-grid RV air conditioner planning.",
      leftLabel: "200-300Ah style setup",
      rightLabel: "400-600Ah style setup",
      rows: [
        { label: "Typical use", left: "Weekend boondocking", right: "Full-time or long off-grid stops" },
        { label: "Best target", left: "Moderate overnight comfort", right: "Full-night cooling confidence" },
        { label: "Common fit", left: "Nano Max / efficient rooftop", right: "VS02 PRO / VX3000SP" },
        { label: "Planning focus", left: "Efficiency and roof space", right: "Reserve capacity and comfort" },
      ],
    },
    checklistTitle: "Off-grid RV air conditioner checklist",
    checklist: [
      "Set the real quiet-hour or overnight runtime target before comparing products.",
      "Check usable battery capacity, not just battery nameplate size.",
      "Estimate how much solar recovery is realistic between parked sessions.",
      "Choose rooftop when install simplicity matters more than the quietest indoor experience.",
      "Choose split when low indoor noise is worth more installation effort.",
      "Use compact systems when roof space and battery reserve are both limited.",
    ],
    faqs: [
      {
        question: "Can an off-grid RV air conditioner run all night?",
        answer:
          "Yes, if the battery bank, charging plan, and AC size are matched realistically. Off-grid overnight cooling depends on the full electrical system, not only the air conditioner itself.",
      },
      {
        question: "How much battery and solar do you need for an off-grid RV air conditioner?",
        answer:
          "That depends on ambient heat, cabin size, and runtime goals. In practice, buyers should size the battery bank first and then treat solar as recovery support rather than a guaranteed substitute for reserve capacity.",
      },
      {
        question: "Should RV owners choose rooftop or mini split for off-grid camping?",
        answer:
          "Rooftop is usually the easier retrofit path. Mini split becomes attractive when quieter indoor sleeping conditions are worth the additional install complexity and component placement.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/off-grid-rv-air-conditioning/",
        title: "Off-Grid RV Air Conditioning",
        description: "Battery, solar, and overnight runtime context for boondocking builds.",
      },
      {
        href: "/blog/lifepo4-battery-parking-ac/",
        title: "LiFePO4 Battery Planning",
        description: "Helpful when the next question is usable reserve and overnight stability.",
      },
      {
        href: "/blog/rv-ac-vs-portable-ac/",
        title: "RV AC vs Portable AC",
        description: "Useful when you are deciding between a permanent install and a smaller-footprint cooling path.",
      },
    ],
    nextLinks: [
      {
        href: "/solutions/rv-parking-ac/",
        title: "RV Parking AC Hub",
        description: "Return to the broader RV buying path after the off-grid power branch is clear.",
      },
      {
        href: "/compare/parking-ac-battery-runtime/",
        title: "Parking AC Battery Runtime Guide",
        description: "Go deeper on LiFePO4 sizing, overnight reserve, and realistic runtime targets.",
      },
    ],
    primaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See VS02 PRO for boondocking",
      description: "Start with the broadest-fit off-grid rooftop option.",
    },
    secondaryCta: {
      href: "/compare/rooftop-vs-mini-split-parking-ac/",
      title: "Compare rooftop vs mini split",
      description: "Choose the right format before committing to an off-grid build path.",
    },
  },
  "/solutions/camper-van-parking-ac": {
    route: "/solutions/camper-van-parking-ac",
    sectionLabel: "Solutions",
    badge: "Camper Van Conversion Hub",
    title: "Camper Van Parking AC",
    subtitle: "Compact 12V/24V no-idle cooling for camper van builds where roof space, battery reserve, and sleeping noise all compete.",
    description:
      "Choose this page when the vehicle is a Sprinter, Transit, ProMaster, or similar van conversion and every inch of roof space matters. It helps compare camper van parking AC options by profile, fitment, house-battery runtime, and overnight comfort.",
    icon: Car,
    heroImage: "/images/products/nano-max-01.webp",
    heroImageAlt: "Camper van parking AC setup for compact van conversions",
    heroStats: [
      { label: "Typical System", value: "12V van house battery" },
      { label: "Primary Goal", value: "Compact overnight cooling" },
      { label: "Best Matches", value: "Nano Max, VS02 PRO, VX3000SP" },
    ],
    signals: ["Van conversions", "Tight roofs", "Roof racks", "House batteries"],
    fitCards: [
      {
        title: "Roof layout is the first filter",
        body: "Fan housings, solar panels, racks, and roof vents often decide the camper van AC shortlist before BTU claims do. Measure the roof and map the layout early.",
      },
      {
        title: "Compact packaging protects build flexibility",
        body: "In many van conversions, the best camper van parking AC is not the largest one. A compact system can leave room for solar, storage, and a cleaner overall roof profile.",
      },
      {
        title: "Split systems pay off when sleep quality matters most",
        body: "A mini split becomes attractive when lower indoor noise is worth the extra install effort. Many camper van buyers still choose rooftop for easier fitment and service access.",
      },
    ],
    recommendedProducts: [
      {
        title: "Nano Max Portable Parking AC",
        href: "/products/nano-max/",
        tag: "Best Compact Van Fit",
        description: "The first stop for camper van builds where tight packaging, lighter battery banks, and smaller roof footprints drive the decision.",
        bullets: [
          "Compact footprint for tighter van roofs",
          "Good match for Sprinter, Transit, and similar builds",
          "Useful when the roof must also support fans, racks, or solar",
        ],
      },
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Best Full-Size Rooftop Option",
        description: "A good next step when the van can support a larger rooftop system and the goal is more all-around overnight coverage.",
        bullets: [
          "Straightforward rooftop layout for van retrofits",
          "Balanced fit for larger conversions",
          "Works well when a compact unit would be undersized",
        ],
      },
      {
        title: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        tag: "Best For Quiet Sleep",
        description: "Choose this when the camper van build prioritizes the quietest sleeping environment and can accept a more involved install.",
        bullets: [
          "Quieter indoor environment for full-time van life",
          "Strong fit for premium or longer-wheelbase builds",
          "Best when comfort is worth the extra installation scope",
        ],
      },
    ],
    compareBlock: {
      title: "Compact footprint versus premium sleep setup",
      subtitle: "This is the tradeoff most camper van parking AC buyers face first.",
      leftLabel: "Compact rooftop path",
      rightLabel: "Premium quiet-sleep path",
      rows: [
        { label: "Roof impact", left: "Smaller footprint", right: "More install planning" },
        { label: "Indoor noise", left: "Good", right: "Usually quieter" },
        { label: "Best fit", left: "Tight layouts and mixed roof gear", right: "Sleep-focused premium builds" },
        { label: "CoolDrivePro match", left: "Nano Max / VS02 PRO", right: "VX3000SP" },
      ],
    },
    checklistTitle: "Camper van parking AC checklist",
    checklist: [
      "Map fans, skylights, racks, and solar panels before picking a model.",
      "Confirm cutout size and total available roof area, not just one opening.",
      "Size the house battery for the real overnight comfort target.",
      "Choose compact packaging if the van must balance sleep, work, and storage.",
      "Choose mini split only if the build can absorb the extra install complexity.",
      "Keep service access simple if the van travels far from the original installer.",
    ],
    faqs: [
      {
        question: "What is the best camper van parking AC format?",
        answer:
          "For many van builds, a compact rooftop system is the best starting point because roof space and battery reserve are both limited. Mini split becomes the stronger option when quieter sleeping conditions are worth the extra install complexity.",
      },
      {
        question: "Can a camper van use a rooftop RV-style parking AC?",
        answer:
          "Yes, if the roof layout, cutout size, and battery system support it. Many van conversions use rooftop parking AC successfully, but the shortlist changes quickly if the roof already carries racks, fans, or solar panels.",
      },
      {
        question: "When should a camper van buyer choose a mini split?",
        answer:
          "Choose mini split when low indoor noise and premium sleep comfort are the priority and the build can accommodate the extra components and installation work.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/parking-ac-for-camper-van-conversion/",
        title: "Parking AC for Camper Van Conversion",
        description: "Use the blog guide for conversion context, then return here to choose the best format.",
      },
      {
        href: "/blog/parking-ac-for-overland-vehicles/",
        title: "Parking AC for Overland Vehicles",
        description: "Helpful when the build needs to balance compact packaging with rough-road practicality.",
      },
      {
        href: "/blog/top-mounted-ac-installation-tips/",
        title: "Top-Mounted AC Installation Tips",
        description: "Useful when the shortlist is already leaning toward a rooftop camper van install.",
      },
    ],
    nextLinks: [
      {
        href: "/solutions/van-parking-ac/",
        title: "Van & Light Truck Parking AC Hub",
        description: "Return to the broader van and work-vehicle shortlist after the camper-van branch is clear.",
      },
      {
        href: "/compare/parking-ac-roof-fitment-guide/",
        title: "Parking AC Roof Fitment Guide",
        description: "Check roof openings, layout constraints, and install-readiness before you commit.",
      },
    ],
    primaryCta: {
      href: "/products/nano-max/",
      title: "See Nano Max for compact vans",
      description: "Start with the most packaging-efficient camper van option.",
    },
    secondaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See VS02 PRO rooftop AC",
      description: "Move up to a full-size rooftop option when the van can support it.",
    },
  },
  "/compare/12v-vs-24v-parking-ac": {
    route: "/compare/12v-vs-24v-parking-ac",
    sectionLabel: "Compare",
    badge: "Voltage Comparison Hub",
    title: "12V vs 24V Parking AC",
    subtitle: "Match the system to the vehicle's electrical architecture before you compare brands or BTU ratings.",
    description:
      "This page helps buyers move from a generic voltage question to a practical shortlist. Use it to understand which vehicles typically run 12V or 24V, what that means for current draw and wiring, and which CoolDrivePro systems fit each side best.",
    icon: Battery,
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-rv-outdoor-3S7bLnKiixmod8iB5Fjvih.webp",
    heroImageAlt: "Battery-powered parking air conditioner power planning for 12V and 24V systems",
    heroStats: [
      { label: "12V Common In", value: "RVs, vans, pickups" },
      { label: "24V Common In", value: "Semi trucks, fleets" },
      { label: "Main Decision", value: "Vehicle architecture first" },
    ],
    signals: ["Electrical system", "Current draw", "Cable sizing", "Battery planning"],
    fitCards: [
      {
        title: "Voltage is a vehicle question first",
        body: "In most cases you do not choose 12V or 24V in the abstract. The right answer starts with the platform you already own and the electrical system it uses every day.",
      },
      {
        title: "Higher voltage reduces current at the same power",
        body: "That matters for heavy commercial vehicles because lower current can simplify cable heating and distribution. It is one reason 24V is common in semi trucks and other larger platforms.",
      },
      {
        title: "Use voltage to narrow the shortlist, not finish it",
        body: "Once voltage is clear, the next decision is still format: rooftop, mini split, compact fit, or dual-mode. Voltage only gets you to the correct branch of the tree.",
      },
    ],
    recommendedProducts: [
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Flexible 12V/24V Fit",
        description: "A strong crossover option when buyers want one product that covers multiple vehicle classes.",
        bullets: [
          "Useful across RV, van, and some commercial applications",
          "Simplifies the shortlist when voltage flexibility matters",
          "Good first stop for mixed-use fleets or retrofit buyers",
        ],
      },
      {
        title: "Nano Max Portable Parking AC",
        href: "/products/nano-max/",
        tag: "Best Compact 12V-Oriented Choice",
        description: "A natural fit for lighter vehicles where compact packaging and realistic overnight goals matter most.",
        bullets: [
          "Strong for pickups, vans, and lighter-duty platforms",
          "Keeps packaging tight where 12V systems dominate",
          "Useful when roof space matters as much as voltage match",
        ],
      },
      {
        title: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        tag: "Best Heavy-Duty Comfort Fit",
        description: "Best suited to sleeper-cab buyers who already know they are operating in a heavier-duty 24V-style environment.",
        bullets: [
          "Strong match for semi trucks and larger vehicle interiors",
          "Useful when quiet overnight operation is critical",
          "Pairs well with serious long-haul runtime planning",
        ],
      },
    ],
    compareBlock: {
      title: "12V and 24V side by side",
      subtitle: "Use this table to align vehicle class, wiring expectations, and product fit before you go deeper into install details.",
      leftLabel: "12V systems",
      rightLabel: "24V systems",
      rows: [
        { label: "Typical vehicles", left: "RVs, vans, pickups", right: "Semi trucks, heavier fleets" },
        { label: "Current draw", left: "Higher at same wattage", right: "Lower at same wattage" },
        { label: "Common priority", left: "Compact retrofits", right: "Long-haul durability" },
        { label: "CoolDrivePro match", left: "Nano Max / VS02 PRO", right: "VX3000SP / V-TH1 / VS02 PRO" },
      ],
    },
    checklistTitle: "Voltage decision checklist",
    checklist: [
      "Confirm the vehicle's native electrical system before shopping by BTU or price.",
      "Check whether the buyer needs one model across multiple vehicle types.",
      "Consider cable runs, current draw, and battery reserve for overnight use.",
      "Choose compact packaging when 12V light-duty vehicles are roof-space limited.",
      "Bias toward heavy-duty comfort and durability when the platform is a 24V sleeper cab.",
      "After voltage, move immediately to format comparison instead of stopping at the power spec.",
    ],
    faqs: [
      {
        question: "Is 24V always better than 12V for parking AC?",
        answer:
          "No. It is better only when it matches the vehicle's electrical system and operating requirements. A 12V RV or van should not be forced into a 24V-first buying process just because higher voltage sounds more industrial.",
      },
      {
        question: "Can one parking AC cover both 12V and 24V vehicles?",
        answer:
          "Yes, some systems support both. That is useful for mixed fleets, buyers managing multiple vehicle types, or retrofit programs that need more flexibility from one catalog.",
      },
      {
        question: "What should buyers compare after voltage is decided?",
        answer:
          "The next comparison is usually system format, battery runtime expectations, and whether the vehicle needs compact packaging, lower cabin noise, or dual-mode heating and cooling.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/12v-vs-24v-parking-ac/",
        title: "12V vs 24V Parking AC Blog Guide",
        description: "Supporting context on voltage, battery planning, and common vehicle patterns.",
      },
      {
        href: "/blog/truck-ac-low-voltage-guide/",
        title: "Low-Voltage Guide for Truck AC",
        description: "Useful if you are diagnosing power limitations or planning battery protection.",
      },
      {
        href: "/blog/lifepo4-battery-parking-ac/",
        title: "LiFePO4 Battery Planning",
        description: "Helpful when voltage is already clear and the next question is runtime.",
      },
    ],
    nextLinks: [
      {
        href: "/solutions/semi-truck-parking-ac/",
        title: "Semi Truck Parking AC Hub",
        description: "Move from electrical compatibility into sleeper-cab-specific product selection.",
      },
      {
        href: "/solutions/van-parking-ac/",
        title: "Van & Light Truck Hub",
        description: "See how lighter-duty packaging and roof constraints change the right choice.",
      },
    ],
    primaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See flexible 12V/24V models",
      description: "Start with a product line that works across more than one vehicle class.",
    },
    secondaryCta: {
      href: "/compare/rooftop-vs-mini-split-parking-ac/",
      title: "Compare format next",
      description: "After voltage, the next big decision is usually rooftop versus split.",
    },
  },
  "/compare/rooftop-vs-mini-split-parking-ac": {
    route: "/compare/rooftop-vs-mini-split-parking-ac",
    sectionLabel: "Compare",
    badge: "Format Comparison Hub",
    title: "Rooftop vs Mini Split Parking AC",
    subtitle: "Compare installation effort, night-time noise, and service layout before choosing a system format.",
    description:
      "This page is for buyers who already know they need a parking AC and now have to choose the right layout. Use it to compare all-in-one rooftop simplicity against the quieter indoor experience of a split system.",
    icon: Compass,
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/hero-product-right_1b53506e.webp",
    heroImageAlt: "Rooftop parking air conditioner format comparison image",
    heroStats: [
      { label: "Rooftop Wins On", value: "Simplicity" },
      { label: "Mini Split Wins On", value: "Indoor quiet" },
      { label: "Main Decision", value: "Install vs comfort" },
    ],
    signals: ["Installation effort", "Cabin noise", "Service access", "Vehicle layout"],
    fitCards: [
      {
        title: "Rooftop is the cleaner retrofit story",
        body: "All-in-one rooftop systems reduce the number of major components and are often easier to explain, install, and standardize across similar vehicles.",
      },
      {
        title: "Mini split is usually better for sleepers",
        body: "When the buyer will sleep near the indoor unit for long periods, the quieter indoor experience of a split system becomes a real competitive advantage.",
      },
      {
        title: "Vehicle layout determines how much the difference matters",
        body: "A large sleeper cab or premium RV gets more benefit from the quieter split layout. Compact or repeatable retrofits often gain more from rooftop simplicity.",
      },
    ],
    recommendedProducts: [
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Best Rooftop Benchmark",
        description: "Start here if you want the all-in-one format with the simplest explanation and a broad fit across trucks, RVs, and vans.",
        bullets: [
          "Straightforward rooftop layout",
          "Strong first option for retrofit buyers",
          "Good fit when service simplicity matters",
        ],
      },
      {
        title: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        tag: "Best Split-System Benchmark",
        description: "Use this as the reference point for buyers optimizing sleeper-cab comfort and lower night-time noise.",
        bullets: [
          "Quieter indoor experience for overnight rest",
          "Strong fit for semi trucks and larger cabins",
          "Useful when premium comfort justifies the install complexity",
        ],
      },
      {
        title: "V-TH1 Heating & Cooling Parking AC",
        href: "/products/heating-cooling-ac/",
        tag: "Best Rooftop Dual-Mode Option",
        description: "Choose this when you already want rooftop simplicity but need heating and cooling in the same spec.",
        bullets: [
          "Adds year-round climate coverage to the rooftop branch",
          "Useful for mixed-climate fleets and utility vehicles",
          "Lets buyers keep the simple rooftop format without giving up heat",
        ],
      },
    ],
    compareBlock: {
      title: "Rooftop and mini split side by side",
      subtitle: "These are the tradeoffs most often discussed before a buyer clicks into a specific product page.",
      leftLabel: "Rooftop all-in-one",
      rightLabel: "Mini split system",
      rows: [
        { label: "Installation", left: "Simpler overall", right: "More involved" },
        { label: "Indoor noise", left: "Good", right: "Usually quieter" },
        { label: "Best fit", left: "General retrofits", right: "Sleep-focused cabins" },
        { label: "Maintenance layout", left: "Fewer main components", right: "Separated indoor/outdoor components" },
        { label: "CoolDrivePro match", left: "VS02 PRO / V-TH1", right: "VX3000SP" },
      ],
    },
    checklistTitle: "Format comparison checklist",
    checklist: [
      "Choose rooftop if installation speed and service simplicity are the top priorities.",
      "Choose mini split if the buyer will regularly sleep in the vehicle and noise matters.",
      "Check available mounting space before assuming both formats are equally viable.",
      "Use rooftop when you need one repeatable spec across many similar vehicles.",
      "Use split when the premium comfort gain justifies a more involved install.",
      "Add heating capability if you already know the rooftop branch is the right one.",
    ],
    faqs: [
      {
        question: "Is rooftop or mini split better for an RV?",
        answer:
          "For many RV buyers, rooftop is the easier retrofit path. Mini split becomes attractive when lower indoor noise and a more refined sleeping environment are worth the extra installation effort.",
      },
      {
        question: "Is mini split usually better for semi trucks?",
        answer:
          "It is often the better sleeper-cab comfort choice because the indoor experience is quieter. Rooftop can still be the better business decision when fleets prioritize faster rollout and simpler service.",
      },
      {
        question: "Where does a dual-mode system fit in this comparison?",
        answer:
          "Dual-mode is part of the rooftop branch. It is the right move when you already want the all-in-one rooftop layout but also need heating for shoulder season or colder routes.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/mini-split-vs-rooftop-rv-ac/",
        title: "Mini Split vs Rooftop RV AC",
        description: "Article-level context for this exact comparison from the RV angle.",
      },
      {
        href: "/blog/rv-air-conditioner-comparison-2025/",
        title: "RV AC Comparison 2025",
        description: "A broader landscape view before returning here to make the format call.",
      },
      {
        href: "/blog/best-parking-ac-for-semi-trucks/",
        title: "Best Parking AC for Semi Trucks",
        description: "Useful when the split-versus-rooftop decision is happening in a sleeper-cab context.",
      },
    ],
    nextLinks: [
      {
        href: "/solutions/rv-parking-ac/",
        title: "RV Parking AC Hub",
        description: "Move from format comparison into RV-specific fitment and runtime advice.",
      },
      {
        href: "/solutions/semi-truck-parking-ac/",
        title: "Semi Truck Parking AC Hub",
        description: "See how the same format tradeoffs play out for sleeper cabs and long-haul routes.",
      },
    ],
    primaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See rooftop benchmark",
      description: "Review the main all-in-one rooftop option first.",
    },
    secondaryCta: {
      href: "/products/mini-split-ac/",
      title: "See mini split benchmark",
      description: "Jump to the quieter split-system option for sleeper-focused comfort.",
    },
  },
  "/compare/parking-ac-battery-runtime": {
    route: "/compare/parking-ac-battery-runtime",
    sectionLabel: "Compare",
    badge: "Battery Runtime Hub",
    title: "Parking AC Battery Runtime Guide",
    subtitle: "Estimate the battery reserve you need before you choose a product by BTU, price, or vehicle type.",
    description:
      "Use this page when the real buying question is not just which parking AC to buy, but how long it will run on your battery system. It helps buyers move from vague runtime claims into realistic battery-bank planning for overnight use.",
    icon: Battery,
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-rv-outdoor-3S7bLnKiixmod8iB5Fjvih.webp",
    heroImageAlt: "Battery-powered parking air conditioner runtime planning for overnight vehicle cooling",
    heroStats: [
      { label: "Typical Goal", value: "6-10 hours overnight" },
      { label: "Battery Focus", value: "LiFePO4 200-600Ah" },
      { label: "Best Matches", value: "Nano Max, VS02 PRO, VX3000SP" },
    ],
    signals: ["Overnight runtime", "LiFePO4", "Solar assist", "Low-voltage cutoff"],
    fitCards: [
      {
        title: "Runtime starts with the duty cycle, not the brochure",
        body: "A parked vehicle that needs spot cooling during breaks has a very different battery requirement than a sleeper cab or RV that must stay cool all night. Runtime planning should start with the real use window.",
      },
      {
        title: "Battery chemistry changes the whole buying path",
        body: "LiFePO4 gives buyers more usable capacity and more predictable overnight performance than older lead-acid setups. The same AC can feel undersized or overpowered depending on the bank behind it.",
      },
      {
        title: "A smaller AC on the right battery bank often wins",
        body: "Many buyers assume they need the biggest system first. In practice, matching vehicle size, battery reserve, and runtime expectations often produces a better result than simply buying the highest-capacity unit.",
      },
    ],
    recommendedProducts: [
      {
        title: "Nano Max Portable Parking AC",
        href: "/products/nano-max/",
        tag: "Best For Smaller Banks",
        description: "The cleanest fit when compact vehicles, smaller battery reserves, or lighter-duty overnight goals are driving the purchase.",
        bullets: [
          "Strong for pickups, vans, and compact overnight setups",
          "Good match for tighter battery reserves and packaging limits",
          "Useful when runtime matters more than maximum cabin volume",
        ],
      },
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Best Balanced Runtime Fit",
        description: "A good middle path for buyers who want broader vehicle compatibility and realistic full-night runtime planning.",
        bullets: [
          "Balanced choice for RVs, vans, and mixed-use retrofits",
          "Works well when paired with serious lithium battery planning",
          "Useful when buyers need one model across multiple vehicle types",
        ],
      },
      {
        title: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        tag: "Best With Larger Reserve",
        description: "Choose this when the cabin is larger and the battery bank is sized to support more demanding overnight comfort targets.",
        bullets: [
          "Best for sleeper cabs and larger interior volumes",
          "Makes the most sense with a larger, well-planned battery bank",
          "Strong fit when quiet overnight comfort is the top priority",
        ],
      },
    ],
    compareBlock: {
      title: "Smaller battery bank vs full-night battery bank",
      subtitle: "This is the split most buyers need to understand before they assume every parking AC can deliver the same overnight result.",
      leftLabel: "200-300Ah style setup",
      rightLabel: "400-600Ah style setup",
      rows: [
        { label: "Typical vehicles", left: "Pickups, vans, compact RVs", right: "Sleeper cabs, larger RVs" },
        { label: "Best runtime target", left: "Breaks or lighter overnight use", right: "Full-night comfort" },
        { label: "Common fit", left: "Nano Max / lighter rooftop plans", right: "VS02 PRO / VX3000SP" },
        { label: "Planning focus", left: "Efficiency and compact sizing", right: "Reserve capacity and comfort" },
      ],
    },
    checklistTitle: "Battery runtime checklist",
    checklist: [
      "Define whether the AC must cool for short parked breaks or a full overnight sleep window.",
      "Confirm battery chemistry and usable capacity before selecting the product.",
      "Estimate how hot the vehicle gets at rest, since high ambient heat changes duty cycle.",
      "Check whether solar or alternator charging meaningfully extends parked runtime.",
      "Make low-voltage protection part of the buying decision, not an afterthought.",
      "Choose the smallest system that can still meet the real runtime target for the cabin volume.",
    ],
    faqs: [
      {
        question: "How much battery do you need to run a parking AC overnight?",
        answer:
          "It depends on cabin size, ambient temperature, battery chemistry, and the system format. In practice, buyers aiming for true overnight runtime usually need to size the battery bank first and then choose the AC that fits that reserve realistically.",
      },
      {
        question: "Why does LiFePO4 matter so much for parking AC runtime?",
        answer:
          "LiFePO4 usually gives more usable depth of discharge, more stable voltage, and better repeatable overnight performance than many lead-acid setups. That makes runtime planning more predictable.",
      },
      {
        question: "Should buyers choose a smaller AC for better runtime?",
        answer:
          "Often, yes. If the cabin is compact, a smaller or more efficient system on the right battery bank can outperform a larger system that drains the bank too aggressively for the use case.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/lifepo4-battery-parking-ac/",
        title: "LiFePO4 Battery Planning",
        description: "Use the battery article for chemistry and reserve context, then return here to choose the product path.",
      },
      {
        href: "/blog/truck-ac-low-voltage-guide/",
        title: "Truck AC Low-Voltage Guide",
        description: "Helpful if runtime planning and undervoltage protection are the main blockers.",
      },
      {
        href: "/blog/parking-ac-wiring-guide/",
        title: "Parking AC Wiring Guide",
        description: "Useful when battery runtime questions overlap with cable sizing and install planning.",
      },
    ],
    nextLinks: [
      {
        href: "/compare/12v-vs-24v-parking-ac/",
        title: "Compare 12V vs 24V",
        description: "Move next into electrical architecture if voltage is still undecided.",
      },
      {
        href: "/solutions/rv-parking-ac/",
        title: "RV Parking AC Hub",
        description: "Use the RV path if runtime planning is happening in a boondocking or campground context.",
      },
    ],
    primaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See balanced overnight options",
      description: "Start with a rooftop model that fits a wide range of runtime plans.",
    },
    secondaryCta: {
      href: "/products/nano-max/",
      title: "See compact runtime-first options",
      description: "Use the lighter-duty branch when battery reserve is the real constraint.",
    },
  },
  "/compare/cooling-only-vs-heating-cooling-parking-ac": {
    route: "/compare/cooling-only-vs-heating-cooling-parking-ac",
    sectionLabel: "Compare",
    badge: "Climate Strategy Hub",
    title: "Cooling-Only vs Heating & Cooling Parking AC",
    subtitle: "Choose the right climate-control strategy for hot lanes, mixed seasons, and year-round vehicle use.",
    description:
      "This page helps buyers decide whether they only need summer cooling or whether a dual-mode system is worth the higher spec. It is most useful for fleets and owner-operators covering mixed climates across the calendar.",
    icon: Shield,
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-outdoor-top_55c3c0af.webp",
    heroImageAlt: "Dual-mode heating and cooling parking air conditioner for year-round vehicle climate control",
    heroStats: [
      { label: "Cooling-Only Fit", value: "Hot weather routes" },
      { label: "Dual-Mode Fit", value: "Mixed climates" },
      { label: "Best Matches", value: "VS02 PRO, VX3000SP, V-TH1" },
    ],
    signals: ["Mixed climates", "Winter routes", "Shoulder season", "One-spec fleets"],
    fitCards: [
      {
        title: "Cooling-only keeps the buying story simple",
        body: "If the vehicle mostly runs in hot climates and the main job is overnight cooling, a cooling-only system is often the cleaner and lower-risk choice. It simplifies both the product decision and service expectations.",
      },
      {
        title: "Dual-mode is valuable when the same vehicle works year-round",
        body: "Mixed-climate routes, utility fleets, and owner-operators who travel across seasons often get more value from one system that handles both heat and cooling instead of solving winter separately.",
      },
      {
        title: "Route map decides more than specs do",
        body: "A buyer running Texas to Arizona does not need the same answer as one running the Midwest through winter. The right climate branch comes from route pattern first, then from product features.",
      },
    ],
    recommendedProducts: [
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Best Cooling-Only Rooftop",
        description: "A strong choice when buyers want a straightforward rooftop cooling system without adding year-round heating requirements.",
        bullets: [
          "Simpler rooftop cooling path for broad vehicle fitment",
          "Good for hot-weather fleets and general retrofits",
          "Useful when route climate is mostly summer-focused",
        ],
      },
      {
        title: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        tag: "Best Cooling-Only Quiet Option",
        description: "Use this when buyers still want cooling-only, but lower night-time cabin noise is worth choosing the split format.",
        bullets: [
          "Stronger sleeper-cab comfort for overnight rest",
          "Good when cabin quiet is more important than install simplicity",
          "Best paired with buyers who do not need integrated heating",
        ],
      },
      {
        title: "V-TH1 Heating & Cooling Parking AC",
        href: "/products/heating-cooling-ac/",
        tag: "Best Dual-Mode Option",
        description: "Choose this when one rooftop spec must handle both summer cooling and meaningful shoulder-season or winter heating needs.",
        bullets: [
          "Adds heating without leaving the rooftop format",
          "Strong fit for all-season utility and freight use",
          "Useful when climate swings make cooling-only too narrow",
        ],
      },
    ],
    compareBlock: {
      title: "Cooling-only versus heating and cooling",
      subtitle: "This is usually not a performance argument. It is a route-planning and climate-coverage decision.",
      leftLabel: "Cooling-only",
      rightLabel: "Heating + cooling",
      rows: [
        { label: "Best fit", left: "Hot weather operations", right: "Mixed-climate or year-round operations" },
        { label: "Buying priority", left: "Simplicity and cooling value", right: "Broader climate coverage" },
        { label: "Common vehicles", left: "RVs, vans, summer fleets", right: "Trucks, service fleets, utility vehicles" },
        { label: "CoolDrivePro match", left: "VS02 PRO / VX3000SP", right: "V-TH1" },
      ],
    },
    checklistTitle: "Climate strategy checklist",
    checklist: [
      "Map the real route climate before deciding whether heating is necessary.",
      "Check whether the same vehicle operates across winter and shoulder seasons.",
      "Use cooling-only when the objective is summer comfort with minimum complexity.",
      "Use dual-mode when one spec must support more of the year without extra equipment.",
      "Make sure battery and runtime planning still support the chosen climate branch.",
      "Compare rooftop simplicity versus split-system quiet only after climate coverage is settled.",
    ],
    faqs: [
      {
        question: "When is cooling-only the better parking AC strategy?",
        answer:
          "Cooling-only is usually best when the vehicle mainly operates in hot climates and the buyer wants the simplest, most focused solution for summer comfort and overnight rest.",
      },
      {
        question: "When is a heating-and-cooling parking AC worth it?",
        answer:
          "It is worth it when the same vehicle works across hot and cold seasons, especially in freight, utility, or service contexts where one system needs to cover more of the calendar.",
      },
      {
        question: "Does dual-mode automatically replace the need for better route planning?",
        answer:
          "No. Dual-mode broadens climate coverage, but buyers still need to understand runtime, battery reserve, and whether the vehicle layout and duty cycle support the chosen system.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/parking-ac-buying-guide-2025/",
        title: "Parking AC Buying Guide",
        description: "Use the general buying guide for selection criteria, then return here to settle the climate branch.",
      },
      {
        href: "/blog/parking-ac-in-extreme-heat/",
        title: "Parking AC in Extreme Heat",
        description: "Helpful when the operation is cooling-heavy and summer conditions dominate the decision.",
      },
      {
        href: "/blog/best-parking-ac-for-semi-trucks/",
        title: "Best Parking AC for Semi Trucks",
        description: "Useful if the climate decision is happening in a sleeper-cab fleet context.",
      },
    ],
    nextLinks: [
      {
        href: "/solutions/semi-truck-parking-ac/",
        title: "Semi Truck Parking AC Hub",
        description: "Move into the truck buying path when route climate and sleeper use are the main filters.",
      },
      {
        href: "/solutions/van-parking-ac/",
        title: "Van & Light Truck Hub",
        description: "Use the lighter-duty branch when compact packaging and all-season utility matter most.",
      },
    ],
    primaryCta: {
      href: "/products/heating-cooling-ac/",
      title: "See V-TH1 dual-mode AC",
      description: "Go straight to the year-round rooftop option if climate coverage is the key requirement.",
    },
    secondaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See cooling-only rooftop options",
      description: "Stay on the simpler cooling-only branch when winter coverage is unnecessary.",
    },
  },
  "/compare/parking-ac-roof-fitment-guide": {
    route: "/compare/parking-ac-roof-fitment-guide",
    sectionLabel: "Compare",
    badge: "Fitment Planning Hub",
    title: "Parking AC Roof Fitment Guide",
    subtitle: "Use roof opening, surface area, and vehicle layout to decide which installation path is realistic.",
    description:
      "This page helps buyers answer the physical fitment question before they get stuck comparing specs. It is most useful for RVs, vans, and compact vehicles where roof space, cutout size, and accessory layout can decide the product faster than price does.",
    icon: Home,
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/hero-product-right_1b53506e.webp",
    heroImageAlt: "Rooftop parking air conditioner fitment guide for vehicle roof openings and layout planning",
    heroStats: [
      { label: "Standard Opening", value: "14x14 inch rooftop" },
      { label: "Tight Layouts", value: "Vans and pickups" },
      { label: "Best Matches", value: "VS02 PRO, Nano Max, VX3000SP" },
    ],
    signals: ["14x14 openings", "Roof space", "Vehicle layout", "Retrofit planning"],
    fitCards: [
      {
        title: "A standard rooftop opening speeds everything up",
        body: "If the vehicle already has a compatible rooftop cutout, the shortlist gets much simpler. Buyers can move faster into rooftop models instead of forcing custom fitment questions onto every option.",
      },
      {
        title: "Compact roofs change the ideal product path",
        body: "Vans, pickups, and accessory-heavy roofs often reward smaller or more packaging-efficient systems. In those cases, the best answer may be a compact rooftop unit or a different system layout entirely.",
      },
      {
        title: "Layout matters more than raw cooling claims",
        body: "A powerful system that does not fit cleanly around vents, racks, or work accessories is not the right spec. Fitment discipline usually saves more time than chasing headline capacity first.",
      },
    ],
    recommendedProducts: [
      {
        title: "VS02 PRO Top-Mounted Parking AC",
        href: "/products/top-mounted-ac/",
        tag: "Best For Standard Rooftop Retrofits",
        description: "Start here when the vehicle already supports a standard rooftop path and the buyer wants the cleanest all-in-one installation story.",
        bullets: [
          "Strong fit for standard rooftop openings and RV-style retrofits",
          "Keeps installation more straightforward than many alternatives",
          "Useful when the roof layout is already favorable",
        ],
      },
      {
        title: "Nano Max Portable Parking AC",
        href: "/products/nano-max/",
        tag: "Best For Tight Roof Layouts",
        description: "A strong option when pickup, van, or compact-vehicle roof space makes larger rooftop systems unrealistic.",
        bullets: [
          "Better packaging efficiency for tighter vehicle roofs",
          "Useful when work accessories or rails consume roof real estate",
          "Good match for lighter-duty vehicles and smaller cabins",
        ],
      },
      {
        title: "VX3000SP Mini Split Parking AC",
        href: "/products/mini-split-ac/",
        tag: "Best When Rooftop Layout Is The Problem",
        description: "Use this route when the buyer still needs serious cooling but the all-in-one rooftop path is compromised by vehicle layout or interior comfort needs.",
        bullets: [
          "Alternative path when rooftop packaging is awkward",
          "Useful for sleepers and premium builds that prioritize comfort",
          "Pairs well with buyers already comparing split versus rooftop format",
        ],
      },
    ],
    compareBlock: {
      title: "Standard rooftop opening versus tight roof layout",
      subtitle: "Most fitment questions reduce to whether the vehicle supports a clean rooftop retrofit or whether packaging constraints should change the shortlist.",
      leftLabel: "Standard rooftop path",
      rightLabel: "Tight or non-standard layout",
      rows: [
        { label: "Typical vehicles", left: "RVs, some vans, retrofit-ready roofs", right: "Pickups, compact vans, accessory-heavy roofs" },
        { label: "Best starting point", left: "VS02 PRO / rooftop branch", right: "Nano Max / split-system evaluation" },
        { label: "Main planning issue", left: "Cutout and mounting simplicity", right: "Roof real estate and packaging" },
        { label: "Next comparison", left: "Cooling-only vs dual-mode", right: "Rooftop vs mini split" },
      ],
    },
    checklistTitle: "Roof fitment checklist",
    checklist: [
      "Measure the available rooftop space before comparing product specs.",
      "Confirm whether a standard rooftop opening already exists in the vehicle.",
      "Check vents, racks, ladders, solar, or work accessories that may block installation.",
      "Use compact rooftop options when larger all-in-one systems will be hard to package cleanly.",
      "Move to split-system comparison if rooftop layout is the real blocker.",
      "Set fitment first, then compare climate branch and battery runtime inside the viable installation path.",
    ],
    faqs: [
      {
        question: "What roof opening does a typical rooftop parking AC need?",
        answer:
          "Many rooftop retrofit decisions start around a standard RV-style opening, but the exact fit depends on the product and the vehicle layout. Buyers should confirm both cutout size and total available roof real estate.",
      },
      {
        question: "What should buyers do if the roof layout is too tight?",
        answer:
          "Start by checking whether a more compact rooftop model fits the vehicle. If not, move into a format comparison instead of forcing a larger rooftop unit into a compromised layout.",
      },
      {
        question: "Is roof fitment mostly an RV problem?",
        answer:
          "No. RVs face it often, but vans, pickups, service vehicles, and accessory-heavy work trucks can have even tougher packaging constraints than a typical rooftop RV retrofit.",
      },
    ],
    relatedReading: [
      {
        href: "/blog/rv-parking-ac-installation-guide/",
        title: "RV Parking AC Installation Guide",
        description: "Use the installation article for process detail, then return here to decide which fitment branch makes sense.",
      },
      {
        href: "/blog/top-mounted-ac-installation-tips/",
        title: "Top-Mounted AC Installation Tips",
        description: "Helpful when the shortlist is already on the rooftop branch and the main concern is install execution.",
      },
      {
        href: "/blog/parking-ac-for-camper-van-conversion/",
        title: "Parking AC for Camper Van Conversion",
        description: "Useful if the roof-fitment decision is happening in a compact van build.",
      },
    ],
    nextLinks: [
      {
        href: "/solutions/rv-parking-ac/",
        title: "RV Parking AC Hub",
        description: "Move into the RV buying path once the rooftop-fitment branch is clear.",
      },
      {
        href: "/compare/rooftop-vs-mini-split-parking-ac/",
        title: "Compare Rooftop vs Mini Split",
        description: "Use this when roof-fitment questions are pushing the decision toward or away from split systems.",
      },
    ],
    primaryCta: {
      href: "/products/top-mounted-ac/",
      title: "See rooftop retrofit options",
      description: "Start with the standard rooftop path if fitment is already favorable.",
    },
    secondaryCta: {
      href: "/products/nano-max/",
      title: "See compact roof-fit options",
      description: "Use the smaller-footprint branch when roof space is the real limiter.",
    },
  },
};

function normalizePath(location: string): string {
  const withoutQuery = location.split("?")[0].split("#")[0] || "/";
  if (withoutQuery !== "/" && withoutQuery.endsWith("/")) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery;
}

function toAbsoluteUrl(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function buildSchemas(page: HubPageConfig) {
  return [
    {
      "@context": "https://schema.org",
      "@type": page.sectionLabel === "Solutions" ? "CollectionPage" : "WebPage",
      name: page.title,
      description: page.description,
      url: `${BASE_URL}${page.route}/`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
        { "@type": "ListItem", position: 2, name: page.title, item: `${BASE_URL}${page.route}/` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${page.title} Recommended Products`,
      itemListElement: page.recommendedProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.title,
        url: `${BASE_URL}${product.href}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];
}

export default function CommercialHubPage() {
  const [location] = useLocation();
  const { i18n } = useTranslation();
  const currentLanguage = resolveBlogLanguage(i18n.language || "en");
  const page = HUB_PAGES[normalizePath(location)];
  const localizedHref = (href: string) => localizeBlogAwarePath(href, currentLanguage);

  if (!page) {
    return (
      <PageLayout>
        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-20 text-center">
          <h1
            className="text-2xl font-extrabold mb-4"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            Guide Not Found
          </h1>
          <Link href="/products/" className="text-sm font-semibold" style={{ color: "oklch(0.45 0.18 255)" }}>
            Browse Products
          </Link>
        </div>
      </PageLayout>
    );
  }

  const PageIcon = page.icon;
  const schemas = buildSchemas(page);

  return (
    <PageLayout>
      {schemas.map((schema, index) => (
        <script
          key={`${page.route}-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav
        className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm"
        style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}
      >
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <span>{page.sectionLabel}</span>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>{page.title}</span>
      </nav>

      <section
        className="py-10 lg:py-14"
        style={{ background: "linear-gradient(135deg, oklch(0.97 0.02 240) 0%, oklch(0.93 0.04 245) 100%)" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4" style={{ backgroundColor: "oklch(0.90 0.05 250)" }}>
              <PageIcon size={16} style={{ color: "oklch(0.45 0.18 255)" }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {page.badge}
              </span>
            </div>

            <h1
              className="text-3xl lg:text-5xl font-extrabold mb-4 leading-tight"
              style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {page.title}
            </h1>

            <p
              className="text-lg font-medium mb-4"
              style={{ color: "oklch(0.45 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {page.subtitle}
            </p>

            <p
              className="text-base leading-relaxed max-w-3xl mb-6"
              style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}
            >
              {page.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-7">
              {page.signals.map((signal) => (
                <span
                  key={signal}
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "white",
                    color: "oklch(0.35 0.10 250)",
                    border: "1px solid rgba(41, 88, 164, 0.12)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {signal}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={localizedHref(page.primaryCta.href)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {page.primaryCta.title}
                <ArrowRight size={16} />
              </Link>
              <Link
                href={localizedHref(page.secondaryCta.href)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm border-2 transition-colors hover:bg-white"
                style={{
                  borderColor: "oklch(0.45 0.18 255)",
                  color: "oklch(0.45 0.18 255)",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {page.secondaryCta.title}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[28px] overflow-hidden shadow-[0_30px_80px_rgba(21,39,84,0.18)] bg-white border border-white/70">
              <img
                src={toAbsoluteUrl(page.heroImage)}
                alt={page.heroImageAlt}
                className="w-full h-[260px] lg:h-[320px] object-cover"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 lg:p-5" style={{ backgroundColor: "oklch(0.98 0.01 240)" }}>
                {page.heroStats.map((fact) => (
                  <div key={fact.label} className="rounded-2xl p-3" style={{ backgroundColor: "white" }}>
                    <p
                      className="text-[11px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: "oklch(0.55 0.10 255)", fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {fact.label}
                    </p>
                    <p
                      className="text-sm font-semibold leading-snug"
                      style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.50 0.14 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              What to prioritize
            </p>
            <h2
              className="text-2xl font-extrabold"
              style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Use this hub to narrow the decision before you compare products line by line.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {page.fitCards.map((card) => (
              <article
                key={card.title}
                className="rounded-3xl p-6 shadow-sm"
                style={{ backgroundColor: "oklch(0.98 0.01 240)", border: "1px solid rgba(41, 88, 164, 0.10)" }}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "oklch(0.90 0.06 250)" }}>
                  <Shield size={18} style={{ color: "oklch(0.45 0.18 255)" }} />
                </div>
                <h3
                  className="text-lg font-extrabold mb-3"
                  style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}
                >
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "oklch(0.50 0.14 255)", fontFamily: "'Montserrat', sans-serif" }}
              >
                Recommended systems
              </p>
              <h2
                className="text-2xl font-extrabold"
                style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
              >
                Start with the products that fit this buying situation best.
              </h2>
            </div>
            <Link
              href="/products/"
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Inter', sans-serif" }}
            >
              Browse all products
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {page.recommendedProducts.map((product) => (
              <Link
                key={product.href}
                href={localizedHref(product.href)}
                className="rounded-3xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col"
                style={{ border: "1px solid rgba(41, 88, 164, 0.10)" }}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: "oklch(0.92 0.05 250)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {product.tag}
                  </span>
                  <Package size={18} style={{ color: "oklch(0.45 0.18 255)" }} />
                </div>
                <h3
                  className="text-lg font-extrabold mb-3"
                  style={{ color: "oklch(0.24 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {product.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}
                >
                  {product.description}
                </p>
                <div className="space-y-2 mt-auto mb-4">
                  {product.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-2.5 text-sm" style={{ color: "oklch(0.38 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                      <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.45 0.18 255)" }} />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
                  Review this model
                  <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {page.compareBlock && (
        <section className="py-14 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
            <div className="mb-8 max-w-3xl">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "oklch(0.50 0.14 255)", fontFamily: "'Montserrat', sans-serif" }}
              >
                Quick comparison
              </p>
              <h2
                className="text-2xl font-extrabold mb-3"
                style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {page.compareBlock.title}
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}
              >
                {page.compareBlock.subtitle}
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border" style={{ borderColor: "rgba(41, 88, 164, 0.12)" }}>
              <div className="grid grid-cols-[1.15fr_1fr_1fr] px-4 py-4" style={{ backgroundColor: "oklch(0.96 0.02 245)" }}>
                <div />
                <div
                  className="text-sm font-extrabold text-center"
                  style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {page.compareBlock.leftLabel}
                </div>
                <div
                  className="text-sm font-extrabold text-center"
                  style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {page.compareBlock.rightLabel}
                </div>
              </div>

              {page.compareBlock.rows.map((row, index) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.15fr_1fr_1fr] px-4 py-4 gap-4"
                  style={{
                    backgroundColor: index % 2 === 0 ? "white" : "oklch(0.985 0.006 240)",
                    borderTop: index === 0 ? "1px solid rgba(41, 88, 164, 0.08)" : "1px solid rgba(41, 88, 164, 0.06)",
                  }}
                >
                  <div className="text-sm font-semibold" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
                    {row.label}
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                    {row.left}
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                    {row.right}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-14" style={{ backgroundColor: "oklch(0.22 0.08 248)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.68 0.08 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Buying checklist
            </p>
            <h2
              className="text-2xl font-extrabold text-white mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {page.checklistTitle}
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "oklch(0.78 0.04 240)", fontFamily: "'Inter', sans-serif" }}
            >
              If a buyer can answer these points clearly, the final product decision usually becomes straightforward.
            </p>
          </div>

          <div className="rounded-3xl p-6" style={{ backgroundColor: "oklch(0.28 0.09 248)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="space-y-3">
              {page.checklist.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm" style={{ color: "oklch(0.82 0.04 240)", fontFamily: "'Inter', sans-serif" }}>
                  <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.70 0.16 255)" }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.50 0.14 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Frequently asked questions
            </p>
            <h2
              className="text-2xl font-extrabold"
              style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              The questions buyers usually ask before committing.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {page.faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-3xl p-6"
                style={{ backgroundColor: "oklch(0.98 0.01 240)", border: "1px solid rgba(41, 88, 164, 0.10)" }}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "oklch(0.92 0.05 250)" }}>
                  <BookOpen size={18} style={{ color: "oklch(0.45 0.18 255)" }} />
                </div>
                <h3
                  className="text-lg font-extrabold mb-3"
                  style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {faq.question}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}
                >
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.50 0.14 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Related reading
            </p>
            <h2
              className="text-2xl font-extrabold mb-5"
              style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Use the blog for context, then return here to choose the product path.
            </h2>
            <div className="space-y-4">
              {page.relatedReading.map((item) => (
                <Link
                  key={item.href}
                  href={localizedHref(item.href)}
                  className="block rounded-3xl p-5 bg-white hover:shadow-sm transition-shadow"
                  style={{ border: "1px solid rgba(41, 88, 164, 0.10)" }}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-base font-extrabold" style={{ color: "oklch(0.24 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
                      {item.title}
                    </h3>
                    <ArrowRight size={16} style={{ color: "oklch(0.45 0.18 255)" }} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.50 0.14 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Next steps
            </p>
            <h2
              className="text-2xl font-extrabold mb-5"
              style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Keep moving through the commercial path instead of bouncing back to generic content.
            </h2>
            <div className="space-y-4">
              {page.nextLinks.map((item) => (
                <Link
                  key={item.href}
                  href={localizedHref(item.href)}
                  className="block rounded-3xl p-5"
                  style={{
                    background: "linear-gradient(135deg, rgba(35,87,165,0.08) 0%, rgba(35,87,165,0.02) 100%)",
                    border: "1px solid rgba(41, 88, 164, 0.10)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-base font-extrabold" style={{ color: "oklch(0.24 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
                      {item.title}
                    </h3>
                    <ArrowRight size={16} style={{ color: "oklch(0.45 0.18 255)" }} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14" style={{ backgroundColor: "oklch(0.22 0.08 248)" }}>
        <div className="max-w-[980px] mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Ready to move from research into a real shortlist?
          </h2>
          <p className="text-base mb-8" style={{ color: "oklch(0.80 0.04 240)", fontFamily: "'Inter', sans-serif" }}>
            Use the product pages next. They carry the specs, fitment details, and installation context behind this commercial decision path.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={localizedHref(page.primaryCta.href)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {page.primaryCta.title}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm border-2 text-white/95 transition-colors hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.18)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Talk to sales or support
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}