import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  ChevronRight,
  Compass,
  Home,
  Ruler,
  ShieldCheck,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useSEO } from "@/hooks/useSEO";

const BASE_URL = "https://cooldrivepro.com";

const VEHICLES = [
  {
    id: "semi-truck",
    label: "Semi truck sleeper",
    detail: "Long-haul cab or berth",
    icon: Truck,
  },
  {
    id: "rv",
    label: "RV or motorhome",
    detail: "Roof, house battery, quiet hours",
    icon: Home,
  },
  {
    id: "van",
    label: "Cargo or camper van",
    detail: "Compact roof and conversion fitment",
    icon: Wrench,
  },
  {
    id: "light-truck",
    label: "Pickup or work truck",
    detail: "Smaller cab, cap, or service body",
    icon: Truck,
  },
] as const;

const VOLTAGES = [
  { id: "12v", label: "12V system", detail: "Common in RVs, vans, and pickups" },
  { id: "24v", label: "24V system", detail: "Common in sleeper cabs and fleets" },
  { id: "unknown", label: "Need to confirm", detail: "Collect a battery or vehicle photo first" },
] as const;

const PRIORITIES = [
  { id: "quiet", label: "Quiet overnight rest", detail: "Cab or berth comfort comes first", icon: ShieldCheck },
  { id: "rooftop", label: "Straightforward rooftop install", detail: "A repeatable all-in-one format", icon: Ruler },
  { id: "compact", label: "Compact vehicle footprint", detail: "Roof space and vehicle size are limited", icon: Compass },
  { id: "all-season", label: "Cooling plus heating", detail: "Mixed or cold-weather routes matter", icon: BatteryCharging },
] as const;

const PRODUCTS = {
  "nano-max": {
    name: "Nano Max",
    format: "Compact rooftop path",
    href: "/products/nano-max/",
    image: "/images/products/nano-max-01.webp",
    alt: "CoolDrivePro Nano Max parking air conditioner",
    summary: "A compact starting point for pickups, small work vehicles, campers, and van conversions with limited available space.",
  },
  "top-mounted-ac": {
    name: "VS02 PRO",
    format: "Top-mounted rooftop path",
    href: "/products/top-mounted-ac/",
    image: "/images/products/vs02pro/vs02pro-01-hero.webp",
    alt: "CoolDrivePro VS02 PRO top-mounted parking air conditioner",
    summary: "A broad rooftop choice for trucks, RVs, vans, and repeatable mixed-vehicle installations.",
  },
  "mini-split-ac": {
    name: "VX3000SP",
    format: "Mini split path",
    href: "/products/mini-split-ac/",
    image: "/images/products/vx3000-mini-split.webp",
    alt: "CoolDrivePro VX3000SP mini split parking air conditioner",
    summary: "A strong path when sleeper-cab or premium-build quietness is the central requirement.",
  },
  "heating-cooling-ac": {
    name: "V-TH1",
    format: "Heating and cooling path",
    href: "/products/heating-cooling-ac/",
    image: "/images/products/vth1-outdoor-top.webp",
    alt: "CoolDrivePro V-TH1 heating and cooling parking air conditioner",
    summary: "A dual-mode option for buyers whose routes or seasons require both cooling and heating planning.",
  },
} as const;

type VehicleId = (typeof VEHICLES)[number]["id"];
type VoltageId = (typeof VOLTAGES)[number]["id"];
type PriorityId = (typeof PRIORITIES)[number]["id"];
type ProductId = keyof typeof PRODUCTS;

function queryChoice<T extends string>(
  parameter: string,
  choices: readonly { readonly id: T }[],
): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = new URLSearchParams(window.location.search).get(parameter);
  return choices.some((choice) => choice.id === value) ? value as T : null;
}

const PRODUCT_RANKING: Record<VehicleId, Record<PriorityId, ProductId[]>> = {
  "semi-truck": {
    quiet: ["mini-split-ac", "top-mounted-ac", "heating-cooling-ac"],
    rooftop: ["top-mounted-ac", "heating-cooling-ac", "mini-split-ac"],
    compact: ["top-mounted-ac", "mini-split-ac", "heating-cooling-ac"],
    "all-season": ["heating-cooling-ac", "top-mounted-ac", "mini-split-ac"],
  },
  rv: {
    quiet: ["mini-split-ac", "top-mounted-ac", "nano-max"],
    rooftop: ["top-mounted-ac", "nano-max", "mini-split-ac"],
    compact: ["nano-max", "top-mounted-ac", "mini-split-ac"],
    "all-season": ["heating-cooling-ac", "top-mounted-ac", "nano-max"],
  },
  van: {
    quiet: ["mini-split-ac", "nano-max", "top-mounted-ac"],
    rooftop: ["top-mounted-ac", "nano-max", "mini-split-ac"],
    compact: ["nano-max", "top-mounted-ac", "mini-split-ac"],
    "all-season": ["heating-cooling-ac", "nano-max", "top-mounted-ac"],
  },
  "light-truck": {
    quiet: ["nano-max", "mini-split-ac", "top-mounted-ac"],
    rooftop: ["top-mounted-ac", "nano-max", "heating-cooling-ac"],
    compact: ["nano-max", "top-mounted-ac", "mini-split-ac"],
    "all-season": ["heating-cooling-ac", "nano-max", "top-mounted-ac"],
  },
};

function ChoiceButton({
  active,
  icon: Icon,
  label,
  detail,
  onClick,
}: {
  active: boolean;
  icon?: LucideIcon;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="min-h-[92px] border p-4 text-left transition-colors"
      style={{
        borderRadius: "8px",
        borderColor: active ? "oklch(0.45 0.18 255)" : "rgba(41, 88, 164, 0.16)",
        backgroundColor: active ? "oklch(0.95 0.035 255)" : "white",
        boxShadow: active ? "inset 0 0 0 1px oklch(0.45 0.18 255)" : "none",
      }}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center" style={{ borderRadius: "8px", backgroundColor: active ? "oklch(0.87 0.08 255)" : "oklch(0.96 0.02 240)" }}>
            <Icon size={17} style={{ color: "oklch(0.40 0.17 255)" }} />
          </span>
        ) : null}
        <span>
          <span className="block text-sm font-extrabold" style={{ color: "oklch(0.24 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            {label}
          </span>
          <span className="mt-1 block text-xs leading-relaxed" style={{ color: "oklch(0.46 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            {detail}
          </span>
        </span>
      </div>
    </button>
  );
}

function ChoiceSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b py-7 last:border-b-0" style={{ borderColor: "rgba(41, 88, 164, 0.12)" }}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center text-xs font-extrabold text-white" style={{ borderRadius: "8px", backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
          {number}
        </span>
        <h2 className="text-lg font-extrabold" style={{ color: "oklch(0.24 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function ParkingAcFitmentPlanner() {
  const [vehicle, setVehicle] = useState<VehicleId | null>(() => queryChoice("vehicle", VEHICLES));
  const [voltage, setVoltage] = useState<VoltageId | null>(() => queryChoice("voltage", VOLTAGES));
  const [priority, setPriority] = useState<PriorityId | null>(() => queryChoice("priority", PRIORITIES));
  const rankedProductIds: ProductId[] = vehicle && voltage && priority
    ? PRODUCT_RANKING[vehicle][priority]
    : [];
  const primaryProductId = rankedProductIds[0];
  const primaryProduct = primaryProductId ? PRODUCTS[primaryProductId] : null;
  const vehicleLabel = VEHICLES.find((option) => option.id === vehicle)?.label;
  const voltageLabel = VOLTAGES.find((option) => option.id === voltage)?.label;
  const priorityLabel = PRIORITIES.find((option) => option.id === priority)?.label;

  useSEO({
    title: "Parking AC Fitment Planner | Find the Right 12V/24V Product Path - CoolDrivePro",
    description: "Select your vehicle and operating goal for a CoolDrivePro parking AC product path, then record the 12V/24V system for final wiring and battery fitment confirmation.",
    canonical: `${BASE_URL}/tools/parking-ac-fitment-planner/`,
    ogImage: `${BASE_URL}/images/scenes/ac-scene-van-rooftop.jpg`,
    alternateLanguages: ["en"],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": `${BASE_URL}/tools/parking-ac-fitment-planner/#webapplication`,
      name: "CoolDrivePro Parking AC Fitment Planner",
      url: `${BASE_URL}/tools/parking-ac-fitment-planner/`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "An interactive selector for CoolDrivePro parking air conditioner product paths using vehicle type, voltage, installation preference, and operating goal.",
    },
  });

  return (
    <PageLayout>
      <nav className="mx-auto flex max-w-[1280px] items-center gap-1.5 px-4 py-3 text-sm lg:px-8" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <Link href="/vehicle-compatibility/" className="hover:underline">Compatibility</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>Fitment Planner</span>
      </nav>

      <section className="border-y" style={{ borderColor: "rgba(41, 88, 164, 0.12)", backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-9 px-4 py-10 lg:grid-cols-[1fr_0.8fr] lg:px-8 lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ borderRadius: "8px", backgroundColor: "white", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
              <Compass size={15} />
              Product matching tool
            </span>
            <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl" style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
              Find the Right Parking AC Path Before You Request a Quote
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
              Start with the vehicle, voltage, installation format, and operating goal. The result is a practical product shortlist to verify with roof photos and battery details.
            </p>
            <div className="mt-7 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: "Vehicle", value: "Fit" },
                { label: "Electrical", value: "12V / 24V" },
                { label: "Next step", value: "Confirm" },
              ].map((item) => (
                <div key={item.label} className="border bg-white px-4 py-3" style={{ borderRadius: "8px", borderColor: "rgba(41, 88, 164, 0.12)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Montserrat', sans-serif" }}>{item.label}</p>
                  <p className="mt-1 text-sm font-extrabold" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden border bg-white shadow-sm" style={{ borderRadius: "8px", borderColor: "rgba(41, 88, 164, 0.12)" }}>
            <img
              src="/images/scenes/ac-scene-van-rooftop.jpg"
              alt="Rooftop parking air conditioner installed on a commercial van"
              width="1200"
              height="900"
              className="h-full min-h-[300px] w-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-4 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div className="border bg-white px-5 sm:px-7" style={{ borderRadius: "8px", borderColor: "rgba(41, 88, 164, 0.14)" }}>
            <ChoiceSection number="1" title="Choose the vehicle">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {VEHICLES.map((option) => (
                  <ChoiceButton key={option.id} active={vehicle === option.id} icon={option.icon} label={option.label} detail={option.detail} onClick={() => setVehicle(option.id)} />
                ))}
              </div>
            </ChoiceSection>

            <ChoiceSection number="2" title="Confirm the electrical system">
              <p className="mb-4 text-sm leading-relaxed" style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                Every product path shown here supports 12V / 24V DC. This detail travels with your fitment request so wiring and battery setup can be confirmed.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {VOLTAGES.map((option) => (
                  <ChoiceButton key={option.id} active={voltage === option.id} icon={Zap} label={option.label} detail={option.detail} onClick={() => setVoltage(option.id)} />
                ))}
              </div>
            </ChoiceSection>

            <ChoiceSection number="3" title="Choose the main operating priority">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PRIORITIES.map((option) => (
                  <ChoiceButton key={option.id} active={priority === option.id} icon={option.icon} label={option.label} detail={option.detail} onClick={() => setPriority(option.id)} />
                ))}
              </div>
            </ChoiceSection>
          </div>

          <aside className="border px-5 py-6 sm:px-7" style={{ borderRadius: "8px", borderColor: "rgba(41, 88, 164, 0.14)", backgroundColor: "oklch(0.97 0.015 240)" }} aria-live="polite">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>Recommended path</p>
            {primaryProduct ? (
              <>
                <h2 className="mt-3 text-2xl font-extrabold" style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{primaryProduct.name}</h2>
                <p className="mt-1 text-sm font-bold" style={{ color: "oklch(0.45 0.16 255)", fontFamily: "'Montserrat', sans-serif" }}>{primaryProduct.format}</p>
                <img src={primaryProduct.image} alt={primaryProduct.alt} width="800" height="600" className="mt-5 aspect-[4/3] w-full object-cover" style={{ borderRadius: "8px" }} loading="lazy" decoding="async" />
                <p className="mt-5 text-sm leading-relaxed" style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{primaryProduct.summary}</p>
                <div className="mt-5 border-y py-4" style={{ borderColor: "rgba(41, 88, 164, 0.12)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Montserrat', sans-serif" }}>Fitment record</p>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "oklch(0.32 0.07 250)", fontFamily: "'Inter', sans-serif" }}>
                    {vehicleLabel} · {voltageLabel} · {priorityLabel}
                  </p>
                </div>
                <p className="mt-5 flex gap-2 text-sm leading-relaxed" style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: "oklch(0.52 0.15 150)" }} />
                  Confirm roof space, battery architecture, cable route, and service access before placing an order.
                </p>
                <div className="mt-6 grid gap-3">
                  <Link href={primaryProduct.href} className="inline-flex min-h-11 items-center justify-center gap-2 px-5 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ borderRadius: "8px", backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
                    View {primaryProduct.name}
                    <ArrowRight size={16} />
                  </Link>
                  <Link href={`/contact/?intent=fitment-planner&vehicle=${vehicle}&voltage=${voltage}&priority=${priority}&product=${encodeURIComponent(primaryProduct.name)}`} className="inline-flex min-h-11 items-center justify-center gap-2 border px-5 text-sm font-bold transition-colors hover:bg-white" style={{ borderRadius: "8px", borderColor: "oklch(0.45 0.18 255)", color: "oklch(0.40 0.17 255)", fontFamily: "'Montserrat', sans-serif" }}>
                    Request fitment confirmation
                    <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="mt-7">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Montserrat', sans-serif" }}>Also consider</p>
                  <div className="mt-3 space-y-2">
                    {rankedProductIds.slice(1).map((productId) => (
                      <Link key={productId} href={PRODUCTS[productId].href} className="flex items-center justify-between gap-3 border bg-white px-3 py-3 text-sm font-bold hover:border-[oklch(0.45_0.18_255)]" style={{ borderRadius: "8px", borderColor: "rgba(41, 88, 164, 0.14)", color: "oklch(0.30 0.09 250)", fontFamily: "'Montserrat', sans-serif" }}>
                        <span>{PRODUCTS[productId].name}</span>
                        <ArrowRight size={15} />
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 border bg-white p-5" style={{ borderRadius: "8px", borderColor: "rgba(41, 88, 164, 0.12)" }}>
                <Compass size={24} style={{ color: "oklch(0.45 0.18 255)" }} />
                <h2 className="mt-4 text-xl font-extrabold" style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>Build a focused shortlist</h2>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                  Select one option in each group. The planner will narrow the product path, then leave the final roof and battery check to a real fitment review.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="border-y py-12 lg:py-16" style={{ borderColor: "rgba(41, 88, 164, 0.12)", backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>What to prepare</p>
          <h2 className="mt-3 max-w-3xl text-2xl font-extrabold sm:text-3xl" style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>A product match becomes a fitment answer with four real-world details.</h2>
          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { title: "Vehicle details", body: "Vehicle type, cab or living-space use, and intended parked-cooling routine.", icon: Truck },
              { title: "Electrical details", body: "12V or 24V architecture, battery type, and auxiliary battery information.", icon: Zap },
              { title: "Mounting details", body: "Roof photos, dimensions, obstructions, and service-access constraints.", icon: Ruler },
              { title: "Operating details", body: "Sleep comfort, quiet hours, fleet standardization, or mixed-season use.", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="border bg-white p-5" style={{ borderRadius: "8px", borderColor: "rgba(41, 88, 164, 0.12)" }}>
                  <Icon size={21} style={{ color: "oklch(0.45 0.18 255)" }} />
                  <h3 className="mt-4 text-base font-extrabold" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}