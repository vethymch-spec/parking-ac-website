/**
 * SEOContentSection Component
 * SEO: Dense, natural keyword-rich editorial content
 *   - Primary: "parking air conditioner"
 *   - Secondary: "12V parking AC", "24V parking AC", "no-idle AC"
 *   - LSI: "truck parking cooler", "battery powered AC", "DC air conditioner"
 * Design: Clean white background, editorial layout
 */
import { useEffect, useRef } from "react";
import { Link } from "wouter";

const priorityGuides = [
  {
    href: "/solutions/truck-ac/",
    title: "Truck Air Conditioner and Truck AC",
    body: "Compare truck AC units for semi trucks, pickups, truck caps, truck campers, bed workspaces, and no-idle cab cooling.",
  },
  {
    href: "/solutions/12v-air-conditioner/",
    title: "12V Air Conditioner and 12V AC Unit",
    body: "Route broad 12 volt air conditioner, 12V DC AC, battery-powered AC, rooftop, mini split, and portable-cooler searches.",
  },
  {
    href: "/solutions/12v-rv-air-conditioner/",
    title: "12V RV Air Conditioner",
    body: "Battery-powered RV, camper, caravan, motorhome, rooftop, and off-grid cooling guidance.",
  },
  {
    href: "/solutions/12v-air-conditioner-for-van/",
    title: "12V Air Conditioner for Van",
    body: "Compact DC cooling for camper vans, cargo vans, service vans, roof-space constraints, and house-battery runtime.",
  },
  {
    href: "/solutions/portable-ac-for-truck/",
    title: "Portable AC for Truck",
    body: "Compare portable AC for truck and semi truck searches with mounted 12V/24V compressor-based parking AC systems.",
  },
  {
    href: "/solutions/12v-rooftop-air-conditioner/",
    title: "12V Rooftop Air Conditioner",
    body: "Roof-mounted DC AC planning for RVs, trucks, vans, campers, roof openings, battery runtime, and fitment checks.",
  },
];

export default function SEOContentSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.classList.add("visible");
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="w-full py-16 lg:py-20 bg-white"
      aria-label="About Parking Air Conditioners"
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div
          ref={ref}
          className="fade-in-up grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start"
        >
          {/* Left Column */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Why Choose a Parking Air Conditioner
            </p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold mb-5 leading-tight"
              style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              The Smarter Way to Stay Cool Without Idling
            </h2>
            <div
              className="space-y-4 text-sm leading-relaxed"
              style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
            >
              <p>
                A <strong>truck AC</strong> or <strong>parking air conditioner</strong> is a cost-effective solution for truck drivers, RV owners, and van lifers who need reliable cooling without running their engine. Traditional engine idling costs $6–12 per hour in fuel — a <strong>12 volt air conditioner for trucks</strong> can draw power from the existing battery bank instead.
              </p>
              <p>
                Our <strong>truck air conditioner</strong> systems are engineered with variable-speed DC compressors that deliver efficient cooling at 12V or 24V. Unlike conventional RV air conditioners that require 110V shore power, our <strong>no-idle parking air conditioners</strong> work off-grid — powered by lithium batteries, solar panels, or your alternator while driving.
              </p>
              <p>
                For semi truck drivers, a <strong>semi truck air conditioner</strong> or <strong>24V parking air conditioner</strong> supports anti-idling goals at truck stops and rest areas. For pickups, truck campers, truck caps, and truck bed workspaces, a compact 12V system is usually a better long-term answer than a hose-style <strong>portable AC for truck</strong> use.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Parking AC Buying Guide
            </p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold mb-5 leading-tight"
              style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              How to Choose the Right Parking Air Conditioner
            </h2>
            <div
              className="space-y-4 text-sm leading-relaxed"
              style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
            >
              <p>
                Choosing the right <strong>AC for truck</strong> use depends on three key factors: vehicle type, available battery capacity, and cooling requirements. For most RVs, truck campers, caps, and compact vans, a <strong>12V air conditioner</strong> or <strong>12V AC unit</strong> should be selected by cabin size, roof fit, and runtime. Semi truck cabs with larger sleeping areas benefit from a <strong>12,000 BTU semi truck AC unit</strong>.
              </p>
              <p>
                <strong>Voltage compatibility</strong> is critical: light-duty vehicles (RVs, vans, pickup trucks, truck caps, and many truck bed AC unit projects) use 12V systems, while heavy commercial vehicles (semi trucks, buses) typically run on 24V. Our <strong>12V/24V parking air conditioners</strong> cover both applications with reliable DC compressor technology.
              </p>
              <p>
                Battery capacity determines runtime. For overnight use, pair your <strong>parking AC</strong> with a 400–600Ah lithium iron phosphate (LiFePO4) battery bank. Adding 400–800W of rooftop solar panels enables daytime operation at zero fuel cost — making your parking air conditioner system completely self-sufficient.
              </p>
            </div>

            {/* Keyword-rich comparison table */}
            <div className="mt-6 rounded-xl overflow-hidden border" style={{ borderColor: "oklch(0.88 0.04 240)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "oklch(0.28 0.10 248)" }}>
                    <th
                      className="text-left px-4 py-3 text-white font-semibold"
                      style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem" }}
                    >
                      Parking AC Type
                    </th>
                    <th
                      className="text-left px-4 py-3 text-white font-semibold"
                      style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem" }}
                    >
                      Best For
                    </th>
                    <th
                      className="text-left px-4 py-3 text-white font-semibold"
                      style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem" }}
                    >
                      BTU
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: "12V Rooftop Air Conditioner", best: "RV, Van, Camper", btu: "Up to 12,000" },
                    { type: "12V/24V Mini Split Parking AC", best: "Semi Truck, Large RV", btu: "12,000" },
                    { type: "24V Truck Air Conditioner", best: "Commercial Truck", btu: "10,000-12,000" },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        backgroundColor: i % 2 === 0 ? "white" : "oklch(0.97 0.015 240)",
                        borderTop: "1px solid oklch(0.92 0.03 240)",
                      }}
                    >
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: "oklch(0.35 0.10 250)", fontFamily: "'Inter', sans-serif" }}
                      >
                        {row.type}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}
                      >
                        {row.best}
                      </td>
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{ color: "oklch(0.40 0.18 255)", fontFamily: "'Inter', sans-serif" }}
                      >
                        {row.btu}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-3">
              {priorityGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group block rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <h3 className="text-sm font-extrabold text-blue-800 group-hover:underline">
                    {guide.title}
                  </h3>
                  <p className="mt-1 font-sans text-xs leading-relaxed text-slate-600">
                    {guide.body}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
