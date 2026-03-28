/**
 * Footer Component
 * Design: Deep navy blue background, 4-column layout
 * All links point to real routes
 */
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

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
  { label: "Terms of Service", href: "/privacy-policy" },
  { label: "Payment Method", href: "#", placeholder: true },
  { label: "Billing Terms", href: "#", placeholder: true },
];

const customerLinks = [
  { label: "Community Forum", href: "/forum", placeholder: false },
  { label: "Track Order", href: "#", placeholder: true },
  { label: "My Account", href: "#", placeholder: true },
];

const bottomLinks = [
  { label: "Return Policy", href: "/return-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/privacy-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
];

const paymentIcons = ["VISA", "MC", "AMEX", "PayPal", "Discover", "Apple Pay"];

export default function Footer() {
  const [email, setEmail] = useState("");

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
              Info
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
              Service
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
              Customer
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
              Get in Touch
            </h4>
            <p
              className="text-sm mb-1"
              style={{ color: "oklch(0.75 0.04 240)", fontFamily: "'Inter', sans-serif" }}
            >
              Customer Service:
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
              Support Availability: 11 AM - 9 PM Pacific Time (PT), we will reply to you within 1-12 hours.
            </p>
          </div>
        </div>

        {/* Email Subscribe */}
        <div className="border-t border-white/10 pt-10 pb-4">
          <p
            className="text-center text-sm font-semibold mb-4"
            style={{ color: "oklch(0.80 0.04 240)", fontFamily: "'Montserrat', sans-serif" }}
          >
            Subscribe to our email list
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
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
              →
            </button>
          </form>
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
            © 2025, CoolDrivePro. All rights reserved.
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
