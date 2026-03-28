/**
 * Generic Policy Page – renders Warranty / Return / Shipping / Privacy
 * based on the `type` prop
 */
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";

type PolicyType = "warranty" | "return" | "shipping" | "privacy";

interface PolicyPageProps {
  type: PolicyType;
}

const policies: Record<PolicyType, { title: string; breadcrumb: string; sections: { heading: string; body: string }[] }> = {
  warranty: {
    title: "1-Year Warranty Policy",
    breadcrumb: "Warranty",
    sections: [
      {
        heading: "Coverage",
        body: "CoolDrivePro warrants all parking air conditioners against defects in materials and workmanship for a period of one (1) year from the date of original purchase. This warranty covers the compressor, fan motors, control board, and all factory-installed components.",
      },
      {
        heading: "What Is Covered",
        body: "Manufacturing defects, component failures under normal use, compressor failure, electrical faults originating from the unit itself. We will repair or replace the defective unit at our discretion at no charge, including return shipping.",
      },
      {
        heading: "What Is Not Covered",
        body: "Damage caused by improper installation, unauthorized modifications, physical damage, water intrusion due to improper sealing, use outside of specified voltage range (below 10V or above 30V DC), or normal wear and tear of consumable parts such as filters.",
      },
      {
        heading: "How to Make a Warranty Claim",
        body: "Contact our support team at support@cooldrivepro.com with your order number, a description of the issue, and photos or video of the problem. Our team will respond within 24 hours with next steps. Do not return the unit without prior authorization.",
      },
      {
        heading: "Extended Warranty",
        body: "An optional 2-year extended warranty is available for purchase within 30 days of the original purchase date. Contact our support team for pricing and enrollment.",
      },
    ],
  },
  return: {
    title: "30-Day Return Policy",
    breadcrumb: "Return Policy",
    sections: [
      {
        heading: "Return Window",
        body: "We accept returns within 30 days of the delivery date. Items must be in original, unused condition with all original packaging, accessories, and documentation included.",
      },
      {
        heading: "How to Initiate a Return",
        body: "Email support@cooldrivepro.com with your order number and reason for return. We will provide a Return Merchandise Authorization (RMA) number and return shipping instructions within 2 business days.",
      },
      {
        heading: "Return Shipping",
        body: "For returns due to defects or shipping damage, CoolDrivePro covers all return shipping costs. For returns due to change of mind or incorrect order, the customer is responsible for return shipping costs.",
      },
      {
        heading: "Refund Processing",
        body: "Once we receive and inspect the returned item, we will process your refund within 5–7 business days. Refunds are issued to the original payment method. Please allow an additional 3–5 business days for the refund to appear on your statement.",
      },
      {
        heading: "Non-Returnable Items",
        body: "Items that have been installed, modified, or show signs of use are not eligible for return. Consumable items such as replacement filters are also non-returnable.",
      },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    breadcrumb: "Shipping Policy",
    sections: [
      {
        heading: "Free Shipping",
        body: "CoolDrivePro offers free standard shipping on all orders within the contiguous United States (lower 48 states). We currently do not offer international shipping or shipping to Alaska, Hawaii, or US territories.",
      },
      {
        heading: "Processing Time",
        body: "Orders are processed within 1–2 business days of payment confirmation. Orders placed on weekends or holidays will be processed on the next business day.",
      },
      {
        heading: "Delivery Time",
        body: "Standard shipping typically takes 5–8 business days after processing. Expedited shipping (3–5 business days) is available for an additional fee at checkout. Delivery times may vary during peak seasons.",
      },
      {
        heading: "Freight Shipping",
        body: "Due to the size and weight of parking air conditioner units, orders are shipped via LTL freight. You will receive a tracking number and the freight carrier will contact you to schedule a delivery appointment.",
      },
      {
        heading: "Damaged Shipments",
        body: "Inspect your package upon delivery. If the packaging shows signs of damage, note it on the delivery receipt before signing. Contact us within 48 hours of delivery with photos of any damage. We will arrange a replacement at no cost.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    breadcrumb: "Privacy Policy",
    sections: [
      {
        heading: "Information We Collect",
        body: "We collect information you provide when placing orders (name, email, shipping address, payment information) and information collected automatically (IP address, browser type, pages visited) through cookies and analytics tools.",
      },
      {
        heading: "How We Use Your Information",
        body: "We use your information to process orders, send shipping confirmations, provide customer support, send promotional emails (with your consent), and improve our website and products.",
      },
      {
        heading: "Information Sharing",
        body: "We do not sell your personal information. We share information only with service providers necessary to fulfill your order (payment processors, shipping carriers) and as required by law.",
      },
      {
        heading: "Cookies",
        body: "We use cookies to improve your browsing experience, remember your preferences, and analyze website traffic. You can disable cookies in your browser settings, though this may affect website functionality.",
      },
      {
        heading: "Your Rights",
        body: "You have the right to access, correct, or delete your personal information. To exercise these rights, contact us at support@cooldrivepro.com. We will respond within 30 days.",
      },
    ],
  },
};

export default function PolicyPage({ type }: PolicyPageProps) {
  const policy = policies[type];

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>{policy.breadcrumb}</span>
      </nav>

      <section className="max-w-[800px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <h1
          className="text-3xl lg:text-4xl font-extrabold mb-10"
          style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
        >
          {policy.title}
        </h1>

        <div className="space-y-8">
          {policy.sections.map(section => (
            <div key={section.heading}>
              <h2
                className="text-lg font-bold mb-3"
                style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {section.heading}
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
              >
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-12 p-6 rounded-xl"
          style={{ backgroundColor: "oklch(0.97 0.015 240)" }}
        >
          <p
            className="text-sm"
            style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            Questions about our policies? Contact us at{" "}
            <a
              href="mailto:support@cooldrivepro.com"
              className="font-semibold hover:underline"
              style={{ color: "oklch(0.45 0.18 255)" }}
            >
              support@cooldrivepro.com
            </a>{" "}
            or visit our{" "}
            <Link href="/contact" className="font-semibold hover:underline" style={{ color: "oklch(0.45 0.18 255)" }}>
              Contact Us
            </Link>{" "}
            page.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
