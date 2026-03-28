/**
 * SearchOverlay – Full-screen search overlay with instant results
 * Triggered by Navbar search icon or Cmd/Ctrl+K
 * Searches across: Products, Blog posts, Pages
 */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, X, ArrowRight, Star, Package, FileText, Compass } from "lucide-react";
import { useLocation } from "wouter";

/* ── Searchable Data ─────────────────────────────────────────── */

interface SearchItem {
  type: "product" | "blog" | "page";
  title: string;
  subtitle: string;
  href: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  keywords: string[];
}

const searchableItems: SearchItem[] = [
  // Products
  {
    type: "product",
    title: "VS02 PRO – 12000 BTU Top-Mounted Parking AC",
    subtitle: "12V/24V DC No-Idle RV & Truck Parking Air Conditioner",
    href: "/products/top-mounted-ac",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-top-mounted-opt_7f111736.webp",
    price: 1299,
    originalPrice: 1599,
    rating: 4.8,
    keywords: ["parking ac", "top mounted", "rv ac", "truck ac", "12v", "24v", "vs02", "air conditioner", "cooling", "12000 btu", "no idle"],
  },
  {
    type: "product",
    title: "VX3000SP – 12000 BTU Mini Split Parking AC",
    subtitle: "12V DC No-Idle AC for Semi Trucks & RVs",
    href: "/products/mini-split-ac",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-mini-split-opt_81dc95b4.webp",
    price: 1599,
    originalPrice: 1999,
    rating: 4.8,
    keywords: ["parking ac", "mini split", "semi truck", "rv ac", "12v", "vx3000", "air conditioner", "cooling", "12000 btu", "no idle"],
  },
  {
    type: "product",
    title: "WH-65K – 65000 BTU Tankless Water Heater",
    subtitle: "On-Demand Propane Heater for RV & Truck",
    href: "/products/water-heater",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/water-heater_e1e95553.webp",
    price: 399,
    originalPrice: 499,
    rating: 4.7,
    keywords: ["water heater", "tankless", "propane", "rv heater", "truck heater", "heating", "65000 btu", "off grid"],
  },
  {
    type: "product",
    title: "AH-5000 – 5KW Diesel Air Heater",
    subtitle: "12V DC Parking Heater for Truck & RV",
    href: "/products?category=heating",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/water-heater_e1e95553.webp",
    price: 289,
    originalPrice: 349,
    rating: 4.6,
    keywords: ["air heater", "diesel heater", "parking heater", "5kw", "12v", "truck heater", "rv heater", "heating", "cold weather"],
  },
  {
    type: "product",
    title: "LFP-200 – 200Ah LiFePO4 Lithium Battery",
    subtitle: "12V Deep Cycle Battery for Parking AC",
    href: "/products?category=cooling",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-top-mounted-opt_7f111736.webp",
    price: 599,
    originalPrice: 799,
    rating: 4.9,
    keywords: ["lithium battery", "lifepo4", "200ah", "12v", "deep cycle", "off grid", "power", "battery"],
  },
  // Pages
  {
    type: "page",
    title: "All Products",
    subtitle: "Browse our complete range of parking air conditioners, heaters, and accessories",
    href: "/products",
    keywords: ["products", "shop", "all products", "catalog", "browse"],
  },
  {
    type: "page",
    title: "About CoolDrivePro",
    subtitle: "Learn about our mission and commitment to off-grid comfort",
    href: "/about",
    keywords: ["about", "company", "mission", "team", "who we are"],
  },
  {
    type: "page",
    title: "Contact Us",
    subtitle: "Get in touch with our team for sales, support, or wholesale inquiries",
    href: "/contact",
    keywords: ["contact", "email", "phone", "support", "wholesale", "inquiry"],
  },
  {
    type: "page",
    title: "Community Forum",
    subtitle: "Join discussions with other RV and truck owners",
    href: "/forum",
    keywords: ["forum", "community", "discussion", "questions", "help"],
  },
  {
    type: "page",
    title: "Blog & Guides",
    subtitle: "Expert tips, installation guides, and product comparisons",
    href: "/blog",
    keywords: ["blog", "guides", "tips", "installation", "how to", "articles"],
  },
  {
    type: "page",
    title: "After-Sales Support",
    subtitle: "Submit a support ticket or check your ticket status",
    href: "/support",
    keywords: ["support", "warranty", "repair", "ticket", "help", "after sales"],
  },
  {
    type: "page",
    title: "Warranty Policy",
    subtitle: "2-year comprehensive warranty coverage details",
    href: "/warranty",
    keywords: ["warranty", "guarantee", "coverage", "repair", "replacement"],
  },
  {
    type: "page",
    title: "Return Policy",
    subtitle: "30-day hassle-free return policy",
    href: "/return-policy",
    keywords: ["return", "refund", "exchange", "30 day"],
  },
  {
    type: "page",
    title: "Shipping Policy",
    subtitle: "Free shipping on all orders in the U.S.",
    href: "/shipping-policy",
    keywords: ["shipping", "delivery", "free shipping", "tracking"],
  },
  {
    type: "page",
    title: "Brand Knowledge",
    subtitle: "Deep dive into CoolDrivePro technology and innovation",
    href: "/brand-knowledge",
    keywords: ["brand", "technology", "innovation", "knowledge"],
  },
  // Blog topics (representative entries for common searches)
  {
    type: "blog",
    title: "How to Install a Parking Air Conditioner",
    subtitle: "Step-by-step installation guide for top-mounted and mini-split AC",
    href: "/blog",
    keywords: ["install", "installation", "how to", "diy", "mount", "setup"],
  },
  {
    type: "blog",
    title: "Best Parking AC for Semi Trucks",
    subtitle: "Comparison guide for long-haul truckers",
    href: "/blog",
    keywords: ["best", "comparison", "semi truck", "long haul", "review", "vs"],
  },
  {
    type: "blog",
    title: "RV Air Conditioner Buying Guide",
    subtitle: "Everything you need to know before buying an RV AC",
    href: "/blog",
    keywords: ["buying guide", "rv", "camper", "van", "what to buy", "choose"],
  },
  {
    type: "blog",
    title: "Battery Life & Power Consumption",
    subtitle: "How long does a parking AC run on battery?",
    href: "/blog",
    keywords: ["battery", "power", "consumption", "runtime", "how long", "amps"],
  },
  {
    type: "blog",
    title: "No-Idle Laws & Anti-Idling Regulations",
    subtitle: "State-by-state guide to anti-idling laws in the U.S.",
    href: "/blog",
    keywords: ["no idle", "anti idling", "law", "regulation", "state", "fine"],
  },
];

/* ── Search Logic ────────────────────────────────────────────── */

function fuzzyMatch(query: string, item: SearchItem): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const tokens = q.split(/\s+/);
  let score = 0;

  // Title match (highest weight)
  const titleLower = item.title.toLowerCase();
  if (titleLower.includes(q)) score += 100;
  tokens.forEach((t) => {
    if (titleLower.includes(t)) score += 30;
  });

  // Subtitle match
  const subLower = item.subtitle.toLowerCase();
  if (subLower.includes(q)) score += 50;
  tokens.forEach((t) => {
    if (subLower.includes(t)) score += 15;
  });

  // Keyword match
  item.keywords.forEach((kw) => {
    const kwLower = kw.toLowerCase();
    if (kwLower.includes(q) || q.includes(kwLower)) score += 40;
    tokens.forEach((t) => {
      if (kwLower.includes(t) || t.includes(kwLower)) score += 20;
    });
  });

  // Type bonus: products rank higher
  if (item.type === "product") score += 10;

  return score;
}

/* ── Component ───────────────────────────────────────────────── */

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchableItems
      .map((item) => ({ item, score: fuzzyMatch(query, item) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.item);
  }, [query]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: { type: string; label: string; icon: typeof Package; items: SearchItem[] }[] = [];
    const products = results.filter((r) => r.type === "product");
    const pages = results.filter((r) => r.type === "page");
    const blogs = results.filter((r) => r.type === "blog");

    if (products.length > 0) groups.push({ type: "product", label: "Products", icon: Package, items: products });
    if (pages.length > 0) groups.push({ type: "page", label: "Pages", icon: Compass, items: pages });
    if (blogs.length > 0) groups.push({ type: "blog", label: "Blog & Guides", icon: FileText, items: blogs });

    return groups;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    return groupedResults.flatMap((g) => g.items);
  }, [groupedResults]);

  const handleNavigate = useCallback(
    (href: string) => {
      onClose();
      navigate(href);
    },
    [onClose, navigate]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && flatResults[selectedIndex]) {
        e.preventDefault();
        handleNavigate(flatResults[selectedIndex].href);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [flatResults, selectedIndex, handleNavigate, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const typeIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package size={14} className="text-blue-500" />;
      case "blog":
        return <FileText size={14} className="text-green-500" />;
      default:
        return <Compass size={14} className="text-gray-400" />;
    }
  };

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Search">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Search Panel */}
      <div className="relative max-w-2xl mx-auto mt-[10vh] px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products, guides, pages..."
              className="flex-1 text-base text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Clear search"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-md font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
            {query.trim() && results.length === 0 && (
              <div className="px-5 py-12 text-center">
                <Search size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500 text-sm">
                  No results found for "<span className="font-medium text-gray-700">{query}</span>"
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Try searching for "parking AC", "heater", "battery", or "installation"
                </p>
              </div>
            )}

            {groupedResults.map((group) => (
              <div key={group.type}>
                <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <group.icon size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                </div>
                {group.items.map((item) => {
                  flatIndex++;
                  const idx = flatIndex;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={`${item.type}-${item.href}-${idx}`}
                      data-index={idx}
                      className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleNavigate(item.href)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      {/* Image or Icon */}
                      {item.image ? (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          <img
                            src={item.image}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center">
                          {typeIcon(item.type)}
                        </div>
                      )}

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                        {item.price !== undefined && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-gray-900">
                              ${item.price.toLocaleString()}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-xs text-gray-400 line-through">
                                ${item.originalPrice.toLocaleString()}
                              </span>
                            )}
                            {item.rating && (
                              <span className="flex items-center gap-0.5 text-xs text-amber-500">
                                <Star size={10} fill="currentColor" />
                                {item.rating}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ArrowRight
                        size={16}
                        className={`flex-shrink-0 transition-colors ${
                          isSelected ? "text-blue-500" : "text-gray-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Quick Links when no query */}
            {!query.trim() && (
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Quick Links
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Top-Mounted AC", href: "/products/top-mounted-ac" },
                    { label: "Mini Split AC", href: "/products/mini-split-ac" },
                    { label: "All Products", href: "/products" },
                    { label: "Blog & Guides", href: "/blog" },
                    { label: "Support", href: "/support" },
                    { label: "Contact Us", href: "/contact" },
                  ].map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleNavigate(link.href)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-left"
                    >
                      <ArrowRight size={12} className="text-gray-300" />
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">↵</kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">esc</kbd>
                to close
              </span>
            </div>
            <span className="text-xs text-gray-300">CoolDrivePro Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
