import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const ROOT_DIR = process.cwd();
const BLOG_DIR = path.join(ROOT_DIR, "client", "public", "data", "blog");
const BLOG_LOCALES_DIR = path.join(BLOG_DIR, "locales");
const I18N_LOCALES_DIR = path.join(ROOT_DIR, "client", "src", "i18n", "locales");
const EXCLUDED_BLOG_FILES = new Set(["list.json", "manifest.json", "locale-availability.json"]);
const DEFAULT_DAILY_TARGET = 200;
const DEFAULT_CHUNK_SIZE = 40;
const DEFAULT_MIN_CHUNK_SIZE = 5;
const DEFAULT_REQUEST_DELAY_MS = 450;
const DEFAULT_NO_PROGRESS_CYCLES = 2;
const NO_PROGRESS_BACKOFF_MS = 2500;
const DEFAULT_STATE_PATH = path.join(ROOT_DIR, ".translation-daily-state.json");

function parseArgs(argv) {
  const options = {
    dailyTarget: DEFAULT_DAILY_TARGET,
    chunkSize: DEFAULT_CHUNK_SIZE,
    minChunkSize: DEFAULT_MIN_CHUNK_SIZE,
    requestDelayMs: DEFAULT_REQUEST_DELAY_MS,
    noProgressCycles: DEFAULT_NO_PROGRESS_CYCLES,
    languages: null,
    force: false,
    dryRun: false,
    skipSync: false,
    statePath: DEFAULT_STATE_PATH,
  };

  for (const arg of argv) {
    if (arg.startsWith("--daily=")) {
      const value = Number(arg.slice("--daily=".length));
      if (Number.isFinite(value) && value > 0) {
        options.dailyTarget = Math.floor(value);
      }
      continue;
    }

    if (arg.startsWith("--chunk=")) {
      const value = Number(arg.slice("--chunk=".length));
      if (Number.isFinite(value) && value > 0) {
        options.chunkSize = Math.floor(value);
      }
      continue;
    }

    if (arg.startsWith("--min-chunk=")) {
      const value = Number(arg.slice("--min-chunk=".length));
      if (Number.isFinite(value) && value > 0) {
        options.minChunkSize = Math.floor(value);
      }
      continue;
    }

    if (arg.startsWith("--request-delay=")) {
      const value = Number(arg.slice("--request-delay=".length));
      if (Number.isFinite(value) && value > 0) {
        options.requestDelayMs = Math.floor(value);
      }
      continue;
    }

    if (arg.startsWith("--no-progress-cycles=")) {
      const value = Number(arg.slice("--no-progress-cycles=".length));
      if (Number.isFinite(value) && value > 0) {
        options.noProgressCycles = Math.floor(value);
      }
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

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--skip-sync") {
      options.skipSync = true;
      continue;
    }

    if (arg.startsWith("--state-file=")) {
      const rawPath = arg.slice("--state-file=".length).trim();
      if (rawPath) {
        options.statePath = path.isAbsolute(rawPath) ? rawPath : path.join(ROOT_DIR, rawPath);
      }
    }
  }

  return options;
}

function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonSafe(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function loadState(statePath) {
  const state = await readJsonSafe(statePath);
  if (!state || typeof state !== "object") {
    return {
      version: 1,
      lastDate: null,
      completedToday: 0,
      nextLanguageIndex: 0,
    };
  }

  return {
    version: 1,
    lastDate: typeof state.lastDate === "string" ? state.lastDate : null,
    completedToday: Number.isFinite(state.completedToday) ? Math.max(0, Math.floor(state.completedToday)) : 0,
    nextLanguageIndex: Number.isFinite(state.nextLanguageIndex) ? Math.max(0, Math.floor(state.nextLanguageIndex)) : 0,
  };
}

async function getTargetLanguages(requestedLanguages) {
  const availableLanguages = (await fs.readdir(I18N_LOCALES_DIR))
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .filter((language) => language !== "en")
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

async function getBaseSlugs() {
  const files = (await fs.readdir(BLOG_DIR))
    .filter((file) => file.endsWith(".json") && !EXCLUDED_BLOG_FILES.has(file))
    .sort();

  return files.map((file) => file.replace(/\.json$/, ""));
}

async function getMissingSlugsForLanguage(language, baseSlugs) {
  const localeDir = path.join(BLOG_LOCALES_DIR, language);
  await fs.mkdir(localeDir, { recursive: true });

  const missing = [];
  for (const slug of baseSlugs) {
    const localizedPath = path.join(localeDir, `${slug}.json`);
    if (!await fileExists(localizedPath)) {
      missing.push(slug);
    }
  }

  return missing;
}

function findNextLanguageWithMissing(targetLanguages, missingByLanguage, startIndex) {
  for (let offset = 0; offset < targetLanguages.length; offset += 1) {
    const index = (startIndex + offset) % targetLanguages.length;
    const language = targetLanguages[index];
    const missing = missingByLanguage.get(language) || [];
    if (missing.length > 0) {
      return { language, index };
    }
  }

  return null;
}

async function runNodeScript(scriptRelativePath, args = [], envOverrides = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptRelativePath, ...args], {
      cwd: ROOT_DIR,
      stdio: "inherit",
      env: {
        ...process.env,
        ...envOverrides,
      },
    });

    child.on("error", () => resolve(1));
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

async function runTranslateBatch(language, slugs, options) {
  const args = [
    `--langs=${language}`,
    `--slugs=${slugs.join(",")}`,
    "--skip-sync",
  ];

  if (options.force) {
    args.push("--force");
  }

  return runNodeScript(
    path.join("scripts", "translate-blog-locales.mjs"),
    args,
    {
      BLOG_TRANSLATE_INTER_REQUEST_DELAY_MS: String(options.requestDelayMs),
    },
  );
}

async function countSuccessfulSlugs(language, slugs) {
  let successCount = 0;

  for (const slug of slugs) {
    const localizedPath = path.join(BLOG_LOCALES_DIR, language, `${slug}.json`);
    if (await fileExists(localizedPath)) {
      successCount += 1;
    }
  }

  return successCount;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const state = await loadState(options.statePath);
  const targetLanguages = await getTargetLanguages(options.languages);
  const baseSlugs = await getBaseSlugs();

  if (targetLanguages.length === 0 || baseSlugs.length === 0) {
    console.log("[daily] no target languages or source articles found.");
    return;
  }

  const today = getTodayLocalDateString();
  if (state.lastDate !== today) {
    state.lastDate = today;
    state.completedToday = 0;
  }

  let remainingBudget = options.dailyTarget - state.completedToday;
  if (remainingBudget <= 0) {
    console.log(`[daily] ${today} quota reached: ${state.completedToday}/${options.dailyTarget}.`);
    return;
  }

  console.log(`[daily] date: ${today}`);
  console.log(`[daily] quota: ${state.completedToday}/${options.dailyTarget}`);
  console.log(`[daily] remaining budget: ${remainingBudget}`);
  console.log(`[daily] languages: ${targetLanguages.length}`);
  console.log(`[daily] chunk size: ${options.chunkSize}`);
  console.log(`[daily] min chunk size: ${Math.min(options.minChunkSize, options.chunkSize)}`);
  console.log(`[daily] request delay ms: ${options.requestDelayMs}`);

  let nextLanguageIndex = state.nextLanguageIndex % targetLanguages.length;
  let completedThisRun = 0;
  let noProgressRounds = 0;
  const minChunkSize = Math.max(1, Math.min(options.minChunkSize, options.chunkSize));
  let adaptiveChunkSize = options.chunkSize;
  const maxNoProgressRounds = Math.max(targetLanguages.length * options.noProgressCycles, targetLanguages.length);

  while (remainingBudget > 0) {
    const missingByLanguage = new Map();
    let totalMissing = 0;

    for (const language of targetLanguages) {
      const missing = await getMissingSlugsForLanguage(language, baseSlugs);
      missingByLanguage.set(language, missing);
      totalMissing += missing.length;
    }

    if (totalMissing === 0) {
      console.log("[daily] all locales are fully translated.");
      break;
    }

    const candidate = findNextLanguageWithMissing(targetLanguages, missingByLanguage, nextLanguageIndex);
    if (!candidate) {
      break;
    }

    const missingSlugs = missingByLanguage.get(candidate.language) || [];
    const batchSize = Math.min(remainingBudget, adaptiveChunkSize, missingSlugs.length);
    const batchSlugs = missingSlugs.slice(0, batchSize);

    nextLanguageIndex = (candidate.index + 1) % targetLanguages.length;

    if (batchSlugs.length === 0) {
      noProgressRounds += 1;
      if (noProgressRounds >= targetLanguages.length) {
        console.log("[daily] no progress possible in this run, stopping early.");
        break;
      }
      continue;
    }

    console.log(`\n[daily] translating ${candidate.language}: ${batchSlugs.length} article(s)`);

    if (options.dryRun) {
      console.log(`[daily] dry-run only, skipped actual translation for ${candidate.language}.`);
      break;
    }

    const exitCode = await runTranslateBatch(candidate.language, batchSlugs, options);
    const successCount = await countSuccessfulSlugs(candidate.language, batchSlugs);

    if (exitCode !== 0) {
      console.warn(`[daily] translator exited with code ${exitCode} for ${candidate.language}, continuing.`);
    }

    if (successCount > 0) {
      completedThisRun += successCount;
      state.completedToday += successCount;
      remainingBudget = options.dailyTarget - state.completedToday;
      noProgressRounds = 0;

      // Grow chunk size gradually after successful batches.
      adaptiveChunkSize = Math.min(options.chunkSize, adaptiveChunkSize + 1);
      console.log(`[daily] ${candidate.language}: +${successCount} success, remaining budget ${Math.max(remainingBudget, 0)}`);
      await writeJson(options.statePath, state);
    } else {
      noProgressRounds += 1;
      const previousChunkSize = adaptiveChunkSize;
      adaptiveChunkSize = Math.max(minChunkSize, Math.floor(adaptiveChunkSize / 2));
      console.warn(`[daily] ${candidate.language}: no successful new files in this batch.`);

      if (adaptiveChunkSize !== previousChunkSize) {
        console.warn(`[daily] reducing chunk size to ${adaptiveChunkSize} after no-progress batch.`);
      }

      await sleep(NO_PROGRESS_BACKOFF_MS);

      if (noProgressRounds >= maxNoProgressRounds) {
        console.warn("[daily] repeated no-progress rounds reached limit, stopping.");
        break;
      }
    }
  }

  state.nextLanguageIndex = nextLanguageIndex;
  await writeJson(options.statePath, state);

  if (!options.dryRun && !options.skipSync && completedThisRun > 0) {
    const syncExitCode = await runNodeScript(path.join("scripts", "sync-blog-index.mjs"));
    if (syncExitCode !== 0) {
      console.warn(`[daily] sync-blog-index exited with code ${syncExitCode}.`);
    }
  }

  console.log("\n[daily] run summary");
  console.log(`[daily] completed this run: ${completedThisRun}`);
  console.log(`[daily] today progress: ${state.completedToday}/${options.dailyTarget}`);
  console.log(`[daily] state file: ${options.statePath}`);
}

main().catch((error) => {
  console.error("[daily] translation scheduler failed");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
