#!/usr/bin/env node
/**
 * Sync social feed → client/public/data/social.json
 *
 * Sources:
 *   • YouTube  — RSS (no API key)  channel: @vethyparkingcooler
 *   • Facebook — Page handle for Page Plugin embed (no fetch needed)
 *
 * Output JSON shape:
 *   {
 *     updated: ISO8601,
 *     youtube: { channelUrl, channelHandle, videos: [{id,title,url,thumbnail,published}] },
 *     facebook: { pageUrl, pageHandle }
 *   }
 *
 * Run:  node scripts/sync-social-feed.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "client/public/data/social.json");

// ─── Config ──────────────────────────────────────────────────────────────────
const YT_CHANNEL_ID = "UCdzONZaIXIygE4pGfCdZpug";
const YT_HANDLE = "vethyparkingcooler";
const FB_HANDLE = "vethyautomotive";
const MAX_VIDEOS = 9;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function decodeXmlEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function pick(re, src) {
  const m = src.match(re);
  return m ? m[1] : null;
}

async function fetchYouTubeFeed() {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;
  const res = await fetch(url, { headers: { "User-Agent": "CoolDriveProBot/1.0" } });
  if (!res.ok) throw new Error(`YouTube RSS HTTP ${res.status}`);
  const xml = await res.text();

  const entries = xml.split("<entry>").slice(1).map((chunk) => chunk.split("</entry>")[0]);
  const videos = entries.slice(0, MAX_VIDEOS).map((e) => {
    const id = pick(/<yt:videoId>([^<]+)<\/yt:videoId>/, e);
    const title = decodeXmlEntities(pick(/<title>([^<]+)<\/title>/, e) || "");
    const published = pick(/<published>([^<]+)<\/published>/, e);
    const thumbnail = pick(/<media:thumbnail url="([^"]+)"/, e)
      || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null);
    return {
      id,
      title,
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnail,
      published,
    };
  }).filter(v => v.id && v.title);

  return videos;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("→ Fetching YouTube RSS…");
  let videos = [];
  try {
    videos = await fetchYouTubeFeed();
    console.log(`  ✓ ${videos.length} videos`);
  } catch (e) {
    console.warn(`  ✗ YouTube fetch failed: ${e.message}. Keeping previous cache if exists.`);
    if (fs.existsSync(OUT)) {
      const prev = JSON.parse(fs.readFileSync(OUT, "utf8"));
      videos = prev.youtube?.videos || [];
    }
  }

  const data = {
    updated: new Date().toISOString(),
    youtube: {
      channelUrl: `https://www.youtube.com/@${YT_HANDLE}`,
      channelHandle: `@${YT_HANDLE}`,
      videos,
    },
    facebook: {
      pageUrl: `https://www.facebook.com/${FB_HANDLE}/`,
      pageHandle: FB_HANDLE,
    },
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
  console.log(`✓ Wrote ${path.relative(ROOT, OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
