/**
 * APU shared section primitives.
 * Each draft page is composed from these blocks via the config in config.tsx.
 */
import { Link } from "wouter";
import { ArrowRight, Check, CircleDot } from "lucide-react";
import SystemDiagram from "./SystemDiagram";

const COLOR = {
  ink: "oklch(0.25 0.10 250)",
  body: "oklch(0.45 0.05 250)",
  muted: "oklch(0.55 0.05 250)",
  brand: "oklch(0.45 0.18 255)",
  brandDeep: "oklch(0.28 0.10 248)",
  border: "oklch(0.90 0.02 240)",
  surface: "oklch(0.98 0.01 240)",
  tint: "oklch(0.94 0.06 255)",
  accent: "oklch(0.55 0.20 35)",
};

const F = { h: "'Montserrat', sans-serif", b: "'Inter', sans-serif" };

// ─────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────
export interface CTA { label: string; href: string }
export interface HeroBlock {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string }[];
  primaryCta?: CTA;
  secondaryCta?: CTA;
  diagram?: boolean;
  image?: string;
  imageAlt?: string;
}
export function Hero({ eyebrow, title, subtitle, stats, primaryCta, secondaryCta, diagram, image, imageAlt }: HeroBlock) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: COLOR.brandDeep }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(ellipse at 80% 20%, oklch(0.55 0.20 255) 0%, transparent 60%)" }} />
      <div className="relative max-w-[1280px] mx-auto px-4 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 text-white">
          {eyebrow ? <p className="text-xs font-bold uppercase tracking-widest mb-3 text-white/60" style={{ fontFamily: F.h }}>{eyebrow}</p> : null}
          <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-5" style={{ fontFamily: F.h }}>{title}</h1>
          {subtitle ? <p className="text-base lg:text-lg text-white/80 leading-relaxed max-w-xl mb-6" style={{ fontFamily: F.b }}>{subtitle}</p> : null}
          {(primaryCta || secondaryCta) ? (
            <div className="flex flex-wrap gap-3 mt-4">
              {primaryCta ? (
                <Link href={primaryCta.href} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm" style={{ backgroundColor: "white", color: COLOR.brandDeep, fontFamily: F.h }}>
                  {primaryCta.label} <ArrowRight size={16} />
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link href={secondaryCta.href} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm border border-white/30 text-white hover:bg-white/10" style={{ fontFamily: F.h }}>
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          ) : null}
          {stats?.length ? (
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-extrabold text-white" style={{ fontFamily: F.h }}>{s.value}</div>
                  <div className="text-xs text-white/60 mt-0.5" style={{ fontFamily: F.b }}>{s.label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-6">
          {diagram ? (
            <SystemDiagram />
          ) : image ? (
            <img src={image} alt={imageAlt ?? ""} className="w-full h-auto rounded-2xl shadow-xl" loading="eager" />
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Section shell
// ─────────────────────────────────────────────────────────────
export interface SectionShell {
  eyebrow?: string;
  title?: string;
  intro?: string;
  bg?: "white" | "tint" | "dark";
}
function Shell({ eyebrow, title, intro, bg = "white", children }: SectionShell & { children: React.ReactNode }) {
  const styles =
    bg === "tint" ? { backgroundColor: COLOR.surface } :
    bg === "dark" ? { backgroundColor: COLOR.brandDeep } :
    { backgroundColor: "white" };
  const ink = bg === "dark" ? "white" : COLOR.ink;
  const body = bg === "dark" ? "rgba(255,255,255,0.75)" : COLOR.body;
  return (
    <section className="py-14 lg:py-20" style={styles}>
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        {(eyebrow || title || intro) ? (
          <div className="max-w-3xl mb-10">
            {eyebrow ? <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: bg === "dark" ? "rgba(255,255,255,0.6)" : COLOR.brand, fontFamily: F.h }}>{eyebrow}</p> : null}
            {title ? <h2 className="text-2xl lg:text-4xl font-extrabold mb-4" style={{ color: ink, fontFamily: F.h }}>{title}</h2> : null}
            {intro ? <p className="text-base lg:text-lg leading-relaxed" style={{ color: body, fontFamily: F.b }}>{intro}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// PainWall — 4 pain cards
// ─────────────────────────────────────────────────────────────
export interface PainBlock extends SectionShell { items: { title: string; body: string }[] }
export function PainWall({ items, ...shell }: PainBlock) {
  return (
    <Shell bg="tint" {...shell}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((p) => (
          <div key={p.title} className="rounded-2xl border bg-white p-5" style={{ borderColor: COLOR.border }}>
            <div className="text-3xl mb-3" aria-hidden>⚠️</div>
            <h3 className="font-extrabold mb-2" style={{ color: COLOR.ink, fontFamily: F.h }}>{p.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: COLOR.body, fontFamily: F.b }}>{p.body}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// SystemDiagramSection
// ─────────────────────────────────────────────────────────────
export function DiagramSection(props: SectionShell & { caption?: string }) {
  return (
    <Shell {...props}>
      <SystemDiagram caption={props.caption} />
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// How it works in 3 steps
// ─────────────────────────────────────────────────────────────
export interface HowWorksBlock extends SectionShell { steps: { tag: string; title: string; body: string }[] }
export function HowWorks({ steps, ...shell }: HowWorksBlock) {
  return (
    <Shell {...shell}>
      <div className="grid md:grid-cols-3 gap-5">
        {steps.map((s, i) => (
          <div key={s.title} className="relative rounded-2xl border p-6" style={{ borderColor: COLOR.border, backgroundColor: COLOR.surface }}>
            <div className="text-xs font-bold mb-2" style={{ color: COLOR.brand, fontFamily: F.h }}>{s.tag}</div>
            <div className="text-5xl font-black opacity-10 absolute top-3 right-4" style={{ color: COLOR.brand }}>{i + 1}</div>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: COLOR.ink, fontFamily: F.h }}>{s.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: COLOR.body, fontFamily: F.b }}>{s.body}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// Module grid (APU components)
// ─────────────────────────────────────────────────────────────
export interface ModuleGridBlock extends SectionShell { items: { name: string; role: string; spec?: string; href?: string }[] }
export function ModuleGrid({ items, ...shell }: ModuleGridBlock) {
  return (
    <Shell bg="tint" {...shell}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((m) => {
          const inner = (
            <div className="h-full rounded-xl border bg-white p-5 hover:shadow-md transition-all" style={{ borderColor: COLOR.border }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: COLOR.brand, fontFamily: F.h }}>{m.role}</div>
              <h3 className="text-base font-extrabold mb-1.5" style={{ color: COLOR.ink, fontFamily: F.h }}>{m.name}</h3>
              {m.spec ? <p className="text-xs leading-relaxed" style={{ color: COLOR.muted, fontFamily: F.b }}>{m.spec}</p> : null}
              {m.href ? <div className="mt-3 text-xs font-bold inline-flex items-center gap-1" style={{ color: COLOR.brand, fontFamily: F.h }}>View <ArrowRight size={12} /></div> : null}
            </div>
          );
          return m.href ? <Link key={m.name} href={m.href}>{inner}</Link> : <div key={m.name}>{inner}</div>;
        })}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// Solution matrix — 4 kit cards
// ─────────────────────────────────────────────────────────────
export interface SolutionMatrixBlock extends SectionShell {
  kits: { name: string; bestFor: string; modules: string[]; price?: string; runtime?: string; href?: string; highlight?: boolean }[];
}
export function SolutionMatrix({ kits, ...shell }: SolutionMatrixBlock) {
  return (
    <Shell {...shell}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kits.map((k) => (
          <div key={k.name} className="rounded-2xl border p-6 flex flex-col" style={{ borderColor: k.highlight ? COLOR.brand : COLOR.border, backgroundColor: k.highlight ? COLOR.tint : "white", borderWidth: k.highlight ? 2 : 1 }}>
            {k.highlight ? <div className="self-start mb-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: COLOR.brand }}>Most popular</div> : null}
            <h3 className="text-lg font-extrabold mb-1" style={{ color: COLOR.ink, fontFamily: F.h }}>{k.name}</h3>
            <p className="text-xs mb-4" style={{ color: COLOR.muted, fontFamily: F.b }}>{k.bestFor}</p>
            <ul className="space-y-1.5 mb-4 text-sm" style={{ color: COLOR.body, fontFamily: F.b }}>
              {k.modules.map((m) => (
                <li key={m} className="flex items-start gap-2">
                  <Check size={14} className="mt-0.5 flex-none" style={{ color: COLOR.brand }} />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-3 border-t flex items-center justify-between" style={{ borderColor: COLOR.border }}>
              <div className="text-xs" style={{ color: COLOR.muted, fontFamily: F.b }}>
                {k.runtime ? <span>Runtime · {k.runtime}</span> : null}
                {k.price ? <span className="block">From {k.price}</span> : null}
              </div>
              {k.href ? (
                <Link href={k.href} className="text-xs font-bold inline-flex items-center gap-1" style={{ color: COLOR.brand, fontFamily: F.h }}>
                  Details <ArrowRight size={12} />
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// Two-column benefits (drivers vs fleets)
// ─────────────────────────────────────────────────────────────
export interface TwoColBlock extends SectionShell {
  left: { title: string; bullets: string[]; tag?: string };
  right: { title: string; bullets: string[]; tag?: string };
}
export function TwoCol({ left, right, ...shell }: TwoColBlock) {
  const col = (c: TwoColBlock["left"]) => (
    <div className="rounded-2xl border p-6 lg:p-8 bg-white" style={{ borderColor: COLOR.border }}>
      {c.tag ? <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: COLOR.brand, fontFamily: F.h }}>{c.tag}</div> : null}
      <h3 className="text-xl font-extrabold mb-4" style={{ color: COLOR.ink, fontFamily: F.h }}>{c.title}</h3>
      <ul className="space-y-2.5">
        {c.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm" style={{ color: COLOR.body, fontFamily: F.b }}>
            <CircleDot size={14} className="mt-1 flex-none" style={{ color: COLOR.brand }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <Shell bg="tint" {...shell}>
      <div className="grid md:grid-cols-2 gap-6">
        {col(left)}
        {col(right)}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// Tech center grid
// ─────────────────────────────────────────────────────────────
export interface TechCenterBlock extends SectionShell { items: { title: string; body: string }[] }
export function TechCenter({ items, ...shell }: TechCenterBlock) {
  return (
    <Shell {...shell}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t) => (
          <div key={t.title} className="rounded-xl border p-5" style={{ borderColor: COLOR.border, backgroundColor: COLOR.surface }}>
            <h3 className="text-base font-extrabold mb-1.5" style={{ color: COLOR.ink, fontFamily: F.h }}>{t.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: COLOR.body, fontFamily: F.b }}>{t.body}</p>
            <div className="mt-2 text-[10px] uppercase tracking-widest font-bold" style={{ color: COLOR.muted, fontFamily: F.h }}>Draft · content coming</div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// Case studies
// ─────────────────────────────────────────────────────────────
export interface CaseBlock extends SectionShell {
  cases: {
    country: string;
    vehicle: string;
    problem: string;
    config: string;
    runtime?: string;
    feedback: string;
    href?: string;
  }[];
}
export function Cases({ cases, ...shell }: CaseBlock) {
  return (
    <Shell bg="tint" {...shell}>
      <div className="grid md:grid-cols-2 gap-5">
        {cases.map((c, i) => (
          <div key={i} className="rounded-2xl border bg-white p-6" style={{ borderColor: COLOR.border }}>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: COLOR.tint, color: COLOR.brand, fontFamily: F.h }}>{c.country}</span>
            </div>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: COLOR.ink, fontFamily: F.h }}>{c.vehicle}</h3>
            <dl className="text-sm space-y-1.5 mb-3" style={{ color: COLOR.body, fontFamily: F.b }}>
              <div><dt className="inline font-bold text-[12px] uppercase tracking-wider" style={{ color: COLOR.muted }}>Problem · </dt><dd className="inline">{c.problem}</dd></div>
              <div><dt className="inline font-bold text-[12px] uppercase tracking-wider" style={{ color: COLOR.muted }}>Config · </dt><dd className="inline">{c.config}</dd></div>
              {c.runtime ? <div><dt className="inline font-bold text-[12px] uppercase tracking-wider" style={{ color: COLOR.muted }}>Result · </dt><dd className="inline">{c.runtime}</dd></div> : null}
            </dl>
            <blockquote className="text-sm italic border-l-2 pl-3" style={{ color: COLOR.ink, borderColor: COLOR.brand, fontFamily: F.b }}>"{c.feedback}"</blockquote>
            {c.href ? (
              <Link href={c.href} className="inline-flex items-center gap-1 mt-4 text-xs font-bold" style={{ color: COLOR.brand, fontFamily: F.h }}>
                Read case <ArrowRight size={12} />
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// Compare table
// ─────────────────────────────────────────────────────────────
export interface CompareBlock extends SectionShell { headers: string[]; rows: string[][] }
export function CompareTable({ headers, rows, ...shell }: CompareBlock) {
  return (
    <Shell {...shell}>
      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: COLOR.border }}>
        <table className="w-full text-sm" style={{ fontFamily: F.b }}>
          <thead>
            <tr style={{ backgroundColor: COLOR.surface }}>
              {headers.map((h, i) => (
                <th key={i} className="text-left px-4 py-3 font-extrabold" style={{ color: COLOR.ink, fontFamily: F.h }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-t" style={{ borderColor: COLOR.border }}>
                {r.map((cell, ci) => (
                  <td key={ci} className="px-4 py-3 align-top" style={{ color: ci === 0 ? COLOR.ink : COLOR.body, fontWeight: ci === 0 ? 700 : 400 }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// Spec table / BOM table — same component
// ─────────────────────────────────────────────────────────────
export interface SpecTableBlock extends SectionShell { rows: { label: string; value: string }[] }
export function SpecTable({ rows, ...shell }: SpecTableBlock) {
  return (
    <Shell {...shell}>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 rounded-2xl border p-6" style={{ borderColor: COLOR.border, backgroundColor: COLOR.surface }}>
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4 py-2 border-b text-sm" style={{ borderColor: COLOR.border, fontFamily: F.b }}>
            <span style={{ color: COLOR.muted }}>{r.label}</span>
            <span className="font-bold text-right" style={{ color: COLOR.ink }}>{r.value}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// Resource hub — SEO link list
// ─────────────────────────────────────────────────────────────
export interface ResourceBlock extends SectionShell { items: { title: string; href: string; note?: string }[] }
export function ResourceHub({ items, ...shell }: ResourceBlock) {
  return (
    <Shell bg="tint" {...shell}>
      <ul className="grid sm:grid-cols-2 gap-3">
        {items.map((it) => (
          <li key={it.title}>
            <Link href={it.href} className="block rounded-xl border bg-white p-4 hover:shadow-md transition-all" style={{ borderColor: COLOR.border }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm" style={{ color: COLOR.ink, fontFamily: F.h }}>{it.title}</div>
                  {it.note ? <div className="text-xs mt-0.5" style={{ color: COLOR.muted, fontFamily: F.b }}>{it.note}</div> : null}
                </div>
                <ArrowRight size={14} style={{ color: COLOR.brand }} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────
export interface FAQBlock extends SectionShell { items: { q: string; a: string }[] }
export function FAQ({ items, ...shell }: FAQBlock) {
  return (
    <Shell {...shell}>
      <div className="divide-y rounded-2xl border" style={{ borderColor: COLOR.border }}>
        {items.map((f, i) => (
          <details key={i} className="group p-5 open:bg-[oklch(0.98_0.01_240)]">
            <summary className="cursor-pointer font-extrabold text-base flex items-start gap-3" style={{ color: COLOR.ink, fontFamily: F.h }}>
              <span className="text-xs font-bold mt-1" style={{ color: COLOR.brand }}>Q{i + 1}.</span>
              <span className="flex-1">{f.q}</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed pl-9" style={{ color: COLOR.body, fontFamily: F.b }}>{f.a}</p>
          </details>
        ))}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// Final CTA Form (Custom APU recommendation) — draft, no backend
// ─────────────────────────────────────────────────────────────
export interface CtaFormBlock extends SectionShell { title: string; note?: string }
export function CtaForm({ title, note, ...shell }: CtaFormBlock) {
  return (
    <Shell bg="dark" {...shell}>
      <div className="grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-2 text-white">
          <h2 className="text-2xl lg:text-3xl font-extrabold mb-3" style={{ fontFamily: F.h }}>{title}</h2>
          {note ? <p className="text-white/75 text-sm leading-relaxed" style={{ fontFamily: F.b }}>{note}</p> : null}
          <ul className="mt-5 space-y-2 text-sm text-white/80" style={{ fontFamily: F.b }}>
            <li className="flex gap-2"><Check size={14} className="mt-0.5" /> System-level recommendation, not just a product link</li>
            <li className="flex gap-2"><Check size={14} className="mt-0.5" /> Wiring diagram + BOM in 1–2 business days</li>
            <li className="flex gap-2"><Check size={14} className="mt-0.5" /> Direct reply from the CoolDrivePro engineering team</li>
          </ul>
        </div>
        <form
          className="md:col-span-3 grid sm:grid-cols-2 gap-3 bg-white rounded-2xl p-6"
          action="https://api.web3forms.com/submit"
          method="POST"
        >
          <input type="hidden" name="access_key" value="875b555f-eafa-4844-960d-403c3f9ed0ce" />
          <input type="hidden" name="subject" value="APU System Inquiry — cooldrivepro.com" />
          <input type="hidden" name="from_name" value="CoolDrivePro APU Form" />
          {[
            { name: "country", label: "Country", placeholder: "USA / Germany / UAE ..." },
            { name: "vehicle", label: "Vehicle type", placeholder: "Freightliner Cascadia, Volvo FH16 ..." },
            { name: "voltage", label: "System voltage", placeholder: "12V / 24V" },
            { name: "cab", label: "Cab size", placeholder: "Sleeper / Day cab / RV ..." },
            { name: "hours", label: "Parking hours / night", placeholder: "e.g. 8" },
          ].map((f) => (
            <label key={f.name} className="text-xs font-bold" style={{ color: COLOR.muted, fontFamily: F.h }}>
              {f.label}
              <input name={f.name} placeholder={f.placeholder} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" style={{ borderColor: COLOR.border, color: COLOR.ink }} />
            </label>
          ))}
          <label className="sm:col-span-2 text-xs font-bold" style={{ color: COLOR.muted, fontFamily: F.h }}>
            What do you need to power?
            <select name="need" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" style={{ borderColor: COLOR.border, color: COLOR.ink }}>
              <option>Cooling only</option>
              <option>Cooling + cabin DC loads (lights, fridge)</option>
              <option>Cooling + AC appliances (microwave, TV)</option>
              <option>Long parking + generator backup</option>
            </select>
          </label>
          <label className="sm:col-span-2 text-xs font-bold" style={{ color: COLOR.muted, fontFamily: F.h }}>
            Contact email
            <input type="email" name="email" required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" style={{ borderColor: COLOR.border, color: COLOR.ink }} />
          </label>
          <label className="sm:col-span-2 text-xs font-bold" style={{ color: COLOR.muted, fontFamily: F.h }}>
            Notes
            <textarea name="notes" rows={3} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" style={{ borderColor: COLOR.border, color: COLOR.ink }} />
          </label>
          <button type="submit" className="sm:col-span-2 mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold text-sm text-white" style={{ backgroundColor: COLOR.brand, fontFamily: F.h }}>
            Get my custom APU recommendation <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// Placeholder block (for Builder / ROI / Compliance map drafts)
// ─────────────────────────────────────────────────────────────
export interface PlaceholderBlock extends SectionShell { title: string; note: string; checklist?: string[] }
export function Placeholder({ title, note, checklist, ...shell }: PlaceholderBlock) {
  return (
    <Shell {...shell}>
      <div className="rounded-2xl border-2 border-dashed p-8 lg:p-10" style={{ borderColor: COLOR.brand, backgroundColor: COLOR.tint }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: COLOR.brand, fontFamily: F.h }}>Draft · interactive tool coming</div>
        <h2 className="text-2xl font-extrabold mb-3" style={{ color: COLOR.ink, fontFamily: F.h }}>{title}</h2>
        <p className="text-base leading-relaxed mb-5" style={{ color: COLOR.body, fontFamily: F.b }}>{note}</p>
        {checklist?.length ? (
          <ul className="space-y-1.5 text-sm" style={{ color: COLOR.body, fontFamily: F.b }}>
            {checklist.map((c) => (
              <li key={c} className="flex gap-2"><Check size={14} className="mt-0.5 flex-none" style={{ color: COLOR.brand }} />{c}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// Page nav — small in-section index to sister pages
// ─────────────────────────────────────────────────────────────
export interface PageNavBlock { items: { label: string; href: string; description?: string }[] }
export function PageNav({ items }: PageNavBlock) {
  return (
    <section className="py-8" style={{ backgroundColor: "white", borderTop: `1px solid ${COLOR.border}`, borderBottom: `1px solid ${COLOR.border}` }}>
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="text-xs font-bold px-3 py-1.5 rounded-full border hover:bg-[oklch(0.94_0.06_255)]" style={{ borderColor: COLOR.border, color: COLOR.ink, fontFamily: F.h }}>
              {it.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────────────────────
export function Breadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: COLOR.muted, fontFamily: F.b }}>
      {trail.map((t, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 ? <span style={{ color: COLOR.muted }}>›</span> : null}
          {t.href ? <Link href={t.href} className="hover:underline">{t.label}</Link> : <span style={{ color: COLOR.ink }}>{t.label}</span>}
        </span>
      ))}
    </nav>
  );
}
