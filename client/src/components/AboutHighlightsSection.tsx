/**
 * AboutHighlightsSection
 *
 * Home page section that mirrors the About-cluster content (factory,
 * certifications, exhibitions, brand story, stats) with every image and
 * button clickable to the matching About sub-page.
 *
 * Used by: Home.tsx
 * Links to: /about, /about/factory, /about/certifications, /about/exhibitions
 */
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Factory, BadgeCheck, Calendar, ArrowRight, Zap, Globe, Users, Award } from "lucide-react";

const ink = "oklch(0.28 0.10 250)";
const ink2 = "oklch(0.25 0.10 250)";
const muted = "oklch(0.50 0.05 250)";
const accent = "oklch(0.45 0.18 255)";
const accentBg = "oklch(0.94 0.06 255)";
const border = "oklch(0.90 0.02 240)";
const surface = "oklch(0.98 0.01 240)";
const navy = "oklch(0.28 0.10 248)";

const cards = [
  {
    href: "/about/factory",
    img: "/images/factory/cooldrivepro-production-line-assembly.webp",
    icon: Factory,
    titleKey: "about.factoryCard",
    titleFallback: "Inside our factory",
    descKey: "about.factoryCardDesc",
    descFallback:
      "120,000+ units annual capacity, in-house R&D and 100% pre-shipment QC. Walk-through video and production photos.",
    ctaKey: "about.tourFactory",
    ctaFallback: "Tour the factory",
    altKey: "about.factoryAlt",
    altFallback: "CoolDrivePro / Qingdao Vethy parking AC production line",
    imgFit: "object-cover",
    imgBg: "bg-gray-100",
  },
  {
    href: "/about/certifications",
    img: "/images/trust/certifications/cooldrivepro-iso-9001-2015-certificate.png",
    icon: BadgeCheck,
    titleKey: "about.certCard",
    titleFallback: "Certifications & IP",
    descKey: "about.certCardDesc",
    descFallback:
      "ISO 9001:2015 quality system, CNAS-accredited lab, registered trademark and granted design patent. View full-resolution scans.",
    ctaKey: "about.viewCerts",
    ctaFallback: "View certificates",
    altKey: "about.certAlt",
    altFallback: "CoolDrivePro ISO 9001:2015 quality management certificate",
    imgFit: "object-contain p-4",
    imgBg: "bg-white",
  },
  {
    href: "/about/exhibitions",
    img: "/images/trust/exhibitions/cooldrivepro-trade-show-01.jpg",
    icon: Calendar,
    titleKey: "about.expoCard",
    titleFallback: "Trade shows & global presence",
    descKey: "about.expoCardDesc",
    descFallback:
      "Real booth photos and live 12V/24V parking AC demos from international expos across 5 continents.",
    ctaKey: "about.seeExpos",
    ctaFallback: "See booth gallery",
    altKey: "about.expoAlt",
    altFallback: "CoolDrivePro booth at international parking AC trade show",
    imgFit: "object-cover",
    imgBg: "bg-gray-100",
  },
] as const;

export default function AboutHighlightsSection() {
  const { t } = useTranslation();

  const values = [
    { icon: Zap, title: t("about.performanceFirst", "Performance First"), desc: t("about.performanceDesc", "Every parking AC we sell must outperform the competition in real-world conditions — not just lab tests.") },
    { icon: Globe, title: t("about.sustainability", "Sustainability"), desc: t("about.sustainabilityDesc", "No-idle parking AC technology reduces diesel emissions at truck stops by up to 90% compared to engine idling.") },
    { icon: Users, title: t("about.communityDriven", "Community Driven"), desc: t("about.communityDesc", "We listen to truck drivers, RV owners, and van lifers. Every product improvement comes from real user feedback.") },
    { icon: Award, title: t("about.honestWarranty", "Honest Warranty"), desc: t("about.warrantyDesc", "Our warranty means exactly that — no fine print, no hassle. If it breaks, we fix it or replace it.") },
  ];

  const stats = [
    { value: "15,000+", label: t("about.happyCustomers", "Happy Customers") },
    { value: "$4.2M+", label: t("about.fuelSaved", "Fuel Costs Saved") },
    { value: "50", label: t("about.statesServed", "States Served") },
    { value: "4.8★", label: t("about.avgRating", "Average Rating") },
  ];

  return (
    <section aria-labelledby="home-about-heading">
      {/* Proof hub — 3 clickable cards */}
      <div className="py-14 lg:py-20" style={{ backgroundColor: surface }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mb-8">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: accent, fontFamily: "'Montserrat', sans-serif" }}
            >
              {t("about.proofTitle", "Proof, not promises")}
            </p>
            <h2
              id="home-about-heading"
              className="text-2xl lg:text-3xl font-extrabold mb-4"
              style={{ color: ink2, fontFamily: "'Montserrat', sans-serif" }}
            >
              {t("home.aboutHeading", "Who builds your parking air conditioner")}
            </h2>
            <p
              className="text-base leading-relaxed"
              style={{ color: muted, fontFamily: "'Inter', sans-serif" }}
            >
              {t(
                "home.aboutLead",
                "CoolDrivePro products are designed and manufactured at the Qingdao Vethy Industrial facility in Shandong, China. Below are the three layers of evidence buyers, fleet managers and distributors most often ask for — each opens a dedicated page with real photos and downloadable documents."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group rounded-2xl overflow-hidden border bg-white transition-all hover:shadow-lg hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ borderColor: border }}
                  aria-label={t(c.ctaKey, c.ctaFallback)}
                >
                  <div className={`aspect-[16/10] overflow-hidden ${c.imgBg} flex items-center justify-center`}>
                    <img
                      src={c.img}
                      alt={t(c.altKey, c.altFallback)}
                      loading="lazy"
                      className={`w-full h-full ${c.imgFit} group-hover:scale-105 transition-transform duration-500`}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: accentBg }}
                      >
                        <Icon size={18} style={{ color: accent }} />
                      </div>
                      <h3
                        className="font-bold text-lg"
                        style={{ color: ink, fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {t(c.titleKey, c.titleFallback)}
                      </h3>
                    </div>
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: muted, fontFamily: "'Inter', sans-serif" }}
                    >
                      {t(c.descKey, c.descFallback)}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 text-sm font-bold"
                      style={{ color: accent, fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {t(c.ctaKey, c.ctaFallback)}{" "}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brand story — clickable image + read-more link */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: accent, fontFamily: "'Montserrat', sans-serif" }}
          >
            {t("about.ourStory", "Our Story")}
          </p>
          <h2
            className="text-2xl lg:text-3xl font-extrabold mb-5"
            style={{ color: ink2, fontFamily: "'Montserrat', sans-serif" }}
          >
            {t("about.whyStarted", "Why We Started CoolDrivePro")}
          </h2>
          <div
            className="space-y-4 text-base leading-relaxed"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            <p>
              {t(
                "about.story1",
                "In 2019, our founder — a former long-haul truck driver with 15 years on the road — was sitting in a truck stop in Phoenix, Arizona, watching the temperature gauge hit 112°F. He had two choices: idle the engine all night at $8/hour in fuel costs, or sweat through the night in his cab."
              )}
            </p>
            <p>
              {t(
                "about.story2",
                "There had to be a better way. After two years of research, testing, and working directly with DC compressor engineers, CoolDrivePro launched its first 12V parking air conditioner in 2021. The response from the trucking community was overwhelming."
              )}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/about"
              className="px-6 py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: accent, fontFamily: "'Montserrat', sans-serif" }}
            >
              {t("home.aboutReadMore", "Read our full story")}
            </Link>
            <Link
              href="/about/factory"
              className="px-6 py-3 rounded-lg font-bold text-sm border-2 transition-all hover:bg-gray-50"
              style={{ borderColor: accent, color: accent, fontFamily: "'Montserrat', sans-serif" }}
            >
              {t("about.tourFactory", "Tour the factory")}
            </Link>
          </div>
        </div>

        <Link
          href="/about"
          className="group block rounded-2xl overflow-hidden shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label={t("home.aboutReadMore", "Read our full story")}
        >
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/truck-parking_20a5034a.webp"
            alt={t("about.imageAlt", "CoolDrivePro team – parking air conditioner specialists")}
            loading="lazy"
            className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
        </Link>
      </div>

      {/* Core values */}
      <div className="py-14" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <h2
            className="text-2xl lg:text-3xl font-extrabold text-center mb-10"
            style={{ color: ink2, fontFamily: "'Montserrat', sans-serif" }}
          >
            {t("about.coreValues", "Our Core Values")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: accentBg }}
                >
                  <Icon size={20} style={{ color: accent }} />
                </div>
                <h3
                  className="font-bold mb-2"
                  style={{ color: ink, fontFamily: "'Montserrat', sans-serif" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: muted, fontFamily: "'Inter', sans-serif" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats + CTA */}
      <div className="py-14" style={{ backgroundColor: navy }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center mb-10">
            {stats.map((s) => (
              <div key={s.label}>
                <div
                  className="text-3xl lg:text-4xl font-extrabold text-white mb-2"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {s.value}
                </div>
                <div
                  className="text-sm text-white/60"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/about"
              className="px-7 py-3 rounded-lg font-bold text-sm bg-white transition-all hover:opacity-90"
              style={{ color: navy, fontFamily: "'Montserrat', sans-serif" }}
            >
              {t("home.aboutLearnMore", "Learn more about us")}
            </Link>
            <Link
              href="/about/certifications"
              className="px-7 py-3 rounded-lg font-bold text-sm border-2 border-white/70 text-white transition-all hover:bg-white/10"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {t("about.viewCerts", "View certificates")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
