import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { englishHubPrefixRedirect, englishOnlyApuRedirect } from "../../../workers/pages-worker.js";

function firstRedirect(pathname: string, rules: string): string | null {
  for (const raw of rules.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const [from, to, status] = line.split(/\s+/);
    if (status !== "301" || !from || !to) continue;
    const names: string[] = [];
    const pattern = from.replace(/:([A-Za-z]+)|\*/g, (token, name) => {
      if (token === "*") {
        names.push("splat");
        return "(.*)";
      }
      names.push(name);
      return "([^/]+)";
    });
    const match = pathname.match(new RegExp(`^${pattern}$`));
    if (!match) continue;
    let dest = to;
    names.forEach((name, index) => {
      dest = dest.replace(`:${name}`, match[index + 1] ?? "");
    });
    return dest;
  }
  return null;
}

describe("english hub redirects", () => {
  it("does not treat /apu/compare/ as a localized compare URL", () => {
    expect(englishHubPrefixRedirect(new URL("https://cooldrivepro.com/apu/compare/"))).toBeNull();
    expect(englishHubPrefixRedirect(new URL("https://cooldrivepro.com/apu/compare"))).toBeNull();
    expect(englishOnlyApuRedirect(new URL("https://cooldrivepro.com/apu/compare/"))).toBeNull();
  });

  it("sends a real locale compare or solutions prefix to the English hub", () => {
    const compare = englishHubPrefixRedirect(new URL("https://cooldrivepro.com/de/compare/rooftop-vs-mini-split-parking-ac"));
    expect(compare?.status).toBe(301);
    expect(compare?.headers.get("location")).toBe("https://cooldrivepro.com/compare/rooftop-vs-mini-split-parking-ac/");

    const solutions = englishHubPrefixRedirect(new URL("https://cooldrivepro.com/zh-CN/solutions/truck-ac/"));
    expect(solutions?.status).toBe(301);
    expect(solutions?.headers.get("location")).toBe("https://cooldrivepro.com/solutions/truck-ac/");
  });

  it("sends a locale-prefixed APU URL to the English APU page", () => {
    const hub = englishOnlyApuRedirect(new URL("https://cooldrivepro.com/es/apu/"));
    expect(hub?.status).toBe(301);
    expect(hub?.headers.get("location")).toBe("https://cooldrivepro.com/apu/");

    const bare = englishOnlyApuRedirect(new URL("https://cooldrivepro.com/es/apu"));
    expect(bare?.headers.get("location")).toBe("https://cooldrivepro.com/apu/");

    const child = englishOnlyApuRedirect(new URL("https://cooldrivepro.com/es/apu/electric/?utm=test"));
    expect(child?.headers.get("location")).toBe("https://cooldrivepro.com/apu/electric/?utm=test");
  });

  it("leaves real localized pages and the Spanish homepage alone", () => {
    expect(englishOnlyApuRedirect(new URL("https://cooldrivepro.com/es/"))).toBeNull();
    expect(englishOnlyApuRedirect(new URL("https://cooldrivepro.com/es/products/top-mounted-ac/"))).toBeNull();
  });

  it("keeps the published redirect file from serving those URLs as the homepage", () => {
    const rules = readFileSync(new URL("../../../client/public/_redirects", import.meta.url), "utf8");
    expect(rules).not.toMatch(/^\/:lang\/compare\/\*/m);
    expect(rules).not.toMatch(/^\/:lang\/solutions\/\*/m);
    expect(firstRedirect("/apu/compare/", rules)).toBeNull();
    expect(firstRedirect("/es/apu/", rules)).toBe("/apu/");
    expect(firstRedirect("/es/apu", rules)).toBe("/apu/");
    expect(firstRedirect("/es/apu/electric/", rules)).toBe("/apu/electric/");
    expect(firstRedirect("/es/products/top-mounted-ac/", rules)).toBeNull();
    expect(firstRedirect("/es/", rules)).toBeNull();
  });
});
