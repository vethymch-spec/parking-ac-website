import {
  classifySubmitError,
  deliverLeadEvents,
  isProductionMeasurementHost,
  planContactClick,
  planFormStart,
  planSubmission,
  readAnalyticsConsent,
  safePagePath,
  type AnalyticsTransport,
  type AttemptRecord,
  type DebugLeadRecord,
  type InquiryAcknowledgement,
} from "./leadMeasurement";

type ClickChannel = "tel" | "mailto" | "whatsapp";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __cdpMeasurementMode?: "production" | "preview";
    __cdpLeadDebug?: DebugLeadRecord[];
  }
}

const attempts = new Map<string, AttemptRecord>();
let startedForms = new Set<string>();
let installed = false;
const debugLog: DebugLeadRecord[] = [];

const currentPagePath = () => {
  if (typeof window === "undefined") return "/";
  return safePagePath(window.location.pathname || "/");
};

const transport = (): AnalyticsTransport => {
  const hostname = typeof window === "undefined" ? "localhost" : window.location.hostname;
  return {
    hostname,
    consent: readAnalyticsConsent(typeof window === "undefined" ? undefined : window.dataLayer),
    gtag: typeof window !== "undefined" ? window.gtag : undefined,
    debug: debugLog,
  };
};

const publishDebug = () => {
  if (typeof window === "undefined") return;
  if (isProductionMeasurementHost(window.location.hostname)) return;
  window.__cdpLeadDebug = debugLog;
};

const emit = (events: ReturnType<typeof planContactClick>) => {
  try {
    deliverLeadEvents(events, transport());
    publishDebug();
  } catch {
    // Measurement must never break the inquiry form.
  }
};

export const createSubmissionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `inquiry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const getLeadDebugLog = () => debugLog.slice();

export const recordFormStart = (formId: string) => {
  const planned = planFormStart(formId, currentPagePath(), startedForms);
  startedForms = planned.started;
  emit(planned.events);
};

export const recordInquiryAcknowledgement = (input: {
  submissionId: string;
  formId: string;
  acknowledgement: InquiryAcknowledgement;
}) => {
  const planned = planSubmission({
    current: attempts.get(input.submissionId),
    action: {
      type: "acknowledged",
      formId: input.formId,
      pagePath: currentPagePath(),
      acknowledgement: input.acknowledgement,
    },
  });
  attempts.set(input.submissionId, planned.state);
  emit(planned.events);
};

export const recordInquiryFailure = (input: { submissionId: string; formId: string; error: unknown }) => {
  const planned = planSubmission({
    current: attempts.get(input.submissionId),
    action: {
      type: "failed",
      formId: input.formId,
      pagePath: currentPagePath(),
      errorClass: classifySubmitError(input.error),
    },
  });
  attempts.set(input.submissionId, planned.state);
  emit(planned.events);
};

export const recordMailtoFallback = (input: { submissionId: string; formId: string }) => {
  const planned = planSubmission({
    current: attempts.get(input.submissionId),
    action: { type: "mailto_fallback", formId: input.formId, pagePath: currentPagePath() },
  });
  attempts.set(input.submissionId, planned.state);
  emit(planned.events);
};

const clickChannel = (href: string): ClickChannel | null => {
  if (href.startsWith("tel:")) return "tel";
  if (href.startsWith("mailto:")) return "mailto";
  let url: URL;
  try {
    url = new URL(href, typeof window === "undefined" ? "https://cooldrivepro.com" : window.location.href);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (host === "wa.me" || host === "api.whatsapp.com" || host.endsWith(".whatsapp.com")) return "whatsapp";
  return null;
};

export const installLeadMeasurement = () => {
  if (installed || typeof document === "undefined") return;
  installed = true;

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) return;
    const channel = clickChannel(anchor.getAttribute("href") || "");
    if (!channel) return;
    emit(planContactClick(channel, currentPagePath()));
  }, true);

  document.addEventListener("focusin", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const form = target.closest("form[data-lead-form]");
    if (!(form instanceof HTMLFormElement)) return;
    recordFormStart(form.getAttribute("data-form-id") || "inquiry");
  });
};

export const resetLeadMeasurementForTests = () => {
  attempts.clear();
  startedForms = new Set();
  debugLog.splice(0, debugLog.length);
  installed = false;
};
