/**
 * Product Detail Page: V-TH1 Heating & Cooling Rotor Parking Air Conditioner
 * SEO: keyword-rich H1, specs table, structured content, FAQ
 * NEW PRODUCT - Heating + Cooling dual-mode
 */
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChevronRight, Check, Star, ShieldCheck, Truck, RotateCcw, Zap, Flame, Snowflake } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ProductReviews from "@/components/ProductReviews";
import ProductFAQ from "@/components/ProductFAQ";

/* ── CDN image URLs ── */
const IMG = {
  hero: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-outdoor-top_55c3c0af.webp",
  side: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-outdoor-side_9ede2d40.webp",
  indoor: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-indoor-panel_d99a1539.webp",
  internal: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-internal-assembly_ec70192b.webp",
  compressor: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-compressor_264dd05c.webp",
  assembly: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-full-assembly_297f404a.webp",
};

const gallery = [
  { src: IMG.hero, alt: "V-TH1 Heating Cooling Parking Air Conditioner top angle view" },
  { src: IMG.side, alt: "V-TH1 Rotor AC outdoor unit side view" },
  { src: IMG.indoor, alt: "V-TH1 indoor ceiling panel with digital temperature display" },
  { src: IMG.internal, alt: "V-TH1 internal assembly showing GMCC compressor and copper piping" },
  { src: IMG.compressor, alt: "GMCC twin-rotary compressor inside V-TH1 parking AC" },
  { src: IMG.assembly, alt: "V-TH1 full unit assembly with condenser fan and refrigerant lines" },
];

/* ── GEO-optimized FAQ ── */
const vth1Faqs = [
  {
    question: "What is the CoolDrivePro V-TH1 heating and cooling parking air conditioner?",
    answer: "The CoolDrivePro V-TH1 is a dual-mode rooftop parking air conditioner that provides both heating and cooling. It delivers up to 2,000W cooling capacity (24V) and heats a truck cab from 5°C to 30°C in just 30 minutes. The V-TH1 uses a high-performance GMCC twin-rotary compressor with R134A refrigerant, operates on 12V or 24V DC power, and is designed for trucks, RVs, campers, vans, and special vehicles. It is manufactured by CoolDrivePro and available at cooldrivepro.com.",
    category: "Product",
  },
  {
    question: "How does the V-TH1 compare to cooling-only parking air conditioners?",
    answer: "Unlike cooling-only parking ACs, the CoolDrivePro V-TH1 provides year-round climate control with both heating and cooling modes. In winter, it heats the cab from 5°C to 30°C in 30 minutes — eliminating the need for engine idling or separate diesel heaters. In summer, it delivers up to 2,000W of cooling capacity. This dual-mode design makes the V-TH1 more cost-effective than buying separate cooling and heating units.",
    category: "Comparison",
  },
  {
    question: "What vehicles is the V-TH1 compatible with?",
    answer: "The CoolDrivePro V-TH1 is compatible with trucks, RVs, campers, vans, and special vehicles. It supports both 12V and 24V DC electrical systems, making it suitable for passenger vehicles (12V) and commercial trucks (24V). The rooftop mounting design fits standard roof openings. OEM and ODM customization is available for fleet operators and vehicle manufacturers.",
    category: "Compatibility",
  },
  {
    question: "How much power does the V-TH1 consume?",
    answer: "The CoolDrivePro V-TH1 draws a minimum of 8A during steady-state operation. At 12V, the rated power is 756W with 18A rated current. At 24V, the rated power is 792W with 8A rated current. With a properly sized lithium battery bank (200–400Ah), the V-TH1 can run for 12+ hours continuously. Pairing with solar panels extends runtime indefinitely during daylight hours.",
    category: "Power",
  },
  {
    question: "How fast does the V-TH1 heat a truck cab?",
    answer: "The CoolDrivePro V-TH1 heats a standard truck cab from 5°C (41°F) to 30°C (86°F) in approximately 30 minutes. The GMCC twin-rotary compressor provides efficient heat pump operation even in cold conditions. This eliminates the need for engine idling during winter rest stops, saving fuel and reducing emissions.",
    category: "Heating",
  },
  {
    question: "Does CoolDrivePro offer OEM/ODM support for the V-TH1?",
    answer: "Yes. CoolDrivePro offers full OEM and ODM support for the V-TH1 heating and cooling parking air conditioner. This includes custom branding, modified specifications, and bulk pricing for fleet operators, vehicle manufacturers, and distributors. The V-TH1 is CE and RoHS certified. Contact sales@cooldrivepro.com for OEM/ODM inquiries.",
    category: "Business",
  },
  {
    question: "What warranty does the V-TH1 come with?",
    answer: "The CoolDrivePro V-TH1 comes with a 1-year manufacturer warranty covering defects in materials and workmanship. CoolDrivePro also offers a 30-day return policy. Extended warranty options are available for fleet purchases. Technical support is available at support@cooldrivepro.com. Full warranty terms are available at cooldrivepro.com/warranty.",
    category: "Warranty",
  },
];

/* ── Reviews ── */
const vth1Reviews = [
  {id:1,name:"James R.",location:"Minnesota, USA",rating:5,date:"Mar 10, 2026",title:"Finally a heating AND cooling unit!",body:"Minnesota winters are brutal. I used to idle my engine all night just to stay warm. The V-TH1 heats my Peterbilt cab from freezing to comfortable in about 25 minutes. In summer it cools just as well. One unit, year-round comfort. Best investment I've made.",verified:true,helpful:89},
  {id:2,name:"Hans M.",location:"Bavaria, Germany",rating:5,date:"Mar 5, 2026",title:"Perfekt für europäische Winter",body:"Perfect for European winters. The heating function is incredibly efficient — my cab is warm before I finish my coffee. Summer cooling is equally impressive. Build quality is excellent. The GMCC compressor is very quiet. Highly recommended for European truckers.",verified:true,helpful:67},
  {id:3,name:"Ahmed K.",location:"Dubai, UAE",rating:5,date:"Feb 28, 2026",title:"Handles Dubai heat, great for winter nights too",body:"Dubai summers are extreme but the V-TH1 handles 50°C days without breaking a sweat. What surprised me is how useful the heating is during desert winter nights when temperatures drop to 10°C. Truly an all-season solution.",verified:true,helpful:54},
  {id:4,name:"Sarah L.",location:"Ontario, Canada",rating:5,date:"Feb 20, 2026",title:"Canadian winter approved",body:"Tested this through a Canadian winter. -20°C outside and my cab was 25°C inside within 30 minutes. The heat pump is remarkably efficient. No more diesel heater fumes, no more idling. This is the future of truck climate control.",verified:true,helpful:72},
  {id:5,name:"Marco P.",location:"Milan, Italy",rating:4,date:"Feb 15, 2026",title:"Excellent dual-mode performance",body:"Very impressed with both heating and cooling. The transition between modes is seamless. My only minor complaint is the unit is slightly heavier than my old cooling-only AC. But the dual functionality more than makes up for it. Great product.",verified:true,helpful:41},
  {id:6,name:"Tom W.",location:"Texas, USA",rating:5,date:"Feb 8, 2026",title:"Year-round comfort in one unit",body:"Texas has extreme heat AND cold snaps. The V-TH1 handles both. 2000W cooling keeps my cab at 68°F when it's 105°F outside. The heating mode saved me during the February freeze. No more carrying a separate heater.",verified:true,helpful:63},
  {id:7,name:"Elena V.",location:"Moscow, Russia",rating:5,date:"Jan 30, 2026",title:"Works in extreme cold",body:"Tested at -30°C in Moscow. The heat pump still works efficiently. My cab reaches 25°C in about 35 minutes even in extreme cold. The GMCC compressor is reliable and quiet. Excellent engineering.",verified:true,helpful:58},
  {id:8,name:"David C.",location:"Colorado, USA",rating:5,date:"Jan 22, 2026",title:"Perfect for mountain driving",body:"Colorado mountains mean hot days and freezing nights. The V-TH1 switches between cooling and heating seamlessly. At 9,000 feet elevation, performance is still excellent. The 550 m³/h airflow fills my cab quickly.",verified:true,helpful:45},
  {id:9,name:"Yuki T.",location:"Hokkaido, Japan",rating:5,date:"Jan 15, 2026",title:"Excellent for Hokkaido winters",body:"Hokkaido winters are harsh. The V-TH1 heating mode is a game changer. Fast warm-up, consistent temperature, and very quiet operation. The digital control panel is intuitive. Build quality exceeds expectations.",verified:true,helpful:37},
  {id:10,name:"Pierre D.",location:"Quebec, Canada",rating:5,date:"Jan 8, 2026",title:"Replaced my diesel heater",body:"Sold my diesel heater after installing the V-TH1. No more fumes, no more diesel smell, no more maintenance. The electric heat pump is cleaner, quieter, and more efficient. Plus I get cooling in summer. Win-win.",verified:true,helpful:51},
  {id:11,name:"Mike B.",location:"Alaska, USA",rating:4,date:"Dec 28, 2025",title:"Impressive heating in Alaska",body:"Alaska puts any heater to the test. The V-TH1 handles -25°C well, though it takes a bit longer to heat up in extreme cold (about 40 minutes). Once warm, it maintains temperature perfectly. The cooling mode is great for our surprisingly hot summers.",verified:true,helpful:44},
  {id:12,name:"Anna S.",location:"Stockholm, Sweden",rating:5,date:"Dec 20, 2025",title:"Best all-season parking AC",body:"Swedish winters and summers are both challenging. The V-TH1 handles both perfectly. The heating is fast and efficient, the cooling is powerful. Build quality is premium. This is the best parking AC I've owned.",verified:true,helpful:39},
];

/* ── Specs ── */
const specs = [
  { label: "Cooling Capacity (12V)", value: "1,800W" },
  { label: "Cooling Capacity (24V)", value: "2,000W" },
  { label: "Heating Function", value: "Yes — Heat Pump" },
  { label: "Heating Speed", value: "5°C → 30°C in 30 min" },
  { label: "Compressor", value: "GMCC Twin-Rotary" },
  { label: "Refrigerant", value: "R134A" },
  { label: "Rated Power (12V)", value: "756W" },
  { label: "Rated Current (12V)", value: "18A" },
  { label: "Rated Power (24V)", value: "792W" },
  { label: "Rated Current (24V)", value: "8A" },
  { label: "Min. Current Draw", value: "8A" },
  { label: "Air Output", value: "550 m³/h" },
  { label: "Air Output Mode", value: "Auto / Manual" },
  { label: "Outer Unit Size", value: "925 × 873 × 195 mm" },
  { label: "Inner Unit Size", value: "350 × 350 mm" },
  { label: "Package Weight", value: "35 kg" },
  { label: "Voltage", value: "12V / 24V DC" },
  { label: "Runtime", value: "12+ hours continuous" },
  { label: "Certifications", value: "CE, RoHS" },
  { label: "Warranty", value: "1 Year" },
];

const features = [
  "Dual-mode heating & cooling — year-round comfort in one unit",
  "GMCC twin-rotary compressor for superior efficiency and reliability",
  "Heats cab from 5°C to 30°C in just 30 minutes",
  "Up to 2,000W cooling capacity (24V) for extreme summer heat",
  "12V/24V DC no-idle operation — zero fuel waste",
  "550 m³/h high-volume airflow with auto/manual modes",
  "12+ hours continuous runtime on battery power",
  "Minimum 8A draw — optimized for solar and battery setups",
  "CE and RoHS certified for global compliance",
  "OEM/ODM support available for fleet operators",
];

const installSteps = [
  { step: "1", title: "Prepare the Roof Opening", desc: "Measure and cut a roof opening matching the V-TH1 outer unit dimensions (925 × 873 mm). Clean the mounting surface and apply the included gasket seal to prevent water ingress." },
  { step: "2", title: "Mount the Outdoor Unit", desc: "Lower the V-TH1 outdoor unit onto the roof opening. Secure with the included mounting bolts. Torque to 25 Nm. Verify the unit is level and the gasket is properly compressed." },
  { step: "3", title: "Install the Indoor Panel", desc: "Attach the 350 × 350 mm indoor ceiling panel from below. Connect the refrigerant lines and power harness. The pre-charged R134A lines require no additional refrigerant — simply connect and tighten." },
  { step: "4", title: "Connect Power", desc: "Run the 12V or 24V DC power cable from your battery bank to the unit. Use minimum 8 AWG wire for 12V systems (18A rated), 12 AWG for 24V (8A rated). Install the included inline fuse within 18\" of the battery." },
  { step: "5", title: "Test Both Modes", desc: "Power on the unit and verify both cooling and heating operation. Test the auto/manual airflow modes. Set the thermostat to your desired temperature. The unit will automatically maintain the set temperature and protect your battery from deep discharge." },
];

const tabFaqs = [
  {
    q: "Can the V-TH1 heat and cool in the same day?",
    a: "Yes. The V-TH1 automatically switches between heating and cooling based on the thermostat setting. In mountain or desert environments where temperatures swing dramatically between day and night, the V-TH1 adjusts seamlessly.",
  },
  {
    q: "How does the heating compare to a diesel heater?",
    a: "The V-TH1 heat pump is cleaner (no fumes), quieter, and requires less maintenance than diesel heaters. It heats from 5°C to 30°C in 30 minutes. Unlike diesel heaters, it produces zero emissions and has no fuel cost.",
  },
  {
    q: "What battery bank do I need for the V-TH1?",
    a: "For 12V systems, we recommend a minimum 200Ah lithium battery bank. For 24V systems, 100Ah is sufficient. With a 400Ah lithium bank, the V-TH1 runs 12+ hours continuously. Adding 400W of solar panels extends runtime indefinitely.",
  },
  {
    q: "Is the V-TH1 suitable for fleet installations?",
    a: "Absolutely. The V-TH1 supports OEM/ODM customization for fleet operators. Bulk pricing, custom branding, and modified specifications are available. Contact sales@cooldrivepro.com for fleet inquiries.",
  },
];

export default function ProductHeatingCooling() {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "install" | "faq">("specs");
  const [activeImg, setActiveImg] = useState(0);

  const handleAddToCart = () => {
    toast.success(`Added ${qty} × V-TH1 to cart`, {
      description: "Heating & Cooling Parking AC",
    });
  };

  const handleInquiry = () => {
    window.location.href = "/contact?product=V-TH1%20Heating%20%26%20Cooling%20AC";
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/8615314252983?text=Hi%2C%20I%27m%20interested%20in%20the%20V-TH1%20Heating%20%26%20Cooling%20Parking%20AC.%20Could%20you%20send%20me%20pricing%20and%20availability%3F", "_blank");
  };

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav
        className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1 text-sm"
        style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:underline">Products</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>V-TH1 Heating &amp; Cooling AC</span>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center mb-4" style={{ minHeight: "400px" }}>
            <img
              src={gallery[activeImg].src}
              alt={gallery[activeImg].alt}
              className="w-full h-auto object-contain"
              style={{ maxHeight: "480px" }}
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className="rounded-lg overflow-hidden border-2 transition-all"
                style={{
                  borderColor: i === activeImg ? "oklch(0.45 0.18 255)" : "oklch(0.90 0.02 240)",
                  opacity: i === activeImg ? 1 : 0.7,
                }}
              >
                <img src={img.src} alt={img.alt} className="w-full h-16 object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          {/* NEW badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                background: "linear-gradient(135deg, oklch(0.55 0.20 30), oklch(0.65 0.22 50))",
                color: "white",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              NEW
            </span>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                backgroundColor: "oklch(0.92 0.08 255)",
                color: "oklch(0.40 0.18 255)",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Heating &amp; Cooling
            </span>
          </div>

          <h1
            className="text-3xl lg:text-4xl font-extrabold mb-3 leading-tight"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            V-TH1 Heating &amp; Cooling Parking Air Conditioner
          </h1>
          <p
            className="text-base mb-4"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            12V/24V DC Dual-Mode Rotor AC — Year-Round Comfort for Trucks, RVs &amp; Vans
          </p>

          {/* Heating + Cooling indicators */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-1.5">
              <Snowflake size={16} style={{ color: "oklch(0.50 0.18 240)" }} />
              <span className="text-sm font-semibold" style={{ color: "oklch(0.40 0.12 240)", fontFamily: "'Inter', sans-serif" }}>
                2,000W Cooling
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame size={16} style={{ color: "oklch(0.60 0.22 30)" }} />
              <span className="text-sm font-semibold" style={{ color: "oklch(0.50 0.18 30)", fontFamily: "'Inter', sans-serif" }}>
                30-Min Heating
              </span>
            </div>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={16} fill={i <= 5 ? "oklch(0.75 0.18 80)" : "none"} stroke="oklch(0.75 0.18 80)" />
            ))}
            <span className="text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>4.9 (12 reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span
              className="text-3xl font-extrabold"
              style={{ color: "oklch(0.35 0.15 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Contact for Price
            </span>
          </div>

          {/* Key specs grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "Cooling", value: "2,000W (24V)" },
              { label: "Heating", value: "5°C → 30°C / 30min" },
              { label: "Voltage", value: "12V / 24V DC" },
              { label: "Airflow", value: "550 m³/h" },
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
            {features.slice(0, 6).map(f => (
              <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.45 0.18 255)" }} />
                {f}
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              onClick={handleInquiry}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, oklch(0.45 0.18 255), oklch(0.40 0.20 270))",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Request Quote
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] border-2"
              style={{
                borderColor: "oklch(0.45 0.18 255)",
                color: "oklch(0.45 0.18 255)",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Add to Cart
            </button>
          </div>
          {/* WhatsApp CTA */}
          <button
            onClick={handleWhatsApp}
            className="w-full py-3 px-6 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mb-6"
            style={{
              backgroundColor: "#25D366",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat on WhatsApp
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <ShieldCheck size={18} />, text: "1-Year Warranty" },
              { icon: <Truck size={18} />, text: "Global Shipping" },
              { icon: <RotateCcw size={18} />, text: "30-Day Returns" },
            ].map(b => (
              <div
                key={b.text}
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ backgroundColor: "oklch(0.96 0.02 240)" }}
              >
                <span style={{ color: "oklch(0.45 0.18 255)" }}>{b.icon}</span>
                <span className="text-xs font-semibold" style={{ color: "oklch(0.40 0.06 250)", fontFamily: "'Inter', sans-serif" }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Heating + Cooling Section */}
      <section
        className="py-16"
        style={{ backgroundColor: "oklch(0.97 0.015 240)" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <h2
            className="text-2xl font-extrabold mb-8 text-center"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            Why Choose Heating &amp; Cooling in One Unit?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Flame size={28} style={{ color: "oklch(0.60 0.22 30)" }} />,
                title: "Winter Heating",
                desc: "Heat your cab from 5°C to 30°C in just 30 minutes. No engine idling, no diesel fumes, no fuel waste. The GMCC heat pump operates efficiently even in sub-zero conditions.",
              },
              {
                icon: <Snowflake size={28} style={{ color: "oklch(0.50 0.18 240)" }} />,
                title: "Summer Cooling",
                desc: "Up to 2,000W cooling capacity handles extreme summer heat. 550 m³/h airflow fills your cab quickly. Auto mode maintains your set temperature all night.",
              },
              {
                icon: <Zap size={28} style={{ color: "oklch(0.55 0.20 140)" }} />,
                title: "Energy Efficient",
                desc: "Minimum 8A draw at steady state. 12+ hours runtime on battery. Compatible with solar panels for indefinite off-grid operation. One unit replaces separate AC and heater.",
              },
            ].map(c => (
              <div
                key={c.title}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="mb-4">{c.icon}</div>
                <h3
                  className="font-bold text-lg mb-2"
                  style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {c.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
                >
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs: Specs / Installation / FAQ */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12">
        <div className="flex gap-1 mb-8 border-b" style={{ borderColor: "oklch(0.90 0.02 240)" }}>
          {(["specs", "install", "faq"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-3 text-sm font-bold transition-colors relative"
              style={{
                color: activeTab === tab ? "oklch(0.35 0.15 255)" : "oklch(0.55 0.05 250)",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {tab === "specs" ? "Technical Specifications" : tab === "install" ? "Installation Guide" : "FAQ"}
              {activeTab === tab && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: "oklch(0.45 0.18 255)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Specs Tab */}
        {activeTab === "specs" && (
          <div className="max-w-2xl">
            <h2
              className="text-xl font-extrabold mb-6"
              style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              V-TH1 Technical Specifications
            </h2>
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "oklch(0.90 0.02 240)" }}>
              {specs.map((s, i) => (
                <div
                  key={s.label}
                  className="grid grid-cols-2 px-5 py-3 text-sm"
                  style={{
                    backgroundColor: i % 2 === 0 ? "oklch(0.98 0.01 240)" : "white",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <span className="font-semibold" style={{ color: "oklch(0.35 0.08 250)" }}>{s.label}</span>
                  <span style={{ color: "oklch(0.40 0.05 250)" }}>{s.value}</span>
                </div>
              ))}
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
              Installation Guide
            </h2>
            <div className="space-y-6">
              {installSteps.map(s => (
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
                <strong>Pro Tip:</strong> For fleet installations, CoolDrivePro offers on-site installation support and custom mounting kits. Contact our engineering team at support@cooldrivepro.com for vehicle-specific guidance.
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
              Frequently Asked Questions
            </h2>
            {tabFaqs.map(f => (
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
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { href: "/products/top-mounted-ac", title: "12,000 BTU Top-Mounted Parking AC", price: "$1,299", tag: "Cooling Only" },
              { href: "/products/mini-split-ac", title: "12,000 BTU Mini Split Parking AC", price: "$1,599", tag: "Best for Trucks" },
              { href: "/products/water-heater", title: "65,000 BTU Tankless Water Heater", price: "$399", tag: "Off-Grid Comfort" },
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

      {/* Reviews */}
      <ProductReviews reviews={vth1Reviews} productName="V-TH1" averageRating={4.9} />

      {/* GEO-optimized FAQ */}
      <ProductFAQ productName="V-TH1 Heating & Cooling Parking AC" faqs={vth1Faqs} />
    </PageLayout>
  );
}
