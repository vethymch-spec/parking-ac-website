/**
 * B2BTrustStrip — 4 trust anchors directly under the hero.
 * Targets ad-click B2B buyers (fleet managers, owner-operators, dealers) who
 * decide in <30 s whether to fill a quote form. Communicates: warranty,
 * MOQ / fleet pricing, US warehouse / lead time, fleet trust.
 */

type TrustIcon = "shield" | "boxes" | "truck" | "users";

function Icon({ name }: { name: TrustIcon }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "shield" && <><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z" /><path d="m9 12 2 2 4-4" /></>}
      {name === "boxes" && <><path d="m7.5 4.3 9 5.2" /><path d="M21 8.5v7a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4a2 2 0 0 1-1-1.7v-7a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4a2 2 0 0 1 1 1.7Z" /><path d="M3.3 7.5 12 12.5l8.7-5" /><path d="M12 22V12.5" /></>}
      {name === "truck" && <><path d="M10 17h4V5H2v12h3" /><path d="M14 17h1" /><path d="M15 17h4" /><path d="M14 8h4l4 4v5h-3" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></>}
      {name === "users" && <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
    </svg>
  );
}

const items = [
  {
    icon: "shield",
    title: "12-Month Warranty",
    body: "Full unit warranty + lifetime tech support. Replacement parts shipped from US.",
  },
  {
    icon: "boxes",
    title: "MOQ from 1 · Fleet 10+",
    body: "Single-unit retail or volume fleet pricing — we tier discounts at 10, 25, 50+ units.",
  },
  {
    icon: "truck",
    title: "Ships from US Warehouse",
    body: "In-stock units ship same week from Alabama. Lead time on bulk orders: 2–3 weeks.",
  },
  {
    icon: "users",
    title: "Trusted by Fleets & Owner-Operators",
    body: "Used in semi trucks, sleeper cabs, RVs, vans and service vehicles across North America.",
  },
];

export default function B2BTrustStrip() {
  return (
    <section
      aria-label="Why fleets and dealers buy from CoolDrivePro"
      className="bg-white border-y"
      style={{ borderColor: "oklch(0.93 0.02 240)" }}
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map(({ icon, title, body }) => (
            <div key={title} className="flex flex-col items-start gap-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "oklch(0.94 0.06 255)", color: "oklch(0.45 0.18 255)" }}
              >
                <Icon name={icon} />
              </div>
              <h3
                className="text-sm font-extrabold leading-tight"
                style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
