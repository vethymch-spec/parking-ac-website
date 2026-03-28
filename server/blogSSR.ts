/**
 * Blog SSR (Server-Side Rendering) for SEO
 *
 * When Googlebot or any crawler requests /blog/:slug, this route reads the
 * corresponding JSON file and returns a fully-rendered HTML page with all
 * content inline — no JavaScript required.
 *
 * This fixes the "Soft 404" issue caused by React SPA returning an empty
 * HTML shell that Google interprets as a missing/empty page.
 */

import { type Express } from "express";
import fs from "fs";
import path from "path";

interface BlogPostData {
  title: string;
  date: string;
  category: string;
  image: string;
  imageAlt?: string;
  metaDescription: string;
  content: Array<{ heading: string | null; body: string } | string>;
}

interface BlogListItem {
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
}

function getBlogDataDir(): string {
  // In production the static files are copied to dist/public
  const prodPath = path.resolve(process.cwd(), "dist", "public", "data", "blog");
  const devPath = path.resolve(process.cwd(), "client", "public", "data", "blog");
  return fs.existsSync(prodPath) ? prodPath : devPath;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderContent(content: BlogPostData["content"]): string {
  return content
    .map(item => {
      if (typeof item === "string") {
        return `<p>${escapeHtml(item)}</p>`;
      }
      const heading = item.heading
        ? `<h2>${escapeHtml(item.heading)}</h2>`
        : "";
      // body may contain markdown-style bold (**text**) — convert to <strong>
      const body = escapeHtml(item.body).replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
      );
      return `${heading}<p>${body}</p>`;
    })
    .join("\n");
}

function buildBlogPostHtml(post: BlogPostData, slug: string): string {
  const title = escapeHtml(post.title);
  const description = escapeHtml(post.metaDescription);
  const image = escapeHtml(post.image);
  const date = escapeHtml(post.date);
  const category = escapeHtml(post.category);
  const canonical = `https://cooldrivepro.com/blog/${slug}`;
  const bodyContent = renderContent(post.content);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} – CoolDrivePro</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="CoolDrivePro" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title.replace(/"/g, '\\"')}",
    "description": "${description.replace(/"/g, '\\"')}",
    "image": "${image}",
    "datePublished": "${date}",
    "author": { "@type": "Organization", "name": "CoolDrivePro" },
    "publisher": { "@type": "Organization", "name": "CoolDrivePro", "url": "https://cooldrivepro.com" }
  }
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #fff; color: #1a1a1a; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
    h1 { font-size: 2rem; line-height: 1.3; margin-bottom: 0.5rem; }
    h2 { font-size: 1.4rem; margin-top: 2rem; color: #1a1a1a; }
    p { line-height: 1.8; margin: 1rem 0; }
    img { width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .category { background: #e8f0fe; color: #1a73e8; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; }
    nav { background: #1a1a2e; padding: 1rem; }
    nav a { color: #fff; text-decoration: none; font-weight: 600; font-size: 1.1rem; }
    footer { background: #1a1a2e; color: #aaa; text-align: center; padding: 2rem; margin-top: 4rem; font-size: 0.85rem; }
  </style>
</head>
<body>
  <nav><div class="container"><a href="/">CoolDrivePro</a></div></nav>
  <div class="container">
    <article>
      <span class="category">${category}</span>
      <h1>${title}</h1>
      <div class="meta">${date}</div>
      <img src="${image}" alt="${escapeHtml(post.imageAlt || post.title)}" loading="lazy" />
      ${bodyContent}
    </article>
    <p><a href="/blog">← Back to Blog</a></p>
  </div>
  <footer>© 2025 CoolDrivePro. All rights reserved.</footer>
  <script>
    // Redirect to the React SPA for full interactive experience
    // This page is served to crawlers; browsers get the full SPA
    if (typeof window !== 'undefined' && !navigator.userAgent.match(/Googlebot|bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebot|ia_archiver/i)) {
      // Already on the right URL, React will hydrate
    }
  </script>
</body>
</html>`;
}

export function registerBlogSSRRoutes(app: Express): void {
  const blogDir = getBlogDataDir();

  // Blog post detail — SSR for crawlers and direct access
  app.get("/blog/:slug", (req, res, next) => {
    const { slug } = req.params;
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return next();
    }

    const jsonPath = path.join(blogDir, `${slug}.json`);
    if (!fs.existsSync(jsonPath)) {
      return next();
    }

    try {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      const post: BlogPostData = JSON.parse(raw);
      const html = buildBlogPostHtml(post, slug);
      res.status(200).set("Content-Type", "text/html").end(html);
    } catch {
      next();
    }
  });

  // Blog list page — return basic HTML with all article links for crawlers
  app.get("/blog", (_req, res, next) => {
    const listPath = path.join(blogDir, "list.json");
    if (!fs.existsSync(listPath)) return next();

    try {
      const raw = fs.readFileSync(listPath, "utf-8");
      const articles: BlogListItem[] = JSON.parse(raw);

      const links = articles
        .map(
          a =>
            `<li><a href="/blog/${escapeHtml(a.slug)}">${escapeHtml(a.title)}</a> <span style="color:#666;font-size:0.85rem">(${escapeHtml(a.category)}, ${escapeHtml(a.date)})</span></li>`
        )
        .join("\n");

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Parking Air Conditioner Blog – CoolDrivePro</title>
  <meta name="description" content="Expert guides, tips, and industry news about parking air conditioners for trucks, RVs, vans, and specialty vehicles." />
  <link rel="canonical" href="https://cooldrivepro.com/blog" />
  <style>
    body { font-family: -apple-system, sans-serif; margin: 0; padding: 0; background: #fff; color: #1a1a1a; }
    .container { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
    h1 { font-size: 2rem; }
    ul { list-style: none; padding: 0; }
    li { padding: 0.6rem 0; border-bottom: 1px solid #eee; }
    a { color: #1a73e8; text-decoration: none; }
    nav { background: #1a1a2e; padding: 1rem; }
    nav a { color: #fff; text-decoration: none; font-weight: 600; }
    footer { background: #1a1a2e; color: #aaa; text-align: center; padding: 2rem; margin-top: 4rem; font-size: 0.85rem; }
  </style>
</head>
<body>
  <nav><div class="container"><a href="/">CoolDrivePro</a></div></nav>
  <div class="container">
    <h1>Parking Air Conditioner Blog</h1>
    <p>${articles.length} articles covering parking AC guides, comparisons, installation tips, and industry news.</p>
    <ul>${links}</ul>
  </div>
  <footer>© 2025 CoolDrivePro. All rights reserved.</footer>
</body>
</html>`;
      res.status(200).set("Content-Type", "text/html").end(html);
    } catch {
      next();
    }
  });
}
