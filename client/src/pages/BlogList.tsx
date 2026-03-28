/**
 * Blog List Page
 * SEO: Comprehensive blog index with 50 articles covering parking air conditioner topics
 * Design: Grid layout with category filter, pagination
 *
 * Content loaded from /data/blog/list.json to keep JS bundle small
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronRight, Tag, Calendar, Search, Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";

interface BlogListItem {
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
}

const POSTS_PER_PAGE = 12;

export default function BlogList() {
  const [allPosts, setAllPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/data/blog/list.json")
      .then(res => res.json())
      .then((data: BlogListItem[]) => {
        setAllPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(allPosts.map(p => p.category))).sort()];

  const filtered = allPosts.filter(p => {
    const matchCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>Blog</span>
      </nav>

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "oklch(0.50 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}>
            Parking Air Conditioner Knowledge Base
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            Parking AC Blog & Guides
          </h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            Expert guides, comparisons, and tips for 12V/24V parking air conditioners — for truck drivers, RV owners, and van lifers.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" size={32} style={{ color: "oklch(0.45 0.18 255)" }} />
          </div>
        ) : (
          <>
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.60 0.05 250)" }} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                  style={{
                    borderColor: "oklch(0.85 0.03 240)",
                    backgroundColor: "oklch(0.98 0.01 240)",
                    color: "oklch(0.30 0.08 250)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                    style={{
                      backgroundColor: selectedCategory === cat ? "oklch(0.45 0.18 255)" : "oklch(0.92 0.03 240)",
                      color: selectedCategory === cat ? "white" : "oklch(0.45 0.08 250)",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm mb-6" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
              {filtered.length} article{filtered.length !== 1 ? "s" : ""} found
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {searchQuery && ` for "${searchQuery}"`}
            </p>

            {/* Grid */}
            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {paginated.map(post => (
                  <article
                    key={post.slug}
                    className="rounded-2xl overflow-hidden shadow-sm border transition-shadow hover:shadow-md"
                    style={{ borderColor: "oklch(0.90 0.02 240)", backgroundColor: "white" }}
                  >
                    <Link href={`/blog/${post.slug}`} className="block overflow-hidden" style={{ height: "200px" }}>
                      <img
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </Link>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1"
                          style={{ backgroundColor: "oklch(0.94 0.04 255)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
                        >
                          <Tag size={10} />
                          {post.category}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: "oklch(0.60 0.04 250)", fontFamily: "'Inter', sans-serif" }}>
                          <Calendar size={11} />
                          {post.date}
                        </span>
                      </div>
                      <h2 className="text-base font-bold mb-2 leading-snug" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
                        <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
                      </h2>
                      <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: "oklch(0.50 0.04 250)", fontFamily: "'Inter', sans-serif" }}>
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
            ) : (
              <div className="text-center py-16">
                <p className="text-lg font-semibold mb-2" style={{ color: "oklch(0.40 0.08 250)", fontFamily: "'Montserrat', sans-serif" }}>No articles found</p>
                <p className="text-sm" style={{ color: "oklch(0.60 0.04 250)", fontFamily: "'Inter', sans-serif" }}>Try a different search term or category.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ backgroundColor: "oklch(0.92 0.03 240)", color: "oklch(0.35 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-9 h-9 rounded-lg text-sm font-bold transition-all"
                    style={{
                      backgroundColor: currentPage === page ? "oklch(0.45 0.18 255)" : "oklch(0.92 0.03 240)",
                      color: currentPage === page ? "white" : "oklch(0.35 0.10 250)",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ backgroundColor: "oklch(0.92 0.03 240)", color: "oklch(0.35 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
