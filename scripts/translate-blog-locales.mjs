import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import translate from "translate-google";

const ROOT_DIR = process.cwd();
const BLOG_DIR = path.join(ROOT_DIR, "client", "public", "data", "blog");
const BLOG_LOCALES_DIR = path.join(BLOG_DIR, "locales");
const I18N_LOCALES_DIR = path.join(ROOT_DIR, "client", "src", "i18n", "locales");
const MAX_BATCH_CHARS = 3600;
const MAX_ATTEMPTS = 5;
const MAX_RATE_LIMIT_ATTEMPTS = 9;
const BASE_DELAY_MS = 1200;
const RATE_LIMIT_BASE_DELAY_MS = 3000;
const RATE_LIMIT_MAX_DELAY_MS = 45000;
const INTER_REQUEST_DELAY_MS = (() => {
  const value = Number(process.env.BLOG_TRANSLATE_INTER_REQUEST_DELAY_MS || process.env.INTER_REQUEST_DELAY_MS);
  if (Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  return 150;
})();
const DEFAULT_SOURCE_LANGUAGE = "en";
const EXCLUDED_BLOG_FILES = new Set(["list.json", "manifest.json", "locale-availability.json"]);

const PROTECTED_TERMS = [
  "CoolDrivePro",
  "VS02 PRO",
  "VX3000SP",
  "Nano Max",
  "V-TH1",
  "LiFePO4",
  "BTU",
  "12V",
  "24V",
  "APU",
  "DC",
  "RV",
  "HVAC",
].sort((left, right) => right.length - left.length);

const LANGUAGE_REPLACEMENTS = {
  "zh-CN": [
    ["停车空调", "驻车空调"],
    ["半卡车", "半挂卡车"],
    ["买家 指南", "购买指南"],
    ["卡车 司机", "卡车司机"],
    ["卧铺 驾驶室", "卧铺驾驶室"],
  ],
  "zh-TW": [
    ["停車空調", "駐車空調"],
    ["半卡車", "半掛卡車"],
    ["買家 指南", "購買指南"],
    ["卡車 司機", "卡車司機"],
    ["臥鋪 駕駛室", "臥鋪駕駛室"],
  ],
};

const TRANSLATE_LANGUAGE_OVERRIDES = {
  he: "iw",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseArgs(argv) {
  const options = {
    force: false,
    languages: null,
    slugs: null,
    limit: null,
    skipSync: false,
  };

  for (const arg of argv) {
    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg.startsWith("--langs=")) {
      options.languages = arg
        .slice("--langs=".length)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      continue;
    }

    if (arg.startsWith("--slugs=")) {
      options.slugs = arg
        .slice("--slugs=".length)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      continue;
    }

    if (arg.startsWith("--limit=")) {
      const value = Number(arg.slice("--limit=".length));
      if (Number.isFinite(value) && value > 0) {
        options.limit = value;
      }
      continue;
    }

    if (arg === "--skip-sync") {
      options.skipSync = true;
    }
  }

  return options;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function getTargetLanguages(requestedLanguages) {
  const availableLanguages = (await fs.readdir(I18N_LOCALES_DIR))
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .filter((language) => language !== DEFAULT_SOURCE_LANGUAGE)
    .sort();

  if (!requestedLanguages || requestedLanguages.length === 0) {
    return availableLanguages;
  }

  const unknownLanguages = requestedLanguages.filter((language) => !availableLanguages.includes(language));
  if (unknownLanguages.length > 0) {
    throw new Error(`Unsupported languages: ${unknownLanguages.join(", ")}`);
  }

  return requestedLanguages;
}

async function getSourceArticles(requestedSlugs, limit) {
  const articleFiles = (await fs.readdir(BLOG_DIR))
    .filter((file) => file.endsWith(".json") && !EXCLUDED_BLOG_FILES.has(file))
    .sort();

  const filteredFiles = requestedSlugs && requestedSlugs.length > 0
    ? articleFiles.filter((file) => requestedSlugs.includes(file.replace(/\.json$/, "")))
    : articleFiles;

  if (requestedSlugs && requestedSlugs.length > 0) {
    const foundSlugs = new Set(filteredFiles.map((file) => file.replace(/\.json$/, "")));
    const missingSlugs = requestedSlugs.filter((slug) => !foundSlugs.has(slug));
    if (missingSlugs.length > 0) {
      throw new Error(`Unknown blog slugs: ${missingSlugs.join(", ")}`);
    }
  }

  const selectedFiles = limit ? filteredFiles.slice(0, limit) : filteredFiles;
  return Promise.all(selectedFiles.map(async (file) => ({
    slug: file.replace(/\.json$/, ""),
    fileName: file,
    source: await readJson(path.join(BLOG_DIR, file)),
  })));
}

function deepMapStrings(value, mapper) {
  if (typeof value === "string") {
    return mapper(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepMapStrings(item, mapper));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, deepMapStrings(item, mapper)]),
    );
  }

  return value;
}

function protectTerms(value) {
  let result = value;
  for (let index = 0; index < PROTECTED_TERMS.length; index += 1) {
    const term = PROTECTED_TERMS[index];
    const token = `__CDP_TERM_${index}__`;
    result = result.replace(new RegExp(escapeRegExp(term), "g"), token);
  }
  return result;
}

function restoreTerms(value) {
  let result = value;
  for (let index = 0; index < PROTECTED_TERMS.length; index += 1) {
    const token = `__CDP_TERM_${index}__`;
    result = result.replace(new RegExp(token, "g"), PROTECTED_TERMS[index]);
  }
  return result;
}

function cleanCjkSpacing(value) {
  return value
    .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])\s+([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu, "$1$2")
    .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])\s+([，。！？：；、])/gu, "$1$2")
    .replace(/([（《“])\s+/gu, "$1")
    .replace(/\s+([）》”])/gu, "$1");
}

function postProcessString(language, value) {
  let result = restoreTerms(value);

  if (["zh-CN", "zh-TW", "ja"].includes(language)) {
    result = cleanCjkSpacing(result);
  }

  for (const [search, replacement] of LANGUAGE_REPLACEMENTS[language] || []) {
    result = result.replace(new RegExp(escapeRegExp(search), "g"), replacement);
  }

  return result.trim();
}

function resolveTranslateLanguage(language) {
  return TRANSLATE_LANGUAGE_OVERRIDES[language] || language;
}

function isRateLimitError(error) {
  const message = String(error?.message || "");
  return message.includes("429") || message.toLowerCase().includes("too many requests");
}

function getRetryDelayMs(attempt, isRateLimited) {
  if (isRateLimited) {
    const exponentialDelay = RATE_LIMIT_BASE_DELAY_MS * (2 ** (attempt - 1));
    const jitter = Math.floor(Math.random() * 1200);
    return Math.min(exponentialDelay + jitter, RATE_LIMIT_MAX_DELAY_MS);
  }

  return BASE_DELAY_MS * attempt;
}

function measurePayload(value) {
  return JSON.stringify(value).length;
}

function normalizeContentItem(item) {
  if (typeof item === "string") {
    return {
      kind: "string",
      heading: null,
      body: item,
    };
  }

  return {
    kind: "object",
    heading: typeof item?.heading === "string" ? item.heading : null,
    body: typeof item?.body === "string" ? item.body : "",
  };
}

function denormalizeContentItem(item) {
  if (item.kind === "string") {
    return item.body;
  }

  return {
    heading: item.heading,
    body: item.body,
  };
}

function splitTextUnits(body) {
  const paragraphs = String(body || "")
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return { units: paragraphs, separator: "\n\n" };
  }

  const sentences = String(body || "")
    .match(/[^.!?。！？]+[.!?。！？]?/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences && sentences.length > 1) {
    return { units: sentences, separator: " " };
  }

  const raw = String(body || "").trim();
  if (!raw) {
    return { units: [], separator: "" };
  }

  const chunks = [];
  let cursor = 0;
  while (cursor < raw.length) {
    chunks.push(raw.slice(cursor, cursor + 1400));
    cursor += 1400;
  }

  return { units: chunks, separator: "" };
}

function chunkItems(items, maxChars) {
  const batches = [];
  let currentBatch = [];

  for (const item of items) {
    const nextBatch = [...currentBatch, item];
    const payload = { items: nextBatch };

    if (currentBatch.length > 0 && measurePayload(payload) > maxChars) {
      batches.push(currentBatch);
      currentBatch = [item];
      continue;
    }

    currentBatch = nextBatch;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

function splitParagraphs(body) {
  return String(body || "")
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function splitSentences(text) {
  return String(text || "")
    .match(/[^.!?。！？]+[.!?。！？]?/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) || [];
}

function splitFixedChunks(text, size = 1400) {
  const raw = String(text || "").trim();
  if (!raw) {
    return [];
  }

  const chunks = [];
  let cursor = 0;
  while (cursor < raw.length) {
    chunks.push(raw.slice(cursor, cursor + size));
    cursor += size;
  }

  return chunks;
}

let requestCount = 0;

async function translateWithRetry(value, language, contextLabel) {
  const protectedValue = deepMapStrings(value, (text) => protectTerms(text));
  const translateLanguage = resolveTranslateLanguage(language);
  let maxAttempts = MAX_ATTEMPTS;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      requestCount += 1;
      const translated = await translate(protectedValue, {
        from: DEFAULT_SOURCE_LANGUAGE,
        to: translateLanguage,
      });

      await sleep(INTER_REQUEST_DELAY_MS);
      return deepMapStrings(translated, (text) => postProcessString(language, text));
    } catch (error) {
      const rateLimited = isRateLimitError(error);
      if (rateLimited) {
        maxAttempts = Math.max(maxAttempts, MAX_RATE_LIMIT_ATTEMPTS);
      }

      if (attempt === maxAttempts) {
        throw new Error(`${contextLabel} failed after ${maxAttempts} attempts: ${error.message}`);
      }

      const delay = getRetryDelayMs(attempt, rateLimited);
      console.warn(`[translate] ${contextLabel} attempt ${attempt} failed: ${error.message}`);
      console.warn(`[translate] retrying in ${delay}ms`);
      await sleep(delay);
    }
  }

  throw new Error(`${contextLabel} exhausted retries`);
}

async function translateBodyText(body, language, contextLabel) {
  const paragraphs = splitParagraphs(body);
  if (paragraphs.length > 1) {
    const translatedParagraphs = [];
    for (let index = 0; index < paragraphs.length; index += 1) {
      translatedParagraphs.push(await translateCompactText(paragraphs[index], language, `${contextLabel} paragraph ${index + 1}`));
    }
    return translatedParagraphs.join("\n\n");
  }

  return translateCompactText(body, language, contextLabel);
}

async function translateCompactText(text, language, contextLabel) {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) {
    return "";
  }

  if (measurePayload({ items: [normalizedText] }) <= MAX_BATCH_CHARS) {
    const translated = await translateWithRetry({ items: [normalizedText] }, language, contextLabel);
    return translated.items[0];
  }

  const sentences = splitSentences(normalizedText);
  if (sentences.length > 1) {
    const translatedSentences = [];
    const batches = chunkItems(sentences, MAX_BATCH_CHARS).map((batch) => batch.map(String));

    for (const batch of batches) {
      const result = await translateWithRetry({ items: batch }, language, contextLabel);
      translatedSentences.push(...result.items);
    }

    return translatedSentences.join(" ");
  }

  const chunks = splitFixedChunks(normalizedText);
  if (chunks.length === 0) {
    return "";
  }

  const translatedChunks = [];
  const batches = chunkItems(chunks, MAX_BATCH_CHARS).map((batch) => batch.map(String));

  for (const batch of batches) {
    const result = await translateWithRetry({ items: batch }, language, contextLabel);
    translatedChunks.push(...result.items);
  }

  return translatedChunks.join("");
}

async function translateLargeContentItem(item, language, contextLabel) {
  const headingPayload = item.heading
    ? await translateWithRetry({ heading: item.heading }, language, `${contextLabel} heading`)
    : { heading: null };

  const translatedBody = await translateBodyText(item.body, language, `${contextLabel} body`);

  return {
    ...item,
    heading: headingPayload.heading,
    body: translatedBody,
  };
}

async function translateContentItems(content, language, slug) {
  const normalizedItems = content.map(normalizeContentItem);
  const translatedItems = new Array(normalizedItems.length);
  const smallItems = [];

  for (let index = 0; index < normalizedItems.length; index += 1) {
    const item = normalizedItems[index];
    const payloadLength = measurePayload({ items: [item] });

    if (payloadLength > MAX_BATCH_CHARS) {
      translatedItems[index] = await translateLargeContentItem(item, language, `${slug} section ${index + 1}`);
      continue;
    }

    smallItems.push({ index, item });
  }

  let batch = [];
  for (const entry of smallItems) {
    const nextBatch = [...batch, entry];
    const payload = { items: nextBatch.map(({ item }) => item) };

    if (batch.length > 0 && measurePayload(payload) > MAX_BATCH_CHARS) {
      const result = await translateWithRetry({ items: batch.map(({ item }) => item) }, language, `${slug} content batch`);
      result.items.forEach((item, resultIndex) => {
        translatedItems[batch[resultIndex].index] = item;
      });
      batch = [entry];
      continue;
    }

    batch = nextBatch;
  }

  if (batch.length > 0) {
    const result = await translateWithRetry({ items: batch.map(({ item }) => item) }, language, `${slug} content batch`);
    result.items.forEach((item, resultIndex) => {
      translatedItems[batch[resultIndex].index] = item;
    });
  }

  return translatedItems.map(denormalizeContentItem);
}

async function translateArticle(slug, article, language) {
  const meta = await translateWithRetry({
    title: article.title,
    date: article.date,
    category: article.category,
    imageAlt: article.imageAlt,
    metaDescription: article.metaDescription,
  }, language, `${slug} meta`);

  const content = await translateContentItems(Array.isArray(article.content) ? article.content : [], language, slug);

  return {
    ...article,
    title: meta.title,
    date: meta.date,
    category: meta.category,
    imageAlt: meta.imageAlt,
    metaDescription: meta.metaDescription,
    content,
  };
}

async function runNodeScript(scriptRelativePath) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptRelativePath], {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${scriptRelativePath} exited with code ${code}`));
    });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();
  const targetLanguages = await getTargetLanguages(options.languages);
  const sourceArticles = await getSourceArticles(options.slugs, options.limit);

  console.log(`[translate] languages: ${targetLanguages.length}`);
  console.log(`[translate] articles: ${sourceArticles.length}`);
  console.log(`[translate] force overwrite: ${options.force ? "yes" : "no"}`);
  console.log(`[translate] request delay ms: ${INTER_REQUEST_DELAY_MS}`);

  let translatedArticleCount = 0;
  let skippedArticleCount = 0;
  let failedArticleCount = 0;

  await fs.mkdir(BLOG_LOCALES_DIR, { recursive: true });

  for (const language of targetLanguages) {
    const localeDir = path.join(BLOG_LOCALES_DIR, language);
    await fs.mkdir(localeDir, { recursive: true });

    console.log(`\n[translate] starting ${language}`);

    for (let index = 0; index < sourceArticles.length; index += 1) {
      const article = sourceArticles[index];
      const targetPath = path.join(localeDir, `${article.slug}.json`);

      if (!options.force) {
        try {
          await fs.access(targetPath);
          skippedArticleCount += 1;
          process.stdout.write(`\r[translate] ${language} ${index + 1}/${sourceArticles.length} skipped ${article.slug}                `);
          continue;
        } catch {
          // File does not exist yet.
        }
      }

      try {
        const translatedArticle = await translateArticle(article.slug, article.source, language);
        await writeJson(targetPath, translatedArticle);
        translatedArticleCount += 1;

        process.stdout.write(`\r[translate] ${language} ${index + 1}/${sourceArticles.length} translated ${article.slug}                `);
      } catch (error) {
        failedArticleCount += 1;
        process.stdout.write(`\r[translate] ${language} ${index + 1}/${sourceArticles.length} failed ${article.slug}                `);
        console.warn(`\n[translate] ${language} ${article.slug} failed and will be retried on next run: ${error.message}`);
      }
    }

    process.stdout.write("\n");
  }

  if (!options.skipSync) {
    await runNodeScript(path.join("scripts", "sync-blog-index.mjs"));
  }

  const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
  console.log(`\n[translate] complete`);
  console.log(`[translate] translated articles: ${translatedArticleCount}`);
  console.log(`[translate] skipped articles: ${skippedArticleCount}`);
  console.log(`[translate] failed articles: ${failedArticleCount}`);
  console.log(`[translate] translation requests: ${requestCount}`);
  console.log(`[translate] elapsed seconds: ${elapsedSeconds}`);
}

main().catch((error) => {
  console.error("[translate] blog locale generation failed");
  console.error(error);
  process.exit(1);
});