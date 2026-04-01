/**
 * Product Detail Page: Nano Max Light Truck Parking Air Conditioner
 * SEO: keyword-rich H1, specs table, structured content
 * Target: US Light Truck Market
 * Specs: 12V, 10000 BTU, Dual-Rotor Compressor
 */
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChevronRight, Check, Star, ShieldCheck, Truck, RotateCcw, Zap, ChevronLeft, X } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ProductReviews from "@/components/ProductReviews";
import ProductFAQ from "@/components/ProductFAQ";

const galleryImages = [
  { src: "/images/products/nano-max-01.webp", alt: "Nano Max Light Truck Parking AC - Hero view" },
  { src: "/images/products/nano-max-02.webp", alt: "Nano Max - Side profile view" },
  { src: "/images/products/nano-max-03.webp", alt: "Nano Max - Top view" },
  { src: "/images/products/nano-max-04.webp", alt: "Nano Max - Detail view" },
  { src: "/images/products/nano-max-05.webp", alt: "Nano Max - Feature view" },
  { src: "/images/products/nano-max-06.webp", alt: "Nano Max - Closeup" },
  { src: "/images/products/nano-max-07.webp", alt: "Nano Max - Full view" },
];

const nanoMaxFaqs = [
  {
    question: "What is the CoolDrivePro Nano Max parking air conditioner?",
    answer: "The CoolDrivePro Nano Max is a 7,500-8,500 BTU top-mounted 12V/24V DC parking air conditioner specifically designed for light trucks in the US market. Featuring a dual-rotor compressor, it delivers powerful cooling while maintaining compact dimensions perfect for light truck cabs.",
    category: "Product",
  },
  {
    question: "Is the Nano Max compatible with my light truck?",
    answer: "The Nano Max is designed for US light trucks including Ford F-150/F-250, Chevy Silverado 1500/2500, Ram 1500/2500, GMC Sierra, and Toyota Tundra. It auto-switches between 12V and 24V DC systems.",
    category: "Compatibility",
  },
  {
    question: "How does the dual-rotor compressor benefit light truck owners?",
    answer: "The dual-rotor compressor provides 7,500-8,500 BTU cooling power with improved efficiency and reduced vibration compared to single-rotor designs. This means faster cooling, quieter operation, and longer compressor life.",
    category: "Performance",
  },
  {
    question: "How long can the Nano Max run on my truck battery?",
    answer: "With a typical light truck dual battery setup (200-300Ah), the Nano Max runs 6-10 hours continuously depending on voltage (12V or 24V). The unit features intelligent power management with automatic undervoltage protection to protect your battery.",
    category: "Battery",
  },
  {
    question: "What makes Nano Max different from standard RV AC units?",
    answer: "Unlike RV AC units that require shore power or generators, Nano Max runs directly on your truck's 12V or 24V battery. It's purpose-built for light truck cab dimensions and cooling requirements, with a low-profile design (165mm height) that maintains your truck's aerodynamics.",
    category: "Comparison",
  },
];

const nanoMaxReviews = [
  {id:1,name:"Mike T.",location:"Texas, USA",rating:5,date:"Mar 15, 2026",title:"Perfect for my F-150",body:"Installed the Nano Max on my Ford F-150. The dual-rotor compressor is noticeably quieter than my friend's single-rotor unit. Cools the cab in about 15 minutes even in Texas heat.",verified:true,helpful:42},
  {id:2,name:"Jason R.",location:"Arizona, USA",rating:5,date:"Mar 8, 2026",title:"Great for desert camping",body:"Use this on my Ram 1500 for desert camping trips. 10,000 BTU is plenty for the crew cab. Runs all night on my dual battery setup.",verified:true,helpful:38},
  {id:3,name:"Chris L.",location:"Florida, USA",rating:5,date:"Feb 28, 2026",title:"Light truck game changer",body:"Finally an AC unit designed for light trucks! The compact size fits perfectly on my Silverado 1500. Highly recommend for any truck owner.",verified:true,helpful:31},
];

const specs = [
  { label: "Cooling Capacity (12V)", value: "7,500 BTU" },
  { label: "Cooling Capacity (24V)", value: "8,500 BTU" },
  { label: "Voltage", value: "12V / 24V DC" },
  { label: "Compressor Type", value: "Dual-Rotor BLDC" },
  { label: "Rated Power (12V)", value: "240-400W" },
  { label: "Rated Power (24V)", value: "240-700W" },
  { label: "Rated Current (12V)", value: "18-35A" },
  { label: "Rated Current (24V)", value: "10-30A" },
  { label: "Refrigerant", value: "R134A" },
  { label: "Airflow", value: "550 m³/h" },
  { label: "Air Output Method", value: "Manual / Automatic" },
  { label: "Noise Level", value: "≤ 48 dB" },
  { label: "External Unit Size", value: "749 × 749 × 165 mm" },
  { label: "Internal Unit Size", value: "560 × 445 mm" },
  { label: "Roof Opening", value: "450 × 380 mm" },
  { label: "Package Weight", value: "27 kg" },
  { label: "UV Protection", value: "UV-resistant coating" },
];

const features = [
  "7,500-8,500 BTU powerful cooling for light trucks",
  "Dual-rotor compressor for efficiency & quiet operation",
  "12V/24V DC auto-switching - perfect for US light trucks",
  "Low-profile design (165mm height)",
  "Intelligent undervoltage protection",
  "550 m³/h high airflow output",
  "Manual/Automatic air output control",
  "2-year warranty",
];

export default function ProductNanoMax() {
  const { t } = useTranslation();
  const [qty, setQty] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % galleryImages.length);
  }, []);

  const prevImage = useCallback(() => {
    setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, []);

  const handleAddToCart = () => {
    toast(`${qty} × Nano Max Light Truck AC ${t('products.detail.addToCart')} — ${t('common.comingSoon')}`);
  };

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)" }}>
        <Link href="/" className="hover:underline">{t('nav.home')}</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:underline">{t('nav.products')}</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>Nano Max</span>
      </nav>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div 
            className="rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer" 
            style={{ minHeight: "400px" }}
            onClick={() => setShowLightbox(true)}
          >
            <img
              src={galleryImages[currentImage].src}
              alt={galleryImages[currentImage].alt}
              className="w-full h-auto object-contain"
              style={{ maxHeight: "480px" }}
            />
          </div>
          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-7 gap-2">
            {galleryImages.map((img, idx) => (
              <div 
                key={idx} 
                className={`rounded-lg overflow-hidden bg-gray-100 aspect-square cursor-pointer ${currentImage === idx ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'}`}
                onClick={() => setCurrentImage(idx)}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="product-badge" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <Zap size={14} className="inline mr-1" />
              Light Truck Series
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "oklch(0.92 0.06 140)", color: "oklch(0.35 0.12 140)" }}>NEW</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "oklch(0.92 0.12 30)", color: "oklch(0.35 0.18 30)" }}>USA</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3 leading-tight" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            Nano Max Light Truck Parking AC
          </h1>
          <p className="text-base mb-4" style={{ color: "oklch(0.45 0.05 250)" }}>
            12V/24V DC 7,500-8,500 BTU Dual-Rotor Parking Air Conditioner — Built for US Light Trucks
          </p>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={16} fill={i <= 5 ? "oklch(0.75 0.18 80)" : "none"} stroke="oklch(0.75 0.18 80)" />
            ))}
            <span className="text-sm" style={{ color: "oklch(0.55 0.05 250)" }}>5.0 (3 {t('products.detail.reviews')})</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-extrabold" style={{ color: "oklch(0.35 0.15 255)" }}>$1,599.00</span>
            <span className="ml-2 text-sm font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "oklch(0.92 0.06 140)", color: "oklch(0.35 0.12 140)" }}>NEW</span>
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: t('products.specs.coolingCapacity'), value: "7,500-8,500 BTU" },
              { label: "Compressor", value: "Dual-Rotor" },
              { label: t('products.specs.voltage'), value: "12V / 24V DC" },
              { label: "Target Market", value: "USA Light Trucks" },
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

      <ProductReviews reviews={nanoMaxReviews} productName="Nano Max" averageRating={5.0} />
      <ProductFAQ productName="Nano Max Light Truck Parking AC" faqs={nanoMaxFaqs} />

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowLightbox(false)}>
          <button className="absolute top-4 right-4 text-white p-2" onClick={() => setShowLightbox(false)}>
            <X size={32} />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <ChevronLeft size={48} />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <ChevronRight size={48} />
          </button>
          <img 
            src={galleryImages[currentImage].src} 
            alt={galleryImages[currentImage].alt}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </PageLayout>
  );
}
