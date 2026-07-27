import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

interface NavbarAccountMenuProps {
  iconClassName: string;
  mobile?: boolean;
  onNavigate?: () => void;
}

const IconUser = ({ size = 18, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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

export default function NavbarAccountMenu({ iconClassName, mobile = false, onNavigate }: NavbarAccountMenuProps) {
  const { t } = useTranslation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user: adminUser, isAuthenticated, logout: adminLogout } = useAuth();
  const { data: customerSession } = trpc.customer.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const customerLogout = trpc.customer.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/support";
    },
  });

  const isAdminLoggedIn = isAuthenticated && adminUser?.role === "admin";
  const isCustomerLoggedIn = Boolean(customerSession);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAdminLoggedIn && !isCustomerLoggedIn) return null;

  const closeAndNavigate = () => {
    setUserMenuOpen(false);
    onNavigate?.();
  };

  if (mobile) {
    return (
      <div className="border-t border-gray-100 mt-2 pt-2">
        {isCustomerLoggedIn && (
          <Link
            href="/support/portal"
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg bg-green-50 text-green-700"
            onClick={closeAndNavigate}
          >
            <IconHeadphones size={16} />
            {t('nav.mySupportPortal')}
          </Link>
        )}
        {isAdminLoggedIn && (
          <Link
            href="/admin/tickets"
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg bg-gray-50 text-gray-700 mt-1"
            onClick={closeAndNavigate}
          >
            <IconLayoutDashboard size={16} />
            {t('nav.adminPanel')}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="relative hidden sm:block" ref={userMenuRef}>
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="p-2 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1"
        aria-label="Account"
      >
        <IconUser size={18} className={iconClassName} />
        <span className="w-2 h-2 rounded-full bg-green-400 absolute top-1 right-1" />
      </button>

      {userMenuOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-xl py-2 min-w-[220px] z-50 border border-gray-100">
          {isAdminLoggedIn && (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{t('nav.admin')}</p>
                <p className="text-sm font-medium text-gray-800 truncate">{adminUser?.name || adminUser?.email}</p>
              </div>
              <Link href="/admin/tickets" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={closeAndNavigate}>
                <IconLayoutDashboard size={16} className="text-blue-500" />
                Ticket Management
              </Link>
              <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={closeAndNavigate}>
                <IconSettings size={16} className="text-blue-500" />
                Customer Management
              </Link>
              <button onClick={() => { adminLogout(); closeAndNavigate(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <IconLogOut size={16} />
                Admin Logout
              </button>
            </>
          )}
          {isCustomerLoggedIn && (
            <div className={isAdminLoggedIn ? "border-t border-gray-100 mt-1 pt-1" : ""}>
              <div className="px-4 py-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{t('nav.customer')}</p>
                <p className="text-sm font-medium text-gray-800 truncate">{customerSession.contactName || customerSession.email}</p>
                <p className="text-xs text-gray-400">{customerSession.customerNo}</p>
              </div>
              <Link href="/support/portal" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={closeAndNavigate}>
                <IconHeadphones size={16} className="text-green-500" />
                {t('nav.mySupportPortal')}
              </Link>
              <button onClick={() => { customerLogout.mutate(); closeAndNavigate(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <IconLogOut size={16} />
                {t('nav.customerLogout')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}