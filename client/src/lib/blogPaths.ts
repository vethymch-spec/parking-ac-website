import { supportedLanguages } from "@/i18n";
import { DEFAULT_BLOG_LANGUAGE, resolveBlogLanguage } from "@/lib/blogData";

export interface BlogPathMatch {
  locale: string;
  contentPath: string;
  slug: string | null;
  hasLocalePrefix: boolean;
  isIndex: boolean;
  isPost: boolean;
}

export interface LocalizedPathMatch {
  locale: string;
  contentPath: string;
  hasLocalePrefix: boolean;
}

const LOCALIZABLE_STATIC_ROUTE_PREFIXES = [
  "/products",
  "/solutions",
  "/compare",
  "/features",
  "/about",
  "/contact",
  "/forum",
  "/brand-knowledge",
  "/support",
  "/warranty",
  "/return-policy",
  "/shipping-policy",
  "/privacy-policy",
];

const NON_LOCALIZABLE_ROUTE_PREFIXES = [
  "/admin",
  "/support/login",
  "/support/activate",
  "/support/change-password",
  "/support/forgot-password",
  "/support/reset-password",
  "/support/submit",
  "/support/ticket",
  "/support/portal",
];

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split("?")[0].split("#")[0] || "/";
  if (withoutQuery !== "/" && withoutQuery.endsWith("/")) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery;
}

function splitPathExtras(pathname: string): { path: string; suffix: string } {
  const match = pathname.match(/^([^?#]*)(.*)$/);
  return {
    path: match?.[1] || pathname || "/",
    suffix: match?.[2] || "",
  };
}

function withTrailingSlash(pathname: string): string {
  if (pathname === "/") {
    return "/";
  }
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function isExactSupportedLanguage(language: string): boolean {
  return supportedLanguages.includes(language);
}

export function isLocalizableStaticPath(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  if (normalizedPath === "/") {
    return true;
  }

  if (NON_LOCALIZABLE_ROUTE_PREFIXES.some((prefix) => (
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  ))) {
    return false;
  }

  return LOCALIZABLE_STATIC_ROUTE_PREFIXES.some((prefix) => (
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  ));
}

export function getLocalizedBlogIndexPath(language: string): string {
  const resolvedLanguage = resolveBlogLanguage(language || DEFAULT_BLOG_LANGUAGE);
  return resolvedLanguage === DEFAULT_BLOG_LANGUAGE ? "/blog/" : `/${resolvedLanguage}/blog/`;
}

export function getLocalizedBlogPostPath(slug: string, language: string): string {
  const resolvedLanguage = resolveBlogLanguage(language || DEFAULT_BLOG_LANGUAGE);
  return resolvedLanguage === DEFAULT_BLOG_LANGUAGE ? `/blog/${slug}/` : `/${resolvedLanguage}/blog/${slug}/`;
}

export function matchBlogPath(pathname: string): BlogPathMatch | null {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/blog") {
    return {
      locale: DEFAULT_BLOG_LANGUAGE,
      contentPath: "/blog",
      slug: null,
      hasLocalePrefix: false,
      isIndex: true,
      isPost: false,
    };
  }

  if (normalizedPath.startsWith("/blog/")) {
    const slug = normalizedPath.replace("/blog/", "");
    if (!slug.includes("/")) {
      return {
        locale: DEFAULT_BLOG_LANGUAGE,
        contentPath: `/blog/${slug}`,
        slug,
        hasLocalePrefix: false,
        isIndex: false,
        isPost: true,
      };
    }
  }

  const localizedMatch = normalizedPath.match(/^\/([^/]+)\/blog(?:\/([^/]+))?$/);
  if (!localizedMatch) {
    return null;
  }

  const requestedLanguage = localizedMatch[1];
  if (!isExactSupportedLanguage(requestedLanguage)) {
    return null;
  }

  const resolvedLanguage = resolveBlogLanguage(requestedLanguage);
  const slug = localizedMatch[2] || null;

  return {
    locale: resolvedLanguage,
    contentPath: slug ? `/blog/${slug}` : "/blog",
    slug,
    hasLocalePrefix: true,
    isIndex: !slug,
    isPost: Boolean(slug),
  };
}

export function matchLocalizedPath(pathname: string): LocalizedPathMatch | null {
  const normalizedPath = normalizePathname(pathname);
  const localizedMatch = normalizedPath.match(/^\/([^/]+)(?:\/(.*))?$/);

  if (!localizedMatch) {
    return null;
  }

  const requestedLanguage = localizedMatch[1];
  if (!isExactSupportedLanguage(requestedLanguage)) {
    return null;
  }

  const rawContentPath = localizedMatch[2] ? `/${localizedMatch[2]}` : "/";
  const contentPath = normalizePathname(rawContentPath);

  if (!isLocalizableStaticPath(contentPath)) {
    return null;
  }

  return {
    locale: resolveBlogLanguage(requestedLanguage),
    contentPath,
    hasLocalePrefix: true,
  };
}

export function getLocalizedStaticPath(pathname: string, language: string): string {
  const { path, suffix } = splitPathExtras(pathname);
  const normalizedPath = normalizePathname(path);
  const resolvedLanguage = resolveBlogLanguage(language || DEFAULT_BLOG_LANGUAGE);
  const blogPath = matchBlogPath(normalizedPath);

  if (blogPath) {
    const targetPath = blogPath.isIndex
      ? getLocalizedBlogIndexPath(resolvedLanguage)
      : getLocalizedBlogPostPath(blogPath.slug || "", resolvedLanguage);
    return `${targetPath}${suffix}`;
  }

  const localizedPath = matchLocalizedPath(normalizedPath);
  const contentPath = localizedPath?.contentPath || normalizedPath;

  if (!isLocalizableStaticPath(contentPath)) {
    return pathname;
  }

  const targetPath = resolvedLanguage === DEFAULT_BLOG_LANGUAGE
    ? withTrailingSlash(contentPath)
    : withTrailingSlash(contentPath === "/" ? `/${resolvedLanguage}` : `/${resolvedLanguage}${contentPath}`);

  return `${targetPath}${suffix}`;
}

export function localizeBlogAwarePath(pathname: string, language: string): string {
  return getLocalizedStaticPath(pathname, language);
}