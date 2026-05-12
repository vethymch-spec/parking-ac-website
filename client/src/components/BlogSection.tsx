/**
 * BlogSection Component
 * Design: 3-column card grid, white cards with shadow
 * Shows latest 6 posts with "View All 50 Articles" CTA
 */
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

const posts = [
  {
    slug: "best-parking-ac-2026",
    title: "Best Parking Air Conditioner 2026: 9 Units Compared",
    excerpt: "Compare rooftop, mini split, and compact DC parking AC units by BTU, noise, current draw, price, and best vehicle fit.",
    image: "https://cdn.jsdelivr.net/gh/vethymch-spec/cooldrivepro-cdn@main/best-parking-ac-2026-hero.webp",
    date: "April 23, 2026",
    category: "Buyer's Guide",
  },
  {
    slug: "parking-ac-buying-guide-2025",
    title: "Parking Air Conditioner Buying Guide 2026",
    excerpt: "Start here for BTU sizing, 12V vs 24V voltage choice, rooftop vs split format, budget tiers, and quote-ready buying criteria.",
    image: "https://cdn.jsdelivr.net/gh/vethymch-spec/cooldrivepro-cdn@main/parking-ac-buying-guide-2025-hero.webp",
    date: "April 23, 2026",
    category: "Buying Guide",
  },
  {
    slug: "12v-vs-24v-parking-ac",
    title: "12V vs 24V Parking AC: Which Voltage Fits?",
    excerpt: "See how current draw, cable sizing, vehicle architecture, and overnight runtime change between 12V and 24V parking AC systems.",
    image: "https://cdn.jsdelivr.net/gh/vethymch-spec/cooldrivepro-cdn@main/12v-vs-24v-parking-ac-hero.webp",
    date: "March 8, 2025",
    category: "Technology",
  },
  {
    slug: "parking-ac-vs-apu",
    title: "Parking AC vs Diesel APU: 5-Year Cost Comparison",
    excerpt: "Compare battery-powered parking AC and diesel APU ownership costs for fuel, maintenance, installation, emissions, and driver comfort.",
    image: "https://cdn.jsdelivr.net/gh/vethymch-spec/cooldrivepro-cdn@main/best-parking-ac-for-semi-trucks-hero.webp",
    date: "April 23, 2026",
    category: "Fleet ROI",
  },
  {
    slug: "parking-ac-installation-cost-2026",
    title: "Parking AC Installation Cost 2026: Parts, Labor & Fitment",
    excerpt: "Plan realistic installed cost by unit type, roof opening, wiring run, battery setup, and fleet or dealer installation path.",
    image: "https://cdn.jsdelivr.net/gh/vethymch-spec/cooldrivepro-cdn@main/parking-ac-diy-installation-hero.webp",
    date: "April 23, 2026",
    category: "Installation",
  },
  {
    slug: "parking-ac-fuel-savings-calculator",
    title: "Parking AC Fuel Savings Calculator: Real ROI Numbers",
    excerpt: "Estimate diesel saved by replacing engine idling with DC parking AC during sleeper-cab rest periods and fleet staging time.",
    image: "https://cdn.jsdelivr.net/gh/vethymch-spec/cooldrivepro-cdn@main/parking-ac-fuel-savings-calculator-hero.webp",
    date: "February 15, 2025",
    category: "Fleet ROI",
  },
];

export default function BlogSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.querySelectorAll(".fade-in-up").forEach((el, i) => {
            setTimeout(() => el.classList.add("visible"), i * 100);
          });
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full py-16 lg:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8" ref={ref}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('blog.knowledgeBase')}
            </p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold"
              style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('blog.latestGuides')}
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-bold px-5 py-2.5 rounded-lg border-2 transition-all hover:opacity-80 whitespace-nowrap"
            style={{
              borderColor: "oklch(0.45 0.18 255)",
              color: "oklch(0.45 0.18 255)",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            {t('blog.viewAll', { count: 50 })} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="fade-in-up blog-card"
            >
              <Link href={`/blog/${post.slug}`} className="block overflow-hidden" style={{ height: "200px" }}>
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </Link>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor: "oklch(0.94 0.04 255)",
                      color: "oklch(0.45 0.18 255)",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {post.category}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.60 0.04 250)", fontFamily: "'Inter', sans-serif" }}
                  >
                    {post.date}
                  </span>
                </div>
                <h3
                  className="text-base font-bold mb-3 leading-snug"
                  style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {post.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4 line-clamp-3"
                  style={{ color: "oklch(0.50 0.04 250)", fontFamily: "'Inter', sans-serif" }}
                >
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold flex items-center gap-1 transition-all hover:gap-2"
                  style={{ color: "oklch(0.45 0.18 255)", fontFamily: "'Inter', sans-serif" }}
                >
                  {t('blog.readMore')} <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-block px-8 py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
          >
            {t('blog.browseAll', { count: 50 })} →
          </Link>
        </div>
      </div>
    </section>
  );
}
