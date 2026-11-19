// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { getLeadDebugLog, installLeadMeasurement, resetLeadMeasurementForTests } from "./leadAnalytics";

const setHost = (url: string) => {
  const happy = (window as Window & { happyDOM?: { setURL: (next: string) => void } }).happyDOM;
  if (!happy?.setURL) throw new Error("happy-dom setURL is unavailable");
  happy.setURL(url);
};

const keepPage = () => {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest("a[href]")) event.preventDefault();
  }, true);
};

const renderFixture = () => {
  document.body.innerHTML = `
    <a id="phone" href="tel:+18615550100">Call</a>
    <a id="mail" href="mailto:info@vethy.com?subject=Quote">Email</a>
    <a id="chat" href="https://wa.me/8618561534326?text=Hello%20Ada">WhatsApp</a>
    <form data-lead-form="true" data-form-id="contact_page">
      <input id="email" name="email" value="ada@example.com" />
      <input id="phone-field" name="phone" value="+1 555 0100" />
      <textarea name="message">Please call me</textarea>
    </form>
  `;
  document.querySelectorAll("a[href]").forEach((anchor) => {
    anchor.addEventListener("click", (event) => event.preventDefault());
  });
};

describe("browser measurement listeners", () => {
  afterEach(() => {
    resetLeadMeasurementForTests();
    document.body.innerHTML = "";
    delete window.gtag;
    window.dataLayer = [];
  });

  it("records clicks and one form start locally without calling gtag or navigating", () => {
    setHost("http://127.0.0.1:5173/contact?email=ada@example.com");
    keepPage();
    const gtag = vi.fn();
    window.gtag = gtag;
    installLeadMeasurement();
    renderFixture();

    for (const id of ["phone", "mail", "chat"]) {
      const anchor = document.getElementById(id);
      anchor?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    }
    document.getElementById("email")?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    document.getElementById("phone-field")?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));

    const names = getLeadDebugLog().map((entry) => entry.name);
    expect(names).toEqual(["click_tel", "mailto", "whatsapp_click", "form_start"]);
    expect(gtag).not.toHaveBeenCalled();
    expect(JSON.stringify(getLeadDebugLog())).not.toContain("ada@");
    expect(JSON.stringify(getLeadDebugLog())).not.toContain("555");
    expect(window.location.pathname).toBe("/contact");
  });

  it("sends a production click only when consent allows and the tag does not throw", () => {
    keepPage();
    setHost("https://cooldrivepro.com/contact");
    window.dataLayer = [["consent", "default", { analytics_storage: "denied" }]];
    const denied = vi.fn();
    window.gtag = denied;
    installLeadMeasurement();
    renderFixture();
    document.getElementById("phone")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(denied).not.toHaveBeenCalled();

    resetLeadMeasurementForTests();
    setHost("https://cooldrivepro.com/contact");
    window.dataLayer = [["consent", "default", { analytics_storage: "denied" }], ["consent", "update", { analytics_storage: "granted" }]];
    const granted = vi.fn();
    window.gtag = granted;
    installLeadMeasurement();
    document.getElementById("mail")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(granted).toHaveBeenCalledWith("event", "mailto", expect.objectContaining({
      lead_stage: "contact_click",
      page_path: "/contact",
      site: "cooldrivepro",
    }));
    expect(JSON.stringify(granted.mock.calls)).not.toContain("info@");

    resetLeadMeasurementForTests();
    setHost("https://cooldrivepro.com/contact");
    window.dataLayer = [];
    window.gtag = () => {
      throw new Error("tag blocked");
    };
    installLeadMeasurement();
    expect(() => document.getElementById("chat")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))).not.toThrow();
    expect(getLeadDebugLog().at(-1)?.sentToGa4).toBe(false);
  });

  it("keeps Netlify preview and www production on opposite sides of the tag gate", () => {
    keepPage();
    setHost("https://deploy-preview-3--cooldrivepro-ebcca963.netlify.app/contact");
    const previewGtag = vi.fn();
    window.gtag = previewGtag;
    installLeadMeasurement();
    renderFixture();
    document.getElementById("chat")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(previewGtag).not.toHaveBeenCalled();

    resetLeadMeasurementForTests();
    setHost("https://www.cooldrivepro.com/zh-CN/contact");
    const productionGtag = vi.fn();
    window.gtag = productionGtag;
    window.dataLayer = [];
    installLeadMeasurement();
    document.getElementById("phone")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(productionGtag).toHaveBeenCalledWith("event", "click_tel", expect.objectContaining({ page_path: "/zh-CN/contact" }));
  });
});
