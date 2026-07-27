/**
 * Footer Component
 * Design: Deep navy blue background, 4-column layout
 * All links point to real routes
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link } from "wouter";
import { trackGoogleAdsConversion } from "@/lib/googleAds";
import { buildLeadEmailBody, collectLeadAttribution, submitToWeb3Forms, WEB3FORMS_KEY } from "@/lib/leadForms";

const infoLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Top-Mounted AC", href: "/products/top-mounted-ac" },
  { label: "Mini Split AC", href: "/products/mini-split-ac" },
  { label: "Heating & Cooling AC", href: "/products/heating-cooling-ac" },
  { label: "Buy Wholesale", href: "/contact", placeholder: false },
  { label: "Brand Knowledge", href: "/brand-knowledge", placeholder: false },
];

const serviceLinks = [
  { label: "Warranty", href: "/warranty" },
  { label: "Return & Refund Policy", href: "/return-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service", placeholder: false },
  { label: "Payment Method", href: "/payment-method", placeholder: false },
  { label: "Billing Terms", href: "/billing-terms", placeholder: false },
];

const paymentBrands = [
  { label: "American Express", text: "AMEX", style: { fontWeight: 900, letterSpacing: "0.02em" } },
  { label: "Mastercard", text: "mastercard", style: { fontWeight: 700, fontStyle: "italic", letterSpacing: "-0.01em" } },
  { label: "Visa", text: "VISA", style: { fontWeight: 900, letterSpacing: "0.08em" } },
  { label: "Klarna", text: "Klarna.", style: { fontWeight: 700 } },
  { label: "Stripe", text: "stripe", style: { fontWeight: 700, letterSpacing: "-0.02em" } },
  { label: "PayPal", text: "PayPal", style: { fontWeight: 800, fontStyle: "italic", letterSpacing: "-0.01em" } },
];

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Navigation links with translation
  const infoLinks = [
    { label: t('nav.about'), href: "/about/" },
    { label: t('nav.contact'), href: "/contact/" },
    { label: "Buy Wholesale", href: "/contact/", placeholder: false },
    { label: t('nav.brandKnowledge'), href: "/brand-knowledge/", placeholder: false },
    { label: "Vehicle Compatibility", href: "/vehicle-compatibility/", placeholder: false },
    { label: "Dealer Fitment Guide", href: "/dealer-guide/parking-ac-local-market-fitment/", placeholder: false },
  ];

  const productLinks = [
    { label: t('nav.topMountedAC'), href: "/products/top-mounted-ac/" },
    { label: t('nav.miniSplitAC'), href: "/products/mini-split-ac/" },
    { label: t('nav.heatingCoolingAC'), href: "/products/heating-cooling-ac/" },
    { label: "Truck Air Conditioner Guide", href: "/solutions/truck-ac/", placeholder: false },
    { label: "12V Air Conditioner Guide", href: "/solutions/12v-air-conditioner/", placeholder: false },
    { label: "12V RV Air Conditioner", href: "/solutions/12v-rv-air-conditioner/", placeholder: false },
    { label: "12V Van Air Conditioner", href: "/solutions/12v-air-conditioner-for-van/", placeholder: false },
    { label: "Portable AC for Truck", href: "/solutions/portable-ac-for-truck/", placeholder: false },
  ];

  const serviceLinks = [
    { label: t('footer.warranty'), href: "/warranty/" },
    { label: t('footer.returns'), href: "/return-policy/" },
    { label: t('footer.shipping'), href: "/shipping-policy/" },
    { label: t('footer.privacy'), href: "/privacy-policy/" },
    { label: t('footer.terms'), href: "/terms-of-service/" },
    { label: t('nav.paymentMethod'), href: "/payment-method/" },
    { label: t('nav.billingTerms'), href: "/billing-terms/" },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !vehicle) return;

    setSubmitting(true);
    const payload: Record<string, string> = {
      from_name: "CoolDrivePro Footer Inquiry Form",
      subject: "[Footer Inquiry] Quick fitment request",
      source_page: typeof window !== "undefined" ? window.location.href : "footer",
      lead_variant: "footer_compact_inquiry",
      email,
      vehicle,
      ...collectLeadAttribution(),
    };

    try {
      if (!WEB3FORMS_KEY) {
        window.location.href = `mailto:support@cooldrivepro.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(buildLeadEmailBody(payload))}`;
        trackGoogleAdsConversion("lead", {
          lead_variant: "footer_compact_inquiry",
          submission_method: "mailto_fallback",
        });
      } else {
        await submitToWeb3Forms(payload);
        trackGoogleAdsConversion("lead", {
          lead_variant: "footer_compact_inquiry",
          submission_method: "web3forms",
        });
      }
      toast("Request received. We will reply with fitment guidance.");
      setEmail("");
      setVehicle("");
    } catch (error) {
      window.location.href = `mailto:support@cooldrivepro.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(buildLeadEmailBody(payload))}`;
      toast("Email fallback opened.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceholder = (e: React.MouseEvent) => {
    e.preventDefault();
    toast("Feature coming soon!");
  };

  return (
    <footer id="footer" style={{ backgroundColor: "oklch(0.22 0.08 248)" }}>
      {/* Main Footer */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Info */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.65 0.06 240)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('footer.company')}
            </h4>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  {link.placeholder ? (
                    <a
                      href={link.href}
                      onClick={handlePlaceholder}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Service */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.65 0.06 240)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('footer.support')}
            </h4>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  {link.placeholder ? (
                    <a
                      href={link.href}
                      onClick={handlePlaceholder}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.65 0.06 240)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('nav.products') !== 'nav.products' ? t('nav.products') : 'Products'}
            </h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  {link.placeholder ? (
                    <a
                      href={link.href}
                      onClick={handlePlaceholder}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.65 0.06 240)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('contact.getInTouch')}
            </h4>
            <p
              className="text-sm mb-1"
              style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
            >
              {t('contact.emailSupport.title')}:
            </p>
            <a
              href="mailto:support@cooldrivepro.com"
              className="text-sm mb-4 block hover:text-white transition-colors"
              style={{ color: "oklch(0.70 0.12 255)", fontFamily: "'Inter', sans-serif" }}
            >
              support@cooldrivepro.com
            </a>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
            >
              US Sales &amp; Support Office:<br />
              3429 Turkey Pen Lane<br />
              Montgomery, AL 36104<br />
              United States
            </p>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
            >
              Manufactured by Qingdao Vethy Industrial Co., Ltd. (ISO 9001:2015) — the parent company behind the CoolDrivePro brand.
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
            >
              {t('nav.supportAvailability')}
            </p>
          </div>
        </div>

        {/* Compact inquiry */}
        <div className="border-t border-white/10 pt-10 pb-4">
          <p
            className="text-center text-sm font-semibold mb-4"
            style={{ color: "oklch(0.80 0.04 240)", fontFamily: "'Montserrat', sans-serif" }}
          >
            Send vehicle details for a quick fitment reply
          </p>
          <form
            onSubmit={handleSubscribe}
            className="mx-auto grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email *"
              className="h-11 rounded-lg border border-white/20 px-4 text-sm outline-none transition-colors focus:border-blue-400"
              style={{
                backgroundColor: "oklch(0.30 0.08 248)",
                color: "white",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <input
              type="text"
              name="vehicle"
              required
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Vehicle / voltage *"
              className="h-11 rounded-lg border border-white/20 px-4 text-sm outline-none transition-colors focus:border-blue-400"
              style={{
                backgroundColor: "oklch(0.30 0.08 248)",
                color: "white",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-lg px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
              style={{
                backgroundColor: "oklch(0.45 0.18 255)",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {submitting ? "Sending..." : "Send"}
            </button>
          </form>
        </div>

        {/* Social media follow */}
        <div className="border-t border-white/10 pt-6 pb-2 flex flex-col items-center gap-3">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "oklch(0.65 0.06 240)", fontFamily: "'Montserrat', sans-serif" }}
          >
            Follow Us
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/vethyautomotive/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow CoolDrivePro on Facebook"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-blue-600"
              style={{ backgroundColor: "oklch(0.30 0.08 248)", color: "oklch(0.85 0.04 240)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24h11.495v-9.294H9.692V11.01h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.797.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.764v2.31h3.587l-.467 3.696h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.326V1.326C24 .593 23.407 0 22.675 0z"/></svg>
            </a>
            <a
              href="https://www.youtube.com/@vethyparkingcooler"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to CoolDrivePro on YouTube"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-red-600"
              style={{ backgroundColor: "oklch(0.30 0.08 248)", color: "oklch(0.85 0.04 240)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        {/* Payment Brands */}
        <div
          className="border-t border-white/10 pt-6 pb-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          aria-label="Accepted payment methods"
        >
          {paymentBrands.map(({ label, text, style }) => (
            <span
              key={label}
              title={label}
              className="text-base sm:text-lg"
              style={{
                color: "oklch(0.78 0.04 240)",
                fontFamily: "'Inter', sans-serif",
                ...style,
              }}
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t border-white/10"
        style={{ backgroundColor: "oklch(0.18 0.07 248)" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-5 flex items-center justify-center gap-4">
          <p
            className="text-xs"
            style={{ color: "oklch(0.60 0.04 240)", fontFamily: "'Inter', sans-serif" }}
          >
            © 2025, CoolDrivePro. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
