/**
 * NewProductPopup – Fullscreen modal announcing the V-TH1
 * Shows once per session (sessionStorage). Dismissible via X or backdrop click.
 * Design: Dark overlay + centered card with product image, key specs, and CTA.
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";

const STORAGE_KEY = "vth1_popup_dismissed";

const IMG_OUTDOOR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-outdoor-top_55c3c0af.webp";

export default function NewProductPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show popup after a short delay if not already dismissed this session
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={dismiss}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: "rgba(0,0,0,0.1)", color: "oklch(0.40 0.05 250)" }}
          aria-label="Close popup"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* NEW badge ribbon */}
        <div
          className="absolute top-4 left-4 z-10 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider text-white"
          style={{
            background: "linear-gradient(135deg, oklch(0.42 0.22 30), oklch(0.48 0.24 50))",
            fontFamily: "'Montserrat', sans-serif",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          NEW PRODUCT
        </div>

        {/* Product image */}
        <div
          className="flex items-center justify-center py-8 px-6"
          style={{ backgroundColor: "oklch(0.97 0.015 240)" }}
        >
          <img
            src={IMG_OUTDOOR}
            alt="V-TH1 Heating and Cooling Parking Air Conditioner"
            className="w-56 h-56 object-contain"
          />
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <h2
            className="text-xl font-extrabold mb-2 leading-tight"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            V-TH1 Heating &amp; Cooling Parking AC
          </h2>
          <p
            className="text-sm mb-4 leading-relaxed"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            Year-round comfort in one unit. The V-TH1 heats your cab from 5°C to 30°C in 30 minutes and delivers up to 2,000W cooling. Powered by a GMCC twin-rotary compressor.
          </p>

          {/* Quick specs */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: "Cooling", value: "2,000W" },
              { label: "Heating", value: "30 min" },
              { label: "Voltage", value: "12V/24V" },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-lg px-3 py-2 text-center"
                style={{ backgroundColor: "oklch(0.96 0.02 240)" }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "oklch(0.32 0.08 250)", fontFamily: "'Montserrat', sans-serif" }}>{s.label}</div>
                <div className="text-sm font-bold" style={{ color: "oklch(0.30 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <Link
              href="/products/heating-cooling-ac"
              onClick={dismiss}
              className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, oklch(0.45 0.18 255), oklch(0.40 0.20 270))",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Explore V-TH1 Heating &amp; Cooling AC
            </Link>
            <button
              onClick={dismiss}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-center transition-all hover:scale-[1.02] active:scale-[0.98] border"
              style={{
                borderColor: "oklch(0.80 0.03 240)",
                color: "oklch(0.50 0.05 250)",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
