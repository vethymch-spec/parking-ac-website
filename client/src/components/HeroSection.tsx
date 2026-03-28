/**
 * HeroSection Component
 * SEO: H1 contains primary keyword "parking air conditioner"
 * Design: Full-screen dark outdoor scene, white text overlay
 * Low-key dark image → use WHITE text
 *
 * Performance: Uses <img> instead of CSS background-image so the browser
 * can discover the LCP image from the HTML preload hint immediately,
 * without waiting for CSS to be parsed.
 */
export default function HeroSection() {
  return (
    <section
      aria-label="Parking Air Conditioner for Trucks, RVs and Vans"
      className="relative w-full overflow-hidden"
      style={{ minHeight: "calc(100vh + 100px)" }}
    >
      {/* LCP Image - using <img> with srcSet for responsive loading */}
      <img
        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/hero-bg-1280_6f9410ed.webp"
        srcSet="https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/hero-bg-640_fe5499d6.webp 640w, https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/hero-bg-1280_6f9410ed.webp 1280w"
        sizes="100vw"
        alt="Silver Airstream RV trailer at night with campfire – parking air conditioner lifestyle"
        className="absolute inset-0 w-full h-full object-cover"
        fetchPriority="high"
        decoding="async"
        loading="eager"
      />
      {/* Dark overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col justify-end"
        style={{ minHeight: "calc(100vh + 100px)", paddingBottom: "5rem" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 w-full">
          <div className="max-w-xl">
            {/* H1: Primary keyword "parking air conditioner" prominently placed */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
            >
              Parking Air Conditioner for Off-Grid Life &amp; Mobile Comfort
            </h1>
            {/* Keyword-rich subtitle */}
            <p
              className="text-base sm:text-lg text-white/90 mb-8 font-light"
              style={{ fontFamily: "'Inter', sans-serif", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
            >
              12V &amp; 24V DC No-Idle Parking AC for Semi Trucks, RVs, Vans &amp; Campers — Cool Without Idling
            </p>
            <nav aria-label="Product categories" className="flex flex-wrap gap-3">
              <a
                href="/products/top-mounted-ac"
                className="inline-block px-6 py-3 text-sm font-bold text-white rounded transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "oklch(0.45 0.18 255)",
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: "0.02em",
                }}
                title="Top-Mounted Parking Air Conditioner for RV"
              >
                Top-Mounted AC
              </a>
              <a
                href="/products/mini-split-ac"
                className="inline-block px-6 py-3 text-sm font-bold text-white rounded transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "oklch(0.45 0.18 255)",
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: "0.02em",
                }}
                title="Mini Split Parking Air Conditioner for Truck"
              >
                Mini Split AC
              </a>
              <a
                href="/products/heating-cooling-ac"
                className="relative inline-block px-6 py-3 text-sm font-bold text-white rounded transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, oklch(0.55 0.20 25), oklch(0.50 0.22 15))",
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: "0.02em",
                }}
                title="V-TH1 Heating & Cooling Parking Air Conditioner - NEW"
              >
                <span
                  className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold text-white rounded-sm leading-none"
                  style={{ backgroundColor: "oklch(0.38 0.22 25)" }}
                >
                  NEW
                </span>
                Heating &amp; Cooling AC
              </a>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
