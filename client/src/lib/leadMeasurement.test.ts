import { describe, expect, it, vi } from "vitest";
import {
  ADS_LEAD_FORM_SEND_TO,
  classifyInquiryAcknowledgement,
  classifySubmitError,
  deliverLeadEvents,
  LEAD_EVENT,
  planContactClick,
  planFormStart,
  planSubmission,
  sanitizeAnalyticsParams,
  type AnalyticsTransport,
  type AttemptRecord,
} from "./leadMeasurement";

const pagePath = "/contact";

const transport = (overrides: Partial<AnalyticsTransport> = {}): AnalyticsTransport => ({
  hostname: "cooldrivepro.com",
  consent: "unset",
  gtag: vi.fn(),
  debug: [],
  ...overrides,
});

const names = (events: { name: string }[]) => events.map((event) => event.name);

describe("inquiry acknowledgement classification", () => {
  it("does not acknowledge success when the server receipt is missing", () => {
    expect(classifyInquiryAcknowledgement({ success: true, ok: true, message: "Email sent to ada@example.com" })).toEqual({
      acknowledged: false,
      reason: "unconfirmed",
    });
  });

  it("treats a durable queue reference as queue acknowledgement, not inbox delivery", () => {
    expect(classifyInquiryAcknowledgement({
      success: true,
      inquiry_mode: "durable_queue",
      reference: "inq_123",
      message: "queued for info@vethy.com",
    })).toEqual({
      acknowledged: true,
      acceptanceType: "queue",
      deliveryConfirmed: false,
    });
  });

  it("does not acknowledge a queue response that has no reference", () => {
    expect(classifyInquiryAcknowledgement({ success: true, inquiry_mode: "durable_queue" })).toEqual({
      acknowledged: false,
      reason: "unconfirmed",
    });
  });

  it("acknowledges explicit delivery only from structured fields", () => {
    expect(classifyInquiryAcknowledgement({
      success: true,
      reference: "inq_123",
      delivery_confirmed: true,
    })).toEqual({
      acknowledged: true,
      acceptanceType: "delivered",
      deliveryConfirmed: true,
    });
  });

  it("does not treat the word delivered inside a message as confirmed delivery", () => {
    expect(classifyInquiryAcknowledgement({
      success: true,
      reference: "inq_words",
      message: "Your inquiry was delivered to ada@example.com",
    })).toEqual({
      acknowledged: true,
      acceptanceType: "queue",
      deliveryConfirmed: false,
    });
  });

  it("rejects unsuccessful responses", () => {
    expect(classifyInquiryAcknowledgement({ success: false, email: "ada@example.com" }).acknowledged).toBe(false);
    expect(classifyInquiryAcknowledgement(null).acknowledged).toBe(false);
  });
});

describe("lead event plans", () => {
  it("keeps contact clicks and form attempts off the success events", () => {
    expect(names(planContactClick("whatsapp", pagePath))).toEqual([LEAD_EVENT.whatsappClick]);
    expect(names(planContactClick("tel", pagePath))).toEqual([LEAD_EVENT.clickTel]);
    expect(names(planContactClick("mailto", pagePath))).toEqual([LEAD_EVENT.mailto]);

    const started = planFormStart("contact_page", pagePath, new Set());
    expect(names(started.events)).toEqual([LEAD_EVENT.formStart]);
    expect(planFormStart("contact_page", pagePath, started.started).events).toEqual([]);
    expect(JSON.stringify(started.events)).not.toContain("generate_lead");
    expect(JSON.stringify(planContactClick("mailto", pagePath))).not.toContain("inquiry_accepted");
  });

  it("emits inquiry_accepted once for provider acceptance and never generate_lead", () => {
    const first = planSubmission({
      action: {
        type: "acknowledged",
        formId: "contact_page",
        pagePath,
        acknowledgement: classifyInquiryAcknowledgement({ success: true, reference: "inq_once", queued: true, email: false }),
      },
    });

    expect(names(first.events)).toEqual([LEAD_EVENT.inquiryAccepted]);
    expect(first.events[0]?.params).toMatchObject({
      acceptance_type: "queue",
      delivery_confirmed: "false",
      lead_stage: "accepted_not_delivered",
      site: "cooldrivepro",
    });
    expect(first.events[0]?.adsConversion).toBe(false);

    const second = planSubmission({
      current: first.state,
      action: {
        type: "acknowledged",
        formId: "contact_page",
        pagePath,
        acknowledgement: classifyInquiryAcknowledgement({ success: true, reference: "inq_once", queued: true, email: false }),
      },
    });
    expect(second.events).toEqual([]);
  });

  it("labels queue acknowledgement as accepted and not delivered", () => {
    const planned = planSubmission({
      action: {
        type: "acknowledged",
        formId: "footer_inquiry",
        pagePath: "/products/top-mounted-ac",
        acknowledgement: classifyInquiryAcknowledgement({
          success: true,
          inquiry_mode: "durable_queue",
          reference: "q_1",
        }),
      },
    });

    expect(names(planned.events)).toEqual([LEAD_EVENT.inquiryAccepted]);
    expect(planned.events[0]?.params.acceptance_type).toBe("queue");
    expect(planned.events[0]?.params.delivery_confirmed).toBe("false");
    expect(names(planned.events)).not.toContain(LEAD_EVENT.generateLead);
    expect(names(planned.events)).not.toContain(LEAD_EVENT.inquiryDelivered);
    expect(planned.events[0]?.adsConversion).toBe(false);
    expect(JSON.stringify(planned.events)).not.toContain("q_1");
  });

  it("emits delivery and generate_lead only when delivery is explicit", () => {
    const planned = planSubmission({
      action: {
        type: "acknowledged",
        formId: "contact_page",
        pagePath,
        acknowledgement: classifyInquiryAcknowledgement({ success: true, delivery_status: "delivered", reference: "inq_9" }),
      },
    });

    expect(names(planned.events)).toEqual([LEAD_EVENT.inquiryDelivered, LEAD_EVENT.generateLead]);
    expect(planned.events[0]?.adsConversion).toBe(true);
    expect(planned.events[1]?.adsConversion).toBe(false);
    expect(planned.events.filter((item) => item.adsConversion)).toHaveLength(1);
  });

  it("records failure then one success on retry, and does not repeat the failure", () => {
    const failed = planSubmission({
      action: { type: "failed", formId: "compact_inquiry", pagePath, errorClass: "network" },
    });
    expect(names(failed.events)).toEqual([LEAD_EVENT.inquiryFailed]);

    const repeatedFailure = planSubmission({
      current: failed.state,
      action: { type: "failed", formId: "compact_inquiry", pagePath, errorClass: "network" },
    });
    expect(repeatedFailure.events).toEqual([]);

    const retried = planSubmission({
      current: failed.state,
      action: {
        type: "acknowledged",
        formId: "compact_inquiry",
        pagePath,
        acknowledgement: classifyInquiryAcknowledgement({ success: true, reference: "retry_1" }),
      },
    });
    expect(names(retried.events)).toEqual([LEAD_EVENT.inquiryAccepted]);
    expect(retried.state.success).toBe(true);

    const afterSuccess = planSubmission({
      current: retried.state,
      action: { type: "failed", formId: "compact_inquiry", pagePath, errorClass: "rejected" },
    });
    expect(afterSuccess.events).toEqual([]);
  });

  it("does not treat a mail draft fallback as acceptance or generate_lead", () => {
    const fallback = planSubmission({
      action: { type: "mailto_fallback", formId: "landing_truck-parking-ac", pagePath: "/landing/truck-parking-ac" },
    });
    expect(names(fallback.events)).toEqual([LEAD_EVENT.mailtoFallback]);
    expect(JSON.stringify(fallback.events)).not.toContain("generate_lead");
    expect(JSON.stringify(fallback.events)).not.toContain("inquiry_accepted");

    const duplicate = planSubmission({
      current: fallback.state,
      action: { type: "mailto_fallback", formId: "landing_truck-parking-ac", pagePath: "/landing/truck-parking-ac" },
    });
    expect(duplicate.events).toEqual([]);
  });

  it("strips email, name, phone, and message from analytics parameters", () => {
    const clean = sanitizeAnalyticsParams({
      form_id: "contact_page",
      email: "ada@example.com",
      name: "Ada",
      phone: "+1 555 0100",
      message: "Please call me",
      page_path: "/contact?email=ada@example.com",
      page_location: "https://cooldrivepro.com/contact?email=ada@example.com",
      lead_stage: "failed",
    });

    expect(clean).toEqual({ form_id: "contact_page", lead_stage: "failed" });
    expect(JSON.stringify(clean)).not.toContain("ada@");
    expect(JSON.stringify(clean)).not.toContain("555");
    expect(sanitizeAnalyticsParams({ form_id: "contact_page", lead_stage: "+1 555 123 4567" })).toEqual({ form_id: "contact_page" });
  });
});

describe("analytics transport", () => {
  it("sends queue acknowledgement without an ads conversion or generate_lead", () => {
    const gtag = vi.fn();
    const target = transport({ gtag });
    const planned = planSubmission({
      action: {
        type: "acknowledged",
        formId: "contact_page",
        pagePath,
        acknowledgement: classifyInquiryAcknowledgement({
          success: true,
          inquiry_mode: "durable_queue",
          reference: "inq_1",
          message: "queued for ada@example.com",
        }),
      },
    });

    deliverLeadEvents(planned.events, target);

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", LEAD_EVENT.inquiryAccepted, expect.objectContaining({
      acceptance_type: "queue",
      delivery_confirmed: "false",
    }));
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("ada@");
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("conversion");
  });

  it("sends generate_lead and one ads conversion only after explicit delivery", () => {
    const gtag = vi.fn();
    const target = transport({ gtag });
    const planned = planSubmission({
      action: {
        type: "acknowledged",
        formId: "contact_page",
        pagePath,
        acknowledgement: classifyInquiryAcknowledgement({ success: true, reference: "inq_9", delivery_confirmed: true }),
      },
    });

    deliverLeadEvents(planned.events, target);

    expect(gtag).toHaveBeenCalledTimes(3);
    expect(gtag).toHaveBeenNthCalledWith(1, "event", LEAD_EVENT.inquiryDelivered, expect.any(Object));
    expect(gtag).toHaveBeenNthCalledWith(2, "event", "conversion", { send_to: ADS_LEAD_FORM_SEND_TO });
    expect(gtag).toHaveBeenNthCalledWith(3, "event", LEAD_EVENT.generateLead, expect.objectContaining({ delivery_confirmed: "true" }));
    expect(target.debug[0]?.sentToGa4).toBe(true);
  });

  it("does not call gtag when analytics is missing, blocked, denied, or off-production", () => {
    const planned = planContactClick("tel", "/");
    const cases: AnalyticsTransport[] = [
      transport({ gtag: undefined }),
      transport({ consent: "denied" }),
      transport({ hostname: "localhost" }),
      transport({ hostname: "preview.cooldrivepro.com" }),
      transport({ hostname: "deploy-preview-3--cooldrivepro-ebcca963.netlify.app" }),
      transport({ hostname: "127.0.0.1" }),
      transport({ gtag: vi.fn(() => { throw new Error("blocked"); }) }),
    ];

    for (const target of cases) {
      expect(() => deliverLeadEvents(planned, target)).not.toThrow();
      expect(target.debug.at(-1)?.sentToGa4).toBe(false);
      expect(target.debug.at(-1)?.adsConversion).toBe(false);
    }
  });

  it("maps timeout and network failures without forwarding the error text", () => {
    expect(classifySubmitError({ name: "AbortError", message: "email ada@example.com timed out" })).toBe("timeout");
    expect(classifySubmitError(Object.assign(new TypeError("Failed to fetch"), { message: "Failed to fetch ada@example.com" }))).toBe("network");
    expect(classifySubmitError({ errorClass: "unavailable" })).toBe("unavailable");

    const planned = planSubmission({
      action: { type: "failed", formId: "contact_page", pagePath, errorClass: "timeout" },
    });
    expect(JSON.stringify(planned.events)).not.toContain("@");
    expect(planned.events[0]?.params.error_class).toBe("timeout");
  });

  it("does not let a later fallback overwrite a successful attempt", () => {
    const success = planSubmission({
      action: {
        type: "acknowledged",
        formId: "contact_page",
        pagePath,
        acknowledgement: classifyInquiryAcknowledgement({ success: true, reference: "q_2", inquiry_mode: "durable_queue" }),
      },
    });
    const state: AttemptRecord = success.state;
    const fallback = planSubmission({
      current: state,
      action: { type: "mailto_fallback", formId: "contact_page", pagePath },
    });
    expect(fallback.events).toEqual([]);
  });
});
