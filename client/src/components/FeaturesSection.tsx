/**
 * FeaturesSection Component
 * SEO: Feature titles contain target keywords
 * Design: Alternating left/right image+text layout
 */
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

function FeatureCard({ 
  id, 
  badge, 
  title,
  description,
  image,
  imageAlt,
  imageRight,
  bg 
}: { 
  id: string;
  badge: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageRight: boolean;
  bg: string;
}) {
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
    <div className="w-full" style={{ backgroundColor: bg }}>
      <div
        ref={ref}
        className={`fade-in-up max-w-[1280px] mx-auto px-4 lg:px-8 py-14 lg:py-20 flex flex-col ${imageRight ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-10 lg:gap-16`}
      >
        {/* Image */}
        <div className="w-full lg:w-1/2 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src={image}
              alt={imageAlt}
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
            {badge}
          </span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {title}
          </h2>
          <p
            className="text-base leading-relaxed mb-8"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            {description}
          </p>
          <Link
            href={`/features/${id}`}
            className="inline-block px-6 py-2.5 text-sm font-semibold rounded border-2 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
            style={{
              borderColor: "oklch(0.45 0.18 255)",
              color: "oklch(0.45 0.18 255)",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            {t('features.learnMore')} {title}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const { t } = useTranslation();
  
  const features = [
    {
      id: "power",
      badge: t('features.power.badge'),
      title: t('features.power.title'),
      description: t('features.power.description'),
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-rv-outdoor-3S7bLnKiixmod8iB5Fjvih.webp",
      imageAlt: t('features.power.imageAlt'),
      imageRight: false,
      bg: "white",
    },
    {
      id: "efficiency",
      badge: t('features.efficiency.badge'),
      title: t('features.efficiency.title'),
      description: t('features.efficiency.description'),
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/mountain-landscape_00525f8e.webp",
      imageAlt: t('features.efficiency.imageAlt'),
      imageRight: true,
      bg: "oklch(0.96 0.02 240)",
    },
    {
      id: "installation",
      badge: t('features.installation.badge'),
      title: t('features.installation.title'),
      description: t('features.installation.description'),
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-installation-3ozyGKpamMMmm4bwD2kaii.webp",
      imageAlt: "Installing parking air conditioner on RV roof – easy DIY installation",
      imageRight: false,
      bg: "white",
    },
    {
      id: "battery",
      badge: t('features.battery.badge'),
      title: t('features.battery.title'),
      description: t('features.battery.description'),
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/water-heater_e1e95553.webp",
      imageAlt: "Semi truck cab – parking air conditioner with battery protection",
      imageRight: true,
      bg: "oklch(0.96 0.02 240)",
    },
    {
      id: "durability",
      badge: t('features.durability.badge'),
      title: t('features.durability.title'),
      description: t('features.durability.description'),
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/truck-parking_20a5034a.webp",
      imageAlt: "RV in desert – parking air conditioner for extreme heat",
      imageRight: false,
      bg: "white",
    },
    {
      id: "noise",
      badge: t('features.noise.badge'),
      title: t('features.noise.title'),
      description: t('features.noise.description'),
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/mountain-landscape_00525f8e.webp",
      imageAlt: t('features.noise.imageAlt'),
      imageRight: true,
      bg: "oklch(0.96 0.02 240)",
    },
  ];

  return (
    <section
      id="features"
      className="w-full"
      aria-label={t('features.title')}
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 pt-12 pb-4 text-center">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}
        >
          {t('features.mainTitle')}
        </p>
        <h2
          className="text-2xl sm:text-3xl font-extrabold mb-2"
          style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
        >
          {t('features.subTitle')}
        </h2>
      </div>
      {features.map((feature) => (
        <FeatureCard key={feature.id} {...feature} />
      ))}
    </section>
  );
}
