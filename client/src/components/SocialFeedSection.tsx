/**
 * SocialFeedSection
 * ─────────────────
 * Displays cached YouTube videos as native cards (SEO-friendly: server-rendered
 * markup with VideoObject JSON-LD) plus a lazy-loaded Facebook Page Plugin.
 *
 * Performance:
 *   • YouTube data is pre-cached at build time (client/public/data/social.json)
 *   • Facebook SDK loads only when the section enters the viewport
 *   • Thumbnails use loading="lazy" + explicit width/height to avoid CLS
 *
 * SEO:
 *   • Every video card renders title + thumbnail as native HTML (indexable)
 *   • <script type="application/ld+json"> ItemList of VideoObject entries
 */
import { useEffect, useRef, useState } from "react";
import { Youtube, Facebook, Play } from "lucide-react";

interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  published: string;
}

interface SocialData {
  updated: string;
  youtube: { channelUrl: string; channelHandle: string; videos: YouTubeVideo[] };
  facebook: { pageUrl: string; pageHandle: string };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function SocialFeedSection() {
  const [data, setData] = useState<SocialData | null>(null);
  const [fbReady, setFbReady] = useState(false);
  const fbRef = useRef<HTMLDivElement>(null);

  // Fetch cached social data
  useEffect(() => {
    fetch("/data/social.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  // Lazy-load Facebook SDK only when FB widget enters viewport
  useEffect(() => {
    const el = fbRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        if (document.getElementById("facebook-jssdk")) {
          setFbReady(true);
          // Re-parse if SDK already loaded
          // @ts-ignore
          window.FB?.XFBML?.parse(el);
          return;
        }
        const s = document.createElement("script");
        s.id = "facebook-jssdk";
        s.async = true;
        s.defer = true;
        s.crossOrigin = "anonymous";
        s.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0";
        s.onload = () => setFbReady(true);
        document.body.appendChild(s);
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [data]);

  if (!data) {
    return <div style={{ minHeight: "400px" }} aria-hidden="true" />;
  }

  const videos = data.youtube.videos.slice(0, 6);

  // VideoObject JSON-LD for SEO
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CoolDrivePro Latest Videos",
    itemListElement: videos.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "VideoObject",
        name: v.title,
        thumbnailUrl: v.thumbnail,
        uploadDate: v.published,
        contentUrl: v.url,
        embedUrl: `https://www.youtube.com/embed/${v.id}`,
        description: v.title,
      },
    })),
  };

  return (
    <section
      id="community"
      className="py-16 lg:py-20 bg-gradient-to-b from-white to-slate-50"
      aria-labelledby="social-feed-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 lg:mb-14">
          <p className="text-sm font-semibold tracking-wider text-blue-600 uppercase mb-3">
            Connect With Us
          </p>
          <h2
            id="social-feed-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
          >
            Follow CoolDrivePro on Social Media
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            See real installations, owner reviews, and product updates from our community of
            truckers, RV owners, and off-grid adventurers.
          </p>
        </div>

        {/* YouTube videos grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Youtube className="w-6 h-6 text-red-600" aria-hidden="true" />
              Latest Videos
            </h3>
            <a
              href={data.youtube.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Visit Channel →
            </a>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0">
            {videos.map((v) => (
              <li key={v.id}>
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200"
                >
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      width={480}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white fill-white ml-1" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                      {v.title}
                    </h4>
                    <time
                      dateTime={v.published}
                      className="text-xs text-slate-500"
                    >
                      {formatDate(v.published)}
                    </time>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Facebook Page Plugin (lazy) */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Facebook className="w-6 h-6 text-blue-600" aria-hidden="true" />
              Facebook Updates
            </h3>
            <a
              href={data.facebook.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Visit Page →
            </a>
          </div>

          <div
            ref={fbRef}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex justify-center min-h-[500px]"
          >
            {/* fb-root required by SDK */}
            <div id="fb-root" />
            <div
              className="fb-page"
              data-href={data.facebook.pageUrl}
              data-tabs="timeline"
              data-width="500"
              data-height="500"
              data-small-header="false"
              data-adapt-container-width="true"
              data-hide-cover="false"
              data-show-facepile="true"
            >
              <blockquote
                cite={data.facebook.pageUrl}
                className="fb-xfbml-parse-ignore"
              >
                <a href={data.facebook.pageUrl}>Vethy Automotive on Facebook</a>
              </blockquote>
            </div>
            {!fbReady && (
              <noscript>
                <a
                  href={data.facebook.pageUrl}
                  className="text-blue-600 underline"
                >
                  View our Facebook page
                </a>
              </noscript>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
