/**
 * Blog Post Detail Page
 * SEO: 50 articles covering parking air conditioner topics
 * Keywords: parking air conditioner, 12V parking AC, 24V truck parking AC, RV AC, no-idle AC
 * 
 * Content is loaded from static JSON files in /data/blog/{slug}.json
 * This keeps the JS bundle small (~2KB instead of ~800KB)
 */
import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { ChevronRight, Calendar, Tag, Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";

interface BlogPostData {
  title: string;
  date: string;
  category: string;
  image: string;
  imageAlt: string;
  metaDescription: string;
  content: { heading: string | null; body: string }[];
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);
    fetch(`/data/blog/${slug}.json`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: BlogPostData) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-20 flex justify-center">
          <Loader2 className="animate-spin" size={32} style={{ color: "oklch(0.45 0.18 255)" }} />
        </div>
      </PageLayout>
    );
  }

  if (error || !post) {
    return (
      <PageLayout>
        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-extrabold mb-4" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            Article Not Found
          </h1>
          <Link href="/blog" className="text-sm font-semibold" style={{ color: "oklch(0.45 0.18 255)" }}>
            ← Back to Blog
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <Link href="/blog" className="hover:underline">Blog</Link>
        <ChevronRight size={14} />
        <span className="truncate max-w-[300px]" style={{ color: "oklch(0.35 0.10 250)" }}>{post.title}</span>
      </nav>

      <article className="max-w-[800px] mx-auto px-4 lg:px-8 py-10">
        {/* Meta */}
        <div className="flex items-center gap-4 mb-5">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1"
            style={{ backgroundColor: "oklch(0.94 0.06 255)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
          >
            <Tag size={11} />
            {post.category}
          </span>
          <span className="text-sm flex items-center gap-1" style={{ color: "oklch(0.60 0.04 250)", fontFamily: "'Inter', sans-serif" }}>
            <Calendar size={13} />
            {post.date}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-3xl lg:text-4xl font-extrabold mb-8 leading-tight"
          style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
        >
          {post.title}
        </h1>

        {/* Hero image */}
        <div className="rounded-2xl overflow-hidden mb-10 shadow-md">
          <img
            src={post.image}
            alt={post.imageAlt}
            className="w-full h-auto object-cover"
            style={{ maxHeight: "420px", objectFit: "cover" }}
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="space-y-8">
          {post.content.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2
                  className="text-xl font-extrabold mb-3"
                  style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {section.heading}
                </h2>
              )}
              {section.body.split("\\n\\n").map((para, pi) => (
                <p
                  key={pi}
                  className="text-base leading-relaxed mb-3"
                  style={{ color: "oklch(0.42 0.05 250)", fontFamily: "'Inter', sans-serif" }}
                >
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-12 p-6 rounded-2xl"
          style={{ backgroundColor: "oklch(0.28 0.10 248)" }}
        >
          <h3
            className="text-lg font-extrabold text-white mb-2"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Ready to Experience No-Idle Cooling?
          </h3>
          <p className="text-sm text-white/70 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            Explore our 12V/24V parking air conditioners — free shipping on all US orders.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products/top-mounted-ac"
              className="px-5 py-2.5 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Shop VS02 PRO Top-Mounted AC
            </Link>
            <Link
              href="/products/mini-split-ac"
              className="px-5 py-2.5 rounded-lg font-bold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Shop VX3000SP Mini Split AC
            </Link>
          </div>
        </div>
      </article>
    </PageLayout>
  );
}
