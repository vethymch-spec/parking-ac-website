/**
 * ProductReviews Component
 * Design: Clean, trust-building review section with star ratings, verified badges,
 * rating distribution bar, and paginated review cards.
 * Style: Matches site's navy/slate color palette with warm amber stars.
 */

import { useState } from "react";
import { Star, ThumbsUp, CheckCircle, ChevronDown } from "lucide-react";

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
}

interface ProductReviewsProps {
  reviews: Review[];
  productName: string;
  averageRating: number;
}

const REVIEWS_PER_PAGE = 8;

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= rating ? "oklch(0.75 0.18 80)" : "none"}
          stroke={i <= rating ? "oklch(0.75 0.18 80)" : "oklch(0.65 0.05 250)"}
        />
      ))}
    </div>
  );
}

function RatingBar({ count, total, stars }: { count: number; total: number; stars: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-6 text-right" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        {stars}
      </span>
      <Star size={12} fill="oklch(0.75 0.18 80)" stroke="oklch(0.75 0.18 80)" />
      <div className="flex-1 h-2 rounded-full" style={{ background: "oklch(0.92 0.02 250)" }}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "oklch(0.75 0.18 80)" }}
        />
      </div>
      <span className="text-sm w-8" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        {count}
      </span>
    </div>
  );
}

export default function ProductReviews({ reviews, productName, averageRating }: ProductReviewsProps) {
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"helpful" | "recent">("helpful");

  const totalReviews = reviews.length;

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  // Filter + sort
  const filtered = reviews
    .filter((r) => filterRating === null || r.rating === filterRating)
    .sort((a, b) =>
      sortBy === "helpful" ? b.helpful - a.helpful : new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <section className="py-16 px-4" style={{ background: "oklch(0.97 0.01 250)" }}>
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <h2
          className="text-3xl font-bold mb-10"
          style={{ color: "oklch(0.22 0.10 255)", fontFamily: "'Montserrat', sans-serif" }}
        >
          Customer Reviews
        </h2>

        {/* Summary + Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 p-8 rounded-2xl" style={{ background: "#fff", boxShadow: "0 2px 16px oklch(0.22 0.10 255 / 0.07)" }}>
          {/* Left: Overall score */}
          <div className="flex flex-col items-center justify-center gap-3 border-b md:border-b-0 md:border-r pb-8 md:pb-0 md:pr-10" style={{ borderColor: "oklch(0.90 0.02 250)" }}>
            <span
              className="text-7xl font-extrabold leading-none"
              style={{ color: "oklch(0.22 0.10 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              {averageRating.toFixed(1)}
            </span>
            <StarRating rating={Math.round(averageRating)} size={24} />
            <span className="text-sm mt-1" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
              Based on {totalReviews} verified reviews
            </span>
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full" style={{ background: "oklch(0.94 0.06 145)" }}>
              <CheckCircle size={14} style={{ color: "oklch(0.45 0.15 145)" }} />
              <span className="text-xs font-semibold" style={{ color: "oklch(0.35 0.15 145)", fontFamily: "'Inter', sans-serif" }}>
                All reviews verified
              </span>
            </div>
          </div>

          {/* Right: Distribution bars */}
          <div className="flex flex-col gap-3 justify-center pl-0 md:pl-10">
            {dist.map((d) => (
              <button
                key={d.stars}
                onClick={() => setFilterRating(filterRating === d.stars ? null : d.stars)}
                className="w-full text-left hover:opacity-80 transition-opacity"
              >
                <RatingBar count={d.count} total={totalReviews} stars={d.stars} />
              </button>
            ))}
          </div>
        </div>

        {/* Filter + Sort controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-sm font-medium" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            Filter:
          </span>
          {[null, 5, 4, 3].map((r) => (
            <button
              key={r ?? "all"}
              onClick={() => { setFilterRating(r); setVisibleCount(REVIEWS_PER_PAGE); }}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: filterRating === r ? "oklch(0.35 0.15 255)" : "#fff",
                color: filterRating === r ? "#fff" : "oklch(0.45 0.05 250)",
                border: `1.5px solid ${filterRating === r ? "oklch(0.35 0.15 255)" : "oklch(0.85 0.03 250)"}`,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {r === null ? "All" : `${r} Stars`}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>Sort:</span>
            <button
              onClick={() => setSortBy("helpful")}
              className="px-3 py-1.5 rounded-full text-sm transition-all"
              style={{
                background: sortBy === "helpful" ? "oklch(0.35 0.15 255)" : "transparent",
                color: sortBy === "helpful" ? "#fff" : "oklch(0.55 0.05 250)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Most Helpful
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className="px-3 py-1.5 rounded-full text-sm transition-all"
              style={{
                background: sortBy === "recent" ? "oklch(0.35 0.15 255)" : "transparent",
                color: sortBy === "recent" ? "#fff" : "oklch(0.55 0.05 250)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Most Recent
            </button>
          </div>
        </div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {visible.map((review) => (
            <div
              key={review.id}
              className="p-6 rounded-2xl flex flex-col gap-3"
              style={{ background: "#fff", boxShadow: "0 2px 12px oklch(0.22 0.10 255 / 0.06)" }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-base"
                      style={{ color: "oklch(0.22 0.10 255)", fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {review.name}
                    </span>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(0.94 0.06 145)", color: "oklch(0.35 0.15 145)", fontFamily: "'Inter', sans-serif" }}>
                        <CheckCircle size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "oklch(0.65 0.04 250)", fontFamily: "'Inter', sans-serif" }}>
                    {review.location}
                  </span>
                </div>
                <span className="text-xs shrink-0" style={{ color: "oklch(0.65 0.04 250)", fontFamily: "'Inter', sans-serif" }}>
                  {review.date}
                </span>
              </div>

              {/* Stars + title */}
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size={14} />
              </div>
              <p
                className="font-semibold text-sm"
                style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
              >
                {review.title}
              </p>

              {/* Body */}
              <p
                className="text-sm leading-relaxed flex-1"
                style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}
              >
                {review.body}
              </p>

              {/* Helpful */}
              <div className="flex items-center gap-1.5 mt-1">
                <ThumbsUp size={13} style={{ color: "oklch(0.65 0.04 250)" }} />
                <span className="text-xs" style={{ color: "oklch(0.65 0.04 250)", fontFamily: "'Inter', sans-serif" }}>
                  {review.helpful} found this helpful
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="text-center">
            <button
              onClick={() => setVisibleCount((c) => c + REVIEWS_PER_PAGE)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: "oklch(0.35 0.15 255)", color: "#fff", fontFamily: "'Montserrat', sans-serif" }}
            >
              Load More Reviews
              <ChevronDown size={16} />
            </button>
            <p className="text-xs mt-3" style={{ color: "oklch(0.65 0.04 250)", fontFamily: "'Inter', sans-serif" }}>
              Showing {visible.length} of {filtered.length} reviews
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
