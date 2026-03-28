/**
 * FeaturesSection Component
 * SEO: Feature titles contain target keywords
 *      - "12V DC parking air conditioner"
 *      - "no-idle parking AC battery"
 *      - "parking air conditioner installation"
 * Design: Alternating left/right image+text layout
 */
import { useEffect, useRef } from "react";
import { Link } from "wouter";

const features = [
  {
    id: "power",
    badge: "Power Source",
    title: "12V DC Battery-Powered Parking AC",
    description:
      "Our parking air conditioners run directly off the vehicle's 12V or 24V battery — not the engine belt. This no-idle design delivers continuous cooling comfort when parked, eliminating fuel costs and engine wear. Built-in undervoltage protection ensures your parking AC never drains the battery below safe levels.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-rv-outdoor-3S7bLnKiixmod8iB5Fjvih.webp",
    imageAlt: "Semi truck with 12V parking air conditioner – no-idle DC powered cooling",
    imageRight: false,
    bg: "white",
  },
  {
    id: "efficiency",
    badge: "Energy Efficiency",
    title: "High-Efficiency No-Idle Cooling & Heating",
    description:
      "With 12,000 BTU cooling (Mini Split) and 10,000 BTU cooling / 4,500 BTU heating (Top-Mounted), our parking air conditioners deliver powerful climate control at a COP ≥2.5. Variable-speed DC scroll compressor technology means your parking AC uses only the energy needed — maximizing battery runtime.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/mountain-landscape_00525f8e.webp",
    imageAlt: "RV camping in mountains – energy efficient parking air conditioner",
    imageRight: true,
    bg: "oklch(0.96 0.02 240)",
  },
  {
    id: "installation",
    badge: "Easy Installation",
    title: "Simple Parking AC Installation",
    description:
      "Every parking air conditioner ships with a complete installation kit, pre-charged refrigerant lines, and a step-by-step manual. No HVAC certification required. Most installations take 2–4 hours. Compatible with standard 14\" RV roof openings and universal truck cab mounting brackets.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-installation-3ozyGKpamMMmm4bwD2kaii.webp",
    imageAlt: "Installing parking air conditioner on RV roof – easy DIY installation",
    imageRight: false,
    bg: "white",
  },
  {
    id: "battery",
    badge: "Battery Protection",
    title: "Smart Battery Protection for Parking AC",
    description:
      "Our parking air conditioners feature multi-level electrical safety protection including undervoltage cutoff (8–11V), overcurrent protection, and thermal shutdown. Your vehicle battery is protected from deep discharge — critical for reliable engine starting after a full night of parking AC operation.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/water-heater_e1e95553.webp",
    imageAlt: "Semi truck cab – parking air conditioner with battery protection",
    imageRight: true,
    bg: "oklch(0.96 0.02 240)",
  },
  {
    id: "durability",
    badge: "Durability",
    title: "Parking AC Built for Extreme Climates",
    description:
      "Our parking air conditioners are rigorously tested from -28°C to +50°C ambient temperatures. Whether you're parked in a desert truck stop in Arizona or a winter rest area in Minnesota, your parking AC maintains optimal performance. IP54-rated components resist dust and moisture.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/truck-parking_20a5034a.webp",
    imageAlt: "RV in desert – parking air conditioner for extreme heat",
    imageRight: false,
    bg: "white",
  },
  {
    id: "noise",
    badge: "Quiet Operation",
    title: "Whisper-Quiet Parking Air Conditioner",
    description:
      "At just 40 dB, our parking air conditioners are among the quietest on the market. Brushless dual-fan technology delivers high air volume without noise — so you can sleep comfortably while your parking AC works. Ideal for residential neighborhoods and campgrounds with noise restrictions.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/mountain-landscape_00525f8e.webp",
    imageAlt: "Peaceful campsite at night – quiet parking air conditioner operation",
    imageRight: true,
    bg: "oklch(0.96 0.02 240)",
  },
];

function FeatureCard({ feature }: { feature: (typeof features)[0] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full" style={{ backgroundColor: feature.bg }}>
      <div
        ref={ref}
        className={`fade-in-up max-w-[1280px] mx-auto px-4 lg:px-8 py-14 lg:py-20 flex flex-col ${
          feature.imageRight ? "lg:flex-row" : "lg:flex-row-reverse"
        } items-center gap-10 lg:gap-16`}
      >
        {/* Image */}
        <div className="w-full lg:w-1/2 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src={feature.image}
              alt={feature.imageAlt}
              loading="lazy"
              width="600"
              height="400"
              className="w-full h-auto object-cover"
              style={{ maxHeight: "380px", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="w-full lg:w-1/2">
          <span
            className="product-badge"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {feature.badge}
          </span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {feature.title}
          </h2>
          <p
            className="text-base leading-relaxed mb-8"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            {feature.description}
          </p>
          <Link
            href={`/features/${feature.id}`}
            className="inline-block px-6 py-2.5 text-sm font-semibold rounded border-2 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
            style={{
              borderColor: "oklch(0.45 0.18 255)",
              color: "oklch(0.45 0.18 255)",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Learn More About {feature.title}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="w-full"
      aria-label="Parking Air Conditioner Features"
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 pt-12 pb-4 text-center">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}
        >
          Why Our Parking AC
        </p>
        <h2
          className="text-2xl sm:text-3xl font-extrabold mb-2"
          style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
        >
          Built for No-Idle Performance
        </h2>
      </div>
      {features.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </section>
  );
}
