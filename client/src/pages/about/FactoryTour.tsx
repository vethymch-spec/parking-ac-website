/**
 * /about/factory — Factory & Manufacturing Tour
 * Builds buyer trust: production lines, QC lab, packaging, loading yard.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronRight, Factory, Wrench, ShieldCheck, Truck, X, ChevronLeft, ChevronRight as ArrowRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { AutoplayBackgroundVideo } from "@/components/AutoplayBackgroundVideo";
import { useSEO } from "@/hooks/useSEO";

const heroImage = "/images/factory/cooldrivepro-wholesale-loading-yard.webp";

const productionShots = [
  { src: "/images/factory/cooldrivepro-production-line-assembly.webp", alt: "CoolDrivePro 12V/24V parking AC production line — Qingdao Vethy assembly", caption: "Assembly line — DC compressor parking AC build cells" },
  { src: "/images/factory/cooldrivepro-factory-pallet-yard.webp", alt: "CoolDrivePro parking AC pallet stacks ready for export at Qingdao Vethy factory", caption: "Pallet staging area before container loading" },
  { src: "/images/factory/cooldrivepro-real-pallet-stacks.webp", alt: "Stacked CoolDrivePro parking air conditioner pallets in the factory warehouse", caption: "Finished-goods warehouse — export-grade pallet packing" },
  { src: "/images/factory/cooldrivepro-warehouse-container-loading.webp", alt: "Workers loading CoolDrivePro parking AC pallets into a 40HQ container", caption: "20FT / 40HQ container loading at the on-site dock" },
  { src: "/images/factory/cooldrivepro-container-loading-yard.webp", alt: "Container yard at CoolDrivePro / Qingdao Vethy parking AC factory", caption: "Outbound container yard supporting daily dispatch" },
  { src: "/images/trust/vethy-factory-building-exterior-01.jpg", alt: "CoolDrivePro / Qingdao Vethy manufacturing facility exterior building", caption: "Main building, Qingdao Vethy Industrial campus" },
];

const capabilities = [
  { icon: Factory, title: "Annual capacity 120,000+ units", desc: "Multi-shift SMT and assembly lines for 12V/24V DC parking AC, top-mounted, mini-split, NanoMax and heating + cooling models." },
  { icon: Wrench, title: "In-house tooling & R&D", desc: "Mechanical design, refrigerant circuit tuning, inverter board firmware and BLDC compressor matching handled by a dedicated 18-person engineering team." },
  { icon: ShieldCheck, title: "100% pre-shipment QC", desc: "Every unit goes through high/low-voltage protection, refrigerant leak test, cooling-capacity bench test and 30-minute burn-in before packing." },
  { icon: Truck, title: "Export-ready logistics", desc: "Onsite 20FT/40HQ container loading, EXW / FOB Qingdao / DDP support, with documented HS codes and energy-label compliance for EU, UK, US and AU." },
];

export default function FactoryTour() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const closeLightbox = () => setLightboxIdx(null);
  const prevImg = () => setLightboxIdx(i => (i === null ? null : (i - 1 + productionShots.length) % productionShots.length));
  const nextImg = () => setLightboxIdx(i => (i === null ? null : (i + 1) % productionShots.length));

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") prevImg();
      else if (e.key === "ArrowRight") nextImg();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIdx]);

  useSEO({
    title: "Inside Our Factory | CoolDrivePro Parking AC Manufacturing",
    description: "Tour the CoolDrivePro / Qingdao Vethy manufacturing facility: 120,000+ units annual capacity, in-house R&D, 100% pre-shipment QC and global container fulfillment for 12V/24V parking air conditioners.",
    canonical: "https://cooldrivepro.com/about/factory/",
    ogImage: heroImage,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "CoolDrivePro Factory & Manufacturing Tour",
      "url": "https://cooldrivepro.com/about/factory/",
      "mainEntity": {
        "@type": "Organization",
        "name": "CoolDrivePro",
        "alternateName": "Qingdao Vethy Industrial Co., Ltd.",
        "url": "https://cooldrivepro.com",
        "logo": "https://cooldrivepro.com/logo.png",
        "sameAs": [
          "https://www.facebook.com/vethyautomotive/",
          "https://www.youtube.com/@vethyparkingcooler",
          "https://github.com/vethymch-spec/cooldrivepro-cdn"
        ],
        "image": [
          "https://cooldrivepro.com/images/factory/cooldrivepro-wholesale-loading-yard.webp",
          "https://cooldrivepro.com/images/factory/cooldrivepro-production-line-assembly.webp",
          "https://cooldrivepro.com/images/factory/cooldrivepro-warehouse-container-loading.webp",
        ],
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "CN",
          "addressRegion": "Shandong",
          "addressLocality": "Qingdao",
        },
        "makesOffer": {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "12V/24V DC Parking Air Conditioner",
            "category": "Vehicle Air Conditioning",
          },
        },
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://cooldrivepro.com/" },
          { "@type": "ListItem", "position": 2, "name": "About", "item": "https://cooldrivepro.com/about/" },
          { "@type": "ListItem", "position": 3, "name": "Factory Tour", "item": "https://cooldrivepro.com/about/factory/" },
        ],
      },
      "video": {
        "@type": "VideoObject",
        "name": "CoolDrivePro parking AC factory walk-through",
        "description": "Ambient walk-through of the CoolDrivePro / Qingdao Vethy 12V/24V parking AC production facility — SMT, refrigerant circuit, sheet metal, assembly, QC and packing lines.",
        "thumbnailUrl": [
          "https://cooldrivepro.com/images/factory/cooldrivepro-production-line-assembly.webp",
          "https://cooldrivepro.com/images/factory/cooldrivepro-wholesale-loading-yard.webp",
          "https://cooldrivepro.com/images/factory/cooldrivepro-warehouse-container-loading.webp"
        ],
        "uploadDate": "2026-05-19",
        "duration": "PT28S",
        "contentUrl": "https://cooldrivepro.com/videos/cooldrivepro-factory-tour.mp4",
        "embedUrl": "https://cooldrivepro.com/about/factory/",
        "inLanguage": "en",
        "publisher": {
          "@type": "Organization",
          "name": "CoolDrivePro",
          "logo": { "@type": "ImageObject", "url": "https://cooldrivepro.com/logo.png" }
        }
      },
      "subjectOf": {
        "@type": "ImageGallery",
        "name": "CoolDrivePro production photos",
        "image": productionShots.map(s => ({ "@type": "ImageObject", "contentUrl": `https://cooldrivepro.com${s.src}`, "description": s.alt }))
      },
    },
  });

  return (
    <PageLayout>
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <Link href="/about" className="hover:underline">About</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>Factory Tour</span>
      </nav>

      {/* Hero — ambient factory background video */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "oklch(0.15 0.05 250)" }}>
        <AutoplayBackgroundVideo
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/cooldrivepro-factory-tour.mp4"
          poster="/images/factory/cooldrivepro-production-line-assembly.webp"
        />
        {/* Cinematic gradient overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,12,24,0.65) 0%, rgba(8,12,24,0.4) 45%, rgba(8,12,24,0.8) 100%)",
          }}
        />
        <div className="relative max-w-[1280px] mx-auto px-4 lg:px-8 py-28 lg:py-40 min-h-[78vh] flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-white/70" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Manufacturing · Live from the line
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white max-w-4xl leading-[1.1] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Inside the CoolDrivePro Parking AC Factory
          </h1>
          <p className="text-base sm:text-lg text-white/85 max-w-2xl leading-relaxed mb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
            Every CoolDrivePro 12V / 24V parking AC is built at the Qingdao Vethy Industrial campus in Shandong, China — the same vertically integrated line that supplies OEM programs across North America, Europe, ANZ and the Middle East.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl">
            {[
              { num: "120K+", label: "Annual capacity" },
              { num: "100%", label: "Pre-shipment QC" },
              { num: "18", label: "In-house R&D engineers" },
              { num: "40HQ", label: "Daily container loading" },
            ].map(({ num, label }) => (
              <div key={label} className="rounded-xl p-4 backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.08)", borderLeft: "3px solid rgba(150,180,255,0.7)" }}>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{num}</div>
                <div className="text-xs sm:text-sm text-white/75" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-extrabold mb-3" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            Manufacturing capabilities at a glance
          </h2>
          <p className="text-base mb-10 max-w-3xl leading-relaxed" style={{ color: "oklch(0.35 0.04 250)", fontFamily: "'Inter', sans-serif" }}>
            One vertically integrated site covers electronics, refrigerant circuits, sheet metal, plastic injection, assembly, QC and packing — no third-party assembly, no rebranding.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {capabilities.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl p-6 border bg-white" style={{ borderColor: "oklch(0.90 0.02 240)" }}>
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                  <Icon size={22} style={{ color: "oklch(0.45 0.18 255)" }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "oklch(0.20 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{title}</h3>
                <p className="text-[15px] leading-relaxed" style={{ color: "oklch(0.35 0.04 250)", fontFamily: "'Inter', sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Production gallery */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-extrabold mb-3" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            From PCB to pallet — production gallery
          </h2>
          <p className="text-base mb-10 max-w-3xl leading-relaxed" style={{ color: "oklch(0.35 0.04 250)", fontFamily: "'Inter', sans-serif" }}>
            Real photos from the CoolDrivePro / Qingdao Vethy plant. No stock images, no renders — what you see is what ships.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productionShots.map((shot, idx) => (
              <figure key={shot.src} className="rounded-xl overflow-hidden border bg-white shadow-sm" style={{ borderColor: "oklch(0.90 0.02 240)" }}>
                <button
                  type="button"
                  onClick={() => setLightboxIdx(idx)}
                  aria-label={`Open larger view: ${shot.caption}`}
                  className="block w-full aspect-[16/10] overflow-hidden bg-gray-100 cursor-zoom-in group"
                >
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </button>
                <figcaption className="px-4 py-3 text-sm leading-relaxed" style={{ color: "oklch(0.30 0.04 250)", fontFamily: "'Inter', sans-serif" }}>{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold mb-4" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            Want a private factory audit or OEM quote?
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            Distributors, fleet buyers and brand owners are welcome to book an on-site audit in Qingdao, or request a remote video walk-through with our export team.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="px-8 py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90" style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
              Request factory audit
            </Link>
            <Link href="/about/certifications" className="px-8 py-3 rounded-lg font-bold text-sm border-2 transition-all hover:bg-white" style={{ borderColor: "oklch(0.45 0.18 255)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
              View certifications
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Factory image viewer"
          onClick={closeLightbox}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          style={{ backgroundColor: "rgba(8, 12, 24, 0.92)" }}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            aria-label="Close"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prevImg(); }}
            aria-label="Previous image"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft size={26} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); nextImg(); }}
            aria-label="Next image"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowRight size={26} />
          </button>
          <figure onClick={(e) => e.stopPropagation()} className="max-w-[1400px] w-full flex flex-col items-center">
            <img
              src={productionShots[lightboxIdx].src}
              alt={productionShots[lightboxIdx].alt}
              className="max-h-[80vh] w-auto max-w-full rounded-xl shadow-2xl object-contain"
            />
            <figcaption className="mt-4 px-4 py-2 rounded-lg text-sm text-white/90 text-center bg-white/5" style={{ fontFamily: "'Inter', sans-serif" }}>
              {productionShots[lightboxIdx].caption}
              <span className="ml-3 text-white/50">{lightboxIdx + 1} / {productionShots.length}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </PageLayout>
  );
}
