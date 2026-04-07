import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, Search, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleGoToProducts = () => {
    setLocation("/products");
  };

  const handleGoToBlog = () => {
    setLocation("/blog");
  };

  const handleGoToSupport = () => {
    setLocation("/support");
  };

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center px-4 py-20">
        {/* Main 404 Card */}
        <Card className="w-full max-w-2xl shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
          <CardContent className="pt-12 pb-12 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse blur-lg" />
                <div 
                  className="relative h-20 w-20 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: "oklch(0.94 0.06 255)" }}
                >
                  <AlertCircle className="h-12 w-12" style={{ color: "oklch(0.45 0.18 255)" }} />
                </div>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-6xl font-black mb-2" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
              404
            </h1>

            {/* Subheading */}
            <h2 className="text-2xl font-bold mb-4" style={{ color: "oklch(0.35 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
              {t('notFound.pageNotFound', 'Page Not Found')}
            </h2>

            {/* Description */}
            <p className="text-base mb-2 leading-relaxed" style={{ color: "oklch(0.50 0.05 250)" }}>
              {t('notFound.sorryMessage', "Sorry, the page you're looking for doesn't exist or has been moved.")}
            </p>
            <p className="text-sm mb-10 leading-relaxed" style={{ color: "oklch(0.55 0.05 250)" }}>
              {t('notFound.suggestion', 'Our parking AC solutions are designed to keep you cool and comfortable. Let us help you find what you need.')}
            </p>

            {/* CTA Buttons */}
            <div
              id="not-found-button-group"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
            >
              <Button
                onClick={handleGoHome}
                className="text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-semibold flex items-center justify-center"
                style={{ backgroundColor: "oklch(0.45 0.18 255)" }}
              >
                <Home className="w-4 h-4 mr-2" />
                {t('notFound.goHome', 'Go to Home')}
              </Button>

              <Button
                onClick={handleGoToProducts}
                className="text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-semibold border-2 flex items-center justify-center"
                style={{ backgroundColor: "oklch(0.50 0.12 255)", borderColor: "oklch(0.45 0.18 255)" }}
              >
                <Search className="w-4 h-4 mr-2" />
                {t('notFound.viewProducts', 'View Products')}
              </Button>
            </div>

            {/* Secondary Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 border-t pt-8" style={{ borderColor: "oklch(0.90 0.02 250)" }}>
              <button
                onClick={handleGoToBlog}
                className="p-4 rounded-lg text-left transition-all hover:shadow-md"
                style={{ backgroundColor: "oklch(0.96 0.02 250)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "oklch(0.25 0.10 250)" }}>
                      {t('notFound.readBlog', 'Read Our Blog')}
                    </p>
                    <p className="text-xs" style={{ color: "oklch(0.55 0.05 250)" }}>
                      {t('notFound.blogDesc', 'Learn tips & guides')}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4" style={{ color: "oklch(0.45 0.18 255)" }} />
                </div>
              </button>

              <button
                onClick={handleGoToSupport}
                className="p-4 rounded-lg text-left transition-all hover:shadow-md"
                style={{ backgroundColor: "oklch(0.96 0.02 250)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "oklch(0.25 0.10 250)" }}>
                      {t('notFound.getSupport', 'Get Support')}
                    </p>
                    <p className="text-xs" style={{ color: "oklch(0.55 0.05 250)" }}>
                      {t('notFound.supportDesc', 'Contact our team')}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4" style={{ color: "oklch(0.45 0.18 255)" }} />
                </div>
              </button>
            </div>

            {/* SEO Helper Text */}
            <p className="text-xs italic" style={{ color: "oklch(0.60 0.05 250)" }}>
              {t('notFound.helpText', 'CoolDrivePro specializes in parking air conditioners for trucks, RVs, and vans - No-idle AC solutions for comfort and efficiency.')}
            </p>
          </CardContent>
        </Card>

        {/* SKip content for broader SEO context */}
        <div className="hidden mt-12 max-w-2xl text-center">
          <h3 style={{ color: "oklch(0.35 0.10 250)", fontFamily: "'Montserrat', sans-serif" }} className="text-lg font-bold mb-3">
            {t('notFound.exploreMore', 'Explore More About Parking Air Conditioners')}
          </h3>
          <ul className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-2 text-left" style={{ color: "oklch(0.55 0.05 250)" }}>
            <li>• Top-mounted parking AC systems for trucks</li>
            <li>• Energy-efficient mini-split AC solutions</li>
            <li>• 12V vs 24V parking AC comparison</li>
            <li>• RV air conditioning installation guides</li>
            <li>• Heating & cooling parking AC systems</li>
            <li>• No-idle AC for anti-idling compliance</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
