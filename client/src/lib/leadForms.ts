import { classifyInquiryAcknowledgement, type InquiryAcknowledgement, type SubmitErrorClass } from "./leadMeasurement";

type LeadFields = Record<string, string>;

export class InquirySubmitError extends Error {
  errorClass: SubmitErrorClass;

  constructor(errorClass: SubmitErrorClass, message: string) {
    super(message);
    this.name = "InquirySubmitError";
    this.errorClass = errorClass;
  }
}

export type InquirySubmitResult = {
  acknowledgement: InquiryAcknowledgement;
};

const cleanEnvValue = (value: unknown) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("%")) return "";
  return trimmed;
};

// The function name is historical. The authoritative local client posts to
// the same-origin durable inquiry endpoint and does not call Web3Forms.
// The queue server itself is not in the supplied source snapshot.
//
// Default Web3Forms access key remains exported because existing forms still
// read WEB3FORMS_KEY before opening a mail draft. It is not sent to /api/inquiry.
const WEB3FORMS_FALLBACK_KEY = "875b555f-eafa-4844-960d-403c3f9ed0ce";

export const WEB3FORMS_KEY = cleanEnvValue(import.meta.env.VITE_WEB3FORMS_KEY) || WEB3FORMS_FALLBACK_KEY;

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "utm_adgroup",
  "gclid",
  "gbraid",
  "wbraid",
  "gclsrc",
  "gad_source",
] as const;

export const collectLeadAttribution = (): LeadFields => {
  if (typeof window === "undefined") return {};

  const attribution: LeadFields = {
    page_path: `${window.location.pathname}${window.location.search}`,
  };
  const params = new URLSearchParams(window.location.search);

  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value) attribution[key] = value;
  }

  if (typeof document !== "undefined" && document.referrer) {
    attribution.referrer = document.referrer;
  }

  return attribution;
};

export const buildLeadEmailBody = (fields: LeadFields) =>
  Object.entries(fields)
    .filter(([, value]) => value.trim().length > 0)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

const SUBMIT_TIMEOUT_MS = 30_000;

const responseMessage = (result: Record<string, unknown>) =>
  typeof result.message === "string" && result.message.trim() ? result.message : "Submission could not be confirmed";

export const submitToWeb3Forms = async (fields: LeadFields): Promise<InquirySubmitResult> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  try {
    const response = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(fields),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({} as Record<string, unknown>));
    const reference = typeof result.reference === "string" ? result.reference.trim() : "";
    if (!response.ok || result.success !== true || !reference) {
      throw new InquirySubmitError(response.ok && result.success === true ? "unconfirmed" : "rejected", responseMessage(result));
    }

    const acknowledgement = classifyInquiryAcknowledgement(result);
    if (!acknowledgement.acknowledged) {
      throw new InquirySubmitError("unconfirmed", responseMessage(result));
    }

    return { acknowledgement };
  } finally {
    clearTimeout(timer);
  }
};