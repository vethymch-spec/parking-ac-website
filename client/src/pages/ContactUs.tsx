import { useState } from "react";
import { Link } from "wouter";
import { ChevronRight, Mail, Clock, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      // Submit to Netlify Function
      const response = await fetch('/.netlify/functions/form-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData).toString(),
      });
      
      if (response.ok) {
        setSubmitted(true);
        toast.success("Message sent! We'll reply within 12 hours.");
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>Contact Us</span>
      </nav>

      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Info */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}>Get in Touch</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-5" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            We're Here to Help
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            Have questions about our parking air conditioners? Need help choosing between the 12V Top-Mounted AC and Mini Split? Our team of parking AC specialists is ready to assist.
          </p>

          <div className="space-y-6">
            {[
              {
                icon: Mail,
                title: "Email Support",
                lines: ["support@cooldrivepro.com", "We reply within 1–12 hours"],
              },
              {
                icon: Clock,
                title: "Support Hours",
                lines: ["Monday – Friday: 9 AM – 6 PM PT", "Saturday: 10 AM – 4 PM PT"],
              },
              {
                icon: MessageCircle,
                title: "Live Chat",
                lines: ["Available on our website", "Mon–Fri, 9 AM – 5 PM PT"],
              },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                  <Icon size={20} style={{ color: "oklch(0.45 0.18 255)" }} />
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{title}</h3>
                  {lines.map(l => (
                    <p key={l} className="text-sm" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form - Submit to Netlify Function */}
        <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "oklch(0.92 0.06 140)" }}>
                <Mail size={28} style={{ color: "oklch(0.40 0.14 140)" }} />
              </div>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>Message Sent!</h2>
              <p className="text-sm" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                Thank you for reaching out. We'll get back to you within 12 hours.
              </p>
            </div>
          ) : (
            <form 
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <h2 className="text-xl font-extrabold mb-6" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>Send a Message</h2>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Smith"
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-blue-400"
                  style={{ borderColor: "oklch(0.85 0.04 240)", backgroundColor: "white", color: "oklch(0.25 0.10 250)" }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-blue-400"
                  style={{ borderColor: "oklch(0.85 0.04 240)", backgroundColor: "white", color: "oklch(0.25 0.10 250)" }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Question about 12V parking AC"
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-blue-400"
                  style={{ borderColor: "oklch(0.85 0.04 240)", backgroundColor: "white", color: "oklch(0.25 0.10 250)" }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us about your vehicle and cooling needs..."
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-blue-400 resize-none"
                  style={{ borderColor: "oklch(0.85 0.04 240)", backgroundColor: "white", color: "oklch(0.25 0.10 250)" }}
                />
              </div>
              
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
