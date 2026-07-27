/**
 * /about/certifications — Certifications, Quality & IP
 * Trust assets: ISO 9001, CNAS lab, trademark registration, design patent.
 */
import { Link } from "wouter";
import { ChevronRight, Award, BadgeCheck, FlaskConical, Scale } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useSEO } from "@/hooks/useSEO";

const certificates = [
  {
    img: "/images/trust/certifications/cooldrivepro-iso-9001-2015-certificate.png",
    alt: "CoolDrivePro / Qingdao Vethy ISO 9001:2015 quality management system certificate",
    title: "ISO 9001:2015 — Quality Management System",
    issuer: "Issued to Qingdao Vethy Industrial Co., Ltd.",
    scope: "Covers design, manufacturing and after-sales service of 12V/24V DC parking air conditioners.",
    icon: BadgeCheck,
  },
  {
    img: "/images/trust/certifications/cooldrivepro-cnas-quality-certificate.png",
    alt: "CNAS-accredited laboratory quality certificate for CoolDrivePro parking AC testing",
    title: "CNAS-accredited Lab Certification (English)",
    issuer: "China National Accreditation Service for Conformity Assessment",
    scope: "Confirms recognized capability to test cooling capacity, energy efficiency, vibration and electrical safety in-house.",
    icon: FlaskConical,
  },
  {
    img: "/images/trust/certifications/cooldrivepro-trademark-registration.png",
    alt: "CoolDrivePro brand trademark registration certificate (CNIPA)",
    title: "Registered Trademark",
    issuer: "China National Intellectual Property Administration (CNIPA), No. 79981727",
    scope: "Protects the CoolDrivePro / Vethy brand identity across vehicle climate-control product classes.",
    icon: Scale,
  },
  {
    img: "/images/trust/certifications/cooldrivepro-design-patent-certificate.png",
    alt: "CoolDrivePro parking air conditioner design patent certificate, CNIPA 2024304710983",
    title: "Granted Design Patent",
    issuer: "CNIPA Patent No. ZL 2024 3 0471098.3",
    scope: "Industrial design protection for the CoolDrivePro top-mounted parking AC housing.",
    icon: Award,
  },
];

const standards = [
  { label: "CE / EMC", desc: "Electromagnetic compatibility and low-voltage directive testing for EU-bound shipments." },
  { label: "RoHS", desc: "Restriction of hazardous substances confirmed across PCB, harness and housing." },
  { label: "DOT / E-Mark ready", desc: "Aftermarket fitment guidance aligned with US DOT and EU E-mark vehicle-component conventions." },
  { label: "F-gas compliant", desc: "R134a circuits charged and sealed to F-gas / EPA Section 608 handling standards." },
];

export default function Certifications() {
  useSEO({
    title: "Certifications & Quality | CoolDrivePro Parking AC",
    description: "ISO 9001:2015, CNAS-accredited lab, registered trademark and granted design patent — full quality and IP documentation behind every CoolDrivePro 12V/24V parking air conditioner.",
    canonical: "https://cooldrivepro.com/about/certifications/",
    ogImage: "/images/trust/certifications/cooldrivepro-iso-9001-2015-certificate.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "CoolDrivePro Certifications & Quality",
      "url": "https://cooldrivepro.com/about/certifications/",
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
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "CN",
          "addressRegion": "Shandong",
          "addressLocality": "Qingdao"
        },
        "hasCredential": [
          { "@type": "EducationalOccupationalCredential", "name": "ISO 9001:2015 Quality Management System", "credentialCategory": "certification" },
          { "@type": "EducationalOccupationalCredential", "name": "CNAS-accredited Laboratory Recognition", "credentialCategory": "certification" },
          { "@type": "EducationalOccupationalCredential", "name": "Registered Trademark CNIPA No. 79981727", "credentialCategory": "trademark" },
          { "@type": "EducationalOccupationalCredential", "name": "Granted Design Patent CNIPA No. ZL 2024 3 0471098.3", "credentialCategory": "patent" },
        ],
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://cooldrivepro.com/" },
          { "@type": "ListItem", "position": 2, "name": "About", "item": "https://cooldrivepro.com/about/" },
          { "@type": "ListItem", "position": 3, "name": "Certifications", "item": "https://cooldrivepro.com/about/certifications/" },
        ],
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
        <span style={{ color: "oklch(0.35 0.10 250)" }}>Certifications</span>
      </nav>

      <section className="w-full py-20 lg:py-28 relative overflow-hidden" style={{ backgroundColor: "oklch(0.28 0.10 248)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-white/60" style={{ fontFamily: "'Montserrat', sans-serif" }}>Quality & Compliance</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 max-w-3xl leading-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Certifications, Quality Systems & Intellectual Property
          </h1>
          <p className="text-lg text-white/80 max-w-2xl leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            Every CoolDrivePro parking air conditioner is built under an ISO 9001-certified quality system, tested in a CNAS-accredited lab, and protected by registered brand and design IP. Click any certificate to view at full resolution.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10" style={{ background: "radial-gradient(circle at 80% 50%, white 0%, transparent 70%)" }} />
      </section>

      {/* Certificates grid */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {certificates.map(({ img, alt, title, issuer, scope, icon: Icon }) => (
            <article key={title} className="rounded-2xl border overflow-hidden flex flex-col" style={{ borderColor: "oklch(0.90 0.02 240)" }}>
              <a href={img} target="_blank" rel="noopener" className="block bg-white">
                <img src={img} alt={alt} loading="lazy" className="w-full h-80 object-contain bg-white p-4" />
              </a>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                    <Icon size={18} style={{ color: "oklch(0.45 0.18 255)" }} />
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{title}</h3>
                </div>
                <p className="text-sm font-semibold mb-2" style={{ color: "oklch(0.40 0.10 250)", fontFamily: "'Inter', sans-serif" }}>{issuer}</p>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{scope}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Standards */}
      <section className="py-16" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-extrabold mb-3" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            Additional standards we test against
          </h2>
          <p className="text-base mb-10 max-w-3xl" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            Where required by the destination market or fleet customer, units are produced and labeled to the following standards. Documentation is available on request via your account manager.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {standards.map(s => (
              <div key={s.label} className="bg-white rounded-xl p-5 border" style={{ borderColor: "oklch(0.92 0.02 240)" }}>
                <div className="text-sm font-extrabold mb-2" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{s.label}</div>
                <div className="text-xs leading-relaxed" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold mb-4" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            Need certificate copies for your compliance file?
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            We can issue stamped, project-specific copies of ISO, CNAS, RoHS and CE test reports for distributors, fleet purchasing teams and customs brokers.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="px-8 py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90" style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
              Request documentation
            </Link>
            <Link href="/about/factory" className="px-8 py-3 rounded-lg font-bold text-sm border-2 transition-all hover:bg-gray-50" style={{ borderColor: "oklch(0.45 0.18 255)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
              See the factory
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
