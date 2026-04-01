/**
 * Product Detail Page: V-TH1 Heating & Cooling Rotor Parking Air Conditioner
 * SEO: keyword-rich H1, specs table, structured content, FAQ
 * NEW PRODUCT - Heating + Cooling dual-mode
 * UPDATE: Added 110V voltage switch with different specs
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChevronRight, Check, Star, ShieldCheck, Truck, RotateCcw, Zap, Flame, Snowflake } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ProductReviews from "@/components/ProductReviews";
import ProductFAQ from "@/components/ProductFAQ";

const vth1Faqs = [
  {
    question: "What is the CoolDrivePro V-TH1 heating and cooling parking air conditioner?",
    answer: "The CoolDrivePro V-TH1 is a dual-mode rooftop parking air conditioner that provides both heating and cooling. Available in 12V/24V DC for vehicles and 110V AC for shore power or generator setups.",
    category: "Product",
  },
  {
    question: "How does the V-TH1 compare to cooling-only parking air conditioners?",
    answer: "Unlike cooling-only parking ACs, the CoolDrivePro V-TH1 provides year-round climate control with both heating and cooling modes. In winter, it heats the cab from 5°C to 30°C in 30 minutes.",
    category: "Comparison",
  },
  {
    question: "What vehicles is the V-TH1 compatible with?",
    answer: "The CoolDrivePro V-TH1 is compatible with trucks, RVs, campers, vans, and special vehicles. It supports 12V/24V DC electrical systems and 110V AC shore power.",
    category: "Compatibility",
  },
  {
    question: "What is the difference between 12V/24V and 110V versions?",
    answer: "The 12V/24V version runs on vehicle battery systems for mobile use. The 110V version is designed for shore power, garage, or generator use with higher cooling capacity (12,000 BTU vs 9,000 BTU).",
    category: "Technical",
  },
];

const vth1Reviews = [
  {id:1,name:"James R.",location:"Minnesota, USA",rating:5,date:"Mar 10, 2026",title:"Finally a heating AND cooling unit!",body:"Minnesota winters are brutal. The V-TH1 heats my Peterbilt cab from freezing to comfortable in about 25 minutes.",verified:true,helpful:89},
  {id:2,name:"Hans M.",location:"Bavaria, Germany",rating:5,date:"Mar 5, 2026",title:"Perfekt für europäische Winter",body:"Perfect for European winters. The heating function is incredibly efficient.",verified:true,helpful:67},
];

// 12V/24V DC Specs
const dcSpecs = [
  { label: "Cooling Capacity (12V)", value: "1,800W / 6,100 BTU" },
  { label: "Cooling Capacity (24V)", value: "2,000W / 6,800 BTU" },
  { label: "Heating Function", value: "Yes — Heat Pump" },
  { label: "Heating Speed", value: "5°C → 30°C in 30 min" },
  { label: "Compressor", value: "GMCC Twin-Rotary" },
  { label: "Refrigerant", value: "R134A" },
  { label: "Rated Power (12V)", value: "756W" },
  { label: "Rated Current (12V)", value: "18A" },
  { label: "Rated Power (24V)", value: "792W" },
  { label: "Rated Current (24V)", value: "8A" },
  { label: "Min. Current Draw", value: "8A" },
  { label: "Operating Temp", value: "-28°C to +50°C" },
  { label: "Dimensions", value: "850 × 650 × 170 mm" },
  { label: "Weight", value: "28 kg" },
  { label: "Voltage Type", value: "12V / 24V DC" },
];

// 110V AC Specs (from reference image)
const acSpecs = [
  { label: "Cooling Capacity", value: "3,500W / 12,000 BTU" },
  { label: "Heating Capacity", value: "3,300W / 11,500 BTU" },
  { label: "Heating Function", value: "Yes — Heat Pump" },
  { label: "Input Current (Cooling)", value: "9.8A" },
  { label: "Input Power (Cooling)", value: "1,078W" },
  { label: "Input Current (Heating)", value: "9A" },
  { label: "Input Power (Heating)", value: "990W" },
  { label: "Compressor", value: "GMCC Twin-Rotary" },
  { label: "Refrigerant", value: "R32" },
  { label: "Air Output", value: "550 m³/h" },
  { label: "External Machine Size", value: "920 × 865 × 190 mm" },
  { label: "Internal Machine Size", value: "350 × 350 mm" },
  { label: "Weight (Net/Gross)", value: "37 kg / 45 kg" },
  { label: "Operating Temp", value: "-28°C to +50°C" },
  { label: "Voltage Type", value: "110V-120V AC" },
];

const features = [
  "Dual-mode: Heating + Cooling in one unit",
  "Heats from 5°C to 30°C in 30 minutes",
  "Up to 12,000 BTU cooling (110V) / 6,800 BTU (24V)",
  "Works with 12V/24V DC and 110V AC",
  "GMCC twin-rotary compressor",
  "Heat pump technology for efficient heating",
  "Eco-friendly refrigerant (R32/R134A)",
  "CE and RoHS certified",
];

// Quick specs for hero section based on voltage
const getQuickSpecs = (voltage: "dc" | "ac") => {
  if (voltage === "ac") {
    return [
      { label: "coolingCapacity", value: "12,000 BTU" },
      { label: "heatingSpeed", value: "30 min" },
      { label: "voltage", value: "110V-120V AC" },
      { label: "compressor", value: "GMCC" },
    ];
  }
  return [
    { label: "coolingCapacity", value: "6,800 BTU" },
    { label: "heatingSpeed", value: "30 min" },
    { label: "voltage", value: "12V / 24V DC" },
    { label: "compressor", value: "GMCC" },
  ];
};

export default function ProductHeatingCooling() {
  const { t } = useTranslation();
  const [qty, setQty] = useState(1);
  const [voltage, setVoltage] = useState<"dc" | "ac">("dc");

  const currentSpecs = voltage === "dc" ? dcSpecs : acSpecs;
  const quickSpecs = getQuickSpecs(voltage);

  const handleAddToCart = () => {
    const voltageLabel = voltage === "dc" ? "12V/24V" : "110V";
    toast(`${qty} × V-TH1 (${voltageLabel}) ${t('products.detail.addToCart')} — ${t('common.comingSoon')}`);
  };

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)" }}>
        <Link href="/" className="hover:underline">{t('nav.home')}</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:underline">{t('nav.products')}</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>{t('nav.heatingCoolingAC')}</span>
      </nav>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: "400px" }}>
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-outdoor-top_55c3c0af.webp"
            alt={t('products.heatingCoolingAC.imageAlt')}
            className="w-full h-auto object-contain"
            style={{ maxHeight: "480px" }}
          />
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="product-badge" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <Flame size={14} className="inline mr-1" />
              <Snowflake size={14} className="inline mr-1" />
              {t('products.heatingCoolingAC.title')}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "oklch(0.92 0.06 140)", color: "oklch(0.35 0.12 140)" }}>NEW</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3 leading-tight" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            {t('products.heatingCoolingAC.title')}
          </h1>
          <p className="text-base mb-4" style={{ color: "oklch(0.45 0.05 250)" }}>
            {t('products.heatingCoolingAC.subtitle')}
          </p>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={16} fill={i <= 5 ? "oklch(0.75 0.18 80)" : "none"} stroke="oklch(0.75 0.18 80)" />
            ))}
            <span className="text-sm" style={{ color: "oklch(0.55 0.05 250)" }}>5.0 (24 {t('products.detail.reviews')})</span>
          </div>

          {/* Price */}
          <div className="mb-4">
            <span className="text-3xl font-extrabold" style={{ color: "oklch(0.35 0.15 255)" }}>$1,899.00</span>
            <span className="ml-2 text-sm font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "oklch(0.92 0.06 140)", color: "oklch(0.35 0.12 140)" }}>NEW</span>
          </div>

          {/* Voltage Selector */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{ color: "oklch(0.35 0.08 250)" }}>Voltage Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setVoltage("dc")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  voltage === "dc" 
                    ? "text-white" 
                    : "border-2 hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor: voltage === "dc" ? "oklch(0.45 0.18 255)" : "transparent",
                  borderColor: voltage === "dc" ? "oklch(0.45 0.18 255)" : "oklch(0.85 0.04 240)",
                  color: voltage === "dc" ? "white" : "oklch(0.40 0.08 250)"
                }}
              >
                12V / 24V DC
              </button>
              <button
                onClick={() => setVoltage("ac")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  voltage === "ac" 
                    ? "text-white" 
                    : "border-2 hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor: voltage === "ac" ? "oklch(0.45 0.18 255)" : "transparent",
                  borderColor: voltage === "ac" ? "oklch(0.45 0.18 255)" : "oklch(0.85 0.04 240)",
                  color: voltage === "ac" ? "white" : "oklch(0.40 0.08 250)"
                }}
              >
                110V-120V AC
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: "oklch(0.55 0.05 250)" }}>
              {voltage === "dc" 
                ? "For vehicle battery systems - runs on truck/RV batteries" 
                : "For shore power or generator use - higher cooling capacity"}
            </p>
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {quickSpecs.map(s => (
              <div key={s.label} className="rounded-lg px-4 py-3" style={{ backgroundColor: "oklch(0.96 0.02 240)" }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "oklch(0.55 0.06 250)" }}>{t(`products.specs.${s.label}`)}</div>
                <div className="text-base font-bold" style={{ color: "oklch(0.30 0.12 255)" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Features list */}
          <ul className="space-y-2 mb-8">
            {features.slice(0, 5).map(f => (
              <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "oklch(0.40 0.05 250)" }}>
                <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.45 0.18 255)" }} />
                {f}
              </li>
            ))}
          </ul>

          {/* Qty + Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: "oklch(0.85 0.04 240)" }}>
              <button className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button onClick={handleAddToCart} className="flex-1 py-3 rounded-lg font-bold text-white text-sm" style={{ backgroundColor: "oklch(0.45 0.18 255)" }}>
              {t('products.detail.addToCart')}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: "oklch(0.90 0.03 240)" }}>
            {[
              { icon: ShieldCheck, label: t('products.detail.warranty') },
              { icon: Truck, label: t('products.detail.freeShipping') },
              { icon: RotateCcw, label: t('products.detail.returns') },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon size={20} style={{ color: "oklch(0.45 0.18 255)" }} />
                <span className="text-xs font-medium" style={{ color: "oklch(0.50 0.05 250)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs Table */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold" style={{ color: "oklch(0.25 0.10 250)" }}>{t('products.detail.techSpecs')}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setVoltage("dc")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                voltage === "dc" ? "text-white" : "border hover:bg-gray-50"
              }`}
              style={{
                backgroundColor: voltage === "dc" ? "oklch(0.45 0.18 255)" : "transparent",
                borderColor: voltage === "dc" ? "oklch(0.45 0.18 255)" : "oklch(0.85 0.04 240)",
                color: voltage === "dc" ? "white" : "oklch(0.40 0.08 250)"
              }}
            >
              12V / 24V DC
            </button>
            <button
              onClick={() => setVoltage("ac")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                voltage === "ac" ? "text-white" : "border hover:bg-gray-50"
              }`}
              style={{
                backgroundColor: voltage === "ac" ? "oklch(0.45 0.18 255)" : "transparent",
                borderColor: voltage === "ac" ? "oklch(0.45 0.18 255)" : "oklch(0.85 0.04 240)",
                color: voltage === "ac" ? "white" : "oklch(0.40 0.08 250)"
              }}
            >
              110V-120V AC
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {currentSpecs.map((s, i) => (
              <tr key={s.label} style={{ backgroundColor: i % 2 === 0 ? "white" : "oklch(0.97 0.015 240)" }}>
                <td className="py-2.5 px-4 font-medium" style={{ color: "oklch(0.45 0.06 250)", width: "45%" }}>{s.label}</td>
                <td className="py-2.5 px-4 font-semibold" style={{ color: "oklch(0.28 0.10 250)" }}>{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <ProductReviews reviews={vth1Reviews} productName="V-TH1" averageRating={5.0} />
      <ProductFAQ productName="V-TH1 Heating & Cooling Parking AC" faqs={vth1Faqs} />
    </PageLayout>
  );
}
