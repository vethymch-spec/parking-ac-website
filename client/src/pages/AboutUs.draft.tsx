/**
 * About Us Page — DRAFT (sub-brand handoff to Vethy)
 * Brand-relationship page: explains CoolDrivePro is a Vethy sub-brand,
 * defers factory / certifications / exhibitions to www.vethy.com.
 *
 * URL: /about/  (unchanged — do NOT rename to /about-us/)
 * Replaces: client/src/pages/AboutUs.tsx
 */
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  Building2,
  Factory,
  BadgeCheck,
  Calendar,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { AutoplayBackgroundVideo } from "@/components/AutoplayBackgroundVideo";
import { useSEO } from "@/hooks/useSEO";

const VETHY = "https://www.vethy.com";

export default function AboutUs() {
  const { t } = useTranslation();

  useSEO({
    title: "About CoolDrivePro | Parking AC Brand Backed by Vethy",
    description:
      "CoolDrivePro is a specialized parking air conditioner brand backed by Qingdao Vethy Industrial Co., Ltd. We focus on product selection, vehicle fitment and customer support for trucks, vans, RVs and fleets. Factory, certifications and exhibitions are presented on the Vethy corporate website.",
    canonical: "https://cooldrivepro.com/about/",
    ogImage: "/images/factory/cooldrivepro-production-line-assembly.webp",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About CoolDrivePro",
      "url": "https://cooldrivepro.com/about/",
      "inLanguage": "en",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://cooldrivepro.com/" },
          { "@type": "ListItem", "position": 2, "name": "About", "item": "https://cooldrivepro.com/about/" }
        ]
      },
      "mainEntity": {
        "@type": "Organization",
        "name": "CoolDrivePro",
        "url": "https://cooldrivepro.com",
        "logo": "https://cooldrivepro.com/logo.png",
        "description":
          "Specialized parking air conditioner brand for trucks, vans, RVs and fleets, backed by the manufacturing and quality system of Qingdao Vethy Industrial Co., Ltd.",
        "parentOrganization": {
          "@type": "Organization",
          "name": "Qingdao Vethy Industrial Co., Ltd.",
          "url": "https://www.vethy.com/",
          "sameAs": ["https://www.vethy.com/company-overview/"]
        },
        "knowsAbout": [
          "Parking Air Conditioner",
          "12V DC Parking AC",
          "24V DC Parking AC",
          "No-Idle Truck Cooling",
          "RV Rooftop AC",
          "Fleet Cabin Cooling"
        ],
        "subjectOf": [
          { "@type": "WebPage", "url": "https://www.vethy.com/company-overview/", "name": "Vethy Company Profile" },
          { "@type": "WebPage", "url": "https://www.vethy.com/factory/", "name": "Vethy Factory & Manufacturing" },
          { "@type": "WebPage", "url": "https://www.vethy.com/certifications/", "name": "Vethy Certifications & Quality" },
          { "@type": "WebPage", "url": "https://www.vethy.com/exhibitions/", "name": "Vethy Exhibitions & Events" }
        ]
      }
    }
  });

  const cards = [
    {
      icon: Building2,
      featured: true,
      tag: t("about.cardCorpTag", "Corporate Profile"),
      title: t("about.cardCorpTitle", "Vethy Company Profile"),
      desc: t(
        "about.cardCorpDesc",
        "Learn more about the company behind CoolDrivePro — Qingdao Vethy Industrial Co., Ltd. — including corporate background, business scope and global supply experience."
      ),
      cta: t("about.cardCorpCta", "Visit Vethy Company Profile"),
      href: `${VETHY}/company-overview/`,
    },
    {
      icon: Factory,
      tag: t("about.cardFactoryTag", "Manufacturing"),
      title: t("about.cardFactoryTitle", "Factory & Manufacturing"),
      desc: t(
        "about.cardFactoryDesc",
        "Tour Vethy's 12V / 24V parking AC production base in Qingdao: 120,000+ units annual capacity, in-house R&D and 100% pre-shipment QC."
      ),
      cta: t("about.cardFactoryCta", "View Vethy Factory"),
      href: `${VETHY}/factory/`,
    },
    {
      icon: BadgeCheck,
      tag: t("about.cardCertTag", "Quality"),
      title: t("about.cardCertTitle", "Certifications & Quality"),
      desc: t(
        "about.cardCertDesc",
        "Check Vethy's ISO 9001:2015 quality system, CNAS-accredited laboratory, registered trademark and granted design patent."
      ),
      cta: t("about.cardCertCta", "View Vethy Certifications"),
      href: `${VETHY}/certifications/`,
    },
    {
      icon: Calendar,
      tag: t("about.cardExpoTag", "Trade Shows"),
      title: t("about.cardExpoTitle", "Exhibitions & Events"),
      desc: t(
        "about.cardExpoDesc",
        "See Vethy's booth presence at IAA, Automechanika, Solutrans, ATA TMC, Canton Fair, Bauma and other industry events."
      ),
      cta: t("about.cardExpoCta", "View Vethy Exhibitions"),
      href: `${VETHY}/exhibitions/`,
    },
  ];

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav
        className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm"
        style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}
      >
        <Link href="/" className="hover:underline">{t("nav.home")}</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>{t("nav.about")}</span>
      </nav>

      {/* 1. HERO — one-line brand-relationship statement */}
      <section
        className="w-full py-20 lg:py-28 relative overflow-hidden"
        style={{ backgroundColor: "oklch(0.28 0.10 248)" }}
      >
        <AutoplayBackgroundVideo
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/cooldrivepro-about-hero-bg.mp4"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,18,46,0.85) 0%, rgba(8,18,46,0.65) 55%, rgba(8,18,46,0.35) 100%)",
          }}
        />
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 relative z-10">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3 text-white/60"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {t("about.brandRelationship", "Brand Relationship")}
          </p>
          <h1
            className="text-4xl lg:text-5xl font-extrabold text-white mb-6 max-w-3xl leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {t(
              "about.heroTitle",
              "CoolDrivePro is a parking AC brand backed by Qingdao Vethy Industrial Co., Ltd."
            )}
          </h1>
          <p
            className="text-lg text-white/85 max-w-3xl leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {t(
              "about.heroDesc",
              "We focus on parking air conditioner solutions for trucks, vans, RVs, fleets and other mobile applications. Behind the brand is the manufacturing, engineering and quality foundation of Vethy — an ISO 9001-certified parking AC manufacturer with 15+ years of mobile HVAC engineering."
            )}
          </p>
        </div>
      </section>

      {/* 2. BRAND RELATIONSHIP — explains the why */}
      <section className="py-14 lg:py-16" style={{ backgroundColor: "oklch(0.98 0.01 240)" }}>
        <div className="max-w-[960px] mx-auto px-4 lg:px-8">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {t("about.howWeWork", "How we work together")}
          </p>
          <h2
            className="text-2xl lg:text-3xl font-extrabold mb-5"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {t("about.relationshipHeading", "One product family, two clear roles")}
          </h2>
          <div
            className="space-y-4 text-base leading-relaxed"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            <p>
              {t(
                "about.relationshipP1",
                "As part of the Vethy brand system, CoolDrivePro is dedicated to product selection, application fitment, customer support and market-facing service in the parking air conditioner category."
              )}
            </p>
            <p>
              {t(
                "about.relationshipP2",
                "To keep our brand structure clear and our corporate information consistent, company-level assets such as factory information, certifications, exhibitions, manufacturing capability and corporate background are presented on the Vethy website. This avoids duplicating the same content in two places and gives buyers a single authoritative source for company-level due diligence."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE VETHY — 4 cards (Corporate Profile is featured) */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t("about.exploreVethy", "Explore Vethy")}
            </p>
            <h2
              className="text-2xl lg:text-3xl font-extrabold mb-4"
              style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t("about.corporateAssets", "Company-level assets on the Vethy corporate website")}
            </h2>
            <p
              className="text-base leading-relaxed"
              style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}
            >
              {t(
                "about.corporateAssetsDesc",
                "Each card below opens the corresponding page on www.vethy.com in a new tab."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.title}
                  href={c.href}
                  target="_blank"
                  rel="noopener"
                  className={`group rounded-2xl border bg-white p-7 transition-all hover:shadow-lg hover:-translate-y-1 ${
                    c.featured ? "md:col-span-2 md:p-9" : ""
                  }`}
                  style={{
                    borderColor: c.featured ? "oklch(0.45 0.18 255)" : "oklch(0.90 0.02 240)",
                    borderWidth: c.featured ? 2 : 1,
                  }}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="shrink-0 rounded-xl flex items-center justify-center"
                      style={{
                        width: c.featured ? 56 : 48,
                        height: c.featured ? 56 : 48,
                        backgroundColor: "oklch(0.94 0.06 255)",
                      }}
                    >
                      <Icon
                        size={c.featured ? 26 : 22}
                        style={{ color: "oklch(0.45 0.18 255)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-xs font-bold uppercase tracking-widest mb-1.5"
                        style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {c.tag}
                      </p>
                      <h3
                        className={`font-extrabold mb-2 ${c.featured ? "text-2xl" : "text-lg"}`}
                        style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {c.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed mb-4"
                        style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}
                      >
                        {c.desc}
                      </p>
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-bold"
                        style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {c.cta}
                        <ArrowUpRight
                          size={15}
                          className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        />
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. WHAT COOLDRIVEPRO FOCUSES ON */}
      <section className="py-16" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[960px] mx-auto px-4 lg:px-8">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {t("about.whatWeDo", "What CoolDrivePro focuses on")}
          </p>
          <h2
            className="text-2xl lg:text-3xl font-extrabold mb-5"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {t("about.directContact", "Your direct contact brand for parking AC")}
          </h2>
          <p
            className="text-base leading-relaxed mb-5"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            {t(
              "about.directContactDesc",
              "For product selection, vehicle fitment support, distributor inquiries, parking air conditioner quotations and warranty service, CoolDrivePro remains your direct contact brand. We help distributors, installers, fleets and end users identify the right solution for their vehicle and application."
            )}
          </p>
          <ul
            className="space-y-2 text-sm"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            <li>• {t("about.bullet1", "12V / 24V DC parking AC product selection for trucks, vans, RVs, buses and off-grid vehicles")}</li>
            <li>• {t("about.bullet2", "Roof-cutout sizing, mounting kit and refrigerant recommendation per vehicle")}</li>
            <li>• {t("about.bullet3", "Distributor, installer and fleet quotations with stock availability")}</li>
            <li>• {t("about.bullet4", "Warranty registration, troubleshooting and spare parts logistics")}</li>
          </ul>
        </div>
      </section>

      {/* 5. CTA — keep inquiry flow on CoolDrivePro */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 text-center">
          <h2
            className="text-2xl font-extrabold mb-4"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {t("about.readyToTalk", "Ready to talk parking AC?")}
          </h2>
          <p
            className="text-base mb-8 max-w-xl mx-auto"
            style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            {t(
              "about.ctaDesc",
              "Tell us your vehicle, voltage and target market — we will reply with an SKU recommendation, lead time and distributor or fleet pricing."
            )}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90 inline-flex items-center gap-2"
              style={{
                backgroundColor: "oklch(0.45 0.18 255)",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {t("about.contactCdp", "Contact CoolDrivePro")} <ArrowRight size={14} />
            </Link>
            <Link
              href="/products"
              className="px-8 py-3 rounded-lg font-bold text-sm border-2 transition-all hover:bg-gray-50"
              style={{
                borderColor: "oklch(0.45 0.18 255)",
                color: "oklch(0.45 0.18 255)",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {t("about.browseProducts", "Browse Parking AC Products")}
            </Link>
          </div>
          <p
            className="text-xs mt-10"
            style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            {t(
              "about.footerNote",
              "CoolDrivePro is a parking AC brand backed by Qingdao Vethy Industrial Co., Ltd."
            )}
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
