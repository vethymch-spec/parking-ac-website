/**
 * Products Listing Page with Filter & Sort
 * Features:
 *   - Category filter (All / Cooling / Heating)
 *   - Price range filter (slider or preset ranges)
 *   - Rating filter (minimum stars)
 *   - Sort by: Featured, Price Low→High, Price High→Low, Rating, Newest
 *   - Responsive grid layout with product cards
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Star, SlidersHorizontal, X, ChevronDown, ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

/* ── Product Data ────────────────────────────────────────────── */

interface Product {
  id: string;
  slug: string;
  model: string;
  name: string;
  subtitle: string;
  category: "cooling" | "heating";
  categoryLabel: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  imageAlt: string;
  specs: { label: string; value: string }[];
  tags: string[];
  isNew: boolean;
  releaseDate: string;
}

const allProducts: Product[] = [
  {
    id: "vs02-pro",
    slug: "top-mounted-ac",
    model: "VS02 PRO",
    name: "12000 BTU Top-Mounted Parking Air Conditioner",
    subtitle: "12V/24V DC No-Idle RV & Truck Parking AC",
    category: "cooling",
    categoryLabel: "Parking AC",
    price: 1299,
    originalPrice: 1599,
    rating: 4.8,
    reviewCount: 65,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-top-mounted-opt_7f111736.webp",
    imageAlt: "VS02 PRO top-mounted parking air conditioner for RV and truck",
    specs: [
      { label: "Cooling", value: "12,000 BTU" },
      { label: "Power", value: "12V / 24V DC" },
      { label: "Noise", value: "≤ 45 dB" },
    ],
    tags: ["Best Seller", "Cooling + Heating"],
    isNew: false,
    releaseDate: "2025-06-01",
  },
  {
    id: "vx3000sp",
    slug: "mini-split-ac",
    model: "VX3000SP",
    name: "12000 BTU Mini Split Parking Air Conditioner",
    subtitle: "12V DC No-Idle AC for Semi Trucks & RVs",
    category: "cooling",
    categoryLabel: "Parking AC",
    price: 1599,
    originalPrice: 1999,
    rating: 4.8,
    reviewCount: 65,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-mini-split-opt_81dc95b4.webp",
    imageAlt: "VX3000SP mini split parking air conditioner for semi truck",
    specs: [
      { label: "Cooling", value: "12,000 BTU" },
      { label: "Power", value: "12V DC" },
      { label: "Runtime", value: "8–10 hrs" },
    ],
    tags: ["Best for Trucks"],
    isNew: false,
    releaseDate: "2025-08-01",
  },
  {
    id: "water-heater",
    slug: "water-heater",
    model: "WH-65K",
    name: "65000 BTU Tankless Water Heater for RV & Truck",
    subtitle: "On-Demand Propane Heater for Off-Grid Living",
    category: "heating",
    categoryLabel: "Water Heater",
    price: 399,
    originalPrice: 499,
    rating: 4.7,
    reviewCount: 42,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/water-heater_e1e95553.webp",
    imageAlt: "65000 BTU tankless water heater for RV and truck",
    specs: [
      { label: "Heating", value: "65,000 BTU" },
      { label: "Flow", value: "2.9 GPM" },
      { label: "Fuel", value: "Propane (LP)" },
    ],
    tags: ["Off-Grid Comfort"],
    isNew: false,
    releaseDate: "2025-10-01",
  },
  {
    id: "air-heater-5kw",
    slug: "top-mounted-ac",
    model: "AH-5000",
    name: "5KW Diesel Air Heater for Truck & RV",
    subtitle: "12V DC Parking Heater for Cold Weather",
    category: "heating",
    categoryLabel: "Air Heater",
    price: 289,
    originalPrice: 349,
    rating: 4.6,
    reviewCount: 38,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/water-heater_e1e95553.webp",
    imageAlt: "5KW diesel air heater for truck and RV parking",
    specs: [
      { label: "Power", value: "5 KW" },
      { label: "Voltage", value: "12V DC" },
      { label: "Fuel", value: "Diesel" },
    ],
    tags: ["Winter Essential"],
    isNew: true,
    releaseDate: "2026-01-15",
  },
  {
    id: "lithium-200ah",
    slug: "top-mounted-ac",
    model: "LFP-200",
    name: "200Ah LiFePO4 Lithium Battery for Parking AC",
    subtitle: "12V Deep Cycle Battery for Off-Grid Power",
    category: "cooling",
    categoryLabel: "Battery",
    price: 599,
    originalPrice: 799,
    rating: 4.9,
    reviewCount: 53,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-top-mounted-opt_7f111736.webp",
    imageAlt: "200Ah LiFePO4 lithium battery for parking air conditioner",
    specs: [
      { label: "Capacity", value: "200 Ah" },
      { label: "Voltage", value: "12V" },
      { label: "Cycles", value: "4000+" },
    ],
    tags: ["Recommended"],
    isNew: true,
    releaseDate: "2026-02-01",
  },
  {
    id: "v-th1",
    slug: "heating-cooling-ac",
    model: "V-TH1",
    name: "V-TH1 Heating & Cooling Parking Air Conditioner",
    subtitle: "12V/24V DC Dual-Mode Rotor AC — Year-Round Comfort",
    category: "cooling",
    categoryLabel: "Heating & Cooling AC",
    price: 0,
    originalPrice: 0,
    rating: 4.9,
    reviewCount: 12,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vth1-outdoor-top_55c3c0af.webp",
    imageAlt: "V-TH1 heating and cooling parking air conditioner rooftop unit",
    specs: [
      { label: "Cooling", value: "2,000W" },
      { label: "Heating", value: "30 min" },
      { label: "Voltage", value: "12V / 24V" },
    ],
    tags: ["NEW", "Heating + Cooling"],
    isNew: true,
    releaseDate: "2026-03-15",
  },
];

/* ── Sort Options ────────────────────────────────────────────── */

type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

/* ── Star Rating Component ───────────────────────────────────── */

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }
        />
      ))}
    </div>
  );
}

/* ── Product Card ────────────────────────────────────────────── */

function ProductCard({ product }: { product: Product }) {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group bg-white rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-secondary/30 overflow-hidden">
          <img
            src={product.image}
            alt={product.imageAlt}
            loading="lazy"
            width="600"
            height="450"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {product.isNew && (
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white rounded-full">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-red-500 text-white rounded-full">
                -{discount}%
              </span>
            )}
          </div>
          {/* Category badge */}
          <div className="absolute top-3 right-3">
            <span
              className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full"
              style={{
                backgroundColor:
                  product.category === "cooling"
                    ? "oklch(0.90 0.08 240)"
                    : "oklch(0.92 0.08 30)",
                color:
                  product.category === "cooling"
                    ? "oklch(0.35 0.15 255)"
                    : "oklch(0.40 0.15 30)",
              }}
            >
              {product.category === "cooling" ? "Cooling" : "Heating"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Model */}
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: "oklch(0.50 0.12 255)" }}
          >
            {product.model}
          </p>

          {/* Name */}
          <h3
            className="text-lg font-bold leading-snug mb-1 line-clamp-2"
            style={{
              color: "oklch(0.25 0.10 250)",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            {product.name}
          </h3>

          {/* Subtitle */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
            {product.subtitle}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={product.rating} size={14} />
            <span className="text-sm font-semibold" style={{ color: "oklch(0.35 0.10 250)" }}>
              {product.rating}
            </span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.specs.map((spec) => (
              <span
                key={spec.label}
                className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
              >
                {spec.label}: <strong>{spec.value}</strong>
              </span>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="mt-auto flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-2xl font-extrabold"
                  style={{
                    color: "oklch(0.35 0.15 255)",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  {product.price > 0 ? `$${product.price.toLocaleString()}` : "Contact for Price"}
                </span>
                {product.originalPrice > product.price && product.price > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <span
              className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
              style={{ color: "oklch(0.45 0.18 255)" }}
            >
              View Details
              <ChevronRight size={16} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Filter Sidebar (Desktop) / Sheet (Mobile) ──────────────── */

interface FilterState {
  category: "all" | "cooling" | "heating";
  priceRange: [number, number];
  minRating: number;
}

const PRICE_MIN = 0;
const PRICE_MAX = 2000;

function FilterPanel({
  filters,
  setFilters,
  onReset,
  productCounts,
}: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  productCounts: { all: number; cooling: number; heating: number };
}) {
  const categories: { value: FilterState["category"]; label: string; count: number }[] = [
    { value: "all", label: "All Products", count: productCounts.all },
    { value: "cooling", label: "Cooling", count: productCounts.cooling },
    { value: "heating", label: "Heating", count: productCounts.heating },
  ];

  const ratingOptions = [
    { value: 0, label: "All Ratings" },
    { value: 4, label: "4+ Stars" },
    { value: 4.5, label: "4.5+ Stars" },
    { value: 4.8, label: "4.8+ Stars" },
  ];

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.priceRange[0] !== PRICE_MIN ||
    filters.priceRange[1] !== PRICE_MAX ||
    filters.minRating !== 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-base font-bold uppercase tracking-wider"
          style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
        >
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: "oklch(0.35 0.10 250)" }}>
          Category
        </h4>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilters((f) => ({ ...f, category: cat.value }))}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.category === cat.value
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-xs text-muted-foreground">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: "oklch(0.35 0.10 250)" }}>
          Price Range
        </h4>
        <div className="px-1">
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={50}
            value={filters.priceRange}
            onValueChange={(val) =>
              setFilters((f) => ({ ...f, priceRange: val as [number, number] }))
            }
            className="mb-3"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium" style={{ color: "oklch(0.35 0.10 250)" }}>
              ${filters.priceRange[0]}
            </span>
            <span className="text-muted-foreground">—</span>
            <span className="font-medium" style={{ color: "oklch(0.35 0.10 250)" }}>
              ${filters.priceRange[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: "oklch(0.35 0.10 250)" }}>
          Minimum Rating
        </h4>
        <div className="space-y-1.5">
          {ratingOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilters((f) => ({ ...f, minRating: opt.value }))}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.minRating === opt.value
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              {opt.value > 0 && <StarRating rating={opt.value} size={12} />}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Active Filter Tags ──────────────────────────────────────── */

function ActiveFilters({
  filters,
  setFilters,
  onReset,
}: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
}) {
  const tags: { label: string; onRemove: () => void }[] = [];

  if (filters.category !== "all") {
    tags.push({
      label: filters.category === "cooling" ? "Cooling" : "Heating",
      onRemove: () => setFilters((f) => ({ ...f, category: "all" })),
    });
  }
  if (filters.priceRange[0] !== PRICE_MIN || filters.priceRange[1] !== PRICE_MAX) {
    tags.push({
      label: `$${filters.priceRange[0]} – $${filters.priceRange[1]}`,
      onRemove: () => setFilters((f) => ({ ...f, priceRange: [PRICE_MIN, PRICE_MAX] })),
    });
  }
  if (filters.minRating > 0) {
    tags.push({
      label: `${filters.minRating}+ Stars`,
      onRemove: () => setFilters((f) => ({ ...f, minRating: 0 })),
    });
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {tags.map((tag) => (
        <Badge
          key={tag.label}
          variant="secondary"
          className="flex items-center gap-1 pl-3 pr-1.5 py-1 text-xs"
        >
          {tag.label}
          <button
            onClick={tag.onRemove}
            className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
      <button
        onClick={onReset}
        className="text-xs font-medium text-primary hover:underline ml-1"
      >
        Clear All
      </button>
    </div>
  );
}

/* ── Main Page Component ─────────────────────────────────────── */

export default function Products() {
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    priceRange: [PRICE_MIN, PRICE_MAX],
    minRating: 0,
  });
  const [sort, setSort] = useState<SortOption>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const resetFilters = () =>
    setFilters({ category: "all", priceRange: [PRICE_MIN, PRICE_MAX], minRating: 0 });

  // Product counts per category (unfiltered)
  const productCounts = useMemo(
    () => ({
      all: allProducts.length,
      cooling: allProducts.filter((p) => p.category === "cooling").length,
      heating: allProducts.filter((p) => p.category === "heating").length,
    }),
    []
  );

  // Filter + sort
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category
    if (filters.category !== "all") {
      result = result.filter((p) => p.category === filters.category);
    }

    // Price range
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Rating
    if (filters.minRating > 0) {
      result = result.filter((p) => p.rating >= filters.minRating);
    }

    // Sort
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
        break;
      default:
        // featured = original order
        break;
    }

    return result;
  }, [filters, sort]);

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.priceRange[0] !== PRICE_MIN ||
    filters.priceRange[1] !== PRICE_MAX ||
    filters.minRating !== 0;

  return (
    <PageLayout>
      {/* Hero Banner */}
      <section
        className="py-12 sm:py-16"
        style={{ backgroundColor: "oklch(0.96 0.02 240)" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="font-medium text-foreground">All Products</span>
          </nav>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3"
            style={{
              color: "oklch(0.25 0.10 250)",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Our Products
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Browse our complete range of parking air conditioners, heaters, and accessories.
            Filter by category, price, or rating to find the perfect solution for your vehicle.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28 bg-white rounded-xl border border-border p-5">
                <FilterPanel
                  filters={filters}
                  setFilters={setFilters}
                  onReset={resetFilters}
                  productCounts={productCounts}
                />
              </div>
            </aside>

            {/* Product Grid Area */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  {/* Mobile filter toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden flex items-center gap-2"
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  >
                    <SlidersHorizontal size={16} />
                    Filters
                    {hasActiveFilters && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {filteredProducts.length}
                    </span>{" "}
                    {filteredProducts.length === 1 ? "product" : "products"}
                  </p>
                </div>

                {/* Sort */}
                <Select
                  value={sort}
                  onValueChange={(val) => setSort(val as SortOption)}
                >
                  <SelectTrigger className="w-[180px] text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Filters (collapsible) */}
              {mobileFiltersOpen && (
                <div className="lg:hidden mb-6 bg-white rounded-xl border border-border p-5">
                  <FilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    onReset={resetFilters}
                    productCounts={productCounts}
                  />
                </div>
              )}

              {/* Active filter tags */}
              <ActiveFilters
                filters={filters}
                setFilters={setFilters}
                onReset={resetFilters}
              />

              {/* Product Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "oklch(0.96 0.02 240)" }}
                  >
                    <SlidersHorizontal size={24} className="text-muted-foreground" />
                  </div>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{
                      color: "oklch(0.25 0.10 250)",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    No products match your filters
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try adjusting your filters or clearing them to see all products.
                  </p>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
