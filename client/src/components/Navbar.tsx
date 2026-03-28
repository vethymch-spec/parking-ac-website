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
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
const SearchOverlay = lazy(() => import("@/components/SearchOverlay"));

/* ── Inline SVG Icons (avoid lucide-react in critical path) ── */
const IconSearch = ({ size = 18, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const IconUser = ({ size = 18, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
const IconLayoutDashboard = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
const IconSettings = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconLogOut = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);
const IconHeadphones = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
);

const navItems = [
  { label: "Top Mounted AC", href: "/products/top-mounted-ac" },
  { label: "Mini Split AC", href: "/products/mini-split-ac" },
  { label: "Heating & Cooling AC", href: "/products/heating-cooling-ac", isNew: true },
  { label: "All Products", href: "/products" },
  { label: "Forum", href: "/forum" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

interface NavbarProps {
  forceScrolled?: boolean;
}

export default function Navbar({ forceScrolled = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const isScrolled = forceScrolled || scrolled;
  const [mobileOpen, setMobileOpen] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  // Manus OAuth user (admin)
  const { user: adminUser, isAuthenticated, logout: adminLogout } = useAuth();
  const isAdminLoggedIn = isAuthenticated && adminUser?.role === "admin";

  // Customer session from cookie/trpc
  const { data: customerSession } = trpc.customer.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 min — avoid re-fetching on every navigation
    refetchOnWindowFocus: false,
  });
  const customerLogout = trpc.customer.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/support";
    },
  });

  const isCustomerLoggedIn = !!customerSession;

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCartClick = () => {
    toast("Shopping cart — Feature coming soon!");
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

  return (
    <>
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
      style={{ top: "36px" }}
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "oklch(0.45 0.18 255)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white"/>
              </svg>
            </div>
            <span
              className="font-extrabold text-lg tracking-tight"
              style={{ fontFamily: "'Montserrat', sans-serif", color: isScrolled ? "oklch(0.45 0.18 255)" : "white" }}
            >
              CoolDrive<span style={{ color: isScrolled ? "oklch(0.25 0.08 250)" : "rgba(255,255,255,0.85)" }}>Pro</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1 flex-wrap">
            {navItems.map((item) =>
                <Link
                  key={item.label}
                  href={item.href}
                  className="nav-link px-2 py-1 text-sm font-medium flex items-center gap-1"
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
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSearchClick}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Search"
            >
              <IconSearch size={18} style={{ color: iconColor }} />
            </button>

            {/* User Menu Dropdown - only shown when logged in */}
            {(isAdminLoggedIn || isCustomerLoggedIn) && (
            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1"
                aria-label="Account"
              >
                <IconUser size={18} style={{ color: iconColor }} />
                {(isAdminLoggedIn || isCustomerLoggedIn) && (
                  <span className="w-2 h-2 rounded-full bg-green-400 absolute top-1 right-1" />
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-xl py-2 min-w-[220px] z-50 border border-gray-100">
                  {/* Admin section - only visible when logged in as admin */}
                  {isAdminLoggedIn && (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Admin</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{adminUser?.name || adminUser?.email}</p>
                      </div>
                      <Link
                        href="/admin/tickets"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <IconLayoutDashboard size={16} className="text-blue-500" />
                        Ticket Management
                      </Link>
                      <Link
                        href="/admin/customers"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <IconSettings size={16} className="text-blue-500" />
                        Customer Management
                      </Link>
                      <button
                        onClick={() => { adminLogout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <IconLogOut size={16} />
                        Admin Logout
                      </button>
                    </>
                  )}
                  {/* Customer section - only visible when logged in as customer */}
                  {isCustomerLoggedIn && (
                    <div className={isAdminLoggedIn ? "border-t border-gray-100 mt-1 pt-1" : ""}>
                      <div className="px-4 py-2">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Customer</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{customerSession.contactName || customerSession.email}</p>
                        <p className="text-xs text-gray-400">{customerSession.customerNo}</p>
                      </div>
                      <Link
                        href="/support/portal"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <IconHeadphones size={16} className="text-green-500" />
                        My Support Portal
                      </Link>
                      <button
                        onClick={() => { customerLogout.mutate(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <IconLogOut size={16} />
                        Customer Logout
                      </button>
                    </div>
                  )}
                  {/* Nothing shown when not logged in - user icon is hidden for guests anyway */}
                </div>
              )}
            </div>
            )}

            <button
              onClick={handleCartClick}
              className="p-2 rounded-full hover:bg-white/20 transition-colors relative"
              aria-label="Cart"
            >
              <IconShoppingCart size={18} style={{ color: iconColor }} />
            </button>
            <button
              className="xl:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
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
            {navItems.map((item) =>
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
            {/* Mobile: Admin/Customer links - only shown when logged in */}
            {(isAdminLoggedIn || isCustomerLoggedIn) && (
            <div className="border-t border-gray-100 mt-2 pt-2">
              {isCustomerLoggedIn && (
                <Link
                  href="/support/portal"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg bg-green-50 text-green-700"
                  onClick={() => setMobileOpen(false)}
                >
                  <IconHeadphones size={16} />
                  My Support Portal
                </Link>
              )}
              {isAdminLoggedIn && (
                <Link
                  href="/admin/tickets"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg bg-gray-50 text-gray-700 mt-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <IconLayoutDashboard size={16} />
                  Admin Panel
                </Link>
              )}
            </div>
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
