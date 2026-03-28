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
import { Truck, Home, Car, Zap, Leaf, Shield } from "lucide-react";

const useCases = [
  {
    icon: Truck,
    title: "Semi Truck Parking AC",
    keyword: "Truck Parking Air Conditioner",
    description:
      "Designed for Class 8 semi truck cabs. Our 12V/24V parking air conditioner keeps drivers cool during mandatory rest periods — no idling required. Compliant with anti-idling regulations in all 50 US states.",
    tags: ["12V / 24V", "No-Idle", "Anti-Idle Compliant"],
  },
  {
    icon: Home,
    title: "RV & Camper Parking AC",
    keyword: "RV Parking Air Conditioner",
    description:
      "Off-grid cooling for Class A, B, and C motorhomes, travel trailers, and fifth wheels. Run your parking AC directly from your lithium battery bank or solar system — no shore power needed.",
    tags: ["Off-Grid", "Solar Compatible", "12V / 24V"],
  },
  {
    icon: Car,
    title: "Van & Campervan Parking AC",
    keyword: "Van Parking Air Conditioner",
    description:
      "Compact 12V parking air conditioner units perfect for cargo van conversions, Sprinter vans, and camper vans. Low-profile design fits standard van roof heights without modification.",
    tags: ["Van Life", "Compact Design", "12V DC"],
  },
  {
    icon: Zap,
    title: "No-Idle Cooling System",
    keyword: "No-Idle Air Conditioner",
    description:
      "Replace costly engine idling with battery-powered no-idle parking AC. Save up to $8–12 per hour in fuel costs. Reduce engine wear and lower carbon emissions at truck stops and rest areas.",
    tags: ["Fuel Savings", "Eco-Friendly", "Battery Powered"],
  },
  {
    icon: Leaf,
    title: "Solar-Powered Parking AC",
    keyword: "Solar Parking Air Conditioner",
    description:
      "Pair our 12V parking air conditioner with rooftop solar panels for truly free cooling. DC-direct solar compatibility means your parking AC can run continuously during daylight hours.",
    tags: ["Solar Ready", "Zero Fuel Cost", "DC Direct"],
  },
  {
    icon: Shield,
    title: "APU Replacement",
    keyword: "Electric APU Parking Cooler",
    description:
      "A cost-effective alternative to diesel APU (Auxiliary Power Unit) systems. Our electric parking air conditioner delivers equivalent cooling at a fraction of the installation and operating cost.",
    tags: ["APU Alternative", "Lower Cost", "Easy Install"],
  },
];

export default function UseCasesSection() {
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
      aria-label="Parking Air Conditioner Applications"
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8" ref={ref}>
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "oklch(0.65 0.10 255)", fontFamily: "'Montserrat', sans-serif" }}
          >
            Applications
          </p>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-white mb-3"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Parking Air Conditioner for Every Vehicle
          </h2>
          <p
            className="text-base max-w-2xl mx-auto"
            style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
          >
            From semi trucks to RVs, our 12V and 24V DC parking AC units are engineered for every no-idle cooling application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <article
                key={useCase.title}
                className="fade-in-up rounded-xl p-6 group hover:scale-[1.02] transition-transform duration-200"
                style={{ backgroundColor: "oklch(0.28 0.09 248)" }}
                aria-label={useCase.keyword}
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
                      {useCase.title}
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.65 0.10 255)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {useCase.keyword}
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "oklch(0.78 0.04 240)", fontFamily: "'Inter', sans-serif" }}
                >
                  {useCase.description}
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
