import { useEffect, useRef } from "react";

/**
 * Bulletproof autoplay background video.
 *
 * Why this component exists:
 * - React's JSX `muted` prop has a timing race vs. iOS Safari's autoplay
 *   check; setting `video.muted = true` imperatively before `.play()` is
 *   the only reliable way to start a muted background video on iOS.
 * - Mobile Safari / Chrome will silently fail `.play()` (returning a
 *   rejected Promise). We catch and retry on first user gesture and
 *   on visibilitychange (e.g. user returns from background tab / locked
 *   screen / Low Power Mode just turned off).
 * - We lazy-attach the real `src` via IntersectionObserver so off-screen
 *   videos don't burn mobile data.
 */
export interface AutoplayBackgroundVideoProps {
  src: string;
  poster?: string;
  className?: string;
  /** Aria-hidden by default since this is decorative. Set to false to expose. */
  decorative?: boolean;
  /** mp4 by default. */
  mimeType?: string;
  /** Optional playback rate (e.g. 0.75 for slow ambient feel). */
  rate?: number;
}

export function AutoplayBackgroundVideo({
  src,
  poster,
  className,
  decorative = true,
  mimeType = "video/mp4",
  rate,
}: AutoplayBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1) Force muted at the property level BEFORE play() — iOS race fix.
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.playsInline = true;
    if (rate && Number.isFinite(rate)) {
      video.playbackRate = rate;
    }

    let attached = false;
    const attachAndPlay = () => {
      if (!attached) {
        attached = true;
        // Attach src lazily so off-screen videos don't load.
        if (!video.src) {
          video.src = src;
          video.load();
        }
      }
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Will be retried on first user gesture / visibilitychange below.
        });
      }
    };

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) attachAndPlay();
          });
        },
        { rootMargin: "320px 0px" },
      );
      observer.observe(video);
    } else {
      attachAndPlay();
    }

    const retry = () => {
      if (video.paused) attachAndPlay();
    };
    const onVisible = () => {
      if (!document.hidden) retry();
    };

    document.addEventListener("visibilitychange", onVisible);
    // First user gesture unlocks autoplay even in Low Power Mode.
    const gestureOpts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("touchstart", retry, gestureOpts);
    window.addEventListener("click", retry, gestureOpts);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("touchstart", retry);
      window.removeEventListener("click", retry);
    };
  }, [src, rate]);

  return (
    <video
      ref={videoRef}
      className={className}
      // Keep these as JSX attributes too so SSR/raw HTML is correct from the
      // first paint, even before the effect runs.
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden={decorative ? true : undefined}
    >
      {/* Source is also declared here so prerendered HTML can start loading
          immediately on fast networks; the effect will set video.src too if
          the element lacks one (idempotent). */}
      <source src={src} type={mimeType} />
    </video>
  );
}

export default AutoplayBackgroundVideo;
