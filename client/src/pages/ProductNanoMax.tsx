/**
 * Product Detail Page: Nano Max — Compact 12V/24V Top-Mounted Parking Air Conditioner
 *
 * B2B inquiry-focused layout (mirrors the VS02 PRO / ProductTopMounted.tsx
 * structure) wrapped inside the production PageLayout. Hero uses an embedded
 * YouTube product showcase from the CoolDrivePro / Vethy YouTube channel.
 *
 * SEO: Product / BreadcrumbList JSON-LD are injected by scripts/prerender.mjs
 * for the static HTML; here we only inject the FAQPage JSON-LD at runtime to
 * avoid duplicates. Canonical/hreflang stay owned by useSEO + static-meta.json.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ChevronRight, Star } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import CompactInquiryForm from "@/components/CompactInquiryForm";
import ProductLineSwitcher from "@/components/ProductLineSwitcher";
import { useSEO } from "@/hooks/useSEO";

/* ------------------------------ legacy SEO data ------------------------------ */

const nanoMaxFaqs = [
  {
    question: "What is the CoolDrivePro Nano Max 12V air conditioner for light trucks?",
    answer:
      "The CoolDrivePro Nano Max is a 10,000 BTU compact top-mounted 12V/24V DC parking air conditioner built for light trucks, pickups, vans, truck campers, truck caps and compact mobile workspaces. It delivers no-idle cooling from the vehicle battery using a dual-rotor BLDC compressor and a low-profile 165 mm rooftop housing.",
  },
  {
    question: "Does the Nano Max run without engine idling?",
    answer:
      "Yes. The Nano Max runs directly from the vehicle 12V or 24V DC battery system, so it can cool the parked cab without engine idling, shore power or a generator. Intelligent undervoltage protection helps protect the battery during long rest periods.",
  },
  {
    question: "Is the Nano Max a 12V or 24V parking air conditioner?",
    answer:
      "The Nano Max supports both 12V and 24V DC systems with automatic switching. Cooling capacity is 10,000 BTU on both 12V and 24V. Before quotation, CoolDrivePro confirms voltage, vehicle type, roof opening, battery setup and order quantity to match the unit to the target vehicle.",
  },
  {
    question: "Is the Nano Max compatible with my light truck?",
    answer:
      "The Nano Max is designed for US light trucks including Ford F-150/F-250, Chevy Silverado 1500/2500, Ram 1500/2500, GMC Sierra and Toyota Tundra, plus truck campers, truck caps, work vans and compact service bodies. Send vehicle make, model, roof opening and battery details and CoolDrivePro will confirm fitment before quoting.",
  },
  {
    question: "How does the dual-rotor compressor benefit light-truck operators?",
    answer:
      "The dual-rotor BLDC compressor delivers 10,000 BTU/h cooling with lower vibration, quieter operation and better efficiency than single-rotor designs. The result is faster cab cool-down, ≤48 dB quiet running for sleeping or working in the cab, and longer compressor life across fleet duty cycles.",
  },
  {
    question: "How long can the Nano Max run on a truck battery?",
    answer:
      "Runtime depends on battery capacity, chemistry, ambient temperature, insulation and set temperature. With a typical light-truck dual-battery setup (200-300 Ah), the Nano Max can run 6-10 hours continuously. Built-in intelligent undervoltage protection automatically cuts off before the battery is over-discharged.",
  },
  {
    question: "What roof opening does the Nano Max need?",
    answer:
      "The Nano Max uses a 450 × 380 mm rooftop opening with a low-profile 165 mm exterior housing — sized for light-truck roofs, truck caps, truck campers and compact vans. CoolDrivePro reviews roof structure, wiring path and vehicle layout before quotation and can provide installation guidance for qualified installers.",
  },
  {
    question: "What makes Nano Max different from a portable or RV AC unit?",
    answer:
      "Unlike rooftop RV AC units that require shore power or a generator, the Nano Max runs directly on 12V or 24V DC battery power. Unlike a hose-style portable AC, it is a vehicle-mounted DC parking AC built specifically for light-truck cab dimensions, truck camper AC projects, truck cap air conditioner needs and compact truck bed AC unit planning.",
  },
  {
    question: "What warranty does the Nano Max come with?",
    answer:
      "The CoolDrivePro Nano Max includes a 1-year manufacturer warranty covering defects in materials and workmanship. Eligible returns follow the published return policy. Technical support is available at support@cooldrivepro.com. Full warranty terms are at cooldrivepro.com/warranty.",
  },
];

const nanoMaxReviews = [
  {
    id: 1,
    name: "Mike T.",
    location: "Texas, USA",
    rating: 5,
    date: "Mar 15, 2026",
    title: "Perfect for my F-150",
    body:
      "Installed the Nano Max on my Ford F-150. The dual-rotor compressor is noticeably quieter than my friend's single-rotor unit. Cools the cab in about 15 minutes even in Texas heat. The low-profile housing barely adds any height to the roofline.",
  },
  {
    id: 2,
    name: "Jason R.",
    location: "Arizona, USA",
    rating: 5,
    date: "Mar 8, 2026",
    title: "Great for desert camping",
    body:
      "Use this on my Ram 1500 for desert camping trips. 10,000 BTU on 24V is plenty for the crew cab. Runs all night on my dual battery setup without engine idle, and the undervoltage cutoff gives me peace of mind for the morning start.",
  },
  {
    id: 3,
    name: "Chris L.",
    location: "Florida, USA",
    rating: 5,
    date: "Feb 28, 2026",
    title: "Light-truck game changer",
    body:
      "Finally a DC parking AC actually designed for light trucks. The compact 450×380 mm opening fits my Silverado 1500 cap perfectly. Highly recommend for any pickup or work-truck owner wanting no-idle cooling.",
  },
];

const specs = [
  { label: "Cooling Capacity (12V)", value: "10,000 BTU/h" },
  { label: "Cooling Capacity (24V)", value: "10,000 BTU/h" },
  { label: "Voltage", value: "12V / 24V DC" },
  { label: "Compressor Type", value: "Dual-Rotor BLDC" },
  { label: "Rated Power (12V)", value: "240-400W" },
  { label: "Rated Power (24V)", value: "240-700W" },
  { label: "Rated Current (12V)", value: "18-35A" },
  { label: "Rated Current (24V)", value: "10-30A" },
  { label: "Refrigerant", value: "R134A" },
  { label: "Airflow", value: "550 m³/h" },
  { label: "Air Output Method", value: "Manual / Automatic" },
  { label: "Noise Level", value: "≤ 48 dB" },
  { label: "External Unit Size", value: "749 × 749 × 165 mm" },
  { label: "Internal Unit Size", value: "560 × 445 mm" },
  { label: "Roof Opening", value: "450 × 380 mm" },
  { label: "Package Weight", value: "27 kg" },
  { label: "Battery Protection", value: "Intelligent undervoltage cutoff" },
  { label: "UV Protection", value: "UV-resistant outer housing" },
  { label: "Warranty", value: "1 Year" },
];

const features = [
  "10,000 BTU compact cooling for light trucks and pickups",
  "Dual-rotor BLDC compressor for efficiency and quiet operation",
  "12V/24V DC auto-switching — true no-idle battery-powered cooling",
  "Low-profile 165 mm rooftop housing for light-truck rooflines",
  "Compact 450 × 380 mm opening — fits truck caps, campers and service bodies",
  "Intelligent undervoltage battery protection",
  "550 m³/h airflow with manual / automatic outlet control",
  "≤ 48 dB quiet operation for in-cab sleep or work",
  "UV-resistant outer housing for sun and weather exposure",
  "1-year manufacturer warranty",
];

/* ------------------------------- new visual data ------------------------------- */

const PRODUCT_TITLE = "Nano Max 12V/24V Parking Air Conditioner — Compact Parking AC for Pickup Trucks, Vans, Truck Caps and Campers";
const PRODUCT_LEAD =
  "The CoolDrivePro Nano Max is a compact parking air conditioner that works as both a 12V parking air conditioner and a 24V parking air conditioner, delivering 10,000 BTU/h no-idle cooling for pickup truck parking AC builds, van air conditioner 12V projects, truck cap air conditioner installs and truck camper AC upfits. A dual-rotor BLDC compressor, low-profile 165 mm housing and \u226448 dB quiet operation keep the cab cool from battery power, without engine idling.";

const PRODUCT_ANSWER_BULLETS = [
  "Parking air conditioner built for no-idle cooling — 12V parking air conditioner and 24V parking air conditioner in one compact rooftop unit.",
  "Fits pickup truck parking AC builds, van air conditioner 12V conversions, truck cap air conditioner installs and truck camper AC upfits with a 450×380 mm opening and 165 mm low-profile housing.",
  "10,000 BTU on both 12V and 24V, dual-rotor BLDC compressor, ≤48 dB — a true compact parking AC for light trucks and work vans.",
  "Before quoting, CoolDrivePro confirms vehicle type, voltage, roof opening, battery setup and order quantity to reduce fitment risk.",
];

const PRODUCT_TRUST_SUMMARY =
  "Manufactured by CoolDrivePro at its own factory; Nano Max units have been shown at international HVAC and trucking trade exhibitions and ship with ISO 9001:2015, CNAS lab and design-patent conformity documentation.";

const heroSpecs = [
  { label: "Cooling", value: "10,000 BTU/h" },
  { label: "Voltage", value: "12V / 24V DC" },
  { label: "Noise", value: "≤ 48 dB" },
  { label: "Roof opening", value: "450 × 380 mm" },
];

const productWall = [
  {
    src: "/images/products/nano-max-02.webp",
    alt: "CoolDrivePro Nano Max compact 12V truck parking AC side profile view",
    title: "Side profile",
    caption: "Low-profile 165 mm rooftop housing for light-truck rooflines.",
    lightboxCaption: "Nano Max side profile (165 mm low-profile housing)",
  },
  {
    src: "/images/products/nano-max-03.webp",
    alt: "CoolDrivePro Nano Max compact light-truck parking AC top deck view",
    title: "Top deck",
    caption: "Condenser fan deck and airflow layout.",
    lightboxCaption: "Nano Max top deck and condenser fan layout",
  },
  {
    src: "/images/products/nano-max-04.webp",
    alt: "CoolDrivePro Nano Max compact 12V/24V truck AC mounting and indoor unit detail",
    title: "Mount detail",
    caption: "Install-side structure and indoor section reference.",
    lightboxCaption: "Nano Max mount and indoor section detail",
  },
  {
    src: "/images/products/nano-max-05.webp",
    alt: "CoolDrivePro Nano Max dual-rotor compressor and component feature view",
    title: "Component feature",
    caption: "Dual-rotor BLDC compressor and brushless fan layout.",
    lightboxCaption: "Nano Max dual-rotor BLDC compressor and brushless fans",
  },
];

const inquirySteps = [
  { n: 1, title: "Buyer role", body: "Dealer, distributor, light-truck upfitter, fleet, installer, importer, wholesaler or OEM." },
  { n: 2, title: "Vehicle fit", body: "Voltage, roof opening, light-truck or van model, climate and battery plan." },
  { n: 3, title: "Proof package", body: "Nano Max product images, factory proof, exhibition records, certificates and install notes." },
  { n: 4, title: "Commercial reply", body: "Sample, pilot, wholesale batch, dealer territory, or OEM / upfitter feasibility." },
];

// Keyword-anchored use cases. Each card targets a specific search intent the
// Nano Max page should rank for: parking air conditioner / parking ac /
// 12V & 24V parking air conditioner / compact parking ac / pickup truck
// parking ac / van air conditioner 12V / truck cap air conditioner /
// truck camper ac.
const useCases = [
  {
    h: "Parking air conditioner for trucks, vans and campers",
    p: "Nano Max is a vehicle-mounted parking air conditioner that cools the parked cab directly from the battery — no engine idling, no shore power, no generator. One unit covers light trucks, pickups, work vans, truck caps and slide-in truck campers.",
  },
  {
    h: "No-idle parking AC for sleeper and rest cycles",
    p: "Drivers, owner-operators and crews use the Nano Max as a quiet parking AC for overnight rest, lunch breaks and on-site stationary work. ≤48 dB operation keeps the cab cool without idling the engine or running an APU.",
  },
  {
    h: "12V parking air conditioner for light trucks",
    p: "Configured as a 12V parking air conditioner, the Nano Max delivers 10,000 BTU/h from a standard 12V truck battery system with intelligent undervoltage cutoff to protect the start battery.",
  },
  {
    h: "24V parking air conditioner for heavier rigs and dual-battery builds",
    p: "On 24V systems the Nano Max also delivers 10,000 BTU/h — a true 24V parking air conditioner for heavy-duty pickups, dual-battery upfits, work trucks and overland builds running 24V house banks.",
  },
  {
    h: "Compact parking AC for tight rooflines",
    p: "With a low-profile 165 mm exterior housing and a 450 × 380 mm roof opening, Nano Max is a genuinely compact parking AC — small enough for narrow truck cab roofs, truck caps and short van roofs where full-size RV rooftop units don't fit.",
  },
  {
    h: "Pickup truck parking AC for F-150, Silverado, Ram, Sierra & Tundra",
    p: "Built as a pickup truck parking AC for US half-ton and three-quarter-ton pickups — Ford F-150 / F-250, Chevy Silverado 1500 / 2500, Ram 1500 / 2500, GMC Sierra and Toyota Tundra. Send make, model and roof details for a fitment-checked quote.",
  },
  {
    h: "Van air conditioner 12V for cargo, service and adventure vans",
    p: "Used as a 12V van air conditioner for Transit, ProMaster, Sprinter, NV and conversion vans — cargo van cab cooling, service-van rest breaks and DIY adventure-van builds that need battery-powered AC without a noisy rooftop RV unit.",
  },
  {
    h: "Truck cap air conditioner for shells and toppers",
    p: "Nano Max is a practical truck cap air conditioner for pickup shells and toppers (ARE, LEER, SnugTop and similar). The compact opening drops into most cap roofs to cool the truck bed sleeping or work space from 12V or 24V battery.",
  },
  {
    h: "Truck camper AC for slide-in and pop-up campers",
    p: "Slide-in truck camper builders use Nano Max as a low-profile truck camper AC alternative to bulky rooftop RV units — lower height, lower wind drag, and direct DC operation from the camper battery bank.",
  },
];

const factoryProof = [
  { src: "/images/factory/cooldrivepro-wholesale-loading-yard.webp", alt: "CoolDrivePro wholesale loading yard", caption: "Container loading yard" },
  { src: "/images/factory/cooldrivepro-real-pallet-stacks.webp", alt: "CoolDrivePro pallet stacks", caption: "Finished pallet stacks" },
  { src: "/images/factory/cooldrivepro-warehouse-container-loading.webp", alt: "CoolDrivePro warehouse container loading", caption: "Warehouse dispatch" },
];

const factoryStats = [
  { value: "120K+", label: "Annual capacity" },
  { value: "100%", label: "Pre-shipment QC" },
  { value: "18", label: "R&D engineers" },
  { value: "40HQ", label: "Container loading" },
];

const exhibitionPhotos = Array.from({ length: 8 }, (_, i) => ({
  src: `/images/trust/exhibitions/cooldrivepro-trade-show-0${i + 1}.jpg`,
  alt: `CoolDrivePro trade show booth photo ${i + 1} – Nano Max and parking AC distributor engagement`,
  caption: [
    "Booth wide view",
    "Product display",
    "Buyer meetings",
    "Live product demo",
    "Compact unit display",
    "Engineering explanation",
    "Distributor visitors",
    "Top-mounted display",
  ][i],
  span: i === 0 ? "large" : "",
}));

const installScenes = [
  {
    src: "/images/scenes/ac-scene-workshop-rooftop.jpg",
    alt: "Compact rooftop parking AC installed on a light truck in workshop scene",
    title: "Light-truck workshop install",
    body: "Reference shot for Nano Max rooftop position on a light work truck during upfit and install.",
    lightboxCaption: "Nano Max — light-truck workshop install reference",
  },
  {
    src: "/images/scenes/ac-scene-van-rooftop.jpg",
    alt: "Commercial van with compact rooftop parking air conditioner scene",
    title: "Commercial van reference",
    body: "Useful for judging Nano Max roof placement, vehicle height clearance and real road-use context on vans.",
    lightboxCaption: "Nano Max — commercial van rooftop reference",
  },
  {
    src: "/images/scenes/ac-scene-rooftop-unit.jpg",
    alt: "Close view of compact rooftop parking air conditioner on a vehicle roof",
    title: "Rooftop unit close view",
    body: "Exterior view for buyers checking shell size, roof fit and visual finish of the Nano Max housing.",
    lightboxCaption: "Nano Max — rooftop unit close view",
  },
];

const certificates = [
  { src: "/images/trust/certifications/cooldrivepro-iso-9001-2015-certificate.png", alt: "ISO 9001:2015 quality management certificate", kicker: "Quality system", title: "ISO 9001:2015", body: "Issued to Qingdao Vethy Industrial Co., Ltd. for quality management system review." },
  { src: "/images/trust/certifications/cooldrivepro-cnas-quality-certificate.png", alt: "CNAS quality certificate", kicker: "Testing capability", title: "CNAS lab certificate", body: "Supports recognized capability to test cooling capacity, energy efficiency, vibration and electrical safety." },
  { src: "/images/trust/certifications/cooldrivepro-trademark-registration.png", alt: "CoolDrivePro trademark registration certificate", kicker: "Brand IP", title: "Registered trademark", body: "Protects the CoolDrivePro and Vethy brand identity across vehicle climate-control product classes." },
  { src: "/images/trust/certifications/cooldrivepro-design-patent-certificate.png", alt: "CoolDrivePro design patent certificate", kicker: "Product IP", title: "Granted design patent", body: "Industrial design protection covering CoolDrivePro top-mounted parking AC housings." },
];

const inquiryProofBullets = [
  "Dealer, distributor, light-truck upfitter, fleet, installer and OEM routes",
  "Nano Max product images, factory proof, certificates and installation references",
  "Sample, pilot order, and bulk supply discussion after qualification",
];

/* ------------------------------- YouTube embed ------------------------------- */

const YOUTUBE_ID = "lBPnTfglLsY";
const YOUTUBE_POSTER = "/images/products/nano-max-01.webp";

/* ------------------------------- component ------------------------------- */

export default function ProductNanoMax() {
  const { t } = useTranslation();

  useSEO({
    title: "Nano Max 12V/24V Parking Air Conditioner | Compact Parking AC for Pickup Trucks, Vans, Truck Caps & Campers | CoolDrivePro",
    description:
      "CoolDrivePro Nano Max is a compact 12V parking air conditioner and 24V parking air conditioner for pickup truck parking AC, van air conditioner 12V, truck cap air conditioner and truck camper AC builds. 10,000 BTU no-idle parking AC with dual-rotor BLDC compressor, low-profile 165 mm rooftop housing and dealer fitment support.",
    ogImage: "https://cooldrivepro.com/images/products/nano-max-01.webp",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: nanoMaxFaqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  });

  const [lightbox, setLightbox] = useState<{ src: string; alt: string; caption: string } | null>(null);
  const openLightbox = useCallback(
    (src: string, alt: string, caption: string) => setLightbox({ src, alt, caption }),
    [],
  );
  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [lightbox, closeLightbox]);

  // Hero YouTube auto-plays (muted) on mount — no click required.
  const [videoActivated] = useState(true);
  const activateVideo = useCallback(() => {}, []);

  const css = useMemo(() => MERGED_CSS, []);

  return (
    <PageLayout>
      <ProductLineSwitcher activeSlug="nano-max" />
      <div className="tmb2b-root">
        <style>{css}</style>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="tmb2b-breadcrumb">
          <Link href="/">{t("nav.home")}</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href="/products">{t("nav.products")}</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span>Nano Max</span>
        </nav>

        <main className="desk-shell" id="top">
          {/* ============================== LEFT ============================== */}
          <div className="left-col" aria-label="Product and factory proof content">

            {/* Hero with YouTube showcase video */}
            <section className="product-hero" id="product" aria-labelledby="page-title">
              <figure className="hero-media">
                <YouTubeShowcase activated={videoActivated} onActivate={activateVideo} />
                <figcaption className="media-caption">Nano Max product showcase video</figcaption>
              </figure>
              <div className="hero-copy">
                <div>
                  <p className="eyebrow">12V / 24V compact rooftop parking AC</p>
                  <h1 id="page-title">{PRODUCT_TITLE}</h1>
                  <p className="lead">{PRODUCT_LEAD}</p>
                  <ul className="hero-answers" aria-label="Direct answers about the Nano Max">
                    {PRODUCT_ANSWER_BULLETS.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <p className="hero-trust">{PRODUCT_TRUST_SUMMARY}</p>
                  <div className="hero-actions">
                    <a className="btn primary" href="#quote">Request a Fitment-Checked Dealer Quote</a>
                    <a className="btn secondary" href="#factory">View factory proof</a>
                  </div>
                </div>
                <div className="hero-specs" aria-label="Nano Max quick specifications">
                  {heroSpecs.map((s) => (
                    <div key={s.label}>
                      <span>{s.label}</span>
                      <strong>{s.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Product wall */}
            <section className="content-section product-detail-section" aria-labelledby="large-product-title">
              <div className="section-head">
                <h2 id="large-product-title">Nano Max product details</h2>
                <p>Clear views of the low-profile rooftop housing, top deck, mounting structure and core components.</p>
              </div>
              <div className="product-wall">
                {productWall.map((p) => (
                  <figure key={p.src} className="product-shot">
                    <button
                      className="gallery-trigger"
                      type="button"
                      onClick={() => openLightbox(p.src, p.alt, p.lightboxCaption)}
                      aria-label={`Enlarge: ${p.title}`}
                    >
                      <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
                    </button>
                    <figcaption>
                      <b>{p.title}</b>
                      <span>{p.caption}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>

            {/* Inquiry route */}
            <section className="content-section" aria-labelledby="supply-route-title">
              <div className="section-head">
                <h2 id="supply-route-title">Inquiry route</h2>
                <p>The page sends qualified light-truck buyers into a form instead of a retail payment path.</p>
              </div>
              <div className="supply-strip">
                {inquirySteps.map((s) => (
                  <article key={s.n} className="supply-step">
                    <b>{s.n}</b>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* Use cases — keyword-anchored intent capture */}
            <section className="content-section" id="use-cases" aria-labelledby="use-cases-title">
              <div className="section-head">
                <h2 id="use-cases-title">Nano Max parking air conditioner — compact 12V / 24V parking AC for every light-vehicle use case</h2>
                <p>Built as one compact parking AC platform for pickup truck parking AC, van air conditioner 12V, truck cap air conditioner and truck camper AC projects — pick the use case that matches your build.</p>
              </div>
              <div className="usecase-grid">
                {useCases.map((u) => (
                  <article key={u.h} className="usecase-card">
                    <h3>{u.h}</h3>
                    <p>{u.p}</p>
                  </article>
                ))}
              </div>
              <p className="usecase-foot">
                Searching for a <strong>parking air conditioner</strong>, <strong>parking AC</strong>, <strong>12V parking air conditioner</strong>, <strong>24V parking air conditioner</strong>, <strong>compact parking AC</strong>, <strong>pickup truck parking AC</strong>, <strong>van air conditioner 12V</strong>, <strong>truck cap air conditioner</strong> or <strong>truck camper AC</strong>? <a href="#quote">Request a Nano Max fitment-checked dealer quote</a> and CoolDrivePro will confirm voltage, roof opening and vehicle fit before pricing.
              </p>
            </section>

            {/* Factory band */}
            <section className="content-section" id="factory" aria-labelledby="factory-title">
              <div className="video-band">
                <SlowBackgroundVideo
                  src="/videos/cooldrivepro-factory-tour.mp4"
                  poster="/images/factory/cooldrivepro-production-line-assembly.webp"
                  ariaLabel="CoolDrivePro factory production line background video"
                />
                <div className="video-content">
                  <p className="eyebrow">Factory capacity</p>
                  <h2 id="factory-title">Same factory and supply chain behind every Nano Max unit.</h2>
                  <p>Production-line capacity, pallet staging, warehouse loading and export packing back the Nano Max with a stable supplier signal for dealers, fleets and upfitters.</p>
                  <div className="fact-row">
                    {factoryStats.map((s) => (
                      <div key={s.label}>
                        <strong>{s.value}</strong>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="image-grid factory-proof-grid" aria-label="Factory shipping proof images">
                {factoryProof.map((p) => (
                  <figure key={p.src} className="image-tile">
                    <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
                    <figcaption>{p.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </section>

            {/* Exhibitions */}
            <section className="content-section" id="exhibitions" aria-labelledby="expo-title">
              <div className="video-band">
                <SlowBackgroundVideo
                  src="/videos/cooldrivepro-exhibitions-hero-bg.mp4"
                  poster="/images/trust/exhibitions/cooldrivepro-trade-show-01.jpg"
                  ariaLabel="CoolDrivePro trade show booth background video"
                />
                <div className="video-content">
                  <p className="eyebrow">Exhibition proof</p>
                  <h2 id="expo-title">Booth photos and live demos for distributor trust.</h2>
                  <p>Visitors can see product demos, sales discussions, display units and booth activity before deciding whether to become a Nano Max dealer, importer or upfitter partner.</p>
                </div>
              </div>
              <div className="image-grid">
                {exhibitionPhotos.map((p) => (
                  <figure key={p.src} className={`image-tile${p.span ? ` ${p.span}` : ""}`}>
                    <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
                    <figcaption>{p.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </section>

            {/* Install scenes */}
            <section className="content-section" id="install" aria-labelledby="install-title">
              <div className="section-head">
                <h2 id="install-title">Real vehicle application photos</h2>
                <p>Scene photos show compact rooftop AC placement on light trucks, vans and pickup roofs for faster fitment discussion.</p>
              </div>
              <div className="install-layout" aria-label="Vehicle rooftop AC scene photos">
                {installScenes.map((s) => (
                  <article key={s.src} className="install-card">
                    <button
                      className="gallery-trigger"
                      type="button"
                      onClick={() => openLightbox(s.src, s.alt, s.lightboxCaption)}
                      aria-label={`Enlarge: ${s.title}`}
                    >
                      <img src={s.src} alt={s.alt} loading="lazy" decoding="async" />
                    </button>
                    <div className="copy">
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Certificates */}
            <section className="content-section" id="certificates" aria-labelledby="cert-title">
              <div className="section-head">
                <h2 id="cert-title">Certificates and document proof</h2>
                <p>Certificate images appear after the major proof sections so the first screen stays fast while still supporting due diligence.</p>
              </div>
              <div className="cert-grid">
                {certificates.map((c) => (
                  <article key={c.src} className="cert-card">
                    <img src={c.src} alt={c.alt} loading="lazy" decoding="async" />
                    <div>
                      <small>{c.kicker}</small>
                      <h3>{c.title}</h3>
                      <p>{c.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Legacy SEO block */}
            <section className="content-section legacy-seo" id="specs" aria-labelledby="specs-title">
              <div className="section-head">
                <h2 id="specs-title">Specifications and key features</h2>
                <p>Full Nano Max technical sheet for fitment validation and dealer documentation.</p>
              </div>
              <div className="legacy-grid">
                <div className="legacy-card">
                  <h3>Key features</h3>
                  <ul className="legacy-features">
                    {features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="legacy-card">
                  <h3>Technical specifications</h3>
                  <table className="legacy-specs">
                    <tbody>
                      {specs.map((s) => (
                        <tr key={s.label}>
                          <th scope="row">{s.label}</th>
                          <td>{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="content-section legacy-seo" id="faq" aria-labelledby="faq-title">
              <div className="section-head">
                <h2 id="faq-title">Frequently asked questions</h2>
                <p>Common dealer, installer, fleet and end-user questions about the Nano Max compact light-truck parking AC.</p>
              </div>
              <div className="legacy-faq">
                {nanoMaxFaqs.map((f) => (
                  <details key={f.question}>
                    <summary>{f.question}</summary>
                    <p>{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="content-section legacy-seo" id="reviews" aria-labelledby="reviews-title">
              <div className="section-head">
                <h2 id="reviews-title">Driver and operator reviews</h2>
                <p>Selected light-truck and pickup operator feedback for the Nano Max.</p>
              </div>
              <div className="legacy-reviews">
                {nanoMaxReviews.map((r) => (
                  <article key={r.id} className="legacy-review-card">
                    <header>
                      <div className="stars" aria-label={`${r.rating} out of 5 stars`}>
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={16} fill="#f5b201" stroke="#f5b201" />
                        ))}
                      </div>
                      <strong>{r.title}</strong>
                      <span>{r.name} · {r.location} · {r.date}</span>
                    </header>
                    <p>{r.body}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* Mobile inquiry repeat */}
            <section className="content-section mobile-inquiry" aria-label="Inquiry form (mobile)">
              <div className="section-head">
                <h2>Send your inquiry</h2>
                <p>Tell us vehicle type, voltage, roof opening, battery setup and quantity. We reply with fitment confirmation and a private quote.</p>
              </div>
              <div className="mobile-form-card">
                <CompactInquiryForm
                  source="product_nano_max_mobile"
                  productName="Nano Max Light Truck Parking AC"
                  title=""
                  subtitle=""
                  successMessage="Thanks. CoolDrivePro will review your light-truck model, voltage, install layout and quantity before sending a fitment-confirmed quote for the Nano Max."
                />
              </div>
            </section>
          </div>

          {/* ============================== RIGHT (sticky) ============================== */}
          <aside className="right-col" aria-label="Sticky inquiry form">
            <div className="quote-card" id="quote" aria-labelledby="quote-title">
              <span className="kicker">Inquiry</span>
              <h2 id="quote-title">Request a Fitment-Checked Dealer Quote</h2>
              <p>Send your light-truck or van model, voltage, roof opening, battery setup and order quantity. CoolDrivePro will confirm Nano Max fitment before quotation.</p>
              <ul className="quick-proof" aria-label="Inquiry proof points">
                {inquiryProofBullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="inline-form">
                <CompactInquiryForm
                  source="product_nano_max_sticky"
                  productName="Nano Max Light Truck Parking AC"
                  title=""
                  subtitle=""
                  successMessage="Thanks. CoolDrivePro will review your light-truck model, voltage, install layout and quantity before sending a fitment-confirmed quote for the Nano Max."
                />
              </div>
              <p className="microcopy">
                No price is shown publicly. Lead-only; replies come from the B2B team within one business day.
              </p>
            </div>
          </aside>
        </main>

        {/* Lightbox */}
        {lightbox && (
          <div
            className="lightbox is-open"
            role="dialog"
            aria-modal="true"
            aria-label="Expanded product image preview"
            onClick={closeLightbox}
          >
            <button
              className="lightbox-close"
              type="button"
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            >
              Close
            </button>
            <figure onClick={(e) => e.stopPropagation()}>
              <img src={lightbox.src} alt={lightbox.alt} />
              <figcaption>{lightbox.caption}</figcaption>
            </figure>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

/* ----------------------------- subcomponents ----------------------------- */

function YouTubeShowcase(_props: { activated: boolean; onActivate: () => void }) {
  // Direct auto-play: muted + loop so browsers allow autoplay without a click.
  // `playlist=ID` is required for the `loop` parameter to work on YouTube embeds.
  void _props;
  return (
    <iframe
      className="hero-video"
      src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_ID}&controls=1&rel=0&modestbranding=1&playsinline=1`}
      title="CoolDrivePro Nano Max compact light-truck parking AC product showcase"
      loading="eager"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

function SlowBackgroundVideo({
  src,
  poster,
  ariaLabel,
  rate = 0.5,
}: {
  src: string;
  poster: string;
  ariaLabel: string;
  rate?: number;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.playbackRate = rate;
    const apply = () => {
      v.playbackRate = rate;
    };
    v.addEventListener("loadedmetadata", apply);
    v.addEventListener("play", apply);
    // Some browsers reset playbackRate after autoplay starts; nudge it once more.
    const t = window.setTimeout(apply, 300);
    return () => {
      v.removeEventListener("loadedmetadata", apply);
      v.removeEventListener("play", apply);
      window.clearTimeout(t);
    };
  }, [rate]);
  return (
    <video
      ref={ref}
      className="video-poster"
      src={src}
      poster={poster}
      aria-label={ariaLabel}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

/* --------------------------------- styles --------------------------------- */
/* Scoped under `.tmb2b-root` — shared visual system with the VS02 PRO page so
 * the brand looks consistent and the same site nav/footer applies via
 * PageLayout. Each product page only injects its own copy at runtime.
 */

const MERGED_CSS = `
.tmb2b-root {
  --ink: #101827;
  --deep: #081421;
  --muted: #5d6a78;
  --line: #d9e2ec;
  --paper: #ffffff;
  --soft: #f3f6f8;
  --blue: #155eef;
  --blue-dark: #0f47b7;
  --green: #16875b;
  --amber: #9a610f;
  --shadow: rgba(18, 35, 58, 0.13);
  color: var(--ink);
  background: var(--paper);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
.tmb2b-root *, .tmb2b-root *::before, .tmb2b-root *::after { box-sizing: border-box; }
.tmb2b-root img, .tmb2b-root video, .tmb2b-root iframe { display: block; max-width: 100%; }
.tmb2b-root img { height: auto; }
.tmb2b-root a { color: inherit; text-decoration: none; }
.tmb2b-root button, .tmb2b-root input, .tmb2b-root select, .tmb2b-root textarea { font: inherit; }
.tmb2b-root h1, .tmb2b-root h2, .tmb2b-root h3, .tmb2b-root p { margin: 0; }
.tmb2b-root h1, .tmb2b-root h2, .tmb2b-root h3 { color: var(--deep); line-height: 1.12; letter-spacing: 0; }
.tmb2b-root ul { margin: 0; padding: 0; list-style: none; }

.tmb2b-root .tmb2b-breadcrumb {
  width: min(1320px, calc(100% - 32px));
  margin: 14px auto 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #5d6a78;
}
.tmb2b-root .tmb2b-breadcrumb a { color: #5d6a78; }
.tmb2b-root .tmb2b-breadcrumb a:hover { color: var(--blue); text-decoration: underline; }
.tmb2b-root .tmb2b-breadcrumb > span { color: var(--deep); font-weight: 700; }

.tmb2b-root .btn {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 11px 15px;
  font-weight: 950;
  line-height: 1.1;
  cursor: pointer;
  text-align: center;
}
.tmb2b-root .btn.primary { background: var(--blue); color: #fff; }
.tmb2b-root .btn.primary:hover { background: var(--blue-dark); }
.tmb2b-root .btn.secondary { border-color: #aebfd1; background: #fff; color: var(--deep); }
.tmb2b-root .btn.secondary:hover { background: #f4f7fb; }

.tmb2b-root .desk-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(330px, 33vw, 440px);
  width: min(1320px, calc(100% - 32px));
  margin: 14px auto 0;
  gap: 30px;
}
.tmb2b-root .left-col { padding: 18px 0 64px 0; min-width: 0; }
.tmb2b-root .right-col {
  position: relative;
  border-left: 1px solid var(--line);
  padding: 18px 0 64px 28px;
}
.tmb2b-root .quote-card {
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 130px);
  overflow: auto;
  border: 1px solid #b8d3f2;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.99);
  box-shadow: 0 18px 52px var(--shadow);
  padding: 22px;
}
.tmb2b-root .quote-card::-webkit-scrollbar { width: 8px; }
.tmb2b-root .quote-card::-webkit-scrollbar-thumb { border-radius: 999px; background: #c9d6e6; }
.tmb2b-root .quote-card h2 { font-size: 27px; }
.tmb2b-root .quote-card p { margin-top: 10px; color: var(--muted); }
.tmb2b-root .kicker {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 10px;
  border-radius: 6px;
  background: #d8ecff;
  color: #0754af;
  padding: 5px 10px;
  font-size: 13px;
  font-weight: 950;
  text-transform: uppercase;
}
.tmb2b-root .quick-proof { display: grid; gap: 8px; margin-top: 18px; }
.tmb2b-root .quick-proof li { display: flex; gap: 8px; color: #34465a; font-size: 13px; }
.tmb2b-root .quick-proof li::before { content: ""; width: 8px; height: 8px; margin-top: 7px; border-radius: 50%; background: var(--green); flex: 0 0 auto; }
.tmb2b-root .inline-form { margin-top: 18px; }
.tmb2b-root .microcopy { margin-top: 12px; color: #667587; font-size: 12px; }

.tmb2b-root .product-hero {
  display: grid;
  grid-template-rows: minmax(520px, auto) auto;
  overflow: hidden;
  border-radius: 8px;
  background: #f7fafc;
  border: 1px solid var(--line);
}
.tmb2b-root .hero-copy {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
  padding: 34px clamp(24px, 4vw, 46px) 38px;
  border-top: 1px solid var(--line);
  background: #fff;
}
.tmb2b-root .eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  color: var(--green);
  font-size: 13px;
  font-weight: 950;
  text-transform: uppercase;
}
.tmb2b-root .eyebrow::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--green); }
.tmb2b-root .product-hero h1 { margin-top: 12px; font-size: clamp(30px, 3.6vw, 50px); font-weight: 950; max-width: 900px; line-height: 1.08; }
.tmb2b-root .lead { margin-top: 14px; color: #415266; font-size: 17px; max-width: 720px; }
.tmb2b-root .hero-answers { margin-top: 18px; display: grid; gap: 10px; max-width: 760px; }
.tmb2b-root .hero-answers li {
  position: relative;
  padding: 10px 14px 10px 32px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #f8fafc;
  color: var(--ink);
  font-size: 15px;
  line-height: 1.5;
}
.tmb2b-root .hero-answers li::before {
  content: "\\2713";
  position: absolute;
  left: 12px;
  top: 10px;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--green);
  font-weight: 950;
}
.tmb2b-root .hero-trust { margin-top: 14px; color: #4a5868; font-size: 14px; max-width: 760px; line-height: 1.55; }
.tmb2b-root .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
.tmb2b-root .hero-specs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #f8fafc;
}
.tmb2b-root .hero-specs div { min-height: 0; border-right: 1px solid var(--line); padding: 18px 20px; }
.tmb2b-root .hero-specs div:last-child { border-right: 0; }
.tmb2b-root .hero-specs span { display: block; color: #667587; font-size: 11px; font-weight: 900; text-transform: uppercase; }
.tmb2b-root .hero-specs strong { display: block; margin-top: 7px; color: var(--deep); font-size: clamp(18px, 2vw, 24px); line-height: 1.25; }
.tmb2b-root .hero-media {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #d7dee8;
  background: #07111f;
  min-height: 520px;
  display: grid;
  place-items: center;
}
.tmb2b-root .hero-media img { width: min(96%, 980px); max-height: min(72vh, 660px); object-fit: contain; }
.tmb2b-root .hero-video {
  width: 100%;
  height: 100%;
  min-height: 520px;
  border: 0;
  object-fit: contain;
  background: #07111f;
  aspect-ratio: 16 / 9;
}
.tmb2b-root .yt-facade {
  position: relative;
  width: 100%;
  min-height: 520px;
  border: 0;
  padding: 0;
  margin: 0;
  background: #07111f;
  cursor: pointer;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.tmb2b-root .yt-facade img { width: 100%; height: 100%; max-height: 100%; object-fit: cover; opacity: 0.92; }
.tmb2b-root .yt-facade::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,12,23,0.05) 0%, rgba(5,12,23,0.55) 100%); }
.tmb2b-root .yt-facade-play {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 2;
  transition: transform 180ms ease;
}
.tmb2b-root .yt-facade:hover .yt-facade-play { transform: scale(1.08); }
.tmb2b-root .yt-facade-label {
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  z-index: 2;
  display: inline-flex;
  background: rgba(8,20,33,0.78);
  color: #fff;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 850;
  letter-spacing: 0.02em;
}
.tmb2b-root .media-caption {
  position: absolute;
  left: 18px;
  bottom: 18px;
  display: inline-flex;
  border-radius: 6px;
  background: rgba(8, 20, 33, 0.88);
  color: #fff;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 850;
  z-index: 3;
}

.tmb2b-root .content-section { padding: 64px 0 0; }
.tmb2b-root .section-head {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(260px, 0.42fr);
  gap: 48px;
  align-items: start;
  margin-bottom: 30px;
}
.tmb2b-root .section-head h2 { font-size: clamp(28px, 3vw, 40px); font-weight: 950; max-width: 680px; }
.tmb2b-root .section-head p { color: var(--muted); font-size: 17px; line-height: 1.6; max-width: 420px; }

.tmb2b-root .product-detail-section { display: grid; align-content: start; }
.tmb2b-root .product-wall { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.tmb2b-root .product-shot { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: #fff; margin: 0; }
.tmb2b-root .gallery-trigger { width: 100%; border: 0; border-bottom: 1px solid var(--line); background: #f5f8fb; padding: 0; cursor: zoom-in; }
.tmb2b-root .gallery-trigger:focus-visible { outline: 3px solid rgba(21, 94, 239, 0.3); outline-offset: -3px; }
.tmb2b-root .product-shot img { width: 100%; height: clamp(160px, 17vw, 220px); object-fit: contain; padding: 14px; background: #f5f8fb; transition: transform 180ms ease; }
.tmb2b-root .product-shot:hover img { transform: scale(1.03); }
.tmb2b-root .product-shot figcaption { display: grid; gap: 5px; min-height: 104px; background: #fff; padding: 14px 16px; }
.tmb2b-root .product-shot b { color: var(--deep); font-size: 16px; }
.tmb2b-root .product-shot span { color: var(--muted); font-size: 13px; }

.tmb2b-root .lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: rgba(5, 12, 23, 0.86);
}
.tmb2b-root .lightbox.is-open { display: flex; }
.tmb2b-root .lightbox figure { width: min(100%, 1080px); margin: 0; }
.tmb2b-root .lightbox img { width: 100%; max-height: calc(100vh - 150px); object-fit: contain; border-radius: 8px; background: #fff; }
.tmb2b-root .lightbox figcaption { margin-top: 12px; color: #fff; font-size: 16px; font-weight: 850; text-align: center; }
.tmb2b-root .lightbox-close {
  position: absolute;
  top: 18px;
  right: 18px;
  min-width: 72px;
  min-height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.tmb2b-root .video-band {
  position: relative;
  min-height: 480px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--deep);
  color: #fff;
  display: grid;
  align-items: end;
}
.tmb2b-root .video-band video,
.tmb2b-root .video-poster { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.tmb2b-root .video-poster { opacity: 0.7; }
.tmb2b-root .video-band::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5, 12, 23, 0.16) 0%, rgba(5, 12, 23, 0.82) 100%); }
.tmb2b-root .video-content { position: relative; z-index: 1; padding: 34px; max-width: 780px; }
.tmb2b-root .video-content .eyebrow { color: #b7f0d1; }
.tmb2b-root .video-content h2 { margin-top: 12px; color: #fff; font-size: clamp(30px, 4.4vw, 56px); }
.tmb2b-root .video-content p { margin-top: 14px; color: #dce8f5; font-size: 18px; }
.tmb2b-root .fact-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 22px; }
.tmb2b-root .fact-row div { border-left: 3px solid #73d49f; background: rgba(255,255,255,0.1); padding: 12px; }
.tmb2b-root .fact-row strong { display: block; color: #fff; font-size: 24px; }
.tmb2b-root .fact-row span { color: #d5e4f5; font-size: 12px; }

.tmb2b-root .image-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 16px; }
.tmb2b-root .image-tile { overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: #fff; margin: 0; }
.tmb2b-root .image-tile.large { grid-column: span 2; }
.tmb2b-root .image-tile img { width: 100%; height: 230px; object-fit: cover; background: #eef3f8; }
.tmb2b-root .image-tile.large img { height: 320px; }
.tmb2b-root .image-tile figcaption { padding: 12px 14px; color: #314154; font-size: 13px; font-weight: 850; }
.tmb2b-root .factory-proof-grid { gap: 16px; margin-top: 18px; }
.tmb2b-root .factory-proof-grid .image-tile img { height: clamp(190px, 18vw, 235px); }
.tmb2b-root .factory-proof-grid .image-tile figcaption { min-height: 54px; display: flex; align-items: center; }

.tmb2b-root .install-layout { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.tmb2b-root .install-card { overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.tmb2b-root .install-card img { width: 100%; height: clamp(230px, 23vw, 320px); object-fit: cover; padding: 0; background: #eef3f8; }
.tmb2b-root .install-card .copy { padding: 16px; }
.tmb2b-root .install-card h3 { font-size: 20px; }
.tmb2b-root .install-card p { margin-top: 8px; color: var(--muted); font-size: 14px; }

.tmb2b-root .cert-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.tmb2b-root .cert-card { display: grid; grid-template-columns: minmax(160px, 0.42fr) minmax(0, 1fr); gap: 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff; padding: 14px; margin: 0; }
.tmb2b-root .cert-card img { width: 100%; height: 210px; object-fit: contain; background: #f7f8fa; border-radius: 6px; border: 1px solid #eef1f4; }
.tmb2b-root .cert-card h3 { font-size: 19px; }
.tmb2b-root .cert-card p { margin-top: 8px; color: var(--muted); font-size: 14px; }
.tmb2b-root .cert-card small { display: inline-flex; margin-bottom: 9px; color: var(--amber); font-size: 12px; font-weight: 950; text-transform: uppercase; }

.tmb2b-root .supply-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.tmb2b-root .supply-step { min-height: 160px; border: 1px solid var(--line); border-radius: 8px; background: #fff; padding: 18px; }
.tmb2b-root .supply-step b { display: inline-flex; width: 34px; height: 34px; align-items: center; justify-content: center; border-radius: 50%; background: var(--deep); color: #fff; }
.tmb2b-root .supply-step h3 { margin-top: 14px; font-size: 19px; }
.tmb2b-root .supply-step p { margin-top: 8px; color: var(--muted); font-size: 14px; }

.tmb2b-root .usecase-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.tmb2b-root .usecase-card { border: 1px solid var(--line); border-radius: 10px; background: #fff; padding: 18px 20px; transition: border-color .15s ease, box-shadow .15s ease; }
.tmb2b-root .usecase-card:hover { border-color: var(--blue); box-shadow: 0 6px 18px var(--shadow); }
.tmb2b-root .usecase-card h3 { font-size: 16px; line-height: 1.35; color: var(--deep); }
.tmb2b-root .usecase-card p { margin-top: 8px; color: var(--muted); font-size: 14px; line-height: 1.55; }
.tmb2b-root .usecase-foot { margin-top: 18px; padding: 14px 18px; background: var(--soft); border-radius: 8px; color: var(--ink); font-size: 14px; line-height: 1.6; }
.tmb2b-root .usecase-foot a { color: var(--blue); text-decoration: underline; }

.tmb2b-root .legacy-seo { padding-top: 64px; }
.tmb2b-root .legacy-grid { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 24px; }
.tmb2b-root .legacy-card { border: 1px solid var(--line); border-radius: 8px; background: #fff; padding: 20px 22px; }
.tmb2b-root .legacy-card h3 { font-size: 18px; margin-bottom: 12px; }
.tmb2b-root .legacy-features li { padding: 8px 0; border-bottom: 1px solid var(--soft); color: #314154; font-size: 14.5px; }
.tmb2b-root .legacy-features li:last-child { border-bottom: 0; }
.tmb2b-root .legacy-specs { width: 100%; border-collapse: collapse; font-size: 14px; }
.tmb2b-root .legacy-specs th, .tmb2b-root .legacy-specs td { padding: 10px 12px; border-bottom: 1px solid var(--soft); text-align: left; }
.tmb2b-root .legacy-specs th { color: #5d6a78; font-weight: 600; width: 45%; }
.tmb2b-root .legacy-specs td { color: var(--deep); font-weight: 700; }
.tmb2b-root .legacy-faq { display: grid; gap: 10px; }
.tmb2b-root .legacy-faq details { border: 1px solid var(--line); border-radius: 8px; background: #fff; padding: 14px 18px; }
.tmb2b-root .legacy-faq summary { cursor: pointer; font-weight: 800; color: var(--deep); font-size: 16px; }
.tmb2b-root .legacy-faq p { margin-top: 10px; color: #415266; font-size: 14.5px; }
.tmb2b-root .legacy-reviews { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.tmb2b-root .legacy-review-card { border: 1px solid var(--line); border-radius: 8px; background: #fff; padding: 18px; }
.tmb2b-root .legacy-review-card header { display: grid; gap: 4px; margin-bottom: 10px; }
.tmb2b-root .legacy-review-card .stars { display: inline-flex; gap: 2px; }
.tmb2b-root .legacy-review-card strong { color: var(--deep); font-size: 16px; }
.tmb2b-root .legacy-review-card span { color: var(--muted); font-size: 12.5px; }
.tmb2b-root .legacy-review-card p { color: #314154; font-size: 14.5px; line-height: 1.55; }

.tmb2b-root .mobile-inquiry { display: none; }
.tmb2b-root .mobile-form-card { border: 1px solid #b8d3f2; border-radius: 8px; background: #fff; padding: 18px; box-shadow: 0 12px 40px var(--shadow); }

@media (max-width: 980px) {
  .tmb2b-root .desk-shell { grid-template-columns: 1fr; }
  .tmb2b-root .right-col { display: none; }
  .tmb2b-root .mobile-inquiry { display: block; }
  .tmb2b-root .legacy-grid { grid-template-columns: 1fr; }
  .tmb2b-root .legacy-reviews { grid-template-columns: 1fr; }
  .tmb2b-root .usecase-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 820px) {
  .tmb2b-root .product-hero { grid-template-rows: minmax(320px, auto) auto; }
  .tmb2b-root .hero-copy, .tmb2b-root .section-head, .tmb2b-root .install-layout { grid-template-columns: 1fr; }
  .tmb2b-root .product-hero h1 { font-size: 30px; line-height: 1.14; }
  .tmb2b-root .lead { font-size: 16px; }
  .tmb2b-root .hero-media { min-height: 320px; }
  .tmb2b-root .hero-video { min-height: 320px; }
  .tmb2b-root .yt-facade { min-height: 320px; }
  .tmb2b-root .hero-specs,
  .tmb2b-root .product-wall,
  .tmb2b-root .image-grid,
  .tmb2b-root .fact-row,
  .tmb2b-root .cert-grid,
  .tmb2b-root .supply-strip,
  .tmb2b-root .usecase-grid { grid-template-columns: 1fr; }
  .tmb2b-root .product-detail-section .product-wall { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .tmb2b-root .product-shot img { height: 132px; padding: 10px; }
  .tmb2b-root .product-shot figcaption { min-height: 96px; padding: 12px; }
  .tmb2b-root .product-shot b { font-size: 14px; }
  .tmb2b-root .product-shot span { font-size: 12px; }
  .tmb2b-root .hero-specs div { border-right: 0; border-bottom: 1px solid var(--line); }
  .tmb2b-root .hero-specs div:last-child { border-bottom: 0; }
  .tmb2b-root .image-tile.large { grid-column: auto; }
  .tmb2b-root .product-shot img { aspect-ratio: 4 / 3; }
  .tmb2b-root .video-band { min-height: 420px; }
  .tmb2b-root .video-content { padding: 24px; }
  .tmb2b-root .video-content h2 { font-size: 30px; }
  .tmb2b-root .image-tile img,
  .tmb2b-root .image-tile.large img { height: auto; aspect-ratio: 16 / 10; }
  .tmb2b-root .cert-card { grid-template-columns: 1fr; }
}
`;
