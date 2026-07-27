/**
 * About Us Page
 * Brand story, mission, team values for CoolDrivePro
 */
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ChevronRight, Zap, Globe, Users, Award, Factory, BadgeCheck, Calendar, ArrowRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { AutoplayBackgroundVideo } from "@/components/AutoplayBackgroundVideo";
import { useSEO } from "@/hooks/useSEO";

export default function AboutUs() {
  const { t } = useTranslation();

  useSEO({
    title: "About CoolDrivePro | Built by Truckers, for Truckers",
    description: "CoolDrivePro designs and manufactures 12V/24V parking air conditioners for trucks, RVs and vans. Engineer-led, no-idle cooling for drivers worldwide — founded by a former long-haul trucker, built at a vertically integrated Qingdao Vethy factory.",
    canonical: "https://cooldrivepro.com/about/",
    ogImage: "/images/factory/cooldrivepro-production-line-assembly.webp",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About CoolDrivePro",
      "description": "CoolDrivePro was founded to make reliable, affordable parking air conditioners accessible to every truck driver, RV owner, and van lifer worldwide.",
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
        "alternateName": "Qingdao Vethy Industrial Co., Ltd.",
        "url": "https://cooldrivepro.com",
        "logo": "https://cooldrivepro.com/logo.png",
        "foundingDate": "2020",
        "numberOfEmployees": { "@type": "QuantitativeValue", "value": 5 },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "3429 Turkey Pen Lane",
          "addressLocality": "Montgomery",
          "addressRegion": "AL",
          "postalCode": "36104",
          "addressCountry": "US"
        },
        "email": "support@cooldrivepro.com",
        "telephone": "+86 185 6153 4326",
        "areaServed": ["North America", "European Union", "United Kingdom", "Australia", "New Zealand", "Middle East", "Southeast Asia", "South Africa"],
        "sameAs": [
          "https://www.facebook.com/vethyautomotive/",
          "https://www.youtube.com/@vethyparkingcooler",
          "https://github.com/vethymch-spec/cooldrivepro-cdn"
        ],
        "founder": {
          "@type": "Person",
          "jobTitle": "Founder",
          "description": "Former long-haul truck driver with 15 years on the road"
        },
        "knowsAbout": [
          "Parking Air Conditioner",
          "12V DC Air Conditioner",
          "24V DC Air Conditioner",
          "No-Idle Truck Cooling",
          "RV Air Conditioner",
          "Battery-Powered Vehicle HVAC",
          "APU Replacement Cooling"
        ],
        "subjectOf": [
          { "@type": "WebPage", "url": "https://cooldrivepro.com/about/factory/", "name": "Inside Our Factory" },
          { "@type": "WebPage", "url": "https://cooldrivepro.com/about/certifications/", "name": "Certifications & Quality" },
          { "@type": "WebPage", "url": "https://cooldrivepro.com/about/exhibitions/", "name": "Trade Shows & Global Presence" }
        ]
      }
    }
  });

  const values = [
    { icon: Zap, title: t('about.performanceFirst', 'Performance First'), desc: t('about.performanceDesc', 'Every parking AC we sell must outperform the competition in real-world conditions — not just lab tests.') },
    { icon: Globe, title: t('about.sustainability', 'Sustainability'), desc: t('about.sustainabilityDesc', 'No-idle parking AC technology reduces diesel emissions at truck stops by up to 90% compared to engine idling.') },
    { icon: Users, title: t('about.communityDriven', 'Community Driven'), desc: t('about.communityDesc', 'We listen to truck drivers, RV owners, and van lifers. Every product improvement comes from real user feedback.') },
    { icon: Award, title: t('about.honestWarranty', 'Honest Warranty'), desc: t('about.warrantyDesc', 'Our warranty means exactly that — no fine print, no hassle. If it breaks, we fix it or replace it.') },
  ];

  const stats = [
    { value: "15,000+", label: t('about.happyCustomers', 'Happy Customers') },
    { value: "$4.2M+", label: t('about.fuelSaved', 'Fuel Costs Saved') },
    { value: "50", label: t('about.statesServed', 'States Served') },
    { value: "4.8★", label: t('about.avgRating', 'Average Rating') },
  ];

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        <Link href="/" className="hover:underline">{t('nav.home')}</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>{t('nav.about')}</span>
      </nav>

      {/* Hero */}
      <section
        className="w-full py-20 lg:py-28 relative overflow-hidden"
        style={{ backgroundColor: "oklch(0.28 0.10 248)" }}
      >
        {/* Ambient slow-motion background video */}
        <AutoplayBackgroundVideo
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/cooldrivepro-about-hero-bg.mp4"
        />
        {/* Gradient overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,18,46,0.85) 0%, rgba(8,18,46,0.65) 55%, rgba(8,18,46,0.35) 100%)",
          }}
        />
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-white/60" style={{ fontFamily: "'Montserrat', sans-serif" }}>{t('about.ourStory', 'Our Story')}</p>
          <h1
            className="text-4xl lg:text-5xl font-extrabold text-white mb-6 max-w-2xl leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {t('about.heroTitle', 'Built by Truckers, for Truckers — and Everyone on the Road')}
          </h1>
          <p
            className="text-lg text-white/80 max-w-2xl leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {t('about.heroDesc', 'CoolDrivePro was founded with one mission: to make reliable, affordable parking air conditioners accessible to every truck driver, RV owner, and van lifer worldwide.')}
          </p>
        </div>
      </section>

      {/* Trust hub — links to dedicated credibility pages (placed directly under hero) */}
      <section className="py-12 lg:py-16" style={{ backgroundColor: "oklch(0.98 0.01 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>{t('about.proofTitle', 'Proof, not promises')}</p>
            <h2 className="text-2xl lg:text-3xl font-extrabold mb-4" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
              {t('about.proofHeading', 'How we back up every claim on this site')}
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
              {t('about.proofDesc', 'CoolDrivePro products are designed and manufactured at the Qingdao Vethy Industrial facility in Shandong, China. Below are the three layers of evidence buyers, fleet managers and distributors most often ask for — each opens a dedicated page with real photos and downloadable documents.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Factory */}
            <Link
              href="/about/factory"
              className="group rounded-2xl overflow-hidden border bg-white transition-all hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: "oklch(0.90 0.02 240)" }}
            >
              <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src="/images/factory/cooldrivepro-production-line-assembly.webp"
                  alt={t('about.factoryAlt', 'CoolDrivePro / Qingdao Vethy parking AC production line')}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                    <Factory size={18} style={{ color: "oklch(0.45 0.18 255)" }} />
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
                    {t('about.factoryCard', 'Inside our factory')}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                  {t('about.factoryCardDesc', '120,000+ units annual capacity, in-house R&D and 100% pre-shipment QC. Walk-through video and production photos.')}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
                  {t('about.tourFactory', 'Tour the factory')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Certifications */}
            <Link
              href="/about/certifications"
              className="group rounded-2xl overflow-hidden border bg-white transition-all hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: "oklch(0.90 0.02 240)" }}
            >
              <div className="aspect-[16/10] overflow-hidden bg-white flex items-center justify-center p-4">
                <img
                  src="/images/trust/certifications/cooldrivepro-iso-9001-2015-certificate.png"
                  alt={t('about.certAlt', 'CoolDrivePro ISO 9001:2015 quality management certificate')}
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                    <BadgeCheck size={18} style={{ color: "oklch(0.45 0.18 255)" }} />
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
                    {t('about.certCard', 'Certifications & IP')}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                  {t('about.certCardDesc', 'ISO 9001:2015 quality system, CNAS-accredited lab, registered trademark and granted design patent. View full-resolution scans.')}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
                  {t('about.viewCerts', 'View certificates')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Exhibitions */}
            <Link
              href="/about/exhibitions"
              className="group rounded-2xl overflow-hidden border bg-white transition-all hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: "oklch(0.90 0.02 240)" }}
            >
              <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src="/images/trust/exhibitions/cooldrivepro-trade-show-01.jpg"
                  alt={t('about.expoAlt', 'CoolDrivePro booth at international parking AC trade show')}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                    <Calendar size={18} style={{ color: "oklch(0.45 0.18 255)" }} />
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
                    {t('about.expoCard', 'Trade shows & global presence')}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                  {t('about.expoCardDesc', 'Real booth photos and live 12V/24V parking AC demos from international expos across 5 continents.')}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
                  {t('about.seeExpos', 'See booth gallery')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold mb-5" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            {t('about.whyStarted', 'Why We Started CoolDrivePro')}
          </h2>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            <p>{t('about.story1', 'In 2019, our founder — a former long-haul truck driver with 15 years on the road — was sitting in a truck stop in Phoenix, Arizona, watching the temperature gauge hit 112°F. He had two choices: idle the engine all night at $8/hour in fuel costs, or sweat through the night in his cab.')}</p>
            <p>{t('about.story2', 'There had to be a better way. After two years of research, testing, and working directly with DC compressor engineers, CoolDrivePro launched its first 12V parking air conditioner in 2021. The response from the trucking community was overwhelming.')}</p>
            <p>{t('about.story3', 'Today, CoolDrivePro parking AC units are used by over 15,000 truck drivers, RV owners, and van lifers across the world. We have saved our customers millions in fuel costs — and counting.')}</p>
            <p>CoolDrivePro operates as a manufacturer and direct-to-consumer online retailer, with wholesale support for fleet buyers, installers, and distributors. Our business scope includes 12V and 24V DC parking air conditioner design, product sourcing, online sales, order fulfillment, warranty support, and technical guidance for trucks, RVs, vans, light trucks, and off-grid vehicles.</p>
            <p>Company contact information: support@cooldrivepro.com, WhatsApp +86 185 6153 4326, and mailing address 3429 Turkey Pen Lane, Montgomery, AL 36104, United States.</p>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/truck-parking_20a5034a.webp"
            alt={t('about.imageAlt', 'CoolDrivePro team – parking air conditioner specialists')}
            className="w-full h-auto object-cover"
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
        </div>
      </section>

      {/* Values */}
      <section className="py-16" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-center mb-12" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            {t('about.coreValues', 'Our Core Values')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                  <Icon size={20} style={{ color: "oklch(0.45 0.18 255)" }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{ backgroundColor: "oklch(0.28 0.10 248)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-3xl lg:text-4xl font-extrabold text-white mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>{s.value}</div>
                <div className="text-sm text-white/60" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold mb-4" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            {t('about.readyToStop', 'Ready to Stop Idling?')}
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            {t('about.joinDrivers', 'Join 15,000+ drivers who have switched to CoolDrivePro parking air conditioners. Request a vehicle-fitment invoice when you are ready.')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/products/top-mounted-ac"
              className="px-8 py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('about.shopTop', 'Shop Top-Mounted AC')}
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 rounded-lg font-bold text-sm border-2 transition-all hover:bg-gray-50"
              style={{ borderColor: "oklch(0.45 0.18 255)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </section>

      {/* Partner */}
      <section className="py-14 border-t" style={{ borderColor: "oklch(0.90 0.02 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <h2 className="text-xl font-extrabold mb-2 text-center" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            {t('about.partnerNetwork', 'Our Partner Network')}
          </h2>
          <p className="text-sm text-center mb-8" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            {t('about.partnerDesc', 'CoolDrivePro works alongside trusted partners to bring the best mobile comfort solutions to drivers worldwide.')}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://www.vethy.com"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ borderColor: "oklch(0.88 0.04 255)", backgroundColor: "oklch(0.98 0.01 240)" }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                <Globe size={18} style={{ color: "oklch(0.45 0.18 255)" }} />
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>Vethy.com</div>
                <div className="text-xs" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{t('about.officialPartner', 'Official Partner Website')}</div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
