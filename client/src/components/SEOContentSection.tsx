/**
 * SEOContentSection Component
 * SEO: Dense, natural keyword-rich editorial content
 *   - Primary: "parking air conditioner"
 *   - Secondary: "12V parking AC", "24V parking AC", "no-idle AC"
 *   - LSI: "truck parking cooler", "battery powered AC", "DC air conditioner"
 * Design: Clean white background, editorial layout
 */
import { useEffect, useRef } from "react";

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
                A <strong>parking air conditioner</strong> is the most cost-effective solution for truck drivers, RV owners, and van lifers who need reliable cooling without running their engine. Traditional engine idling costs $6–12 per hour in fuel — a <strong>12V parking air conditioner</strong> eliminates that cost entirely by drawing power from your existing battery bank.
              </p>
              <p>
                Our <strong>parking AC units</strong> are engineered with variable-speed DC scroll compressors that deliver maximum efficiency at 12V or 24V. Unlike conventional RV air conditioners that require 110V shore power, our <strong>no-idle parking air conditioners</strong> work completely off-grid — powered by lithium batteries, solar panels, or your alternator while driving.
              </p>
              <p>
                For semi truck drivers, a <strong>24V parking air conditioner</strong> is essential for complying with anti-idling laws now enforced in over 30 US states. Our truck parking AC units are certified for heavy-duty use and designed to withstand the vibrations and temperature extremes of long-haul trucking.
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
                Choosing the right <strong>parking air conditioner</strong> depends on three key factors: your vehicle type, available battery capacity, and cooling requirements. For most RVs and camper vans, a <strong>10,000 BTU 12V parking AC</strong> provides sufficient cooling. Semi truck cabs with larger sleeping areas benefit from a <strong>12,000 BTU parking air conditioner</strong>.
              </p>
              <p>
                <strong>Voltage compatibility</strong> is critical: light-duty vehicles (RVs, vans, pickup trucks) use 12V systems, while heavy commercial vehicles (semi trucks, buses) typically run on 24V. Our <strong>12V/24V parking air conditioners</strong> cover both applications with the same reliable DC compressor technology.
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
                    { type: "12V Top-Mounted Parking AC", best: "RV, Van, Camper", btu: "10,000" },
                    { type: "12V Mini Split Parking AC", best: "Semi Truck, Large RV", btu: "12,000" },
                    { type: "24V Parking Air Conditioner", best: "Commercial Truck", btu: "10,000–12,000" },
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
          </div>
        </div>
      </div>
    </section>
  );
}
