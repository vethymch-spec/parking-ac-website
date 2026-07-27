import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  BatteryCharging,
  Check,
  ChevronRight,
  CircleGauge,
  ClipboardCheck,
  Download,
  Fan,
  FileText,
  Gauge,
  Image as ImageIcon,
  MessageCircle,
  PackageCheck,
  Play,
  ShieldCheck,
  Snowflake,
  Star,
  ThermometerSun,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import CompactInquiryForm from "@/components/CompactInquiryForm";
import { useSEO } from "@/hooks/useSEO";
import "./DraftProductDetailLab.css";

const productGallery = [
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-01-hero_d84a64e3.webp",
    alt: "CoolDrivePro VS02 PRO top-mounted parking AC hero view",
    label: "Outdoor unit",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-03-top-fans_d671776f.webp",
    alt: "Dual condenser fan view of the VS02 PRO parking AC",
    label: "Dual-fan deck",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-10-indoor-closeup_0a1edaa8.webp",
    alt: "Indoor control panel of the VS02 PRO parking AC",
    label: "Indoor panel",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-11-bottom-mount_eadb393f.webp",
    alt: "Bottom mounting plate and indoor evaporator for the VS02 PRO",
    label: "Mounting base",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-05-rear-cables_39b2daae.webp",
    alt: "Rear cable connection view of the VS02 PRO top-mounted AC",
    label: "Power lead",
  },
];

const proofBadges = [
  { icon: PackageCheck, title: "Factory-direct quote", detail: "Bulk, dealer, fleet and sample order support" },
  { icon: ShieldCheck, title: "Fitment first", detail: "Vehicle, roof space and battery check before invoice" },
  { icon: FileText, title: "Docs ready", detail: "Manual, wiring guide and carton details belong here" },
  { icon: MessageCircle, title: "Human support", detail: "WhatsApp and email support for install questions" },
];

const highlights = [
  { icon: Snowflake, label: "Cooling capacity", value: "Up to 12,000 BTU", note: "Draft spec, verify final test data" },
  { icon: Zap, label: "Power platform", value: "12V / 24V DC", note: "For battery-powered parked comfort" },
  { icon: Fan, label: "Cab comfort", value: "Low-noise airflow", note: "Needs measured sound meter proof" },
  { icon: BatteryCharging, label: "Battery guard", value: "Undervoltage cutoff", note: "Protects against deep discharge" },
];

const runtimeRows = [
  { battery: "12V 200Ah LiFePO4", eco: "4-7 hr", normal: "3-5 hr", turbo: "2-3 hr", use: "Short rest / lunch break" },
  { battery: "12V 400Ah LiFePO4", eco: "8-13 hr", normal: "6-9 hr", turbo: "4-6 hr", use: "Overnight truck or van use" },
  { battery: "24V 200Ah LiFePO4", eco: "8-13 hr", normal: "6-9 hr", turbo: "4-6 hr", use: "Commercial cab platforms" },
  { battery: "12V 630Ah LiFePO4", eco: "13-20 hr", normal: "9-14 hr", turbo: "6-9 hr", use: "RV / camper reserve" },
];

const fitmentChecks = [
  "Confirm roof opening, roof thickness and nearby ribs before ordering.",
  "Confirm battery chemistry, BMS current rating, cable length and fuse location.",
  "Confirm whether the customer needs cooling only or heating and cooling.",
  "Confirm intended market: retail owner, installer, dealer, fleet or OEM project.",
];

const componentCards = [
  { title: "Variable-speed DC compressor", body: "The core message is stable cooling with lower start-up stress. Add close-up factory photos and measured amp curves before launch.", icon: Gauge },
  { title: "Dual condenser fan system", body: "Use this block to explain heat rejection, airflow path and why the roof unit stays efficient in hot parking conditions.", icon: Fan },
  { title: "Copper evaporator and indoor panel", body: "Show the indoor air path, drain design, controls, night mode and serviceable filter access.", icon: CircleGauge },
  { title: "Protected power harness", body: "This is where fuse size, cable gauge, BMS requirement and wiring route should be made impossible to miss.", icon: Zap },
  { title: "Mounting plate and seal kit", body: "Customers need to see every gasket, bracket, screw pack and foam piece before they believe installation is manageable.", icon: Wrench },
  { title: "Remote and control logic", body: "Explain timer, sleep mode, temperature range, fan-only mode and battery protection behavior with real screenshots.", icon: ClipboardCheck },
];

const installSteps = [
  { title: "Measure and mark", body: "Check roof structure, opening size, roof thickness, wiring path and water drainage before cutting or replacing an existing roof vent." },
  { title: "Seal and place rooftop unit", body: "Apply gasket and sealant, align the outdoor unit, then keep enough clearance around condenser airflow zones." },
  { title: "Secure the interior panel", body: "Attach the mounting plate and indoor cassette from below, then confirm the panel sits flush without twisting the roof skin." },
  { title: "Wire to protected DC power", body: "Route the power cable to a correctly fused battery circuit. Confirm BMS current, voltage drop and polarity before startup." },
  { title: "Commission and document", body: "Record start current, cruise current, vent temperature, sound level and owner photos for future review content." },
];

const installationGallery = [
  { title: "Semi truck sleeper roof", need: "Need real exterior install photo", tag: "Priority" },
  { title: "Van roof between solar panels", need: "Need real roof layout photo", tag: "High trust" },
  { title: "RV standard roof opening", need: "Need before/after install photo", tag: "Retail" },
  { title: "Interior panel close-up", need: "Need flush-fit cabin photo", tag: "Installer proof" },
  { title: "Battery and fuse layout", need: "Need safe wiring example", tag: "Support" },
  { title: "Fleet batch installation", need: "Need warehouse or dealer install photo", tag: "B2B" },
];

const specs = [
  ["Model", "VS02 PRO Top-Mounted Parking AC"],
  ["Voltage", "12V / 24V DC"],
  ["Cooling capacity", "Up to 12,000 BTU, final lab sheet needed"],
  ["Recommended battery", "LiFePO4 with suitable BMS current reserve"],
  ["Roof opening", "Standard RV opening target, confirm exact range"],
  ["Noise", "Quiet sleep mode target, measured dB proof needed"],
  ["Protection", "Undervoltage, overvoltage, overload and temperature protection"],
  ["Package", "Rooftop unit, indoor panel, remote, harness, gasket, mounting kit, manual"],
  ["Support", "Fitment check, wiring guidance, dealer order support"],
  ["Warranty", "Use final published warranty terms before launch"],
];

const reviewDrafts = [
  {
    title: "Promaster van install story",
    body: "Replace with a verified owner story that includes vehicle model, battery size, install hours, measured amp draw and real customer photos.",
    meta: "Needs verified van customer",
  },
  {
    title: "Long-haul sleeper cab story",
    body: "Best review would mention overnight runtime, outside temperature, noise level during sleep and whether the driver stopped idling.",
    meta: "Needs truck driver proof",
  },
  {
    title: "Installer note with honest friction",
    body: "A credible review should include one small installation difficulty and how support solved it. Perfect reviews feel less believable.",
    meta: "Needs installer partner",
  },
];

const mediaProofChecklist = [
  ["Installation video", "Roof opening, gasket, mounting plate, wiring route and first startup."],
  ["Cooling test video", "Ambient temperature, vent temperature, cabin pull-down time and fan mode."],
  ["Power draw test", "Clamp meter, battery voltage, eco/normal/turbo current and runtime logic."],
  ["3D animation", "Exploded view, airflow path, condenser heat rejection and sealed roof interface."],
];

const animationScenes = [
  {
    id: "exploded",
    label: "Exploded",
    chapter: "01 / Structure",
    timecode: "00-15 sec",
    title: "Show every part before the buyer asks.",
    detail: "Separate the rooftop shell, dual fans, condenser deck, seal kit and indoor cassette so installers understand what ships in the carton.",
    steps: ["Rooftop shell lifts first", "Fan and condenser deck separate", "Seal kit and indoor cassette align"],
    bullets: ["Outdoor shell", "Dual fan deck", "Indoor cassette", "Seal and gasket kit"],
  },
  {
    id: "airflow",
    label: "Airflow",
    chapter: "02 / Cooling path",
    timecode: "15-30 sec",
    title: "Explain cold air in and heat out.",
    detail: "Animate condenser heat rejection above the roof and cold airflow into the cabin so cooling performance feels mechanical, not magical.",
    steps: ["Cabin return air enters", "Evaporator sends cold air", "Condenser rejects heat above roof"],
    bullets: ["Cabin return air", "Evaporator cooling", "Condenser heat exit", "Quiet indoor airflow"],
  },
  {
    id: "install",
    label: "Install",
    chapter: "03 / Roof sandwich",
    timecode: "30-45 sec",
    title: "Make the roof sandwich visible.",
    detail: "Show how the rooftop unit, gasket, roof skin, mounting plate and indoor panel clamp together around the opening.",
    steps: ["Opening is measured", "Seal compresses evenly", "Indoor panel locks the stack"],
    bullets: ["Roof opening", "Compression seal", "Mounting plate", "Flush indoor panel"],
  },
  {
    id: "wiring",
    label: "Wiring",
    chapter: "04 / Power safety",
    timecode: "45-60 sec",
    title: "Turn wiring into a safety story.",
    detail: "Trace the protected DC circuit from battery to fuse to harness to controller, including voltage protection and BMS requirements.",
    steps: ["Battery bank starts the circuit", "Fuse protects the route", "Controller monitors voltage"],
    bullets: ["Battery bank", "Fuse location", "Power harness", "Undervoltage cutoff"],
  },
];

const animationSceneDurationMs = 15000;

const faqItems = [
  {
    question: "Will this fit my truck, RV or van?",
    answer: "Fit depends on roof opening, roof thickness, available rooftop clearance, interior panel space and power routing. The quote form asks for these details so we can confirm before invoice.",
  },
  {
    question: "How should customers size the battery?",
    answer: "Start with desired runtime, climate, insulation and operating mode. A higher-capacity LiFePO4 bank with a suitable BMS gives better overnight comfort than relying on a small starter battery.",
  },
  {
    question: "What proof is still needed before this page goes live?",
    answer: "Real installation photos, measured amp draw, measured noise, final opening dimensions, final manual PDF, customer reviews and a short install video should be added first.",
  },
  {
    question: "Is this page ready for production?",
    answer: "No. This is a local practice page for building the product-detail structure. It is intentionally mounted only in development mode.",
  },
];

function useDraftRobots() {
  useEffect(() => {
    const existingTag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const originalContent = existingTag?.content;
    const robotsTag = existingTag || document.createElement("meta");

    robotsTag.name = "robots";
    robotsTag.content = "noindex,nofollow,noarchive";
    if (!existingTag) document.head.appendChild(robotsTag);

    return () => {
      if (existingTag && originalContent !== undefined) {
        existingTag.content = originalContent;
        return;
      }
      robotsTag.remove();
    };
  }, []);
}

function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-slate-200 py-12 last:border-b-0">
      <div className="mb-7 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-700">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">{title}</h2>
        {intro ? <p className="mt-3 text-base leading-7 text-slate-600">{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Stars() {
  return (
    <div className="flex items-center gap-1" aria-label="Draft rating placeholder">
      {[1, 2, 3, 4, 5].map((starNumber) => (
        <Star key={starNumber} size={16} fill="oklch(0.78 0.16 80)" stroke="oklch(0.78 0.16 80)" />
      ))}
    </div>
  );
}

function ProductAnimationMockup() {
  const [activeSceneId, setActiveSceneId] = useState(animationScenes[0].id);
  const [isPlaying, setIsPlaying] = useState(true);
  const activeScene = animationScenes.find((scene) => scene.id === activeSceneId) || animationScenes[0];
  const activeSceneIndex = animationScenes.findIndex((scene) => scene.id === activeScene.id);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setTimeout(() => {
      setActiveSceneId((currentSceneId) => {
        const currentIndex = animationScenes.findIndex((scene) => scene.id === currentSceneId);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % animationScenes.length : 0;
        return animationScenes[nextIndex].id;
      });
    }, animationSceneDurationMs);

    return () => window.clearTimeout(timer);
  }, [activeSceneId, isPlaying]);

  const handleSceneSelect = (sceneId: string) => {
    setActiveSceneId(sceneId);
    setIsPlaying(false);
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-slate-950 p-5 text-white sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.28),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.18),transparent_28%)]" />
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-200">3D animation slot</p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-normal">60-second product explanation storyboard</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-bold text-slate-200">{activeScene.timecode}</span>
          <button
            type="button"
            onClick={() => setIsPlaying((currentValue) => !currentValue)}
            className="h-8 rounded-full border border-white/20 px-3 text-xs font-bold text-slate-100 transition hover:bg-white/10"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-4 overflow-hidden rounded-full bg-white/10">
        <div key={isPlaying ? activeScene.id : `${activeScene.id}-paused`} className={`draft-pdp-progress-fill ${isPlaying ? "" : "draft-pdp-progress-paused"}`} />
      </div>

      <div className="relative z-10 mt-5 grid gap-2 rounded-md border border-white/10 bg-white/5 p-1 text-xs font-bold text-slate-200 sm:grid-cols-4">
        {animationScenes.map((scene) => (
          <button
            key={scene.id}
            type="button"
            onClick={() => handleSceneSelect(scene.id)}
            className={`min-h-12 rounded px-3 py-2 text-left transition ${activeScene.id === scene.id ? "bg-white text-slate-950" : "hover:bg-white/10"}`}
          >
            <span className="block text-[0.66rem] uppercase text-current opacity-70">{scene.chapter}</span>
            <span className="block text-sm">{scene.label}</span>
          </button>
        ))}
      </div>

      <div className="relative z-10 mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]">
        <div className={`draft-pdp-animation-stage draft-pdp-scene-${activeScene.id}`}>
          <div className="draft-pdp-stage-header">
            <span>{activeScene.chapter}</span>
            <span>{activeScene.timecode}</span>
          </div>
          <div className="draft-pdp-stage-grid" />
          <div className="draft-pdp-roof-plane" />
          <div className="draft-pdp-roof-opening" />

          <div className="draft-pdp-unit-stack">
            <div className="draft-pdp-rooftop-shell" />
            <div className="draft-pdp-condenser-deck" />
            <div className="draft-pdp-fan-wheel draft-pdp-fan-wheel-left" />
            <div className="draft-pdp-fan-wheel draft-pdp-fan-wheel-right" />
            <div className="draft-pdp-seal-ring" />
            <div className="draft-pdp-indoor-cassette" />
          </div>

          <div className="draft-pdp-battery-pack">
            <span />
            <span />
            <span />
          </div>
          <div className="draft-pdp-fuse-box">Fuse</div>
          <div className="draft-pdp-controller-chip">BMS</div>

          <span className="draft-pdp-cold-air draft-pdp-cold-air-1" />
          <span className="draft-pdp-cold-air draft-pdp-cold-air-2" />
          <span className="draft-pdp-cold-air draft-pdp-cold-air-3" />
          <span className="draft-pdp-heat-air draft-pdp-heat-air-1" />
          <span className="draft-pdp-heat-air draft-pdp-heat-air-2" />
          <span className="draft-pdp-wire-line draft-pdp-wire-line-1" />
          <span className="draft-pdp-wire-line draft-pdp-wire-line-2" />
          <span className="draft-pdp-wire-line draft-pdp-wire-line-3" />

          <div className="draft-pdp-callout draft-pdp-callout-1">Rooftop unit</div>
          <div className="draft-pdp-callout draft-pdp-callout-2">Seal layer</div>
          <div className="draft-pdp-callout draft-pdp-callout-3">Indoor panel</div>
          <div className="draft-pdp-callout draft-pdp-callout-4">Protected DC power</div>

          <div className="draft-pdp-step-strip" aria-label="Animation scene steps">
            {activeScene.steps.map((step, stepIndex) => (
              <div key={step} className="draft-pdp-step-card">
                <span>{String(stepIndex + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Current scene {activeSceneIndex + 1} of {animationScenes.length}</p>
          <h4 className="mt-2 text-xl font-extrabold tracking-normal">{activeScene.title}</h4>
          <p className="mt-3 text-sm leading-6 text-slate-300">{activeScene.detail}</p>
          <div className="mt-5 rounded-md border border-white/10 bg-slate-950/35 p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Shot sequence</p>
            <ol className="mt-3 grid gap-2 text-sm text-slate-200">
              {activeScene.steps.map((step, stepIndex) => (
                <li key={step} className="flex gap-2">
                  <span className="font-bold text-blue-200">{String(stepIndex + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-5 grid gap-2 text-sm text-slate-200">
            {activeScene.bullets.map((bullet) => (
              <div key={bullet} className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2">
                <Check size={15} className="shrink-0 text-emerald-300" />
                {bullet}
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-md bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
            Launch version should use a real CAD render or short rendered clip. This draft defines the storyboard and visual hierarchy.
          </p>
        </div>
      </div>
    </div>
  );
}

function DraftQuotePanel({ voltage, heater }: { voltage: string; heater: string }) {
  const productName = `VS02 PRO rich detail draft - ${voltage} - ${heater}`;

  return (
    <aside className="lg:h-max">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
        <div className="border-b border-slate-200 bg-slate-950 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Quote entrance</p>
          <h2 className="mt-2 text-xl font-extrabold tracking-normal">VS02 PRO Top-Mounted AC</h2>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-200">
            <Stars />
            <span>Review module draft</span>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-slate-200 text-sm">
          <div className="border-r border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Voltage</p>
            <p className="mt-1 font-bold text-slate-950">{voltage}</p>
          </div>
          <div className="p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Mode</p>
            <p className="mt-1 font-bold text-slate-950">{heater}</p>
          </div>
        </div>

        <div className="space-y-3 p-5">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-700">
            <div className="rounded-md bg-slate-100 px-2 py-2">12V/24V</div>
            <div className="rounded-md bg-emerald-50 px-2 py-2 text-emerald-800">No-idle</div>
            <div className="rounded-md bg-amber-50 px-2 py-2 text-amber-800">B2B quote</div>
          </div>

          <CompactInquiryForm
            source="draft_vs02_rich_detail"
            productName={productName}
            title="Get fitment and quote"
            subtitle="Send vehicle type, voltage, battery plan and quantity. We confirm the setup before invoice."
            className="border-0 p-0 shadow-none"
          />

          <a
            href="https://wa.me/8618561534326?text=Hi%2C%20I%20am%20reviewing%20the%20VS02%20PRO%20top-mounted%20parking%20AC%20draft%20page.%20Can%20you%20help%20confirm%20fitment%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <MessageCircle size={16} />
            WhatsApp fitment help
          </a>
        </div>
      </div>
    </aside>
  );
}

export default function DraftProductDetailLab() {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [voltage, setVoltage] = useState("12V");
  const [heater, setHeater] = useState("Cooling only");
  const activeImage = productGallery[activeImageIndex];

  useDraftRobots();
  useSEO({
    title: "Draft Product Detail Lab | CoolDrivePro",
    description: "Local-only draft product detail page for CoolDrivePro rich PDP structure testing.",
    canonical: "http://localhost/drafts/top-mounted-product-detail",
  });

  if (!import.meta.env.DEV) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Draft unavailable</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-slate-950">This product-detail lab is local only.</h1>
          <p className="mt-4 text-slate-600">The draft route is blocked outside the development server.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-white lg:h-[calc(100vh-4rem)] lg:overflow-hidden lg:overscroll-none">
        <div data-draft-pdp-shell className="mx-auto grid h-full max-w-[1480px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8 lg:px-8">
          <div data-draft-pdp-left className="min-w-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
            <div className="border-b border-slate-200 bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm lg:px-0">
                <nav className="flex items-center gap-1.5 text-slate-600" aria-label="Breadcrumb">
                  <Link href="/" className="hover:text-blue-700">Home</Link>
                  <ChevronRight size={14} />
                  <Link href="/products" className="hover:text-blue-700">Products</Link>
                  <ChevronRight size={14} />
                  <span className="font-semibold text-slate-900">Draft PDP Lab</span>
                </nav>
                <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
                  Local draft / noindex / not for launch
                </span>
              </div>
            </div>

            <div className="px-4 py-8 lg:px-0">
            <section className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.7fr)]">
              <div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <div className="relative flex aspect-[4/3] items-center justify-center bg-slate-100 p-6 sm:aspect-[16/11]">
                    <img
                      src={activeImage.src}
                      alt={activeImage.alt}
                      className="h-full w-full object-contain"
                      loading="eager"
                      decoding="async"
                    />
                    <button className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-md bg-slate-950/90 px-3 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-slate-800">
                      <Play size={16} />
                      Install video slot
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 pr-24 sm:grid-cols-5 sm:pr-0">
                  {productGallery.map((image, imageIndex) => (
                    <button
                      key={image.src}
                      onClick={() => setActiveImageIndex(imageIndex)}
                      className={`overflow-hidden rounded-md border bg-white p-1 text-left transition ${activeImageIndex === imageIndex ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-400"}`}
                      aria-label={`View ${image.label}`}
                    >
                      <img src={image.src} alt={image.alt} className="aspect-square w-full rounded object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Rich product detail draft</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-slate-950 sm:text-4xl lg:text-5xl">
                  VS02 PRO Top-Mounted Parking Air Conditioner
                </h1>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  A long-form product page concept for trucks, RVs, vans and dealer buyers, built around fitment proof, power planning, installation confidence and a quote path that never disappears.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {highlights.map(({ icon: Icon, label, value, note }) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <Icon size={20} className="text-blue-700" />
                      <p className="mt-3 text-xs font-semibold uppercase text-slate-500">{label}</p>
                      <p className="mt-1 text-base font-extrabold text-slate-950">{value}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold text-slate-800">
                    Voltage option
                    <select
                      value={voltage}
                      onChange={(event) => setVoltage(event.target.value)}
                      className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option>12V</option>
                      <option>24V</option>
                      <option>12V / 24V undecided</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-slate-800">
                    Climate option
                    <select
                      value={heater}
                      onChange={(event) => setHeater(event.target.value)}
                      className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option>Cooling only</option>
                      <option>Heating and cooling</option>
                      <option>Need recommendation</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>

            <div className="sticky top-16 z-20 mt-8 overflow-x-auto border-y border-slate-200 bg-white/95 py-3 backdrop-blur">
              <div className="flex min-w-max gap-2 text-sm font-bold text-slate-700">
                {[
                  ["overview", "Overview"],
                  ["media", "Media"],
                  ["performance", "Performance"],
                  ["power", "Power"],
                  ["fitment", "Fitment"],
                  ["components", "Components"],
                  ["install", "Install"],
                  ["gallery", "Gallery"],
                  ["specs", "Specs"],
                  ["reviews", "Reviews"],
                  ["faq", "FAQ"],
                ].map(([sectionId, label]) => (
                  <a key={sectionId} href={`#${sectionId}`} className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-blue-700">
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <Section
              id="overview"
              eyebrow="What this page must prove"
              title="Make the customer feel the product is already halfway installed."
              intro="The page should answer performance, power, fitment, installation and support questions before the buyer asks. That is why every block below is built as a proof block, not just a beauty block."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {proofBadges.map(({ icon: Icon, title, detail }) => (
                  <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <Icon size={22} className="text-blue-700" />
                    <h3 className="mt-4 text-base font-extrabold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              id="media"
              eyebrow="Media proof near the main image"
              title="Installation video, test video and 3D animation should sit close to the buying decision."
              intro="A buyer should not have to hunt for proof. These assets belong near the top of the page because they answer the three hardest questions: can I install it, does it actually cool, and what is inside the unit?"
            >
              <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="group relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-lg bg-slate-950 p-5 text-white">
                    <img
                      src={productGallery[3].src}
                      alt="Draft installation video poster for top-mounted parking AC mounting base"
                      className="absolute inset-0 h-full w-full object-cover opacity-35 transition group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg">
                      <Play size={20} fill="currentColor" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Installation video</p>
                      <h3 className="mt-2 text-xl font-extrabold tracking-normal">5-minute install walk-through</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">Show roof prep, gasket, mounting plate, wiring, indoor panel and first startup.</p>
                    </div>
                  </div>

                  <div className="relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-lg border border-blue-100 bg-blue-50 p-5">
                    <div className="absolute right-4 top-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                      <ThermometerSun size={28} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Cooling test video</p>
                      <h3 className="mt-2 max-w-[13rem] text-xl font-extrabold tracking-normal text-slate-950">Real pull-down test, not a slogan</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-700">
                      <div className="rounded-md bg-white p-3 shadow-sm">
                        <p className="text-slate-500">Ambient</p>
                        <p className="mt-1 text-slate-950">Add data</p>
                      </div>
                      <div className="rounded-md bg-white p-3 shadow-sm">
                        <p className="text-slate-500">Vent</p>
                        <p className="mt-1 text-slate-950">Add data</p>
                      </div>
                      <div className="rounded-md bg-white p-3 shadow-sm">
                        <p className="text-slate-500">Amp</p>
                        <p className="mt-1 text-slate-950">Add data</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
                    <h3 className="text-lg font-extrabold text-slate-950">What to collect before launch</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {mediaProofChecklist.map(([title, detail]) => (
                        <div key={title} className="flex gap-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                          <Check size={17} className="mt-1 shrink-0 text-emerald-600" />
                          <div>
                            <p className="font-extrabold text-slate-950">{title}</p>
                            <p className="mt-1 text-slate-600">{detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <ProductAnimationMockup />
              </div>
            </Section>

            <Section
              id="performance"
              eyebrow="Cooling story"
              title="Show comfort with numbers, not adjectives."
              intro="This section is where final launch assets should include vent temperature video, outside temperature, inside temperature, time-to-cool and sound meter footage."
            >
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="rounded-lg bg-slate-950 p-6 text-white lg:col-span-2">
                  <ThermometerSun size={28} className="text-amber-300" />
                  <h3 className="mt-5 text-2xl font-extrabold tracking-normal">From hot parked cabin to controlled airflow.</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                    Replace this draft copy with measured tests: start temperature, target temperature, ambient heat, vehicle insulation and compressor mode. The stronger the numbers, the less the page needs hype.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Vent temp", "Add test video"],
                      ["Sound", "Add dB meter"],
                      ["Amp draw", "Add clamp meter"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-md bg-white/10 p-4">
                        <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
                        <p className="mt-1 text-lg font-extrabold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-6">
                  <h3 className="text-lg font-extrabold text-slate-950">Best proof assets</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                    {[
                      "15-minute cooling test video",
                      "Eco / Normal / Turbo power draw chart",
                      "Inside-cabin night noise clip",
                      "Hot-weather truck stop usage story",
                    ].map((asset) => (
                      <li key={asset} className="flex gap-2">
                        <Check size={16} className="mt-1 shrink-0 text-blue-700" />
                        {asset}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            <Section
              id="power"
              eyebrow="Battery planning"
              title="A runtime table is more persuasive than another slogan."
              intro="Parking AC customers buy confidence. A clear battery table helps them understand what setup is realistic before they request pricing."
            >
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-950 text-white">
                    <tr>
                      {['Battery setup', 'Eco', 'Normal', 'Turbo', 'Best use'].map((heading) => (
                        <th key={heading} className="px-4 py-3 font-bold">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {runtimeRows.map((row, rowIndex) => (
                      <tr key={row.battery} className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-4 py-4 font-bold text-slate-950">{row.battery}</td>
                        <td className="px-4 py-4 text-slate-700">{row.eco}</td>
                        <td className="px-4 py-4 text-slate-700">{row.normal}</td>
                        <td className="px-4 py-4 text-slate-700">{row.turbo}</td>
                        <td className="px-4 py-4 text-slate-700">{row.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                Draft note: replace runtime ranges with verified lab and field data before launch. Runtime depends on battery health, insulation, ambient heat, set temperature and compressor cycling.
              </p>
            </Section>

            <Section
              id="fitment"
              eyebrow="Fitment logic"
              title="Turn uncertainty into a checklist."
              intro="A strong product page does not hide installation complexity. It names the checks and makes the quote form feel useful."
            >
              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <Truck size={28} className="text-blue-700" />
                  <h3 className="mt-4 text-xl font-extrabold text-slate-950">Vehicle fit checklist</h3>
                  <div className="mt-5 space-y-4">
                    {fitmentChecks.map((check) => (
                      <div key={check} className="flex gap-3 text-sm leading-6 text-slate-700">
                        <Check size={17} className="mt-1 shrink-0 text-emerald-600" />
                        {check}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["Semi truck", "Sleeper cab roof, 12V/24V battery architecture, anti-idle route comfort"],
                    ["RV / camper", "Standard roof opening, shore-power alternatives, overnight family comfort"],
                    ["Van conversion", "Solar roof layout, interior panel clearance, quiet sleep mode"],
                    ["Dealer / fleet", "Repeatable install SOP, carton data, spare parts and MOQ conversation"],
                  ].map(([title, body]) => (
                    <div key={title} className="rounded-lg bg-slate-50 p-5">
                      <h3 className="font-extrabold text-slate-950">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section
              id="components"
              eyebrow="Inside the unit"
              title="Component storytelling makes the product feel engineered."
              intro="OutEquipPro does this well: compressor, fan, condenser, evaporator, heater and mounting kit each get their own proof moment. CoolDrivePro should do the same with factory images."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {componentCards.map(({ title, body, icon: Icon }) => (
                  <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <Icon size={24} className="text-blue-700" />
                    <h3 className="mt-4 text-lg font-extrabold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              id="install"
              eyebrow="Install confidence"
              title="Make installation feel finite, not mysterious."
              intro="This should eventually pair a short installation video with a manual PDF, wiring diagram and a downloadable pre-install checklist."
            >
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  {installSteps.map((step, stepIndex) => (
                    <div key={step.title} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-extrabold text-white">
                        {stepIndex + 1}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-950">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <ImageIcon size={26} className="text-slate-700" />
                    <h3 className="mt-4 text-lg font-extrabold text-slate-950">Installation video block</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Add a real 3-5 minute install video: roof prep, gasket, mounting plate, wiring, first startup.</p>
                    <button className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-bold text-white">
                      <Play size={16} />
                      Video placeholder
                    </button>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <Download size={26} className="text-blue-700" />
                    <h3 className="mt-4 text-lg font-extrabold text-slate-950">Manual download</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Final PDF should include dimensions, wiring, torque, gasket, troubleshooting and warranty limits.</p>
                  </div>
                </div>
              </div>
            </Section>

            <Section
              id="gallery"
              eyebrow="Field proof"
              title="The missing piece is real installed-photo depth."
              intro="This draft intentionally marks the photo gaps. Once you collect real installs, this can become the page's highest-trust section."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {installationGallery.map((item) => (
                  <div key={item.title} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 p-6 text-center">
                      <div>
                        <ImageIcon size={32} className="mx-auto text-slate-400" />
                        <p className="mt-3 text-sm font-bold text-slate-500">{item.need}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{item.tag}</span>
                      <h3 className="mt-3 font-extrabold text-slate-950">{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              id="specs"
              eyebrow="Technical table"
              title="A dense specs table is not optional for this category."
              intro="Installers, dealers and fleet buyers need exact numbers. Every uncertain value below should become final verified copy before launch."
            >
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {specs.map(([label, value], specIndex) => (
                      <tr key={label} className={specIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <th className="w-1/3 px-4 py-4 font-bold text-slate-950">{label}</th>
                        <td className="px-4 py-4 leading-6 text-slate-700">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section
              id="reviews"
              eyebrow="Review architecture"
              title="Reviews should read like small case studies."
              intro="Do not launch fake reviews. Use this layout to collect real stories with vehicle, battery, runtime, install difficulty and photos."
            >
              <div className="grid gap-4 lg:grid-cols-3">
                {reviewDrafts.map((review) => (
                  <article key={review.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <Stars />
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">Draft</span>
                    </div>
                    <h3 className="mt-4 text-lg font-extrabold text-slate-950">{review.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{review.body}</p>
                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">{review.meta}</p>
                  </article>
                ))}
              </div>
            </Section>

            <Section id="faq" eyebrow="FAQ" title="Questions that should sit near the bottom of the page.">
              <div className="space-y-3">
                {faqItems.map((item) => (
                  <details key={item.question} className="rounded-lg border border-slate-200 bg-white p-5 open:bg-slate-50">
                    <summary className="cursor-pointer text-base font-extrabold text-slate-950">{item.question}</summary>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </Section>
            </div>
          </div>

          <div data-draft-pdp-right className="px-4 pb-8 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:px-0 lg:py-8">
            <DraftQuotePanel voltage={voltage} heater={heater} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}