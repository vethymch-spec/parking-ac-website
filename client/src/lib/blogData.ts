import { supportedLanguages } from "@/i18n";

export interface BlogContentSection {
  heading: string | null;
  body: string;
}

export interface BlogPostData {
  title: string;
  date: string;
  category: string;
  image: string;
  imageAlt: string;
  metaDescription: string;
  content: (BlogContentSection | string)[];
}

export interface BlogListItem {
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
}

export interface LocalizedBlogResult<T> {
  data: T;
  resolvedLanguage: string;
  fallbackToEnglish: boolean;
}

export interface BlogLocaleAvailability {
  defaultLanguage: string;
  languages: string[];
  posts: Record<string, string[]>;
}

export const DEFAULT_BLOG_LANGUAGE = "en";
const BLOG_BASE_PATH = "/data/blog";
const BLOG_LOCALE_AVAILABILITY_PATH = `${BLOG_BASE_PATH}/locale-availability.json`;

const DEFAULT_BLOG_LOCALE_AVAILABILITY: BlogLocaleAvailability = {
  defaultLanguage: DEFAULT_BLOG_LANGUAGE,
  languages: [],
  posts: {},
};

let blogLocaleAvailabilityPromise: Promise<BlogLocaleAvailability> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function resolveBlogLanguage(language: string): string {
  if (supportedLanguages.includes(language)) {
    return language;
  }

  const baseLanguage = language.split("-")[0];
  if (supportedLanguages.includes(baseLanguage)) {
    return baseLanguage;
  }

  return DEFAULT_BLOG_LANGUAGE;
}

function normalizeString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (isRecord(value) && typeof value.body === "string") {
    return value.body;
  }

  return "";
}

function normalizeContentItem(item: unknown): BlogContentSection | string {
  if (typeof item === "string") {
    return item;
  }

  if (isRecord(item)) {
    return {
      heading: typeof item.heading === "string" ? item.heading : null,
      body: normalizeString(item.body),
    };
  }

  return "";
}

function normalizeBlogPostData(value: unknown): BlogPostData {
  const record = isRecord(value) ? value : {};
  const content = Array.isArray(record.content) ? record.content.map(normalizeContentItem) : [];

  return {
    title: normalizeString(record.title),
    date: normalizeString(record.date),
    category: normalizeString(record.category),
    image: normalizeString(record.image),
    imageAlt: normalizeString(record.imageAlt),
    metaDescription: normalizeString(record.metaDescription),
    content,
  };
}

function normalizeBlogListItem(value: unknown): BlogListItem {
  const record = isRecord(value) ? value : {};

  return {
    slug: normalizeString(record.slug),
    title: normalizeString(record.title),
    category: normalizeString(record.category),
    date: normalizeString(record.date),
    image: normalizeString(record.image),
    excerpt: normalizeString(record.excerpt),
  };
}

function normalizeBlogLocaleAvailability(value: unknown): BlogLocaleAvailability {
  const record = isRecord(value) ? value : {};
  const languages = Array.isArray(record.languages)
    ? Array.from(new Set(record.languages.filter((language): language is string => typeof language === "string").map(resolveBlogLanguage))).filter(
        (language) => language !== DEFAULT_BLOG_LANGUAGE,
      )
    : [];

  const posts = isRecord(record.posts)
    ? Object.fromEntries(
        Object.entries(record.posts).map(([slug, postLanguages]) => [
          slug,
          Array.isArray(postLanguages)
            ? Array.from(new Set(postLanguages.filter((language): language is string => typeof language === "string").map(resolveBlogLanguage))).filter(
                (language) => language !== DEFAULT_BLOG_LANGUAGE,
              )
            : [],
        ]),
      )
    : {};

  return {
    defaultLanguage: normalizeString(record.defaultLanguage) || DEFAULT_BLOG_LANGUAGE,
    languages,
    posts,
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<T>;
}

export async function loadBlogLocaleAvailability(): Promise<BlogLocaleAvailability> {
  if (!blogLocaleAvailabilityPromise) {
    blogLocaleAvailabilityPromise = fetchJson<BlogLocaleAvailability>(BLOG_LOCALE_AVAILABILITY_PATH)
      .then((value) => (value ? normalizeBlogLocaleAvailability(value) : DEFAULT_BLOG_LOCALE_AVAILABILITY))
      .catch(() => DEFAULT_BLOG_LOCALE_AVAILABILITY);
  }

  return blogLocaleAvailabilityPromise;
}

export function getAvailableBlogLanguages(availability: BlogLocaleAvailability, slug?: string): string[] {
  const localizedLanguages = slug ? availability.posts[slug] || [] : availability.languages;

  return [
    DEFAULT_BLOG_LANGUAGE,
    ...localizedLanguages.filter((language) => language !== DEFAULT_BLOG_LANGUAGE),
  ];
}

function mergeBlogPostData(base: BlogPostData, overlay: Partial<BlogPostData> | null): BlogPostData {
  if (!overlay) {
    return base;
  }

  return {
    ...base,
    ...overlay,
    title: normalizeString(overlay.title) || base.title,
    date: normalizeString(overlay.date) || base.date,
    category: normalizeString(overlay.category) || base.category,
    image: normalizeString(overlay.image) || base.image,
    imageAlt: normalizeString(overlay.imageAlt) || base.imageAlt,
    metaDescription: normalizeString(overlay.metaDescription) || base.metaDescription,
    content: Array.isArray(overlay.content) ? overlay.content.map(normalizeContentItem) : base.content,
  };
}

export async function loadBlogPost(slug: string, language: string): Promise<LocalizedBlogResult<BlogPostData>> {
  const basePost = await fetchJson<BlogPostData>(`${BLOG_BASE_PATH}/${slug}.json`);
  if (!basePost) {
    throw new Error(`Blog post not found for slug ${slug}`);
  }

  const normalizedBase = normalizeBlogPostData(basePost);
  const resolvedLanguage = resolveBlogLanguage(language);

  if (resolvedLanguage === DEFAULT_BLOG_LANGUAGE) {
    return {
      data: normalizedBase,
      resolvedLanguage,
      fallbackToEnglish: false,
    };
  }

  const overlay = await fetchJson<Partial<BlogPostData>>(`${BLOG_BASE_PATH}/locales/${resolvedLanguage}/${slug}.json`);
  return {
    data: mergeBlogPostData(normalizedBase, overlay),
    resolvedLanguage: overlay ? resolvedLanguage : DEFAULT_BLOG_LANGUAGE,
    fallbackToEnglish: !overlay,
  };
}

export async function loadBlogList(language: string): Promise<LocalizedBlogResult<BlogListItem[]>> {
  const resolvedLanguage = resolveBlogLanguage(language);

  if (resolvedLanguage !== DEFAULT_BLOG_LANGUAGE) {
    const localizedList = await fetchJson<BlogListItem[]>(`${BLOG_BASE_PATH}/locales/${resolvedLanguage}/list.json`);
    if (Array.isArray(localizedList)) {
      return {
        data: localizedList.map(normalizeBlogListItem),
        resolvedLanguage,
        fallbackToEnglish: false,
      };
    }
  }

  const baseList = await fetchJson<BlogListItem[]>(`${BLOG_BASE_PATH}/list.json`);
  if (!Array.isArray(baseList)) {
    throw new Error("Blog list not found");
  }

  return {
    data: baseList.map(normalizeBlogListItem),
    resolvedLanguage: DEFAULT_BLOG_LANGUAGE,
    fallbackToEnglish: resolvedLanguage !== DEFAULT_BLOG_LANGUAGE,
  };
}