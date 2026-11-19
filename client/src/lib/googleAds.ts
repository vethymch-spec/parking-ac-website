type GoogleAdsConversionName = "lead" | "contact_form" | "whatsapp_click";

type GoogleAdsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __coolDriveProGoogleAdsConversions?: Record<string, boolean>;
  }
}

/**
 * Older call sites imported these helpers and emitted generate_lead on click,
 * form start, and mail fallback. Lead measurement now lives in leadMeasurement.ts.
 * These exports stay so a merge that reintroduces the old calls cannot send
 * personal data or a success event from this module.
 */
export const installGoogleTag = () => {};

export const trackGoogleAdsConversion = (
  _conversionName: GoogleAdsConversionName,
  _params: GoogleAdsParams = {},
) => {};

export const trackGoogleAdsEvent = (_eventName: string, _params: GoogleAdsParams = {}) => {};

export const installLeadSuccessConversionSnippet = () => {};

export {};
