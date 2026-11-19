import { afterEach, describe, expect, it, vi } from "vitest";
import { submitToWeb3Forms } from "./leadForms";
import {
  ADS_LEAD_FORM_SEND_TO,
  deliverLeadEvents,
  LEAD_EVENT,
  planSubmission,
  type AnalyticsTransport,
  type AttemptRecord,
} from "./leadMeasurement";

const fetchMock = vi.fn();

const jsonResponse = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  }));

const measure = (
  acknowledgement: Awaited<ReturnType<typeof submitToWeb3Forms>>["acknowledgement"] | { acknowledged: false; reason: "rejected" | "unconfirmed" },
  current?: AttemptRecord,
  transport: Partial<AnalyticsTransport> = {},
) => {
  const gtag = transport.gtag === undefined && !("gtag" in transport) ? vi.fn() : transport.gtag;
  const target: AnalyticsTransport = {
    hostname: "cooldrivepro.com",
    consent: "unset",
    debug: [],
    ...transport,
    gtag,
  };
  const planned = planSubmission({
    current,
    action: acknowledgement.acknowledged
      ? { type: "acknowledged", formId: "contact_page", pagePath: "/contact", acknowledgement }
      : { type: "failed", formId: "contact_page", pagePath: "/contact", errorClass: acknowledgement.reason === "unconfirmed" ? "unconfirmed" : "rejected" },
  });
  deliverLeadEvents(planned.events, target);
  return { planned, target, gtag };
};

describe("mocked inquiry endpoint", () => {
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("posts only to Web3Forms and records provider acceptance without lead success", async () => {
    fetchMock.mockImplementation((url: string) => {
      expect(String(url)).toBe("https://api.web3forms.com/submit");
      expect(String(url)).not.toContain("/api/inquiry");
      return jsonResponse(200, { success: true, message: "Sent to ada@example.com" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitToWeb3Forms({
      email: "ada@example.com",
      name: "Ada",
      phone: "+1 555 0100",
      message: "Need a quote",
      subject: "Quote",
    });
    const { planned, gtag } = measure(result.acknowledgement);

    expect(result.acknowledgement).toEqual({
      acknowledged: true,
      acceptanceType: "form_provider",
      deliveryConfirmed: false,
    });
    expect(planned.events.map((event) => event.name)).toEqual([LEAD_EVENT.inquiryAccepted]);
    expect(planned.events[0]?.adsConversion).toBe(false);
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("ada@");
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("555");
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("Need a quote");
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(requestBody.email).toBe("ada@example.com");
  });

  it("classifies a mocked durable-queue acknowledgement without calling it delivered", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {
      success: true,
      inquiry_mode: "durable_queue",
      reference: "inq_queued",
      message: "accepted for info@vethy.com",
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitToWeb3Forms({ email: "buyer@fleet.test", message: "queue me" });
    const { gtag } = measure(result.acknowledgement);

    expect(result.acknowledgement).toMatchObject({ acceptanceType: "queue", deliveryConfirmed: false });
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", LEAD_EVENT.inquiryAccepted, expect.objectContaining({
      acceptance_type: "queue",
      delivery_confirmed: "false",
    }));
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("generate_lead");
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("inq_queued");
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("@");
  });

  it("records explicit delivery once and does not repeat it on retry of the same attempt", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {
      success: true,
      reference: "inq_done",
      delivery_confirmed: true,
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitToWeb3Forms({ email: "buyer@fleet.test" });
    const first = measure(result.acknowledgement);
    const second = measure(result.acknowledgement, first.planned.state, { gtag: first.gtag, debug: first.target.debug });

    expect(first.planned.events.map((event) => event.name)).toEqual([LEAD_EVENT.inquiryDelivered, LEAD_EVENT.generateLead]);
    expect(first.gtag).toHaveBeenCalledWith("event", "conversion", { send_to: ADS_LEAD_FORM_SEND_TO });
    expect(second.planned.events).toEqual([]);
    expect(first.gtag).toHaveBeenCalledTimes(3);
  });

  it("fails closed on rejection, timeout, network loss, and a queue response with no reference", async () => {
    vi.stubGlobal("fetch", fetchMock);

    fetchMock.mockResolvedValueOnce(jsonResponse(422, { success: false, message: "bad email ada@example.com" }));
    await expect(submitToWeb3Forms({ email: "ada@example.com" })).rejects.toMatchObject({ errorClass: "rejected" });

    fetchMock.mockRejectedValueOnce(Object.assign(new Error("timed out"), { name: "AbortError" }));
    await expect(submitToWeb3Forms({ email: "ada@example.com" })).rejects.toMatchObject({ errorClass: "timeout" });

    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(submitToWeb3Forms({ email: "ada@example.com" })).rejects.toMatchObject({ errorClass: "network" });

    fetchMock.mockResolvedValueOnce(jsonResponse(200, { success: true, inquiry_mode: "durable_queue" }));
    await expect(submitToWeb3Forms({ email: "ada@example.com" })).rejects.toMatchObject({
      name: "InquirySubmitError",
      errorClass: "unconfirmed",
    });
  });

  it("counts one acceptance after a failed attempt is retried against the mock", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    let state: AttemptRecord | undefined;
    try {
      await submitToWeb3Forms({ email: "ada@example.com", message: "first" });
    } catch (error) {
      const failed = planSubmission({
        action: { type: "failed", formId: "contact_page", pagePath: "/contact", errorClass: "network" },
      });
      state = failed.state;
      expect(error).toMatchObject({ errorClass: "network" });
      expect(failed.events.map((event) => event.name)).toEqual([LEAD_EVENT.inquiryFailed]);
    }

    fetchMock.mockResolvedValueOnce(jsonResponse(200, {
      success: true,
      inquiry_mode: "durable_queue",
      reference: "retry_ok",
    }));
    const result = await submitToWeb3Forms({ email: "ada@example.com", message: "retry" });
    const retried = planSubmission({
      current: state,
      action: { type: "acknowledged", formId: "contact_page", pagePath: "/contact", acknowledgement: result.acknowledgement },
    });

    expect(retried.events.map((event) => event.name)).toEqual([LEAD_EVENT.inquiryAccepted]);
    expect(retried.events[0]?.params.acceptance_type).toBe("queue");
    const repeated = planSubmission({
      current: retried.state,
      action: { type: "acknowledged", formId: "contact_page", pagePath: "/contact", acknowledgement: result.acknowledgement },
    });
    expect(repeated.events).toEqual([]);
  });

  it("does not call gtag when consent is denied or the tag is blocked", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, reference: "inq_blocked", inquiry_mode: "durable_queue" }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await submitToWeb3Forms({ email: "ada@example.com" });

    const denied = vi.fn();
    measure(result.acknowledgement, undefined, { consent: "denied", gtag: denied });
    expect(denied).not.toHaveBeenCalled();

    const blocked = vi.fn(() => {
      throw new Error("analytics blocked");
    });
    expect(() => measure(result.acknowledgement, undefined, { gtag: blocked })).not.toThrow();
    expect(blocked).toHaveBeenCalledTimes(1);

    const missing = measure(result.acknowledgement, undefined, { gtag: undefined, hostname: "localhost" });
    expect(missing.target.debug[0]?.sentToGa4).toBe(false);
    expect(missing.target.debug[0]?.name).toBe(LEAD_EVENT.inquiryAccepted);
  });
});
