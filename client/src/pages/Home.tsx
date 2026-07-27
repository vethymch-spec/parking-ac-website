/**
 * Home Page – CoolDrivePro Parking Air Conditioner
 * SEO Layout:
 *   H1: "Parking Air Conditioner for Off-Grid Life & Mobile Comfort" (HeroSection)
 *   H2s: Product names, section titles (all keyword-rich)
 *   Structured Data: Organization, WebSite, Product x2, FAQPage, BreadcrumbList (in index.html)
 *
 * Section Order (SEO-optimized):
 *   1. Navbar
 *   2. HeroSection (H1 + primary CTA)
 *   3. ProductsSection (H2 product names with keywords + specs)
 *   4. UseCasesSection (long-tail keyword coverage by vehicle type)
 *   5. ShopWithUs (trust signals: warranty, returns, shipping)
 *   6. FeaturesSection (feature keywords: 12V DC, no-idle, battery protection)
 *   7. SEOContentSection (editorial keyword-rich text + comparison table)
 *   8. FAQSection (People Also Ask / PAA coverage)
 *   9. BlogSection (internal linking + content freshness)
 *  10. Footer (site links + email capture)
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import B2BTrustStrip from "@/components/B2BTrustStrip";
import LazySection from "@/components/LazySection";
import { lazy, Suspense } from "react";

// Below-fold sections: lazy-imported to reduce initial JS parse/eval cost
const ProductsSection = lazy(() => import("@/components/ProductsSection"));
const UseCasesSection = lazy(() => import("@/components/UseCasesSection"));
const ShopWithUs = lazy(() => import("@/components/ShopWithUs"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const SEOContentSection = lazy(() => import("@/components/SEOContentSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const SocialFeedSection = lazy(() => import("@/components/SocialFeedSection"));
const CompactInquiryForm = lazy(() => import("@/components/CompactInquiryForm"));
const AboutHighlightsSection = lazy(() => import("@/components/AboutHighlightsSection"));
const Footer = lazy(() => import("@/components/Footer"));

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed top navigation */}
      <Navbar />

      {/* Main content - hero covers full viewport */}
      <main className="-mt-16">
        {/* 1. Hero: H1 + primary keyword — eagerly rendered (LCP) */}
        <HeroSection />
        {/* 2. B2B trust strip — warranty / MOQ / US warehouse / fleets */}
        <B2BTrustStrip />

        {/* Below-fold sections: deferred rendering via IntersectionObserver */}
        <Suspense fallback={null}>
          {/* 2. Products: H2 product names + specs tables */}
          <LazySection minHeight="400px">
            <ProductsSection />
          </LazySection>

          <LazySection minHeight="220px">
            <section className="bg-white py-8">
              <div className="mx-auto max-w-[960px] px-4 lg:px-8">
                <CompactInquiryForm
                  source="home_after_products"
                  title="Not sure which model fits?"
                  subtitle="Send your vehicle type, voltage, and target runtime. We will recommend the right model and invoice path."
                  tone="blue"
                />
              </div>
            </section>
          </LazySection>

          {/* 3. Use Cases: long-tail keyword coverage */}
          <LazySection minHeight="400px">
            <UseCasesSection />
          </LazySection>

          {/* 4. Trust signals */}
          <LazySection minHeight="200px">
            <ShopWithUs />
          </LazySection>

          {/* 4b. About highlights: factory / certs / exhibitions + brand story */}
          <LazySection minHeight="600px">
            <AboutHighlightsSection />
          </LazySection>

          {/* 5. Features: technical keyword coverage */}
          <LazySection minHeight="400px">
            <FeaturesSection />
          </LazySection>

          {/* 6. SEO editorial content + comparison table */}
          <LazySection minHeight="500px">
            <SEOContentSection />
          </LazySection>

          {/* 7. FAQ: PAA coverage */}
          <LazySection minHeight="400px">
            <FAQSection />
          </LazySection>

          {/* 8. Blog: content freshness */}
          <LazySection minHeight="400px">
            <BlogSection />
          </LazySection>

          {/* 9. Social: YouTube + Facebook community feed */}
          <LazySection minHeight="500px">
            <SocialFeedSection />
          </LazySection>
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <LazySection minHeight="200px">
          <Footer />
        </LazySection>
      </Suspense>
    </div>
  );
}
