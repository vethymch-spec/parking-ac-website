/**
 * FAQSection Component
 * SEO: Targets "People Also Ask" (PAA) questions for "parking air conditioner"
 *      Matches JSON-LD FAQPage schema in index.html
 *      Each Q&A naturally embeds target keywords
 */
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is a parking air conditioner?",
    answer:
      "A parking air conditioner (also called a parking AC or no-idle AC unit) is a battery-powered DC air conditioning system designed to cool truck cabs, RVs, vans, and campers when the engine is off. Unlike traditional AC systems that require the engine to run, a parking air conditioner draws power directly from the vehicle's 12V or 24V battery bank — providing comfortable cooling without idling.",
    keywords: ["parking air conditioner", "no-idle AC", "12V parking AC"],
  },
  {
    question: "How long can a 12V parking air conditioner run on battery?",
    answer:
      "A 12V parking air conditioner typically runs 8–10 hours per charge. With a 480Ah lithium battery bank, expect approximately 8 hours of runtime. Upgrading to a 600Ah battery extends operation to around 10 hours. Solar charging can further extend runtime during daytime parking.",
    keywords: ["12V parking air conditioner", "battery runtime"],
  },
  {
    question: "What is the difference between a 12V and 24V parking air conditioner?",
    answer:
      "A 12V parking air conditioner is compatible with standard passenger vehicle and light truck electrical systems, making it ideal for RVs, vans, and campers. A 24V parking air conditioner is designed for heavy-duty semi trucks and commercial vehicles that use 24V electrical systems. Both provide the same no-idle cooling benefit — choose based on your vehicle's voltage.",
    keywords: ["12V parking air conditioner", "24V parking air conditioner", "semi truck"],
  },
  {
    question: "Can a parking air conditioner be used in a semi truck?",
    answer:
      "Yes — parking air conditioners are widely used in semi truck cabs. Our 12V and 24V DC parking AC units are specifically engineered for truck cab dimensions and electrical systems. They help truck drivers comply with anti-idling regulations at truck stops while maintaining a comfortable sleeping environment during mandatory rest periods.",
    keywords: ["parking air conditioner semi truck", "no-idle truck AC"],
  },
  {
    question: "Does a parking air conditioner damage the battery?",
    answer:
      "No, when equipped with undervoltage protection. Our parking air conditioners feature automatic undervoltage cutoff (8–11V threshold) that shuts off the unit before the battery drops to a damaging level. This protects your vehicle battery from deep discharge. We also recommend pairing with a lithium battery bank for optimal performance and longevity.",
    keywords: ["parking air conditioner battery protection", "undervoltage"],
  },
  {
    question: "What size parking air conditioner do I need for my RV or truck?",
    answer:
      "For most RV trailers, camper vans, and truck cabs under 200 sq ft, a 10,000–12,000 BTU parking air conditioner is sufficient. Our top-mounted 10000 BTU parking AC suits most RVs and vans, while the 12000 BTU mini split parking AC is ideal for larger truck cabs or spaces requiring faster cooling.",
    keywords: ["parking air conditioner BTU", "RV truck size"],
  },
];

function FAQItem({ faq, index }: { faq: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div
      className="border-b"
      style={{ borderColor: "oklch(0.88 0.04 240)" }}
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
    >
      <button
        className="w-full text-left py-5 flex items-start justify-between gap-4 group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <h3
          className="text-base font-semibold leading-snug group-hover:text-blue-600 transition-colors"
          style={{ color: open ? "oklch(0.40 0.18 255)" : "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          itemProp="name"
        >
          {faq.question}
        </h3>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "oklch(0.50 0.12 255)" }}
        />
      </button>
      {open && (
        <div
          className="pb-5 pr-8"
          itemScope
          itemProp="acceptedAnswer"
          itemType="https://schema.org/Answer"
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
            itemProp="text"
          >
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.classList.add("visible");
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="faq"
      className="w-full py-16 lg:py-20"
      style={{ backgroundColor: "oklch(0.97 0.015 240)" }}
      aria-label="Frequently Asked Questions about Parking Air Conditioners"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div ref={ref} className="fade-in-up text-center mb-10">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Parking Air Conditioner FAQ
            </p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold mb-3"
              style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Common Questions About Parking AC Units
            </h2>
            <p
              className="text-base"
              style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}
            >
              Everything you need to know about 12V and 24V no-idle parking air conditioners for trucks, RVs, and vans.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm px-6 py-2">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
