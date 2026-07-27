import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ChevronRight, Mail, Clock, MessageCircle, Loader2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import { useSEO } from "@/hooks/useSEO";
import { trackGoogleAdsConversion } from "@/lib/googleAds";
import { buildLeadEmailBody, collectLeadAttribution, submitToWeb3Forms, WEB3FORMS_KEY } from "@/lib/leadForms";

const companyAddress = {
  streetAddress: "3429 Turkey Pen Lane",
  addressLocality: "Montgomery",
  addressRegion: "AL",
  postalCode: "36104",
  addressCountry: "US",
};

const companyAddressLines = ["3429 Turkey Pen Lane", "Montgomery, AL 36104", "United States"];
const textContactLines = [
  "International / WhatsApp: +86 185 6153 4326",
  "Fastest reply via WhatsApp — text us your truck make, voltage and quantity.",
];
const productLabels: Record<string, string> = {
  "vs02-pro": "VS02 PRO Top-Mounted Parking AC",
  vx3000sp: "VX3000SP Mini Split Parking AC",
  "vth1-dc": "V-TH1 Heating & Cooling Parking AC - 12V/24V DC",
  "vth1-110v": "V-TH1 Heating & Cooling Parking AC - 110V AC",
  "nano-max": "Nano Max Light Truck Parking AC",
};

const plannerVehicleLabels: Record<string, string> = {
  "semi-truck": "Semi truck sleeper",
  rv: "RV or motorhome",
  van: "Cargo or camper van",
  "light-truck": "Pickup or work truck",
};

const plannerPriorityLabels: Record<string, string> = {
  quiet: "Quiet overnight rest",
  rooftop: "Straightforward rooftop install",
  compact: "Compact vehicle footprint",
  "all-season": "Cooling plus heating",
};

const plannerVoltageValues: Record<string, string> = {
  "12v": "12V",
  "24v": "24V",
  unknown: "Not sure",
};

const compatibilityTopicLabels: Record<string, string> = {
  "12v-24v": "12V / 24V electrical-system compatibility",
};

const fitmentSourceLabels: Record<string, string> = {
  "vehicle-compatibility": "Vehicle Compatibility Hub",
  "dealer-guide": "Dealer Local Market Fitment Guide",
};

export default function ContactUs() {
  const { t } = useTranslation();

  useSEO({
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact CoolDrivePro",
      "description": "Get in touch with CoolDrivePro for parking air conditioner support, sales inquiries, and technical assistance.",
      "url": "https://cooldrivepro.com/contact",
      "mainEntity": {
        "@type": "Organization",
        "name": "CoolDrivePro",
        "email": "support@cooldrivepro.com",
        "telephone": "+86 185 6153 4326",
        "address": {
          "@type": "PostalAddress",
          ...companyAddress
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@cooldrivepro.com",
          "telephone": "+86 185 6153 4326",
          "contactType": "customer service",
          "availableLanguage": "English",
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "09:00",
            "closes": "18:00"
          }
        }
      }
    }
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    country: "",
    phone: "",
    inquiryType: "",
    voltage: "",
    quantity: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const intent = params.get("intent");
    const productId = params.get("productId") || "";
    const productName = params.get("product") || productLabels[productId] || "CoolDrivePro parking AC";
    const quantityParam = params.get("quantity") || "";
    const vehicle = params.get("vehicle") || "";
    const priority = params.get("priority") || "";
    const voltageParam = params.get("voltage") || "";
    const topic = params.get("topic") || "";
    const source = params.get("source") || "";

    if (intent === "quote") {
      setFormData((current) => ({
        ...current,
        inquiryType: current.inquiryType || "Fleet / Dealer Quote",
        subject: current.subject || "Fleet / Dealer quote request",
      }));
      return;
    }

    if (intent === "fitment-planner") {
      const vehicleLabel = plannerVehicleLabels[vehicle] || "Vehicle details to confirm";
      const priorityLabel = plannerPriorityLabels[priority] || "Operating priority to confirm";
      const voltage = plannerVoltageValues[voltageParam] || "";

      setFormData((current) => ({
        ...current,
        inquiryType: current.inquiryType || "Single-Unit Quote",
        voltage: current.voltage || voltage,
        subject: current.subject || `Parking AC fitment review: ${vehicleLabel}`,
        message:
          current.message ||
          `Hi CoolDrivePro,\n\nPlease confirm parking AC fitment for:\nRecommended path: ${productName}\nVehicle: ${vehicleLabel}\nElectrical system: ${voltage || "Need to confirm"}\nOperating priority: ${priorityLabel}\n\nI can provide roof photos, battery details, cable-routing information, and service-access requirements.\n\nThank you.`,
      }));
      return;
    }

    if (intent === "compatibility") {
      const vehicleLabel = plannerVehicleLabels[vehicle] || "";
      const topicLabel = compatibilityTopicLabels[topic] || "";
      const sourceLabel = fitmentSourceLabels[source] || "";
      const requestFocus = vehicleLabel || topicLabel || "Parking AC compatibility";
      const requestDetails = [
        vehicleLabel ? `Vehicle: ${vehicleLabel}` : "",
        topicLabel ? `Focus: ${topicLabel}` : "",
        sourceLabel ? `Source: ${sourceLabel}` : "",
      ].filter(Boolean).join("\n");

      setFormData((current) => ({
        ...current,
        inquiryType: current.inquiryType || "Single-Unit Quote",
        subject: current.subject || `Parking AC compatibility review: ${requestFocus}`,
        message:
          current.message ||
          `Hi CoolDrivePro,\n\nPlease confirm parking AC compatibility for:\n${requestDetails}\n\nI can provide vehicle and roof photos, battery details, target runtime, cable-routing information, and service-access requirements.\n\nThank you.`,
      }));
      return;
    }

    if (intent === "dealer-fitment") {
      const sourceLabel = fitmentSourceLabels[source] || "Dealer fitment request";

      setFormData((current) => ({
        ...current,
        inquiryType: current.inquiryType || "Fleet / Dealer Quote",
        subject: current.subject || "Parking AC dealer fitment plan",
        message:
          current.message ||
          `Hi CoolDrivePro,\n\nI would like a parking AC dealer fitment plan.\nSource: ${sourceLabel}\n\nI can share my local vehicle mix, target customer types, voltage demand, installation capacity, climate, and expected order quantities.\n\nThank you.`,
      }));
      return;
    }

    if (intent !== "invoice" && !productId) return;

    setFormData((current) => ({
      ...current,
      inquiryType: current.inquiryType || "Quote / Invoice request",
      quantity: current.quantity || quantityParam || "",
      subject: current.subject || `Invoice request for ${productName}`,
      message:
        current.message ||
        `Hi CoolDrivePro,\n\nI would like to request an invoice and payment instructions for:\nProduct: ${productName}\nQuantity: ${quantityParam || "1"}\n\nPlease confirm availability, shipping timeline, final total, and accepted payment method.\n\nThank you.`,
    }));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const inquiryLabel = formData.inquiryType.trim() || "General inquiry";
    const requestSubject = formData.subject.trim() || `${inquiryLabel} — CoolDrivePro`;
    const payload: Record<string, string> = {
      from_name: "CoolDrivePro Contact Form",
      subject: `[${inquiryLabel}] ${requestSubject}`,
      source_page: typeof window !== "undefined" ? window.location.href : "/contact",
      lead_variant: "contact_page",
      inquiry_subject: requestSubject,
      inquiry_type: inquiryLabel,
      name: formData.name,
      email: formData.email,
      company: formData.company,
      country: formData.country,
      phone: formData.phone,
      voltage: formData.voltage,
      quantity: formData.quantity,
      message: formData.message,
      ...collectLeadAttribution(),
    };

    const openMailDraftFallback = () => {
      window.location.href = `mailto:support@cooldrivepro.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(buildLeadEmailBody(payload))}`;
      toast.error("We could not send your request online. A pre-filled email draft has opened; send it to complete your request.");
    };
    
    try {
      if (!WEB3FORMS_KEY) {
        openMailDraftFallback();
        return;
      }
      await submitToWeb3Forms(payload);
      setSubmitted(true);
      trackGoogleAdsConversion("contact_form", {
        form_name: "contact",
        lead_source: "contact_page",
        submission_method: "web3forms",
      });
      toast.success(t('contact.form.success'));
    } catch {
      openMailDraftFallback();
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t('contact.emailSupport.title'),
      lines: t('contact.emailSupport.lines', { returnObjects: true }) as string[],
    },
    {
      icon: Clock,
      title: t('contact.supportHours.title'),
      lines: t('contact.supportHours.lines', { returnObjects: true }) as string[],
    },
    {
      icon: MessageCircle,
      title: t('contact.liveChat.title'),
      lines: t('contact.liveChat.lines', { returnObjects: true }) as string[],
    },
    {
      icon: Phone,
      title: "Text Contact",
      lines: textContactLines,
    },
    {
      icon: MapPin,
      title: "Mailing Address",
      lines: companyAddressLines,
    },
  ];

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        <Link href="/" className="hover:underline">{t('nav.home')}</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>{t('contact.breadcrumb')}</span>
      </nav>

      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Info */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}>{t('contact.getInTouch')}</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-5" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            {t('contact.hereToHelp')}
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            {t('contact.description')}
          </p>

          <div className="space-y-6">
            {contactInfo.map(({ icon: Icon, title, lines }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                  <Icon size={20} style={{ color: "oklch(0.45 0.18 255)" }} />
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{title}</h3>
                  {lines.map((l, i) => (
                    <p key={i} className="text-sm" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{l}</p>
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
              <h2 className="text-xl font-extrabold mb-2" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{t('contact.messageSent')}</h2>
              <p className="text-sm" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                {t('contact.thankYou')}
              </p>
            </div>
          ) : (
            <form 
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <h2 className="text-xl font-extrabold mb-2" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{t('contact.sendMessage')}</h2>
              <p className="text-xs mb-4" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                Tell us about your fleet or single-unit need — sales replies within 1–12 hours.
              </p>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>Inquiry Type *</label>
                <select
                  name="inquiryType"
                  aria-label="Inquiry Type"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-blue-400"
                  style={{ borderColor: "oklch(0.85 0.04 240)", backgroundColor: "white", color: "oklch(0.25 0.10 250)" }}
                >
                  <option value="">Select...</option>
                  <option value="Fleet / Dealer Quote">Fleet / Dealer Quote</option>
                  <option value="Single-Unit Quote">Single-Unit Quote</option>
                  <option value="Become a Dealer / Distributor">Become a Dealer / Distributor</option>
                  <option value="OEM / Custom Inquiry">OEM / Custom Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Warranty / RMA">Warranty / RMA</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>{t('contact.form.name')} *</label>
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
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>Company / Fleet</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Acme Trucking LLC"
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-blue-400"
                    style={{ borderColor: "oklch(0.85 0.04 240)", backgroundColor: "white", color: "oklch(0.25 0.10 250)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>Business Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@acmetrucking.com"
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-blue-400"
                    style={{ borderColor: "oklch(0.85 0.04 240)", backgroundColor: "white", color: "oklch(0.25 0.10 250)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>Phone / WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555 123 4567"
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-blue-400"
                    style={{ borderColor: "oklch(0.85 0.04 240)", backgroundColor: "white", color: "oklch(0.25 0.10 250)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="United States"
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-blue-400"
                    style={{ borderColor: "oklch(0.85 0.04 240)", backgroundColor: "white", color: "oklch(0.25 0.10 250)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>Voltage</label>
                  <select
                    name="voltage"
                    aria-label="Voltage"
                    value={formData.voltage}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-blue-400"
                    style={{ borderColor: "oklch(0.85 0.04 240)", backgroundColor: "white", color: "oklch(0.25 0.10 250)" }}
                  >
                    <option value="">Select...</option>
                    <option value="12V">12V</option>
                    <option value="24V">24V</option>
                    <option value="110V AC">110V AC</option>
                    <option value="Not sure">Not sure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>Quantity</label>
                  <select
                    name="quantity"
                    aria-label="Quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-blue-400"
                    style={{ borderColor: "oklch(0.85 0.04 240)", backgroundColor: "white", color: "oklch(0.25 0.10 250)" }}
                  >
                    <option value="">Select...</option>
                    <option value="1">1 unit</option>
                    <option value="2-9">2–9 units</option>
                    <option value="10-24">10–24 units</option>
                    <option value="25-49">25–49 units</option>
                    <option value="50+">50+ units</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "oklch(0.35 0.08 250)", fontFamily: "'Inter', sans-serif" }}>{t('contact.form.message')}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Truck make / model, target runtime, any specific requirement (optional)"
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
                    {t('contact.form.sending')}
                  </>
                ) : (
                  "Send Inquiry → Reply within 12 hours"
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
