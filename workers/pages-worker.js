const PRODUCTS = {
  "vs02-pro": {
    name: "VS02 PRO Top-Mounted Parking AC",
    amount: 1299,
    currency: "USD",
  },
  "vx3000sp": {
    name: "VX3000SP Mini Split Parking AC",
    amount: 1599,
    currency: "USD",
  },
  "vth1-dc": {
    name: "V-TH1 Heating & Cooling Parking AC - 12V/24V DC",
    amount: 1899,
    currency: "USD",
  },
  "vth1-110v": {
    name: "V-TH1 Heating & Cooling Parking AC - 110V AC",
    amount: 1899,
    currency: "USD",
  },
  "nano-max": {
    name: "Nano Max Light Truck Parking AC",
    amount: 1599,
    currency: "USD",
  },
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function normalizeQuantity(value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return null;
  }
  return quantity;
}

function orderRequestReference(productId) {
  return `invoice-${productId}-${Date.now()}`;
}

function contactUrlForOrderRequest(origin, productId, product, quantity) {
  const contactUrl = new URL("/contact/", origin);
  contactUrl.searchParams.set("intent", "invoice");
  contactUrl.searchParams.set("productId", productId);
  contactUrl.searchParams.set("product", product.name);
  contactUrl.searchParams.set("quantity", String(quantity));
  contactUrl.searchParams.set("source", "checkout_api_fallback");
  return contactUrl.toString();
}

async function createPaymentRequest(request) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid order request." }, 400);
  }

  const product = PRODUCTS[payload?.productId];
  if (!product) {
    return jsonResponse({ error: "This product is not available for order requests." }, 400);
  }

  const quantity = normalizeQuantity(payload.quantity);
  if (!quantity) {
    return jsonResponse({ error: "Quantity must be between 1 and 10." }, 400);
  }

  const origin = new URL(request.url).origin;
  const reference = orderRequestReference(payload.productId);
  return jsonResponse({
    url: contactUrlForOrderRequest(origin, payload.productId, product, quantity),
    reference,
    status: "invoice_request",
    message: "Online card payment is temporarily unavailable. Please request an invoice and payment instructions.",
  });
}

// Legacy / mistyped blog slugs → canonical articles.
// Handled in the worker (not _redirects) because the generated _redirects file
// exceeds Cloudflare Pages' rule limit and trailing rules are dropped.
const LEGACY_BLOG_SLUG_REDIRECTS = {
  "parking-ac-noise-levels": "parking-ac-noise-comparison-db-tested",
};

// These commercial pages currently have English content only. Keep locale-
// prefixed requests out of the SPA fallback so they cannot become soft-404 or
// duplicate-language URLs outside the sitemap contract.
export const ENGLISH_ONLY_PAGE_PATHS = new Set([
  "/vehicle-compatibility",
  "/vehicle-compatibility/semi-truck-parking-ac",
  "/vehicle-compatibility/rv-parking-ac",
  "/vehicle-compatibility/12v-vs-24v-parking-ac",
  "/dealer-guide/parking-ac-local-market-fitment",
]);

export const NON_ENGLISH_LOCALE_PREFIXES = new Set([
  "zh-CN", "zh-TW", "ja", "ko", "de", "fr", "es", "it", "pt", "ru", "ar", "hi", "th", "vi", "id",
  "tr", "pl", "nl", "sv", "no", "da", "fi", "el", "cs", "hu", "ro", "uk", "he", "ms",
]);

function legacyBlogRedirect(url) {
  // Match /blog/<slug> or /<lang>/blog/<slug> (with or without trailing slash)
  const match = url.pathname.match(/^(?:\/([a-zA-Z-]{2,7}))?\/blog\/([^/]+)\/?$/);
  if (!match) return null;
  const lang = match[1];
  const slug = match[2];
  const target = LEGACY_BLOG_SLUG_REDIRECTS[slug];
  if (!target) return null;
  const prefix = lang ? `/${lang}` : "";
  const dest = new URL(`${prefix}/blog/${target}/`, url.origin);
  dest.search = url.search;
  return Response.redirect(dest.toString(), 301);
}

function englishOnlyPageRedirect(url) {
  const [locale, ...pathSegments] = url.pathname.split("/").filter(Boolean);
  if (!NON_ENGLISH_LOCALE_PREFIXES.has(locale) || pathSegments.length === 0) {
    return null;
  }

  const pagePath = `/${pathSegments.join("/")}`;
  if (!ENGLISH_ONLY_PAGE_PATHS.has(pagePath)) {
    return null;
  }

  const canonicalUrl = new URL(url);
  canonicalUrl.pathname = `${pagePath}/`;
  return Response.redirect(canonicalUrl.toString(), 301);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Canonical host: force www → apex with a 301 so Google does not index
    // duplicate www URLs (www is bound to the same Pages project and serves 200
    // by default). Preserves path, trailing slash and query string.
    if (url.hostname === "www.cooldrivepro.com") {
      url.hostname = "cooldrivepro.com";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/api/create-checkout-session" || url.pathname === "/api/create-payment-link") {
      return createPaymentRequest(request);
    }

    const legacy = legacyBlogRedirect(url);
    if (legacy) return legacy;

    const englishOnlyPage = englishOnlyPageRedirect(url);
    if (englishOnlyPage) return englishOnlyPage;

    if (url.pathname.endsWith(".html") && url.pathname !== "/404.html") {
      const canonicalUrl = new URL(url);
      canonicalUrl.pathname = url.pathname.slice(0, -".html".length) || "/";
      return env.ASSETS.fetch(new Request(canonicalUrl.toString(), request));
    }

    return env.ASSETS.fetch(request);
  },
};