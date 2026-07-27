type GoogleAdsConversionName = "lead" | "contact_form" | "whatsapp_click";

type GoogleAdsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __coolDriveProGoogleAdsConversions?: Record<string, boolean>;
  }
}

const cleanEnvValue = (value: unknown) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("%")) return "";
  return trimmed;
};

const GOOGLE_ADS_ID = cleanEnvValue(import.meta.env.VITE_GOOGLE_ADS_ID || import.meta.env.VITE_GOOGLE_TAG_ID);
const DEFAULT_CONVERSION_LABEL = cleanEnvValue(import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL);

const CONVERSION_LABELS: Record<GoogleAdsConversionName, string> = {
  lead: cleanEnvValue(import.meta.env.VITE_GOOGLE_ADS_LEAD_CONVERSION_LABEL) || DEFAULT_CONVERSION_LABEL,
  contact_form: cleanEnvValue(import.meta.env.VITE_GOOGLE_ADS_CONTACT_CONVERSION_LABEL) || DEFAULT_CONVERSION_LABEL,
  whatsapp_click: cleanEnvValue(import.meta.env.VITE_GOOGLE_ADS_WHATSAPP_CONVERSION_LABEL),
};

const EVENT_NAMES: Record<GoogleAdsConversionName, string> = {
  lead: "generate_lead",
  contact_form: "generate_lead",
  whatsapp_click: "whatsapp_click",
};

let googleTagInstalled = false;
let leadSuccessConversionSnippetInstalled = false;

const getSentConversions = () => {
  window.__coolDriveProGoogleAdsConversions = window.__coolDriveProGoogleAdsConversions || {};
  return window.__coolDriveProGoogleAdsConversions;
};

const markConversionSent = (sendTo: string) => {
  getSentConversions()[sendTo] = true;
};

const hasConversionSent = (sendTo: string) => Boolean(getSentConversions()[sendTo]);

const getConversionSendTo = (conversionName: GoogleAdsConversionName) => {
  const conversionLabel = CONVERSION_LABELS[conversionName];
  if (!GOOGLE_ADS_ID || !conversionLabel) return "";
  return `${GOOGLE_ADS_ID}/${conversionLabel}`;
};

export const installGoogleTag = () => {
  if (typeof window === "undefined" || typeof document === "undefined" || !GOOGLE_ADS_ID) return;
  if (googleTagInstalled) return;

  googleTagInstalled = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);

  const scriptSelector = `script[data-google-tag-id="${GOOGLE_ADS_ID}"]`;
  if (document.querySelector(scriptSelector)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_ADS_ID)}`;
  script.dataset.googleTagId = GOOGLE_ADS_ID;
  document.head.appendChild(script);
};

const getPageParams = (): GoogleAdsParams => {
  if (typeof window === "undefined") return {};

  return {
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}`,
  };
};

export const trackGoogleAdsConversion = (conversionName: GoogleAdsConversionName, params: GoogleAdsParams = {}) => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const eventParams = {
    ...getPageParams(),
    ...params,
  };

  window.gtag("event", EVENT_NAMES[conversionName], eventParams);

  const conversionLabel = CONVERSION_LABELS[conversionName];
  if (!GOOGLE_ADS_ID || !conversionLabel) return;

  const sendTo = `${GOOGLE_ADS_ID}/${conversionLabel}`;

  if (hasConversionSent(sendTo)) return;

  window.gtag("event", "conversion", {
    send_to: sendTo,
    value: 1.0,
    currency: "USD",
    ...eventParams,
  });
  markConversionSent(sendTo);
};

export const trackGoogleAdsEvent = (eventName: string, params: GoogleAdsParams = {}) => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", eventName, {
    ...getPageParams(),
    ...params,
  });
};

export const installLeadSuccessConversionSnippet = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (leadSuccessConversionSnippetInstalled) return;

  const sendTo = getConversionSendTo("contact_form");
  if (!sendTo) return;

  leadSuccessConversionSnippetInstalled = true;

  window.addEventListener("load", () => {
    let triggered = false;
    const myVar = window.setInterval(() => {
      if (triggered) return;

      const divs = document.querySelectorAll("div");
      divs.forEach((div) => {
        if (triggered) return;
        if (!div.textContent?.includes("Thank you for reaching out.") || div.offsetParent === null) return;

        if (typeof window.gtag === "function" && !hasConversionSent(sendTo)) {
          window.gtag("event", "conversion", { send_to: sendTo });
          markConversionSent(sendTo);
        }

        window.clearInterval(myVar);
        triggered = true;
      });
    }, 1000);
  });
};

export {};