import { type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** @deprecated Kept for API compatibility; no longer used. */
  rootMargin?: string;
  /** Placeholder min-height reserved while the lazy chunk is still loading. */
  minHeight?: string;
}

/**
 * Renders children directly and keeps them mounted at their real height.
 *
 * Previously this used an IntersectionObserver to mount/unmount children, and a
 * `content-visibility` variant reserved only an estimated height. Both caused
 * the total document height to change while scrolling (the app boots with
 * `createRoot`, which wipes the prerendered HTML, so off-screen sections started
 * collapsed and then expanded section-by-section as you scrolled). That made the
 * whole page "jump" and never settle.
 *
 * Rendering children inline means each section always occupies its true height,
 * so the document height is stable and the scroll position stays anchored. The
 * `minHeight` only reserves space during the brief window before the lazily
 * imported chunk finishes loading. Code-splitting is still provided by `lazy()`.
 */
export default function LazySection({
  children,
  minHeight = "100px",
}: LazySectionProps) {
  return <div style={{ minHeight }}>{children}</div>;
}
