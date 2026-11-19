import { useEffect, useState } from "react";
import { createSubmissionId, getLeadDebugLog, recordInquiryAcknowledgement, recordInquiryFailure } from "@/lib/leadAnalytics";
import { classifyInquiryAcknowledgement, isProductionMeasurementHost } from "@/lib/leadMeasurement";

const buttonStyle = {
  border: "1px solid #cbd5e1",
  background: "#fff",
  borderRadius: 6,
  padding: "6px 8px",
  fontSize: 12,
  textAlign: "left" as const,
  cursor: "pointer",
};

/**
 * Local Vite preview only. This is not a Netlify preview and not production.
 * Buttons replay measurement outcomes and do not submit the inquiry form.
 */
export default function LeadMeasurementDebug() {
  const [entries, setEntries] = useState(() => getLeadDebugLog());
  const enabled = typeof window !== "undefined"
    && !isProductionMeasurementHost(window.location.hostname)
    && new URLSearchParams(window.location.search).get("measure_debug") === "1";

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => setEntries(getLeadDebugLog()), 400);
    return () => window.clearInterval(timer);
  }, [enabled]);

  if (!enabled) return null;

  const refresh = () => setEntries(getLeadDebugLog());
  const simulate = (body: Record<string, unknown>) => {
    recordInquiryAcknowledgement({
      submissionId: createSubmissionId(),
      formId: "measurement_preview",
      acknowledgement: classifyInquiryAcknowledgement(body),
    });
    refresh();
  };

  return (
    <aside
      aria-label="Lead measurement preview"
      style={{
        position: "fixed",
        left: 12,
        bottom: 12,
        zIndex: 10000,
        width: 320,
        maxHeight: "70vh",
        overflow: "auto",
        background: "#0f172a",
        color: "#e2e8f0",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
        fontFamily: "Inter, ui-sans-serif, sans-serif",
      }}
    >
      <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700 }}>Lead measurement preview</p>
      <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.45, color: "#94a3b8" }}>
        Local preview on this machine. Not a hosted deploy and not production. No inquiry is sent. GA4 is not loaded here.
      </p>
      <div style={{ display: "grid", gap: 6 }}>
        <button type="button" style={buttonStyle} onClick={() => simulate({ success: true })}>Simulate provider acceptance</button>
        <button type="button" style={buttonStyle} onClick={() => simulate({ success: true, inquiry_mode: "durable_queue", reference: "preview" })}>Simulate queue acknowledgement</button>
        <button type="button" style={buttonStyle} onClick={() => simulate({ success: true, reference: "preview", delivery_confirmed: true })}>Simulate confirmed delivery</button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => {
            const submissionId = createSubmissionId();
            recordInquiryFailure({ submissionId, formId: "measurement_preview", error: { errorClass: "network" } });
            recordInquiryAcknowledgement({
              submissionId,
              formId: "measurement_preview",
              acknowledgement: classifyInquiryAcknowledgement({ success: true, reference: "retry", inquiry_mode: "durable_queue" }),
            });
            refresh();
          }}
        >
          Simulate failure then retry
        </button>
      </div>
      <ol style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 12, lineHeight: 1.4 }}>
        {entries.slice(-8).map((entry, index) => (
          <li key={`${entry.name}-${index}`}>
            {entry.name}
            {entry.params.acceptance_type ? ` · ${entry.params.acceptance_type}` : ""}
            {entry.params.lead_stage ? ` · ${entry.params.lead_stage}` : ""}
            {entry.sentToGa4 ? "" : " · not sent"}
          </li>
        ))}
      </ol>
    </aside>
  );
}
