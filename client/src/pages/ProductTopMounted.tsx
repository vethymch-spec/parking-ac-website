/**
 * Product Detail Page: 10000 BTU Top-Mounted Parking Air Conditioner
 * SEO: keyword-rich H1, specs table, structured content
 */
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChevronRight, Check, Star, ShieldCheck, Truck, RotateCcw, Zap, ChevronLeft, X } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ProductReviews from "@/components/ProductReviews";
import ProductFAQ from "@/components/ProductFAQ";
import { useSEO } from "@/hooks/useSEO";

const galleryImages = [
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-01-hero_d84a64e3.webp", alt: "VS02 PRO Top-Mounted Parking AC - 3/4 angle overview" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-02-front-side_ae7ed14d.webp", alt: "VS02 PRO Parking AC - Front side view" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-03-top-fans_d671776f.webp", alt: "VS02 PRO Parking AC - Top view showing dual condenser fans" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-04-front-flat_2b4ac31a.webp", alt: "VS02 PRO Parking AC - Front flat view showing slim profile" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-05-rear-cables_39b2daae.webp", alt: "VS02 PRO Parking AC - Rear view with cable connections" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-06-top-profile_8e7be5ad.webp", alt: "VS02 PRO Parking AC - Top profile view" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-07-side-long_7cbdc66d.webp", alt: "VS02 PRO Parking AC - Side profile showing slim height" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-08-angle-rear_57ecf5b9.webp", alt: "VS02 PRO Parking AC - Angled rear view" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-09-grille-closeup_6996f19a.webp", alt: "VS02 PRO Parking AC - Honeycomb grille close-up with fan blades" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-10-indoor-closeup_0a1edaa8.webp", alt: "VS02 PRO Parking AC - Indoor unit control panel close-up" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-11-bottom-mount_eadb393f.webp", alt: "VS02 PRO Parking AC - Bottom mounting plate with indoor evaporator" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-12-indoor-unit_ae099200.webp", alt: "VS02 PRO Parking AC - Indoor evaporator unit with digital display" },
];

const vs02Faqs = [
  {
    question: "What is the CoolDrivePro VS02 PRO parking air conditioner?",
    answer: "The CoolDrivePro VS02 PRO is a 10,000 BTU top-mounted 12V/24V DC parking air conditioner designed for semi trucks, RVs, camper vans, and off-grid vehicles. It operates without engine idling by drawing power directly from the vehicle's battery bank. The VS02 PRO features a BLDC compressor, automatic undervoltage protection, and a sleep mode for overnight comfort. It is manufactured by CoolDrivePro and available at cooldrivepro.com.",
    category: "Product",
  },
  {
    question: "How does the VS02 PRO differ from a standard rooftop RV air conditioner?",
    answer: "Unlike standard rooftop RV air conditioners that require shore power or a generator, the CoolDrivePro VS02 PRO runs directly on 12V or 24V DC battery power. It consumes approximately 8–12 amps at cruise — far less than AC-powered units. The VS02 PRO uses a BLDC (brushless DC) compressor for higher efficiency and quieter operation. It can be paired with a lithium battery bank and solar panels for fully off-grid cooling.",
    category: "Comparison",
  },
  {
    question: "How long does the VS02 PRO run on a single battery charge?",
    answer: "The CoolDrivePro VS02 PRO runs approximately 8–10 hours on a 480Ah lithium battery bank. With a 600Ah battery, runtime extends to 10+ hours. Pairing with 200–400W of solar panels can extend runtime indefinitely during daytime parking. The unit's automatic undervoltage cutoff (adjustable 8–11V) protects the battery from deep discharge.",
    category: "Battery",
  },
  {
    question: "Is the VS02 PRO compatible with semi trucks?",
    answer: "Yes. The CoolDrivePro VS02 PRO supports both 12V and 24V DC systems, making it compatible with semi trucks (which typically use 24V electrical systems) as well as RVs, vans, and campers (12V). It is specifically engineered for truck cab dimensions and helps drivers comply with anti-idling regulations at truck stops and rest areas.",
    category: "Compatibility",
  },
  {
    question: "What is the noise level of the VS02 PRO?",
    answer: "The CoolDrivePro VS02 PRO operates at approximately 42 dB — comparable to a quiet library. The BLDC compressor eliminates the vibration and noise associated with traditional piston compressors. Most users report being able to sleep comfortably with the unit running at its lowest setting.",
    category: "Performance",
  },
  {
    question: "How is the VS02 PRO installed on a truck or RV?",
    answer: "The VS02 PRO mounts on the roof of the vehicle through a standard 14×14 inch roof cutout (same as most RV air conditioners). The installation requires basic tools and typically takes 2–4 hours. The unit includes all mounting hardware, a wiring harness, and a remote control. CoolDrivePro provides installation guides and video tutorials at cooldrivepro.com.",
    category: "Installation",
  },
  {
    question: "Does the VS02 PRO work with solar panels?",
    answer: "Yes. The CoolDrivePro VS02 PRO is designed for solar-powered off-grid setups. It works with 12V or 24V solar systems paired with lithium or AGM battery banks. A typical setup of 400W solar + 200Ah LiFePO4 battery provides all-day cooling with overnight reserve. The unit's low power consumption (8–12A at cruise) makes it ideal for solar integration.",
    category: "Solar",
  },
  {
    question: "What warranty does the VS02 PRO come with?",
    answer: "The CoolDrivePro VS02 PRO comes with a 2-year manufacturer warranty covering defects in materials and workmanship. CoolDrivePro also offers a 30-day easy return policy. Technical support is available at support@cooldrivepro.com. Full warranty terms are available at cooldrivepro.com/warranty.",
    category: "Warranty",
  },
];

const vs02Reviews = [
  {id:1,name:"Mike T.",location:"Texas, USA",rating:5,date:"Feb 12, 2026",title:"Best investment for my Peterbilt",body:"Been driving long haul for 15 years and this is hands down the best parking AC I've ever used. Keeps my cab at 72°F even when it's 105°F outside in Texas. Battery lasts all night on my 200Ah LiFePO4 setup. Zero noise complaints from other drivers at the truck stop.",verified:true,helpful:47},
  {id:2,name:"Sarah K.",location:"Arizona, USA",rating:5,date:"Jan 28, 2026",title:"Game changer for desert summers",body:"Living in Phoenix means brutal summers. This unit handles 115°F heat without breaking a sweat. Installation was straightforward — took about 3 hours with basic tools. The remote control is a nice touch. Highly recommend for anyone in the Southwest.",verified:true,helpful:38},
];

const specs = [
  { label: "Cooling Capacity", value: "12,000 BTU/h" },
  { label: "Current", value: "10-45A" },
  { label: "Power Supply", value: "12V / 24V DC" },
  { label: "Rated Current (12V)", value: "≤ 45A" },
  { label: "Rated Current (24V)", value: "≤ 10A" },
  { label: "Compressor Type", value: "DC dual rotary" },
  { label: "Refrigerant", value: "R410a" },
  { label: "Noise Level", value: "≤ 45 dB" },
  { label: "Operating Temp", value: "0°C to +55°C" },
  { label: "Dimensions", value: "980 × 680 × 190 mm" },
  { label: "Weight", value: "34 kg" },
  { label: "Roof Opening", value: "Standard 14\" (356 mm)" },
  { label: "Battery Protection", value: "Undervoltage Cutoff" },
  { label: "Warranty", value: "1 Year" },
];

const features = [
  "12V/24V DC no-idle operation — no engine required",
  "12,000 BTU cooling in one unit",
  "Whisper-quiet ≤45 dB brushless fan motor",
  "Undervoltage battery protection (auto cutoff at 11V)",
  "Fits standard 14\" RV roof opening — no modification needed",
  "Pre-charged refrigerant lines — plug-and-play installation",
  "IP54-rated for dust and moisture resistance",
  "Works with lithium, AGM, or lead-acid battery banks",
];

const faqs = [
  {
    q: "How long can the 12,000 BTU parking AC run on battery?",
    a: "With a 200Ah lithium battery, the top-mounted parking AC runs approximately 6–8 hours. A 400Ah battery bank provides 12–16 hours of continuous cooling — enough for a full night's sleep.",
  },
  {
    q: "Can I use this parking AC while driving?",
    a: "Yes. The 12V/24V DC design allows the parking AC to run while driving, powered by the alternator. This keeps your cab cool before you arrive at your destination.",
  },
  {
    q: "Does the top-mounted parking AC work with solar panels?",
    a: "Absolutely. Our 12V parking AC is fully compatible with solar systems. A 400W solar array can power the unit during peak sunlight hours with zero fuel cost.",
  },
  {
    q: "What is the installation process?",
    a: "Installation requires cutting a 14\" hole in the roof (if not already present), mounting the unit, connecting the 12V/24V power cable, and installing the interior ceiling cassette. Most installations take 2–4 hours.",
  },
];

export default function ProductTopMounted() {
  const { t } = useTranslation();

  useSEO({
    title: "12000 BTU Top-Mounted Parking Air Conditioner | 12V/24V DC – CoolDrivePro",
    description: "VS02 PRO 12000 BTU top-mounted parking AC for semi trucks, RVs & vans. 12V/24V DC, no-idle operation, 45 dB quiet. $1,299 with free US shipping.",
    ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-01-hero_d84a64e3.webp",
  });

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "install" | "faq">("specs");
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const nextImg = useCallback(() => setSelectedImg(i => (i + 1) % galleryImages.length), []);
  const prevImg = useCallback(() => setSelectedImg(i => (i - 1 + galleryImages.length) % galleryImages.length), []);

  const handleAddToCart = () => {
    toast(`${qty} × ${t('products.topMounted.title')} ${t('products.detail.addToCart')} — ${t('common.comingSoon')}`);
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/8615314252983?text=Hi%2C%20I%27m%20interested%20in%20the%20CoolDrivePro%2012%2C000%20BTU%20Top-Mounted%20Parking%20AC.%20Could%20you%20send%20me%20pricing%20and%20availability%3F", "_blank");
  };

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm"
        style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}
      >
        <Link href="/" className="hover:underline">{t('nav.home')}</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:underline">{t('nav.products')}</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>{t('nav.topMountedAC')}</span>
      </nav>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div className="flex flex-col gap-3">
          {/* Main Image */}
          <div
            className="rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center cursor-zoom-in relative group"
            style={{ minHeight: "400px" }}
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={galleryImages[selectedImg].src}
              alt={galleryImages[selectedImg].alt}
              className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
              style={{ maxHeight: "480px" }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); prevImg(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label={t('products.detail.gallery')}
            >
              <ChevronLeft size={18} style={{ color: "oklch(0.30 0.10 250)" }} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImg(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label={t('products.detail.gallery')}
            >
              <ChevronRight size={18} style={{ color: "oklch(0.30 0.10 250)" }} />
            </button>
            <span className="absolute bottom-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm">
              {selectedImg + 1} / {galleryImages.length}
            </span>
          </div>
          {/* Thumbnail strip */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImg(i)}
                className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all"
                style={{
                  border: selectedImg === i ? "2px solid oklch(0.45 0.18 255)" : "2px solid oklch(0.90 0.03 240)",
                  opacity: selectedImg === i ? 1 : 0.7,
                }}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              onClick={() => setLightboxOpen(false)}
              aria-label={t('common.close')}
            >
              <X size={22} className="text-white" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              onClick={(e) => { e.stopPropagation(); prevImg(); }}
              aria-label={t('common.close')}
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <img
              src={galleryImages[selectedImg].src}
              alt={galleryImages[selectedImg].alt}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              onClick={(e) => { e.stopPropagation(); nextImg(); }}
              aria-label={t('common.close')}
            >
              <ChevronRight size={24} className="text-white" />
            </button>
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
              {selectedImg + 1} / {galleryImages.length}
            </span>
          </div>
        )}

        {/* Info */}
        <div>
          <span
            className="product-badge"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {t('products.topMounted.title')}
          </span>
          <h1
            className="text-3xl lg:text-4xl font-extrabold mb-3 leading-tight"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {t('products.topMounted.title')}
          </h1>
          <p
            className="text-base mb-4"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            {t('products.topMounted.subtitle')}
          </p>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={16} fill={i <= 4 ? "oklch(0.75 0.18 80)" : "none"} stroke="oklch(0.75 0.18 80)" />
            ))}
            <span className="text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>4.8 (127 {t('products.detail.reviews')})</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span
              className="text-3xl font-extrabold"
              style={{ color: "oklch(0.35 0.15 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              $1,299.00
            </span>
            <span
              className="ml-3 text-base line-through"
              style={{ color: "oklch(0.65 0.04 250)", fontFamily: "'Inter', sans-serif" }}
            >
              $1,599.00
            </span>
            <span
              className="ml-2 text-sm font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: "oklch(0.92 0.06 140)", color: "oklch(0.35 0.12 140)" }}
            >
              Save $300
            </span>
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: t('products.specs.coolingCapacity'), value: "12,000 BTU" },
              { label: t('products.specs.current'), value: "10-45A" },
              { label: t('products.specs.voltage'), value: "12V / 24V DC" },
              { label: t('products.specs.noiseLevel'), value: "≤ 45 dB" },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-lg px-4 py-3"
                style={{ backgroundColor: "oklch(0.96 0.02 240)" }}
              >
                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "oklch(0.55 0.06 250)", fontFamily: "'Montserrat', sans-serif" }}>{s.label}</div>
                <div className="text-base font-bold" style={{ color: "oklch(0.30 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Features list */}
          <ul className="space-y-2 mb-8">
            {features.slice(0, 5).map(f => (
              <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.45 0.18 255)" }} />
                {f}
              </li>
            ))}
          </ul>

          {/* Qty + Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: "oklch(0.85 0.04 240)" }}>
              <button
                className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ color: "oklch(0.35 0.10 250)" }}
              >−</button>
              <span className="w-10 text-center font-semibold" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Inter', sans-serif" }}>{qty}</span>
              <button
                className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors"
                onClick={() => setQty(q => q + 1)}
                style={{ color: "oklch(0.35 0.10 250)" }}
              >+</button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('products.detail.addToCart')}
            </button>
          </div>
          {/* WhatsApp CTA */}
          <button
            onClick={handleWhatsApp}
            className="w-full py-3 px-6 rounded-lg font-bold text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mb-6"
            style={{
              backgroundColor: "#25D366",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: "oklch(0.90 0.03 240)" }}>
            {[
              { icon: ShieldCheck, label: t('products.detail.warranty') },
              { icon: Truck, label: t('products.detail.freeShipping') },
              { icon: RotateCcw, label: t('products.detail.returns') },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon size={20} style={{ color: "oklch(0.45 0.18 255)" }} />
                <span className="text-xs font-medium" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs: Specs / Installation / FAQ */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10">
        {/* Tab buttons */}
        <div className="flex gap-1 border-b mb-8" style={{ borderColor: "oklch(0.88 0.04 240)" }}>
          {(["specs", "install", "faq"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-3 text-sm font-semibold capitalize transition-colors"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: activeTab === tab ? "oklch(0.45 0.18 255)" : "oklch(0.55 0.05 250)",
                borderBottom: activeTab === tab ? "2px solid oklch(0.45 0.18 255)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {tab === "specs" ? t('products.detail.specifications') : tab === "install" ? t('products.specs.installation') : t('products.detail.faq')}
            </button>
          ))}
        </div>

        {/* Specs Tab */}
        {activeTab === "specs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2
                className="text-xl font-extrabold mb-5"
                style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {t('products.detail.techSpecs')}
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {specs.map((s, i) => (
                    <tr key={s.label} style={{ backgroundColor: i % 2 === 0 ? "white" : "oklch(0.97 0.015 240)" }}>
                      <td className="py-2.5 px-4 font-medium" style={{ color: "oklch(0.45 0.06 250)", fontFamily: "'Inter', sans-serif", width: "45%" }}>{s.label}</td>
                      <td className="py-2.5 px-4 font-semibold" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Inter', sans-serif" }}>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h2
                className="text-xl font-extrabold mb-5"
                style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {t('products.specs.keyFeatures')}
              </h2>
              <ul className="space-y-3">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                      <Check size={12} style={{ color: "oklch(0.45 0.18 255)" }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Installation Tab */}
        {activeTab === "install" && (
          <div className="max-w-2xl">
            <h2
              className="text-xl font-extrabold mb-6"
              style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('products.specs.installation')}
            </h2>
            <div className="space-y-6">
              {[
                { step: "1", title: "Prepare the Roof Opening", desc: "Locate or cut a 14\" (356mm) square opening in your RV roof or truck cab. Ensure the area is structurally sound and free of obstructions. Use the included template for precise marking." },
                { step: "2", title: "Mount the Exterior Unit", desc: "Apply the included foam gasket seal around the roof opening. Lower the exterior unit through the opening and secure with the 4 mounting bolts. Torque to 25 Nm." },
                { step: "3", title: "Install the Interior Cassette", desc: "Attach the interior ceiling cassette from below, connecting the refrigerant lines and power harness. The pre-charged lines require no additional refrigerant — simply connect and tighten." },
                { step: "4", title: "Connect Power", desc: "Run the 12V or 24V DC power cable from your battery bank to the unit. Use minimum 10 AWG wire for 12V systems, 12 AWG for 24V. Install the included 30A inline fuse within 18\" of the battery." },
                { step: "5", title: "Test & Commission", desc: "Power on the unit and verify cooling/heating operation. Set the thermostat to your desired temperature. The unit will automatically maintain the set temperature and protect your battery from deep discharge." },
              ].map(s => (
                <div key={s.step} className="flex gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                    style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{s.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{s.desc}</p>

                  </div>
                </div>
              ))}
            </div>
            <div
              className="mt-8 p-4 rounded-xl flex items-start gap-3"
              style={{ backgroundColor: "oklch(0.94 0.06 255)" }}
            >
              <Zap size={20} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.45 0.18 255)" }} />
              <p className="text-sm" style={{ color: "oklch(0.35 0.10 255)", fontFamily: "'Inter', sans-serif" }}>
                <strong>Pro Tip:</strong> For semi truck installations, use the optional roof bracket kit (sold separately) to mount the unit on the cab-over without cutting. Contact our support team for truck-specific installation guidance.
              </p>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="max-w-2xl space-y-6">
            <h2
              className="text-xl font-extrabold mb-6"
              style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('products.detail.faq')}
            </h2>
            {faqs.map(f => (
              <div
                key={f.q}
                className="rounded-xl p-6"
                style={{ backgroundColor: "oklch(0.97 0.015 240)" }}
              >
                <h3
                  className="font-bold mb-2"
                  style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {f.q}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
                >
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      <section
        className="py-12"
        style={{ backgroundColor: "oklch(0.97 0.015 240)" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <h2
            className="text-xl font-extrabold mb-6"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {t('products.detail.relatedProducts')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { href: "/products/mini-split-ac", title: t('products.miniSplit.title'), price: "$1,599", tag: "Best for Trucks" },
              { href: "/products/heating-cooling-ac", title: t('products.heatingCoolingAC.title'), price: "Contact for Price", tag: "NEW" },
              { href: "/products/water-heater", title: t('products.waterHeater.title'), price: "$399", tag: "Off-Grid Comfort" },
            ].map(p => (
              <Link
                key={p.href}
                href={p.href}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded self-start"
                  style={{ backgroundColor: "oklch(0.94 0.06 255)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {p.tag}
                </span>
                <h3
                  className="font-bold"
                  style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {p.title}
                </h3>
                <span
                  className="font-extrabold"
                  style={{ color: "oklch(0.35 0.15 255)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {p.price}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <ProductReviews reviews={vs02Reviews} productName="VS02 PRO" averageRating={4.8} />
      <ProductFAQ productName="VS02 PRO Top-Mounted Parking AC" faqs={vs02Faqs} />
    </PageLayout>
  );
}
