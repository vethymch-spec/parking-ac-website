/**
 * ProductsSection Component
 * SEO: H2 product names contain target keywords
 *      - "parking air conditioner" in product descriptions
 *      - "12V parking AC", "24V truck parking AC" in text
 *      - Semantic <article> tags for each product
 * Design: Alternating left/right layout, light blue background
 */
import { useEffect, useRef } from "react";
import { Link } from "wouter";

const products = [
  {
    id: "top-mounted-ac",
    model: "VS02 PRO",
    badge: "Cooling",
    badgeSeo: "12V/24V Parking Air Conditioner",
    title: "12000 BTU Top-Mounted Parking Air Conditioner",
    titleSeo: "12V/24V DC No-Idle RV & Truck Parking AC",
    description:
      "The ultimate R410A dual rotary compressor parking air conditioner for RVs, semi trucks, and vans. This 12V/24V DC no-idle parking AC delivers 12000 BTU cooling — keeping your cab or camper comfortable without running the engine. Features undervoltage battery protection and whisper-quiet operation at 45 dB.",
    specs: [
      { label: "Cooling Capacity", value: "12,000 BTU" },
      { label: "current", value: "10-45A" },
      { label: "Power Supply", value: "12V / 24V DC" },
      { label: "Noise Level", value: "≤ 45 dB" },
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-top-mounted-opt_7f111736.webp",
    imageAlt: "10000 BTU top-mounted parking air conditioner exploded view – 12V/24V DC no-idle RV truck AC",
    imageRight: true,
    bg: "oklch(0.96 0.02 240)",
  },
  {
    id: "mini-split-ac",
    model: "VX3000SP",
    badge: "Cooling",
    badgeSeo: "12V DC Mini Split Parking AC",
    title: "12000 BTU Mini Split Parking Air Conditioner",
    titleSeo: "12V DC No-Idle AC for Semi Trucks & RVs",
    description:
      "High-capacity 12V DC mini split parking air conditioner designed for semi truck cabs, RVs, and cargo vans. With 12000 BTU of no-idle cooling power, this ductless parking AC runs directly off your vehicle battery — no generator, no shore power needed. Horizontal rooftop installation fits most trucks and campers.",
    specs: [
      { label: "Cooling Capacity", value: "12,000 BTU" },
      { label: "Power Supply", value: "12V DC" },
      { label: "Battery Runtime", value: "8–10 hours" },
      { label: "Noise Level", value: "≤ 40 dB" },
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-mini-split-opt_81dc95b4.webp",
    imageAlt: "12000 BTU mini split parking air conditioner for semi truck and RV – 12V DC no-idle",
    imageRight: false,
    bg: "oklch(0.97 0.015 240)",
  },
  {
    id: "water-heater",
    model: "",
    badge: "Heating",
    badgeSeo: "RV Tankless Water Heater",
    title: "65000 BTU Tankless Water Heater for RV & Truck",
    titleSeo: "On-Demand Propane Heater for Off-Grid Living",
    description:
      "Complete your off-grid comfort system with this 65,000 BTU tankless water heater, purpose-built for RVs, semi trucks, and campers. Delivers 2.9 GPM of instant hot water — the perfect companion to your parking air conditioner for year-round comfort on the road.",
    specs: [
      { label: "Heating Capacity", value: "65,000 BTU" },
      { label: "Flow Rate", value: "2.9 GPM" },
      { label: "Fuel Type", value: "Propane (LP)" },
      { label: "Installation", value: "Door-access unit" },
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/water-heater_e1e95553.webp",
    imageAlt: "65000 BTU tankless water heater for RV and semi truck – off-grid hot water",
    imageRight: true,
    bg: "oklch(0.96 0.02 240)",
  },
  {
    id: "heating-cooling-ac",
    model: "V-TH1",
    badge: "Heating & Cooling",
    badgeSeo: "12V/24V Heating Cooling Parking AC",
    title: "V-TH1 Heating & Cooling Parking Air Conditioner",
    titleSeo: "12V/24V DC Dual-Mode Rotor AC — Year-Round Comfort",
    description:
      "The first dual-mode parking air conditioner from CoolDrivePro. The V-TH1 delivers up to 2,000W cooling in summer and heats your cab from 5°C to 30°C in just 30 minutes during winter. Powered by a GMCC twin-rotary compressor with R134A refrigerant, this 12V/24V DC rotor AC provides year-round climate control for trucks, RVs, vans, and special vehicles — no engine idling required.",
    specs: [
      { label: "Cooling Capacity", value: "2,000W (24V)" },
      { label: "Heating Speed", value: "5°C→30°C / 30min" },
      { label: "Power Supply", value: "12V / 24V DC" },
      { label: "Air Output", value: "550 m³/h" },
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-outdoor-top_55c3c0af.webp",
    imageAlt: "V-TH1 heating and cooling parking air conditioner – 12V/24V DC dual-mode rotor AC",
    imageRight: false,
    bg: "oklch(0.97 0.015 240)",
  },
];

function ProductCard({ product }: { product: (typeof products)[0] }) {
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
    <article
      id={product.id}
      className="w-full"
      style={{ backgroundColor: product.bg }}
      aria-label={product.title}
    >
      <div
        ref={ref}
        className={`fade-in-up max-w-[1280px] mx-auto px-4 lg:px-8 py-16 lg:py-20 flex flex-col ${
          product.imageRight ? "lg:flex-row" : "lg:flex-row-reverse"
        } items-center gap-10 lg:gap-16`}
      >
        {/* Product Image */}
        <div className="w-full lg:w-1/2 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src={product.image}
              alt={product.imageAlt}
              loading="lazy"
              width="900"
              height="502"
              className="w-full h-auto block"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Product Content */}
        <div className="w-full lg:w-1/2">
          {/* Model Number */}
          {product.model && (
            <div className="mb-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "oklch(0.25 0.10 250)",
                  color: "oklch(0.95 0.02 240)",
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: "0.12em",
                }}
              >
                <span style={{ opacity: 0.7, fontSize: "0.65rem" }}>MODEL</span>
                {product.model}
              </span>
            </div>
          )}

          {/* Badge with SEO keyword */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="product-badge"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {product.badge}
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{
                backgroundColor: "oklch(0.90 0.04 250)",
                color: "oklch(0.40 0.12 255)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {product.badgeSeo}
            </span>
          </div>

          {/* H2 with primary keyword */}
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-1 leading-tight"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {product.title}
          </h2>
          <p
            className="text-sm font-medium mb-4"
            style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Inter', sans-serif" }}
          >
            {product.titleSeo}
          </p>

          <p
            className="text-base leading-relaxed mb-6"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            {product.description}
          </p>

          {/* Specs Table - SEO-rich structured data */}
          <div
            className="grid grid-cols-2 gap-2 mb-8 p-4 rounded-xl"
            style={{ backgroundColor: "oklch(0.92 0.03 240)" }}
          >
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex flex-col">
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "oklch(0.55 0.08 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {spec.label}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: "oklch(0.30 0.10 250)", fontFamily: "'Inter', sans-serif" }}
                >
                  {spec.value}
                </span>
              </div>
            ))}
          </div>

          <Link
            href={`/products/${product.id}`}
            className="inline-block px-8 py-3 text-sm font-bold text-white rounded transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "oklch(0.45 0.18 255)",
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: "0.02em",
            }}
            aria-label={`Shop ${product.title}`}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ProductsSection() {
  return (
    <section id="products" aria-label="Parking Air Conditioner Products" className="w-full">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 pt-12 pb-4 text-center">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}
        >
          Parking Air Conditioner
        </p>
        <h2
          className="text-2xl sm:text-3xl font-extrabold mb-2"
          style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
        >
          12V &amp; 24V DC No-Idle Parking AC Units
        </h2>
        <p
          className="text-base max-w-2xl mx-auto"
          style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}
        >
          Battery-powered parking air conditioners for semi trucks, RVs, vans and campers. Cool without idling — save fuel, reduce emissions, stay comfortable.
        </p>
      </div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
