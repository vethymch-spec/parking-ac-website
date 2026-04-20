import fs from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const BLOG_DIR = path.join(ROOT_DIR, "client", "public", "data", "blog");
const BLOG_LOCALES_DIR = path.join(BLOG_DIR, "locales");
const LIST_PATH = path.join(BLOG_DIR, "list.json");
const MANIFEST_PATH = path.join(BLOG_DIR, "manifest.json");
const LOCALE_AVAILABILITY_PATH = path.join(BLOG_DIR, "locale-availability.json");
const EXCLUDED_BLOG_FILES = new Set(["list.json", "manifest.json", "locale-availability.json"]);

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value) {
  if (typeof value === "string") {
    return value;
  }

  if (isRecord(value) && typeof value.body === "string") {
    return value.body;
  }

  return "";
}

function mergePostData(basePost, overlayPost) {
  if (!overlayPost || !isRecord(overlayPost)) {
    return basePost;
  }

  return {
    ...basePost,
    ...overlayPost,
    title: normalizeString(overlayPost.title) || basePost.title,
    category: normalizeString(overlayPost.category) || basePost.category,
    date: normalizeString(overlayPost.date) || basePost.date,
    image: normalizeString(overlayPost.image) || basePost.image,
    imageAlt: normalizeString(overlayPost.imageAlt) || basePost.imageAlt,
    metaDescription: normalizeString(overlayPost.metaDescription) || basePost.metaDescription,
    content: Array.isArray(overlayPost.content) ? overlayPost.content : basePost.content,
  };
}

function normalizeDescription(value, maxLength = 220) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function extractExcerptFromContent(content) {
  if (!Array.isArray(content)) {
    return "";
  }

  for (const item of content) {
    if (typeof item === "string" && item.trim()) {
      return normalizeDescription(item);
    }

    if (item && typeof item.body === "string" && item.body.trim()) {
      return normalizeDescription(item.body);
    }
  }

  return "";
}

function toSortTime(dateText) {
  if (!dateText) {
    return 0;
  }

  const normalized = String(dateText).trim();
  const monthMap = {
    january: 0,
    jan: 0,
    february: 1,
    feb: 1,
    march: 2,
    mar: 2,
    april: 3,
    apr: 3,
    may: 4,
    june: 5,
    jun: 5,
    july: 6,
    jul: 6,
    august: 7,
    aug: 7,
    september: 8,
    sep: 8,
    sept: 8,
    october: 9,
    oct: 9,
    november: 10,
    nov: 10,
    december: 11,
    dec: 11,
  };

  const matched = normalized.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (matched) {
    const monthIndex = monthMap[matched[1].toLowerCase()];
    if (monthIndex !== undefined) {
      return Date.UTC(Number(matched[3]), monthIndex, Number(matched[2]));
    }
  }

  const parsed = new Date(normalized).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function main() {
  const files = (await fs.readdir(BLOG_DIR))
    .filter((file) => file.endsWith(".json") && !EXCLUDED_BLOG_FILES.has(file))
    .sort();

  const basePosts = await Promise.all(files.map(async (file) => {
    const raw = JSON.parse(await fs.readFile(path.join(BLOG_DIR, file), "utf8"));
    return {
      slug: file.replace(/\.json$/, ""),
      title: raw.title,
      category: raw.category,
      date: raw.date,
      image: raw.image,
      imageAlt: raw.imageAlt,
      excerpt: normalizeDescription(raw.metaDescription || extractExcerptFromContent(raw.content)),
      raw,
    };
  }));

  basePosts.sort((left, right) => {
    const byDate = toSortTime(right.date) - toSortTime(left.date);
    return byDate || left.slug.localeCompare(right.slug);
  });

  const listPayload = basePosts.map(({ slug, title, category, date, image, excerpt }) => ({
    slug,
    title,
    category,
    date,
    image,
    excerpt,
  }));

  const manifestPayload = basePosts.map(({ slug, title, date, category, image, imageAlt, excerpt }) => ({
    slug,
    title,
    date,
    category,
    image,
    imageAlt,
    excerpt,
  }));

  await fs.writeFile(LIST_PATH, `${JSON.stringify(listPayload, null, 2)}\n`, "utf8");
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifestPayload, null, 2)}\n`, "utf8");

  const basePostMap = new Map(basePosts.map((post) => [post.slug, post.raw]));
  let localizedLocaleCount = 0;
  const availableLocales = [];
  const postLocaleMap = Object.fromEntries(basePosts.map(({ slug }) => [slug, []]));

  try {
    const localeEntries = await fs.readdir(BLOG_LOCALES_DIR, { withFileTypes: true });
    for (const localeEntry of localeEntries) {
      if (!localeEntry.isDirectory()) {
        continue;
      }

      const localeDir = path.join(BLOG_LOCALES_DIR, localeEntry.name);
      const localeFiles = (await fs.readdir(localeDir))
        .filter((file) => file.endsWith(".json") && file !== "list.json" && file !== "manifest.json")
        .sort();

      if (localeFiles.length > 0) {
        availableLocales.push(localeEntry.name);
        for (const file of localeFiles) {
          const slug = file.replace(/\.json$/, "");
          if (!postLocaleMap[slug]) {
            postLocaleMap[slug] = [];
          }
          postLocaleMap[slug].push(localeEntry.name);
        }
      }

      const localeOverrides = new Map(await Promise.all(localeFiles.map(async (file) => {
        const slug = file.replace(/\.json$/, "");
        const raw = JSON.parse(await fs.readFile(path.join(localeDir, file), "utf8"));
        return [slug, raw];
      })));

      const localizedPosts = basePosts.map(({ slug, raw }) => {
        const merged = mergePostData(raw, localeOverrides.get(slug));
        return {
          slug,
          title: merged.title,
          category: merged.category,
          date: merged.date,
          image: merged.image,
          imageAlt: merged.imageAlt,
          excerpt: normalizeDescription(merged.metaDescription || extractExcerptFromContent(merged.content)),
        };
      }).sort((left, right) => {
        const byDate = toSortTime(right.date) - toSortTime(left.date);
        return byDate || left.slug.localeCompare(right.slug);
      });

      const localizedListPayload = localizedPosts.map(({ slug, title, category, date, image, excerpt }) => ({
        slug,
        title,
        category,
        date,
        image,
        excerpt,
      }));

      const localizedManifestPayload = localizedPosts.map(({ slug, title, date, category, image, imageAlt, excerpt }) => ({
        slug,
        title,
        date,
        category,
        image,
        imageAlt,
        excerpt,
      }));

      await fs.writeFile(path.join(localeDir, "list.json"), `${JSON.stringify(localizedListPayload, null, 2)}\n`, "utf8");
      await fs.writeFile(path.join(localeDir, "manifest.json"), `${JSON.stringify(localizedManifestPayload, null, 2)}\n`, "utf8");
      localizedLocaleCount += 1;
    }
  } catch {
    // Locale-specific blog content is optional.
  }

  const localeAvailabilityPayload = {
    defaultLanguage: "en",
    languages: availableLocales.sort(),
    posts: Object.fromEntries(
      Object.entries(postLocaleMap).map(([slug, locales]) => [slug, locales.sort()]),
    ),
  };

  await fs.writeFile(LOCALE_AVAILABILITY_PATH, `${JSON.stringify(localeAvailabilityPayload, null, 2)}\n`, "utf8");

  console.log(`Synced ${listPayload.length} blog index entries.${localizedLocaleCount > 0 ? ` Generated localized blog indexes for ${localizedLocaleCount} locale(s).` : ""}`);
}

main().catch((error) => {
  console.error("Failed to sync blog index files.");
  console.error(error);
  process.exit(1);
});