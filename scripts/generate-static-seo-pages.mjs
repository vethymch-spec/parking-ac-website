import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist", "client");
const BASE_HTML_PATH = path.join(DIST_DIR, "index.html");
const BLOG_DATA_DIR = path.join(ROOT_DIR, "client", "public", "data", "blog");
const BLOG_LOCALES_DIR = path.join(BLOG_DATA_DIR, "locales");
const BLOG_LOCALE_AVAILABILITY_PATH = path.join(BLOG_DATA_DIR, "locale-availability.json");
const BLOG_POST_SOURCE_PATH = path.join(ROOT_DIR, "client", "src", "pages", "BlogPost.tsx");
const I18N_LOCALES_DIR = path.join(ROOT_DIR, "client", "src", "i18n", "locales");
const PUBLIC_SITEMAP_PATH = path.join(ROOT_DIR, "client", "public", "sitemap.xml");
const REDIRECTS_PATH = path.join(DIST_DIR, "_redirects");

const BASE_URL = "https://cooldrivepro.com";
const DEFAULT_OG_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/hero-bg-1280_6f9410ed.webp";
const DEFAULT_DESCRIPTION = "12V & 24V DC parking AC for trucks, RVs & vans. 10000-12000 BTU, no-idle operation. Free US shipping & 1-year warranty.";
const DEFAULT_BLOG_LANGUAGE = "en";
const RTL_LANGUAGES = new Set(["ar", "he"]);
const EXCLUDED_BLOG_FILES = new Set(["list.json", "manifest.json", "locale-availability.json"]);
const OG_LOCALE_MAP = {
  en: "en_US",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
  ja: "ja_JP",
  ko: "ko_KR",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
  it: "it_IT",
  pt: "pt_PT",
  ru: "ru_RU",
  ar: "ar_AR",
  hi: "hi_IN",
  th: "th_TH",
  vi: "vi_VN",
  id: "id_ID",
  tr: "tr_TR",
  pl: "pl_PL",
  nl: "nl_NL",
  sv: "sv_SE",
  no: "no_NO",
  da: "da_DK",
  fi: "fi_FI",
  el: "el_GR",
  cs: "cs_CZ",
  hu: "hu_HU",
  ro: "ro_RO",
  uk: "uk_UA",
  he: "he_IL",
  ms: "ms_MY",
};
const SITE_LANGUAGES = Object.keys(OG_LOCALE_MAP);

const localeMessagesCache = new Map();

function toCanonicalPath(route) {
  if (route === "/") {
    return "/";
  }
  return route.endsWith("/") ? route : `${route}/`;
}

function toCanonicalUrl(route) {
  return `${BASE_URL}${toCanonicalPath(route)}`;
}

function toLocalizedBlogRoute(language, route) {
  return language === DEFAULT_BLOG_LANGUAGE ? route : `/${language}${route}`;
}

function toLocalizedStaticRoute(language, route) {
  return language === DEFAULT_BLOG_LANGUAGE ? route : route === "/" ? `/${language}` : `/${language}${route}`;
}

function toLocalizedBlogIndexRoute(language) {
  return toLocalizedBlogRoute(language, "/blog");
}

function toLocalizedBlogPostRoute(language, slug) {
  return toLocalizedBlogRoute(language, `/blog/${slug}`);
}

function buildStaticAlternateLinks(route, languages = SITE_LANGUAGES) {
  if (!Array.isArray(languages) || languages.length <= 1) {
    return [];
  }

  return [
    ...languages.map((language) => ({
      hreflang: language,
      href: toCanonicalUrl(toLocalizedStaticRoute(language, route)),
    })),
    {
      hreflang: "x-default",
      href: toCanonicalUrl(route),
    },
  ];
}

function toOpenGraphLocale(language) {
  return OG_LOCALE_MAP[language] || OG_LOCALE_MAP[DEFAULT_BLOG_LANGUAGE];
}

const PRODUCT_PAGES = [
  {
    route: "/products/top-mounted-ac",
    title: "10000 BTU Top-Mounted Parking AC | 12V 24V No-Idle Cooling - CoolDrivePro",
    description: "Top-mounted 12V/24V DC parking air conditioner for semi trucks, RVs, and vans. 10,000 BTU cooling, low-noise operation, and battery protection for overnight no-idle comfort.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/hero-product-right_1b53506e.webp",
    schema: {
      name: "10000 BTU Top-Mounted Parking Air Conditioner - 12V/24V DC",
      sku: "VS02-PRO",
      price: "1299.00",
      ratingValue: "4.8",
      reviewCount: "127",
      description: "12V/24V DC powered top-mounted parking air conditioner for RVs, semi trucks, vans and campers. 10000 BTU cooling, 4500 BTU heating, and no-idle operation with battery protection.",
    },
  },
  {
    route: "/products/mini-split-ac",
    title: "12000 BTU Mini Split Parking AC | 12V 24V Truck Sleeper Cooling - CoolDrivePro",
    description: "Mini split 12V/24V parking air conditioner for semi truck sleeper cabs, RVs, and vans. 12,000 BTU cooling, ultra-quiet indoor unit, and efficient overnight battery-powered performance.",
    image: `${BASE_URL}/images/products/vx3000-split-outdoor-unit-01.webp`,
    schema: {
      name: "12000 BTU Mini Split Parking Air Conditioner - 12V DC",
      sku: "VX3000SP",
      price: "1599.00",
      ratingValue: "4.7",
      reviewCount: "89",
      description: "12V DC mini split parking air conditioner for semi trucks, RVs, vans, and sleeper cabs. 12000 BTU cooling capacity with quiet indoor operation.",
    },
  },
  {
    route: "/products/heating-cooling-ac",
    title: "Heating & Cooling Parking AC | 12V 24V Dual-Mode Unit - CoolDrivePro",
    description: "Dual-mode 12V/24V parking air conditioner with cooling and heating for trucks, RVs, vans, and service vehicles. GMCC twin-rotary compressor for year-round no-idle climate control.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-outdoor-top_55c3c0af.webp",
    schema: {
      name: "V-TH1 Heating & Cooling Parking Air Conditioner - 12V/24V DC",
      sku: "V-TH1",
      price: "1899.00",
      ratingValue: "4.9",
      reviewCount: "12",
      description: "12V/24V DC dual-mode heating and cooling parking air conditioner for trucks, RVs, vans and specialty vehicles with GMCC twin-rotary compressor.",
    },
  },
  {
    route: "/products/nano-max",
    title: "Nano Max Portable Parking AC | Compact 12V 24V Cooling - CoolDrivePro",
    description: "Compact Nano Max parking air conditioner for light trucks, pickups, vans, and mobile work vehicles. Portable 12V/24V no-idle cooling in a lightweight design.",
    image: `${BASE_URL}/images/products/nano-max-01.webp`,
    schema: {
      name: "Nano Max Portable Parking Air Conditioner - 12V/24V DC",
      sku: "NANO-MAX",
      price: "899.00",
      ratingValue: "4.8",
      reviewCount: "45",
      description: "Ultra-compact portable 12V/24V DC parking air conditioner designed for light trucks, vans, and mobile work vehicles.",
    },
  },
];

const INDEXABLE_STATIC_PAGES = [
  {
    route: "/products",
    title: "Parking AC Products | 12V 24V Truck & RV Air Conditioners - CoolDrivePro",
    description: "Compare CoolDrivePro parking air conditioners for trucks, RVs, vans, and campers. Explore 12V and 24V no-idle AC units by cooling capacity, installation type, and use case.",
    image: DEFAULT_OG_IMAGE,
    pageType: "collection",
  },
  {
    route: "/about",
    title: "About CoolDrivePro | Parking Air Conditioner Experts",
    description: "Learn about CoolDrivePro, our parking air conditioner product line, and our focus on no-idle cooling solutions for trucks, RVs, vans, and off-grid vehicles.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/contact",
    title: "Contact CoolDrivePro | Parking AC Support & Sales",
    description: "Contact CoolDrivePro for parking air conditioner sales, support, product questions, and wholesale inquiries for trucks, RVs, and commercial vehicles.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/brand-knowledge",
    title: "Brand Knowledge | Parking AC Technology & Product Insights - CoolDrivePro",
    description: "Explore CoolDrivePro brand knowledge, parking AC technology insights, product comparisons, and educational resources for truck and RV climate control.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/support",
    title: "Support Center | Parking Air Conditioner Help - CoolDrivePro",
    description: "Get parking air conditioner support, troubleshooting help, warranty guidance, and after-sales assistance for your CoolDrivePro product.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/warranty",
    title: "Warranty Policy | CoolDrivePro Parking AC Coverage",
    description: "Review the CoolDrivePro warranty policy for parking air conditioners, coverage terms, exclusions, and after-sales support details.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/return-policy",
    title: "Return Policy | CoolDrivePro Parking Air Conditioner Orders",
    description: "Read the CoolDrivePro return policy for parking air conditioner orders, including eligibility, refund conditions, and return process details.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/shipping-policy",
    title: "Shipping Policy | CoolDrivePro Delivery & Fulfillment",
    description: "See CoolDrivePro shipping information for parking air conditioners, including delivery timelines, fulfillment details, and destination coverage.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/privacy-policy",
    title: "Privacy Policy | CoolDrivePro",
    description: "Read the CoolDrivePro privacy policy covering customer data, cookies, analytics, and how personal information is handled across the website.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/features/power",
    title: "Power Efficiency | Low-Draw Parking AC Technology - CoolDrivePro",
    description: "Learn how CoolDrivePro parking air conditioners reduce battery draw with efficient DC inverter technology, BLDC compressors, and overnight runtime optimization.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/features/efficiency",
    title: "Cooling Efficiency | High-Performance Parking AC Design - CoolDrivePro",
    description: "See how CoolDrivePro improves cooling efficiency with optimized refrigerant flow, inverter control, and real-world performance for trucks and RVs.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/features/installation",
    title: "Installation Guide | Parking AC Fitment & Setup - CoolDrivePro",
    description: "Review installation considerations for CoolDrivePro parking AC systems, including rooftop fitment, wiring, battery setup, and mounting guidance.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/features/battery",
    title: "Battery Runtime | Parking AC Power Planning - CoolDrivePro",
    description: "Calculate battery requirements and overnight runtime expectations for 12V and 24V CoolDrivePro parking air conditioners in trucks, RVs, and vans.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/features/durability",
    title: "Durability | Built for Trucking, RV, and Harsh Conditions - CoolDrivePro",
    description: "Discover the durability features behind CoolDrivePro parking air conditioners, including vibration resistance, weather tolerance, and long-duty operation.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/features/noise",
    title: "Low Noise Operation | Quiet Parking AC Performance - CoolDrivePro",
    description: "Compare low-noise parking air conditioner performance from CoolDrivePro for sleeper cabs, vans, and RVs where quiet overnight operation matters.",
    image: DEFAULT_OG_IMAGE,
  },
  {
    route: "/forum",
    title: "Community Forum | Parking AC Discussions - CoolDrivePro",
    description: "Join the CoolDrivePro forum for parking air conditioner discussions, installation questions, user experiences, and troubleshooting advice.",
    image: DEFAULT_OG_IMAGE,
  },
];

const COMMERCIAL_HUB_PAGES = [
  {
    route: "/solutions/semi-truck-parking-ac",
    title: "Semi Truck Parking AC | 24V Sleeper Cab No-Idle Cooling - CoolDrivePro",
    description: "Compare semi truck parking AC setups for sleeper cabs. See 24V-ready rooftop and mini split systems for no-idle truck air conditioner planning, anti-idling compliance, and overnight runtime.",
    image: `${BASE_URL}/images/products/vx3000-split-installation.webp`,
    pageType: "collection",
    breadcrumbName: "Semi Truck Parking AC",
    recommendedProducts: ["/products/mini-split-ac", "/products/top-mounted-ac", "/products/heating-cooling-ac"],
    faqs: [
      {
        question: "Is 24V support mandatory for a semi-truck parking AC?",
        answer: "Most sleeper cabs operate on 24V systems, so buyers should start with models that support 24V natively or fit that architecture cleanly.",
      },
      {
        question: "When should a fleet choose mini split over rooftop?",
        answer: "Mini split is usually the stronger choice when sleeper-cab quiet and overnight comfort matter more than the simplest installation path.",
      },
    ],
  },
  {
    route: "/solutions/rv-parking-ac",
    title: "RV Parking AC | Off-Grid 12V 24V RV Cooling Guide - CoolDrivePro",
    description: "Find the right RV parking AC for boondocking, campground quiet hours, and off-grid overnight cooling. Compare rooftop, mini split, and compact RV-ready systems.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-rv-outdoor-3S7bLnKiixmod8iB5Fjvih.webp",
    pageType: "collection",
    breadcrumbName: "RV Parking AC",
    recommendedProducts: ["/products/top-mounted-ac", "/products/mini-split-ac", "/products/nano-max"],
    faqs: [
      {
        question: "What is the best parking AC format for most RV owners?",
        answer: "Rooftop systems are often the easiest retrofit path, while split systems are stronger when lower indoor noise is worth the additional installation effort.",
      },
      {
        question: "Can an RV parking AC work for off-grid camping?",
        answer: "Yes, as long as the battery bank, charging plan, and overnight runtime expectations are sized realistically for the vehicle.",
      },
    ],
  },
  {
    route: "/solutions/van-parking-ac",
    title: "Van Parking AC | 12V 24V Cooling Guide - CoolDrivePro",
    description: "Choose a parking AC for camper vans, service vans, pickups, and light trucks. Compare compact 12V/24V rooftop and portable-ready systems for tight roof space and overnight comfort.",
    image: `${BASE_URL}/images/products/nano-max-01.webp`,
    pageType: "collection",
    breadcrumbName: "Van Parking AC",
    recommendedProducts: ["/products/nano-max", "/products/top-mounted-ac", "/products/heating-cooling-ac"],
    faqs: [
      {
        question: "What is the best parking AC for a pickup or light truck?",
        answer: "Most light-duty buyers should start with compact packaging and realistic overnight runtime goals before jumping to the largest rooftop option.",
      },
      {
        question: "Can a van use the same parking AC strategy as an RV?",
        answer: "Sometimes, but vans usually face tighter roof-space and battery constraints, so compact packaging often matters more.",
      },
    ],
  },
  {
    route: "/solutions/battery-powered-truck-cab-air-conditioner",
    title: "Battery-Powered Truck Cab Air Conditioner | 24V Sleeper Cab Guide - CoolDrivePro",
    description: "Compare battery-powered truck cab air conditioner options for 24V sleeper cabs. Plan overnight runtime, battery reserve, and the right rooftop or mini split format before you buy.",
    image: `${BASE_URL}/images/products/vx3000-split-installation.webp`,
    pageType: "collection",
    breadcrumbName: "Battery-Powered Truck Cab Air Conditioner",
    recommendedProducts: ["/products/mini-split-ac", "/products/top-mounted-ac", "/products/heating-cooling-ac"],
    faqs: [
      {
        question: "Can a truck cab air conditioner run only on batteries?",
        answer: "Yes, if the vehicle has the right battery reserve and the system is matched to that reserve realistically for overnight rest periods.",
      },
      {
        question: "How much battery do you need for overnight truck cab cooling?",
        answer: "That depends on cabin size, ambient heat, and the chosen system, which is why buyers should size the battery bank first and then choose the AC around that runtime target.",
      },
    ],
  },
  {
    route: "/solutions/no-idle-truck-air-conditioner",
    title: "No-Idle Truck Air Conditioner | Compliance & Fuel-Savings Guide - CoolDrivePro",
    description: "Compare no-idle truck air conditioner setups for fleets and owner-operators. See how anti-idling compliance, fuel savings, and sleeper-cab comfort affect the best rooftop or split system.",
    image: `${BASE_URL}/images/products/vx3000-split-installation.webp`,
    pageType: "collection",
    breadcrumbName: "No-Idle Truck Air Conditioner",
    recommendedProducts: ["/products/top-mounted-ac", "/products/mini-split-ac", "/products/heating-cooling-ac"],
    faqs: [
      {
        question: "Does a no-idle truck air conditioner help with anti-idling compliance?",
        answer: "Yes. It lets fleets and owner-operators keep the cab comfortable during rest periods without running the engine.",
      },
      {
        question: "What is the best no-idle truck AC format for fleets?",
        answer: "Rooftop systems are usually easiest to standardize, while mini split systems are stronger when sleeper-cab quiet matters more.",
      },
    ],
  },
  {
    route: "/solutions/off-grid-rv-air-conditioner",
    title: "Off-Grid RV Air Conditioner | Battery & Solar Cooling Guide - CoolDrivePro",
    description: "Find the right off-grid RV air conditioner for boondocking, solar-charged batteries, and generator-free overnight comfort. Compare rooftop, mini split, and compact RV-ready systems.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-rv-outdoor-3S7bLnKiixmod8iB5Fjvih.webp",
    pageType: "collection",
    breadcrumbName: "Off-Grid RV Air Conditioner",
    recommendedProducts: ["/products/top-mounted-ac", "/products/mini-split-ac", "/products/nano-max"],
    faqs: [
      {
        question: "Can an off-grid RV air conditioner run all night?",
        answer: "Yes, if the battery bank, charging plan, and AC size are matched realistically to the overnight runtime target.",
      },
      {
        question: "Should RV owners choose rooftop or mini split for off-grid camping?",
        answer: "Rooftop is usually the easier retrofit path, while mini split becomes attractive when quieter sleeping conditions are worth the extra install effort.",
      },
    ],
  },
  {
    route: "/solutions/camper-van-parking-ac",
    title: "Camper Van Parking AC | 12V 24V Conversion Cooling Guide - CoolDrivePro",
    description: "Choose a camper van parking AC for Sprinter, Transit, and ProMaster builds. Compare compact rooftop, mini split, and battery-powered overnight cooling setups for tight roof layouts.",
    image: `${BASE_URL}/images/products/nano-max-01.webp`,
    pageType: "collection",
    breadcrumbName: "Camper Van Parking AC",
    recommendedProducts: ["/products/nano-max", "/products/top-mounted-ac", "/products/mini-split-ac"],
    faqs: [
      {
        question: "What is the best camper van parking AC format?",
        answer: "For many van builds, a compact rooftop system is the best starting point because roof space and battery reserve are both limited.",
      },
      {
        question: "When should a camper van buyer choose a mini split?",
        answer: "Choose mini split when low indoor noise and premium sleep comfort matter enough to justify the extra install work.",
      },
    ],
  },
  {
    route: "/compare/12v-vs-24v-parking-ac",
    title: "12V vs 24V Parking AC | Which Voltage Fits Your Vehicle? - CoolDrivePro",
    description: "Compare 12V vs 24V parking air conditioners for RVs, vans, pickups, and semi trucks. Understand current draw, wiring, battery planning, and the best CoolDrivePro fit.",
    image: DEFAULT_OG_IMAGE,
    breadcrumbName: "12V vs 24V Parking AC",
    recommendedProducts: ["/products/top-mounted-ac", "/products/nano-max", "/products/mini-split-ac"],
    faqs: [
      {
        question: "Is 24V always better than 12V for parking AC?",
        answer: "No. The correct voltage starts with the vehicle electrical system and operating context, not with a blanket assumption that higher voltage is always superior.",
      },
      {
        question: "Can one parking AC cover both 12V and 24V vehicles?",
        answer: "Yes, which is useful for mixed fleets or buyers managing multiple vehicle types from one product catalog.",
      },
    ],
  },
  {
    route: "/compare/rooftop-vs-mini-split-parking-ac",
    title: "Rooftop vs Mini Split Parking AC | Compare Install & Runtime - CoolDrivePro",
    description: "Compare rooftop vs mini split parking AC systems for trucks, RVs, and vans. Review installation effort, noise, cooling layout, and which CoolDrivePro model fits best.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/hero-product-right_1b53506e.webp",
    breadcrumbName: "Rooftop vs Mini Split",
    recommendedProducts: ["/products/top-mounted-ac", "/products/mini-split-ac", "/products/heating-cooling-ac"],
    faqs: [
      {
        question: "Is rooftop or mini split better for an RV?",
        answer: "Rooftop is often the easier retrofit path, while mini split becomes attractive when quieter indoor operation matters more.",
      },
      {
        question: "Is mini split usually better for semi trucks?",
        answer: "It is often the stronger sleeper-cab comfort option, though rooftop can still be the better fleet standardization choice.",
      },
    ],
  },
  {
    route: "/compare/parking-ac-battery-runtime",
    title: "Parking AC Battery Runtime Guide | How Much Battery Do You Need? - CoolDrivePro",
    description: "Plan parking AC battery runtime for trucks, RVs, vans, and pickups. Compare overnight goals, LiFePO4 battery sizing, low-voltage protection, and the best CoolDrivePro fit.",
    image: DEFAULT_OG_IMAGE,
    breadcrumbName: "Parking AC Battery Runtime",
    recommendedProducts: ["/products/nano-max", "/products/top-mounted-ac", "/products/mini-split-ac"],
    faqs: [
      {
        question: "How much battery do you need to run a parking AC overnight?",
        answer: "It depends on cabin size, ambient temperature, battery chemistry, and the chosen system. Buyers should size the battery bank first and then match the AC to that reserve realistically.",
      },
      {
        question: "Why does LiFePO4 matter so much for parking AC runtime?",
        answer: "LiFePO4 usually offers more usable depth of discharge and more predictable overnight performance than many lead-acid setups.",
      },
    ],
  },
  {
    route: "/compare/cooling-only-vs-heating-cooling-parking-ac",
    title: "Cooling-Only vs Heating & Cooling Parking AC | Climate Guide - CoolDrivePro",
    description: "Compare cooling-only vs heating-and-cooling parking AC systems for mixed climates, year-round fleets, RVs, vans, and trucks. Choose the right climate-control branch first.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-outdoor-top_55c3c0af.webp",
    breadcrumbName: "Cooling-Only vs Heating & Cooling",
    recommendedProducts: ["/products/top-mounted-ac", "/products/mini-split-ac", "/products/heating-cooling-ac"],
    faqs: [
      {
        question: "When is cooling-only the better parking AC strategy?",
        answer: "Cooling-only is usually best when the vehicle mainly operates in hot climates and the buyer wants the simplest path for summer comfort.",
      },
      {
        question: "When is a heating-and-cooling parking AC worth it?",
        answer: "It is worth it when the same vehicle works across mixed climates and one system must cover more of the year.",
      },
    ],
  },
  {
    route: "/compare/parking-ac-roof-fitment-guide",
    title: "Parking AC Roof Fitment Guide | 14x14 Openings & Roof Layout - CoolDrivePro",
    description: "Check parking AC roof fitment for RVs, vans, pickups, and work vehicles. Compare standard rooftop openings, tight layouts, and the best installation branch before you buy.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/hero-product-right_1b53506e.webp",
    breadcrumbName: "Parking AC Roof Fitment Guide",
    recommendedProducts: ["/products/top-mounted-ac", "/products/nano-max", "/products/mini-split-ac"],
    faqs: [
      {
        question: "What roof opening does a typical rooftop parking AC need?",
        answer: "Many rooftop retrofit decisions start around a standard RV-style opening, but buyers should confirm both cutout size and total available roof real estate.",
      },
      {
        question: "What should buyers do if the roof layout is too tight?",
        answer: "Start by checking whether a more compact rooftop model fits the vehicle. If not, move into a format comparison instead of forcing a larger rooftop unit into a compromised layout.",
      },
    ],
  },
];

const ALL_STATIC_PAGES = [...INDEXABLE_STATIC_PAGES, ...COMMERCIAL_HUB_PAGES];

const PRODUCTS_COLLECTION_GUIDE_ROUTES = [
  "/solutions/no-idle-truck-air-conditioner",
  "/solutions/battery-powered-truck-cab-air-conditioner",
  "/solutions/off-grid-rv-air-conditioner",
  "/solutions/camper-van-parking-ac",
  "/compare/parking-ac-battery-runtime",
  "/compare/rooftop-vs-mini-split-parking-ac",
];

const PRODUCT_SUPPORT_ROUTES = {
  "/products/top-mounted-ac": [
    "/solutions/off-grid-rv-air-conditioner",
    "/solutions/no-idle-truck-air-conditioner",
    "/compare/parking-ac-roof-fitment-guide",
  ],
  "/products/mini-split-ac": [
    "/solutions/battery-powered-truck-cab-air-conditioner",
    "/solutions/camper-van-parking-ac",
    "/compare/rooftop-vs-mini-split-parking-ac",
  ],
  "/products/heating-cooling-ac": [
    "/solutions/no-idle-truck-air-conditioner",
    "/solutions/battery-powered-truck-cab-air-conditioner",
    "/compare/cooling-only-vs-heating-cooling-parking-ac",
  ],
  "/products/nano-max": [
    "/solutions/camper-van-parking-ac",
    "/solutions/off-grid-rv-air-conditioner",
    "/solutions/van-parking-ac",
  ],
};

const COMMERCIAL_SUPPORT_ROUTES = {
  "/solutions/semi-truck-parking-ac": [
    "/solutions/no-idle-truck-air-conditioner",
    "/solutions/battery-powered-truck-cab-air-conditioner",
    "/compare/rooftop-vs-mini-split-parking-ac",
    "/compare/parking-ac-battery-runtime",
  ],
  "/solutions/rv-parking-ac": [
    "/solutions/off-grid-rv-air-conditioner",
    "/compare/rooftop-vs-mini-split-parking-ac",
    "/compare/parking-ac-battery-runtime",
    "/compare/parking-ac-roof-fitment-guide",
  ],
  "/solutions/van-parking-ac": [
    "/solutions/camper-van-parking-ac",
    "/compare/parking-ac-roof-fitment-guide",
    "/compare/parking-ac-battery-runtime",
  ],
  "/solutions/battery-powered-truck-cab-air-conditioner": [
    "/solutions/no-idle-truck-air-conditioner",
    "/solutions/semi-truck-parking-ac",
    "/compare/parking-ac-battery-runtime",
    "/compare/12v-vs-24v-parking-ac",
  ],
  "/solutions/no-idle-truck-air-conditioner": [
    "/solutions/battery-powered-truck-cab-air-conditioner",
    "/solutions/semi-truck-parking-ac",
    "/compare/rooftop-vs-mini-split-parking-ac",
    "/compare/parking-ac-battery-runtime",
  ],
  "/solutions/off-grid-rv-air-conditioner": [
    "/solutions/rv-parking-ac",
    "/compare/parking-ac-battery-runtime",
    "/compare/rooftop-vs-mini-split-parking-ac",
    "/compare/parking-ac-roof-fitment-guide",
  ],
  "/solutions/camper-van-parking-ac": [
    "/solutions/van-parking-ac",
    "/compare/parking-ac-roof-fitment-guide",
    "/compare/parking-ac-battery-runtime",
  ],
  "/compare/12v-vs-24v-parking-ac": [
    "/solutions/battery-powered-truck-cab-air-conditioner",
    "/solutions/off-grid-rv-air-conditioner",
    "/solutions/camper-van-parking-ac",
  ],
  "/compare/rooftop-vs-mini-split-parking-ac": [
    "/solutions/no-idle-truck-air-conditioner",
    "/solutions/off-grid-rv-air-conditioner",
    "/solutions/camper-van-parking-ac",
  ],
  "/compare/parking-ac-battery-runtime": [
    "/solutions/battery-powered-truck-cab-air-conditioner",
    "/solutions/off-grid-rv-air-conditioner",
    "/solutions/camper-van-parking-ac",
  ],
  "/compare/cooling-only-vs-heating-cooling-parking-ac": [
    "/solutions/no-idle-truck-air-conditioner",
    "/solutions/rv-parking-ac",
    "/solutions/van-parking-ac",
  ],
  "/compare/parking-ac-roof-fitment-guide": [
    "/solutions/off-grid-rv-air-conditioner",
    "/solutions/camper-van-parking-ac",
    "/solutions/van-parking-ac",
  ],
};

const BLOG_INDEX_SUPPORT_ROUTES = [
  "/solutions/no-idle-truck-air-conditioner",
  "/solutions/off-grid-rv-air-conditioner",
  "/solutions/camper-van-parking-ac",
  "/compare/parking-ac-battery-runtime",
  "/compare/rooftop-vs-mini-split-parking-ac",
  "/products",
];

const DEFAULT_BLOG_CTA = {
  title: "Ready to Experience No-Idle Cooling?",
  description: "Explore our 12V/24V parking air conditioners and buying guides so your shortlist matches vehicle type, roof layout, and overnight runtime goals.",
  links: [
    { href: "/compare/rooftop-vs-mini-split-parking-ac/", label: "Compare Rooftop vs Mini Split" },
    { href: "/compare/parking-ac-battery-runtime/", label: "Open Battery Runtime Guide" },
    { href: "/products/top-mounted-ac/", label: "See VS02 PRO Top-Mounted AC" },
    { href: "/products/mini-split-ac/", label: "See VX3000SP Mini Split AC" },
  ],
};

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value) {
  if (typeof value === "string") {
    return value;
  }

  if (isRecord(value) && typeof value.body === "string") {
    return value.body;
  }

  return "";
}

function mergeLocalizedPost(basePost, overlayPost) {
  if (!overlayPost || !isRecord(overlayPost)) {
    return basePost;
  }

  return {
    ...basePost,
    ...overlayPost,
    title: normalizeString(overlayPost.title) || basePost.title,
    date: normalizeString(overlayPost.date) || basePost.date,
    category: normalizeString(overlayPost.category) || basePost.category,
    image: normalizeString(overlayPost.image) || basePost.image,
    imageAlt: normalizeString(overlayPost.imageAlt) || basePost.imageAlt,
    metaDescription: normalizeString(overlayPost.metaDescription) || basePost.metaDescription,
    content: Array.isArray(overlayPost.content) ? overlayPost.content : basePost.content,
  };
}

function getNestedValue(record, key) {
  return key.split(".").reduce((current, part) => (isRecord(current) ? current[part] : undefined), record);
}

async function loadLocaleMessages(locale) {
  if (!localeMessagesCache.has(locale)) {
    localeMessagesCache.set(locale, (async () => {
      try {
        const raw = await fs.readFile(path.join(I18N_LOCALES_DIR, `${locale}.json`), "utf8");
        return JSON.parse(raw);
      } catch {
        if (locale !== DEFAULT_BLOG_LANGUAGE) {
          return loadLocaleMessages(DEFAULT_BLOG_LANGUAGE);
        }
        return {};
      }
    })());
  }

  return localeMessagesCache.get(locale);
}

async function getBlogShellCopy(locale) {
  const messages = await loadLocaleMessages(locale);
  const blogTitle = normalizeString(getNestedValue(messages, "blog.title"));

  return {
    home: normalizeString(getNestedValue(messages, "nav.home")) || "Home",
    blogLabel: normalizeString(getNestedValue(messages, "nav.blog")) || "Blog",
    knowledgeBase: normalizeString(getNestedValue(messages, "blog.knowledgeBase")) || blogTitle || "CoolDrivePro Knowledge Base",
    latestGuides: normalizeString(getNestedValue(messages, "blog.latestGuides")) || blogTitle || "Latest Guides & Articles",
    pageTitle: normalizeString(getNestedValue(messages, "blog.pageTitle")) || blogTitle || "Parking AC Blog & Guides",
    pageSubtitle: normalizeString(getNestedValue(messages, "blog.pageSubtitle")) || normalizeString(getNestedValue(messages, "blog.subtitle")) || blogTitle || "Read parking air conditioner guides, truck cooling tips, RV AC buying advice, installation tutorials, and no-idle climate control insights from CoolDrivePro.",
    readMore: normalizeString(getNestedValue(messages, "blog.readMore")) || "Read More",
    readyToExperience: normalizeString(getNestedValue(messages, "blog.post.readyToExperience")) || DEFAULT_BLOG_CTA.title,
    exploreOur: normalizeString(getNestedValue(messages, "blog.post.exploreOur")) || DEFAULT_BLOG_CTA.description,
    shopTopMounted: normalizeString(getNestedValue(messages, "blog.post.shopTopMounted")) || DEFAULT_BLOG_CTA.links[2].label,
    shopMiniSplit: normalizeString(getNestedValue(messages, "blog.post.shopMiniSplit")) || DEFAULT_BLOG_CTA.links[3].label,
  };
}

async function loadBlogLocaleAvailability() {
  try {
    const raw = JSON.parse(await fs.readFile(BLOG_LOCALE_AVAILABILITY_PATH, "utf8"));
    return {
      defaultLanguage: normalizeString(raw.defaultLanguage) || DEFAULT_BLOG_LANGUAGE,
      languages: Array.isArray(raw.languages) ? raw.languages.filter((language) => typeof language === "string") : [],
      posts: isRecord(raw.posts) ? raw.posts : {},
    };
  } catch {
    return {
      defaultLanguage: DEFAULT_BLOG_LANGUAGE,
      languages: [],
      posts: {},
    };
  }
}

function buildBlogAlternateLinks(languages, routeBuilder) {
  if (!Array.isArray(languages) || languages.length <= 1) {
    return [];
  }

  return [
    ...languages.map((language) => ({
      hreflang: language,
      href: toCanonicalUrl(routeBuilder(language)),
    })),
    {
      hreflang: "x-default",
      href: toCanonicalUrl(routeBuilder(DEFAULT_BLOG_LANGUAGE)),
    },
  ];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function pageHeading(page) {
  return page.breadcrumbName || page.schema?.name || page.title.replace(/\s*\|.*$/, "").trim();
}

function routeLabel(route) {
  const staticPage = ALL_STATIC_PAGES.find((page) => page.route === route);
  if (staticPage) {
    return pageHeading(staticPage);
  }

  const productPage = PRODUCT_PAGES.find((page) => page.route === route);
  if (productPage) {
    return pageHeading(productPage);
  }

  return route;
}

function routeLinkItems(routes, currentRoute) {
  return Array.from(new Set(routes || []))
    .filter((route) => route && route !== currentRoute)
    .map((route) => ({
      href: toCanonicalPath(route),
      label: routeLabel(route),
    }));
}

function buildStaticLinkSection(title, links) {
  if (!Array.isArray(links) || links.length === 0) {
    return "";
  }

  return [
    '          <section class="static-seo-section">',
    `            <h2 class="static-seo-section-title">${escapeHtml(title)}</h2>`,
    '            <ul class="static-seo-list">',
    ...links.map((link) => `              <li><a href="${escapeAttribute(link.href)}" class="static-seo-link">${escapeHtml(link.label)}</a></li>`),
    '            </ul>',
    '          </section>',
  ].join("\n");
}

function buildStaticFaqSection(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) {
    return "";
  }

  return [
    '          <section class="static-seo-section">',
    '            <h2 class="static-seo-section-title">Common questions</h2>',
    '            <ol class="static-seo-faq-list">',
    ...faqs.map((faq) => [
      '              <li>',
      `                <strong class="static-seo-faq-question">${escapeHtml(faq.question)}</strong>`,
      `                <p class="static-seo-faq-answer">${escapeHtml(faq.answer)}</p>`,
      '              </li>',
    ].join("\n")),
    '            </ol>',
    '          </section>',
  ].join("\n");
}

function buildStaticShell({ eyebrow, heading, description, sections }) {
  return [
    '      <main data-static-seo="page" class="static-seo-shell">',
    '        <article>',
    `          <p class="static-seo-eyebrow">${escapeHtml(eyebrow)}</p>`,
    `          <h1 class="static-seo-title">${escapeHtml(heading)}</h1>`,
    `          <p class="static-seo-description">${escapeHtml(description)}</p>`,
    ...sections.filter(Boolean),
    '        </article>',
    '      </main>',
  ].join("\n");
}

function buildProductsCollectionBody(page) {
  return buildStaticShell({
    eyebrow: "CoolDrivePro Product Catalog",
    heading: pageHeading(page),
    description: normalizeDescription(page.description, 220),
    sections: [
      buildStaticLinkSection("Popular buying guides", routeLinkItems(PRODUCTS_COLLECTION_GUIDE_ROUTES, page.route)),
      buildStaticLinkSection(
        "Browse product pages",
        PRODUCT_PAGES.map((productPage) => ({
          href: toCanonicalPath(productPage.route),
          label: pageHeading(productPage),
        })),
      ),
    ],
  });
}

function buildCommercialHubBody(page) {
  const eyebrow = page.route.startsWith("/compare/") ? "CoolDrivePro Comparison Guide" : "CoolDrivePro Solution Guide";
  return buildStaticShell({
    eyebrow,
    heading: pageHeading(page),
    description: normalizeDescription(page.description, 220),
    sections: [
      buildStaticLinkSection("Related buying guides", routeLinkItems(COMMERCIAL_SUPPORT_ROUTES[page.route], page.route)),
      buildStaticLinkSection("Recommended products", routeLinkItems(page.recommendedProducts, page.route)),
      buildStaticFaqSection(page.faqs),
    ],
  });
}

function buildProductPageBody(page) {
  return buildStaticShell({
    eyebrow: "CoolDrivePro Product",
    heading: pageHeading(page),
    description: normalizeDescription(page.description, 220),
    sections: [
      buildStaticLinkSection("Best-fit buying guides", routeLinkItems(PRODUCT_SUPPORT_ROUTES[page.route], page.route)),
      buildStaticLinkSection(
        "Compare other parking AC models",
        PRODUCT_PAGES.filter((productPage) => productPage.route !== page.route).map((productPage) => ({
          href: toCanonicalPath(productPage.route),
          label: pageHeading(productPage),
        })),
      ),
    ],
  });
}

function normalizeBlogContent(content) {
  if (!Array.isArray(content)) {
    return [];
  }

  return content.map((item) => {
    if (typeof item === "string") {
      return { heading: "", body: item };
    }

    return {
      heading: typeof item?.heading === "string" ? item.heading : "",
      body: typeof item?.body === "string" ? item.body : "",
    };
  });
}

function splitBlogParagraphs(body) {
  return String(body || "")
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function buildBlogIndexArticles(posts, shellCopy, language) {
  if (!Array.isArray(posts) || posts.length === 0) {
    return "";
  }

  return [
    '          <section class="static-seo-section">',
    `            <h2 class="static-seo-section-title">${escapeHtml(shellCopy.latestGuides)}</h2>`,
    '            <div class="static-seo-article-list">',
    ...posts.map((post) => {
      const href = toCanonicalPath(toLocalizedBlogPostRoute(language, post.slug));
      const excerpt = normalizeDescription(post.excerpt || post.metaDescription || DEFAULT_DESCRIPTION, 220);
      const metaItems = [post.category, post.date].filter(Boolean).map((value) => `<span>${escapeHtml(value)}</span>`).join("");

      return [
        '              <article class="static-seo-article-card">',
        metaItems ? `                <p class="static-seo-meta">${metaItems}</p>` : "",
        `                <h3 class="static-seo-article-title"><a href="${escapeAttribute(href)}" class="static-seo-link">${escapeHtml(post.title)}</a></h3>`,
        `                <p class="static-seo-copy">${escapeHtml(excerpt)}</p>`,
        `                <p><a href="${escapeAttribute(href)}" class="static-seo-link">${escapeHtml(shellCopy.readMore)}</a></p>`,
        '              </article>',
      ].filter(Boolean).join("\n");
    }),
    '            </div>',
    '          </section>',
  ].join("\n");
}

function buildBlogIndexBody(posts, shellCopy, language) {
  return buildStaticShell({
    eyebrow: shellCopy.knowledgeBase,
    heading: shellCopy.pageTitle,
    description: shellCopy.pageSubtitle,
    sections: [
      buildBlogIndexArticles(posts, shellCopy, language),
      buildStaticLinkSection("Start with high-intent buying hubs", routeLinkItems(BLOG_INDEX_SUPPORT_ROUTES, "/blog")),
    ],
  });
}

function buildBlogPostSections(post) {
  const sections = normalizeBlogContent(post.content);
  if (sections.length === 0) {
    return [
      '          <section class="static-seo-section">',
      `            <p class="static-seo-copy">${escapeHtml(normalizeDescription(post.excerpt || post.metaDescription || DEFAULT_DESCRIPTION, 260))}</p>`,
      '          </section>',
    ];
  }

  return sections.map((section) => {
    const paragraphs = splitBlogParagraphs(section.body);
    if (!section.heading && paragraphs.length === 0) {
      return "";
    }

    return [
      '          <section class="static-seo-section">',
      section.heading ? `            <h2 class="static-seo-section-title">${escapeHtml(section.heading)}</h2>` : "",
      ...paragraphs.map((paragraph) => `            <p class="static-seo-copy">${escapeHtml(paragraph)}</p>`),
      '          </section>',
    ].filter(Boolean).join("\n");
  }).filter(Boolean);
}

function buildBlogCtaSection(cta) {
  const links = Array.isArray(cta?.links) ? cta.links : DEFAULT_BLOG_CTA.links;
  return [
    '          <section class="static-seo-section static-seo-cta">',
    `            <h2 class="static-seo-section-title">${escapeHtml(cta?.title || DEFAULT_BLOG_CTA.title)}</h2>`,
    `            <p class="static-seo-copy">${escapeHtml(cta?.description || DEFAULT_BLOG_CTA.description)}</p>`,
    '            <ul class="static-seo-list">',
    ...links.map((link) => `              <li><a href="${escapeAttribute(link.href)}" class="static-seo-link">${escapeHtml(link.label)}</a></li>`),
    '            </ul>',
    '          </section>',
  ].join("\n");
}

function buildLocalizedDefaultBlogCta(shellCopy) {
  return {
    title: shellCopy.readyToExperience,
    description: shellCopy.exploreOur,
    links: [
      { href: "/products/top-mounted-ac/", label: shellCopy.shopTopMounted },
      { href: "/products/mini-split-ac/", label: shellCopy.shopMiniSplit },
    ],
  };
}

function buildBlogPostBody(post, blogCtaOverrides, shellCopy, language) {
  const localizedDefaultCta = buildLocalizedDefaultBlogCta(shellCopy);
  const cta = language === DEFAULT_BLOG_LANGUAGE ? (blogCtaOverrides[post.slug] || localizedDefaultCta) : localizedDefaultCta;

  return [
    '      <main data-static-seo="blog-post" class="static-seo-shell">',
    '        <article>',
    `          <p class="static-seo-eyebrow">${escapeHtml(post.category || `CoolDrivePro ${shellCopy.blogLabel}`)}</p>`,
    `          <h1 class="static-seo-title">${escapeHtml(post.title)}</h1>`,
    [post.category, post.date].some(Boolean)
      ? `          <p class="static-seo-meta">${[post.category, post.date].filter(Boolean).map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</p>`
      : "",
    `          <p class="static-seo-description">${escapeHtml(normalizeDescription(post.metaDescription || post.excerpt || DEFAULT_DESCRIPTION, 220))}</p>`,
    ...buildBlogPostSections(post),
    buildBlogCtaSection(cta),
    '        </article>',
    '      </main>',
  ].filter(Boolean).join("\n");
}

function buildStaticPageBody(page) {
  if (page.route === "/products") {
    return buildProductsCollectionBody(page);
  }

  if (page.route.startsWith("/solutions/") || page.route.startsWith("/compare/")) {
    return buildCommercialHubBody(page);
  }

  return "";
}

function replaceRootContent(html, bodyContent = "") {
  const replacement = bodyContent
    ? `    <div id="root">\n${bodyContent}\n    </div>`
    : '    <div id="root"></div>';

  return html.replace(/<div id="root">[\s\S]*?<\/div>/, replacement);
}

function toAbsoluteUrl(value) {
  if (!value) {
    return DEFAULT_OG_IMAGE;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function normalizeDescription(value, maxLength = 170) {
  const normalized = String(value || DEFAULT_DESCRIPTION).replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function extractExcerptFromContent(content) {
  if (!Array.isArray(content)) {
    return DEFAULT_DESCRIPTION;
  }

  for (const item of content) {
    if (typeof item === "string" && item.trim()) {
      return normalizeDescription(item);
    }
    if (item && typeof item.body === "string" && item.body.trim()) {
      return normalizeDescription(item.body);
    }
  }

  return DEFAULT_DESCRIPTION;
}

function extractObjectLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    return "";
  }

  const startIndex = source.indexOf("{", markerIndex);
  if (startIndex === -1) {
    return "";
  }

  let depth = 0;
  let quote = "";
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = "";
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(startIndex, index + 1);
      }
    }
  }

  return "";
}

async function loadBlogCtaOverrides() {
  try {
    const source = await fs.readFile(BLOG_POST_SOURCE_PATH, "utf8");
    const objectLiteral = extractObjectLiteral(source, "const BLOG_CTA_OVERRIDES");
    if (!objectLiteral) {
      return {};
    }

    const parsed = new vm.Script(`(${objectLiteral})`).runInNewContext(Object.create(null));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.warn("Falling back to default blog CTA config because BlogPost CTA overrides could not be loaded.");
    console.warn(error);
    return {};
  }
}

function stripJsonLd(html) {
  return html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
}

function upsertTag(html, pattern, replacement) {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return html.replace("</head>", `${replacement}\n  </head>`);
}

function buildJsonLdScripts(schemas) {
  return schemas
    .filter(Boolean)
    .map((schema) => `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>`)
    .join("\n");
}

function isoDate(dateText) {
  if (!dateText) {
    return undefined;
  }

  const normalized = String(dateText).trim();
  const monthMap = {
    january: 0,
    jan: 0,
    february: 1,
    feb: 1,
    march: 2,
    mar: 2,
    april: 3,
    apr: 3,
    may: 4,
    june: 5,
    jun: 5,
    july: 6,
    jul: 6,
    august: 7,
    aug: 7,
    september: 8,
    sep: 8,
    sept: 8,
    october: 9,
    oct: 9,
    november: 10,
    nov: 10,
    december: 11,
    dec: 11,
  };

  const matched = normalized.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (matched) {
    const monthIndex = monthMap[matched[1].toLowerCase()];
    if (monthIndex !== undefined) {
      const day = Number(matched[2]);
      const year = Number(matched[3]);
      return new Date(Date.UTC(year, monthIndex, day, 0, 0, 0)).toISOString();
    }
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return new Date(Date.UTC(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate(),
    0,
    0,
    0,
  )).toISOString();
}

function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CoolDrivePro",
    url: toCanonicalUrl("/"),
    logo: DEFAULT_OG_IMAGE,
    description: "Manufacturer and retailer of 12V and 24V parking air conditioners for trucks, RVs, vans, and mobile work vehicles.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@cooldrivepro.com",
      contactType: "customer service",
      availableLanguage: "English",
    },
  };
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CoolDrivePro",
    url: toCanonicalUrl("/"),
  };
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function webPageSchema(page) {
  return {
    "@context": "https://schema.org",
    "@type": page.pageType === "collection" ? "CollectionPage" : "WebPage",
    name: page.title,
    description: page.description,
    url: toCanonicalUrl(page.route),
  };
}

function itemListSchema(name, routes) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: routes
      .map((route, index) => {
        const productPage = PRODUCT_PAGES.find((page) => page.route === route);
        if (!productPage) {
          return null;
        }
        return {
          "@type": "ListItem",
          position: index + 1,
          name: productPage.schema.name,
          url: toCanonicalUrl(productPage.route),
        };
      })
      .filter(Boolean),
  };
}

function faqPageSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function productSchema(page) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: page.schema.name,
    description: page.schema.description,
    image: toAbsoluteUrl(page.image),
    sku: page.schema.sku,
    brand: { "@type": "Brand", name: "CoolDrivePro" },
    category: "Parking Air Conditioner",
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: page.schema.price,
      availability: "https://schema.org/InStock",
      url: toCanonicalUrl(page.route),
      seller: { "@type": "Organization", name: "CoolDrivePro" },
      priceValidUntil: "2027-12-31",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: page.schema.ratingValue,
      reviewCount: page.schema.reviewCount,
    },
  };
}

function blogCollectionSchema(posts, page) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.title,
    description: page.description,
    url: toCanonicalUrl(page.route),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.slice(0, 20).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: toCanonicalUrl(toLocalizedBlogPostRoute(page.language || DEFAULT_BLOG_LANGUAGE, post.slug)),
        name: post.title,
      })),
    },
  };
}

function articleSchema(post, route) {
  const published = isoDate(post.date);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: normalizeDescription(post.metaDescription || post.excerpt || DEFAULT_DESCRIPTION),
    image: [toAbsoluteUrl(post.image)],
    datePublished: published,
    dateModified: published,
    articleSection: post.category,
    mainEntityOfPage: toCanonicalUrl(route),
    author: {
      "@type": "Organization",
      name: "CoolDrivePro",
    },
    publisher: {
      "@type": "Organization",
      name: "CoolDrivePro",
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_OG_IMAGE,
      },
    },
  };
}

function articleMetaTags(post) {
  const published = isoDate(post.date);
  const tags = [];
  if (published) {
    tags.push(`  <meta property="article:published_time" content="${escapeAttribute(published)}" />`);
  }
  if (post.category) {
    tags.push(`  <meta property="article:section" content="${escapeAttribute(post.category)}" />`);
  }
  return tags.join("\n");
}

function buildAlternateLinkTags(alternateLinks) {
  if (!Array.isArray(alternateLinks) || alternateLinks.length === 0) {
    return "";
  }

  return alternateLinks
    .map((alternateLink) => `  <link rel="alternate" hreflang="${escapeAttribute(alternateLink.hreflang)}" href="${escapeAttribute(alternateLink.href)}" />`)
    .join("\n");
}

function renderPageHtml(baseHtml, page, schemas, extraMeta = "", bodyContent = "", options = {}) {
  const language = options.lang || DEFAULT_BLOG_LANGUAGE;
  const direction = options.dir || (RTL_LANGUAGES.has(language) ? "rtl" : "ltr");
  const alternateLinks = Array.isArray(options.alternateLinks) ? options.alternateLinks : [];
  const ogLocale = toOpenGraphLocale(language);
  const canonical = toCanonicalUrl(page.route);
  const description = normalizeDescription(page.description);
  const image = toAbsoluteUrl(page.image);
  const ogType = page.ogType || "website";

  let html = stripJsonLd(baseHtml);
  html = html.replace(/<html[^>]*>/, `<html lang="${escapeAttribute(language)}" dir="${escapeAttribute(direction)}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = upsertTag(html, /<meta name="description" content="[^"]*"\s*\/?>/, `  <meta name="description" content="${escapeAttribute(description)}" />`);
  html = upsertTag(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `  <link rel="canonical" href="${escapeAttribute(canonical)}" />`);
  html = upsertTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `  <meta property="og:url" content="${escapeAttribute(canonical)}" />`);
  html = upsertTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `  <meta property="og:title" content="${escapeAttribute(page.title)}" />`);
  html = upsertTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `  <meta property="og:description" content="${escapeAttribute(description)}" />`);
  html = upsertTag(html, /<meta property="og:image" content="[^"]*"\s*\/?>/, `  <meta property="og:image" content="${escapeAttribute(image)}" />`);
  html = upsertTag(html, /<meta property="og:type" content="[^"]*"\s*\/?>/, `  <meta property="og:type" content="${escapeAttribute(ogType)}" />`);
  html = upsertTag(html, /<meta property="og:locale" content="[^"]*"\s*\/?>/, `  <meta property="og:locale" content="${escapeAttribute(ogLocale)}" />`);
  html = upsertTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `  <meta name="twitter:title" content="${escapeAttribute(page.title)}" />`);
  html = upsertTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `  <meta name="twitter:description" content="${escapeAttribute(description)}" />`);
  html = upsertTag(html, /<meta name="twitter:image" content="[^"]*"\s*\/?>/, `  <meta name="twitter:image" content="${escapeAttribute(image)}" />`);
  html = html.replace(/\s*<meta property="article:published_time" content="[^"]*"\s*\/?>/g, "");
  html = html.replace(/\s*<meta property="article:section" content="[^"]*"\s*\/?>/g, "");
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/?>/g, "");

  const injectedMeta = [extraMeta, buildAlternateLinkTags(alternateLinks), buildJsonLdScripts(schemas)].filter(Boolean).join("\n");
  html = html.replace("</head>", `${injectedMeta ? `${injectedMeta}\n` : ""}  </head>`);
  html = replaceRootContent(html, bodyContent);
  return html;
}

async function writeRoutePage(route, html) {
  const routeDir = route === "/" ? DIST_DIR : path.join(DIST_DIR, route.replace(/^\//, ""));
  await fs.mkdir(routeDir, { recursive: true });
  await fs.writeFile(path.join(routeDir, "index.html"), html, "utf8");
}

async function updateRedirects(routes) {
  const redirectsRaw = await fs.readFile(REDIRECTS_PATH, "utf8");
  const lines = redirectsRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const hostRedirectLines = [
    "https://www.cooldrivepro.com/* https://cooldrivepro.com/:splat 301",
    "http://www.cooldrivepro.com/* https://cooldrivepro.com/:splat 301",
  ];
  const fallbackLine = lines.find((line) => line.startsWith("/* ")) || "/*  /index.html  200";
  const nonFallbackLines = lines.filter(
    (line) => !line.startsWith("/* ") && !hostRedirectLines.includes(line),
  );

  const routeRules = Array.from(new Set(routes))
    .filter((route) => route && route !== "/")
    .sort((left, right) => right.length - left.length)
    .flatMap((route) => [`${route} ${route}/index.html 200`, `${route}/ ${route}/index.html 200`]);

  const finalContent = [...hostRedirectLines, ...nonFallbackLines, ...routeRules, fallbackLine].join("\n");
  await fs.writeFile(REDIRECTS_PATH, `${finalContent}\n`, "utf8");
}

function toSortTime(dateText) {
  const parsed = isoDate(dateText);
  return parsed ? new Date(parsed).getTime() : 0;
}

function sortPostsByDate(posts) {
  return posts.sort((left, right) => {
    const byDate = toSortTime(right.date) - toSortTime(left.date);
    return byDate || left.slug.localeCompare(right.slug);
  });
}

async function loadBlogPosts() {
  const files = await fs.readdir(BLOG_DATA_DIR);
  const articleFiles = files
    .filter((file) => file.endsWith(".json") && !EXCLUDED_BLOG_FILES.has(file))
    .sort();

  const posts = await Promise.all(articleFiles.map(async (file) => {
    const raw = await fs.readFile(path.join(BLOG_DATA_DIR, file), "utf8");
    const post = JSON.parse(raw);
    return {
      slug: file.replace(/\.json$/, ""),
      title: post.title,
      date: post.date,
      category: post.category,
      image: post.image,
      imageAlt: post.imageAlt,
      metaDescription: post.metaDescription,
      content: Array.isArray(post.content) ? post.content : [],
      excerpt: normalizeDescription(post.metaDescription || extractExcerptFromContent(post.content)),
    };
  }));

  return sortPostsByDate(posts);
}

async function loadLocalizedBlogPosts(basePosts, availability) {
  const basePostMap = new Map(basePosts.map((post) => [post.slug, post]));

  const localizedEntries = await Promise.all((availability.languages || []).map(async (language) => {
    const localeDir = path.join(BLOG_LOCALES_DIR, language);
    const localizedSlugs = Object.entries(availability.posts || {})
      .filter(([, languages]) => Array.isArray(languages) && languages.includes(language))
      .map(([slug]) => slug);

    const localizedPosts = await Promise.all(localizedSlugs.map(async (slug) => {
      const basePost = basePostMap.get(slug);
      if (!basePost) {
        return null;
      }

      try {
        const overlay = JSON.parse(await fs.readFile(path.join(localeDir, `${slug}.json`), "utf8"));
        const merged = mergeLocalizedPost(basePost, overlay);
        return {
          ...merged,
          slug,
          excerpt: normalizeDescription(merged.metaDescription || extractExcerptFromContent(merged.content)),
        };
      } catch {
        return null;
      }
    }));

    return [language, sortPostsByDate(localizedPosts.filter(Boolean))];
  }));

  return Object.fromEntries(localizedEntries);
}

function toLastmodDate(dateText) {
  const parsed = isoDate(dateText);
  return parsed ? parsed.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function getBaseRoute(route) {
  const localizedMatch = route.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(\/.*)?$/);
  if (localizedMatch && SITE_LANGUAGES.includes(localizedMatch[1])) {
    return localizedMatch[2] || "/";
  }

  return route;
}

function getSitemapDefaults(route) {
  const baseRoute = getBaseRoute(route);

  if (baseRoute === "/") {
    return { changefreq: "weekly", priority: "1.0" };
  }

  if (baseRoute === "/products" || baseRoute.startsWith("/products/")) {
    return { changefreq: baseRoute === "/products" ? "weekly" : "monthly", priority: "0.9" };
  }

  if (baseRoute === "/blog" || /\/blog\/[^/]+$/.test(baseRoute)) {
    return { changefreq: baseRoute === "/blog" ? "weekly" : "monthly", priority: baseRoute === "/blog" ? "0.8" : "0.6" };
  }

  if (baseRoute.startsWith("/solutions/") || baseRoute.startsWith("/compare/") || baseRoute === "/about" || baseRoute === "/contact") {
    return { changefreq: "monthly", priority: "0.8" };
  }

  if (baseRoute.startsWith("/features/") || baseRoute === "/brand-knowledge") {
    return { changefreq: "monthly", priority: "0.7" };
  }

  if (baseRoute === "/forum" || baseRoute === "/support") {
    return { changefreq: baseRoute === "/forum" ? "weekly" : "monthly", priority: "0.6" };
  }

  if (baseRoute === "/privacy-policy") {
    return { changefreq: "yearly", priority: "0.3" };
  }

  if (["/warranty", "/return-policy", "/shipping-policy"].includes(baseRoute)) {
    return { changefreq: "yearly", priority: "0.5" };
  }

  return { changefreq: "monthly", priority: "0.5" };
}

function createSitemapEntry(route, options = {}) {
  const defaults = getSitemapDefaults(route);
  return {
    route,
    lastmod: options.lastmod || new Date().toISOString().slice(0, 10),
    changefreq: options.changefreq || defaults.changefreq,
    priority: options.priority || defaults.priority,
    alternates: Array.isArray(options.alternates) ? options.alternates : [],
  };
}

function buildSitemapXml(entries) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map((entry) => [
      '  <url>',
      `    <loc>${escapeHtml(toCanonicalUrl(entry.route))}</loc>`,
      ...(entry.alternates || []).map((alternateLink) => `    <xhtml:link rel="alternate" hreflang="${escapeAttribute(alternateLink.hreflang)}" href="${escapeAttribute(alternateLink.href)}" />`),
      `    <lastmod>${escapeHtml(entry.lastmod)}</lastmod>`,
      `    <changefreq>${escapeHtml(entry.changefreq)}</changefreq>`,
      `    <priority>${escapeHtml(entry.priority)}</priority>`,
      '  </url>',
    ].join("\n")),
    '</urlset>',
    '',
  ].join("\n");
}

async function writeSitemap(entries) {
  const sitemapXml = buildSitemapXml(entries);
  await Promise.all([
    fs.writeFile(path.join(DIST_DIR, "sitemap.xml"), sitemapXml, "utf8"),
    fs.writeFile(PUBLIC_SITEMAP_PATH, sitemapXml, "utf8"),
  ]);
}

async function main() {
  const [baseHtml, blogPosts, blogCtaOverrides, blogLocaleAvailability] = await Promise.all([
    fs.readFile(BASE_HTML_PATH, "utf8"),
    loadBlogPosts(),
    loadBlogCtaOverrides(),
    loadBlogLocaleAvailability(),
  ]);
  const localizedBlogPostsByLanguage = await loadLocalizedBlogPosts(blogPosts, blogLocaleAvailability);
  const blogLanguages = Array.from(new Set([
    DEFAULT_BLOG_LANGUAGE,
    ...(blogLocaleAvailability.languages || []).filter((language) => typeof language === "string" && language !== DEFAULT_BLOG_LANGUAGE),
  ]));
  const siteLanguages = Array.from(new Set([DEFAULT_BLOG_LANGUAGE, ...SITE_LANGUAGES.filter((language) => language !== DEFAULT_BLOG_LANGUAGE)]));
  let generatedPages = 0;
  const generatedRoutes = [];
  const sitemapEntries = [createSitemapEntry("/", { alternates: buildStaticAlternateLinks("/", siteLanguages) })];

  const trackGeneratedPage = (route, options = {}) => {
    generatedRoutes.push(route);
    sitemapEntries.push(createSitemapEntry(route, options));
    generatedPages += 1;
  };

  const homepageAlternateLinks = buildStaticAlternateLinks("/", siteLanguages);
  const homepage = {
    route: "/",
    title: "Parking Air Conditioner | 12V 24V No-Idle AC – CoolDrivePro",
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_OG_IMAGE,
    ogType: "website",
  };
  const homepageHtml = renderPageHtml(baseHtml, homepage, [
    organizationSchema(),
    websiteSchema(),
    webPageSchema(homepage),
  ], "", "", {
    lang: DEFAULT_BLOG_LANGUAGE,
    alternateLinks: homepageAlternateLinks,
  });
  await writeRoutePage("/", homepageHtml);

  for (const language of siteLanguages.filter((language) => language !== DEFAULT_BLOG_LANGUAGE)) {
    const localizedHomepage = {
      ...homepage,
      route: toLocalizedStaticRoute(language, "/"),
    };
    const localizedHomepageHtml = renderPageHtml(baseHtml, localizedHomepage, [
      organizationSchema(),
      websiteSchema(),
      webPageSchema(localizedHomepage),
    ], "", "", {
      lang: language,
      alternateLinks: homepageAlternateLinks,
    });
    await writeRoutePage(localizedHomepage.route, localizedHomepageHtml);
    trackGeneratedPage(localizedHomepage.route, { alternates: homepageAlternateLinks });
  }

  for (const page of [...INDEXABLE_STATIC_PAGES, ...COMMERCIAL_HUB_PAGES]) {
    const staticAlternateLinks = buildStaticAlternateLinks(page.route, siteLanguages);
    const schemas = [
      organizationSchema(),
      websiteSchema(),
      webPageSchema(page),
      breadcrumbSchema([
        { name: "Home", url: toCanonicalUrl("/") },
        { name: page.breadcrumbName || page.title.replace(/\s*\|.*$/, ""), url: toCanonicalUrl(page.route) },
      ]),
    ];

    if (page.route === "/products") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "CoolDrivePro Parking Air Conditioner Product Catalog",
        itemListElement: PRODUCT_PAGES.map((productPage, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: productPage.schema.name,
          url: toCanonicalUrl(productPage.route),
        })),
      });
    }

    if (Array.isArray(page.recommendedProducts) && page.recommendedProducts.length > 0) {
      schemas.push(itemListSchema(`${page.breadcrumbName || page.title} Recommended Products`, page.recommendedProducts));
    }

    if (Array.isArray(page.faqs) && page.faqs.length > 0) {
      schemas.push(faqPageSchema(page.faqs));
    }

    const html = renderPageHtml(baseHtml, page, schemas, "", buildStaticPageBody(page), {
      lang: DEFAULT_BLOG_LANGUAGE,
      alternateLinks: staticAlternateLinks,
    });
    await writeRoutePage(page.route, html);
    trackGeneratedPage(page.route, { alternates: staticAlternateLinks });

    for (const language of siteLanguages.filter((candidate) => candidate !== DEFAULT_BLOG_LANGUAGE)) {
      const localizedRoute = toLocalizedStaticRoute(language, page.route);
      const localizedHtml = renderPageHtml(baseHtml, { ...page, route: localizedRoute }, schemas, "", buildStaticPageBody(page), {
        lang: language,
        alternateLinks: staticAlternateLinks,
      });
      await writeRoutePage(localizedRoute, localizedHtml);
      trackGeneratedPage(localizedRoute, { alternates: staticAlternateLinks });
    }
  }

  for (const page of PRODUCT_PAGES) {
    const staticAlternateLinks = buildStaticAlternateLinks(page.route, siteLanguages);
    const schemas = [
      organizationSchema(),
      websiteSchema(),
      productSchema(page),
      breadcrumbSchema([
        { name: "Home", url: toCanonicalUrl("/") },
        { name: "Products", url: toCanonicalUrl("/products") },
        { name: page.schema.name, url: toCanonicalUrl(page.route) },
      ]),
    ];

    const html = renderPageHtml(baseHtml, { ...page, ogType: "product" }, schemas, "", buildProductPageBody(page), {
      lang: DEFAULT_BLOG_LANGUAGE,
      alternateLinks: staticAlternateLinks,
    });
    await writeRoutePage(page.route, html);
    trackGeneratedPage(page.route, { alternates: staticAlternateLinks });

    for (const language of siteLanguages.filter((candidate) => candidate !== DEFAULT_BLOG_LANGUAGE)) {
      const localizedRoute = toLocalizedStaticRoute(language, page.route);
      const localizedHtml = renderPageHtml(baseHtml, { ...page, route: localizedRoute, ogType: "product" }, schemas, "", buildProductPageBody(page), {
        lang: language,
        alternateLinks: staticAlternateLinks,
      });
      await writeRoutePage(localizedRoute, localizedHtml);
      trackGeneratedPage(localizedRoute, { alternates: staticAlternateLinks });
    }
  }

  const englishBlogShell = await getBlogShellCopy(DEFAULT_BLOG_LANGUAGE);
  const blogIndexAlternateLinks = buildBlogAlternateLinks(blogLanguages, (language) => toLocalizedBlogIndexRoute(language));
  const blogIndexPage = {
    route: "/blog",
    language: DEFAULT_BLOG_LANGUAGE,
    title: `${englishBlogShell.pageTitle} | CoolDrivePro`,
    description: englishBlogShell.pageSubtitle,
    image: blogPosts[0]?.image || DEFAULT_OG_IMAGE,
    ogType: "website",
  };
  const blogIndexHtml = renderPageHtml(baseHtml, blogIndexPage, [
    organizationSchema(),
    websiteSchema(),
    blogCollectionSchema(blogPosts, blogIndexPage),
    breadcrumbSchema([
      { name: englishBlogShell.home, url: toCanonicalUrl("/") },
      { name: englishBlogShell.blogLabel, url: toCanonicalUrl("/blog") },
    ]),
  ], "", buildBlogIndexBody(blogPosts, englishBlogShell, DEFAULT_BLOG_LANGUAGE), {
    lang: DEFAULT_BLOG_LANGUAGE,
    alternateLinks: blogIndexAlternateLinks,
  });
  await writeRoutePage("/blog", blogIndexHtml);
  trackGeneratedPage("/blog", {
    alternates: blogIndexAlternateLinks,
  });

  for (const language of blogLanguages.filter((language) => language !== DEFAULT_BLOG_LANGUAGE)) {
    const localizedPosts = localizedBlogPostsByLanguage[language] || [];
    if (localizedPosts.length === 0) {
      continue;
    }

    const shellCopy = await getBlogShellCopy(language);
    const localizedIndexPage = {
      route: toLocalizedBlogIndexRoute(language),
      language,
      title: `${shellCopy.pageTitle} | CoolDrivePro`,
      description: shellCopy.pageSubtitle,
      image: localizedPosts[0]?.image || blogPosts[0]?.image || DEFAULT_OG_IMAGE,
      ogType: "website",
    };

    const localizedIndexHtml = renderPageHtml(baseHtml, localizedIndexPage, [
      organizationSchema(),
      websiteSchema(),
      blogCollectionSchema(localizedPosts, localizedIndexPage),
      breadcrumbSchema([
        { name: shellCopy.home, url: toCanonicalUrl("/") },
        { name: shellCopy.blogLabel, url: toCanonicalUrl(localizedIndexPage.route) },
      ]),
    ], "", buildBlogIndexBody(localizedPosts, shellCopy, language), {
      lang: language,
      alternateLinks: blogIndexAlternateLinks,
    });

    await writeRoutePage(localizedIndexPage.route, localizedIndexHtml);
    trackGeneratedPage(localizedIndexPage.route, {
      alternates: blogIndexAlternateLinks,
    });
  }

  for (const post of blogPosts) {
    const postLanguages = Array.from(new Set([
      DEFAULT_BLOG_LANGUAGE,
      ...((blogLocaleAvailability.posts?.[post.slug] || []).filter((language) => typeof language === "string" && language !== DEFAULT_BLOG_LANGUAGE)),
    ]));
    const postAlternateLinks = buildBlogAlternateLinks(postLanguages, (language) => toLocalizedBlogPostRoute(language, post.slug));
    const page = {
      route: `/blog/${post.slug}`,
      language: DEFAULT_BLOG_LANGUAGE,
      title: `${post.title} | CoolDrivePro Blog`,
      description: post.metaDescription || post.excerpt || DEFAULT_DESCRIPTION,
      image: post.image || DEFAULT_OG_IMAGE,
      ogType: "article",
    };

    const html = renderPageHtml(baseHtml, page, [
      organizationSchema(),
      websiteSchema(),
      articleSchema(post, page.route),
      breadcrumbSchema([
        { name: englishBlogShell.home, url: toCanonicalUrl("/") },
        { name: englishBlogShell.blogLabel, url: toCanonicalUrl("/blog") },
        { name: post.title, url: toCanonicalUrl(`/blog/${post.slug}`) },
      ]),
    ], articleMetaTags(post), buildBlogPostBody(post, blogCtaOverrides, englishBlogShell, DEFAULT_BLOG_LANGUAGE), {
      lang: DEFAULT_BLOG_LANGUAGE,
      alternateLinks: postAlternateLinks,
    });

    await writeRoutePage(page.route, html);
    trackGeneratedPage(page.route, {
      lastmod: toLastmodDate(post.date),
      alternates: postAlternateLinks,
    });

    for (const language of postLanguages.filter((value) => value !== DEFAULT_BLOG_LANGUAGE)) {
      const localizedPost = (localizedBlogPostsByLanguage[language] || []).find((candidate) => candidate.slug === post.slug);
      if (!localizedPost) {
        continue;
      }

      const shellCopy = await getBlogShellCopy(language);
      const localizedPage = {
        route: toLocalizedBlogPostRoute(language, post.slug),
        language,
        title: `${localizedPost.title} | CoolDrivePro ${shellCopy.blogLabel}`,
        description: localizedPost.metaDescription || localizedPost.excerpt || DEFAULT_DESCRIPTION,
        image: localizedPost.image || DEFAULT_OG_IMAGE,
        ogType: "article",
      };

      const localizedHtml = renderPageHtml(baseHtml, localizedPage, [
        organizationSchema(),
        websiteSchema(),
        articleSchema(localizedPost, localizedPage.route),
        breadcrumbSchema([
          { name: shellCopy.home, url: toCanonicalUrl("/") },
          { name: shellCopy.blogLabel, url: toCanonicalUrl(toLocalizedBlogIndexRoute(language)) },
          { name: localizedPost.title, url: toCanonicalUrl(localizedPage.route) },
        ]),
      ], articleMetaTags(localizedPost), buildBlogPostBody(localizedPost, blogCtaOverrides, shellCopy, language), {
        lang: language,
        alternateLinks: postAlternateLinks,
      });

      await writeRoutePage(localizedPage.route, localizedHtml);
      trackGeneratedPage(localizedPage.route, {
        lastmod: toLastmodDate(localizedPost.date || post.date),
        alternates: postAlternateLinks,
      });
    }
  }

  await updateRedirects(generatedRoutes);
  await writeSitemap(sitemapEntries);

  console.log(`Generated ${generatedPages} static SEO HTML pages.`);
}

main().catch((error) => {
  console.error("Failed to generate static SEO pages.");
  console.error(error);
  process.exit(1);
});