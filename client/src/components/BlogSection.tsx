/**
 * BlogSection Component
 * Design: 3-column card grid, white cards with shadow
 * Shows latest 6 posts with "View All 50 Articles" CTA
 */
import { useEffect, useRef } from "react";
import { Link } from "wouter";

const posts = [
  {
    slug: "best-parking-ac-for-semi-trucks",
    title: "Best Parking Air Conditioner for Semi Trucks in 2025: Top Picks & Buyer's Guide",
    excerpt: "Finding the best parking air conditioner for your semi truck requires balancing BTU output, power consumption, installation requirements, and budget.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/water-heater_e1e95553.webp",
    date: "March 10, 2025",
    category: "Buyer's Guide",
  },
  {
    slug: "12v-vs-24v-parking-ac",
    title: "12V vs 24V Parking Air Conditioner: Which Is Right for Your Truck or RV?",
    excerpt: "Choosing between a 12V and 24V parking air conditioner is one of the most important decisions when upgrading your truck or RV cooling system.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/truck-parking_20a5034a.webp",
    date: "March 8, 2025",
    category: "Technology",
  },
  {
    slug: "off-grid-rv-air-conditioning",
    title: "Off-Grid RV Air Conditioning: A Complete Guide to Solar-Powered Cooling",
    excerpt: "Traveling in an RV offers a unique sense of freedom. A solar-powered parking air conditioner changes everything, enabling truly off-grid cooling.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/mountain-landscape_00525f8e.webp",
    date: "March 5, 2025",
    category: "Guide",
  },
  {
    slug: "no-idle-ac-anti-idling-laws",
    title: "No-Idle Air Conditioning: How Parking ACs Help Truck Drivers Comply with Anti-Idling Laws",
    excerpt: "Over 30 US states have anti-idling laws. No-idle parking air conditioners provide the cooling truck drivers need during mandatory rest periods.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/rv-travel_23914cf8.webp",
    date: "March 6, 2025",
    category: "Regulations",
  },
  {
    slug: "parking-ac-battery-sizing",
    title: "How to Size Your Battery Bank for a 12V Parking Air Conditioner",
    excerpt: "Proper battery sizing is the most critical factor in parking AC system performance. Learn how to calculate the right battery capacity for your needs.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/ev-battery_64c3e4aa.webp",
    date: "February 28, 2025",
    category: "Guide",
  },
  {
    slug: "dc-powered-air-conditioners",
    title: "Why DC Powered Air Conditioners Are a Game-Changer for RV Owners",
    excerpt: "DC powered parking air conditioners have fundamentally changed the equation, enabling truly off-grid comfort for the first time without generators.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/truck-parking_20a5034a.webp",
    date: "February 18, 2025",
    category: "Technology",
  },
];

export default function BlogSection() {
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
              Parking AC Knowledge Base
            </p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold"
              style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Latest Guides & Articles
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
            View All 50 Articles →
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
                  Read More <span>→</span>
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
            Browse All 50 Parking AC Articles →
          </Link>
        </div>
      </div>
    </section>
  );
}
