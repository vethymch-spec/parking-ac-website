/**
 * Footer Component
 * Design: Deep navy blue background, 4-column layout
 * All links point to real routes
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link } from "wouter";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
  { label: "Return Policy", href: "/return-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/privacy-policy", placeholder: false },
];

const customerLinks = [
  { label: "Community Forum", href: "/forum", placeholder: false },
  { label: "Support", href: "/support", placeholder: false },
];

const bottomLinks = [
  { label: "Return Policy", href: "/return-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/privacy-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
];

const paymentIcons = ["VISA", "MC", "AMEX", "PayPal", "Discover", "Apple Pay"];

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  // Navigation links with translation
  const infoLinks = [
    { label: t('nav.about'), href: "/about" },
    { label: t('nav.contact'), href: "/contact" },
    { label: t('nav.topMountedAC'), href: "/products/top-mounted-ac" },
    { label: t('nav.miniSplitAC'), href: "/products/mini-split-ac" },
    { label: t('nav.heatingCoolingAC'), href: "/products/heating-cooling-ac" },
    { label: t('nav.contact'), href: "/contact", placeholder: false },
    { label: t('nav.brandKnowledge'), href: "/brand-knowledge", placeholder: false },
  ];

  const serviceLinks = [
    { label: t('footer.warranty'), href: "/warranty" },
    { label: t('footer.returns'), href: "/return-policy" },
    { label: t('footer.shipping'), href: "/shipping-policy" },
    { label: t('footer.privacy'), href: "/privacy-policy" },
    { label: t('footer.terms'), href: "/privacy-policy" },
    { label: t('nav.paymentMethod'), href: "#", placeholder: true },
    { label: t('nav.billingTerms'), href: "#", placeholder: true },
  ];

  const customerLinks = [
    { label: t('nav.forum'), href: "/forum", placeholder: false },
    { label: t('nav.trackOrder'), href: "#", placeholder: true },
    { label: t('nav.account'), href: "#", placeholder: true },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast("Thanks for subscribing!");
      setEmail("");
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

          {/* Customer */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.65 0.06 240)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('footer.support')}
            </h4>
            <ul className="space-y-2">
              {customerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={handlePlaceholder}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
                  >
                    {link.label}
                  </a>
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
              className="text-sm leading-relaxed"
              style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
            >
              {t('nav.supportAvailability')}
            </p>
          </div>
        </div>

        {/* Email Subscribe */}
        <div className="border-t border-white/10 pt-10 pb-4">
          <p
            className="text-center text-sm font-semibold mb-4"
            style={{ color: "oklch(0.80 0.04 240)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {t('footer.newsletter.title')}
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('footer.newsletter.placeholder')}
              className="flex-1 px-4 py-2.5 text-sm rounded-l-lg outline-none border border-white/20 focus:border-blue-400 transition-colors"
              style={{
                backgroundColor: "oklch(0.30 0.08 248)",
                color: "white",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold text-white rounded-r-lg transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "oklch(0.45 0.18 255)",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {t('footer.newsletter.subscribe')}
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

        {/* Language Switcher */}
        <div className="border-t border-white/10 pt-6 pb-4 flex justify-center">
          <LanguageSwitcher variant="footer" />
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t border-white/10"
        style={{ backgroundColor: "oklch(0.18 0.07 248)" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-xs"
            style={{ color: "oklch(0.60 0.04 240)", fontFamily: "'Inter', sans-serif" }}
          >
            © 2025, CoolDrivePro. {t('footer.rights')}
          </p>

          {/* Payment Icons */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {paymentIcons.map((icon) => (
              <div
                key={icon}
                className="px-2 py-1 rounded text-xs font-bold"
                style={{
                  backgroundColor: "oklch(0.30 0.06 248)",
                  color: "oklch(0.75 0.04 240)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.6rem",
                  minWidth: "36px",
                  textAlign: "center",
                }}
              >
                {icon}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {bottomLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs hover:text-white transition-colors hidden sm:block"
                style={{ color: "oklch(0.60 0.04 240)", fontFamily: "'Inter', sans-serif" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
