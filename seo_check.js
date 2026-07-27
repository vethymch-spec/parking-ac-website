const fs = require('fs');

async function run() {
  try {
    const res = await fetch("https://cooldrivepro.com/");
    const html = await res.text();
    
    const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || ["", "No Title"])[1].trim();
    const meta = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i) || 
                 html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i) || ["", "No Meta"])[1].trim();
    const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join(" ");
    const rootMatch = html.match(/<div[^>]+id=["']root["'][^>]*>([\s\S]*?)<\/div>/i);
    const rootHtml = (rootMatch ? rootMatch[1] : "").replace(/<(script|style|svg)[^>]*>[\s\S]*?<\/\1>/gi, "");
    const rootText = rootHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const headers = [...rootHtml.matchAll(/<(h[123])[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => m[1].toUpperCase() + ": " + m[2].replace(/<[^>]*>/g, "").trim());

    const phrases = ["parking air conditioner", "parking ac", "no-idle", "12v", "24v", "semi truck", "truck", "rv", "van", "camper", "off-grid", "battery", "solar", "lifepo4", "mini split", "top-mounted", "light truck", "heating cooling", "heating & cooling", "rooftop", "truck sleeper"];
    
    console.log("TITLE:", title);
    console.log("META DESC:", meta);
    console.log("\nROOT TEXT (800 chars):", rootText.slice(0, 800));
    console.log("\nHEADERS:", headers);
    
    const summary = {};
    phrases.forEach(p => {
      const r = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      summary[p] = {
        title: (title.match(r) || []).length,
        meta: (meta.match(r) || []).length,
        jsonLd: (jsonLd.match(r) || []).length,
        rootHtml: (rootHtml.match(r) || []).length,
        rootText: (rootText.match(r) || []).length
      };
    });
    console.table(summary);
  } catch (e) {
    console.error(e.message);
  }
}
run();
