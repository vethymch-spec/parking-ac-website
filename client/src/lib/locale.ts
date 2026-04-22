/**
 * Locale routing helper
 * ─────────────────────
 * URL contract:
 *   • English (default):   /products/top-mounted-ac
 *   • Other locales:       /de/products/top-mounted-ac, /zh-CN/blog/foo, ...
 *
 * Strategy:
 *   • Parse first path segment; if it matches a non-English supported language,
 *     treat it as the base. Wouter's <Router base={base}> then routes the
 *     remainder against existing routes — zero changes to <Link href="/foo"/>.
 *   • English uses no prefix (canonical), keeping legacy URLs valid.
 *   • Language switching is a hard navigation so the Router re-initializes.
 */
import { supportedLanguages } from "@/i18n";

export const DEFAULT_LANG = "en";

/** Lowercase set for fast membership tests. Excludes English (no prefix). */
const PREFIXED_LANGS = new Set(
  supportedLanguages.filter((l) => l !== DEFAULT_LANG)
);

export interface LocaleInfo {
  /** The active language code, e.g. "en", "de", "zh-CN". */
  lang: string;
  /** Wouter <Router base="..."> value. Empty string for English. */
  base: string;
  /** The pathname segments AFTER stripping the locale prefix. Always starts with "/". */
  pathWithoutLocale: string;
}

/**
 * Parse the current window pathname into locale + remainder.
 * Safe to call during SSR (returns defaults).
 */
export function detectLocaleFromPath(pathname?: string): LocaleInfo {
  const path = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  // Match the first segment; case-sensitive (zh-CN, zh-TW must keep case)
  const match = path.match(/^\/([^/]+)(\/.*|$)/);
  if (match) {
    const seg = match[1];
    if (PREFIXED_LANGS.has(seg)) {
      return {
        lang: seg,
        base: `/${seg}`,
        pathWithoutLocale: match[2] || "/",
      };
    }
  }
  return { lang: DEFAULT_LANG, base: "", pathWithoutLocale: path || "/" };
}

/**
 * Build a localized URL for a given internal path.
 * Used by sitemap, hreflang, and language switcher.
 */
export function buildLocalizedPath(lang: string, pathWithoutLocale: string): string {
  const clean = pathWithoutLocale.startsWith("/") ? pathWithoutLocale : `/${pathWithoutLocale}`;
  if (lang === DEFAULT_LANG) return clean;
  return `/${lang}${clean === "/" ? "" : clean}` || `/${lang}`;
}

export { PREFIXED_LANGS };
