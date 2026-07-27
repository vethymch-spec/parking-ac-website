import { FileText, Lock, Truck } from "lucide-react";
import { Link } from "wouter";

const paymentSteps = ["Invoice request", "Bank transfer", "Approved payment link"];

export default function CheckoutAssurance() {
  return (
    <div
      className="mb-6 rounded-lg border p-4 text-sm"
      style={{ borderColor: "oklch(0.88 0.04 240)", backgroundColor: "oklch(0.98 0.01 240)", color: "oklch(0.38 0.06 250)", fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 font-semibold" style={{ color: "oklch(0.28 0.10 250)" }}>
          <Lock size={16} /> Secure order request
        </span>
        <span className="flex items-center gap-1.5">
          <Truck size={16} /> Delivery coordinated after invoice confirmation
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FileText size={16} style={{ color: "oklch(0.45 0.18 255)" }} />
        {paymentSteps.map((method) => (
          <span
            key={method}
            className="rounded px-2 py-1 text-[0.65rem] font-bold"
            style={{ backgroundColor: "white", color: "oklch(0.35 0.08 250)", border: "1px solid oklch(0.88 0.04 240)" }}
          >
            {method}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed">
        Online card payment is temporarily unavailable. Submit an invoice request and our team will confirm stock, delivery, final total, and available payment instructions before payment.
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
        <Link href="/shipping-policy" className="hover:underline" style={{ color: "oklch(0.42 0.18 255)" }}>Shipping Policy</Link>
        <Link href="/return-policy" className="hover:underline" style={{ color: "oklch(0.42 0.18 255)" }}>Return & Refund Policy</Link>
        <Link href="/privacy-policy" className="hover:underline" style={{ color: "oklch(0.42 0.18 255)" }}>Privacy Policy</Link>
        <Link href="/payment-method" className="hover:underline" style={{ color: "oklch(0.42 0.18 255)" }}>Payment Method</Link>
      </div>
    </div>
  );
}