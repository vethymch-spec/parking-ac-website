import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** How far before the viewport to start rendering (px). Default 200. */
  rootMargin?: string;
  /** Minimum height placeholder to prevent CLS. Default "100px". */
  minHeight?: string;
}

/**
 * Defers rendering of children until the placeholder scrolls near the viewport.
 * Uses IntersectionObserver for zero main-thread cost while off-screen.
 */
export default function LazySection({
  children,
  rootMargin = "300px",
  minHeight = "100px",
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  if (visible) return <>{children}</>;

  return <div ref={ref} style={{ minHeight }} />;
}
