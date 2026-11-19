/**
 * CoolDrivePro lead measurement.
 *
 * Events describe contact clicks, form attempts, provider/queue acknowledgement,
 * and confirmed inbox delivery as separate outcomes. Queue or form-provider
 * acceptance is never reported as delivered. generate_lead is reserved for a
 * response that explicitly confirms delivery. That signal does not exist on the
 * current inquiry path.
 *
 * No email, name, phone, or message is accepted into analytics parameters.
 * The existing measurement ID stays G-1ETBFY8C9H. Preview hosts do not send.
 */

export const GA4_MEASUREMENT_ID = "G-1ETBFY8C9H";

/** Public Google Ads label already present in index.html. Fired only after acknowledgement. */
export const ADS_LEAD_FORM_SEND_TO = "AW-18126437861/LTqWCOzCqKQcEOX7rcND";

export const PRODUCTION_MEASUREMENT_HOSTS = ["cooldrivepro.com", "www.cooldrivepro.com"] as const;

export const LEAD_EVENT = {
  clickTel: "click_tel",
  mailto: "mailto",
  whatsappClick: "whatsapp_click",
  formStart: "form_start",
  inquiryAccepted: "inquiry_accepted",
  inquiryDelivered: "inquiry_delivered",
  generateLead: "generate_lead",
  inquiryFailed: "inquiry_failed",
  mailtoFallback: "inquiry_mailto_fallback",
} as const;

export type LeadEventName = (typeof LEAD_EVENT)[keyof typeof LEAD_EVENT];

export type AnalyticsConsent = "granted" | "denied" | "unset";

export type SubmitErrorClass = "timeout" | "network" | "rejected" | "unconfirmed" | "unavailable";

export type InquiryAcknowledgement =
  | { acknowledged: false; reason: "rejected" | "unconfirmed" }
  | { acknowledged: true; acceptanceType: "queue"; deliveryConfirmed: false }
  | { acknowledged: true; acceptanceType: "delivered"; deliveryConfirmed: true };

export type PlannedEvent = {
  name: LeadEventName;
  params: Record<string, string>;
  adsConversion: boolean;
};

export type AttemptRecord = {
  failed: boolean;
  fallback: boolean;
  success: boolean;
};

export type DebugLeadRecord = {
  name: string;
  params: Record<string, string>;
  sentToGa4: boolean;
  adsConversion: boolean;
};

export type AnalyticsTransport = {
  hostname: string;
  consent: AnalyticsConsent;
  gtag?: ((...args: unknown[]) => void) | undefined;
  debug: DebugLeadRecord[];
};

const ALLOWED_PARAMS = new Set([
  "acceptance_type",
  "contact_channel",
  "delivery_confirmed",
  "error_class",
  "form_id",
  "lead_stage",
  "link_kind",
  "measurement_origin",
  "page_path",
  "site",
]);

const EMAIL_VALUE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_VALUE = /(?:\+?\d[\d\s().-]{6,}\d)/;
const PII_KEY = /email|e-mail|phone|tel|name|message|address|company|body|subject/i;

const EMPTY_ATTEMPT: AttemptRecord = { failed: false, fallback: false, success: false };

export const isProductionMeasurementHost = (hostname: string) =>
  (PRODUCTION_MEASUREMENT_HOSTS as readonly string[]).includes(hostname.toLowerCase());

export const isSafePagePath = (value: string) =>
  value.startsWith("/") && !value.includes("?") && !value.includes("#") && !value.includes("@") && !EMAIL_VALUE.test(value) && value.length <= 120;

export const safePagePath = (pathname: string) => (isSafePagePath(pathname) ? pathname : "/");

const baseParams = (pagePath: string, extra: Record<string, string>): Record<string, string> => ({
  site: "cooldrivepro",
  measurement_origin: "explicit",
  page_path: safePagePath(pagePath),
  ...extra,
});

export const sanitizeAnalyticsParams = (params: Record<string, unknown>): Record<string, string> => {
  const clean: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (!ALLOWED_PARAMS.has(key) || PII_KEY.test(key)) continue;
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") continue;

    const text = String(value).trim();
    if (!text || text.length > 80 || EMAIL_VALUE.test(text) || PHONE_VALUE.test(text)) continue;
    if (key === "page_path" && !isSafePagePath(text)) continue;
    clean[key] = text;
  }

  return clean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasReference = (body: Record<string, unknown>) =>
  typeof body.reference === "string" && body.reference.trim().length > 0;

const isDeliveryConfirmed = (body: Record<string, unknown>) => {
  if (body.delivery_confirmed === true || body.delivered === true) return true;
  const status = body.delivery_status ?? body.inquiry_status;
  return status === "delivered" || status === "inbox_delivered";
};

const isQueueResponse = (body: Record<string, unknown>) =>
  body.queued === true ||
  body.inquiry_mode === "durable_queue" ||
  body.acceptance === "queue" ||
  body.status === "queued" ||
  body.inquiry_status === "queued";

/**
 * Classify a provider response without reading message text.
 * The local inquiry server's JSON success body is
 * `{ success, queued: true, email: false, reference }` with HTTP 202.
 * `email: false` and `queued: true` are queue acknowledgement, not delivery.
 * A structured delivery flag is the only delivered status.
 */
export const classifyInquiryAcknowledgement = (body: unknown): InquiryAcknowledgement => {
  if (!isRecord(body) || body.success !== true) {
    return { acknowledged: false, reason: "rejected" };
  }

  if (!hasReference(body)) return { acknowledged: false, reason: "unconfirmed" };

  if (body.email === false || body.queued === true || isQueueResponse(body)) {
    return { acknowledged: true, acceptanceType: "queue", deliveryConfirmed: false };
  }

  if (isDeliveryConfirmed(body)) {
    return { acknowledged: true, acceptanceType: "delivered", deliveryConfirmed: true };
  }

  return { acknowledged: true, acceptanceType: "queue", deliveryConfirmed: false };
};

export const readAnalyticsConsent = (dataLayer: unknown[] | undefined): AnalyticsConsent => {
  let consent: AnalyticsConsent = "unset";
  if (!dataLayer) return consent;

  for (const entry of dataLayer) {
    if (typeof entry !== "object" || entry === null) continue;
    const args = Array.from(entry as ArrayLike<unknown>);
    if (args[0] !== "consent" || (args[1] !== "default" && args[1] !== "update")) continue;
    const payload = args[2];
    if (!isRecord(payload)) continue;
    if (payload.analytics_storage === "denied") consent = "denied";
    if (payload.analytics_storage === "granted") consent = "granted";
  }

  return consent;
};

const event = (name: LeadEventName, params: Record<string, string>, adsConversion = false): PlannedEvent => ({
  name,
  params: sanitizeAnalyticsParams(params),
  adsConversion,
});

export const planContactClick = (
  channel: "tel" | "mailto" | "whatsapp",
  pagePath: string,
): PlannedEvent[] => {
  switch (channel) {
    case "tel":
      return [event(LEAD_EVENT.clickTel, baseParams(pagePath, { contact_channel: "phone", link_kind: "tel", lead_stage: "contact_click" }))];
    case "mailto":
      return [event(LEAD_EVENT.mailto, baseParams(pagePath, { contact_channel: "email", link_kind: "mailto", lead_stage: "contact_click" }))];
    case "whatsapp":
      return [event(LEAD_EVENT.whatsappClick, baseParams(pagePath, { contact_channel: "whatsapp", link_kind: "whatsapp", lead_stage: "contact_click" }))];
    default: {
      const unreachable: never = channel;
      return unreachable;
    }
  }
};

export const planFormStart = (
  formId: string,
  pagePath: string,
  started: ReadonlySet<string>,
): { started: Set<string>; events: PlannedEvent[] } => {
  const safeFormId = /^[a-z0-9_-]{1,64}$/.test(formId) ? formId : "inquiry";
  if (started.has(safeFormId)) return { started: new Set(started), events: [] };
  const next = new Set(started);
  next.add(safeFormId);
  return {
    started: next,
    events: [event(LEAD_EVENT.formStart, baseParams(pagePath, { form_id: safeFormId, lead_stage: "form_attempt" }))],
  };
};

const acceptanceEvents = (
  acknowledgement: Extract<InquiryAcknowledgement, { acknowledged: true }>,
  formId: string,
  pagePath: string,
): PlannedEvent[] => {
  const formParams = baseParams(pagePath, { form_id: formId });

  switch (acknowledgement.acceptanceType) {
    case "queue":
      return [
        event(
          LEAD_EVENT.inquiryAccepted,
          {
            ...formParams,
            acceptance_type: acknowledgement.acceptanceType,
            delivery_confirmed: "false",
            lead_stage: "accepted_not_delivered",
          },
        ),
      ];
    case "delivered":
      return [
        event(
          LEAD_EVENT.inquiryDelivered,
          {
            ...formParams,
            acceptance_type: "delivered",
            delivery_confirmed: "true",
            lead_stage: "delivery_confirmed",
          },
          true,
        ),
        event(LEAD_EVENT.generateLead, {
          ...formParams,
          acceptance_type: "delivered",
          delivery_confirmed: "true",
          lead_stage: "delivery_confirmed",
        }),
      ];
    default: {
      const unreachable: never = acknowledgement;
      return unreachable;
    }
  }
};

export const planSubmission = (input: {
  current?: AttemptRecord;
  action:
    | { type: "failed"; formId: string; pagePath: string; errorClass: SubmitErrorClass }
    | { type: "mailto_fallback"; formId: string; pagePath: string }
    | { type: "acknowledged"; formId: string; pagePath: string; acknowledgement: InquiryAcknowledgement };
}): { state: AttemptRecord; events: PlannedEvent[] } => {
  const state: AttemptRecord = { ...(input.current ?? EMPTY_ATTEMPT) };
  if (state.success) return { state, events: [] };

  const formId = /^[a-z0-9_-]{1,64}$/.test(input.action.formId) ? input.action.formId : "inquiry";

  switch (input.action.type) {
    case "failed":
      if (state.failed) return { state, events: [] };
      state.failed = true;
      return {
        state,
        events: [
          event(LEAD_EVENT.inquiryFailed, baseParams(input.action.pagePath, {
            form_id: formId,
            error_class: input.action.errorClass,
            lead_stage: "failed",
          })),
        ],
      };
    case "mailto_fallback":
      if (state.fallback) return { state, events: [] };
      state.fallback = true;
      return {
        state,
        events: [
          event(LEAD_EVENT.mailtoFallback, baseParams(input.action.pagePath, {
            form_id: formId,
            lead_stage: "mailto_fallback",
          })),
        ],
      };
    case "acknowledged":
      if (!input.action.acknowledgement.acknowledged) {
        if (state.failed) return { state, events: [] };
        state.failed = true;
        return {
          state,
          events: [
            event(LEAD_EVENT.inquiryFailed, baseParams(input.action.pagePath, {
              form_id: formId,
              error_class: input.action.acknowledgement.reason === "unconfirmed" ? "unconfirmed" : "rejected",
              lead_stage: "failed",
            })),
          ],
        };
      }
      state.success = true;
      return {
        state,
        events: acceptanceEvents(input.action.acknowledgement, formId, input.action.pagePath),
      };
    default: {
      const unreachable: never = input.action;
      return unreachable;
    }
  }
};

export const classifySubmitError = (error: unknown): SubmitErrorClass => {
  if (typeof error === "object" && error !== null && "errorClass" in error) {
    const errorClass = (error as { errorClass?: unknown }).errorClass;
    switch (errorClass) {
      case "timeout":
      case "network":
      case "rejected":
      case "unconfirmed":
      case "unavailable":
        return errorClass;
      default:
        break;
    }
  }

  const name = typeof error === "object" && error !== null && "name" in error ? String((error as { name?: unknown }).name) : "";
  if (name === "AbortError" || name === "TimeoutError") return "timeout";
  if (name === "TypeError") return "network";
  return "rejected";
};

export const deliverLeadEvents = (events: PlannedEvent[], transport: AnalyticsTransport): void => {
  const sendToGa4 = isProductionMeasurementHost(transport.hostname) && transport.consent !== "denied" && typeof transport.gtag === "function";

  for (const planned of events) {
    const params = sanitizeAnalyticsParams(planned.params);
    let sentToGa4 = false;
    let adsConversion = false;

    if (sendToGa4 && transport.gtag) {
      try {
        transport.gtag("event", planned.name, params);
        sentToGa4 = true;
        if (planned.adsConversion) {
          transport.gtag("event", "conversion", { send_to: ADS_LEAD_FORM_SEND_TO });
          adsConversion = true;
        }
      } catch {
        sentToGa4 = false;
        adsConversion = false;
      }
    }

    transport.debug.push({
      name: planned.name,
      params,
      sentToGa4,
      adsConversion,
    });
  }
};
