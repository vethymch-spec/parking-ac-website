/**
 * APU System Diagram — Truck side view with 6 hotspots and power-flow arrows.
 * Pure inline SVG so it ships without extra assets. Replace with custom illustration later.
 */
import { useState } from "react";

type Hotspot = {
  id: string;
  cx: number;
  cy: number;
  label: string;
  body: string;
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "ac",
    cx: 280,
    cy: 90,
    label: "① Parking AC",
    body: "Roof-mounted or split DC parking air conditioner — keeps the sleeper cab cool without idling the main engine.",
  },
  {
    id: "panel",
    cx: 215,
    cy: 175,
    label: "② Cab Control Panel",
    body: "Driver-side touch panel: temperature, runtime, battery state of charge, generator backup status.",
  },
  {
    id: "battery",
    cx: 360,
    cy: 250,
    label: "③ APU Battery Pack",
    body: "LiFePO4 12V/24V pack mounted under-bunk or in the side tool box. BMS-protected, deep-cycle, 8–10h runtime.",
  },
  {
    id: "inverter",
    cx: 440,
    cy: 245,
    label: "④ Inverter / Controller",
    body: "DC→AC inverter for 110V/220V cabin loads (microwave, fridge, laptop) + smart charge controller.",
  },
  {
    id: "gen",
    cx: 555,
    cy: 245,
    label: "⑤ Parking Generator",
    body: "Optional diesel/gasoline generator for hybrid APU — extends runtime indefinitely on long stops.",
  },
  {
    id: "alt",
    cx: 130,
    cy: 240,
    label: "⑥ Alternator / Shore Power",
    body: "While driving, the alternator recharges the APU battery. At truck stops, shore power can top up too.",
  },
];

export default function SystemDiagram({ caption }: { caption?: string }) {
  const [active, setActive] = useState<string>("ac");
  const current = HOTSPOTS.find((h) => h.id === active) ?? HOTSPOTS[0];

  return (
    <div className="w-full">
      <div className="rounded-2xl border bg-white p-4 lg:p-6" style={{ borderColor: "oklch(0.90 0.02 240)" }}>
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox="0 0 720 360"
            role="img"
            aria-label="CoolDrivePro APU system — truck side view"
            className="w-full h-auto min-w-[640px]"
          >
            {/* Ground */}
            <line x1="20" y1="320" x2="700" y2="320" stroke="oklch(0.80 0.02 240)" strokeWidth="2" />

            {/* Truck silhouette (side view) — cab + sleeper + chassis */}
            {/* Sleeper roof */}
            <path
              d="M120 200 L120 130 Q120 110 140 110 L320 110 L340 170 L340 200 Z"
              fill="oklch(0.94 0.03 240)"
              stroke="oklch(0.50 0.05 250)"
              strokeWidth="2"
            />
            {/* Cab window */}
            <path d="M150 140 L210 140 L210 180 L150 180 Z" fill="oklch(0.85 0.06 240)" stroke="oklch(0.50 0.05 250)" />
            {/* Sleeper window */}
            <rect x="225" y="140" width="80" height="40" fill="oklch(0.85 0.06 240)" stroke="oklch(0.50 0.05 250)" />
            {/* Chassis / frame rail */}
            <rect x="120" y="200" width="500" height="20" fill="oklch(0.30 0.05 250)" />
            {/* Side toolbox / battery box */}
            <rect x="330" y="220" width="80" height="60" fill="oklch(0.92 0.04 240)" stroke="oklch(0.40 0.08 250)" strokeWidth="2" />
            {/* Inverter box */}
            <rect x="415" y="220" width="55" height="60" fill="oklch(0.92 0.04 240)" stroke="oklch(0.40 0.08 250)" strokeWidth="2" />
            {/* Generator box */}
            <rect x="520" y="220" width="80" height="60" fill="oklch(0.92 0.04 240)" stroke="oklch(0.40 0.08 250)" strokeWidth="2" />
            {/* Front bumper */}
            <rect x="100" y="265" width="40" height="20" fill="oklch(0.40 0.08 250)" />
            {/* Wheels */}
            <circle cx="170" cy="295" r="28" fill="oklch(0.25 0.04 250)" />
            <circle cx="170" cy="295" r="12" fill="oklch(0.60 0.04 250)" />
            <circle cx="460" cy="295" r="28" fill="oklch(0.25 0.04 250)" />
            <circle cx="460" cy="295" r="12" fill="oklch(0.60 0.04 250)" />
            <circle cx="540" cy="295" r="28" fill="oklch(0.25 0.04 250)" />
            <circle cx="540" cy="295" r="12" fill="oklch(0.60 0.04 250)" />
            {/* Rooftop AC unit */}
            <rect x="240" y="80" width="80" height="32" rx="6" fill="oklch(0.55 0.20 255)" stroke="oklch(0.30 0.20 255)" strokeWidth="2" />
            <text x="280" y="100" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="Inter">AC</text>

            {/* Power flow arrows */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="oklch(0.55 0.20 35)" />
              </marker>
            </defs>
            {/* Alternator → Battery */}
            <path d="M150 240 Q240 215 330 250" fill="none" stroke="oklch(0.55 0.20 35)" strokeWidth="2.5" markerEnd="url(#arrow)" strokeDasharray="4 3" />
            {/* Battery → Inverter */}
            <path d="M410 250 L415 250" fill="none" stroke="oklch(0.55 0.20 35)" strokeWidth="2.5" markerEnd="url(#arrow)" />
            {/* Generator → Battery */}
            <path d="M520 250 Q470 215 410 250" fill="none" stroke="oklch(0.55 0.20 35)" strokeWidth="2.5" markerEnd="url(#arrow)" strokeDasharray="4 3" />
            {/* Battery → AC (up to roof) */}
            <path d="M370 220 Q300 160 280 112" fill="none" stroke="oklch(0.55 0.20 35)" strokeWidth="2.5" markerEnd="url(#arrow)" />
            {/* Panel ← Battery */}
            <path d="M340 230 Q260 200 220 178" fill="none" stroke="oklch(0.55 0.20 35)" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Hotspots */}
            {HOTSPOTS.map((h) => {
              const isActive = h.id === active;
              return (
                <g key={h.id} style={{ cursor: "pointer" }} onClick={() => setActive(h.id)}>
                  <circle
                    cx={h.cx}
                    cy={h.cy}
                    r={isActive ? 13 : 11}
                    fill={isActive ? "oklch(0.55 0.20 255)" : "white"}
                    stroke="oklch(0.45 0.18 255)"
                    strokeWidth="2.5"
                  />
                  <text
                    x={h.cx}
                    y={h.cy + 4}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    fill={isActive ? "white" : "oklch(0.45 0.18 255)"}
                    fontFamily="Inter"
                    pointerEvents="none"
                  >
                    {h.id === "ac" ? "1" : h.id === "panel" ? "2" : h.id === "battery" ? "3" : h.id === "inverter" ? "4" : h.id === "gen" ? "5" : "6"}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-6 h-0.5" style={{ backgroundColor: "oklch(0.55 0.20 35)" }} /> Power flow
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: "oklch(0.55 0.20 35)" }} /> Charging path
            </span>
            <span>Tap any numbered hotspot to inspect.</span>
          </div>
        </div>

        {/* Active hotspot detail */}
        <div className="mt-5 rounded-xl p-4 lg:p-5" style={{ backgroundColor: "oklch(0.97 0.02 250)" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
            Hotspot
          </p>
          <h4 className="text-lg font-extrabold mb-1.5" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            {current.label}
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            {current.body}
          </p>
        </div>
      </div>

      {caption ? (
        <p className="mt-3 text-xs text-center" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
          {caption}
        </p>
      ) : null}
    </div>
  );
}
