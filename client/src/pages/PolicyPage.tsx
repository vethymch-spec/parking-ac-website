/**
 * Generic Policy Page – renders Warranty / Return / Shipping / Privacy / Terms / Payment / Billing
 * based on the `type` prop
 */
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";

type PolicyType = "warranty" | "return" | "shipping" | "privacy" | "terms" | "payment" | "billing";

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
    title: "30-Day Return & Refund Policy",
    breadcrumb: "Return & Refund Policy",
    sections: [
      {
        heading: "Return Window",
        body: "We accept eligible returns within 30 days of the delivery date. Items must be in original, unused condition with all original packaging, accessories, manuals, mounting hardware, and documentation included.",
      },
      {
        heading: "How to Initiate a Return",
        body: "Email support@cooldrivepro.com with your order number, delivery date, return reason, and photos or video when the item is damaged or defective. We will provide a Return Merchandise Authorization (RMA) number and return shipping instructions within 2 business days. Do not ship items back before receiving authorization.",
      },
      {
        heading: "Eligible Return Cases",
        body: "Returns may be approved for defective products, damaged shipments reported on time, incorrect items, unopened unused products, or customer change-of-mind returns that meet the condition requirements. Installed, modified, wired, cut, damaged by installation, or visibly used units are not eligible for a standard return.",
      },
      {
        heading: "Return Shipping",
        body: "For returns caused by confirmed defects, wrong items, or shipping damage, CoolDrivePro covers reasonable return shipping costs. For change-of-mind or customer ordering mistakes, the customer is responsible for return shipping and any carrier surcharges.",
      },
      {
        heading: "Refund Processing",
        body: "After we receive and inspect the returned item, approved refunds are processed within 5-7 business days to the original payment method. Your bank or card issuer may take an additional 3-5 business days to post the refund. We will email you when the refund is submitted.",
      },
      {
        heading: "Refund Contact Method",
        body: "For refund questions, return status, or an item that arrived damaged, contact support@cooldrivepro.com with your order number. This is the official support channel for return and refund handling.",
      },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    breadcrumb: "Shipping Policy",
    sections: [
      {
        heading: "Free Standard Shipping",
        body: "CoolDrivePro offers free standard shipping on parking air conditioner orders delivered within the contiguous United States (the lower 48 states). Product pages and invoice request materials show the shipping offer before payment so customers can confirm the delivery cost before submitting an order.",
      },
      {
        heading: "Shipping Markets",
        body: "Our standard shipping offer currently supports the lower 48 United States. Alaska, Hawaii, US territories, PO boxes, APO/FPO addresses, and international destinations require written support approval and a freight quote before purchase.",
      },
      {
        heading: "Processing Time",
        body: "Orders are processed within 1-2 business days after payment confirmation and delivery address review. Orders placed on weekends or US holidays are processed on the next business day.",
      },
      {
        heading: "Delivery Time and Options",
        body: "Standard delivery usually takes 5-8 business days after processing. If expedited or special freight service is available for an order, the price and estimated delivery time are shown before payment. Delivery times may vary during peak seasons, severe weather, or carrier delays.",
      },
      {
        heading: "Freight Shipping",
        body: "Because parking air conditioner units are large and heavy, some orders ship by parcel carrier and some by LTL freight. You will receive tracking details after dispatch, and freight carriers may contact you to schedule a delivery appointment. Customers are responsible for providing a reachable phone number and accessible delivery location.",
      },
      {
        heading: "Taxes, Customs, and Special Quotes",
        body: "Applicable sales tax or delivery surcharges are shown before payment when required. For any support-approved export or special-market shipment, the customer is responsible for import duties, customs clearance, brokerage fees, local taxes, and compliance with local regulations unless a written quote states otherwise.",
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
        body: "We collect information you provide when placing orders, contacting support, or submitting forms, including name, email address, phone or messaging details, shipping address, billing address, order details, and support messages. We also collect limited technical information such as IP address, browser type, device data, pages visited, cookies, and analytics events.",
      },
      {
        heading: "How We Use Your Information",
        body: "We use personal information to process payments and orders, confirm shipping, provide customer support, manage warranty or return requests, prevent fraud, improve our website and products, measure advertising performance, and send promotional emails only when you have consented or where permitted by applicable law.",
      },
      {
        heading: "Information Sharing",
        body: "We do not sell your personal information or sell customer contact lists. We share information only with service providers needed to operate the business, such as payment processors, shipping carriers, email/form providers, analytics tools, fraud-prevention providers, and professional advisers, or when required by law.",
      },
      {
        heading: "Secure Payment Links and Card Data",
        body: "CoolDrivePro does not collect full card numbers, CVV codes, or complete payment credentials directly on this website. If a secure payment link is offered after order review, card details are entered only on the listed payment processor's encrypted page.",
      },
      {
        heading: "Advertising and Consent",
        body: "We may use cookies, analytics, and advertising pixels to understand website performance and measure campaigns. We do not use your contact information for unrelated third-party advertising without your consent.",
      },
      {
        heading: "Cookies",
        body: "We use cookies to improve your browsing experience, remember your preferences, and analyze website traffic. You can disable cookies in your browser settings, though this may affect website functionality.",
      },
      {
        heading: "Your Rights",
        body: "Depending on your location, you may have the right to access, correct, delete, or limit the use of your personal information. To exercise these rights, contact us at support@cooldrivepro.com. We will respond within 30 days or within the timeframe required by applicable law.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    breadcrumb: "Terms of Service",
    sections: [
      {
        heading: "Use of the Website",
        body: "By using the CoolDrivePro website, requesting support, or placing an order, you agree to use our content, tools, product information, and order request flow only for lawful personal or business purposes related to evaluating, purchasing, installing, or servicing parking air conditioner products.",
      },
      {
        heading: "Product Information",
        body: "We work to keep product specifications, compatibility guidance, pricing, shipping details, and availability accurate. Parking AC performance can vary by vehicle layout, battery capacity, installation quality, climate, and operating conditions, so published specifications should be used together with professional installation judgment.",
      },
      {
        heading: "Orders and Acceptance",
        body: "An order or invoice request confirmation means we received your request. Final acceptance occurs after CoolDrivePro confirms availability, shipping details, payment instructions, and order readiness. We may contact you to verify vehicle fitment, delivery details, or billing information before fulfillment.",
      },
      {
        heading: "Installation Responsibility",
        body: "CoolDrivePro parking air conditioners should be installed according to the supplied instructions and applicable electrical, safety, and vehicle requirements. Customers are responsible for proper mounting, sealing, wiring, fuse protection, and battery configuration unless installation is performed by an authorized service provider.",
      },
      {
        heading: "Warranty, Returns, and Support",
        body: "Warranty, return, and shipping matters are governed by the applicable CoolDrivePro policy pages. If you need help before or after purchase, contact support@cooldrivepro.com with your order number, vehicle details, and photos or videos when relevant.",
      },
    ],
  },
  payment: {
    title: "Payment Method",
    breadcrumb: "Payment Method",
    sections: [
      {
        heading: "Accepted Payment Methods",
        body: "CoolDrivePro currently accepts approved orders by manual invoice. Depending on customer location, order type, and processor availability, payment instructions may include bank transfer, wire transfer, or an approved secure payment link. The available method, currency, taxes, shipping charges, and final total are confirmed before payment is requested.",
      },
      {
        heading: "Secure Payment Processing",
        body: "Online card payment is temporarily unavailable on the website. CoolDrivePro does not ask customers to send full card numbers by email, chat, or contact form. Any future hosted payment link will be processed by the listed provider on an encrypted page and reviewed before it is offered on the website.",
      },
      {
        heading: "Order Request Policy Links",
        body: "Before submitting an invoice request, customers can review the Shipping Policy, Return & Refund Policy, Privacy Policy, Payment Method, and Billing Terms from the website footer and product order area. The final order total, including any applicable taxes or shipping charges, is confirmed before payment is requested.",
      },
      {
        heading: "Authorization and Capture",
        body: "No payment is authorized or captured when you submit the website request form. Payment is due only after CoolDrivePro confirms the order details and sends valid invoice or payment instructions.",
      },
      {
        heading: "Sales Tax and Fees",
        body: "Applicable sales tax, shipping upgrades, freight charges, or handling fees are calculated before invoice payment when required by law or selected by the customer. The final order total is confirmed before payment is requested.",
      },
      {
        heading: "Payment Support",
        body: "For invoice questions, duplicate payment concerns, or refund status, contact support@cooldrivepro.com with your order number or invoice reference. Do not send full card numbers by email, chat, or contact form.",
      },
    ],
  },
  billing: {
    title: "Billing Terms",
    breadcrumb: "Billing Terms",
    sections: [
      {
        heading: "Currency and Pricing",
        body: "All CoolDrivePro prices are listed in US dollars unless otherwise stated. Product pricing, promotional offers, shipping options, and taxes may change over time, but confirmed orders are billed according to the final invoice or approved payment instruction confirmed before purchase.",
      },
      {
        heading: "Invoices and Receipts",
        body: "A receipt, order confirmation, or invoice is sent to the email address provided with the order request. Business customers who need a formal invoice can contact support@cooldrivepro.com with the order number, company name, billing address, and any required tax details.",
      },
      {
        heading: "Billing Information",
        body: "Customers are responsible for providing accurate billing names, addresses, tax information, and contact details. Incorrect billing information may delay payment verification, order processing, or invoice issuance.",
      },
      {
        heading: "Cancellations and Adjustments",
        body: "If you need to cancel or modify an order, contact us as soon as possible. Orders that have already shipped may need to follow the return process. Approved price adjustments, refunds, or credits are issued to the original payment method whenever possible.",
      },
      {
        heading: "Billing Questions",
        body: "For billing questions, duplicate charges, invoice requests, or refund status updates, contact support@cooldrivepro.com. Include your order number and billing email so our team can review the account quickly.",
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
