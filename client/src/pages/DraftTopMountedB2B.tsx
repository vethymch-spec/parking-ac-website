/**
 * DRAFT (DEV-only) — React port of the approved B2B inquiry preview.
 *
 * Mirrors: previews/top-mounted-b2b-inquiry/index.html (user-approved layout).
 * Route:   /drafts/top-mounted-b2b   (DEV only — see App.tsx)
 *
 * Intent:
 *  - Two-column desk shell: LEFT scrolls (hero video, product wall, inquiry route,
 *    factory video + photos, exhibitions, install scene photos, certificates).
 *  - RIGHT sticky inquiry form (no public price; lead-only).
 *  - Mobile: stacks; form repeats at bottom of left column.
 *  - All gallery images open a lightbox.
 *  - SEO: noindex (draft); production swap will be done on ProductTopMounted.tsx
 *    only after user approval, with the original title/description/JSON-LD preserved.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import CompactInquiryForm from "@/components/CompactInquiryForm";

/* --------------------------------- data --------------------------------- */

const PRODUCT_TITLE = "VS02 PRO rooftop parking air conditioner";
const PRODUCT_LEAD =
  "12,000 BTU/h DC cooling for trucks, vans, RVs, campers, fleets, dealers, and installers.";

const heroSpecs = [
  { label: "Cooling", value: "12,000 BTU/h" },
  { label: "Voltage", value: "12V / 24V DC" },
  { label: "Noise", value: "≤ 45 dB" },
  { label: "Roof opening", value: '14" / 356 mm' },
];

const productWall = [
  {
    src: "/images/products/vs02pro/vs02pro-03-top-fans.webp",
    alt: "VS02 PRO dual condenser fan deck large image",
    title: "Dual condenser fan deck",
    caption: "Airflow and heat rejection layout.",
    lightboxCaption: "Dual condenser fan deck",
  },
  {
    src: "/images/products/vs02pro/vs02pro-11-bottom-mount.webp",
    alt: "VS02 PRO bottom mount and indoor unit large image",
    title: "Bottom mount",
    caption: "Install-side structure and indoor section.",
    lightboxCaption: "Bottom mount and indoor section",
  },
  {
    src: "/images/products/vs02pro/vs02pro-10-indoor-closeup.webp",
    alt: "VS02 PRO indoor outlet and control panel large image",
    title: "Indoor outlet",
    caption: "Cabin-side outlet and control view.",
    lightboxCaption: "Indoor outlet and controls",
  },
  {
    src: "/images/products/vs02pro/vs02pro-05-rear-cables.webp",
    alt: "VS02 PRO rear cable connection large image",
    title: "Rear connection",
    caption: "Wiring and rear cable reference.",
    lightboxCaption: "Rear cable connection",
  },
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
  {
    src: "/images/scenes/ac-scene-workshop-rooftop.jpg",
    alt: "Rooftop parking AC installed on truck in workshop scene",
    title: "Truck roof application",
    body: "Shows the rooftop unit position on a work vehicle for quick buyer fitment review.",
    lightboxCaption: "Truck roof application",
  },
  {
    src: "/images/scenes/ac-scene-van-rooftop.jpg",
    alt: "Commercial van with rooftop parking air conditioner scene",
    title: "Commercial van reference",
    body: "Useful for judging roof placement, vehicle height, and real road-use context.",
    lightboxCaption: "Commercial van reference",
  },
  {
    src: "/images/scenes/ac-scene-rooftop-unit.jpg",
    alt: "Close view of rooftop parking air conditioner on vehicle roof",
    title: "Rooftop unit close view",
    body: "Clear exterior view for buyers checking shell size, roof fit, and visual finish.",
    lightboxCaption: "Rooftop unit close view",
  },
];

const certificates = [
  {
    src: "/images/trust/certifications/cooldrivepro-iso-9001-2015-certificate.png",
    alt: "ISO 9001 2015 quality management certificate",
    kicker: "Quality system",
    title: "ISO 9001:2015",
    body: "Issued to Qingdao Vethy Industrial Co., Ltd. for quality management system review.",
  },
  {
    src: "/images/trust/certifications/cooldrivepro-cnas-quality-certificate.png",
    alt: "CNAS quality certificate",
    kicker: "Testing capability",
    title: "CNAS lab certificate",
    body: "Supports recognized capability to test cooling capacity, energy efficiency, vibration, and electrical safety.",
  },
  {
    src: "/images/trust/certifications/cooldrivepro-trademark-registration.png",
    alt: "CoolDrivePro trademark registration certificate",
    kicker: "Brand IP",
    title: "Registered trademark",
    body: "Protects the CoolDrivePro and Vethy brand identity across vehicle climate-control product classes.",
  },
  {
    src: "/images/trust/certifications/cooldrivepro-design-patent-certificate.png",
    alt: "CoolDrivePro design patent certificate",
    kicker: "Product IP",
    title: "Granted design patent",
    body: "Industrial design protection for the top-mounted parking AC housing.",
  },
];

const inquiryProofBullets = [
  "Dealer, distributor, wholesale, fleet, installer, and OEM routes",
  "VS02 PRO product images, factory proof, certificates, and installation references",
  "Sample, pilot order, and bulk supply discussion after qualification",
];

/* ------------------------------- component ------------------------------- */

export default function DraftTopMountedB2B() {
  useSEO({
    title: "DRAFT · VS02 PRO Rooftop Parking AC Inquiry | CoolDrivePro",
    description:
      "Internal staging preview of the B2B-focused rooftop parking AC inquiry page (React port). No price; lead-only.",
    canonical: "https://cooldrivepro.com/drafts/top-mounted-b2b/",
  });

  // Make sure crawlers never index the draft route.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

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

  const css = useMemo(() => DRAFT_CSS, []);

  return (
    <div className="draft-tmb2b-root">
      <style>{css}</style>

      {/* Draft banner (DEV indicator) */}
      <div className="draft-banner" role="note">
        DRAFT PREVIEW · /drafts/top-mounted-b2b · not linked from production nav, noindex
      </div>

      <header className="header">
        <div className="nav" aria-label="Page header">
          <a className="brand" href="#top" aria-label="CoolDrivePro dealer inquiry home">
            <img src="/logo.png" width={40} height={40} alt="CoolDrivePro logo" />
            <span>CoolDrivePro Product Inquiry</span>
          </a>
          <nav className="nav-links" aria-label="Landing page navigation">
            <a href="#product">Product</a>
            <a href="#factory">Factory</a>
            <a href="#exhibitions">Exhibitions</a>
            <a href="#install">Install</a>
            <a href="#certificates">Certificates</a>
            <a className="btn primary" href="#quote">Send Inquiry</a>
          </nav>
        </div>
      </header>

      <main className="desk-shell" id="top">
        {/* ============================== LEFT (scrolls) ============================== */}
        <div className="left-scroll" aria-label="Scrollable product and factory proof content">

          {/* Product hero with showcase video */}
          <section className="product-hero" id="product" aria-labelledby="page-title">
            <figure className="hero-media">
              <video
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
              <figcaption className="media-caption">VS02 PRO product showcase video</figcaption>
            </figure>
            <div className="hero-copy">
              <div>
                <p className="eyebrow">12V / 24V rooftop parking AC</p>
                <h1 id="page-title">{PRODUCT_TITLE}</h1>
                <p className="lead">{PRODUCT_LEAD}</p>
                <div className="hero-actions">
                  <a className="btn primary" href="#quote">Request dealer quote</a>
                  <a className="btn secondary" href="#factory">View factory proof</a>
                </div>
              </div>
              <div className="hero-specs" aria-label="VS02 PRO quick specifications">
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
              <h2 id="large-product-title">VS02 PRO product details</h2>
              <p>Clear views of the roof shell, fan deck, indoor outlet, mounting side, and cable connection.</p>
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

          {/* Factory section with slow background video */}
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

          {/* Install scene photos */}
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

          {/* Mobile inquiry repeat */}
          <section className="content-section mobile-inquiry" aria-label="Inquiry form (mobile)">
            <div className="section-head">
              <h2>Send your inquiry</h2>
              <p>Tell us vehicle type, voltage, roof opening, and quantity. We reply with fitment confirmation and a private quote.</p>
            </div>
            <div className="mobile-form-card">
              <CompactInquiryForm
                source="draft_top_mounted_b2b_mobile"
                productName="VS02 PRO Top-Mounted Parking AC"
                title=""
                subtitle=""
              />
            </div>
          </section>
        </div>

        {/* ============================== RIGHT (sticky) ============================== */}
        <aside className="right-fixed" aria-label="Fixed inquiry form">
          <div className="quote-card" id="quote" aria-labelledby="quote-title">
            <span className="kicker">Inquiry</span>
            <h2 id="quote-title">Request fitment and dealer quote</h2>
            <p>Send vehicle type, voltage, roof opening, and quantity. Our team replies with fitment confirmation and a private quote.</p>
            <ul className="quick-proof" aria-label="Inquiry proof points">
              {inquiryProofBullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <div className="inline-form">
              <CompactInquiryForm
                source="draft_top_mounted_b2b_sticky"
                productName="VS02 PRO Top-Mounted Parking AC"
                title=""
                subtitle=""
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
  );
}

/* ----------------------------- subcomponents ----------------------------- */

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
/* Scoped under `.draft-tmb2b-root` so it cannot leak into the rest of the app. */

const DRAFT_CSS = `
.draft-tmb2b-root {
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
.draft-tmb2b-root *, .draft-tmb2b-root *::before, .draft-tmb2b-root *::after { box-sizing: border-box; }
.draft-tmb2b-root img, .draft-tmb2b-root video { display: block; max-width: 100%; }
.draft-tmb2b-root img { height: auto; }
.draft-tmb2b-root a { color: inherit; text-decoration: none; }
.draft-tmb2b-root button, .draft-tmb2b-root input, .draft-tmb2b-root select, .draft-tmb2b-root textarea { font: inherit; }
.draft-tmb2b-root h1, .draft-tmb2b-root h2, .draft-tmb2b-root h3, .draft-tmb2b-root p { margin: 0; }
.draft-tmb2b-root h1, .draft-tmb2b-root h2, .draft-tmb2b-root h3 { color: var(--deep); line-height: 1.08; letter-spacing: 0; }
.draft-tmb2b-root ul { margin: 0; padding: 0; list-style: none; }

.draft-tmb2b-root .draft-banner {
  background: #fff5d6;
  color: #6b4a00;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 12px;
  border-bottom: 1px solid #f0d97a;
}

.draft-tmb2b-root .header {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.97);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
.draft-tmb2b-root .nav {
  width: min(1320px, calc(100% - 32px));
  min-height: 70px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}
.draft-tmb2b-root .brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--deep);
  font-weight: 950;
  white-space: nowrap;
}
.draft-tmb2b-root .brand img { width: 40px; height: 40px; border-radius: 7px; }
.draft-tmb2b-root .nav-links { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
.draft-tmb2b-root .nav-links a:not(.btn) { color: #314154; font-size: 13px; font-weight: 850; padding: 8px 9px; }

.draft-tmb2b-root .btn {
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
.draft-tmb2b-root .btn.primary { background: var(--blue); color: #fff; }
.draft-tmb2b-root .btn.primary:hover { background: var(--blue-dark); }
.draft-tmb2b-root .btn.secondary { border-color: #aebfd1; background: #fff; color: var(--deep); }
.draft-tmb2b-root .btn.secondary:hover { background: #f4f7fb; }

.draft-tmb2b-root .desk-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(330px, 33vw, 440px);
  width: min(1320px, calc(100% - 32px));
  height: calc(100vh - 70px);
  min-height: 720px;
  margin: 0 auto;
  gap: 30px;
  overflow: hidden;
}
.draft-tmb2b-root .left-scroll {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 26px 6px 64px 0;
}
.draft-tmb2b-root .left-scroll::-webkit-scrollbar { width: 10px; }
.draft-tmb2b-root .left-scroll::-webkit-scrollbar-thumb { border-radius: 999px; background: #b8c5d2; }

.draft-tmb2b-root .right-fixed {
  position: relative;
  border-left: 1px solid var(--line);
  padding: 26px 0 34px 28px;
  overflow: hidden;
}
.draft-tmb2b-root .quote-card {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 118px);
  overflow: auto;
  border: 1px solid #b8d3f2;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.99);
  box-shadow: 0 18px 52px var(--shadow);
  padding: 22px;
}
.draft-tmb2b-root .quote-card::-webkit-scrollbar { width: 8px; }
.draft-tmb2b-root .quote-card::-webkit-scrollbar-thumb { border-radius: 999px; background: #c9d6e6; }
.draft-tmb2b-root .quote-card h2 { font-size: 27px; }
.draft-tmb2b-root .quote-card p { margin-top: 10px; color: var(--muted); }
.draft-tmb2b-root .kicker {
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
.draft-tmb2b-root .quick-proof { display: grid; gap: 8px; margin-top: 18px; }
.draft-tmb2b-root .quick-proof li { display: flex; gap: 8px; color: #34465a; font-size: 13px; }
.draft-tmb2b-root .quick-proof li::before { content: ""; width: 8px; height: 8px; margin-top: 7px; border-radius: 50%; background: var(--green); flex: 0 0 auto; }
.draft-tmb2b-root .inline-form { margin-top: 18px; }
.draft-tmb2b-root .microcopy { margin-top: 12px; color: #667587; font-size: 12px; }

.draft-tmb2b-root .product-hero {
  display: grid;
  grid-template-rows: minmax(520px, 1fr) auto;
  min-height: calc(100vh - 122px);
  overflow: hidden;
  border-radius: 8px;
  background: #f7fafc;
  border: 1px solid var(--line);
}
.draft-tmb2b-root .hero-copy {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
  padding: 34px clamp(24px, 4vw, 46px) 38px;
  border-top: 1px solid var(--line);
  background: #fff;
}
.draft-tmb2b-root .eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  color: var(--green);
  font-size: 13px;
  font-weight: 950;
  text-transform: uppercase;
}
.draft-tmb2b-root .eyebrow::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--green); }
.draft-tmb2b-root .product-hero h1 { margin-top: 12px; font-size: clamp(34px, 4.2vw, 58px); font-weight: 950; max-width: 900px; }
.draft-tmb2b-root .lead { margin-top: 14px; color: #415266; font-size: 17px; max-width: 720px; }
.draft-tmb2b-root .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
.draft-tmb2b-root .hero-specs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #f8fafc;
}
.draft-tmb2b-root .hero-specs div { min-height: 0; border-right: 1px solid var(--line); padding: 18px 20px; }
.draft-tmb2b-root .hero-specs div:last-child { border-right: 0; }
.draft-tmb2b-root .hero-specs span { display: block; color: #667587; font-size: 11px; font-weight: 900; text-transform: uppercase; }
.draft-tmb2b-root .hero-specs strong { display: block; margin-top: 7px; color: var(--deep); font-size: clamp(18px, 2vw, 24px); line-height: 1.25; }
.draft-tmb2b-root .hero-media {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #d7dee8;
  background: #07111f;
  min-height: 520px;
  display: grid;
  place-items: center;
}
.draft-tmb2b-root .hero-media img { width: min(96%, 980px); max-height: min(72vh, 660px); object-fit: contain; }
.draft-tmb2b-root .hero-video {
  width: 100%;
  height: 100%;
  min-height: 520px;
  object-fit: contain;
  background: #07111f;
}
.draft-tmb2b-root .media-caption {
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

.draft-tmb2b-root .content-section { padding: 76px 0 0; }
.draft-tmb2b-root .section-head {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(260px, 0.42fr);
  gap: 48px;
  align-items: start;
  margin-bottom: 30px;
}
.draft-tmb2b-root .section-head h2 { font-size: clamp(30px, 3.2vw, 44px); font-weight: 950; max-width: 680px; }
.draft-tmb2b-root .section-head p { color: var(--muted); font-size: 17px; line-height: 1.6; max-width: 420px; }

.draft-tmb2b-root .product-detail-section { min-height: calc(100vh - 70px); display: grid; align-content: start; }
.draft-tmb2b-root .product-detail-section .section-head { margin-bottom: 22px; }
.draft-tmb2b-root .product-detail-section .section-head h2 { font-size: clamp(34px, 4vw, 54px); }
.draft-tmb2b-root .product-wall { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.draft-tmb2b-root .product-shot { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: #fff; margin: 0; }
.draft-tmb2b-root .gallery-trigger { width: 100%; border: 0; border-bottom: 1px solid var(--line); background: #f5f8fb; padding: 0; cursor: zoom-in; }
.draft-tmb2b-root .gallery-trigger:focus-visible { outline: 3px solid rgba(21, 94, 239, 0.3); outline-offset: -3px; }
.draft-tmb2b-root .product-shot img { width: 100%; height: clamp(160px, 17vw, 220px); object-fit: contain; padding: 14px; background: #f5f8fb; transition: transform 180ms ease; }
.draft-tmb2b-root .product-shot:hover img { transform: scale(1.03); }
.draft-tmb2b-root .product-shot figcaption { display: grid; gap: 5px; min-height: 104px; background: #fff; padding: 14px 16px; }
.draft-tmb2b-root .product-shot b { color: var(--deep); font-size: 16px; }
.draft-tmb2b-root .product-shot span { color: var(--muted); font-size: 13px; }

.draft-tmb2b-root .lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: rgba(5, 12, 23, 0.86);
}
.draft-tmb2b-root .lightbox.is-open { display: flex; }
.draft-tmb2b-root .lightbox figure { width: min(100%, 1080px); margin: 0; }
.draft-tmb2b-root .lightbox img { width: 100%; max-height: calc(100vh - 150px); object-fit: contain; border-radius: 8px; background: #fff; }
.draft-tmb2b-root .lightbox figcaption { margin-top: 12px; color: #fff; font-size: 16px; font-weight: 850; text-align: center; }
.draft-tmb2b-root .lightbox-close {
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

.draft-tmb2b-root .video-band {
  position: relative;
  min-height: 520px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--deep);
  color: #fff;
  display: grid;
  align-items: end;
}
.draft-tmb2b-root .video-band video,
.draft-tmb2b-root .video-poster { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.draft-tmb2b-root .video-poster { opacity: 0.7; }
.draft-tmb2b-root .video-band::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5, 12, 23, 0.16) 0%, rgba(5, 12, 23, 0.82) 100%); }
.draft-tmb2b-root .video-content { position: relative; z-index: 1; padding: 34px; max-width: 780px; }
.draft-tmb2b-root .video-content .eyebrow { color: #b7f0d1; }
.draft-tmb2b-root .video-content h2 { margin-top: 12px; color: #fff; font-size: clamp(34px, 5vw, 64px); }
.draft-tmb2b-root .video-content p { margin-top: 14px; color: #dce8f5; font-size: 18px; }
.draft-tmb2b-root .fact-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 22px; }
.draft-tmb2b-root .fact-row div { border-left: 3px solid #73d49f; background: rgba(255,255,255,0.1); padding: 12px; }
.draft-tmb2b-root .fact-row strong { display: block; color: #fff; font-size: 24px; }
.draft-tmb2b-root .fact-row span { color: #d5e4f5; font-size: 12px; }

.draft-tmb2b-root .image-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 16px; }
.draft-tmb2b-root .image-tile { overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: #fff; margin: 0; }
.draft-tmb2b-root .image-tile.large { grid-column: span 2; }
.draft-tmb2b-root .image-tile img { width: 100%; height: 230px; object-fit: cover; background: #eef3f8; }
.draft-tmb2b-root .image-tile.large img { height: 320px; }
.draft-tmb2b-root .image-tile figcaption { padding: 12px 14px; color: #314154; font-size: 13px; font-weight: 850; }
.draft-tmb2b-root .factory-proof-grid { gap: 16px; margin-top: 18px; }
.draft-tmb2b-root .factory-proof-grid .image-tile img { height: clamp(190px, 18vw, 235px); }
.draft-tmb2b-root .factory-proof-grid .image-tile figcaption { min-height: 54px; display: flex; align-items: center; }

.draft-tmb2b-root .install-layout { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.draft-tmb2b-root .install-card { overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.draft-tmb2b-root .install-card img { width: 100%; height: clamp(230px, 23vw, 320px); object-fit: cover; padding: 0; background: #eef3f8; }
.draft-tmb2b-root .install-card .copy { padding: 16px; }
.draft-tmb2b-root .install-card h3 { font-size: 20px; }
.draft-tmb2b-root .install-card p { margin-top: 8px; color: var(--muted); font-size: 14px; }

.draft-tmb2b-root .cert-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.draft-tmb2b-root .cert-card { display: grid; grid-template-columns: minmax(160px, 0.42fr) minmax(0, 1fr); gap: 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff; padding: 14px; margin: 0; }
.draft-tmb2b-root .cert-card img { width: 100%; height: 210px; object-fit: contain; background: #f7f8fa; border-radius: 6px; border: 1px solid #eef1f4; }
.draft-tmb2b-root .cert-card h3 { font-size: 19px; }
.draft-tmb2b-root .cert-card p { margin-top: 8px; color: var(--muted); font-size: 14px; }
.draft-tmb2b-root .cert-card small { display: inline-flex; margin-bottom: 9px; color: var(--amber); font-size: 12px; font-weight: 950; text-transform: uppercase; }

.draft-tmb2b-root .supply-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.draft-tmb2b-root .supply-step { min-height: 160px; border: 1px solid var(--line); border-radius: 8px; background: #fff; padding: 18px; }
.draft-tmb2b-root .supply-step b { display: inline-flex; width: 34px; height: 34px; align-items: center; justify-content: center; border-radius: 50%; background: var(--deep); color: #fff; }
.draft-tmb2b-root .supply-step h3 { margin-top: 14px; font-size: 19px; }
.draft-tmb2b-root .supply-step p { margin-top: 8px; color: var(--muted); font-size: 14px; }

.draft-tmb2b-root .mobile-inquiry { display: none; }
.draft-tmb2b-root .mobile-form-card { border: 1px solid #b8d3f2; border-radius: 8px; background: #fff; padding: 18px; box-shadow: 0 12px 40px var(--shadow); }

@media (max-width: 980px) {
  .draft-tmb2b-root .nav-links a:not(.btn) { display: none; }
  .draft-tmb2b-root .desk-shell { grid-template-columns: 1fr; height: auto; min-height: 0; overflow: visible; }
  .draft-tmb2b-root .left-scroll { overflow: visible; padding-right: 0; }
  .draft-tmb2b-root .right-fixed { display: none; }
  .draft-tmb2b-root .mobile-inquiry { display: block; }
}

@media (max-width: 820px) {
  .draft-tmb2b-root .nav { width: min(100% - 24px, 1320px); min-height: 0; align-items: flex-start; flex-direction: column; padding: 12px 0; }
  .draft-tmb2b-root .nav-links { width: 100%; }
  .draft-tmb2b-root .nav-links .btn { width: 100%; }
  .draft-tmb2b-root .desk-shell { width: min(100% - 24px, 1320px); }
  .draft-tmb2b-root .left-scroll { padding-top: 22px; }
  .draft-tmb2b-root .product-hero { grid-template-rows: minmax(320px, auto) auto; min-height: 0; }
  .draft-tmb2b-root .hero-copy, .draft-tmb2b-root .section-head, .draft-tmb2b-root .install-layout { grid-template-columns: 1fr; }
  .draft-tmb2b-root .product-hero h1 { font-size: 34px; line-height: 1.12; }
  .draft-tmb2b-root .lead { font-size: 16px; }
  .draft-tmb2b-root .hero-media { min-height: 320px; }
  .draft-tmb2b-root .hero-video { min-height: 320px; }
  .draft-tmb2b-root .hero-specs,
  .draft-tmb2b-root .product-wall,
  .draft-tmb2b-root .image-grid,
  .draft-tmb2b-root .fact-row,
  .draft-tmb2b-root .cert-grid,
  .draft-tmb2b-root .supply-strip { grid-template-columns: 1fr; }
  .draft-tmb2b-root .product-detail-section { min-height: 0; }
  .draft-tmb2b-root .product-detail-section .product-wall { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .draft-tmb2b-root .product-shot img { height: 132px; padding: 10px; }
  .draft-tmb2b-root .product-shot figcaption { min-height: 96px; padding: 12px; }
  .draft-tmb2b-root .product-shot b { font-size: 14px; }
  .draft-tmb2b-root .product-shot span { font-size: 12px; }
  .draft-tmb2b-root .hero-specs div { border-right: 0; border-bottom: 1px solid var(--line); }
  .draft-tmb2b-root .hero-specs div:last-child { border-bottom: 0; }
  .draft-tmb2b-root .image-tile.large { grid-column: auto; }
  .draft-tmb2b-root .product-shot img { aspect-ratio: 4 / 3; }
  .draft-tmb2b-root .video-band { min-height: 460px; }
  .draft-tmb2b-root .video-content { padding: 24px; }
  .draft-tmb2b-root .video-content h2 { font-size: 34px; }
  .draft-tmb2b-root .image-tile img,
  .draft-tmb2b-root .image-tile.large img { height: auto; aspect-ratio: 16 / 10; }
  .draft-tmb2b-root .cert-card { grid-template-columns: 1fr; }
}
`;
