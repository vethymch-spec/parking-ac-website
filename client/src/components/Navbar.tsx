/**
 * Navbar Component
 * Design: Industrial Modernism × Outdoor Adventure Aesthetic
 * Colors: Deep navy #0f3460, Electric blue #1a73e8, White background
 * Behavior: Transparent on hero, white+shadow on scroll
 * User icon: dropdown with Customer Login / Admin Login / Admin Panel links
 *
 * Performance: Uses inline SVG icons instead of lucide-react to avoid
 * pulling vendor-icons chunk into critical path.
 */
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
const SearchOverlay = lazy(() => import("@/components/SearchOverlay"));
const NavbarAccountMenu = lazy(() => import("@/components/NavbarAccountMenu"));

/* ── Inline SVG Icons (avoid lucide-react in critical path) ── */
const IconSearch = ({ size = 18, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const IconShoppingCart = ({ size = 18, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);
const IconMenu = ({ size = 20, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);
const IconX = ({ size = 20, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const IconChevronDown = ({ size = 14, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);
export default function Navbar({ forceScrolled = false }: NavbarProps) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const isScrolled = forceScrolled || scrolled;
  const [mobileOpen, setMobileOpen] = useState(false);

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const shouldFetchSession = /^\/(admin|support)(\/|$)/.test(location);

  // Navigation items with translation
  const navItems = [
    { label: t('nav.allProducts'), href: "/products/" },
    { label: t('nav.topMountedAC'), href: "/products/top-mounted-ac/" },
    { label: t('nav.miniSplitAC'), href: "/products/mini-split-ac/" },
    { label: t('nav.heatingCoolingAC'), href: "/products/heating-cooling-ac/", isNew: true },
    { label: "APU Solutions", href: "/apu/", isNew: true },
    // Hidden from navbar (pages still accessible by direct URL): Fitment Guide, Blog
    // { label: "Fitment Guide", href: "/vehicle-compatibility/" },
    // { label: t('nav.blog'), href: "/blog/" },
    { label: t('nav.about'), href: "/about/" },
    { label: t('nav.contact'), href: "/contact/" },
  ];
  // Desktop nav: hide "All Products" to keep the bar from overflowing in long-text
  // locales (es/de/fr/pt/it/nl etc.). The page is still reachable via /products/
  // and stays in the mobile menu below.
  const primaryNavItems = navItems.filter(
    (item) => item.href !== "/contact/" && item.href !== "/products/",
  );
  const overflowNavItems: typeof navItems = [];

  useEffect(() => {
    setMobileOpen(false);
    setMoreMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCartClick = () => {
    void import("sonner").then(({ toast }) => {
      toast(t('nav.shoppingCart') + " — " + t('common.comingSoon'));
    });
  };
  const handleSearchClick = () => {
    setSearchOpen(true);
  };

  // Cmd/Ctrl+K keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const iconColor = isScrolled ? "oklch(0.35 0.08 250)" : "white";
  const accountIconClassName = isScrolled ? "text-slate-700" : "text-white";

  return (
    <>
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-3 sm:px-4 lg:px-6 2xl:px-8">
        <div className="flex h-16 items-center gap-3">
          {/* Logo */}
          <Link href="/" aria-label="CoolDrivePro home" className="flex w-[156px] flex-none items-center sm:w-[188px] xl:w-[178px] 2xl:w-[206px]">
            <img
              src="/logo-horizontal.png"
              alt="CoolDrivePro"
              width="1440"
              height="214"
              decoding="async"
              className="block h-auto w-full rounded-sm object-contain shadow-sm"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">
            {primaryNavItems.map((item) =>
                <Link
                  key={item.label}
                  href={item.href}
                  className="nav-link flex flex-none items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-1.5 text-[12px] font-semibold leading-none transition-colors hover:bg-white/15 2xl:px-2.5 2xl:text-sm"
                  style={{ color: isScrolled ? "oklch(0.25 0.08 250)" : "white", fontFamily: "'Inter', sans-serif" }}
                >
                  {item.label}
                  {(item as any).isNew && (
                    <span
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.42 0.22 30), oklch(0.48 0.24 50))",
                        color: "white",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      NEW
                    </span>
                  )}
                </Link>
            )}
            {overflowNavItems.length > 0 && (
              <div className="relative flex-none" ref={moreMenuRef}>
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen((open) => !open)}
                  className={`nav-link flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-1.5 text-[12px] font-semibold leading-none transition-colors 2xl:px-2.5 2xl:text-sm ${isScrolled ? "text-slate-800 hover:bg-slate-100" : "text-white hover:bg-white/15"}`}
                  aria-haspopup="menu"
                >
                  {t('nav.menu')}
                  <IconChevronDown size={13} className={`transition-transform ${moreMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {moreMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 min-w-[190px] rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                    {overflowNavItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        onClick={() => setMoreMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex flex-none items-center gap-1 sm:gap-2">
            <Link
              href="/contact/"
              className={`hidden h-9 items-center justify-center rounded-full px-2.5 text-[12px] font-bold transition-colors xl:inline-flex 2xl:px-4 2xl:text-sm ${isScrolled ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-white/70 bg-white/10 text-white hover:bg-white/20"}`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {t('nav.contact')}
            </Link>
            <button
              onClick={handleSearchClick}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Search"
            >
              <IconSearch size={18} style={{ color: iconColor }} />
            </button>

            {shouldFetchSession && (
              <Suspense fallback={null}>
                <NavbarAccountMenu iconClassName={accountIconClassName} />
              </Suspense>
            )}

            <button
              onClick={handleCartClick}
              className="p-2 rounded-full hover:bg-white/20 transition-colors relative"
              aria-label={t('nav.cart')}
            >
              <IconShoppingCart size={18} style={{ color: iconColor }} />
            </button>
            
            {/* Language Switcher */}
            <LanguageSwitcher isScrolled={isScrolled} />
            <button
              className="xl:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t('nav.menu')}
              style={{ color: iconColor }}
            >
              {mobileOpen ? <IconX size={20} style={{ color: iconColor }} /> : <IconMenu size={20} style={{ color: iconColor }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="max-w-[1280px] mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems
              .filter((item) => item.href !== "/products/")
              .map((item) =>
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                  style={{ color: "oklch(0.25 0.08 250)", fontFamily: "'Inter', sans-serif" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                  {(item as any).isNew && (
                    <span
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.42 0.22 30), oklch(0.48 0.24 50))",
                        color: "white",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      NEW
                    </span>
                  )}
                </Link>
            )}
            {shouldFetchSession && (
              <Suspense fallback={null}>
                <NavbarAccountMenu iconClassName={accountIconClassName} mobile onNavigate={() => setMobileOpen(false)} />
              </Suspense>
            )}
          </nav>
        </div>
      )}
    </header>

    {/* Search Overlay - lazy loaded, only rendered when opened */}
    {searchOpen && (
      <Suspense fallback={null}>
        <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </Suspense>
    )}
    </>
  );
}
