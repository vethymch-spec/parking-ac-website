/**
 * Product Detail Page: 12000 BTU Top-Mounted Parking Air Conditioner
 *
 * Merged version: new B2B inquiry-focused visual (from approved preview at
 * /drafts/top-mounted-b2b) wrapped inside the production PageLayout, with the
 * original SEO (title, description, ogImage, FAQ JSON-LD, canonical via static
 * meta) preserved untouched so the URL keeps its existing rankings.
 *
 * Below the new visual a "legacy SEO" block reproduces specs, features, full
 * FAQ list, and reviews so the page's existing on-page topics are still in
 * the rendered (and pre-rendered) HTML.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import CompactInquiryForm from "@/components/CompactInquiryForm";
import ProductLineSwitcher from "@/components/ProductLineSwitcher";
import { useSEO } from "@/hooks/useSEO";

/* ------------------------------ legacy SEO data ------------------------------ */
/* Preserved from the original ProductTopMounted.tsx so on-page topics and the
 * FAQ JSON-LD do not change for crawlers.
 */

const vs02Faqs = [
  {
    question: "What is the CoolDrivePro VS02 PRO?",
    answer: "The CoolDrivePro VS02 PRO is a 12V/24V DC rooftop parking air conditioner that delivers 12,000 BTU/h no-idle cooling for semi trucks, RVs, vans, campers and fleet vehicles. It runs from the vehicle battery instead of shore power or engine idling, using a DC dual rotary compressor, undervoltage battery protection and quiet parked-cab operation.",
  },
  {
    question: "Does this truck AC run without engine idling?",
    answer: "Yes. The VS02 PRO runs from the vehicle 12V or 24V DC battery system, so it can cool the parked cab without engine idling, shore power or a generator. A built-in undervoltage cutoff at 11V helps protect the battery during long rest periods.",
  },
  {
    question: "Is the VS02 PRO a 12V or 24V parking air conditioner?",
    answer: "The VS02 PRO supports both 12V and 24V DC systems. Before quotation, CoolDrivePro confirms voltage, vehicle type, roof opening, battery setup and order quantity so the unit can be matched to the target vehicle.",
  },
  {
    question: "How does the VS02 PRO differ from a standard rooftop RV air conditioner?",
    answer: "Unlike many standard rooftop RV air conditioners that depend on shore power or a generator, the VS02 PRO runs on 12V or 24V DC battery power. It is built around a DC dual rotary compressor, 10-45A current range, undervoltage battery protection and quiet no-idle operation for parked vehicle use.",
  },
  {
    question: "How long can the VS02 PRO run on battery?",
    answer: "Runtime depends on battery capacity, battery chemistry, ambient temperature, insulation, set temperature and compressor duty cycle. Send the battery type and capacity together with vehicle details and CoolDrivePro can help estimate a realistic setup. The unit includes an 11V undervoltage cutoff to protect the battery.",
  },
  {
    question: "Is the VS02 PRO compatible with semi trucks?",
    answer: "The VS02 PRO supports both 12V and 24V DC systems, so it can be considered for semi trucks, RVs, vans, campers and fleet vehicles. Fitment is not universal. CoolDrivePro asks for vehicle type, voltage, roof opening and quantity so the team can confirm compatibility before quotation.",
  },
  {
    question: "What is the noise level of the VS02 PRO?",
    answer: "The VS02 PRO is rated at \u226445 dB. The DC dual rotary compressor and brushless fan motor are designed for quieter parked-cab cooling compared with engine idling.",
  },
  {
    question: "What roof opening does it need?",
    answer: "The VS02 PRO is designed around a standard 14 inch / 356 mm roof opening. Actual fitment depends on roof structure, wiring path and vehicle layout, so CoolDrivePro reviews vehicle details before quotation and can provide installation guidance for qualified installers.",
  },
  {
    question: "Does the VS02 PRO work with solar panels?",
    answer: "Yes. It can be used in battery systems charged by solar, alternator, shore power or other charging sources. Actual runtime depends on the solar array, charge controller, battery bank, weather, heat load and usage pattern.",
  },
  {
    question: "What warranty does the VS02 PRO come with?",
    answer: "The CoolDrivePro VS02 PRO includes a 1-year manufacturer warranty covering defects in materials and workmanship. Eligible returns are handled under the published return policy. Technical support is available at support@cooldrivepro.com. Full warranty terms are available at cooldrivepro.com/warranty.",
  },
];

const specs = [
  { label: "Cooling Capacity", value: "12,000 BTU/h" },
  { label: "Current", value: "10-45A" },
  { label: "Power Supply", value: "12V / 24V DC" },
  { label: "Rated Current (12V)", value: "≤ 45A" },
  { label: "Rated Current (24V)", value: "≤ 10A" },
  { label: "Compressor Type", value: "DC dual rotary" },
  { label: "Refrigerant", value: "R410a" },
  { label: "Noise Level", value: "≤ 45 dB" },
  { label: "Operating Temp", value: "0°C to +55°C" },
  { label: "Dimensions", value: "980 × 680 × 190 mm" },
  { label: "Weight", value: "34 kg" },
  { label: "Roof Opening", value: "Standard 14\" (356 mm)" },
  { label: "Battery Protection", value: "Undervoltage Cutoff" },
  { label: "Warranty", value: "1 Year" },
];

const features = [
  "12V/24V DC no-idle operation — no engine required",
  "12,000 BTU cooling in one unit",
  "Whisper-quiet ≤45 dB brushless fan motor",
  "Undervoltage battery protection (auto cutoff at 11V)",
  "Fits standard 14\" RV roof opening — no modification needed",
  "Pre-charged refrigerant lines — plug-and-play installation",
  "IP54-rated for dust and moisture resistance",
  "Works with lithium, AGM, or lead-acid battery banks",
];

/* ------------------------------- new visual data ------------------------------- */

const PRODUCT_TITLE = "12V/24V 12000 BTU Rooftop Parking AC for Trucks, RVs and Vans";
const PRODUCT_LEAD =
  "The CoolDrivePro VS02 PRO is a 12V/24V DC rooftop parking air conditioner that delivers 12,000 BTU/h no-idle cooling for semi trucks, RVs, vans, campers and fleet vehicles. It runs from the vehicle battery instead of shore power or engine idling, using a DC dual rotary compressor, undervoltage protection and \u226445 dB quiet operation for parked-cab cooling.";

const PRODUCT_ANSWER_BULLETS = [
  "The VS02 PRO is a 12V/24V DC rooftop parking AC built for no-idle cooling in semi trucks, RVs, vans and campers.",
  "It provides 12,000 BTU/h cooling, uses a DC dual rotary compressor, and is rated at \u226445 dB for quiet parked-vehicle operation.",
  "Before quoting, CoolDrivePro confirms vehicle type, voltage, roof opening, battery setup and order quantity to reduce fitment risk.",
];

const PRODUCT_TRUST_SUMMARY =
  "Manufactured by CoolDrivePro at its own factory; units have been shown at international HVAC and trucking trade exhibitions and ship with ISO 9001:2015, CNAS lab and design-patent conformity documentation.";

const heroSpecs = [
  { label: "Cooling", value: "12,000 BTU/h" },
  { label: "Voltage", value: "12V / 24V DC" },
  { label: "Noise", value: "≤ 45 dB" },
  { label: "Roof opening", value: '14" / 356 mm' },
];

// 主图+说明+缩略图横滑
const galleryImages = [
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-01-hero_d84a64e3.webp",
    alt: "28.3 inches x 28.3 inches, compact design saves roof space for solar panels or storage. Weighs 45LB, reducing load and boosting fuel efficiency.",
    caption: "The compact design saves roof space for solar panels or storage. Weighs 45LB, reducing load and boosting fuel efficiency."
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-02-front-side_ae7ed14d.webp",
    alt: "Inverter Air Conditioner, Stable Every with Low Power Consumption.",
    caption: "Smart inverter tech enables steady cooling with low power use. Brief ambient load curve: VS02 Pro vs. 230V van inverter."
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-03-top-fans_d671776f.webp",
    alt: "Wiring and battery bank reference for parking air conditioner.",
    caption: "Shows wiring and battery bank reference for parking air conditioner."
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-04-front-flat_2b4ac31a.webp",
    alt: "Slim side profile design.",
    caption: "The 3.1 inch low-profile design with sleek cover reduces wind resistance and helps more easily park under carports."
  },
  // ...可继续补充更多图片和说明
];

const inquirySteps = [
  { n: 1, title: "Buyer role", body: "Dealer, distributor, fleet, installer, importer, wholesaler, or OEM." },
  { n: 2, title: "Vehicle fit", body: "Voltage, roof opening, vehicle type, climate, and battery plan." },
  { n: 3, title: "Proof package", body: "Product images, factory proof, exhibition records, documents, and install notes." },
  { n: 4, title: "Commercial reply", body: "Sample, pilot, wholesale batch, dealer territory, or OEM feasibility." },
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
  alt: `CoolDrivePro trade show booth photo ${i + 1} – B2B distributor engagement`,
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
  { src: "/images/scenes/ac-scene-workshop-rooftop.jpg", alt: "Rooftop parking AC installed on truck in workshop scene", title: "Truck roof application", body: "Shows the rooftop unit position on a work vehicle for quick buyer fitment review.", lightboxCaption: "Truck roof application" },
  { src: "/images/scenes/ac-scene-van-rooftop.jpg", alt: "Commercial van with rooftop parking air conditioner scene", title: "Commercial van reference", body: "Useful for judging roof placement, vehicle height, and real road-use context.", lightboxCaption: "Commercial van reference" },
  { src: "/images/scenes/ac-scene-rooftop-unit.jpg", alt: "Close view of rooftop parking air conditioner on vehicle roof", title: "Rooftop unit close view", body: "Clear exterior view for buyers checking shell size, roof fit, and visual finish.", lightboxCaption: "Rooftop unit close view" },
];

const certificates = [
  { src: "/images/trust/certifications/cooldrivepro-iso-9001-2015-certificate.png", alt: "ISO 9001 2015 quality management certificate", kicker: "Quality system", title: "ISO 9001:2015", body: "Issued to Qingdao Vethy Industrial Co., Ltd. for quality management system review." },
  { src: "/images/trust/certifications/cooldrivepro-cnas-quality-certificate.png", alt: "CNAS quality certificate", kicker: "Testing capability", title: "CNAS lab certificate", body: "Supports recognized capability to test cooling capacity, energy efficiency, vibration, and electrical safety." },
  { src: "/images/trust/certifications/cooldrivepro-trademark-registration.png", alt: "CoolDrivePro trademark registration certificate", kicker: "Brand IP", title: "Registered trademark", body: "Protects the CoolDrivePro and Vethy brand identity across vehicle climate-control product classes." },
  { src: "/images/trust/certifications/cooldrivepro-design-patent-certificate.png", alt: "CoolDrivePro design patent certificate", kicker: "Product IP", title: "Granted design patent", body: "Industrial design protection for the top-mounted parking AC housing." },
];

const inquiryProofBullets = [
  "Dealer, distributor, wholesale, fleet, installer, and OEM routes",
  "VS02 PRO product images, factory proof, certificates, and installation references",
  "Sample, pilot order, and bulk supply discussion after qualification",
];

/* ----------------------------- buyer search vocabulary ---------------------------- */
/* Common search phrases this exact product answers. Kept as visible on-page content
 * so the page covers parking AC, 12V/24V, rooftop, DC, and battery-powered intent.
 */

const searchVocabClusters = [
  {
    label: "Parking AC intent",
    intro:
      "The VS02 PRO is a parking air conditioner — a parking AC unit built to cool a vehicle cab while the engine is off. It targets buyers searching for a parking air conditioner or parking AC for semi trucks, RVs, vans, campers, and fleet vehicles.",
    terms: ["parking air conditioner", "parking ac"],
  },
  {
    label: "12V and 24V parking AC",
    intro:
      "Because the unit runs from the vehicle electrical system, it covers both 12V parking air conditioner and 24V parking air conditioner searches. The same VS02 PRO platform supports 12V parking AC builds for vans, pickups and RVs and 24V parking AC builds for semi trucks and heavy-duty fleet vehicles.",
    terms: ["12v parking air conditioner", "24v parking air conditioner"],
  },
  {
    label: "Rooftop and DC parking AC",
    intro:
      "The VS02 PRO is a rooftop parking air conditioner — a roof-mounted, self-contained DC parking air conditioner that installs into a standard 14\" / 356 mm roof opening. It is wired directly to the 12V or 24V DC battery system, so it is a true DC parking AC instead of an AC-powered window or shore-power unit.",
    terms: ["rooftop parking air conditioner", "dc parking air conditioner"],
  },
  {
    label: "Battery-powered no-idle cooling",
    intro:
      "For buyers searching for a battery powered air conditioner for trucks, RVs and vans, the VS02 PRO runs off the vehicle battery bank with undervoltage protection at 11V. It is built specifically as a battery-powered parking AC for no-idle overnight cab cooling.",
    terms: ["battery powered air conditioner"],
  },
];

/* ------------------------------- component ------------------------------- */

export default function ProductTopMounted() {
  const { t } = useTranslation();

  // ⚠️ SEO: canonical/hreflang remain owned by useSEO + static-meta.json.
  // SSR Product + BreadcrumbList JSON-LD are injected by scripts/prerender.mjs;
  // here we only inject the FAQPage JSON-LD at runtime to avoid duplicates.
  useSEO({
    title: "12V/24V Parking Air Conditioner | Rooftop DC Battery-Powered Parking AC | CoolDrivePro VS02 PRO",
    description:
      "CoolDrivePro VS02 PRO is a 12V/24V rooftop parking air conditioner — a battery-powered DC parking AC delivering 12,000 BTU/h no-idle cooling for semi trucks, RVs, vans and campers with \u226445 dB quiet operation and dealer fitment support.",
    ogImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-01-hero_d84a64e3.webp",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: vs02Faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  });

  const [selectedIdx, setSelectedIdx] = useState(0);
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

  const css = useMemo(() => MERGED_CSS, []);


  return (
    <PageLayout>
      <ProductLineSwitcher activeSlug="top-mounted-ac" />
      <div className="tmb2b-root">
        <style>{css}</style>

        {/* Breadcrumb (kept for nav + accessibility, stays inside PageLayout container width) */}
        <nav
          aria-label="Breadcrumb"
          className="tmb2b-breadcrumb"
        >
          <Link href="/">{t("nav.home")}</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href="/products">{t("nav.products")}</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span>{t("nav.topMountedAC")}</span>
        </nav>

        <main className="desk-shell" id="top">
          {/* ============================== LEFT ============================== */}
          <div className="left-col" aria-label="Product and factory proof content">

            {/* Hero with main image, blue bullet, and horizontal thumbnail carousel */}
            <section className="product-hero" id="product" aria-labelledby="page-title">
              <div className="main-image-area" style={{textAlign:'center',marginBottom:16}}>
                <button
                  className="gallery-trigger"
                  type="button"
                  onClick={() => openLightbox(galleryImages[selectedIdx].src, galleryImages[selectedIdx].alt, galleryImages[selectedIdx].caption)}
                  aria-label="Enlarge product image"
                  style={{padding:0,background:"none",border:0}}
                >
                  <img src={galleryImages[selectedIdx].src} alt={galleryImages[selectedIdx].alt} style={{maxWidth:'100%',maxHeight:420,boxShadow:'0 2px 16px #0001',borderRadius:12}} />
                </button>
                <div style={{color:'#2a6cff',background:'#f4f8ff',borderRadius:8,padding:'8px 16px',margin:'16px auto 0',maxWidth:480,fontWeight:500,fontSize:16}}>
                  {galleryImages[selectedIdx].caption}
                </div>
              </div>
              <div className="thumb-carousel" style={{display:'flex',alignItems:'center',gap:8,overflowX:'auto',padding:'8px 0 0 0',margin:'0 auto',maxWidth:600}}>
                {galleryImages.map((img, idx) => (
                  <button
                    key={img.src}
                    onClick={() => setSelectedIdx(idx)}
                    style={{border: selectedIdx===idx?'2px solid #2a6cff':'2px solid #eee',borderRadius:8,padding:2,background:'none',cursor:'pointer',outline:'none',display:'flex',flexDirection:'column',alignItems:'center',minWidth:96,maxWidth:120}}
                    aria-label={`Show image ${idx+1}`}
                  >
                    <img src={img.src} alt={img.alt} style={{width:80,height:60,objectFit:'cover',borderRadius:6,marginBottom:4}} />
                    <span style={{fontSize:12,color:'#2a6cff',whiteSpace:'normal',lineHeight:1.2}}>{img.caption}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Showcase 视频下移到此处，紧跟主图宫格后 */}
            <section className="content-section" aria-labelledby="showcase-video-title">
              <div className="section-head">
                <h2 id="showcase-video-title">VS02 PRO 产品展示视频</h2>
                <p>多角度动态展示产品外观与细节。</p>
              </div>
              <figure className="hero-media">
                <HeroShowcaseVideo />
                <figcaption className="media-caption">VS02 PRO product showcase video</figcaption>
              </figure>
            </section>

            {/* Inquiry route */}
            <section className="content-section" aria-labelledby="supply-route-title">
              <div className="section-head">
                <h2 id="supply-route-title">Inquiry route</h2>
                <p>The page sends qualified buyers into a form instead of a retail payment path.</p>
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

            {/* Factory video band */}
            <section className="content-section" id="factory" aria-labelledby="factory-title">
              <div className="video-band">
                <img
                  className="video-poster"
                  src="/images/factory/cooldrivepro-production-line-assembly.webp"
                  alt="CoolDrivePro factory production line background"
                  loading="lazy"
                  decoding="async"
                />
                <BackgroundVideo
                  src="/videos/cooldrivepro-factory-tour.mp4"
                  poster="/images/factory/cooldrivepro-production-line-assembly.webp"
                  rate={0.65}
                />
                <div className="video-content">
                  <p className="eyebrow">Factory capacity</p>
                  <h2 id="factory-title">Factory proof with slow background motion.</h2>
                  <p>Production-line visuals, pallet staging, warehouse loading, and export packing create a stronger supplier signal for visitors.</p>
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
                <img
                  className="video-poster"
                  src="/images/trust/exhibitions/cooldrivepro-trade-show-01.jpg"
                  alt="CoolDrivePro trade show background"
                  loading="lazy"
                  decoding="async"
                />
                <BackgroundVideo
                  src="/videos/cooldrivepro-exhibitions-hero-bg.mp4"
                  poster="/images/trust/exhibitions/cooldrivepro-trade-show-01.jpg"
                  rate={0.7}
                />
                <div className="video-content">
                  <p className="eyebrow">Exhibition proof</p>
                  <h2 id="expo-title">Trade-show video and booth images for distributor trust.</h2>
                  <p>Show visitors can see product demos, sales discussions, display units, and booth activity before they decide whether to become a dealer or importer.</p>
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
                <p>Scene photos show rooftop AC placement on vans, trucks, and vehicle roofs for faster fitment discussion.</p>
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
                <p>Certificate images are placed after the major proof sections to keep the first screen fast while still supporting due diligence.</p>
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

            {/* Legacy SEO block: features + specs + full FAQ + reviews preserved
                from previous page so on-page topics + structured signals don't
                shrink. */}
            <section
              className="content-section legacy-seo"
              id="search-vocab"
              aria-labelledby="search-vocab-title"
            >
              <div className="section-head">
                <h2 id="search-vocab-title">
                  Parking air conditioner, 12V/24V, rooftop, DC, battery-powered — what buyers call this product
                </h2>
                <p>
                  The CoolDrivePro VS02 PRO answers the most common parking AC search phrases in one
                  rooftop unit. Use this section to confirm the VS02 PRO matches the exact vehicle
                  cooling intent before requesting a fitment quote.
                </p>
              </div>
              <div className="legacy-grid">
                {searchVocabClusters.map((cluster) => (
                  <div key={cluster.label} className="legacy-card">
                    <h3>{cluster.label}</h3>
                    <p>{cluster.intro}</p>
                    <ul className="legacy-features">
                      {cluster.terms.map((term) => (
                        <li key={term}>
                          <strong>{term}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-section legacy-seo" id="specs" aria-labelledby="specs-title">
              <div className="section-head">
                <h2 id="specs-title">Specifications and key features</h2>
                <p>Full VS02 PRO technical sheet for fitment validation and dealer documentation.</p>
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
                <p>Common dealer, installer, and end-user questions about the VS02 PRO top-mounted parking AC.</p>
              </div>
              <div className="legacy-faq">
                {vs02Faqs.map((f) => (
                  <details key={f.question}>
                    <summary>{f.question}</summary>
                    <p>{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* Mobile inquiry repeat */}
            <section className="content-section mobile-inquiry" aria-label="Inquiry form (mobile)">
              <div className="section-head">
                <h2>Send your inquiry</h2>
                <p>Tell us vehicle type, voltage, roof opening, and quantity. We reply with fitment confirmation and a private quote.</p>
              </div>
              <div className="mobile-form-card">
                <CompactInquiryForm
                  source="product_top_mounted_ac_mobile"
                  productName="VS02 PRO Top-Mounted Parking AC"
                  title=""
                  subtitle=""
                  successMessage="Thanks. CoolDrivePro will review your vehicle type, voltage, roof opening, battery setup and quantity before sending a fitment-confirmed quote."
                />
              </div>
            </section>
          </div>

          {/* ============================== RIGHT (sticky) ============================== */}
          <aside className="right-col" aria-label="Sticky inquiry form">
            <div className="quote-card" id="quote" aria-labelledby="quote-title">
              <span className="kicker">Inquiry</span>
              <h2 id="quote-title">Request a Fitment-Checked Dealer Quote</h2>
              <p>Send your vehicle type, voltage, roof opening, battery setup and order quantity. CoolDrivePro will confirm fitment before quotation.</p>
              <ul className="quick-proof" aria-label="Inquiry proof points">
                {inquiryProofBullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="inline-form">
                <CompactInquiryForm
                  source="product_top_mounted_ac_sticky"
                  productName="VS02 PRO Top-Mounted Parking AC"
                  title=""
                  subtitle=""
                  successMessage="Thanks. CoolDrivePro will review your vehicle type, voltage, roof opening, battery setup and quantity before sending a fitment-confirmed quote."
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

function HeroShowcaseVideo() {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.playsInline = true;
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();
    const onVisible = () => { if (!document.hidden && video.paused) tryPlay(); };
    const gestureOpts: AddEventListenerOptions = { once: true, passive: true };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("touchstart", tryPlay, gestureOpts);
    window.addEventListener("click", tryPlay, gestureOpts);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("touchstart", tryPlay);
      window.removeEventListener("click", tryPlay);
    };
  }, []);
  return (
    <video
      ref={ref}
      className="hero-video"
      controls
      muted
      autoPlay
      loop
      playsInline
      preload="metadata"
      poster="/images/products/vs02pro/vs02pro-01-hero.webp"
      aria-label="VS02 PRO rooftop parking AC product showcase video"
    >
      <source src="/videos/vs02-pro-showcase-web.mp4" type="video/mp4" />
    </video>
  );
}

function BackgroundVideo({
  src,
  poster,
  rate,
}: {
  src: string;
  poster: string;
  rate: number;
}) {
  const [ref, setRef] = useState<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (!ref) return;
    const video = ref;
    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      video.src = src;
      video.playbackRate = rate;
      video.load();
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              load();
              obs.unobserve(video);
            }
          });
        },
        { rootMargin: "320px 0px" },
      );
      obs.observe(video);
      return () => obs.disconnect();
    }
    const t = window.setTimeout(load, 1200);
    return () => window.clearTimeout(t);
  }, [ref, src, rate]);

  return (
    <video
      ref={setRef}
      className="ambient-video"
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
    />
  );
}

/* --------------------------------- styles --------------------------------- */
/* Scoped under `.tmb2b-root`. PageLayout already provides the site nav/footer,
 * so we skip the standalone header here and let the page scroll naturally
 * (no inner-scroll trap), with the right column simply sticky.
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
.tmb2b-root img, .tmb2b-root video { display: block; max-width: 100%; }
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

/* Two-column shell — grows with content (page scrolls naturally inside site shell) */
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
  object-fit: contain;
  background: #07111f;
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

/* Legacy SEO block — clean utility styling, no marketing weight */
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
}

@media (max-width: 820px) {
  .tmb2b-root .product-hero { grid-template-rows: minmax(320px, auto) auto; }
  .tmb2b-root .hero-copy, .tmb2b-root .section-head, .tmb2b-root .install-layout { grid-template-columns: 1fr; }
  .tmb2b-root .product-hero h1 { font-size: 30px; line-height: 1.14; }
  .tmb2b-root .lead { font-size: 16px; }
  .tmb2b-root .hero-media { min-height: 320px; }
  .tmb2b-root .hero-video { min-height: 320px; }
  .tmb2b-root .hero-specs,
  .tmb2b-root .product-wall,
  .tmb2b-root .image-grid,
  .tmb2b-root .fact-row,
  .tmb2b-root .cert-grid,
  .tmb2b-root .supply-strip { grid-template-columns: 1fr; }
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
