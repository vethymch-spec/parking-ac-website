/**
 * Products Overview / Catalog Page
 *
 * B2B + DTC oriented parking AC catalog:
 *   - Quick filter by vehicle / use case / install type
 *   - Product cards focused on BTU, voltage, install type, "best for"
 *   - Spec comparison table at the bottom
 *
 * Live at /products/ — included in sitemap and prerender (see scripts/prerender.mjs).
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import PageLayout from "@/components/PageLayout";
import ProductLineSwitcher from "@/components/ProductLineSwitcher";

/* ── Product catalog ─────────────────────────────────────────────────── */

type VehicleTag = "semi" | "light-truck" | "rv" | "van" | "fleet";
type FunctionTag = "cooling" | "heating-cooling";
type InstallTag = "rooftop" | "split" | "compact-rooftop";

interface CatalogItem {
  slug: string;
  model: string;
  name: string;
  tagline: string;
  image: string;
  imageAlt: string;
  btu: string;
  voltage: string;
  install: InstallTag;
  installLabel: string;
  function: FunctionTag;
  noise: string;
  runtime: string;
  vehicles: VehicleTag[];
  bestFor: string;
  isNew?: boolean;
}

const CATALOG: CatalogItem[] = [
  {
    slug: "top-mounted-ac",
    model: "VS02 PRO",
    name: "12,000 BTU Rooftop Parking AC",
    tagline: "No-idle cooling for sleeper cabs, RVs and service vans",
    image: "/images/products/vs02pro-top-mounted.webp",
    imageAlt: "VS02 PRO rooftop parking air conditioner",
    btu: "12,000 BTU",
    voltage: "12V / 24V DC",
    install: "rooftop",
    installLabel: "Rooftop",
    function: "cooling",
    noise: "≤ 45 dB",
    runtime: "8–10 h on 200Ah LFP",
    vehicles: ["semi", "rv", "van", "fleet"],
    bestFor: "Long-haul sleeper cabs and Class 6–8 fleets that need a clean rooftop install.",
  },
  {
    slug: "nano-max",
    model: "Nano Max",
    name: "10,000 BTU Compact Rooftop AC",
    tagline: "Light truck and pickup-friendly footprint with dual-rotor compressor",
    image: "/images/products/nano-max-01.webp",
    imageAlt: "Nano Max compact rooftop parking air conditioner for US light trucks",
    btu: "10,000 BTU",
    voltage: "12V / 24V DC",
    install: "compact-rooftop",
    installLabel: "Compact rooftop",
    function: "cooling",
    noise: "≤ 42 dB",
    runtime: "6–8 h on 100Ah LFP",
    vehicles: ["light-truck", "van", "rv"],
    bestFor: "US Class 3–5 light trucks, work pickups and small RVs where roof space is tight.",
    isNew: true,
  },
  {
    slug: "heating-cooling-ac",
    model: "V-TH1",
    name: "Heating + Cooling Rooftop AC",
    tagline: "Year-round comfort — cools in summer, heats in winter from one rooftop unit",
    image: "/images/products/vth1-outdoor-top.webp",
    imageAlt: "V-TH1 heating and cooling rooftop parking air conditioner",
    btu: "2,000 W cooling",
    voltage: "12V / 24V DC",
    install: "rooftop",
    installLabel: "Rooftop",
    function: "heating-cooling",
    noise: "≤ 45 dB",
    runtime: "Heats cabin in ~30 min",
    vehicles: ["semi", "rv", "fleet"],
    bestFor: "Operators who want one rooftop unit to replace both a parking AC and a bunk heater.",
    isNew: true,
  },
  {
    slug: "mini-split-ac",
    model: "VX3000SP",
    name: "12,000 BTU Mini-Split Parking AC",
    tagline: "Outdoor condenser + indoor head for fleet sleeper cabs",
    image: "/images/products/vx3000-mini-split.webp",
    imageAlt: "VX3000SP 12V/24V mini split parking air conditioner for semi-truck sleeper cab",
    btu: "12,000 BTU",
    voltage: "12V / 24V DC",
    install: "split",
    installLabel: "Mini split",
    function: "cooling",
    noise: "≤ 42 dB indoor",
    runtime: "8–10 h on 200Ah LFP",
    vehicles: ["semi", "fleet"],
    bestFor: "Sleeper cabs that can't sacrifice rooftop space, or fleets standardizing on split installs.",
  },
];

/* ── Filter chips ─────────────────────────────────────────────────────── */

type Filter = "all" | VehicleTag | FunctionTag | InstallTag;

interface FilterChip {
  id: Filter;
  label: string;
  match: (p: CatalogItem) => boolean;
}

const FILTERS: FilterChip[] = [
  { id: "all", label: "All products", match: () => true },
  { id: "semi", label: "Semi-truck sleeper", match: (p) => p.vehicles.includes("semi") },
  { id: "light-truck", label: "Light truck / pickup", match: (p) => p.vehicles.includes("light-truck") },
  { id: "rv", label: "RV & camper", match: (p) => p.vehicles.includes("rv") },
  { id: "van", label: "Service van", match: (p) => p.vehicles.includes("van") },
  { id: "fleet", label: "Fleet rollout", match: (p) => p.vehicles.includes("fleet") },
  { id: "heating-cooling", label: "Heating + cooling", match: (p) => p.function === "heating-cooling" },
  { id: "rooftop", label: "Rooftop install", match: (p) => p.install === "rooftop" || p.install === "compact-rooftop" },
  { id: "split", label: "Split install", match: (p) => p.install === "split" },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function Products() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const chip = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
    return CATALOG.filter(chip.match);
  }, [filter]);

  return (
    <PageLayout>
      <ProductLineSwitcher />

      {/* Hero */}
      <section
        className="border-b border-border"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.97 0.02 250) 0%, oklch(1 0 0) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: "oklch(0.50 0.12 255)" }}
          >
            Parking AC catalog
          </p>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl"
            style={{ color: "oklch(0.20 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            Choose your CoolDrivePro parking AC
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl">
            12V / 24V DC parking air conditioners for semi-truck sleepers, light trucks, RVs,
            service vans and fleets. Filter by vehicle or install type to find the right unit.
          </p>
        </div>
      </section>

      {/* Filter chips */}
      <section className="sticky z-20 bg-white border-b border-border" style={{ top: 64 + 56 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            {FILTERS.map((chip) => {
              const isActive = filter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setFilter(chip.id)}
                  className={[
                    "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold border transition-colors",
                    isActive
                      ? "border-transparent bg-[oklch(0.25_0.10_250)] text-white"
                      : "border-border bg-white text-[oklch(0.25_0.10_250)] hover:bg-secondary",
                  ].join(" ")}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {visible.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            No products match this filter yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <article
                key={p.slug}
                className="group bg-white rounded-2xl border border-border overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <Link href={`/products/${p.slug}/`}>
                  <a className="block relative aspect-[4/3] bg-secondary/30 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.imageAlt}
                      loading="lazy"
                      width="600"
                      height="450"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {p.isNew && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white rounded-full">
                          New
                        </span>
                      )}
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/95 text-[oklch(0.25_0.10_250)] border border-border">
                        {p.installLabel}
                      </span>
                    </div>
                  </a>
                </Link>

                <div className="p-5 flex flex-col flex-1">
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "oklch(0.50 0.12 255)" }}
                  >
                    {p.model}
                  </p>
                  <h2
                    className="text-lg font-bold leading-snug mb-1"
                    style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {p.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">{p.tagline}</p>

                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mb-4">
                    <div>
                      <dt className="text-muted-foreground">Capacity</dt>
                      <dd className="font-semibold text-foreground">{p.btu}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Voltage</dt>
                      <dd className="font-semibold text-foreground">{p.voltage}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Noise</dt>
                      <dd className="font-semibold text-foreground">{p.noise}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Runtime</dt>
                      <dd className="font-semibold text-foreground">{p.runtime}</dd>
                    </div>
                  </dl>

                  <p className="text-sm text-foreground/80 mb-5">
                    <span className="font-semibold">Best for: </span>
                    {p.bestFor}
                  </p>

                  <div className="mt-auto flex items-center gap-2">
                    <Link href={`/products/${p.slug}/`}>
                      <a className="flex-1 inline-flex items-center justify-center rounded-lg bg-[oklch(0.25_0.10_250)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[oklch(0.20_0.10_250)] transition-colors">
                        View specs
                      </a>
                    </Link>
                    <Link href="/contact/?intent=fleet-quote">
                      <a className="flex-1 inline-flex items-center justify-center rounded-lg border border-border text-[oklch(0.25_0.10_250)] text-sm font-semibold px-4 py-2.5 hover:bg-secondary transition-colors">
                        Fleet quote
                      </a>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Comparison table */}
      <section
        className="border-t border-border"
        style={{ background: "oklch(0.98 0.01 250)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: "oklch(0.20 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            Compare the parking AC line
          </h2>
          <p className="text-muted-foreground mb-6">
            Side-by-side spec snapshot. Click a model to see full datasheet, install drawings and FAQs.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-border bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-secondary/40 text-left">
                  <th className="px-4 py-3 font-semibold text-foreground">Model</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Install</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Capacity</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Voltage</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Noise</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Runtime</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Heat?</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Best for</th>
                </tr>
              </thead>
              <tbody>
                {CATALOG.map((p, i) => (
                  <tr
                    key={p.slug}
                    className={i % 2 === 0 ? "bg-white" : "bg-secondary/20"}
                  >
                    <td className="px-4 py-3">
                      <Link href={`/products/${p.slug}/`}>
                        <a className="font-semibold text-[oklch(0.25_0.10_250)] hover:underline">
                          {p.model}
                        </a>
                      </Link>
                    </td>
                    <td className="px-4 py-3">{p.installLabel}</td>
                    <td className="px-4 py-3">{p.btu}</td>
                    <td className="px-4 py-3">{p.voltage}</td>
                    <td className="px-4 py-3">{p.noise}</td>
                    <td className="px-4 py-3">{p.runtime}</td>
                    <td className="px-4 py-3">
                      {p.function === "heating-cooling" ? "Yes" : "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">{p.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-3"
          style={{ color: "oklch(0.20 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
        >
          Not sure which model fits your truck?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Send us your roof opening dimensions, vehicle and use case. Our engineers will
          recommend the right unit and confirm fitment before you commit.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/vehicle-compatibility/">
            <a className="inline-flex items-center justify-center rounded-lg bg-[oklch(0.25_0.10_250)] text-white font-semibold px-5 py-3 hover:bg-[oklch(0.20_0.10_250)] transition-colors">
              Check fitment
            </a>
          </Link>
          <Link href="/contact/?intent=fleet-quote">
            <a className="inline-flex items-center justify-center rounded-lg border border-border text-[oklch(0.25_0.10_250)] font-semibold px-5 py-3 hover:bg-secondary transition-colors">
              Request fleet quote
            </a>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
