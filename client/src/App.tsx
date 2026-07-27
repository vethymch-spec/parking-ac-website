import { lazy, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useSEO } from "./hooks/useSEO";
import { loadLanguageResources } from "./i18n";
import { detectLocaleFromPath } from "./lib/locale";

// All pages are lazy-loaded (code-split) — including Home.
// Home is lazy so its code (Navbar, HeroSection, etc.) is not loaded on
// blog/product pages, reducing ~78 KiB of unused JavaScript site-wide.
// The hero image is preloaded via <link rel="preload"> in index.html, and
// prerendered HTML provides first-screen content for crawlers, so lazy-loading
// Home does not harm homepage LCP.
const Home = lazy(() => import("./pages/Home"));

const NotFound = lazy(() => import("./pages/NotFound"));

// All other pages are lazy-loaded (code-split)
const ProductTopMounted = lazy(() => import("./pages/ProductTopMounted"));
const ProductMiniSplit = lazy(() => import("./pages/ProductMiniSplit"));
// DRAFT PREVIEW: temporarily importing AboutUs.draft.tsx. Revert to "./pages/AboutUs" before commit.
const AboutUs = lazy(() => import("./pages/AboutUs.draft"));
const AboutFactory = lazy(() => import("./pages/about/FactoryTour"));
const AboutCertifications = lazy(() => import("./pages/about/Certifications"));
const AboutExhibitions = lazy(() => import("./pages/about/Exhibitions"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const PolicyPage = lazy(() => import("./pages/PolicyPage"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BrandKnowledge = lazy(() => import("./pages/BrandKnowledge"));
const BlogList = lazy(() => import("./pages/BlogList"));
const FeaturePage = lazy(() => import("./pages/FeaturePage"));
const Forum = lazy(() => import("./pages/Forum"));
const ForumNewPost = lazy(() => import("./pages/ForumNewPost"));
const ForumPostPage = lazy(() => import("./pages/ForumPost"));
const Support = lazy(() => import("./pages/Support"));
const SupportTicket = lazy(() => import("./pages/SupportTicket"));
const SupportTicketStatus = lazy(() => import("./pages/SupportTicketStatus"));
const AdminTickets = lazy(() => import("./pages/AdminTickets"));
const CustomerLogin = lazy(() => import("./pages/CustomerLogin"));
const CustomerChangePassword = lazy(() => import("./pages/CustomerChangePassword"));
const CustomerPortal = lazy(() => import("./pages/CustomerPortal"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers"));
const CustomerActivate = lazy(() => import("./pages/CustomerActivate"));
const CustomerForgotPassword = lazy(() => import("./pages/CustomerForgotPassword"));
const CustomerResetPassword = lazy(() => import("./pages/CustomerResetPassword"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Products = lazy(() => import("./pages/Products"));
const ProductHeatingCooling = lazy(() => import("./pages/ProductHeatingCooling"));
const ProductNanoMax = lazy(() => import("./pages/ProductNanoMax"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const AdLandingPage = lazy(() => import("./pages/AdLandingPage"));
const CommercialHubPage = lazy(() => import("./pages/CommercialHubPage"));
const VehicleCompatibilityPage = lazy(() => import("./pages/VehicleCompatibilityPage"));
const ParkingAcFitmentPlanner = lazy(() => import("./pages/ParkingAcFitmentPlanner"));
const ApuPage = lazy(() => import("./pages/apu/ApuPage"));
const WhatsAppButton = lazy(() => import("./components/WhatsAppButton"));
const DataProviders = lazy(() => import("./DataProviders"));
const DraftProductDetailLab = import.meta.env.DEV ? lazy(() => import("./pages/DraftProductDetailLab")) : null;
const DraftTopMountedB2B = import.meta.env.DEV ? lazy(() => import("./pages/DraftTopMountedB2B")) : null;
const DraftProductsOverview = import.meta.env.DEV ? lazy(() => import("./pages/DraftProductsOverview")) : null;
const DraftProductWithSwitcher = import.meta.env.DEV ? lazy(() => import("./pages/DraftProductWithSwitcher")) : null;

const DATA_ROUTE_PATTERN = /^\/(?:admin|forum|support)(?:\/|$)/;

const needsDataProviders = (location: string) => DATA_ROUTE_PATTERN.test(location);

/** Minimal loading fallback — keeps CLS near zero */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SEOManager() {
  useSEO();
  return null;
}

/**
 * DeferredUI: Loads Toaster and TooltipProvider after first paint
 * to reduce TBT (Total Blocking Time) on initial load.
 * These components are not needed for first contentful paint.
 */
function DeferredUI({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (disabled) return;
    const scheduleIdle = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(() => callback({ didTimeout: true, timeRemaining: () => 0 }), 2500));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const idleHandle = scheduleIdle(() => {
      setReady(true);
    }, { timeout: 4000 });
    return () => cancelIdle(idleHandle);
  }, [disabled]);

  if (disabled || !ready) return <>{children}</>;

  // Dynamically import Toaster and TooltipProvider after first paint
  return <DeferredProviders>{children}</DeferredProviders>;
}

// Lazy-loaded wrapper for Toaster + TooltipProvider
const LazyToaster = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const LazyTooltipProvider = lazy(() => import("@/components/ui/tooltip").then(m => ({ default: m.TooltipProvider })));

function DeferredProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LazyTooltipProvider>
        <LazyToaster />
        {children}
      </LazyTooltipProvider>
    </Suspense>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />

        {/* Product pages */}
        <Route path="/products" component={Products} />
        <Route path="/products/" component={Products} />
        <Route path="/products/top-mounted-ac" component={ProductTopMounted} />
        <Route path="/products/top-mounted-ac/" component={ProductTopMounted} />
        <Route path="/products/mini-split-ac" component={ProductMiniSplit} />
        <Route path="/products/mini-split-ac/" component={ProductMiniSplit} />
        <Route path="/products/heating-cooling-ac" component={ProductHeatingCooling} />
        <Route path="/products/heating-cooling-ac/" component={ProductHeatingCooling} />
        <Route path="/products/nano-max" component={ProductNanoMax} />
        <Route path="/products/nano-max/" component={ProductNanoMax} />
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/payment-success/" component={PaymentSuccess} />

        {DraftProductDetailLab ? (
          <>
            <Route path="/drafts/top-mounted-product-detail" component={DraftProductDetailLab} />
            <Route path="/drafts/top-mounted-product-detail/" component={DraftProductDetailLab} />
          </>
        ) : null}

        {DraftTopMountedB2B ? (
          <>
            <Route path="/drafts/top-mounted-b2b" component={DraftTopMountedB2B} />
            <Route path="/drafts/top-mounted-b2b/" component={DraftTopMountedB2B} />
          </>
        ) : null}

        {DraftProductsOverview ? (
          <>
            <Route path="/drafts/products" component={DraftProductsOverview} />
            <Route path="/drafts/products/" component={DraftProductsOverview} />
          </>
        ) : null}

        {DraftProductWithSwitcher ? (
          <>
            <Route path="/drafts/products/:slug" component={DraftProductWithSwitcher} />
            <Route path="/drafts/products/:slug/" component={DraftProductWithSwitcher} />
          </>
        ) : null}

        {/* Google Ads landing pages */}
        <Route path="/landing/:slug" component={AdLandingPage} />
        <Route path="/landing/:slug/" component={AdLandingPage} />

        {/* Commercial solution and comparison hubs */}
        <Route path="/solutions/:slug" component={CommercialHubPage} />
        <Route path="/solutions/:slug/" component={CommercialHubPage} />
        <Route path="/compare/:slug" component={CommercialHubPage} />
        <Route path="/compare/:slug/" component={CommercialHubPage} />

        {/* APU Solutions (draft hub) */}
        <Route path="/apu" component={ApuPage} />
        <Route path="/apu/" component={ApuPage} />
        <Route path="/apu/:slug" component={ApuPage} />
        <Route path="/apu/:slug/" component={ApuPage} />

        {/* Vehicle compatibility and dealer fitment guides */}
        <Route path="/vehicle-compatibility" component={VehicleCompatibilityPage} />
        <Route path="/vehicle-compatibility/" component={VehicleCompatibilityPage} />
        <Route path="/vehicle-compatibility/semi-truck-parking-ac" component={VehicleCompatibilityPage} />
        <Route path="/vehicle-compatibility/semi-truck-parking-ac/" component={VehicleCompatibilityPage} />
        <Route path="/vehicle-compatibility/rv-parking-ac" component={VehicleCompatibilityPage} />
        <Route path="/vehicle-compatibility/rv-parking-ac/" component={VehicleCompatibilityPage} />
        <Route path="/vehicle-compatibility/12v-vs-24v-parking-ac" component={VehicleCompatibilityPage} />
        <Route path="/vehicle-compatibility/12v-vs-24v-parking-ac/" component={VehicleCompatibilityPage} />
        <Route path="/dealer-guide/parking-ac-local-market-fitment" component={VehicleCompatibilityPage} />
        <Route path="/dealer-guide/parking-ac-local-market-fitment/" component={VehicleCompatibilityPage} />

        <Route path="/tools/parking-ac-fitment-planner" component={ParkingAcFitmentPlanner} />
        <Route path="/tools/parking-ac-fitment-planner/" component={ParkingAcFitmentPlanner} />

        {/* Feature detail pages (Learn More) */}
        <Route path="/features/:id" component={FeaturePage} />
        <Route path="/features/:id/" component={FeaturePage} />

        {/* About / Contact */}
        <Route path="/about" component={AboutUs} />
        <Route path="/about/" component={AboutUs} />
        <Route path="/about/factory" component={AboutFactory} />
        <Route path="/about/factory/" component={AboutFactory} />
        <Route path="/about/certifications" component={AboutCertifications} />
        <Route path="/about/certifications/" component={AboutCertifications} />
        <Route path="/about/exhibitions" component={AboutExhibitions} />
        <Route path="/about/exhibitions/" component={AboutExhibitions} />
        <Route path="/contact" component={ContactUs} />
        <Route path="/contact/" component={ContactUs} />

        {/* Policy pages */}
        <Route path="/warranty">
          {() => <PolicyPage type="warranty" />}
        </Route>
        <Route path="/warranty/">
          {() => <PolicyPage type="warranty" />}
        </Route>
        <Route path="/return-policy">
          {() => <PolicyPage type="return" />}
        </Route>
        <Route path="/return-policy/">
          {() => <PolicyPage type="return" />}
        </Route>
        <Route path="/shipping-policy">
          {() => <PolicyPage type="shipping" />}
        </Route>
        <Route path="/shipping-policy/">
          {() => <PolicyPage type="shipping" />}
        </Route>
        <Route path="/privacy-policy">
          {() => <PolicyPage type="privacy" />}
        </Route>
        <Route path="/privacy-policy/">
          {() => <PolicyPage type="privacy" />}
        </Route>
        <Route path="/terms-of-service">
          {() => <PolicyPage type="terms" />}
        </Route>
        <Route path="/terms-of-service/">
          {() => <PolicyPage type="terms" />}
        </Route>
        <Route path="/payment-method">
          {() => <PolicyPage type="payment" />}
        </Route>
        <Route path="/payment-method/">
          {() => <PolicyPage type="payment" />}
        </Route>
        <Route path="/billing-terms">
          {() => <PolicyPage type="billing" />}
        </Route>
        <Route path="/billing-terms/">
          {() => <PolicyPage type="billing" />}
        </Route>

        {/* Forum */}
        <Route path="/forum" component={Forum} />
        <Route path="/forum/" component={Forum} />
        <Route path="/forum/new-post" component={ForumNewPost} />
        <Route path="/forum/new-post/" component={ForumNewPost} />
        <Route path="/forum/post/:slug" component={ForumPostPage} />
        <Route path="/forum/post/:slug/" component={ForumPostPage} />

        {/* After-Sales Support */}
        <Route path="/support" component={Support} />
        <Route path="/support/" component={Support} />
        <Route path="/support/submit" component={SupportTicket} />
        <Route path="/support/submit/" component={SupportTicket} />
        <Route path="/support/ticket" component={SupportTicketStatus} />
        <Route path="/support/ticket/" component={SupportTicketStatus} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/login/" component={AdminLogin} />
        <Route path="/admin/tickets" component={AdminTickets} />
        <Route path="/admin/tickets/" component={AdminTickets} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/customers/" component={AdminCustomers} />

        {/* Customer Portal */}
        <Route path="/support/login" component={CustomerLogin} />
        <Route path="/support/login/" component={CustomerLogin} />
        <Route path="/support/activate" component={CustomerActivate} />
        <Route path="/support/activate/" component={CustomerActivate} />
        <Route path="/support/change-password" component={CustomerChangePassword} />
        <Route path="/support/change-password/" component={CustomerChangePassword} />
        <Route path="/support/forgot-password" component={CustomerForgotPassword} />
        <Route path="/support/forgot-password/" component={CustomerForgotPassword} />
        <Route path="/support/reset-password" component={CustomerResetPassword} />
        <Route path="/support/reset-password/" component={CustomerResetPassword} />
        <Route path="/support/portal" component={CustomerPortal} />
        <Route path="/support/portal/" component={CustomerPortal} />

        {/* Blog */}
        <Route path="/blog" component={BlogList} />
        <Route path="/blog/" component={BlogList} />
        <Route path="/brand-knowledge" component={BrandKnowledge} />
        <Route path="/brand-knowledge/" component={BrandKnowledge} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/blog/:slug/" component={BlogPost} />

        {/* 404 */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppShell() {
  const [location] = useLocation();
  const isLandingRoute = location === "/landing" || location.startsWith("/landing/");
  const appContent = (
    <>
      <SEOManager />
      <Router />
      {!isLandingRoute && (
        <Suspense fallback={null}>
          <WhatsAppButton />
        </Suspense>
      )}
    </>
  );

  const content = needsDataProviders(location) ? (
    <Suspense fallback={<PageLoader />}>
      <DataProviders>{appContent}</DataProviders>
    </Suspense>
  ) : appContent;

  return (
    <DeferredUI disabled={isLandingRoute}>
      {content}
    </DeferredUI>
  );
}

function App() {
  // Detect locale from URL on mount; pass as wouter base so all <Link href="/foo"/>
  // automatically resolve to /xx/foo for non-English locales.
  const { lang, base } = detectLocaleFromPath();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Sync i18n with URL-derived locale (URL is source of truth for SEO)
    void loadLanguageResources(lang).then(() => {
      void i18n.changeLanguage(lang);
    });
    document.documentElement.lang = lang;
    document.documentElement.dir = ["ar", "he"].includes(lang) ? "rtl" : "ltr";
    // Persist for cases where user lands on a locale URL directly
    try { localStorage.setItem("i18nextLng", lang); } catch {}
  }, [lang, i18n]);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <WouterRouter base={base}>
          <AppShell />
        </WouterRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
