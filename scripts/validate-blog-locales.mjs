import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT_DIR = process.cwd();
const BLOG_DIR = path.join(ROOT_DIR, "client", "public", "data", "blog");
const BLOG_LOCALES_DIR = path.join(BLOG_DIR, "locales");
const EXCLUDED_BASE_FILES = new Set(["list.json", "manifest.json", "locale-availability.json"]);
const EXCLUDED_LOCALE_FILES = new Set(["list.json", "manifest.json"]);
const REQUIRED_TEXT_FIELDS = ["title", "category", "date", "image", "metaDescription"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function readJsonSafe(filePath, errors) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function printIssueBlock(title, issues) {
  if (issues.length === 0) {
    return;
  }

  console.log(`\n${title}`);
  for (const issue of issues) {
    console.log(`- ${issue}`);
  }
}

async function main() {
  const errors = [];
  const warnings = [];

  const baseFiles = (await fs.readdir(BLOG_DIR))
    .filter((file) => file.endsWith(".json") && !EXCLUDED_BASE_FILES.has(file))
    .sort();

  const baseSlugs = new Set(baseFiles.map((file) => file.replace(/\.json$/, "")));

  if (baseSlugs.size === 0) {
    errors.push("No source blog files found under client/public/data/blog.");
  }

  const localeEntries = await fs.readdir(BLOG_LOCALES_DIR, { withFileTypes: true }).catch(() => []);
  const localeDirs = localeEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

  if (localeDirs.length === 0) {
    errors.push("No locale folders found under client/public/data/blog/locales.");
  }

  let totalLocaleFiles = 0;

  for (const locale of localeDirs) {
    const localeDir = path.join(BLOG_LOCALES_DIR, locale);
    const localeFiles = (await fs.readdir(localeDir))
      .filter((file) => file.endsWith(".json") && !EXCLUDED_LOCALE_FILES.has(file))
      .sort();

    totalLocaleFiles += localeFiles.length;

    if (localeFiles.length === 0) {
      warnings.push(`${locale}: no localized article files found.`);
    }

    for (const file of localeFiles) {
      const slug = file.replace(/\.json$/, "");
      const absolutePath = path.join(localeDir, file);
      const payload = await readJsonSafe(absolutePath, errors);
      if (!payload) {
        continue;
      }

      if (!baseSlugs.has(slug)) {
        warnings.push(`${locale}/${file}: localized slug does not exist in source blog set.`);
      }

      for (const field of REQUIRED_TEXT_FIELDS) {
        if (!isNonEmptyString(payload[field])) {
          errors.push(`${locale}/${file}: missing or empty text field '${field}'.`);
        }
      }

      if (!Array.isArray(payload.content) || payload.content.length === 0) {
        errors.push(`${locale}/${file}: content must be a non-empty array.`);
      }
    }

    for (const indexFile of ["list.json", "manifest.json"]) {
      const indexPath = path.join(localeDir, indexFile);
      const exists = await fs.access(indexPath).then(() => true).catch(() => false);
      if (!exists) {
        warnings.push(`${locale}/${indexFile}: missing, run npm run sync:blog-index to generate it.`);
        continue;
      }

      const parsed = await readJsonSafe(indexPath, errors);
      if (parsed && !Array.isArray(parsed)) {
        errors.push(`${locale}/${indexFile}: expected top-level array.`);
      }
    }
  }

  const availabilityPath = path.join(BLOG_DIR, "locale-availability.json");
  const availability = await readJsonSafe(availabilityPath, errors);

  if (availability && typeof availability === "object") {
    const postsMap = availability.posts && typeof availability.posts === "object"
      ? availability.posts
      : availability;

    for (const slug of Object.keys(postsMap)) {
      if (["defaultLanguage", "languages", "posts"].includes(slug)) {
        continue;
      }

      if (!baseSlugs.has(slug)) {
        warnings.push(`locale-availability.json: unknown slug '${slug}'.`);
      }

      const languages = postsMap[slug];
      if (!Array.isArray(languages)) {
        errors.push(`locale-availability.json: slug '${slug}' must map to an array of languages.`);
      }
    }
  }

  console.log("Blog locale validation summary");
  console.log(`- Source articles: ${baseSlugs.size}`);
  console.log(`- Locale folders: ${localeDirs.length}`);
  console.log(`- Localized article files: ${totalLocaleFiles}`);

  printIssueBlock("Warnings", warnings);
  printIssueBlock("Errors", errors);

  if (errors.length > 0) {
    console.error(`\nValidation failed with ${errors.length} error(s).`);
    process.exit(1);
  }

  console.log("\nValidation passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
