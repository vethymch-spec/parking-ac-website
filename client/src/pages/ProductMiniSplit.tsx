/**
 * Product Detail Page: 12000 BTU Mini Split Parking Air Conditioner
 * SEO: keyword-rich H1, specs, structured content
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChevronRight, Check, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ProductReviews from "@/components/ProductReviews";
import ProductFAQ from "@/components/ProductFAQ";

const vx3000Faqs = [
  {
    question: "What is the CoolDrivePro VX3000SP mini split parking air conditioner?",
    answer: "The CoolDrivePro VX3000SP is a 12,000 BTU mini split 12V/24V DC parking air conditioner with a split design: a compact indoor evaporator unit and a separate outdoor condenser unit. It is designed for semi truck sleeper cabs, large RVs, and commercial vehicles requiring powerful, whisper-quiet cooling without engine idling.",
    category: "Product",
  },
  {
    question: "What is the difference between the VX3000SP mini split and the VS02 PRO top-mounted AC?",
    answer: "The CoolDrivePro VX3000SP mini split has a split design with separate indoor and outdoor units, delivering 12,000 BTU of cooling power and ultra-quiet indoor operation. The VS02 PRO is a top-mounted all-in-one unit with 10,000 BTU, simpler installation, and a lower profile.",
    category: "Comparison",
  },
  {
    question: "How quiet is the VX3000SP indoor unit?",
    answer: "The CoolDrivePro VX3000SP indoor unit operates at approximately 32 dB — quieter than a whisper. Because the compressor is located in the outdoor unit, the indoor evaporator produces only airflow noise.",
    category: "Performance",
  },
];

const vx3000Reviews = [
  {id:1,name:"David H.",location:"Texas, USA",rating:5,date:"Feb 10, 2026",title:"Best mini split for my sleeper cab",body:"Installed the VX3000SP on my Peterbilt 389 sleeper. The split design is perfect — indoor unit is whisper quiet and the outdoor unit handles the heat rejection efficiently.",verified:true,helpful:53},
  {id:2,name:"Ashley M.",location:"California, USA",rating:5,date:"Jan 25, 2026",title:"Perfect for my van conversion",body:"Converted a Mercedes Sprinter for full-time living and the VX3000SP is the heart of my climate system. The indoor unit is so quiet I forget it's running.",verified:true,helpful:67},
];

const specs = [
  { label: "Cooling Capacity", value: "12,000 BTU/h" },
  { label: "Voltage", value: "12V / 24V DC" },
  { label: "Rated Power", value: "756W (12V) / 792W (24V)" },
  { label: "Rated Current", value: "18A (12V) / 8A (24V)" },
  { label: "Min Current Draw", value: "8A" },
  { label: "Compressor", value: "GMCC Twin-Rotary" },
  { label: "Refrigerant", value: "R134A" },
  { label: "Airflow", value: "550 m³/h" },
  { label: "Noise Level (Indoor)", value: "≤ 32 dB" },
  { label: "Noise Level (Outdoor)", value: "≤ 55 dB" },
  { label: "Dimensions (Outdoor)", value: "620 × 400 × 180 mm" },
  { label: "Dimensions (Indoor)", value: "450 × 280 × 120 mm" },
  { label: "Weight (Outdoor)", value: "22 kg" },
  { label: "Weight (Indoor)", value: "8 kg" },
];

const features = [
  "Split design — compressor noise stays outside",
  "Ultra-quiet indoor unit (≤32 dB)",
  "12,000 BTU powerful cooling",
  "Works with 12V and 24V systems",
  "GMCC twin-rotary compressor",
  "Inverter technology for efficiency",
  "Sleep mode for overnight comfort",
  "Remote control included",
];

export default function ProductMiniSplit() {
  const { t } = useTranslation();
  const [qty, setQty] = useState(1);

  const handleAddToCart = () => {
    toast(`${qty} × ${t('products.miniSplit.title')} ${t('products.detail.addToCart')} — ${t('common.comingSoon')}`);
  };

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)" }}>
        <Link href="/" className="hover:underline">{t('nav.home')}</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:underline">{t('nav.products')}</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>{t('nav.miniSplitAC')}</span>
      </nav>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: "400px" }}>
            <img
              src="/images/products/vx3000-split-outdoor-unit-01.webp"
              alt={t('products.miniSplit.imageAlt')}
              className="w-full h-auto object-contain"
              style={{ maxHeight: "480px" }}
            />
          </div>
          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-6 gap-2">
            {[
              "/images/products/vx3000-split-outdoor-unit-01.webp",
              "/images/products/vx3000-split-outdoor-unit-02.webp",
              "/images/products/vx3000-split-indoor-unit-01.webp",
              "/images/products/vx3000-split-system-diagram.webp",
              "/images/products/vx3000-split-installation.webp",
              "/images/products/vx3000-split-features.webp",
            ].map((src, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden bg-gray-100 aspect-square cursor-pointer hover:ring-2 hover:ring-blue-500">
                <img src={src} alt={`VX3000 view ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="product-badge" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {t('products.miniSplit.title')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3 leading-tight" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            {t('products.miniSplit.title')}
          </h1>
          <p className="text-base mb-4" style={{ color: "oklch(0.45 0.05 250)" }}>
            {t('products.miniSplit.subtitle')}
          </p>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={16} fill={i <= 4 ? "oklch(0.75 0.18 80)" : "none"} stroke="oklch(0.75 0.18 80)" />
            ))}
            <span className="text-sm" style={{ color: "oklch(0.55 0.05 250)" }}>4.9 (86 {t('products.detail.reviews')})</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-extrabold" style={{ color: "oklch(0.35 0.15 255)" }}>$1,599.00</span>
            <span className="ml-3 text-base line-through" style={{ color: "oklch(0.65 0.04 250)" }}>$1,899.00</span>
            <span className="ml-2 text-sm font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "oklch(0.92 0.06 140)", color: "oklch(0.35 0.12 140)" }}>Save $300</span>
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: t('products.specs.coolingCapacity'), value: "12,000 BTU" },
              { label: t('products.specs.voltage'), value: "12V / 24V DC" },
              { label: t('products.specs.noiseLevel'), value: "≤ 32 dB" },
              { label: "Airflow", value: "550 m³/h" },
            ].map(s => (
              <div key={s.label} className="rounded-lg px-4 py-3" style={{ backgroundColor: "oklch(0.96 0.02 240)" }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "oklch(0.55 0.06 250)" }}>{s.label}</div>
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
        <h2 className="text-xl font-extrabold mb-5" style={{ color: "oklch(0.25 0.10 250)" }}>{t('products.detail.techSpecs')}</h2>
        <table className="w-full text-sm">
          <tbody>
            {specs.map((s, i) => (
              <tr key={s.label} style={{ backgroundColor: i % 2 === 0 ? "white" : "oklch(0.97 0.015 240)" }}>
                <td className="py-2.5 px-4 font-medium" style={{ color: "oklch(0.45 0.06 250)", width: "45%" }}>{s.label}</td>
                <td className="py-2.5 px-4 font-semibold" style={{ color: "oklch(0.28 0.10 250)" }}>{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <ProductReviews reviews={vx3000Reviews} productName="VX3000SP" averageRating={4.9} />
      <ProductFAQ productName="VX3000SP Mini Split Parking AC" faqs={vx3000Faqs} />
    </PageLayout>
  );
}
