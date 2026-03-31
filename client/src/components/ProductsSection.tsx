/**
 * ProductsSection Component
 * SEO: H2 product names contain target keywords
 * Design: Alternating left/right layout, light blue background
 */
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

function ProductCard({ 
  id, 
  model, 
  badge, 
  badgeSeo,
  title,
  titleSeo,
  description,
  specs,
  image,
  imageAlt,
  imageRight,
  bg 
}: { 
  id: string;
  model: string;
  badge: string;
  badgeSeo: string;
  title: string;
  titleSeo: string;
  description: string;
  specs: { label: string; value: string }[];
  image: string;
  imageAlt: string;
  imageRight: boolean;
  bg: string;
}) {
  const { t } = useTranslation();
  
  return (
    <article
      id={id}
      className="w-full"
      style={{ backgroundColor: bg }}
      aria-label={title}
    >
      <div className={`fade-in-up max-w-[1280px] mx-auto px-4 lg:px-8 py-16 lg:py-20 flex flex-col ${imageRight ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-10 lg:gap-16`}>
        {/* Product Image */}
        <div className="w-full lg:w-1/2 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src={image}
              alt={imageAlt}
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
          {model && (
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
                <span style={{ opacity: 0.7, fontSize: "0.65rem" }}>{t('common.model')}</span>
                {model}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="product-badge"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {badge}
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{
                backgroundColor: "oklch(0.90 0.04 250)",
                color: "oklch(0.40 0.12 255)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {badgeSeo}
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-1 leading-tight"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {title}
          </h2>
          <p
            className="text-sm font-medium mb-4"
            style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Inter', sans-serif" }}
          >
            {titleSeo}
          </p>

          <p
            className="text-base leading-relaxed mb-6"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            {description}
          </p>

          <div
            className="grid grid-cols-2 gap-2 mb-8 p-4 rounded-xl"
            style={{ backgroundColor: "oklch(0.92 0.03 240)" }}
          >
            {specs.map((spec) => (
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
            href={`/products/${id}`}
            className="inline-block px-8 py-3 text-sm font-bold text-white rounded transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "oklch(0.45 0.18 255)",
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: "0.02em",
            }}
            aria-label={`${t('products.viewDetails')} ${title}`}
          >
            {t('products.viewDetails')}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ProductsSection() {
  const { t } = useTranslation();
  
  const products = [
    {
      id: "top-mounted-ac",
      model: "VS02 PRO",
      badge: t('products.cooling'),
      badgeSeo: "12V/24V Parking Air Conditioner",
      title: t('products.topMounted.title'),
      titleSeo: t('products.topMounted.subtitle'),
      description: t('products.topMounted.description'),
      specs: [
        { label: t('products.specs.coolingCapacity'), value: t('products.topMounted.btu') },
        { label: t('products.specs.current'), value: "10-45A" },
        { label: t('products.specs.powerSupply'), value: t('products.topMounted.voltage') },
        { label: t('products.specs.noiseLevel'), value: "≤ 45 dB" },
      ],
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-top-mounted-opt_7f111736.webp",
      imageAlt: t('products.topMounted.imageAlt'),
      imageRight: true,
      bg: "oklch(0.96 0.02 240)",
    },
    {
      id: "mini-split-ac",
      model: "VX3000SP",
      badge: t('products.cooling'),
      badgeSeo: "12V DC Mini Split Parking AC",
      title: t('products.miniSplit.title'),
      titleSeo: t('products.miniSplit.subtitle'),
      description: t('products.miniSplit.description'),
      specs: [
        { label: t('products.specs.coolingCapacity'), value: t('products.miniSplit.btu') },
        { label: t('products.specs.powerSupply'), value: t('products.miniSplit.voltage') },
        { label: t('products.specs.batteryRuntime'), value: t('products.miniSplit.runtime') },
        { label: t('products.specs.noiseLevel'), value: "≤ 40 dB" },
      ],
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-mini-split-opt_81dc95b4.webp",
      imageAlt: t('products.miniSplit.imageAlt'),
      imageRight: false,
      bg: "oklch(0.97 0.015 240)",
    },
    {
      id: "water-heater",
      model: "",
      badge: t('products.heating'),
      badgeSeo: "RV Tankless Water Heater",
      title: t('products.waterHeater.title'),
      titleSeo: t('products.waterHeater.subtitle'),
      description: t('products.waterHeater.description'),
      specs: [
        { label: t('products.specs.heatingCapacity'), value: "65,000 BTU" },
        { label: t('products.specs.flowRate'), value: "2.9 GPM" },
        { label: t('products.specs.fuelType'), value: "Propane (LP)" },
        { label: t('products.specs.installation'), value: "Door-access unit" },
      ],
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/water-heater_e1e95553.webp",
      imageAlt: t('products.waterHeater.imageAlt'),
      imageRight: true,
      bg: "oklch(0.96 0.02 240)",
    },
    {
      id: "heating-cooling-ac",
      model: "V-TH1",
      badge: t('products.heatingCooling'),
      badgeSeo: "12V/24V Heating Cooling Parking AC",
      title: t('products.heatingCoolingAC.title'),
      titleSeo: t('products.heatingCoolingAC.subtitle'),
      description: t('products.heatingCoolingAC.description'),
      specs: [
        { label: t('products.specs.coolingCapacity'), value: "2,000W (24V)" },
        { label: t('products.specs.heatingSpeed'), value: "5°C→30°C / 30min" },
        { label: t('products.specs.powerSupply'), value: "12V / 24V DC" },
        { label: t('products.specs.airOutput'), value: "550 m³/h" },
      ],
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-outdoor-top_55c3c0af.webp",
      imageAlt: t('products.heatingCoolingAC.imageAlt'),
      imageRight: false,
      bg: "oklch(0.97 0.015 240)",
    },
  ];
  
  return (
    <section id="products" aria-label={t('products.title')} className="w-full">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 pt-12 pb-4 text-center">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}
        >
          {t('products.subtitle')}
        </p>
        <h2
          className="text-2xl sm:text-3xl font-extrabold mb-2"
          style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
        >
          {t('products.mainTitle')}
        </h2>
        <p
          className="text-base max-w-2xl mx-auto"
          style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}
        >
          {t('products.description')}
        </p>
      </div>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </section>
  );
}
