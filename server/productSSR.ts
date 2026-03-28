import type { Express, Request, Response } from "express";
import path from "path";
import fs from "fs";

const SITE_URL = "https://cooldrivepro.com";

interface ProductData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  image: string;
  price: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  faqs: { question: string; answer: string }[];
  breadcrumb: string;
}

const PRODUCTS: Record<string, ProductData> = {
  "top-mounted-ac": {
    slug: "top-mounted-ac",
    title: "VS02 PRO Top-Mounted Parking Air Conditioner",
    metaTitle: "VS02 PRO Top-Mounted Parking AC | 12V 24V No-Idle – CoolDrivePro",
    metaDescription: "CoolDrivePro VS02 PRO top-mounted parking air conditioner. 12V/24V DC, 9000 BTU, runs all night on batteries. No-idle cooling for semi trucks, RVs, and vans.",
    keywords: "top mounted parking AC, VS02 PRO, 12V parking air conditioner, no-idle AC semi truck, roof mount parking AC",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663461681008/c5y7gxfLueWgEWeo3GX4pK/top-mounted-ac-hero.webp",
    price: "1299",
    breadcrumb: "Top-Mounted AC",
    description: "The CoolDrivePro VS02 PRO is a professional-grade top-mounted parking air conditioner designed for semi trucks, RVs, camper vans, and specialty vehicles. Operating on 12V or 24V DC power, it delivers 9000 BTU of cooling capacity while drawing only 8–12A at cruise — making it ideal for solar-powered and battery-based setups. The VS02 PRO eliminates engine idling, saving fuel costs and reducing emissions while keeping your cab comfortable all night long.",
    features: [
      "9000 BTU cooling capacity — cools a standard truck cab from 95°F to 68°F in under 20 minutes",
      "12V and 24V DC operation — compatible with all standard truck and RV electrical systems",
      "Ultra-low power draw of 8–12A at cruise — runs all night on a 200Ah LiFePO4 battery bank",
      "Whisper-quiet operation at 45dB — quieter than a normal conversation",
      "Integrated sleep mode — automatically adjusts temperature throughout the night",
      "IP55 weather resistance — handles rain, dust, and road debris",
      "Remote control + smartphone app connectivity via Bluetooth",
      "Rapid installation — mounts in the standard 14×14 inch roof opening in under 3 hours",
      "Compatible with solar panels — low current draw enables off-grid operation",
      "2-year manufacturer warranty with US-based technical support",
    ],
    specs: [
      { label: "Cooling Capacity", value: "9000 BTU/h" },
      { label: "Power Supply", value: "12V / 24V DC" },
      { label: "Current Draw (Cooling)", value: "8–12A at 12V" },
      { label: "Noise Level", value: "≤45 dB(A)" },
      { label: "Operating Temperature", value: "-4°F to 131°F (-20°C to 55°C)" },
      { label: "Refrigerant", value: "R134a (eco-friendly)" },
      { label: "Dimensions (Unit)", value: "23.6\" × 23.6\" × 8.3\" (600×600×210mm)" },
      { label: "Weight", value: "33 lbs (15 kg)" },
      { label: "Roof Opening Required", value: "14\" × 14\" (356×356mm)" },
      { label: "Warranty", value: "2 years" },
      { label: "Certifications", value: "CE, FCC, RoHS" },
    ],
    faqs: [
      {
        question: "How long will the VS02 PRO run on a 200Ah battery?",
        answer: "At typical cruise draw (10A at 12V), the VS02 PRO consumes approximately 120Wh per hour. A 200Ah LiFePO4 battery (at 80% usable capacity) provides about 1920Wh, giving you roughly 16 hours of runtime — more than enough for a full night's sleep."
      },
      {
        question: "Is the VS02 PRO compatible with solar panels?",
        answer: "Yes. The VS02 PRO's low power consumption (8–12A at cruise) makes it ideal for solar integration. A 400W solar array can often run the unit continuously during daylight hours while simultaneously charging your battery bank."
      },
      {
        question: "What warranty does the VS02 PRO come with?",
        answer: "The CoolDrivePro VS02 PRO comes with a 2-year manufacturer warranty covering defects in materials and workmanship. CoolDrivePro also offers a 30-day easy return policy. Technical support is available at support@cooldrivepro.com."
      },
      {
        question: "Can I install the VS02 PRO myself?",
        answer: "Yes. The VS02 PRO is designed for DIY installation and fits the standard 14×14 inch roof opening found on most semi trucks and RVs. Most customers complete installation in 2–3 hours with basic hand tools. A detailed installation guide and video tutorial are included."
      },
    ],
  },

  "mini-split-ac": {
    slug: "mini-split-ac",
    title: "VS-M1 Mini Split Parking Air Conditioner",
    metaTitle: "VS-M1 Mini Split Parking AC | 12V 24V DC No-Idle – CoolDrivePro",
    metaDescription: "CoolDrivePro VS-M1 mini split parking AC. Flexible installation for trucks, vans, and specialty vehicles. 12V/24V DC, 8000 BTU, whisper-quiet operation.",
    keywords: "mini split parking AC, VS-M1, 12V mini split truck, no-idle mini split, parking air conditioner van",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663461681008/c5y7gxfLueWgEWeo3GX4pK/mini-split-ac-hero.webp",
    price: "1199",
    breadcrumb: "Mini Split AC",
    description: "The CoolDrivePro VS-M1 is a mini split parking air conditioner that separates the compressor from the evaporator, giving you maximum installation flexibility. Ideal for vehicles where a top-mounted unit isn't practical — including box trucks, specialty vehicles, ambulances, and custom van builds. The split design allows the compressor to be mounted externally while the evaporator unit delivers cool air exactly where you need it.",
    features: [
      "8000 BTU cooling capacity with split-system flexibility",
      "12V and 24V DC operation for universal vehicle compatibility",
      "Separate compressor and evaporator — mount anywhere in your vehicle",
      "Ultra-quiet indoor unit at 38dB — ideal for sleeping environments",
      "Flexible refrigerant line routing up to 16 feet",
      "IP54 outdoor unit rating — weather and vibration resistant",
      "Digital thermostat with 0.5°F precision temperature control",
      "Auto-restart after power interruption",
      "Compatible with lithium and AGM battery systems",
      "2-year warranty with US technical support",
    ],
    specs: [
      { label: "Cooling Capacity", value: "8000 BTU/h" },
      { label: "Power Supply", value: "12V / 24V DC" },
      { label: "Current Draw (Cooling)", value: "7–11A at 12V" },
      { label: "Indoor Unit Noise", value: "≤38 dB(A)" },
      { label: "Max Refrigerant Line Length", value: "16 ft (5m)" },
      { label: "Operating Temperature", value: "-4°F to 122°F (-20°C to 50°C)" },
      { label: "Refrigerant", value: "R134a" },
      { label: "Indoor Unit Dimensions", value: "27.6\" × 7.9\" × 9.8\" (700×200×250mm)" },
      { label: "Outdoor Unit Dimensions", value: "19.7\" × 13.8\" × 11.8\" (500×350×300mm)" },
      { label: "Total Weight", value: "37 lbs (17 kg)" },
      { label: "Warranty", value: "2 years" },
    ],
    faqs: [
      {
        question: "What makes a mini split better than a top-mounted unit?",
        answer: "A mini split is ideal when you need installation flexibility. The compressor can be mounted in a cargo area, under the vehicle, or in an external compartment, while the evaporator delivers cool air at any height inside the cab. This is particularly useful for box trucks, ambulances, and custom builds where roof mounting isn't possible."
      },
      {
        question: "How long can the refrigerant lines be?",
        answer: "The VS-M1 supports refrigerant line lengths up to 16 feet (5 meters), giving you significant flexibility in component placement. Lines are pre-charged and ready to connect — no refrigerant handling required during installation."
      },
      {
        question: "Can I run the VS-M1 while driving?",
        answer: "Yes. The VS-M1 can operate while the vehicle is in motion. The outdoor unit is designed to withstand road vibration and weather exposure. Many customers run it continuously during long hauls to maintain a comfortable temperature for passengers."
      },
    ],
  },

  "heating-cooling-ac": {
    slug: "heating-cooling-ac",
    title: "V-TH1 Heating & Cooling Parking AC",
    metaTitle: "V-TH1 Heating & Cooling Parking AC | Year-Round Climate Control – CoolDrivePro",
    metaDescription: "CoolDrivePro V-TH1 all-season parking AC with heat pump. Cooling and heating in one unit. 12V/24V DC, works down to -4°F. Perfect for year-round truck and RV use.",
    keywords: "heating cooling parking AC, V-TH1, heat pump parking AC, all season truck AC, 12V heating cooling unit",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663461681008/c5y7gxfLueWgEWeo3GX4pK/heating-cooling-ac-hero.webp",
    price: "1499",
    breadcrumb: "Heating & Cooling AC",
    description: "The CoolDrivePro V-TH1 is an all-season heating and cooling parking air conditioner featuring an integrated heat pump. Unlike cooling-only units, the V-TH1 provides both air conditioning in summer and efficient electric heating in winter — all from a single rooftop unit. Operating on 12V or 24V DC, it works in ambient temperatures as low as -4°F (-20°C), making it the ideal year-round climate solution for truck drivers, RV owners, and anyone who lives or works in their vehicle across seasons.",
    features: [
      "Dual-mode heat pump — both cooling (9000 BTU) and heating (8500 BTU) in one unit",
      "Operates in ambient temperatures from -4°F to 131°F (-20°C to 55°C)",
      "12V and 24V DC operation — no shore power or generator required",
      "Heating COP of 2.5 — 2.5x more efficient than electric resistance heating",
      "Auto mode — automatically switches between heating and cooling to maintain set temperature",
      "Defrost cycle — prevents ice buildup on the outdoor coil in cold weather",
      "Smart scheduling via smartphone app — pre-condition your cab before you wake up",
      "IP55 weather resistance for year-round outdoor exposure",
      "Compatible with solar and lithium battery systems",
      "2-year warranty covering both heating and cooling functions",
    ],
    specs: [
      { label: "Cooling Capacity", value: "9000 BTU/h" },
      { label: "Heating Capacity", value: "8500 BTU/h" },
      { label: "Power Supply", value: "12V / 24V DC" },
      { label: "Cooling Current Draw", value: "8–12A at 12V" },
      { label: "Heating Current Draw", value: "7–10A at 12V" },
      { label: "Heating COP", value: "2.5" },
      { label: "Min Operating Temp (Heating)", value: "-4°F (-20°C)" },
      { label: "Noise Level", value: "≤46 dB(A)" },
      { label: "Refrigerant", value: "R410A" },
      { label: "Dimensions", value: "23.6\" × 23.6\" × 9.1\" (600×600×230mm)" },
      { label: "Weight", value: "37 lbs (17 kg)" },
      { label: "Warranty", value: "2 years" },
    ],
    faqs: [
      {
        question: "How does the heat pump work in cold weather?",
        answer: "The V-TH1 uses a reverse-cycle heat pump that extracts heat energy from outdoor air and transfers it inside — even when it's cold outside. At -4°F (-20°C), the unit still delivers 8500 BTU of heating at a COP of 2.5, meaning it produces 2.5 units of heat for every unit of electricity consumed. This is significantly more efficient than electric resistance heaters."
      },
      {
        question: "What's the lowest temperature the V-TH1 can heat in?",
        answer: "The V-TH1 is rated to operate in heating mode down to -4°F (-20°C). Below this temperature, the unit will enter defrost mode and may temporarily pause heating to clear ice from the outdoor coil. For extreme cold environments below -20°F, we recommend supplemental heating."
      },
      {
        question: "Can I use the V-TH1 as a replacement for my diesel heater?",
        answer: "Yes, for many applications. The V-TH1's heat pump is 2.5x more efficient than diesel heaters at moderate temperatures. However, diesel heaters may be more practical in extreme cold (below -4°F) or when battery capacity is limited. Many customers use the V-TH1 as their primary heater and a diesel heater as backup for extreme conditions."
      },
      {
        question: "Does the V-TH1 require a larger battery bank than cooling-only units?",
        answer: "The heating current draw (7–10A at 12V) is actually slightly lower than cooling, so battery requirements are similar. A 200Ah LiFePO4 battery provides approximately 16–20 hours of heating runtime — sufficient for most overnight situations."
      },
    ],
  },
};

const PRODUCTS_LIST_DATA = {
  metaTitle: "All Parking Air Conditioners | 12V 24V No-Idle AC – CoolDrivePro",
  metaDescription: "Browse CoolDrivePro's full range of 12V and 24V DC parking air conditioners for semi trucks, RVs, vans, and specialty vehicles. No-idle cooling and heating solutions.",
  keywords: "parking air conditioner, 12V AC truck, 24V parking AC, no-idle air conditioner, RV parking AC",
  products: [
    { name: "VS02 PRO Top-Mounted AC", slug: "top-mounted-ac", btu: "9000 BTU", price: "$1,299", desc: "Professional top-mount parking AC for semi trucks and RVs. Whisper-quiet, solar-compatible." },
    { name: "VS-M1 Mini Split AC", slug: "mini-split-ac", btu: "8000 BTU", price: "$1,199", desc: "Flexible split-system parking AC for box trucks, vans, and specialty vehicles." },
    { name: "V-TH1 Heating & Cooling AC", slug: "heating-cooling-ac", btu: "9000 BTU / 8500 BTU heat", price: "$1,499", desc: "All-season heat pump unit — cooling in summer, efficient heating in winter down to -4°F." },
  ],
};

function buildProductJsonLd(p: ProductData): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.title,
    "description": p.description,
    "image": p.image,
    "brand": { "@type": "Brand", "name": "CoolDrivePro" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": p.price,
      "availability": "https://schema.org/InStock",
      "url": `${SITE_URL}/products/${p.slug}`,
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
    },
  });
}

function buildFaqJsonLd(faqs: { question: string; answer: string }[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
    })),
  });
}

function renderProductPage(p: ProductData): string {
  const specsHtml = p.specs.map(s =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;width:45%">${s.label}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${s.value}</td></tr>`
  ).join('');

  const featuresHtml = p.features.map(f =>
    `<li style="margin-bottom:8px;padding-left:8px">${f}</li>`
  ).join('');

  const faqsHtml = p.faqs.map(faq =>
    `<div style="margin-bottom:24px">
      <h3 style="font-size:17px;font-weight:600;color:#111827;margin-bottom:8px">${faq.question}</h3>
      <p style="color:#4b5563;line-height:1.7">${faq.answer}</p>
    </div>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${p.metaTitle}</title>
  <meta name="description" content="${p.metaDescription}" />
  <meta name="keywords" content="${p.keywords}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${SITE_URL}/products/${p.slug}" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${p.metaTitle}" />
  <meta property="og:description" content="${p.metaDescription}" />
  <meta property="og:image" content="${p.image}" />
  <meta property="og:url" content="${SITE_URL}/products/${p.slug}" />
  <meta property="og:site_name" content="CoolDrivePro" />
  <meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json">${buildProductJsonLd(p)}</script>
  <script type="application/ld+json">${buildFaqJsonLd(p.faqs)}</script>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": `${SITE_URL}/products` },
      { "@type": "ListItem", "position": 3, "name": p.breadcrumb, "item": `${SITE_URL}/products/${p.slug}` },
    ],
  })}</script>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#fff;color:#111827">
  <header style="background:#0f172a;padding:16px 24px">
    <a href="${SITE_URL}" style="color:#fff;text-decoration:none;font-size:20px;font-weight:700">CoolDrivePro</a>
    <nav style="display:inline-block;margin-left:32px">
      <a href="${SITE_URL}/products" style="color:#94a3b8;text-decoration:none;margin-right:20px;font-size:14px">Products</a>
      <a href="${SITE_URL}/blog" style="color:#94a3b8;text-decoration:none;margin-right:20px;font-size:14px">Blog</a>
      <a href="${SITE_URL}/contact" style="color:#94a3b8;text-decoration:none;font-size:14px">Contact</a>
    </nav>
  </header>

  <nav style="background:#f8fafc;padding:12px 24px;font-size:14px;color:#6b7280">
    <a href="${SITE_URL}" style="color:#3b82f6;text-decoration:none">Home</a> &rsaquo;
    <a href="${SITE_URL}/products" style="color:#3b82f6;text-decoration:none;margin:0 6px">Products</a> &rsaquo;
    <span style="margin-left:6px">${p.breadcrumb}</span>
  </nav>

  <main style="max-width:960px;margin:0 auto;padding:40px 24px">
    <h1 style="font-size:32px;font-weight:700;color:#111827;margin-bottom:16px">${p.title}</h1>
    <p style="font-size:18px;color:#4b5563;line-height:1.7;margin-bottom:32px">${p.description}</p>

    <section style="margin-bottom:40px">
      <h2 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Key Features</h2>
      <ul style="color:#374151;line-height:1.8;padding-left:20px">
        ${featuresHtml}
      </ul>
    </section>

    <section style="margin-bottom:40px">
      <h2 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Technical Specifications</h2>
      <table style="width:100%;border-collapse:collapse;font-size:15px">
        <tbody>${specsHtml}</tbody>
      </table>
    </section>

    <section style="margin-bottom:40px">
      <h2 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:24px">Frequently Asked Questions</h2>
      ${faqsHtml}
    </section>

    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:24px;margin-bottom:40px">
      <p style="margin:0;font-size:16px;color:#0369a1">
        <strong>Ready to order?</strong> Visit <a href="${SITE_URL}" style="color:#0369a1">${SITE_URL}</a> or contact us at
        <a href="mailto:support@cooldrivepro.com" style="color:#0369a1">support@cooldrivepro.com</a>
      </p>
    </div>
  </main>

  <footer style="background:#0f172a;color:#94a3b8;padding:24px;text-align:center;font-size:14px">
    <p style="margin:0">&copy; 2025 CoolDrivePro. All rights reserved. |
      <a href="${SITE_URL}/privacy-policy" style="color:#94a3b8;margin:0 8px">Privacy Policy</a> |
      <a href="${SITE_URL}/warranty" style="color:#94a3b8;margin:0 8px">Warranty</a> |
      <a href="${SITE_URL}/contact" style="color:#94a3b8;margin:0 8px">Contact</a>
    </p>
  </footer>
</body>
</html>`;
}

function renderProductsListPage(): string {
  const d = PRODUCTS_LIST_DATA;
  const productsHtml = d.products.map(p =>
    `<article style="border:1px solid #e5e7eb;border-radius:8px;padding:24px;margin-bottom:20px">
      <h2 style="font-size:20px;font-weight:700;color:#111827;margin-bottom:8px">
        <a href="${SITE_URL}/products/${p.slug}" style="color:#111827;text-decoration:none">${p.name}</a>
      </h2>
      <p style="color:#6b7280;font-size:14px;margin-bottom:8px">${p.btu} &bull; From ${p.price}</p>
      <p style="color:#374151;line-height:1.6;margin-bottom:12px">${p.desc}</p>
      <a href="${SITE_URL}/products/${p.slug}" style="color:#3b82f6;font-size:14px;font-weight:600">View Details &rarr;</a>
    </article>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${d.metaTitle}</title>
  <meta name="description" content="${d.metaDescription}" />
  <meta name="keywords" content="${d.keywords}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${SITE_URL}/products" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${d.metaTitle}" />
  <meta property="og:description" content="${d.metaDescription}" />
  <meta property="og:url" content="${SITE_URL}/products" />
  <meta property="og:site_name" content="CoolDrivePro" />
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "CoolDrivePro Parking Air Conditioners",
    "url": `${SITE_URL}/products`,
    "itemListElement": d.products.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": p.name,
      "url": `${SITE_URL}/products/${p.slug}`,
    })),
  })}</script>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#fff;color:#111827">
  <header style="background:#0f172a;padding:16px 24px">
    <a href="${SITE_URL}" style="color:#fff;text-decoration:none;font-size:20px;font-weight:700">CoolDrivePro</a>
    <nav style="display:inline-block;margin-left:32px">
      <a href="${SITE_URL}/products" style="color:#fff;text-decoration:none;margin-right:20px;font-size:14px;font-weight:600">Products</a>
      <a href="${SITE_URL}/blog" style="color:#94a3b8;text-decoration:none;margin-right:20px;font-size:14px">Blog</a>
      <a href="${SITE_URL}/contact" style="color:#94a3b8;text-decoration:none;font-size:14px">Contact</a>
    </nav>
  </header>

  <main style="max-width:960px;margin:0 auto;padding:40px 24px">
    <h1 style="font-size:32px;font-weight:700;color:#111827;margin-bottom:12px">Parking Air Conditioners</h1>
    <p style="font-size:18px;color:#4b5563;line-height:1.7;margin-bottom:32px">
      CoolDrivePro manufactures professional-grade 12V and 24V DC parking air conditioners for semi trucks, RVs, camper vans, and specialty vehicles.
      Our no-idle AC systems eliminate engine idling, saving fuel and reducing emissions while keeping you comfortable on the road.
    </p>
    ${productsHtml}
  </main>

  <footer style="background:#0f172a;color:#94a3b8;padding:24px;text-align:center;font-size:14px">
    <p style="margin:0">&copy; 2025 CoolDrivePro. All rights reserved. |
      <a href="${SITE_URL}/privacy-policy" style="color:#94a3b8;margin:0 8px">Privacy Policy</a> |
      <a href="${SITE_URL}/warranty" style="color:#94a3b8;margin:0 8px">Warranty</a> |
      <a href="${SITE_URL}/contact" style="color:#94a3b8;margin:0 8px">Contact</a>
    </p>
  </footer>
</body>
</html>`;
}

export function registerProductSSRRoutes(app: Express): void {
  // Products list page
  app.get("/products", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(renderProductsListPage());
  });

  // Individual product pages
  app.get("/products/:slug", (req: Request, res: Response) => {
    const { slug } = req.params;
    const product = PRODUCTS[slug];
    if (!product) {
      // Unknown product slug — fall through to SPA
      res.status(404).send("Not found");
      return;
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(renderProductPage(product));
  });
}
