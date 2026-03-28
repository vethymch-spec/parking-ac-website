import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Resend API Key", () => {
  it("should connect to Resend API successfully", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey, "RESEND_API_KEY must be set").toBeTruthy();
    expect(apiKey!.startsWith("re_"), "API key should start with re_").toBe(true);

    const resend = new Resend(apiKey);
    // Use the domains endpoint as a lightweight check
    const { data, error } = await resend.domains.list();
    expect(error, `Resend API error: ${JSON.stringify(error)}`).toBeNull();
    expect(data).toBeDefined();
  }, 15000);
});
