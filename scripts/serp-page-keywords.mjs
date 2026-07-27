#!/usr/bin/env node
// Stage 2.5 — 抓取 6 个 PASS 簇里 Top10 (and 一些 Top11-20 from spokes) 真实排名页面的 title/H1/H2/meta description/keyword density
// 输出 research/<date>/top-pages-keywords.json + .csv,供下一步合并进 Word 报告
import fs from "fs";
import path from "path";

const DATE = "2026-06-08";
const ROOT = path.resolve("research", DATE);
const SERP_RAW = path.join(ROOT, "serp-raw");
const OUT_JSON = path.join(ROOT, "top-pages-keywords.json");
const OUT_CSV = path.join(ROOT, "top-pages-keywords.csv");
const CACHE_DIR = path.join(ROOT, "page-html-cache");
fs.mkdirSync(CACHE_DIR, { recursive: true });

const STOP = new Set(`a an the and or but if of for to in on at by with from as is are was were be been being have has had do does did will would shall should can could may might must this that these those it its their there here you your we our i me my his her him she he them they what which who when where how why all any some no not so than then very just more most other such only same own about under over up down out into through against between during before after above below s t can m d ll re ve www com html htm php aspx jsp page pages product products`.split(/\s+/));

function tokenize(s) {
  return (s || "").toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 3 && w.length <= 30 && !STOP.has(w) && !/^\d+$/.test(w));
}

function ngrams(tokens, n) {
  const out = [];
  for (let i = 0; i + n <= tokens.length; i++) out.push(tokens.slice(i, i + n).join(" "));
  return out;
}

function freq(arr) {
  const m = new Map();
  for (const x of arr) m.set(x, (m.get(x) || 0) + 1);
  return m;
}

function topN(map, n) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function pick(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : "";
}

function pickAll(html, re) {
  const out = []; let m;
  while ((m = re.exec(html)) !== null) out.push(m[1].trim());
  return out;
}

function urlSlug(url) {
  return url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]/gi, "_").slice(0, 120);
}

async function fetchPage(url) {
  const cachePath = path.join(CACHE_DIR, urlSlug(url) + ".html");
  if (fs.existsSync(cachePath)) {
    return { html: fs.readFileSync(cachePath, "utf8"), fromCache: true, status: 200 };
  }
  try {
    const r = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const html = await r.text();
    if (r.ok && html.length > 200) {
      fs.writeFileSync(cachePath, html);
    }
    return { html, fromCache: false, status: r.status };
  } catch (e) {
    return { html: "", fromCache: false, status: 0, error: e.message };
  }
}

function analyzePage(url, html) {
  // strip script/style/nav/footer for content extraction
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const title = pick(cleaned, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s+/g, " ").slice(0, 200);
  const metaDesc = pick(cleaned, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
                || pick(cleaned, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const metaKw = pick(cleaned, /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i);
  const ogTitle = pick(cleaned, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);

  const h1s = pickAll(cleaned, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(s => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 5);
  const h2s = pickAll(cleaned, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(s => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 20);

  // body text
  const body = cleaned.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const wc = body.split(/\s+/).filter(Boolean).length;

  // tokens for n-gram analysis (titles + h1 + h2 + body sample)
  const focusText = [title, ogTitle, metaDesc, ...h1s, ...h2s].join(" ");
  const bodyTokens = tokenize(body.slice(0, 30000));

  const tops1 = topN(freq(tokenize(focusText).concat(bodyTokens)), 15).filter(([w, c]) => c >= 3).map(([w, c]) => `${w}(${c})`);
  const tops2 = topN(freq(ngrams(bodyTokens, 2)), 10).filter(([w, c]) => c >= 2 && !w.includes("undefined")).map(([w, c]) => `${w}(${c})`);
  const tops3 = topN(freq(ngrams(bodyTokens, 3)), 8).filter(([w, c]) => c >= 2).map(([w, c]) => `${w}(${c})`);

  return {
    url,
    status: 200,
    title, og_title: ogTitle, meta_description: metaDesc, meta_keywords: metaKw,
    h1: h1s, h2: h2s,
    word_count: wc,
    top_unigrams: tops1,
    top_bigrams: tops2,
    top_trigrams: tops3,
  };
}

// --- main
function loadSerp(kw) {
  const slug = "us_en_" + kw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const fp = path.join(SERP_RAW, slug + ".json");
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf8"));
}

// PASS clusters from clusters.json
const clusters = JSON.parse(fs.readFileSync(path.join(ROOT, "clusters.json"), "utf8")).clusters;
const passing = clusters.filter(c => c.member_count >= 3 && c.median_est_kd <= 40 && c.total_est_volume >= 500);

console.log(`[plan] PASS clusters: ${passing.length}`);

// Per cluster, collect Top10 URLs from the Hub kw + up to 4 top spokes
const clusterUrls = []; // { cluster_id, hub_kw, urls: [{url, freq_in_cluster, ranked_for: [kws]}] }
for (const c of passing) {
  const kws = [c.hub_kw, ...(c.spokes || []).slice(0, 4)];
  const urlFreq = new Map(); // url -> { count, kws: Set }
  for (const kw of kws) {
    const serp = loadSerp(kw);
    if (!serp) continue;
    const org = serp.organic || [];
    for (let i = 0; i < Math.min(20, org.length); i++) {
      const url = org[i].link;
      if (!url) continue;
      // skip Amazon search / eBay search / Youtube / Reddit / Pinterest / Google for page-keyword analysis (these are SERP noise, not informative pages)
      if (/amazon\.com\/.*\/s\?|amazon\.com\/s\?|ebay\.com\/shop|ebay\.com\/sch|youtube\.com\/results|google\.com\/|pinterest\.com\/search|reddit\.com\/search/i.test(url)) continue;
      const e = urlFreq.get(url) || { count: 0, kws: new Set(), title: org[i].title || "" };
      e.count++; e.kws.add(kw);
      urlFreq.set(url, e);
    }
  }
  const urls = [...urlFreq.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 12); // top 12 per cluster
  clusterUrls.push({
    cluster_id: c.cluster_id, hub_kw: c.hub_kw, hub: c.hub,
    urls: urls.map(([u, e]) => ({ url: u, freq: e.count, kws: [...e.kws], serp_title: e.title })),
  });
}

// Dedup URLs across clusters
const uniqueUrls = new Map();
for (const cu of clusterUrls) {
  for (const u of cu.urls) {
    if (!uniqueUrls.has(u.url)) uniqueUrls.set(u.url, { url: u.url, clusters: new Set(), ranks_for_kws: new Set() });
    const e = uniqueUrls.get(u.url);
    e.clusters.add(cu.cluster_id);
    for (const kw of u.kws) e.ranks_for_kws.add(kw);
  }
}

console.log(`[plan] unique URLs to fetch: ${uniqueUrls.size}`);

// Fetch + analyze
const results = [];
let n = 0;
for (const [url, meta] of uniqueUrls) {
  n++;
  const { html, status, fromCache, error } = await fetchPage(url);
  if (!html || html.length < 200) {
    results.push({ url, status, error: error || "empty body", clusters: [...meta.clusters], ranks_for_kws: [...meta.ranks_for_kws] });
    if (n % 10 === 0) console.log(`  [${n}/${uniqueUrls.size}] fetched (err on this one: ${error || status})`);
    continue;
  }
  const a = analyzePage(url, html);
  a.clusters = [...meta.clusters];
  a.ranks_for_kws = [...meta.ranks_for_kws];
  a.from_cache = fromCache;
  results.push(a);
  if (n % 10 === 0) console.log(`  [${n}/${uniqueUrls.size}] ok=${results.filter(r => r.title).length}`);
  if (!fromCache) await new Promise(r => setTimeout(r, 300)); // politeness
}

// Write JSON
fs.writeFileSync(OUT_JSON, JSON.stringify({
  run_at: new Date().toISOString(),
  pass_clusters: passing.length,
  unique_urls: uniqueUrls.size,
  cluster_urls: clusterUrls.map(cu => ({
    ...cu,
    urls: cu.urls.map(u => ({ ...u, kws: u.kws })),
  })),
  pages: results,
}, null, 2));

// Write CSV
const csv = ["cluster_ids,url,status,word_count,title,h1,meta_description,top_unigrams,top_bigrams,top_trigrams"];
for (const r of results) {
  const row = [
    [...(r.clusters || [])].join("|"),
    r.url,
    r.status || (r.title ? 200 : ""),
    r.word_count || "",
    (r.title || "").replace(/"/g, "'"),
    ((r.h1 || [])[0] || "").replace(/"/g, "'"),
    (r.meta_description || "").replace(/"/g, "'"),
    (r.top_unigrams || []).join("; "),
    (r.top_bigrams || []).join("; "),
    (r.top_trigrams || []).join("; "),
  ].map(v => `"${String(v).replace(/"/g, '""').slice(0, 800)}"`).join(",");
  csv.push(row);
}
fs.writeFileSync(OUT_CSV, csv.join("\n"));

console.log(`\n[done] wrote:`);
console.log(`  ${OUT_JSON}`);
console.log(`  ${OUT_CSV}  (${results.length} pages)`);
const okPages = results.filter(r => r.title);
console.log(`  successfully analyzed: ${okPages.length} / ${results.length}`);
