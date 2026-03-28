/**
 * Feature Detail Page
 * Handles all 6 "Learn More" feature links
 */
import { Link, useParams } from "wouter";
import { ChevronRight, Check } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const featureData: Record<string, {
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  intro: string;
  sections: { heading: string; body: string; bullets?: string[] }[];
}> = {
  power: {
    badge: "Power Source",
    title: "12V DC Battery-Powered Parking AC",
    subtitle: "No Engine. No Generator. Pure DC Cooling.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-rv-outdoor-3S7bLnKiixmod8iB5Fjvih.webp",
    imageAlt: "12V DC battery-powered parking air conditioner on semi truck",
    intro: "CoolDrivePro parking air conditioners run directly from your vehicle's 12V or 24V DC battery system — no engine idling, no generator, no shore power required.",
    sections: [
      {
        heading: "How 12V DC Cooling Works",
        body: "A DC scroll compressor converts electrical energy from your battery into mechanical work, circulating refrigerant to absorb heat from inside the cab and reject it outside. Unlike AC compressors that require 110V power conversion, DC compressors run directly from battery voltage — eliminating conversion losses and improving efficiency by 20–30%.",
      },
      {
        heading: "Compatible Power Sources",
        body: "Our parking ACs work with any 12V or 24V DC power source:",
        bullets: [
          "Lithium iron phosphate (LiFePO4) battery banks — recommended",
          "AGM or gel lead-acid batteries",
          "Vehicle alternator (while driving)",
          "Solar panels via MPPT charge controller",
          "Shore power via DC converter",
        ],
      },
      {
        heading: "Battery Runtime Guide",
        body: "Runtime depends on battery capacity and ambient temperature. Typical performance with a 12V LiFePO4 battery:",
        bullets: [
          "100Ah battery → 3–4 hours at 95°F ambient",
          "200Ah battery → 6–8 hours at 95°F ambient",
          "400Ah battery → 12–16 hours at 95°F ambient",
          "Add 400W solar → unlimited daytime operation",
        ],
      },
    ],
  },
  efficiency: {
    badge: "Energy Efficiency",
    title: "High-Efficiency No-Idle Cooling & Heating",
    subtitle: "COP ≥2.5 DC Inverter Technology",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/mountain-landscape_00525f8e.webp",
    imageAlt: "Energy efficient parking air conditioner for RV camping",
    intro: "Our DC inverter compressor technology delivers industry-leading efficiency, maximizing cooling output per amp-hour of battery consumed.",
    sections: [
      {
        heading: "DC Inverter vs. Fixed-Speed Compressors",
        body: "Fixed-speed compressors run at 100% capacity or off — like a light switch. DC inverter compressors modulate speed continuously, running at exactly the capacity needed to maintain your set temperature. This reduces energy consumption by 30–40% compared to fixed-speed designs.",
      },
      {
        heading: "COP: The Efficiency Metric",
        body: "Coefficient of Performance (COP) measures how much cooling energy is delivered per unit of electrical energy consumed. Our parking ACs achieve COP ≥2.5, meaning for every 1 watt of electricity, 2.5 watts of heat are removed. This is significantly higher than traditional RV AC units (COP 1.8–2.2).",
      },
      {
        heading: "Heating Efficiency",
        body: "The Top-Mounted Parking AC includes a heat pump function with COP ≥2.0 in heating mode. This means 4,500 BTU of heating from just 2,250 BTU of electrical energy — far more efficient than resistive electric heaters.",
      },
    ],
  },
  installation: {
    badge: "Easy Installation",
    title: "Simple Parking AC Installation",
    subtitle: "No HVAC Certification Required",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/feature-installation-3ozyGKpamMMmm4bwD2kaii.webp",
    imageAlt: "Installing parking air conditioner on RV roof",
    intro: "Every CoolDrivePro parking AC ships with everything needed for a complete installation. Most customers complete installation in 2–4 hours with basic hand tools.",
    sections: [
      {
        heading: "What's Included",
        body: "Complete installation kit contents:",
        bullets: [
          "Exterior unit with pre-charged refrigerant lines",
          "Interior ceiling cassette",
          "Foam roof gasket seal",
          "Mounting hardware (bolts, washers, nuts)",
          "12V/24V power cable (10 feet)",
          "30A inline fuse and holder",
          "Digital thermostat with remote control",
          "Step-by-step installation manual",
        ],
      },
      {
        heading: "Tools Required",
        body: "Basic hand tools are all you need:",
        bullets: [
          "Drill with 1/2\" bit",
          "Jigsaw or reciprocating saw (for roof opening)",
          "Screwdriver set",
          "Wire stripper and crimping tool",
          "Torque wrench (25 Nm)",
          "Sealant/caulk gun",
        ],
      },
      {
        heading: "Professional Installation Available",
        body: "If you prefer professional installation, our network of certified installers is available nationwide. Contact our support team for a referral to an installer in your area. Professional installation typically costs $200–$400 depending on vehicle type.",
      },
    ],
  },
  battery: {
    badge: "Battery Protection",
    title: "Smart Battery Protection for Parking AC",
    subtitle: "Multi-Level Electrical Safety System",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/water-heater_e1e95553.webp",
    imageAlt: "Smart battery protection system for parking air conditioner",
    intro: "CoolDrivePro parking ACs include a sophisticated multi-level battery protection system that prevents deep discharge and ensures reliable engine starting after a full night of cooling.",
    sections: [
      {
        heading: "Undervoltage Protection",
        body: "The most critical protection feature. When battery voltage drops to the cutoff threshold, the unit automatically shuts down — preserving enough charge to start your engine. Default cutoff voltages: 11.0V (12V systems), 22.0V (24V systems). Adjustable from 10.5V–11.5V to suit different battery types.",
      },
      {
        heading: "Overcurrent Protection",
        body: "A 30A automotive fuse protects the wiring and unit from short circuits. The control board also monitors current draw and will shut down if current exceeds safe limits, preventing wiring damage.",
      },
      {
        heading: "Thermal Protection",
        body: "Compressor temperature sensors monitor operating temperature. If the compressor overheats due to restricted airflow or extreme ambient temperatures, the unit enters a protection mode and reduces capacity until temperatures normalize.",
      },
      {
        heading: "Voltage Monitoring Display",
        body: "The digital thermostat displays real-time battery voltage, allowing you to monitor battery state of charge throughout the night. Set a voltage alarm to alert you before the battery reaches the cutoff threshold.",
      },
    ],
  },
  durability: {
    badge: "Durability",
    title: "Parking AC Built for Extreme Climates",
    subtitle: "Tested from -28°C to +50°C",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/truck-parking_20a5034a.webp",
    imageAlt: "Durable parking air conditioner for extreme climate conditions",
    intro: "CoolDrivePro parking air conditioners are engineered for the harshest conditions on the road — from desert truck stops to mountain campgrounds.",
    sections: [
      {
        heading: "Temperature Range",
        body: "Our parking ACs are tested and certified to operate in ambient temperatures from -28°C (-18°F) to +50°C (122°F). This covers every climate zone in North America, from Alaska winters to Death Valley summers.",
      },
      {
        heading: "Vibration Resistance",
        body: "All components are mounted with vibration-dampening hardware to withstand the constant vibration of highway driving. The compressor uses flexible refrigerant connections that absorb vibration without fatigue cracking. Tested to SAE J1455 vibration standards for heavy truck applications.",
      },
      {
        heading: "IP54 Weather Protection",
        body: "The exterior unit is rated IP54 — protected against dust ingress and water splashing from any direction. This covers rain, road spray, and car wash exposure. The interior unit is IP30 rated for indoor use.",
      },
      {
        heading: "Corrosion Resistance",
        body: "All exterior hardware uses 316 stainless steel or zinc-plated fasteners. The condenser coil is coated with a hydrophilic anti-corrosion coating that resists salt air, road salt, and chemical exposure.",
      },
    ],
  },
  noise: {
    badge: "Quiet Operation",
    title: "Whisper-Quiet Parking Air Conditioner",
    subtitle: "≤40 dB — Quieter Than a Library",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/mountain-landscape_00525f8e.webp",
    imageAlt: "Quiet parking air conditioner for peaceful sleep in RV",
    intro: "At ≤40 dB, our Mini Split Parking AC is among the quietest cooling systems available for trucks and RVs — enabling peaceful sleep even in quiet campgrounds.",
    sections: [
      {
        heading: "Noise Comparison",
        body: "To put 40 dB in perspective:",
        bullets: [
          "40 dB — CoolDrivePro Mini Split Parking AC",
          "45 dB — CoolDrivePro Top-Mounted Parking AC",
          "50 dB — Quiet office background noise",
          "55 dB — Normal conversation",
          "65 dB — Traditional RV rooftop AC",
          "75 dB — Diesel engine idling",
        ],
      },
      {
        heading: "Brushless Fan Motor Technology",
        body: "The key to quiet operation is our brushless DC fan motor. Unlike traditional AC fan motors with brushes that create mechanical noise, brushless motors use electronic commutation — eliminating brush noise and reducing vibration by 60%.",
      },
      {
        heading: "Compressor Isolation",
        body: "The DC scroll compressor is mounted on rubber anti-vibration isolators that absorb compressor vibration before it can transmit to the vehicle structure. This prevents the 'hum' that plagues many competing parking AC units.",
      },
      {
        heading: "Campground Compliance",
        body: "Many campgrounds and RV parks have noise ordinances requiring equipment to operate below 50 dB after 10 PM. Our parking ACs comfortably meet this requirement, allowing you to stay cool without disturbing neighbors.",
      },
    ],
  },
};

export default function FeaturePage() {
  const params = useParams<{ id: string }>();
  const feature = featureData[params.id || ""];

  if (!feature) {
    return (
      <PageLayout>
        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-extrabold mb-4" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            Feature Not Found
          </h1>
          <Link href="/" className="text-sm font-semibold" style={{ color: "oklch(0.45 0.18 255)" }}>
            ← Back to Home
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>{feature.badge}</span>
      </nav>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="product-badge" style={{ fontFamily: "'Montserrat', sans-serif" }}>{feature.badge}</span>
          <h1
            className="text-3xl lg:text-4xl font-extrabold mb-3 leading-tight"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {feature.title}
          </h1>
          <p className="text-lg font-medium mb-5" style={{ color: "oklch(0.45 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}>
            {feature.subtitle}
          </p>
          <p className="text-base leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            {feature.intro}
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img
            src={feature.image}
            alt={feature.imageAlt}
            className="w-full h-auto object-cover"
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
        </div>
      </section>

      {/* Content sections */}
      <section className="max-w-[800px] mx-auto px-4 lg:px-8 py-10 space-y-10">
        {feature.sections.map(section => (
          <div key={section.heading}>
            <h2
              className="text-xl font-extrabold mb-4"
              style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {section.heading}
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
              {section.body}
            </p>
            {section.bullets && (
              <ul className="space-y-2 mt-3">
                {section.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2.5 text-sm" style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                    <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.45 0.18 255)" }} />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="py-14" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[800px] mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold mb-4" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            Experience This Feature in Action
          </h2>
          <p className="text-base mb-8" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            All CoolDrivePro parking air conditioners include this feature. Free shipping on all US orders.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/products/top-mounted-ac"
              className="px-8 py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Shop Top-Mounted AC
            </Link>
            <Link
              href="/products/mini-split-ac"
              className="px-8 py-3 rounded-lg font-bold text-sm border-2 transition-all hover:bg-gray-100"
              style={{ borderColor: "oklch(0.45 0.18 255)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Shop Mini Split AC
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
