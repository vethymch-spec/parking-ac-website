/**
 * ShopWithUs Component
 * Design: Deep navy blue background, 4-column card layout
 * Cards: Warranty, Customer Service, Return Policy, Free Shipping
 */
import { Shield, Headphones, RotateCcw, Truck } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const cards = [
  {
    icon: Shield,
    title: "1-Year Warranty",
    description:
      "We stand behind the quality of our products. That's why we offer a 1-year warranty on all our air conditioners. This warranty covers defects in materials and workmanship.",
    link: "Warranty",
  },
  {
    icon: Headphones,
    title: "Exceptional Customer Service",
    description:
      "CoolDrivePro's Exceptional Customer Service: Guiding your journey from purchase to installation with prompt, dedicated support for your air conditioning needs.",
    link: "Contact Us",
  },
  {
    icon: RotateCcw,
    title: "30 Days Return",
    description:
      "We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.",
    link: "Return Policy",
  },
  {
    icon: Truck,
    title: "Free Shipping in United States",
    description:
      "We offer free shipping on all orders in the United States. We currently do not offer international shipping services outside of the United States.",
    link: "Shipping Policy",
  },
];

export default function ShopWithUs() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.querySelectorAll(".fade-in-up").forEach((el, i) => {
            setTimeout(() => el.classList.add("visible"), i * 120);
          });
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleLinkClick = (label: string) => {
    toast(`${label} — Feature coming soon!`);
  };

  return (
    <section
      id="shop-with-us"
      className="w-full py-16 lg:py-20"
      style={{ backgroundColor: "oklch(0.28 0.10 248)" }}
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8" ref={ref}>
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-12"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Shop with Us
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="fade-in-up rounded-xl p-6"
                style={{ backgroundColor: "oklch(0.32 0.10 248)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: "oklch(0.45 0.18 255)" }}
                >
                  <Icon size={20} color="white" />
                </div>
                <h3
                  className="text-lg font-bold text-white mb-3"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "oklch(0.80 0.04 240)", fontFamily: "'Inter', sans-serif" }}
                >
                  {card.description}
                </p>
                <button
                  onClick={() => handleLinkClick(card.link)}
                  className="text-sm font-semibold flex items-center gap-1 transition-colors hover:gap-2"
                  style={{ color: "oklch(0.70 0.15 255)", fontFamily: "'Inter', sans-serif" }}
                >
                  {card.link}
                  <span>→</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
