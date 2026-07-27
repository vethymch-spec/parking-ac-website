/**
 * DRAFT — Product page with line switcher injected
 *
 * Wraps the existing live product pages and prepends the DraftProductLineSwitcher
 * so we can preview what each product page would look like with the switcher
 * bar, without modifying the production components.
 *
 * Preview at: /drafts/products/<slug>
 */
import { lazy, Suspense } from "react";
import { useRoute, Redirect } from "wouter";
import DraftProductLineSwitcher from "@/components/DraftProductLineSwitcher";

const ProductTopMounted = lazy(() => import("./ProductTopMounted"));
const ProductMiniSplit = lazy(() => import("./ProductMiniSplit"));
const ProductHeatingCooling = lazy(() => import("./ProductHeatingCooling"));
const ProductNanoMax = lazy(() => import("./ProductNanoMax"));

const SLUG_MAP: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  "top-mounted-ac": ProductTopMounted as never,
  "mini-split-ac": ProductMiniSplit as never,
  "heating-cooling-ac": ProductHeatingCooling as never,
  "nano-max": ProductNanoMax as never,
};

export default function DraftProductWithSwitcher() {
  const [, params] = useRoute<{ slug: string }>("/drafts/products/:slug");
  const slug = params?.slug ?? "";
  const Component = SLUG_MAP[slug];

  if (!Component) {
    return <Redirect to="/drafts/products" />;
  }

  return (
    <div data-draft="product-with-switcher">
      {/* Floating overlay so the switcher visually previews on top of the
          existing product page without rebuilding its layout */}
      <div className="fixed inset-x-0 z-30" style={{ top: 64 }}>
        <DraftProductLineSwitcher activeSlug={slug} previewMode />
      </div>
      {/* Push the page content down by the switcher height */}
      <div style={{ paddingTop: 56 }}>
        <Suspense fallback={null}>
          <Component />
        </Suspense>
      </div>
    </div>
  );
}
