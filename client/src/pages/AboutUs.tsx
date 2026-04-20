/**
 * About Us Page
 * Brand story, mission, team values for CoolDrivePro
 */
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ChevronRight, Zap, Globe, Users, Award } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useSEO } from "@/hooks/useSEO";

export default function AboutUs() {
  const { t } = useTranslation();

  useSEO({
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About CoolDrivePro",
      "description": "CoolDrivePro was founded to make reliable, affordable parking air conditioners accessible to every truck driver, RV owner, and van lifer worldwide.",
      "url": "https://cooldrivepro.com/about",
      "mainEntity": {
        "@type": "Organization",
        "name": "CoolDrivePro",
        "url": "https://cooldrivepro.com",
        "foundingDate": "2020",
        "founder": {
          "@type": "Person",
          "jobTitle": "Founder",
          "description": "Former long-haul truck driver with 15 years on the road"
        },
        "knowsAbout": ["Parking Air Conditioner", "12V DC Air Conditioner", "No-Idle Truck Cooling", "RV Air Conditioner"]
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
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10" style={{ background: "radial-gradient(circle at 80% 50%, white 0%, transparent 70%)" }} />
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
            {t('about.joinDrivers', 'Join 15,000+ drivers who have switched to CoolDrivePro parking air conditioners. Free shipping on all US orders.')}
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
