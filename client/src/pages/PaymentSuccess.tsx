import { Link } from "wouter";
import { CheckCircle2, Mail, PackageCheck } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useSEO } from "@/hooks/useSEO";

export default function PaymentSuccess() {
  useSEO({
    title: "Order Request Received | CoolDrivePro",
    description: "Thank you for contacting CoolDrivePro. Our team will review your order request and follow up with confirmation details.",
  });

  const params = new URLSearchParams(window.location.search);
  const requestReference = params.get("reference") || params.get("payment_link_id") || params.get("session_id");

  return (
    <PageLayout>
      <main className="max-w-[900px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="rounded-xl border border-blue-100 bg-white p-6 lg:p-10 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 size={34} />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Order request received</p>
              <h1 className="mt-2 text-3xl lg:text-4xl font-extrabold text-slate-900">Thank you for your request.</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                CoolDrivePro will review the order details and contact you with availability, shipping timing, invoice details, and any fitment questions if needed.
              </p>
              {requestReference ? (
                <p className="mt-3 text-sm text-slate-500">Request reference: {requestReference}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <PackageCheck className="mb-3 text-blue-700" size={22} />
                <h2 className="font-bold text-slate-900">Order processing</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Most orders are reviewed within one business day before shipment is arranged.</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <Mail className="mb-3 text-blue-700" size={22} />
                <h2 className="font-bold text-slate-900">Need help?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Email support@cooldrivepro.com with your request reference for invoice or shipping questions.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/support/ticket" className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800">
                Contact Support
              </Link>
              <Link href="/products" className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}