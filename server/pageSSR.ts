import type { Express, Request, Response } from "express";

const SITE_URL = "https://cooldrivepro.com";

function buildOrgJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CoolDrivePro",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@cooldrivepro.com",
      "contactType": "customer support",
      "availableLanguage": "English",
    },
    "sameAs": [],
  });
}

function buildWebSiteJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CoolDrivePro",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  });
}

function sharedHead(opts: {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  extraLd?: string[];
}): string {
  const ldTags = [buildOrgJsonLd(), buildWebSiteJsonLd(), ...(opts.extraLd ?? [])]
    .map(ld => `<script type="application/ld+json">${ld}</script>`)
    .join("\n  ");
  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.title}</title>
  <meta name="description" content="${opts.description}" />
  <meta name="keywords" content="${opts.keywords}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${opts.canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${opts.title}" />
  <meta property="og:description" content="${opts.description}" />
  <meta property="og:url" content="${opts.canonical}" />
  <meta property="og:site_name" content="CoolDrivePro" />
  <meta name="twitter:card" content="summary_large_image" />
  ${ldTags}
</head>`;
}

function sharedNav(activePath: string): string {
  const links = [
    { href: "/products", label: "Products" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];
  return `<header style="background:#0f172a;padding:16px 24px">
    <a href="${SITE_URL}" style="color:#fff;text-decoration:none;font-size:20px;font-weight:700">CoolDrivePro</a>
    <nav style="display:inline-block;margin-left:32px">
      ${links.map(l => `<a href="${SITE_URL}${l.href}" style="color:${l.href === activePath ? "#fff;font-weight:600" : "#94a3b8"};text-decoration:none;margin-right:20px;font-size:14px">${l.label}</a>`).join("")}
    </nav>
  </header>`;
}

function sharedFooter(): string {
  return `<footer style="background:#0f172a;color:#94a3b8;padding:24px;text-align:center;font-size:14px">
    <p style="margin:0">&copy; 2025 CoolDrivePro. All rights reserved. |
      <a href="${SITE_URL}/privacy-policy" style="color:#94a3b8;margin:0 8px">Privacy Policy</a> |
      <a href="${SITE_URL}/warranty" style="color:#94a3b8;margin:0 8px">Warranty</a> |
      <a href="${SITE_URL}/contact" style="color:#94a3b8;margin:0 8px">Contact</a>
    </p>
  </footer>`;
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function renderHomePage(): string {
  const faqLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a parking air conditioner?",
        "acceptedAnswer": { "@type": "Answer", "text": "A parking air conditioner (also called a no-idle AC) is a battery-powered cooling system that keeps your truck cab, RV, or van comfortable without running the engine. It runs on 12V or 24V DC power, drawing from your vehicle's battery bank or solar panels." },
      },
      {
        "@type": "Question",
        "name": "How long does a parking AC run on batteries?",
        "acceptedAnswer": { "@type": "Answer", "text": "CoolDrivePro parking ACs draw 8–12A at 12V. A 200Ah LiFePO4 battery provides approximately 16 hours of runtime — enough for a full night's sleep without engine idling." },
      },
      {
        "@type": "Question",
        "name": "Are CoolDrivePro parking ACs compatible with solar panels?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. The low power draw (8–12A at 12V) makes CoolDrivePro units ideal for solar integration. A 400W solar array can often run the unit continuously during daylight hours while charging your battery bank." },
      },
      {
        "@type": "Question",
        "name": "What vehicles are compatible with CoolDrivePro parking ACs?",
        "acceptedAnswer": { "@type": "Answer", "text": "CoolDrivePro parking ACs are compatible with semi trucks, Class 8 trucks, RVs, camper vans, Sprinter vans, box trucks, ambulances, military vehicles, and any vehicle with a 12V or 24V DC electrical system." },
      },
    ],
  });

  return `<!DOCTYPE html>
<html lang="en">
${sharedHead({
  title: "Parking Air Conditioner | 12V 24V No-Idle AC – CoolDrivePro",
  description: "Professional 12V & 24V DC parking air conditioners for semi trucks, RVs & vans. No-idle cooling, solar-compatible, whisper-quiet. Free US shipping.",
  keywords: "parking air conditioner, 12V parking AC, no-idle AC, truck parking AC, RV parking air conditioner",
  canonical: SITE_URL,
  extraLd: [faqLd],
})}
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#fff;color:#111827">
  ${sharedNav("/")}

  <main style="max-width:960px;margin:0 auto;padding:40px 24px">
    <h1 style="font-size:36px;font-weight:800;color:#111827;margin-bottom:16px">Parking Air Conditioner for Off-Grid Life &amp; Mobile Comfort</h1>
    <p style="font-size:18px;color:#4b5563;line-height:1.7;margin-bottom:32px">
      CoolDrivePro manufactures professional-grade 12V and 24V DC parking air conditioners for semi trucks, RVs, camper vans, and specialty vehicles.
      Our no-idle AC systems eliminate engine idling — saving fuel, reducing emissions, and keeping you cool all night on battery power alone.
    </p>

    <section style="margin-bottom:40px">
      <h2 style="font-size:26px;font-weight:700;color:#111827;margin-bottom:20px">Our Parking AC Products</h2>
      <div style="display:grid;gap:20px">
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px">
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px"><a href="${SITE_URL}/products/top-mounted-ac" style="color:#111827;text-decoration:none">VS02 PRO Top-Mounted Parking AC</a></h3>
          <p style="color:#4b5563;margin-bottom:8px">9000 BTU &bull; 12V/24V DC &bull; From $1,299</p>
          <p style="color:#374151;line-height:1.6">Professional top-mount parking air conditioner for semi trucks and RVs. Whisper-quiet at 45dB, solar-compatible, runs all night on a 200Ah battery. Fits standard 14×14 inch roof opening.</p>
        </div>
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px">
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px"><a href="${SITE_URL}/products/mini-split-ac" style="color:#111827;text-decoration:none">VS-M1 Mini Split Parking AC</a></h3>
          <p style="color:#4b5563;margin-bottom:8px">8000 BTU &bull; 12V/24V DC &bull; From $1,199</p>
          <p style="color:#374151;line-height:1.6">Flexible split-system parking air conditioner for box trucks, vans, and specialty vehicles. Separate compressor and evaporator allow installation anywhere in your vehicle.</p>
        </div>
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px">
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px"><a href="${SITE_URL}/products/heating-cooling-ac" style="color:#111827;text-decoration:none">V-TH1 Heating &amp; Cooling Parking AC</a></h3>
          <p style="color:#4b5563;margin-bottom:8px">9000 BTU cooling / 8500 BTU heating &bull; 12V/24V DC &bull; From $1,499</p>
          <p style="color:#374151;line-height:1.6">All-season heat pump unit — air conditioning in summer, efficient heating in winter down to -4°F (-20°C). One unit for year-round climate control.</p>
        </div>
      </div>
    </section>

    <section style="margin-bottom:40px">
      <h2 style="font-size:26px;font-weight:700;color:#111827;margin-bottom:16px">Why Choose a No-Idle Parking AC?</h2>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        Engine idling to run air conditioning costs truck drivers an estimated $6,000–$8,000 per year in fuel. Beyond the cost, idling causes premature engine wear,
        increases maintenance frequency, and contributes to air pollution at truck stops. Anti-idling laws in over 30 US states now restrict engine idling to 3–5 minutes.
      </p>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        A CoolDrivePro parking air conditioner eliminates all of these problems. Running on 12V or 24V DC power from your battery bank or solar panels,
        our units provide the same cooling comfort as engine-powered AC — without a single drop of diesel.
      </p>
      <p style="color:#374151;line-height:1.7">
        Most customers recover their investment within 6–12 months through fuel savings alone. With a 2-year warranty and proven reliability,
        a CoolDrivePro parking AC is one of the highest-ROI upgrades available for professional drivers and mobile living enthusiasts.
      </p>
    </section>

    <section style="margin-bottom:40px">
      <h2 style="font-size:26px;font-weight:700;color:#111827;margin-bottom:20px">Frequently Asked Questions</h2>
      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:600;color:#111827;margin-bottom:8px">What is a parking air conditioner?</h3>
        <p style="color:#4b5563;line-height:1.7">A parking air conditioner (also called a no-idle AC) is a battery-powered cooling system that keeps your truck cab, RV, or van comfortable without running the engine. It runs on 12V or 24V DC power, drawing from your vehicle's battery bank or solar panels.</p>
      </div>
      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:600;color:#111827;margin-bottom:8px">How long does a parking AC run on batteries?</h3>
        <p style="color:#4b5563;line-height:1.7">CoolDrivePro parking ACs draw 8–12A at 12V. A 200Ah LiFePO4 battery provides approximately 16 hours of runtime — enough for a full night's sleep without engine idling.</p>
      </div>
      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:600;color:#111827;margin-bottom:8px">Are CoolDrivePro parking ACs compatible with solar panels?</h3>
        <p style="color:#4b5563;line-height:1.7">Yes. The low power draw (8–12A at 12V) makes CoolDrivePro units ideal for solar integration. A 400W solar array can often run the unit continuously during daylight hours while charging your battery bank.</p>
      </div>
      <div>
        <h3 style="font-size:17px;font-weight:600;color:#111827;margin-bottom:8px">What vehicles are compatible with CoolDrivePro parking ACs?</h3>
        <p style="color:#4b5563;line-height:1.7">CoolDrivePro parking ACs are compatible with semi trucks, Class 8 trucks, RVs, camper vans, Sprinter vans, box trucks, ambulances, military vehicles, and any vehicle with a 12V or 24V DC electrical system.</p>
      </div>
    </section>
  </main>

  ${sharedFooter()}
</body>
</html>`;
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function renderAboutPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
${sharedHead({
  title: "About CoolDrivePro | Parking AC Specialists",
  description: "CoolDrivePro is a parking air conditioner specialist serving truck drivers, RV owners, and van lifers. Learn about our mission, values, and team.",
  keywords: "about CoolDrivePro, parking AC company, no-idle AC brand, truck AC manufacturer",
  canonical: `${SITE_URL}/about`,
})}
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#fff;color:#111827">
  ${sharedNav("/about")}

  <main style="max-width:960px;margin:0 auto;padding:40px 24px">
    <h1 style="font-size:32px;font-weight:800;color:#111827;margin-bottom:16px">About CoolDrivePro</h1>
    <p style="font-size:18px;color:#4b5563;line-height:1.7;margin-bottom:32px">
      CoolDrivePro is a parking air conditioner company dedicated to one mission: helping truck drivers, RV owners, and mobile living enthusiasts stay comfortable without engine idling.
      We design, test, and sell 12V and 24V DC parking AC systems that work in the real world — not just in lab conditions.
    </p>

    <section style="margin-bottom:40px">
      <h2 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Our Story</h2>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        CoolDrivePro was founded by a team of engineers and long-haul truck drivers who were frustrated with the existing options for no-idle cooling.
        Most parking ACs on the market were either underpowered, unreliable, or required expensive professional installation.
        We set out to build something better — a parking AC that a professional driver could install themselves, trust to run all night, and count on for years.
      </p>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        Our first product, the VS02 PRO, launched after 18 months of field testing across the US in temperatures ranging from -10°F in Minnesota winters to 115°F in Arizona summers.
        The result is a parking AC that genuinely performs in extreme conditions — because we tested it in them.
      </p>
      <p style="color:#374151;line-height:1.7">
        Today, CoolDrivePro serves thousands of customers across North America, Europe, and Australia. Our product line has expanded to include mini split systems and all-season heat pump units,
        but our commitment remains the same: build the most reliable, efficient, and easy-to-install parking AC systems available.
      </p>
    </section>

    <section style="margin-bottom:40px">
      <h2 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Our Values</h2>
      <div style="display:grid;gap:16px">
        <div style="background:#f8fafc;border-radius:8px;padding:20px">
          <h3 style="font-size:17px;font-weight:700;color:#111827;margin-bottom:8px">Performance First</h3>
          <p style="color:#4b5563;line-height:1.6;margin:0">Every parking AC we sell must outperform the competition in real-world conditions — not just lab tests. We field-test every product before it ships.</p>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:20px">
          <h3 style="font-size:17px;font-weight:700;color:#111827;margin-bottom:8px">Sustainability</h3>
          <p style="color:#4b5563;line-height:1.6;margin:0">No-idle parking AC technology reduces diesel emissions at truck stops by up to 90% compared to engine idling. Every CoolDrivePro unit sold is a step toward cleaner air at truck stops nationwide.</p>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:20px">
          <h3 style="font-size:17px;font-weight:700;color:#111827;margin-bottom:8px">Community Driven</h3>
          <p style="color:#4b5563;line-height:1.6;margin:0">We listen to truck drivers, RV owners, and van lifers. Every product improvement comes from real user feedback gathered through our support system and community forum.</p>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:20px">
          <h3 style="font-size:17px;font-weight:700;color:#111827;margin-bottom:8px">Honest Warranty</h3>
          <p style="color:#4b5563;line-height:1.6;margin:0">Our 2-year warranty means exactly that — no fine print, no hassle. If it breaks due to a manufacturing defect, we fix it or replace it. US-based technical support included.</p>
        </div>
      </div>
    </section>

    <section style="margin-bottom:40px">
      <h2 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Our Products</h2>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        CoolDrivePro offers three core parking air conditioner product lines, each engineered for a specific vehicle type and use case.
        The <a href="${SITE_URL}/products/top-mounted-ac" style="color:#3b82f6">VS02 PRO Top-Mounted Parking AC</a> is our flagship unit for semi trucks and large RVs,
        delivering 9000 BTU of cooling power from a roof-mounted installation that fits standard 14×14 inch openings. It draws just 8–12A at 12V,
        making it compatible with most battery banks and solar setups without requiring an inverter.
      </p>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        The <a href="${SITE_URL}/products/mini-split-ac" style="color:#3b82f6">VS-M1 Mini Split Parking AC</a> provides installation flexibility for box trucks, cargo vans, and specialty vehicles
        where a roof-mount is not practical. The split design separates the compressor from the evaporator, allowing creative mounting configurations
        that work around existing vehicle equipment and cargo layouts.
      </p>
      <p style="color:#374151;line-height:1.7">
        For year-round comfort, the <a href="${SITE_URL}/products/heating-cooling-ac" style="color:#3b82f6">V-TH1 Heating &amp; Cooling Parking AC</a> operates as a heat pump,
        providing efficient heating down to -4°F (-20°C) in winter and air conditioning in summer. One unit replaces both a heater and an air conditioner,
        reducing installation complexity and weight for long-haul drivers and full-time van lifers.
      </p>
    </section>

    <section style="margin-bottom:40px">
      <h2 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Certifications &amp; Compliance</h2>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        All CoolDrivePro parking air conditioners are certified to meet North American and European safety standards.
        Our units carry CE certification for European markets and comply with FCC Part 15 requirements for the US market.
        Refrigerants used in all CoolDrivePro products are R134a or R290 — both approved for automotive and mobile applications.
      </p>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        We are committed to environmental responsibility. Our R290 (propane) refrigerant models have a Global Warming Potential (GWP) of just 3,
        compared to 1430 for R134a — making them among the most environmentally friendly parking AC options on the market.
        All units are RoHS compliant, ensuring they meet EU restrictions on hazardous substances.
      </p>
      <p style="color:#374151;line-height:1.7">
        Our manufacturing facilities are ISO 9001:2015 certified, with full traceability from component sourcing through final assembly and quality inspection.
        Every unit undergoes a 48-hour burn-in test before shipping to ensure it meets our performance specifications.
      </p>
    </section>

    <section style="margin-bottom:40px">
      <h2 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:16px">Contact Us</h2>
      <p style="color:#374151;line-height:1.7">
        Have questions about our products? Our team is available Monday–Friday 9AM–6PM PT and Saturday 10AM–4PM PT.
        Email us at <a href="mailto:support@cooldrivepro.com" style="color:#3b82f6">support@cooldrivepro.com</a> or
        visit our <a href="${SITE_URL}/contact" style="color:#3b82f6">contact page</a> to send a message.
        You can also browse our <a href="${SITE_URL}/blog" style="color:#3b82f6">blog</a> for installation guides, product comparisons, and tips for getting the most from your parking AC.
      </p>
    </section>
  </main>

  ${sharedFooter()}
</body>
</html>`;
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
function renderContactPage(): string {
  const localBusinessLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CoolDrivePro",
    "url": SITE_URL,
    "email": "support@cooldrivepro.com",
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "18:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday"], "opens": "10:00", "closes": "16:00" },
    ],
  });

  return `<!DOCTYPE html>
<html lang="en">
${sharedHead({
  title: "Contact CoolDrivePro | Parking AC Support",
  description: "Contact CoolDrivePro for parking air conditioner support, sales inquiries, and technical questions. Email support@cooldrivepro.com or use our contact form.",
  keywords: "contact CoolDrivePro, parking AC support, truck AC customer service",
  canonical: `${SITE_URL}/contact`,
  extraLd: [localBusinessLd],
})}
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#fff;color:#111827">
  ${sharedNav("/contact")}

  <main style="max-width:960px;margin:0 auto;padding:40px 24px">
    <h1 style="font-size:32px;font-weight:800;color:#111827;margin-bottom:16px">Contact Us</h1>
    <p style="font-size:18px;color:#4b5563;line-height:1.7;margin-bottom:32px">
      Have a question about our parking air conditioners? Need help choosing the right unit for your vehicle? Our team is here to help.
      We typically respond within 12 hours on business days.
    </p>

    <section style="margin-bottom:40px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px">
        <div style="background:#f8fafc;border-radius:8px;padding:20px">
          <h2 style="font-size:18px;font-weight:700;color:#111827;margin-bottom:12px">Email Support</h2>
          <p style="color:#4b5563;margin-bottom:8px">For product questions, orders, and technical support:</p>
          <a href="mailto:support@cooldrivepro.com" style="color:#3b82f6;font-weight:600;font-size:16px">support@cooldrivepro.com</a>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:20px">
          <h2 style="font-size:18px;font-weight:700;color:#111827;margin-bottom:12px">Business Hours</h2>
          <p style="color:#4b5563;margin:0">Monday – Friday: 9 AM – 6 PM PT</p>
          <p style="color:#4b5563;margin:4px 0 0">Saturday: 10 AM – 4 PM PT</p>
          <p style="color:#4b5563;margin:4px 0 0">Sunday: Closed</p>
        </div>
      </div>

      <h2 style="font-size:22px;font-weight:700;color:#111827;margin-bottom:16px">Common Questions</h2>
      <div style="margin-bottom:16px">
        <h3 style="font-size:16px;font-weight:600;color:#111827;margin-bottom:6px">How do I place an order?</h3>
        <p style="color:#4b5563;line-height:1.6;margin:0">Browse our <a href="${SITE_URL}/products" style="color:#3b82f6">products page</a> and contact us via email or WhatsApp to place your order. We accept all major credit cards, PayPal, and bank transfer.</p>
      </div>
      <div style="margin-bottom:16px">
        <h3 style="font-size:16px;font-weight:600;color:#111827;margin-bottom:6px">What is your return policy?</h3>
        <p style="color:#4b5563;line-height:1.6;margin:0">We offer a 30-day easy return policy. If you're not satisfied, contact us within 30 days of delivery for a full refund. See our <a href="${SITE_URL}/return-policy" style="color:#3b82f6">return policy page</a> for details.</p>
      </div>
      <div style="margin-bottom:16px">
        <h3 style="font-size:16px;font-weight:600;color:#111827;margin-bottom:6px">Do you ship internationally?</h3>
        <p style="color:#4b5563;line-height:1.6;margin:0">Yes. We ship to the US (free shipping), Canada, EU, UK, and Australia. International shipping rates and delivery times vary by destination. Contact us for a shipping quote.</p>
      </div>
      <div style="margin-bottom:16px">
        <h3 style="font-size:16px;font-weight:600;color:#111827;margin-bottom:6px">How do I get technical support?</h3>
        <p style="color:#4b5563;line-height:1.6;margin:0">Email <a href="mailto:support@cooldrivepro.com" style="color:#3b82f6">support@cooldrivepro.com</a> with your order number and a description of the issue. You can also open a support ticket through your account at <a href="${SITE_URL}/support" style="color:#3b82f6">cooldrivepro.com/support</a>.</p>
      </div>
      <div style="margin-bottom:16px">
        <h3 style="font-size:16px;font-weight:600;color:#111827;margin-bottom:6px">What warranty do CoolDrivePro products carry?</h3>
        <p style="color:#4b5563;line-height:1.6;margin:0">All CoolDrivePro parking ACs come with a 2-year manufacturer warranty covering defects in materials and workmanship. The warranty covers the compressor, electronics, and all factory-installed components. See our <a href="${SITE_URL}/warranty" style="color:#3b82f6">warranty page</a> for full terms.</p>
      </div>
      <div>
        <h3 style="font-size:16px;font-weight:600;color:#111827;margin-bottom:6px">Do you offer installation support?</h3>
        <p style="color:#4b5563;line-height:1.6;margin:0">Yes. Our technical team provides free installation guidance via email and video call. We also maintain a library of installation guides and videos in our <a href="${SITE_URL}/blog" style="color:#3b82f6">blog</a> covering every product in our lineup.</p>
      </div>
    </section>

    <section style="margin-bottom:40px">
      <h2 style="font-size:22px;font-weight:700;color:#111827;margin-bottom:16px">About Our Products</h2>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        CoolDrivePro specializes in 12V and 24V DC parking air conditioners for semi trucks, RVs, camper vans, and specialty vehicles.
        Our no-idle AC systems allow drivers to stay cool without running the engine, saving fuel and complying with anti-idling laws in over 30 US states.
      </p>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        Our product lineup includes the <a href="${SITE_URL}/products/top-mounted-ac" style="color:#3b82f6">VS02 PRO Top-Mounted Parking AC</a> (9000 BTU, ideal for semi trucks and RVs),
        the <a href="${SITE_URL}/products/mini-split-ac" style="color:#3b82f6">VS-M1 Mini Split Parking AC</a> (8000 BTU, flexible installation for vans and box trucks),
        and the <a href="${SITE_URL}/products/heating-cooling-ac" style="color:#3b82f6">V-TH1 Heating &amp; Cooling Parking AC</a> (all-season heat pump for year-round comfort).
      </p>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        All units are solar-compatible, run directly on 12V or 24V DC power, and are backed by a 2-year warranty with US-based technical support.
        Browse our <a href="${SITE_URL}/products" style="color:#3b82f6">products page</a> to compare models and find the right parking AC for your vehicle.
      </p>
      <p style="color:#374151;line-height:1.7">
        Not sure which model is right for your vehicle? Our team is happy to help you choose. Tell us your vehicle type, available battery capacity, and whether you have solar panels,
        and we will recommend the best parking AC configuration for your needs. Most installations can be completed in 2–4 hours with basic hand tools.
        Read our <a href="${SITE_URL}/blog" style="color:#3b82f6">installation guides</a> for step-by-step instructions for each product.
      </p>
    </section>

    <section style="margin-bottom:40px">
      <h2 style="font-size:22px;font-weight:700;color:#111827;margin-bottom:16px">Why CoolDrivePro?</h2>
      <p style="color:#374151;line-height:1.7;margin-bottom:16px">
        Engine idling to run air conditioning costs professional truck drivers an estimated $6,000–$8,000 per year in diesel fuel.
        Anti-idling laws in over 30 US states restrict engine idling to 3–5 minutes, making a no-idle parking AC not just a comfort upgrade but a compliance necessity.
      </p>
      <p style="color:#374151;line-height:1.7">
        CoolDrivePro parking ACs pay for themselves within 6–12 months through fuel savings alone.
        With a 2-year warranty, US-based support, and a growing community of satisfied drivers, CoolDrivePro is the trusted choice for professional drivers and mobile living enthusiasts.
        Contact us today to learn more or place your order.
      </p>
    </section>
  </main>

  ${sharedFooter()}
</body>
</html>`;
}

// ─── REGISTER ROUTES ──────────────────────────────────────────────────────────
export function registerPageSSRRoutes(app: Express): void {
  app.get("/", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(renderHomePage());
  });

  app.get("/about", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(renderAboutPage());
  });

  app.get("/contact", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(renderContactPage());
  });
}
