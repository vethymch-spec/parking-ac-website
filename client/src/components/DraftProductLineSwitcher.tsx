/**
 * DRAFT — Product Line Switcher
 * Sticky horizontal chip bar that lets users jump between parking AC SKUs
 * without going back to the catalog. Sits just below the global Navbar.
 *
 * Status: DRAFT for preview only. Not wired into production product pages.
 * Preview at: /drafts/products/<slug>
 */
import { Link } from "wouter";

interface LineItem {
  slug: string;
  short: string;        // chip label, e.g. "VS02 PRO"
  tagline: string;      // small caption under chip on wide screens
  href: string;
  isNew?: boolean;
}

const LINE: LineItem[] = [
  {
    slug: "top-mounted-ac",
    short: "VS02 PRO",
    tagline: "12K BTU rooftop · sleeper · RV",
    href: "/products/top-mounted-ac/",
  },
  {
    slug: "nano-max",
    short: "Nano Max",
    tagline: "10K BTU compact rooftop · light truck",
    href: "/products/nano-max/",
    isNew: true,
  },
  {
    slug: "heating-cooling-ac",
    short: "V-TH1",
    tagline: "Heating + cooling rooftop · year-round",
    href: "/products/heating-cooling-ac/",
    isNew: true,
  },
  {
    slug: "mini-split-ac",
    short: "VX3000SP",
    tagline: "12K BTU mini-split · semi-truck sleeper",
    href: "/products/mini-split-ac/",
  },
];

interface Props {
  /** slug of the currently displayed product, for highlighting */
  activeSlug?: string;
  /** when true, links route to the /drafts/products/<slug> preview */
  previewMode?: boolean;
}

export default function DraftProductLineSwitcher({ activeSlug, previewMode = false }: Props) {
  return (
    <div
      className="sticky z-30 border-b border-border bg-white/95 backdrop-blur"
      style={{ top: 64 }} // matches PageLayout's pt-16 / Navbar height
      data-draft="product-line-switcher"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
          <span className="hidden md:inline shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">
            Parking AC line:
          </span>

          {LINE.map((item) => {
            const isActive = activeSlug === item.slug;
            const href = previewMode ? `/drafts/products/${item.slug}` : item.href;
            return (
              <Link key={item.slug} href={href}>
                <a
                  className={[
                    "shrink-0 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-transparent bg-[oklch(0.25_0.10_250)] text-white"
                      : "border-border bg-white text-[oklch(0.25_0.10_250)] hover:bg-secondary",
                  ].join(" ")}
                >
                  <span>{item.short}</span>
                  <span className="hidden lg:inline text-xs font-normal opacity-70">
                    · {item.tagline}
                  </span>
                  {item.isNew && (
                    <span
                      className={[
                        "text-[10px] font-bold uppercase tracking-wider rounded-full px-1.5 py-0.5",
                        isActive ? "bg-white/20 text-white" : "bg-emerald-500 text-white",
                      ].join(" ")}
                    >
                      New
                    </span>
                  )}
                </a>
              </Link>
            );
          })}

          <span className="ml-auto shrink-0">
            <Link href={previewMode ? "/drafts/products" : "/products/"}>
              <a className="inline-flex items-center gap-1 text-sm font-semibold text-[oklch(0.50_0.12_255)] hover:underline">
                Compare all
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
