/**
 * LeadCaptureCTA — inline lead form for high-intent blog content
 * Submits to Web3Forms (free, no backend) — set VITE_WEB3FORMS_KEY env or fall back to mailto.
 * Used inside blog posts (especially calculator pages) to convert reader → lead at peak interest.
 */
import { trackGoogleAdsConversion } from "@/lib/googleAds";
import { buildLeadEmailBody, collectLeadAttribution, submitToWeb3Forms, WEB3FORMS_KEY } from "@/lib/leadForms";
import { useState, FormEvent } from "react";

interface LeadCaptureCTAProps {
  variant?: "fleet-roi" | "quote" | "guide-download";
  sourceSlug: string;
}

const COPY = {
  "fleet-roi": {
    title: "Get a Custom Fleet ROI Report (Free, 48-hour Turnaround)",
    sub: "Send us your idle hours and fleet size. Our engineering team returns a one-page lifecycle TCO analysis tailored to your operation. No sales call required.",
    fields: ["fleetSize", "idleHours", "email"] as const,
    cta: "Get my fleet ROI report",
    success: "Thanks! Check your email — we'll send the report within 48 hours.",
  },
  quote: {
    title: "Get Factory-Direct Quote (Fleet Pricing 25+ Units)",
    sub: "Tell us your model + quantity. We respond within 24 hours with confirmed pricing, lead time, and shipping cost.",
    fields: ["model", "quantity", "email"] as const,
    cta: "Get my quote",
    success: "Quote request received. We'll reply within 24 hours.",
  },
  "guide-download": {
    title: "Download the Full 2026 Buying Guide PDF",
    sub: "9-unit comparison spreadsheet + spec checklist + ROI calculator template. Free, instant download.",
    fields: ["email"] as const,
    cta: "Send me the guide",
    success: "Check your inbox — the guide PDF is on its way.",
  },
};

export default function LeadCaptureCTA({ variant = "fleet-roi", sourceSlug }: LeadCaptureCTAProps) {
  const cfg = COPY[variant];
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = {
      from_name: "CoolDrivePro Lead Form",
      subject: `[Lead — ${variant}] from /${sourceSlug}`,
      source_page: typeof window !== "undefined" ? window.location.href : sourceSlug,
      lead_variant: variant,
      ...collectLeadAttribution(),
    };
    for (const [k, v] of fd.entries()) payload[k] = String(v);

    try {
      if (!WEB3FORMS_KEY) {
        const body = buildLeadEmailBody(payload);
        trackGoogleAdsConversion("lead", {
          lead_variant: variant,
          source_page: sourceSlug,
          submission_method: "mailto_fallback",
        });
        window.location.href = `mailto:support@cooldrivepro.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(body)}`;
        setSubmitted(true);
        return;
      }
      await submitToWeb3Forms(payload);
      setSubmitted(true);
      trackGoogleAdsConversion("lead", {
        lead_variant: variant,
        source_page: sourceSlug,
        submission_method: "web3forms",
      });
    } catch (err: any) {
      setError(err?.message || "Submission failed. Please email support@cooldrivepro.com directly.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          margin: "32px 0",
          padding: "24px 28px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, oklch(0.97 0.04 145) 0%, oklch(0.95 0.06 145) 100%)",
          border: "2px solid oklch(0.65 0.18 145)",
        }}
      >
        <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "oklch(0.32 0.12 145)", margin: 0 }}>
          ✓ {cfg.success}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: "32px 0",
        padding: "28px 32px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, oklch(0.96 0.03 250) 0%, oklch(0.94 0.05 255) 100%)",
        border: "2px solid oklch(0.55 0.18 255)",
        boxShadow: "0 4px 20px oklch(0.55 0.18 255 / 0.12)",
      }}
    >
      <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "oklch(0.28 0.12 250)", marginTop: 0, marginBottom: "8px", fontFamily: "'Montserrat', sans-serif" }}>
        {cfg.title}
      </h3>
      <p style={{ fontSize: "0.97rem", color: "oklch(0.42 0.06 250)", marginBottom: "18px", lineHeight: 1.55 }}>
        {cfg.sub}
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "12px" }}>
        {cfg.fields.includes("fleetSize" as never) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <select name="fleetSize" aria-label="Fleet size" required style={inputStyle} defaultValue="">
              <option value="" disabled>Fleet size</option>
              <option value="1-5">1–5 trucks</option>
              <option value="6-25">6–25 trucks</option>
              <option value="26-100">26–100 trucks</option>
              <option value="101-500">101–500 trucks</option>
              <option value="500+">500+ trucks</option>
              <option value="rv-personal">RV / personal use</option>
            </select>
            <input name="idleHours" required type="number" min="1" max="14" placeholder="Avg idle hrs/night" style={inputStyle} />
          </div>
        )}
        {cfg.fields.includes("model" as never) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <select name="model" aria-label="Product model" required style={inputStyle} defaultValue="">
              <option value="" disabled>Model</option>
              <option value="VS02-PRO">VS02 PRO (top-mounted)</option>
              <option value="VX3000SP">VX3000SP (mini split)</option>
              <option value="V-TH1">V-TH1 (heat pump)</option>
              <option value="Nano-Max">Nano Max (compact)</option>
              <option value="not-sure">Not sure — recommend</option>
            </select>
            <input name="quantity" required type="number" min="1" placeholder="Quantity" style={inputStyle} />
          </div>
        )}
        <input name="email" required type="email" placeholder="Work email" style={inputStyle} />
        <input name="company" placeholder="Company (optional)" style={inputStyle} />
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "14px 24px",
            borderRadius: "10px",
            background: submitting ? "oklch(0.55 0.10 255)" : "oklch(0.45 0.18 255)",
            color: "white",
            fontSize: "1rem",
            fontWeight: 700,
            border: "none",
            cursor: submitting ? "wait" : "pointer",
            transition: "background 0.2s",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {submitting ? "Sending..." : cfg.cta}
        </button>
        {error && <p style={{ color: "oklch(0.55 0.20 25)", fontSize: "0.9rem", margin: 0 }}>{error}</p>}
        <p style={{ fontSize: "0.78rem", color: "oklch(0.55 0.04 250)", margin: 0, lineHeight: 1.4 }}>
          We respond within 24h Mon–Sun. Your email is used only to reply — never sold or added to mass marketing lists.
        </p>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid oklch(0.85 0.02 255)",
  fontSize: "0.97rem",
  fontFamily: "'Inter', sans-serif",
  background: "white",
  color: "oklch(0.28 0.10 250)",
  outline: "none",
  width: "100%",
};
