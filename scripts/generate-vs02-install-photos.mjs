#!/usr/bin/env node
/**
 * Generate VS02 PRO installation scene photos for the local product preview.
 * Output: previews/vs02-pro-product/assets/install-NN-<slug>.webp
 *
 * Usage:
 *   GEMINI_API_KEY=xxx node scripts/generate-vs02-install-photos.mjs
 *   GEMINI_API_KEY=xxx node scripts/generate-vs02-install-photos.mjs --only=01,03
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('ERROR: GEMINI_API_KEY env var not set');
  process.exit(1);
}

const MODEL = 'gemini-2.5-flash-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
const OUT_DIR = path.resolve('previews/vs02-pro-product/assets');
fs.mkdirSync(OUT_DIR, { recursive: true });

const args = process.argv.slice(2);
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.split('=')[1].split(',') : null;
const force = args.includes('--force');

// Shared style guide so every scene looks like one continuous photo set
const STYLE = [
  'Hyper-realistic editorial product photography, shot on full-frame DSLR with 35mm lens',
  'natural daylight, soft shadows, slight haze, true colors, no oversaturation',
  'shallow depth of field on background, sharp on the rooftop AC unit',
  'documentary commercial vehicle photography style',
  'no text, no logo, no watermark, no UI overlay, no people faces visible up close',
].join(', ');

const PRODUCT = [
  'a white low-profile rooftop parking air conditioner unit',
  'approximately 720 x 720 x 160 mm, twin shrouded condenser fans on top,',
  'rounded aerodynamic ABS cover, clean industrial design,',
  'mounted on the vehicle roof through a square cutout sealed with a black EPDM foam gasket',
].join(' ');

const SCENES = [
  {
    id: '01',
    slug: 'semi-truck-sleeper-cab',
    caption: 'Semi Truck Sleeper',
    prompt: `Wide three-quarter exterior shot of an American semi truck (Freightliner / Kenworth class 8 sleeper cab, blue paint) parked at a roadside truck stop at golden hour. On the sleeper roof is installed ${PRODUCT}. The truck cab roofline shows the AC clearly, with a desert highway and pine trees blurred in the background. ${STYLE}.`,
  },
  {
    id: '02',
    slug: 'class-c-rv-rooftop',
    caption: 'Class C RV',
    prompt: `High-angle drone-style view of a white Class C motorhome RV parked in a forest campground. ${PRODUCT} is clearly visible on the rear half of the RV roof, next to a solar panel and a roof vent. Soft morning light, green trees around. ${STYLE}.`,
  },
  {
    id: '03',
    slug: 'sprinter-van-roof',
    caption: 'Sprinter Van Upfit',
    prompt: `Three-quarter rear view of a grey Mercedes Sprinter cargo van parked outside an upfitter workshop. ${PRODUCT} is installed on the rear roof section. Workshop garage doors and tool racks softly out of focus in background. Realistic worklight + daylight mix. ${STYLE}.`,
  },
  {
    id: '04',
    slug: 'truck-camper-installed',
    caption: 'Truck Camper',
    prompt: `Side view of a pickup truck (white Ford F-350) with a slide-in truck camper, parked on a gravel forest road. ${PRODUCT} is mounted on top of the truck camper shell, slightly recessed. Mountain backdrop, late afternoon light. ${STYLE}.`,
  },
  {
    id: '05',
    slug: 'installer-cutout-prep',
    caption: 'Installer Cutout Prep',
    prompt: `Close-up hands-only shot of a professional installer (gloves only, no face) applying a black EPDM foam gasket around a rectangular roof cutout on the metal roof of a van. Mounting plate and the white rooftop AC unit ${PRODUCT} sit nearby on a clean blanket. Workshop lighting. ${STYLE}.`,
  },
  {
    id: '06',
    slug: 'mounting-plate-torque',
    caption: 'Mounting Plate Torque',
    prompt: `Interior view from inside the cab looking up at the headliner area, where an installer (hands only) is torquing the mounting plate of the indoor ceiling panel of a rooftop parking AC. The white indoor panel is partially mounted, threaded rods visible. Soft natural light through the windshield. ${STYLE}.`,
  },
  {
    id: '07',
    slug: 'indoor-panel-finished',
    caption: 'Indoor Panel Finished',
    prompt: `Interior shot of a finished installation: the white slim indoor ceiling panel of a 12V parking air conditioner is mounted in the headliner of a truck sleeper cab. Louvers visible, wired remote on the bunk. Cozy warm interior lighting, blue curtains drawn behind the bunk. ${STYLE}.`,
  },
  {
    id: '08',
    slug: 'fleet-batch-rollout',
    caption: 'Fleet Batch Rollout',
    prompt: `Aerial wide shot of a logistics yard with a row of 6 to 8 semi trucks parked side by side, each truck sleeper roof equipped with the same ${PRODUCT}. Visible fleet uniformity, sunny midday, slight overhead haze. ${STYLE}.`,
  },
  {
    id: '09',
    slug: 'industrial-cab-24v',
    caption: '24V Industrial Cab',
    prompt: `Three-quarter view of a yellow heavy industrial truck (mining haul truck or articulated dump truck) at a mine site under bright sun. ${PRODUCT} installed on top of the operator cab. Dust haze, red earth ground, blue sky. ${STYLE}.`,
  },
  {
    id: '10',
    slug: 'rv-camping-night',
    caption: 'Off-Grid Camping Night',
    prompt: `Side view of a Sprinter conversion van parked alone in a desert at night, soft warm interior light glowing through windows, ${PRODUCT} visible on the roof against a starry sky. A small campfire in front. Long exposure feel, no light trails. ${STYLE}.`,
  },
  {
    id: '11',
    slug: 'dealer-showroom',
    caption: 'Dealer Showroom',
    prompt: `Bright dealer showroom interior with one ${PRODUCT} sitting on a clean white display plinth, branded only with a small generic spec card (no readable text). A truck cab cut-section behind it shows the AC mounted in context. Soft showroom lighting, clean concrete floor. ${STYLE}.`,
  },
  {
    id: '12',
    slug: 'export-pallets-loading',
    caption: 'Export Pallets Loading',
    prompt: `Warehouse loading dock at midday. Wooden pallets stacked with brown export cartons of rooftop parking AC units, being loaded into a 40-foot shipping container by a forklift. Realistic warehouse fluorescent + open daylight mix. ${STYLE}.`,
  },
];

async function generateImage(prompt) {
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  let retries = 3;
  let lastErr;
  while (retries > 0) {
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`HTTP ${r.status}: ${txt.slice(0, 300)}`);
      }
      const data = await r.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      for (const p of parts) {
        if (p.inlineData?.data) {
          return Buffer.from(p.inlineData.data, 'base64');
        }
      }
      throw new Error('No inlineData in response: ' + JSON.stringify(data).slice(0, 300));
    } catch (e) {
      lastErr = e;
      retries--;
      if (retries > 0) {
        await new Promise((res) => setTimeout(res, 2500));
      }
    }
  }
  throw lastErr;
}

async function run() {
  const targets = only ? SCENES.filter((s) => only.includes(s.id)) : SCENES;
  console.log(`Generating ${targets.length} scene(s)...`);
  for (const scene of targets) {
    const outPath = path.join(OUT_DIR, `install-${scene.id}-${scene.slug}.webp`);
    if (fs.existsSync(outPath) && !force) {
      console.log(`SKIP exists: ${outPath}`);
      continue;
    }
    try {
      console.log(`[${scene.id}] ${scene.caption} -> generating...`);
      const raw = await generateImage(scene.prompt);
      const webp = await sharp(raw).resize(1600, 1200, { fit: 'cover' }).webp({ quality: 82 }).toBuffer();
      fs.writeFileSync(outPath, webp);
      console.log(`[${scene.id}] saved ${outPath} (${(webp.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.error(`[${scene.id}] FAILED: ${e.message}`);
    }
  }
  console.log('Done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
