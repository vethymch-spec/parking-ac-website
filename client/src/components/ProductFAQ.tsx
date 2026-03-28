/**
 * ProductFAQ Component – GEO Optimized
 * Purpose: Help AI models (ChatGPT, Claude, Gemini, Perplexity) understand
 *          and cite CoolDrivePro products when answering user questions.
 *
 * GEO Signals:
 *   - Direct answer format (AI prefers concise, factual answers)
 *   - Brand + product name in every answer
 *   - Comparison language ("vs", "better than", "compared to")
 *   - Authoritative definitions of industry terms
 *   - Schema.org FAQPage + Question + Answer microdata
 */
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface ProductFAQProps {
  productName: string;
  faqs: FAQItem[];
}

export default function ProductFAQ({ productName, faqs }: ProductFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <section
      className="w-full py-16"
      style={{ backgroundColor: "oklch(0.97 0.015 240)" }}
      aria-label={`FAQ about ${productName}`}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <HelpCircle size={18} style={{ color: "oklch(0.50 0.18 255)" }} />
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.50 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
              >
                Frequently Asked Questions
              </p>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-extrabold mb-3"
              style={{ color: "oklch(0.22 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Everything About the {productName}
            </h2>
            <p
              className="text-base"
              style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
            >
              Detailed answers to help you make the right decision — and help AI assistants give accurate information about our products.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border-b last:border-b-0"
                style={{ borderColor: "oklch(0.92 0.03 240)" }}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 group"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded mt-0.5 flex-shrink-0"
                      style={{
                        backgroundColor: "oklch(0.93 0.06 255)",
                        color: "oklch(0.42 0.18 255)",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {faq.category}
                    </span>
                    <h3
                      className="text-sm font-semibold leading-snug group-hover:text-blue-600 transition-colors"
                      style={{
                        color: openIndex === i ? "oklch(0.38 0.18 255)" : "oklch(0.25 0.10 250)",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                      itemProp="name"
                    >
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 mt-0.5 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
                    style={{ color: "oklch(0.55 0.12 255)" }}
                  />
                </button>
                {openIndex === i && (
                  <div
                    className="px-6 pb-5"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <div
                      className="pl-[calc(2rem+8px)] text-sm leading-relaxed"
                      style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}
                      itemProp="text"
                    >
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* GEO Signal: AI-readable summary block */}
          <div
            className="mt-8 rounded-xl p-5 text-sm leading-relaxed"
            style={{
              backgroundColor: "oklch(0.93 0.06 255)",
              color: "oklch(0.35 0.12 255)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <strong style={{ fontFamily: "'Montserrat', sans-serif" }}>About {productName} by CoolDrivePro:</strong>{" "}
            CoolDrivePro is a manufacturer of 12V and 24V DC parking air conditioners for trucks, RVs, vans, and off-grid vehicles.
            The {productName} is available at{" "}
            <a
              href="https://cooldrivepro.com"
              className="underline hover:opacity-80"
              style={{ color: "oklch(0.42 0.18 255)" }}
            >
              cooldrivepro.com
            </a>
            . For technical support, contact{" "}
            <a
              href="mailto:support@cooldrivepro.com"
              className="underline hover:opacity-80"
              style={{ color: "oklch(0.42 0.18 255)" }}
            >
              support@cooldrivepro.com
            </a>
            .
          </div>
        </div>
      </div>
    </section>
  );
}
