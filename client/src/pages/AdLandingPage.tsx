import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams } from "wouter";
import { trackGoogleAdsConversion } from "@/lib/googleAds";
import { buildLeadEmailBody, collectLeadAttribution, submitToWeb3Forms, WEB3FORMS_KEY } from "@/lib/leadForms";

type LandingKey = "truck-parking-ac" | "fleet-parking-ac-roi" | "rv-van-12v-ac" | "distributor-parking-ac";
type IconName = "arrow-right" | "battery" | "calculator" | "check" | "chevron-right" | "clock" | "factory" | "fuel" | "globe" | "mail" | "message" | "package" | "shield" | "snowflake" | "truck" | "users" | "wrench" | "zap";

interface Metric {
  label: string;
  value: string;
}

interface ProductCard {
  name: string;
  fit: string;
  specs: string;
  href: string;
}

interface LandingPageConfig {
  slug: LandingKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  audience: string;
  heroImage: string;
  heroAlt: string;
  primaryCta: string;
  secondaryCta: string;
  formTitle: string;
  formSubtitle: string;
  formSubject: string;
  conversionAudience: string;
  seoTitle: string;
  seoDescription: string;
  metrics: Metric[];
  pains: string[];
  benefits: Array<{ icon: IconName; title: string; body: string }>;
  products: ProductCard[];
  proof: string[];
  process: string[];
  faqs: Array<{ question: string; answer: string }>;
}

const WHATSAPP_HREF = "https://wa.me/8618561534326?text=Hi%2C%20I%27m%20interested%20in%20CoolDrivePro%20parking%20air%20conditioners.%20Please%20send%20pricing%20and%20recommendations.";

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "arrow-right" && <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>}
      {name === "battery" && <><rect width="16" height="10" x="2" y="7" rx="2" /><path d="M22 11v2" /><path d="m11 9-2 3h3l-2 3" /></>}
      {name === "calculator" && <><rect width="16" height="20" x="4" y="2" rx="2" /><path d="M8 6h8" /><path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></>}
      {name === "check" && <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>}
      {name === "chevron-right" && <path d="m9 18 6-6-6-6" />}
      {name === "clock" && <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>}
      {name === "factory" && <><path d="M3 21h18" /><path d="M5 21V8l6 4V8l6 4V3h2v18" /><path d="M9 17h1" /><path d="M14 17h1" /></>}
      {name === "fuel" && <><path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" /><path d="M7 7h4" /><path d="M15 8h2a2 2 0 0 1 2 2v7a2 2 0 0 0 2 2" /><path d="M19 8l-2-2" /></>}
      {name === "globe" && <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 0 20" /><path d="M12 2a15.3 15.3 0 0 0 0 20" /></>}
      {name === "mail" && <><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-10 6L2 7" /></>}
      {name === "message" && <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /></>}
      {name === "package" && <><path d="m7.5 4.3 9 5.2" /><path d="M21 8.5v7a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4a2 2 0 0 1-1-1.7v-7a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4a2 2 0 0 1 1 1.7Z" /><path d="M3.3 7.5 12 12.5l8.7-5" /><path d="M12 22V12.5" /></>}
      {name === "shield" && <><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z" /><path d="m9 12 2 2 4-4" /></>}
      {name === "snowflake" && <><path d="M12 2v20" /><path d="m17 5-5 5-5-5" /><path d="m17 19-5-5-5 5" /><path d="M2 12h20" /><path d="m5 7 5 5-5 5" /><path d="m19 7-5 5 5 5" /></>}
      {name === "truck" && <><path d="M10 17h4V5H2v12h3" /><path d="M14 17h1" /><path d="M15 17h4" /><path d="M14 8h4l4 4v5h-3" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></>}
      {name === "users" && <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
      {name === "wrench" && <><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18v3h3l6.7-6.7a4 4 0 0 0 5-5l-2.9 2.9-2-2z" /></>}
      {name === "zap" && <path d="M13 2 3 14h8l-1 8 10-12h-8z" />}
    </svg>
  );
}

interface LandingSEOOptions {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
}

function setMetaContent(selector: string, content: string) {
  const meta = document.querySelector<HTMLMetaElement>(selector);
  if (meta) meta.content = content;
}

function useLandingSEO({ title, description, canonical, ogImage, jsonLd }: LandingSEOOptions) {
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    document.title = title;

    let canonicalTag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.rel = "canonical";
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = canonical;

    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:url"]', canonical);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', description);

    if (ogImage) {
      setMetaContent('meta[property="og:image"]', ogImage);
      setMetaContent('meta[name="twitter:image"]', ogImage);
    }

    document.querySelector('script[data-page-ld="true"]')?.remove();
    if (jsonLdText) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.pageLd = "true";
      script.textContent = jsonLdText;
      document.head.appendChild(script);
    }
  }, [canonical, description, jsonLdText, ogImage, title]);
}

function LandingShell({ children, onQuoteClick, onWhatsAppClick }: { children: ReactNode; onQuoteClick?: () => void; onWhatsAppClick?: () => void }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 lg:px-8">
          <a href="/" aria-label="CoolDrivePro home" className="flex flex-none items-center gap-2 text-slate-950">
            <img
              src="/logo.png"
              alt="CoolDrivePro"
              width="40"
              height="40"
              decoding="async"
              fetchPriority="high"
              className="h-9 w-9 rounded-sm object-contain"
            />
            <span className="text-lg font-extrabold tracking-normal sm:text-xl">CoolDrivePro</span>
          </a>
          <nav className="flex items-center gap-2" aria-label="Landing page actions">
            <button type="button" onClick={onQuoteClick} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
              Get quote
            </button>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsAppClick}
              className="hidden min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:border-blue-300 hover:bg-blue-50 sm:inline-flex"
            >
              <Icon name="message" className="h-4 w-4 text-blue-600" />
              WhatsApp
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-8 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <div className="font-extrabold text-white">CoolDrivePro</div>
            <div className="mt-1">12V and 24V no-idle parking air conditioners for trucks, RVs, vans, and fleets.</div>
          </div>
          <a href="mailto:support@cooldrivepro.com" className="font-semibold text-blue-200 hover:text-white">support@cooldrivepro.com</a>
        </div>
      </footer>
    </div>
  );
}

const LANDING_PAGES: Record<LandingKey, LandingPageConfig> = {
  "truck-parking-ac": {
    slug: "truck-parking-ac",
    eyebrow: "12V / 24V truck parking AC",
    title: "No-idle cooling for sleeper cabs and work trucks",
    subtitle: "CoolDrivePro parking air conditioners help drivers rest in a cool cab without running the engine through overnight stops, loading queues, and hot midday breaks.",
    audience: "Semi trucks, sleeper cabs, utility trucks, vans, and mixed commercial fleets",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-01-hero_d84a64e3.webp",
    heroAlt: "CoolDrivePro VS02 PRO top-mounted truck parking air conditioner",
    primaryCta: "Get truck AC quote",
    secondaryCta: "Chat on WhatsApp",
    formTitle: "Send your truck cooling request",
    formSubtitle: "Tell us the vehicle type, voltage, and quantity. We will reply with model guidance and pricing.",
    formSubject: "Truck parking AC quote request",
    conversionAudience: "truck",
    seoTitle: "Truck Parking AC Landing Page | No-Idle 12V 24V Cooling - CoolDrivePro",
    seoDescription: "Google Ads landing page for CoolDrivePro truck parking AC units. 12V and 24V no-idle cooling for sleeper cabs, semi trucks, and work trucks.",
    metrics: [
      { label: "Cooling range", value: "7,500-12,000 BTU" },
      { label: "Power", value: "12V / 24V DC" },
      { label: "Use case", value: "No-idle parking" },
    ],
    pains: [
      "Engine idling burns fuel and increases maintenance cost.",
      "Drivers need stable overnight cooling during rest periods.",
      "Generic RV units often need shore power or a generator.",
    ],
    benefits: [
      { icon: "truck", title: "Built for vehicle cabins", body: "Top-mounted and split options for sleeper cabs, commercial vans, light trucks, and RVs." },
      { icon: "battery", title: "Battery-powered operation", body: "Runs from 12V or 24V vehicle battery systems with undervoltage protection." },
      { icon: "snowflake", title: "Cooling while parked", body: "Comfort-focused DC cooling for stops, rest breaks, and overnight parking without engine idling." },
      { icon: "wrench", title: "Model guidance", body: "Share the vehicle and voltage. We recommend the right model before quoting." },
    ],
    products: [
      { name: "VS02 PRO Top-Mounted AC", fit: "Semi trucks, RVs, vans", specs: "12V / 24V, up to 12,000 BTU", href: "/products/top-mounted-ac" },
      { name: "VX3000SP Mini Split AC", fit: "Sleeper cabs and quiet cabins", specs: "Split design, quiet indoor unit", href: "/products/mini-split-ac" },
      { name: "Nano Max", fit: "Light trucks and compact vans", specs: "Compact 12V / 24V platform", href: "/products/nano-max" },
    ],
    proof: ["Factory-direct product guidance", "12V and 24V model coverage", "Quote response for single units and fleet orders"],
    process: ["Send vehicle type and voltage", "Receive model recommendation", "Confirm quantity and delivery market", "Get quote and next-step support"],
    faqs: [
      { question: "Can a parking AC run without the truck engine?", answer: "Yes. CoolDrivePro parking AC units are designed for DC battery operation while parked, so the engine does not need to idle for cab cooling." },
      { question: "Should I choose top-mounted or mini split?", answer: "Top-mounted units are simpler for many roof installs. Mini split units are better when the cabin needs quieter indoor operation or a split installation layout." },
      { question: "Do you support 24V trucks?", answer: "Yes. Several CoolDrivePro options support 12V and 24V systems. Share your vehicle voltage before ordering." },
    ],
  },
  "fleet-parking-ac-roi": {
    slug: "fleet-parking-ac-roi",
    eyebrow: "Fleet no-idle cooling ROI",
    title: "Reduce idle fuel cost with battery-powered parking AC",
    subtitle: "For fleet managers comparing diesel idling, APUs, and DC parking AC, CoolDrivePro helps map the cooling option to fleet size, duty cycle, and target payback.",
    audience: "Fleet operators, procurement teams, distributors, and operations managers",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-03-top-fans_d671776f.webp",
    heroAlt: "CoolDrivePro condenser fan detail for fleet parking AC systems",
    primaryCta: "Request fleet ROI review",
    secondaryCta: "Send idle hours",
    formTitle: "Get fleet pricing and ROI input",
    formSubtitle: "Send fleet size, idle hours, and target market. We will reply with a practical model and procurement path.",
    formSubject: "Fleet parking AC ROI request",
    conversionAudience: "fleet_roi",
    seoTitle: "Fleet Parking AC ROI Landing Page | CoolDrivePro",
    seoDescription: "Landing page for fleet parking AC ROI and no-idle cooling inquiries. Compare battery-powered truck AC options for fleet cost control.",
    metrics: [
      { label: "Audience", value: "Fleet buyers" },
      { label: "Goal", value: "Lower idle cost" },
      { label: "Quote type", value: "Fleet pricing" },
    ],
    pains: [
      "Fuel waste from long rest-period idling is hard to control across fleets.",
      "Driver comfort affects retention and compliance behavior.",
      "APUs can be costly when a lighter cooling-only system is enough.",
    ],
    benefits: [
      { icon: "fuel", title: "Idle reduction focus", body: "Position parking AC as a targeted cooling alternative for rest periods and loading delays." },
      { icon: "calculator", title: "ROI-ready conversation", body: "Use fleet size and idle hours to frame payback instead of only comparing unit price." },
      { icon: "users", title: "Fleet and distributor support", body: "Handle single-region pilots, batch procurement, and reseller inquiries through one flow." },
      { icon: "shield", title: "Battery protection", body: "Undervoltage protection helps preserve starting confidence when AC runs while parked." },
    ],
    products: [
      { name: "VS02 PRO Top-Mounted AC", fit: "Standardized fleet installs", specs: "12V / 24V DC platform", href: "/products/top-mounted-ac" },
      { name: "VX3000SP Mini Split AC", fit: "Premium sleeper comfort", specs: "Quiet split cabin cooling", href: "/products/mini-split-ac" },
      { name: "Heating & Cooling AC", fit: "Seasonal fleet markets", specs: "Cooling and heating option", href: "/products/heating-cooling-ac" },
    ],
    proof: ["Fleet-size inquiry flow", "Pilot-to-batch quoting", "Landing page built for Google Ads conversion tracking"],
    process: ["Send fleet size and idle hours", "Choose pilot vehicle type", "Receive recommended model mix", "Review quote and batch plan"],
    faqs: [
      { question: "Can you help estimate fuel savings?", answer: "Yes. Send fleet size, average idle hours, and operating region. We can provide a practical starting point for comparing idle cooling alternatives." },
      { question: "Should fleets test one vehicle first?", answer: "Usually yes. A small pilot helps confirm runtime, install workflow, driver acceptance, and climate performance before batch ordering." },
      { question: "Are WhatsApp and email supported for procurement?", answer: "Yes. The landing page supports form inquiries and chat handoff for faster purchasing conversations." },
    ],
  },
  "rv-van-12v-ac": {
    slug: "rv-van-12v-ac",
    eyebrow: "12V cooling for RVs and vans",
    title: "Battery-powered AC for RVs, vans, and light trucks",
    subtitle: "A compact DC parking AC page for buyers who need off-grid cooling without relying on shore power, campsite hookups, or a generator running beside the vehicle.",
    audience: "RV owners, camper vans, light trucks, overland vehicles, and mobile work vehicles",
    heroImage: "/images/products/nano-max-01.webp",
    heroAlt: "CoolDrivePro Nano Max compact 12V 24V parking AC for vans and light trucks",
    primaryCta: "Get 12V AC recommendation",
    secondaryCta: "Ask model fit",
    formTitle: "Find the right 12V or 24V model",
    formSubtitle: "Share your vehicle, battery setup, and cooling target. We will recommend a practical option.",
    formSubject: "RV and van 12V AC recommendation request",
    conversionAudience: "rv_van",
    seoTitle: "12V RV and Van Air Conditioner Landing Page | CoolDrivePro",
    seoDescription: "Google Ads landing page for 12V and 24V battery-powered AC options for RVs, camper vans, light trucks, and off-grid vehicle cooling.",
    metrics: [
      { label: "Best fit", value: "RV / van / truck" },
      { label: "Voltage", value: "12V / 24V DC" },
      { label: "Install style", value: "Compact roof AC" },
    ],
    pains: [
      "Shore power is not always available during travel or work stops.",
      "Generator noise is a poor fit for quiet overnight parking.",
      "Oversized AC can drain batteries faster than needed.",
    ],
    benefits: [
      { icon: "zap", title: "DC battery cooling", body: "Designed around vehicle battery systems instead of household AC power." },
      { icon: "snowflake", title: "Compact comfort", body: "Nano Max targets smaller cabins where size, roof profile, and current draw matter." },
      { icon: "battery", title: "Solar-friendly planning", body: "Pair model guidance with your battery and charging setup before purchase." },
      { icon: "package", title: "Use-case matching", body: "Tell us RV, van, pickup, or work vehicle so we can match capacity and fit." },
    ],
    products: [
      { name: "Nano Max", fit: "Light trucks, vans, compact RVs", specs: "10,000 BTU, 12V / 24V", href: "/products/nano-max" },
      { name: "VS02 PRO Top-Mounted AC", fit: "Larger RVs and vans", specs: "Up to 12,000 BTU", href: "/products/top-mounted-ac" },
      { name: "VX3000SP Mini Split AC", fit: "Custom van builds", specs: "Split installation option", href: "/products/mini-split-ac" },
    ],
    proof: ["Compact vehicle-focused product line", "Battery and voltage guidance", "Form and chat support for fit questions"],
    process: ["Send vehicle model", "Share battery voltage and capacity", "Describe cooling environment", "Receive product recommendation"],
    faqs: [
      { question: "Is this the same as a home portable AC?", answer: "No. CoolDrivePro parking AC units are vehicle DC systems designed for mobile cabins and parking use." },
      { question: "Can it run from solar?", answer: "The AC runs from the battery system. Solar can recharge the battery bank, so the right answer depends on solar size, battery capacity, and climate." },
      { question: "Which model is best for a van?", answer: "Nano Max is the compact starting point. Larger vans or hotter climates may need a higher-capacity model." },
    ],
  },
  "distributor-parking-ac": {
    slug: "distributor-parking-ac",
    eyebrow: "Parking AC distributor inquiries",
    title: "Factory-direct parking AC supply for dealers and regional partners",
    subtitle: "A focused page for distributors, installers, and commercial buyers looking for 12V and 24V parking AC product supply, technical materials, and repeat-order support.",
    audience: "Distributors, installers, dealers, regional importers, and B2B procurement teams",
    heroImage: "/images/products/vx3000-split-system-diagram.webp",
    heroAlt: "CoolDrivePro mini split parking AC system diagram for distributor inquiries",
    primaryCta: "Request distributor terms",
    secondaryCta: "Send market details",
    formTitle: "Start distributor conversation",
    formSubtitle: "Tell us your region, sales channel, and expected monthly demand. We will reply with fit and next steps.",
    formSubject: "Distributor parking AC partnership request",
    conversionAudience: "distributor",
    seoTitle: "Parking AC Distributor Landing Page | CoolDrivePro B2B Supply",
    seoDescription: "Distributor landing page for CoolDrivePro 12V and 24V parking air conditioners. Factory-direct product supply for dealers, installers, and regional partners.",
    metrics: [
      { label: "Buyer type", value: "B2B partners" },
      { label: "Products", value: "12V / 24V AC" },
      { label: "Support", value: "Dealer inquiry" },
    ],
    pains: [
      "Dealers need a product range that covers trucks, vans, RVs, and fleets.",
      "Installers need clear model fit and technical guidance before stocking.",
      "Regional buyers need stable communication before committing to repeat orders.",
    ],
    benefits: [
      { icon: "factory", title: "Factory-direct positioning", body: "Discuss product range, quote structure, and channel fit directly with CoolDrivePro." },
      { icon: "globe", title: "Regional market fit", body: "Share country and vehicle segment so we can focus the product mix for your market." },
      { icon: "package", title: "Product range coverage", body: "Top-mounted, mini split, compact, and heating-cooling options for different vehicle niches." },
      { icon: "message", title: "Fast qualification", body: "Use form or chat to qualify market, quantity, and support needs quickly." },
    ],
    products: [
      { name: "VS02 PRO", fit: "Mainstream truck and RV demand", specs: "Top-mounted 12V / 24V", href: "/products/top-mounted-ac" },
      { name: "VX3000SP", fit: "Premium split AC buyers", specs: "Mini split platform", href: "/products/mini-split-ac" },
      { name: "Nano Max", fit: "Light truck and van channels", specs: "Compact roof unit", href: "/products/nano-max" },
    ],
    proof: ["B2B inquiry route", "Multiple vehicle segments", "Google Ads tracking for distributor lead quality"],
    process: ["Send company and market", "Share target vehicles", "Confirm expected demand", "Discuss terms and materials"],
    faqs: [
      { question: "Can dealers request multiple models?", answer: "Yes. Distributor inquiries can cover the full CoolDrivePro product range so the first conversation can focus on the best market fit." },
      { question: "What information should a distributor provide?", answer: "Country, sales channel, target vehicle segment, expected quantity, and support needs are the most useful starting points." },
      { question: "Is this page only for large orders?", answer: "No. It is for B2B qualification. Smaller pilot orders can be discussed before repeat-order planning." },
    ],
  },
};

const isLandingKey = (slug: string): slug is LandingKey => Object.prototype.hasOwnProperty.call(LANDING_PAGES, slug);

const trustCards = [
  {
    image: "/images/trust/vethy-factory-manufacturing-excellence.jpg",
    alt: "Vethy parking air conditioner manufacturing workshop with assembly line and testing equipment",
    width: 750,
    height: 1050,
    title: "Factory and production-line photos",
    body: "Factory photos show parking AC production-line work, component assembly, and bench testing environments for mobile HVAC supply.",
  },
  {
    image: "/images/trust/vethy-quality-certifications-overview.jpg",
    alt: "Vethy quality certification and company credit document overview for B2B buyers",
    width: 750,
    height: 950,
    title: "Company document set",
    body: "Distributor and fleet buyers can request current company materials, certificate scans, and credit documents during onboarding.",
  },
  {
    image: "/images/trust/qingdao-vethy-iso-9001-certificate.jpg",
    alt: "Qingdao Vethy Industrial Co Ltd ISO 9001 2015 quality management system certificate",
    width: 1190,
    height: 1683,
    title: "ISO 9001 certificate image",
    body: "English ISO 9001:2015 certificate image for Qingdao Vethy Industrial Co., Ltd. is available for due-diligence checks.",
  },
];

function FactoryTrustSection({ onQuoteClick }: { onQuoteClick: () => void }) {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-[1280px] px-4 py-12 lg:px-8">
        <div className="mb-7 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-700">Factory and document support</p>
            <h2 className="text-3xl font-extrabold tracking-normal text-slate-950">Manufacturing background for B2B parking AC buyers</h2>
          </div>
          <div className="grid gap-4">
            <p className="text-base leading-7 text-slate-600">
              For fleet, dealer, installer, and distributor inquiries, CoolDrivePro can share Vethy-associated factory photos, certificate images, and company documents during quote review.
            </p>
            <button type="button" onClick={onQuoteClick} className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-800 transition hover:border-blue-300 hover:bg-blue-50">
              Request documents with quote
              <Icon name="arrow-right" className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {trustCards.map((card) => (
            <article key={card.title} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="bg-white p-3">
                <img src={card.image} alt={card.alt} width={card.width} height={card.height} loading="lazy" decoding="async" className="h-auto w-full rounded-md object-contain" />
              </div>
              <div className="border-t border-slate-200 p-5">
                <h3 className="text-base font-extrabold text-slate-950">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeadForm({ page, formIdPrefix = "landing", compact = false }: { page: LandingPageConfig; formIdPrefix?: string; compact?: boolean }) {
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fieldId = (name: string) => `${formIdPrefix}-${page.slug}-${name}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const fields: Record<string, string> = {
      from_name: "CoolDrivePro Ads Landing Page",
      subject: page.formSubject,
      source_page: typeof window !== "undefined" ? window.location.href : `/landing/${page.slug}`,
      lead_audience: page.conversionAudience,
      landing_slug: page.slug,
      ...collectLeadAttribution(),
    };

    for (const [key, value] of formData.entries()) {
      fields[key] = String(value);
    }

    const trackLead = (submissionMethod: string) => {
      trackGoogleAdsConversion("lead", {
        landing_slug: page.slug,
        lead_audience: page.conversionAudience,
        submission_method: submissionMethod,
      });
    };

    try {
      if (!WEB3FORMS_KEY) throw new Error("Lead endpoint unavailable");
      await submitToWeb3Forms(fields);

      setSubmitted(true);
      trackLead("web3forms");
    } catch {
      const mailto = `mailto:support@cooldrivepro.com?subject=${encodeURIComponent(page.formSubject)}&body=${encodeURIComponent(buildLeadEmailBody(fields))}`;
      trackLead("mailto_fallback");
      window.location.href = mailto;
      setSubmitted(true);
      setError("Your email app has opened as a backup submission path.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <Icon name="check" className="h-5 w-5" />
          Thank you for reaching out.
        </div>
        <p className="text-sm leading-6">We will review your vehicle and cooling needs and reply with price, model fit, and the next step.</p>
        {error && <p className="mt-3 text-sm leading-6">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input type="hidden" name="lead_offer" value="12-hour price and model recommendation" />
      <input type="hidden" name="lead_capture_variant" value={compact ? "compact_hero" : "full_quote"} />
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold leading-5 text-blue-900">
        {compact ? "Get price and model fit with 2 fields." : "Fast path: only email and vehicle type are required. WhatsApp is optional but gets the quickest reply."}
      </div>
      <div className={compact ? "grid gap-2" : "grid gap-3 sm:grid-cols-2"}>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor={fieldId("email")}>Email *</label>
          <input id={fieldId("email")} name="email" type="email" required autoComplete="email" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="you@company.com" />
        </div>
        {!compact && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor={fieldId("phone")}>Phone / WhatsApp</label>
            <input id={fieldId("phone")} name="phone" type="tel" autoComplete="tel" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="+1 555 123 4567" />
          </div>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor={fieldId("vehicle-type")}>Vehicle / buyer type *</label>
        <select id={fieldId("vehicle-type")} name="vehicle_type" required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" defaultValue="">
          <option value="" disabled>Choose one</option>
          <option value="Semi truck / sleeper cab">Semi truck / sleeper cab</option>
          <option value="Fleet / procurement">Fleet / procurement</option>
          <option value="RV / camper van">RV / camper van</option>
          <option value="Dealer / distributor">Dealer / distributor</option>
          <option value="Installer / upfitter">Installer / upfitter</option>
          <option value="Not sure yet">Not sure yet</option>
        </select>
      </div>
      {!compact && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor={fieldId("country")}>Country / region</label>
              <input id={fieldId("country")} name="country" autoComplete="country-name" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="United States" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor={fieldId("quantity")}>Quantity</label>
              <select id={fieldId("quantity")} name="quantity" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" defaultValue="">
                <option value="">Not sure yet</option>
                <option value="1 unit">1 unit</option>
                <option value="2-10 units">2-10 units</option>
                <option value="11-50 units">11-50 units</option>
                <option value="51-200 units">51-200 units</option>
                <option value="200+ units">200+ units</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor={fieldId("name")}>Name</label>
              <input id={fieldId("name")} name="name" autoComplete="name" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor={fieldId("company")}>Company</label>
              <input id={fieldId("company")} name="company" autoComplete="organization" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Company or fleet" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor={fieldId("message")}>Vehicle details</label>
            <textarea id={fieldId("message")} name="message" rows={3} className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Optional: 12V/24V, truck model, hot climate, target lead time" />
          </div>
        </>
      )}
      <button type="submit" disabled={sending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:bg-blue-300">
        {sending ? "Sending..." : "Get price + model recommendation"}
        <Icon name="arrow-right" className="h-4 w-4" />
      </button>
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackGoogleAdsConversion("whatsapp_click", {
          landing_slug: page.slug,
          lead_audience: page.conversionAudience,
          contact_channel: "whatsapp",
          link_target: "wa.me",
        })}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:border-blue-300 hover:bg-blue-50"
      >
        <Icon name="message" className="h-4 w-4 text-blue-600" />
        Prefer chat? WhatsApp us now
      </a>
    </form>
  );
}

function LeadModal({ page, open, onClose }: { page: LandingPageConfig; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" onClick={onClose}>
      <div className="max-h-[calc(100vh-48px)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Fast quote</p>
            <h2 id="lead-modal-title" className="mt-1 text-xl font-extrabold tracking-normal text-slate-950">{page.formTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{page.formSubtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950" aria-label="Close quote form">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">
          <LeadForm page={page} formIdPrefix="modal" />
        </div>
      </div>
    </div>
  );
}

function UnknownLandingPage() {
  return (
    <LandingShell>
      <section className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <p className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-700">Landing page not found</p>
        <h1 className="mb-4 text-3xl font-extrabold tracking-normal text-slate-950">Choose a CoolDrivePro landing page</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.values(LANDING_PAGES).map((page) => (
            <a key={page.slug} href={`/landing/${page.slug}`} className="rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50">
              <span className="block font-semibold text-slate-950">{page.title}</span>
              <span className="mt-1 block text-sm text-slate-600">{page.audience}</span>
            </a>
          ))}
        </div>
      </section>
    </LandingShell>
  );
}

export default function AdLandingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const page = isLandingKey(slug) ? LANDING_PAGES[slug] : null;
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  const jsonLd = useMemo(() => {
    if (!page) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.title,
      description: page.seoDescription,
      isPartOf: { "@type": "WebSite", name: "CoolDrivePro", url: "https://cooldrivepro.com" },
      publisher: { "@type": "Organization", "@id": "https://cooldrivepro.com/#organization" },
      image: page.heroImage.startsWith("http") ? page.heroImage : `https://cooldrivepro.com${page.heroImage}`,
      url: `https://cooldrivepro.com/landing/${page.slug}`,
    };
  }, [page]);

  useLandingSEO(page ? {
    title: page.seoTitle,
    description: page.seoDescription,
    canonical: `https://cooldrivepro.com/landing/${page.slug}`,
    ogImage: page.heroImage.startsWith("http") ? page.heroImage : `https://cooldrivepro.com${page.heroImage}`,
    jsonLd,
  } : {
    title: "Parking AC Landing Pages - CoolDrivePro",
    description: "Choose a CoolDrivePro landing page for truck, fleet, RV, van, or distributor parking air conditioner inquiries.",
    canonical: "https://cooldrivepro.com/landing/",
  });

  if (!page) return <UnknownLandingPage />;

  const handleWhatsAppClick = () => {
    trackGoogleAdsConversion("whatsapp_click", {
      landing_slug: page.slug,
      lead_audience: page.conversionAudience,
      contact_channel: "whatsapp",
      link_target: "wa.me",
    });
  };

  const openLeadModal = () => setLeadModalOpen(true);

  return (
    <LandingShell onQuoteClick={openLeadModal} onWhatsAppClick={handleWhatsAppClick}>
      <nav aria-label="Breadcrumb" className="mx-auto flex max-w-[1280px] items-center gap-1.5 px-4 py-3 text-sm text-slate-500 lg:px-8">
        <a href="/" className="hover:text-blue-700 hover:underline">Home</a>
        <Icon name="chevron-right" className="h-4 w-4" />
        <span className="text-slate-700">Landing</span>
      </nav>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-12">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-blue-700">{page.eyebrow}</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-normal text-slate-950 lg:text-5xl">{page.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{page.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={openLeadModal} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
                {page.primaryCta}
                <Icon name="arrow-right" className="h-4 w-4" />
              </button>
              <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" onClick={handleWhatsAppClick} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:border-blue-300 hover:bg-blue-50">
                <Icon name="message" className="h-4 w-4 text-blue-600" />
                {page.secondaryCta}
              </a>
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm lg:hidden">
              <div className="mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Fast quote</p>
                <p className="mt-1 text-lg font-extrabold tracking-normal text-slate-950">Price and model fit in 12 hours</p>
              </div>
              <LeadForm page={page} formIdPrefix="mobile-hero" compact />
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {page.metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</div>
                  <div className="mt-1 text-lg font-extrabold text-slate-950">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden gap-4 lg:grid">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Fast quote</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-normal text-slate-950">Price and model fit in 12 hours</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Start with email and vehicle type. Add WhatsApp for the quickest handoff.</p>
              </div>
              <LeadForm page={page} formIdPrefix="hero" />
            </div>
            <div className="aspect-[16/7] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <img src={page.heroImage} alt={page.heroAlt} width="900" height="394" className="h-full w-full object-contain p-3" loading="eager" decoding="async" fetchPriority="high" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-700">Built for the buying moment</p>
            <h2 className="text-3xl font-extrabold tracking-normal text-slate-950">A focused page for {page.audience.toLowerCase()}</h2>
          </div>
          <div className="grid gap-3">
            {page.pains.map((pain) => (
              <div key={pain} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <Icon name="check" className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <p className="text-sm leading-6 text-slate-700">{pain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12 lg:px-8">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-700">Why CoolDrivePro</p>
              <h2 className="text-3xl font-extrabold tracking-normal text-slate-950">Clear reasons to request a quote</h2>
            </div>
            <button type="button" onClick={openLeadModal} className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:underline">
              Contact sales
              <Icon name="arrow-right" className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {page.benefits.map(({ icon, title, body }) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <Icon name={icon} className="mb-4 h-6 w-6 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-[1280px] px-4 py-12 lg:px-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-700">Recommended models</p>
          <h2 className="mb-7 text-3xl font-extrabold tracking-normal text-slate-950">Match the AC system to the vehicle and buying intent</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {page.products.map((product) => (
              <a key={product.name} href={product.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
                <h3 className="text-lg font-extrabold text-slate-950">{product.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{product.fit}</p>
                <p className="mt-3 text-sm font-semibold text-blue-700">{product.specs}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <FactoryTrustSection onQuoteClick={openLeadModal} />

      <section id="quote" className="bg-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-700">Quote request</p>
            <h2 className="text-3xl font-extrabold tracking-normal text-slate-950">{page.formTitle}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{page.formSubtitle}</p>
            <div className="mt-6 grid gap-3">
              {page.proof.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <Icon name="shield" className="h-5 w-5 text-blue-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6">
            <LeadForm page={page} formIdPrefix="quote" />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-300">Next steps</p>
            <h2 className="text-3xl font-extrabold tracking-normal">From click to quote</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {page.process.map((step, index) => (
              <div key={step} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-extrabold">{index + 1}</div>
                <p className="text-sm leading-6 text-slate-100">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12 lg:px-8">
          <div className="mb-7 flex items-center gap-3">
            <Icon name="clock" className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-extrabold tracking-normal text-slate-950">Buyer questions</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {page.faqs.map((faq) => (
              <article key={faq.question} className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-base font-extrabold text-slate-950">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-50">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-normal text-slate-950">Ready to choose a parking AC model?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Send the vehicle type, voltage, quantity, and target market. We will help narrow the model before quoting.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={openLeadModal} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
              <Icon name="mail" className="h-4 w-4" />
              {page.primaryCta}
            </button>
            <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" onClick={handleWhatsAppClick} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-800 transition hover:border-blue-300 hover:bg-blue-50">
              <Icon name="message" className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
      <LeadModal page={page} open={leadModalOpen} onClose={() => setLeadModalOpen(false)} />
    </LandingShell>
  );
}