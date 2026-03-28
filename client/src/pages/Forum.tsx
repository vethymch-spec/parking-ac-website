import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Eye,
  ThumbsUp,
  Clock,
  Search,
  Plus,
  Star,
  Wrench,
  AlertTriangle,
  Zap,
  Truck,
  BarChart2,
  Pin,
  ChevronRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  star: <Star className="w-4 h-4" />,
  wrench: <Wrench className="w-4 h-4" />,
  "alert-triangle": <AlertTriangle className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  truck: <Truck className="w-4 h-4" />,
  "bar-chart": <BarChart2 className="w-4 h-4" />,
  "message-circle": <MessageCircle className="w-4 h-4" />,
};

function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default function Forum() {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const { data: categories } = trpc.forum.getCategories.useQuery();
  const { data: postsData, isLoading } = trpc.forum.getPosts.useQuery({
    categoryId: selectedCategory,
    search: search || undefined,
    page,
    limit: 20,
  });

  const posts = postsData?.posts ?? [];
  const total = postsData?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryClick = (id?: number) => {
    setSelectedCategory(id);
    setPage(1);
  };

  const selectedCat = categories?.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white pt-24 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Parking AC Community Forum</h1>
          <p className="text-blue-100 text-lg mb-6">
            Share experiences, ask questions, and connect with truck drivers, van lifers, and RV enthusiasts worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {isAuthenticated ? (
              <Link href="/forum/new-post">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold gap-2">
                  <Plus className="w-4 h-4" /> Start a Discussion
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold gap-2">
                  <Plus className="w-4 h-4" /> Sign In to Post
                </Button>
              </a>
            )}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <Input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search discussions..."
                className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400"
              />
              <Button type="submit" variant="outline" className="border-white/40 text-white hover:bg-white/20 bg-transparent">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar: categories */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Categories</h2>
              </div>
              <nav className="p-2">
                <button
                  onClick={() => handleCategoryClick(undefined)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-sm transition-colors ${
                    !selectedCategory ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> All Discussions
                  </span>
                  <span className="text-xs text-gray-400">{total}</span>
                </button>
                {categories?.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-sm transition-colors ${
                      selectedCategory === cat.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span style={{ color: cat.color ?? "#6b7280" }}>
                        {ICON_MAP[cat.icon ?? "message-circle"] ?? <MessageCircle className="w-4 h-4" />}
                      </span>
                      {cat.name}
                    </span>
                    <span className="text-xs text-gray-400">{cat.postCount ?? 0}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-4 p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link href="/products/top-mounted-ac" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <ChevronRight className="w-3 h-3" /> VS02 PRO Top-Mounted AC
                </Link>
                <Link href="/products/mini-split-ac" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <ChevronRight className="w-3 h-3" /> VX3000SP Mini-Split AC
                </Link>
                <Link href="/blog" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <ChevronRight className="w-3 h-3" /> Installation Guides
                </Link>
                <Link href="/contact" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <ChevronRight className="w-3 h-3" /> Contact Support
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-800">
                  {selectedCat ? selectedCat.name : search ? `Search: "${search}"` : "All Discussions"}
                </h2>
                <p className="text-sm text-gray-500">{total} threads</p>
              </div>
            </div>

            {/* Post list */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No discussions yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to start a conversation!</p>
                {isAuthenticated ? (
                  <Link href="/forum/new-post">
                    <Button className="mt-4 gap-2">
                      <Plus className="w-4 h-4" /> Start Discussion
                    </Button>
                  </Link>
                ) : (
                  <a href={getLoginUrl()}>
                    <Button className="mt-4 gap-2">
                      <Plus className="w-4 h-4" /> Sign In to Post
                    </Button>
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {posts.map(post => (
                  <Link key={post.id} href={`/forum/post/${post.slug}`}>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                          {post.authorName?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            {post.isPinned && (
                              <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                <Pin className="w-3 h-3" /> Pinned
                              </span>
                            )}
                            {post.isClosed && (
                              <Badge variant="secondary" className="text-xs">Closed</Badge>
                            )}
                            {post.vehicleType && (
                              <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                                {post.vehicleType}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors leading-snug mt-1">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {post.content.replace(/[#*`]/g, "").slice(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="font-medium text-gray-500">{post.authorName ?? "Anonymous"}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {timeAgo(post.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" /> {post.replyCount ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {post.viewCount ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" /> {post.likeCount ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center text-sm text-gray-500 px-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
