import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve(
  'docs/animation/vth1-installation-video/blender/output/reference-style-caption-overlays',
);
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const width = 1280;
const height = 720;
const fps = 24;
const frames = 528;

const captions = [
  [1, 72, 'FINAL ROOF RESULT', 'Fan grille faces the rear of the vehicle'],
  [73, 144, 'MEASURE CLEAR OPENING', 'Do not rely on one fixed sunroof size'],
  [145, 216, 'CHECK VTH1 FIT RANGE', '20.1 x 15.0 in to 31.5 x 19.3 in  |  510 x 380 mm to 800 x 490 mm'],
  [217, 300, 'DECIDE BEFORE CUTTING', 'Too small: enlarge  |  Fits: install  |  Too large: adapter plate'],
  [301, 410, 'SEAL AND LOWER UNIT', 'Apply foam gasket, then lower the unit centered over the cutout'],
  [411, 456, 'TIGHTEN INNER FRAME', 'Secure evenly from inside the cab'],
  [457, 528, 'FUSED DC POWER + TEST', 'Place the fuse near the battery, then test cooling and airflow'],
];

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function captionForFrame(frame) {
  return captions.find(([start, end]) => frame >= start && frame <= end) || captions.at(-1);
}

function progress(frame) {
  const seconds = Math.max(0, Math.min(frames, frame - 1)) / fps;
  const totalSeconds = frames / fps;
  return seconds / totalSeconds;
}

for (let frame = 1; frame <= frames; frame += 1) {
  const [, , headline, detail] = captionForFrame(frame);
  const fileName = `frame_${String(frame).padStart(4, '0')}.png`;
  const progressWidth = Math.round((width - 120) * progress(frame));
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="none"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <rect x="0" y="0" width="${width}" height="90" fill="#f7fafc" opacity="0.94"/>
    <rect x="60" y="72" width="${width - 120}" height="5" rx="2.5" fill="#d7e2ea"/>
    <rect x="60" y="72" width="${progressWidth}" height="5" rx="2.5" fill="#2589bd"/>
    <text x="64" y="40" font-size="34" font-weight="700" letter-spacing="1" fill="#071724">${escapeXml(headline)}</text>
    <text x="64" y="66" font-size="21" fill="#24577a">${escapeXml(detail)}</text>
  </g>
</svg>
`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, fileName));
}

console.log(`Generated ${frames} PNG caption overlay frames in ${outputDir}`);