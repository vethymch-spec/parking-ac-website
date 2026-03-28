import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  FileText,
  Search,
  Clock,
  CheckCircle2,
  Upload,
  MessageCircle,
  Package,
  Wrench,
  AlertCircle,
  ShieldCheck,
  LogIn,
} from "lucide-react";

const STEPS = [
  {
    step: 1,
    icon: LogIn,
    title: "Log In to Your Portal",
    desc: "Use your customer credentials (email + password) sent by our team after purchase verification.",
    color: "bg-blue-50 border-blue-200 text-blue-600",
  },
  {
    step: 2,
    icon: FileText,
    title: "Submit Your Request",
    desc: "Fill in your product model, describe the problem, and select an error code if shown on the display.",
    color: "bg-purple-50 border-purple-200 text-purple-600",
  },
  {
    step: 3,
    icon: Upload,
    title: "Upload Evidence",
    desc: "Upload a video of the unit running and a photo of the controller display. This helps us diagnose faster.",
    color: "bg-amber-50 border-amber-200 text-amber-600",
  },
  {
    step: 4,
    icon: Clock,
    title: "We Review Within 24h",
    desc: "Our technical team reviews your ticket, analyzes the evidence, and diagnoses the root cause.",
    color: "bg-green-50 border-green-200 text-green-600",
  },
  {
    step: 5,
    icon: MessageCircle,
    title: "Receive Email Response",
    desc: "We send the diagnosis, solution steps, and replacement decision directly to your email.",
    color: "bg-orange-50 border-orange-200 text-orange-600",
  },
];

const COMMON_ISSUES = [
  { code: "E01", title: "Communication Fault", desc: "Controller not communicating with the unit" },
  { code: "E02", title: "High Pressure Protection", desc: "Triggered by blocked condenser or refrigerant overcharge" },
  { code: "E03", title: "Low Pressure Protection", desc: "Refrigerant leak or blocked filter" },
  { code: "E04", title: "Compressor Overload", desc: "Overcurrent protection triggered" },
  { code: "E07", title: "Low Voltage Protection", desc: "Battery voltage too low to operate" },
  { code: "No Code", title: "No Error Code", desc: "Unit not cooling, making noise, or other issues" },
];

export default function Support() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900 text-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Wrench className="w-4 h-4" />
            After-Sales Support Center
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Exclusive Support for<br />Verified CoolDrivePro Customers
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Our after-sales portal is available exclusively to customers who have completed purchase verification.
            Log in with your credentials to submit a support request.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support/login">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-400 gap-2 text-base px-8">
                <ShieldCheck className="w-5 h-5" />
                Customer Portal Login
              </Button>
            </Link>
            <Link href="/support/ticket">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 text-base px-8">
                <Search className="w-5 h-5" />
                Check Ticket Status
              </Button>
            </Link>
          </div>
          <p className="text-slate-400 text-sm mt-5">
            Don't have an account yet?{" "}
            <Link href="/contact" className="text-blue-300 hover:text-blue-200 underline underline-offset-2">
              Contact us
            </Link>{" "}
            after your purchase — we'll verify your order and send your login credentials by email.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800">How the Support Process Works</h2>
          <p className="text-gray-500 mt-2">A simple 5-step process to get your issue resolved</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STEPS.map((s, idx) => (
            <div key={s.step} className="relative">
              {idx < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -z-10 translate-x-2" />
              )}
              <div className={`rounded-2xl border p-5 h-full ${s.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center text-xs font-bold">
                    {s.step}
                  </div>
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common error codes */}
      <div className="bg-white border-t border-b border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800">Common Issues We Handle</h2>
            <p className="text-gray-500 mt-2">Select the matching error code when submitting your request</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMON_ISSUES.map(issue => (
              <div key={issue.code} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 border border-red-200 rounded-lg px-2.5 py-1 text-sm font-bold text-red-700 shrink-0">
                    {issue.code}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{issue.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{issue.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What to prepare */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">What to Prepare Before Submitting</h2>
            <div className="space-y-3">
              {[
                { icon: FileText, text: "Your product model (VS02 PRO or VX3000SP)" },
                { icon: AlertCircle, text: "Error code shown on the controller display (if any)" },
                { icon: Upload, text: "A short video (30–60 sec) showing the unit running and the problem" },
                { icon: Upload, text: "A clear photo of the controller display showing the error code" },
                { icon: MessageCircle, text: "A description of when the problem occurs and how long it has been happening" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-gray-700 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-blue-200" />
            <h3 className="text-xl font-bold mb-2">24-Hour Response Guarantee</h3>
            <p className="text-blue-200 text-sm mb-6">
              Our technical team reviews every ticket within 24 hours and sends a detailed diagnosis to your email.
            </p>
            <Link href="/support/login">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 gap-2 w-full">
                <LogIn className="w-5 h-5" />
                Log In to Submit a Request
              </Button>
            </Link>
            <p className="text-blue-300 text-xs mt-3">
              Verified customers only · Login credentials sent by email
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
