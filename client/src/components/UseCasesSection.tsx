/**
 * UseCasesSection Component
 * SEO: Targets long-tail keywords by application:
 *   - "parking air conditioner for semi truck"
 *   - "parking air conditioner for RV"
 *   - "parking air conditioner for van"
 *   - "no idle AC for truck driver"
 *   - "12V parking AC for camper"
 * Design: Dark navy background, 3-column icon cards
 */
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Truck, Home, Car, Zap, Leaf, Shield } from "lucide-react";

const useCases = [
  {
    icon: Truck,
    titleKey: "useCases.semiTrucks",
    keywordKey: "useCases.semiTrucksKeyword",
    descriptionKey: "useCases.semiTrucksDesc",
    tags: ["12V / 24V", "No-Idle", "Anti-Idle Compliant"],
  },
  {
    icon: Home,
    titleKey: "useCases.rvs",
    keywordKey: "useCases.rvsKeyword",
    descriptionKey: "useCases.rvsDesc",
    tags: ["Off-Grid", "Solar Compatible", "12V / 24V"],
  },
  {
    icon: Car,
    titleKey: "useCases.vans",
    keywordKey: "useCases.vansKeyword",
    descriptionKey: "useCases.vansDesc",
    tags: ["Van Life", "Compact Design", "12V DC"],
  },
  {
    icon: Zap,
    titleKey: "useCases.noIdle",
    keywordKey: "useCases.noIdleKeyword",
    descriptionKey: "useCases.noIdleDesc",
    tags: ["Fuel Savings", "Eco-Friendly", "Battery Powered"],
  },
  {
    icon: Leaf,
    titleKey: "useCases.solar",
    keywordKey: "useCases.solarKeyword",
    descriptionKey: "useCases.solarDesc",
    tags: ["Solar Ready", "Zero Fuel Cost", "DC Direct"],
  },
  {
    icon: Shield,
    titleKey: "useCases.apu",
    keywordKey: "useCases.apuKeyword",
    descriptionKey: "useCases.apuDesc",
    tags: ["APU Alternative", "Lower Cost", "Easy Install"],
  },
];

export default function UseCasesSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.querySelectorAll(".fade-in-up").forEach((el, i) => {
            setTimeout(() => el.classList.add("visible"), i * 100);
          });
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="use-cases"
      className="w-full py-16 lg:py-20"
      style={{ backgroundColor: "oklch(0.22 0.08 248)" }}
      aria-label={t('useCases.sectionLabel')}
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8" ref={ref}>
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "oklch(0.65 0.10 255)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {t('useCases.applications')}
          </p>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-white mb-3"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {t('useCases.mainTitle')}
          </h2>
          <p
            className="text-base max-w-2xl mx-auto"
            style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
          >
            {t('useCases.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <article
                key={useCase.titleKey}
                className="fade-in-up rounded-xl p-6 group hover:scale-[1.02] transition-transform duration-200"
                style={{ backgroundColor: "oklch(0.28 0.09 248)" }}
                aria-label={t(useCase.keywordKey)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "oklch(0.40 0.18 255)" }}
                  >
                    <Icon size={20} color="white" />
                  </div>
                  <div>
                    <h3
                      className="text-base font-bold text-white leading-tight"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {t(useCase.titleKey)}
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.65 0.10 255)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {t(useCase.keywordKey)}
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "oklch(0.78 0.04 240)", fontFamily: "'Inter', sans-serif" }}
                >
                  {t(useCase.descriptionKey)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {useCase.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: "oklch(0.35 0.10 248)",
                        color: "oklch(0.80 0.08 255)",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
