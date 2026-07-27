type LeadFields = Record<string, string>;

const cleanEnvValue = (value: unknown) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("%")) return "";
  return trimmed;
};

export const WEB3FORMS_KEY = cleanEnvValue(import.meta.env.VITE_WEB3FORMS_KEY);

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

export const submitToWeb3Forms = async (fields: LeadFields) => {
  if (!WEB3FORMS_KEY) throw new Error("Web3Forms key is not configured");

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...fields }),
  });
  const result = await response.json().catch(() => ({} as { success?: boolean; message?: string }));

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Submission failed");
  }
};