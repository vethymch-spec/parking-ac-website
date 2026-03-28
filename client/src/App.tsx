import { lazy, Suspense, useEffect, useState } from "react";
import WhatsAppButton from "./components/WhatsAppButton";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useSEO } from "./hooks/useSEO";

// Home is eagerly loaded (critical path)
import Home from "./pages/Home";

// NotFound is lazy-loaded (not needed on first paint for homepage)
const NotFound = lazy(() => import("./pages/NotFound"));

// All other pages are lazy-loaded (code-split)
const ProductTopMounted = lazy(() => import("./pages/ProductTopMounted"));
const ProductMiniSplit = lazy(() => import("./pages/ProductMiniSplit"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
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
const NewProductPopup = lazy(() => import("./components/NewProductPopup"));

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
function DeferredUI({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Use requestAnimationFrame to defer until after first paint
    const raf = requestAnimationFrame(() => {
      setReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!ready) return <>{children}</>;

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
        <Route path="/products/top-mounted-ac" component={ProductTopMounted} />
        <Route path="/products/mini-split-ac" component={ProductMiniSplit} />
        <Route path="/products/heating-cooling-ac" component={ProductHeatingCooling} />

        {/* Feature detail pages (Learn More) */}
        <Route path="/features/:id" component={FeaturePage} />

        {/* About / Contact */}
        <Route path="/about" component={AboutUs} />
        <Route path="/contact" component={ContactUs} />

        {/* Policy pages */}
        <Route path="/warranty">
          {() => <PolicyPage type="warranty" />}
        </Route>
        <Route path="/return-policy">
          {() => <PolicyPage type="return" />}
        </Route>
        <Route path="/shipping-policy">
          {() => <PolicyPage type="shipping" />}
        </Route>
        <Route path="/privacy-policy">
          {() => <PolicyPage type="privacy" />}
        </Route>

        {/* Forum */}
        <Route path="/forum" component={Forum} />
        <Route path="/forum/new-post" component={ForumNewPost} />
        <Route path="/forum/post/:slug" component={ForumPostPage} />

        {/* After-Sales Support */}
        <Route path="/support" component={Support} />
        <Route path="/support/submit" component={SupportTicket} />
        <Route path="/support/ticket" component={SupportTicketStatus} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/tickets" component={AdminTickets} />
        <Route path="/admin/customers" component={AdminCustomers} />

        {/* Customer Portal */}
        <Route path="/support/login" component={CustomerLogin} />
        <Route path="/support/activate" component={CustomerActivate} />
        <Route path="/support/change-password" component={CustomerChangePassword} />
        <Route path="/support/forgot-password" component={CustomerForgotPassword} />
        <Route path="/support/reset-password" component={CustomerResetPassword} />
        <Route path="/support/portal" component={CustomerPortal} />

        {/* Blog */}
        <Route path="/blog" component={BlogList} />
        <Route path="/brand-knowledge" component={BrandKnowledge} />
        <Route path="/blog/:slug" component={BlogPost} />

        {/* 404 */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <DeferredUI>
          <SEOManager />
          <Router />
          <WhatsAppButton />
          <Suspense fallback={null}><NewProductPopup /></Suspense>
        </DeferredUI>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
