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

// This GitHub snapshot still posts to Web3Forms. Production's built client
// (checked 2026-11-19) posts to same-origin /api/inquiry and requires
// success plus a reference. Do not retarget this function onto that route
// from here: the queue server is not in this repository, and the local
// source of truth was not available to merge against.
//
// Default Web3Forms access key (registered to info@vethy.com) so lead forms
// work even when VITE_WEB3FORMS_KEY is missing from the build environment.
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

export const submitToWeb3Forms = async (fields: LeadFields): Promise<InquirySubmitResult> => {
  if (!WEB3FORMS_KEY) {
    throw new InquirySubmitError("unavailable", "Lead endpoint unavailable");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  try {
    let response: Response;
    try {
      response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...fields }),
        signal: controller.signal,
      });
    } catch (error) {
      const name = typeof error === "object" && error !== null && "name" in error ? String((error as { name?: unknown }).name) : "";
      if (name === "AbortError") throw new InquirySubmitError("timeout", "Submission timed out");
      throw new InquirySubmitError("network", "Submission could not be sent");
    }

    const result = await response.json().catch(() => ({} as Record<string, unknown>));
    if (!response.ok || !result.success) {
      throw new InquirySubmitError("rejected", "Submission was rejected");
    }

    const acknowledgement = classifyInquiryAcknowledgement(result);
    if (!acknowledgement.acknowledged) {
      throw new InquirySubmitError("unconfirmed", "Submission could not be confirmed");
    }

    return { acknowledgement };
  } finally {
    clearTimeout(timer);
  }
};