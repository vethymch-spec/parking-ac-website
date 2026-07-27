import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { trackGoogleAdsConversion } from "@/lib/googleAds";
import { buildLeadEmailBody, collectLeadAttribution, submitToWeb3Forms, WEB3FORMS_KEY } from "@/lib/leadForms";

interface CompactInquiryFormProps {
  source: string;
  productName?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  tone?: "light" | "blue";
  successMessage?: string;
}

export default function CompactInquiryForm({
  source,
  productName,
  title = "Send a quick fitment request",
  subtitle = "Share vehicle type, voltage, and quantity. We will reply with model guidance and invoice steps.",
  className = "",
  tone = "light",
  successMessage = "Request received. We will reply with fitment guidance and invoice steps.",
}: CompactInquiryFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string> = {
      from_name: "CoolDrivePro Compact Inquiry Form",
      subject: `[Compact Inquiry] ${productName || source}`,
      source_page: typeof window !== "undefined" ? window.location.href : source,
      lead_variant: "compact_inquiry",
      inquiry_source: source,
      product: productName || "Not specified",
      ...collectLeadAttribution(),
    };

    for (const [key, value] of formData.entries()) payload[key] = String(value);

    try {
      if (!WEB3FORMS_KEY) {
        window.location.href = `mailto:support@cooldrivepro.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(buildLeadEmailBody(payload))}`;
        setSubmitted(true);
        trackGoogleAdsConversion("lead", {
          lead_variant: "compact_inquiry",
          source_page: source,
          submission_method: "mailto_fallback",
        });
        return;
      }

      await submitToWeb3Forms(payload);
      setSubmitted(true);
      trackGoogleAdsConversion("lead", {
        lead_variant: "compact_inquiry",
        source_page: source,
        submission_method: "web3forms",
      });
    } catch (err) {
      const fallbackBody = buildLeadEmailBody(payload);
      window.location.href = `mailto:support@cooldrivepro.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(fallbackBody)}`;
      setSubmitted(true);
      setError(err instanceof Error ? err.message : "Submission failed. Email fallback opened.");
    } finally {
      setSubmitting(false);
    }
  };

  const panelClass = tone === "blue"
    ? "border-blue-200 bg-blue-50/80"
    : "border-slate-200 bg-white";

  if (submitted) {
    return (
      <div className={`rounded-lg border border-emerald-200 bg-emerald-50 p-5 ${className}`}>
        <p className="text-sm font-bold text-emerald-800">{successMessage}</p>
        {error ? <p className="mt-2 text-xs text-emerald-700">Email fallback opened in your mail app.</p> : null}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-5 shadow-sm ${panelClass} ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-extrabold tracking-normal text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>
      <form onSubmit={onSubmit} className="grid gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            name="email"
            type="email"
            required
            placeholder="Email *"
            className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <input
            name="name"
            placeholder="Name / company"
            className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
          <input
            name="vehicle"
            required
            placeholder="Vehicle / market *"
            className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <input
            name="quantity"
            type="number"
            min="1"
            placeholder="Qty"
            className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <textarea
          name="message"
          rows={2}
          placeholder="Voltage, roof space, target runtime, or question"
          className="min-h-[76px] resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
          {submitting ? "Sending..." : "Send request"}
        </button>
      </form>
    </div>
  );
}