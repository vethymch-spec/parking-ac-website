#!/usr/bin/env node
/**
 * Build-time prerendering for SEO
 * 
 * Spins up a local static server, renders each route with Puppeteer,
 * and saves the fully-rendered HTML (with meta tags, structured data,
 * hreflang, content) as static .html files in dist/client.
 * 
 * This means Googlebot sees real content instead of <div id="root"></div>.
 */
import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist", "client");
const PORT = 4173;

// MIME types for static file serving
const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

// ─── Routes to prerender ───────────────────────────────
function getRoutes() {
  const staticRoutes = [
    "/",
    "/products",
    "/products/top-mounted-ac",
    "/products/mini-split-ac",
    "/products/heating-cooling-ac",
    "/products/nano-max",
    "/features/power",
    "/features/efficiency",
    "/features/installation",
    "/features/battery",
    "/features/durability",
    "/features/noise",
    "/about",
    "/contact",
    "/warranty",
    "/return-policy",
    "/shipping-policy",
    "/privacy-policy",
    "/blog",
    "/brand-knowledge",
    "/forum",
    "/support",
  ];

  // Blog articles from list.json
  const blogRoutes = [];
  try {
    const listPath = join(DIST, "data", "blog", "list.json");
    const list = JSON.parse(readFileSync(listPath, "utf-8"));
    for (const item of list) {
      if (item.slug) blogRoutes.push(`/blog/${item.slug}`);
    }
  } catch (e) {
    console.warn("⚠ Could not read blog list.json:", e.message);
  }

  return [...staticRoutes, ...blogRoutes];
}

// ─── Static file server (serves built SPA) ─────────────
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let urlPath;
      try {
        urlPath = decodeURIComponent(req.url.split("?")[0]);
      } catch {
        urlPath = req.url.split("?")[0];
      }
      let filePath = join(DIST, urlPath);

      // If it's a directory or no extension, serve index.html (SPA fallback)
      if (!extname(filePath) || !existsSync(filePath)) {
        filePath = join(DIST, "index.html");
      }

      try {
        const data = readFileSync(filePath);
        const ext = extname(filePath);
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(data);
      } catch {
        // Fallback to index.html for SPA routes
        const html = readFileSync(join(DIST, "index.html"));
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      }
    });

    server.listen(PORT, () => {
      console.log(`📡 Static server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

// ─── Prerender a single route ──────────────────────────
async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  
  // Block unnecessary resources for speed
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "media", "font"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait a bit for React to finish rendering and useSEO to update meta tags
    await page.waitForFunction(
      () => document.querySelector("#root")?.innerHTML?.length > 100,
      { timeout: 15000 }
    ).catch(() => {});

    // Small extra delay for hreflang/canonical injection by useSEO hook
    await new Promise((r) => setTimeout(r, 500));

    // Get the full rendered HTML
    let html = await page.content();

    // Clean up: remove Vite HMR, analytics scripts that shouldn't be in static HTML
    html = html.replace(/<script[^>]*data-cf-beacon[^>]*><\/script>/g, "");
    
    return html;
  } catch (err) {
    console.error(`  ✗ Failed: ${route} — ${err.message}`);
    return null;
  } finally {
    await page.close();
  }
}

// ─── Save HTML to correct file path ────────────────────
function saveHtml(route, html) {
  let outPath;
  if (route === "/") {
    outPath = join(DIST, "index.html");
  } else {
    // /blog/my-article → dist/client/blog/my-article.html
    outPath = join(DIST, `${route}.html`);
  }

  const dir = dirname(outPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(outPath, html, "utf-8");
}

// ─── Main ──────────────────────────────────────────────
async function main() {
  console.log("🔨 CoolDrivePro SEO Prerender");
  console.log("═".repeat(50));

  // Verify dist exists
  if (!existsSync(join(DIST, "index.html"))) {
    console.error("❌ dist/client/index.html not found. Run `npm run build` first.");
    process.exit(1);
  }

  // Save original index.html (we'll overwrite it with prerendered homepage)
  const originalIndex = readFileSync(join(DIST, "index.html"), "utf-8");

  const routes = getRoutes();
  console.log(`📄 Routes to prerender: ${routes.length}`);

  const server = await startServer();

  // Find Chrome
  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  console.log(`🌐 Using Chrome: ${chromePath}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  let success = 0;
  let failed = 0;
  const BATCH_SIZE = 5;

  for (let i = 0; i < routes.length; i += BATCH_SIZE) {
    const batch = routes.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (route) => {
        const html = await prerenderRoute(browser, route);
        if (html) {
          saveHtml(route, html);
          success++;
          return route;
        } else {
          failed++;
          return null;
        }
      })
    );

    const done = Math.min(i + BATCH_SIZE, routes.length);
    process.stdout.write(`\r  ✅ ${done}/${routes.length} rendered (${success} ok, ${failed} fail)`);
  }

  console.log("");

  // Also write a copy of the SPA index.html as a fallback for unknown routes
  // Cloudflare Pages _redirects handles SPA fallback, but prerendered .html files take priority
  writeFileSync(join(DIST, "_spa_fallback.html"), originalIndex, "utf-8");

  await browser.close();
  server.close();

  console.log("═".repeat(50));
  console.log(`✨ Prerendering complete: ${success} pages rendered`);
  if (failed > 0) console.log(`⚠ ${failed} pages failed`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
