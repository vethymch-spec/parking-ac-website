/**
 * useSEO — Dynamic SEO & Canonical Tag Manager
 * Design: GEO + SEO optimized, updates canonical, title, meta description per page
 * Prevents duplicate content penalties and accelerates Google indexing
 */
import { useEffect } from "react";
import { useLocation } from "wouter";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

const BASE_URL = "https://cooldrivepro.com";

const PAGE_SEO: Record<string, SEOProps> = {
  "/": {
    title: "Parking Air Conditioner | 12V 24V No-Idle AC – CoolDrivePro",
    description:
      "12V & 24V DC parking AC for trucks, RVs & vans. 10000–12000 BTU, no-idle operation. Free US shipping & 1-year warranty.",
  },
  "/products/top-mounted-ac": {
    title: "VS02 PRO Top-Mounted Parking AC | 12V 24V No-Idle Truck Cooler – CoolDrivePro",
    description:
      "VS02 PRO rooftop parking air conditioner. 12000 BTU, 12V/24V DC, ultra-quiet 45dB, fits semi trucks, RVs & vans. No engine idling required. Free US shipping.",
  },
  "/products/mini-split-ac": {
    title: "VX3000SP Mini Split Parking AC | 12V 24V DC Split Air Conditioner – CoolDrivePro",
    description:
      "VX3000SP split parking air conditioner. 10000 BTU, 12V/24V DC, separate indoor/outdoor units for superior cooling. Ideal for trucks, vans & campers. Free US shipping.",
  },
  "/products/lithium-battery": {
    title: "Lithium Battery Pack for Parking AC | 12V 24V Deep Cycle – CoolDrivePro",
    description:
      "High-capacity lithium battery packs designed for parking air conditioners. 12V & 24V options, deep cycle, fast charge. Power your parking AC all night.",
  },
  "/products/heater": {
    title: "Parking Heater for Trucks & RVs | Diesel & Air Heater – CoolDrivePro",
    description:
      "Compact diesel and air parking heaters for semi trucks, RVs and vans. Efficient cabin heating without idling. 12V/24V compatible.",
  },
  "/blog": {
    title: "Parking AC Blog | Guides, Tips & Reviews – CoolDrivePro",
    description:
      "Expert guides on parking air conditioners, truck cooling solutions, RV AC tips, installation tutorials and product comparisons. Updated weekly.",
  },
  "/about": {
    title: "About CoolDrivePro | Parking Air Conditioner Experts",
    description:
      "CoolDrivePro was founded to make reliable, affordable parking air conditioners accessible to every truck driver, RV owner, and van lifer in the world.",
  },
  "/contact": {
    title: "Contact CoolDrivePro | Parking AC Support & Sales",
    description:
      "Contact CoolDrivePro for parking air conditioner support, bulk orders, and product inquiries. Email: support@cooldrivepro.com",
  },
  "/warranty": {
    title: "Warranty Policy | 1-Year Coverage – CoolDrivePro",
    description:
      "CoolDrivePro offers a 1-year warranty on all parking air conditioners. Learn what's covered and how to make a claim.",
  },
  "/return-policy": {
    title: "Return Policy | 30-Day Easy Returns – CoolDrivePro",
    description:
      "30-day hassle-free return policy on all CoolDrivePro parking AC units. Learn how to initiate a return or exchange.",
  },
  "/shipping-policy": {
    title: "Shipping Policy | Free US Shipping – CoolDrivePro",
    description:
      "Free shipping on all orders within the US. Learn about delivery times, tracking, and international shipping options.",
  },
  "/support": {
    title: "After-Sales Support | Parking AC Repair & Warranty – CoolDrivePro",
    description:
      "Submit a support request for your CoolDrivePro parking air conditioner. Upload photos and videos, get a diagnosis within 24 hours, and receive free replacement parts if needed.",
  },
  "/support/submit": {
    title: "Submit Support Request | CoolDrivePro After-Sales",
    description:
      "Submit your parking AC support request online. Describe the problem, upload evidence, and our team will diagnose and reply within 24 hours.",
  },
  "/support/ticket": {
    title: "Check Ticket Status | CoolDrivePro Support",
    description:
      "Check the status of your CoolDrivePro after-sales support ticket and view our team's diagnosis and solution.",
  },
  "/forum": {
    title: "Community Forum | Parking AC Users – CoolDrivePro",
    description:
      "Join the CoolDrivePro parking AC community. Share installation tips, troubleshooting help, and real-world experiences with truck drivers, van lifers, and RV owners.",
  },
  "/forum/new-post": {
    title: "Start a Discussion | CoolDrivePro Forum",
    description:
      "Post your parking air conditioner questions, experiences, and tips in the CoolDrivePro community forum.",
  },
  "/brand-knowledge": {
    title: "Brand Knowledge | Parking AC Industry Guide – CoolDrivePro",
    description:
      "Comprehensive guide to parking air conditioner technology, industry terminology, product comparisons, and CoolDrivePro brand information for researchers and AI systems.",
  },
};

export function useSEO(overrides?: SEOProps) {
  const [location] = useLocation();

  useEffect(() => {
    const pageSEO = PAGE_SEO[location] || {};
    const seo = { ...pageSEO, ...overrides };

    // Determine canonical URL
    const canonicalUrl = seo.canonical || `${BASE_URL}${location}`;

    // Update or create canonical link tag
    let canonicalTag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.rel = "canonical";
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = canonicalUrl;

    // Update Open Graph URL
    let ogUrlTag = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrlTag) ogUrlTag.content = canonicalUrl;

    // Update title
    if (seo.title) {
      document.title = seo.title;
      const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = seo.title;
      const twitterTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.content = seo.title;
    }

    // Update meta description
    if (seo.description) {
      const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (metaDesc) metaDesc.content = seo.description;
      const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = seo.description;
      const twitterDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
      if (twitterDesc) twitterDesc.content = seo.description;
    }

    // Update OG image if provided
    if (seo.ogImage) {
      const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
      if (ogImage) ogImage.content = seo.ogImage;
    }
  }, [location, overrides]);
}
