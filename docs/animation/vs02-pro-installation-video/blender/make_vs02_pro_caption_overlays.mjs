import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve(
  'docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-caption-overlays',
);
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const width = 1280;
const height = 720;
const fps = 24;
const frames = 720;

const captions = [
  [1, 72, 'FINAL CAB RESULT', 'Installed interior outlet, display, and cool airflow'],
  [73, 144, 'ORIENT VS02 PRO', '980 x 680 x 190 mm top-mounted shell on the vehicle roof'],
  [145, 216, 'MARK 14 x 14 IN OPENING', 'Use the standard 356 x 356 mm roof opening and confirm clear structure'],
  [217, 288, 'CLEAN + CHECK ROOF', 'Remove dust and avoid roof reinforcement beams before sealing'],
  [289, 384, 'APPLY GASKET SEAL', 'Place a continuous foam or butyl seal around the cutout'],
  [385, 504, 'LOWER STRAIGHT DOWN', 'Center the exterior unit over the opening without dragging the gasket'],
  [505, 600, 'TIGHTEN 4 BOLTS', 'Install the interior frame and tighten evenly in a cross pattern'],
  [601, 672, 'FUSED 12V/24V DC POWER', 'Place fuse protection near the battery before testing'],
  [673, 720, 'POWER ON TEST', 'Confirm cold airflow and inspect the roof seal'],
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
    <text x="64" y="40" font-size="34" font-weight="700" fill="#071724">${escapeXml(headline)}</text>
    <text x="64" y="66" font-size="21" fill="#24577a">${escapeXml(detail)}</text>
  </g>
</svg>
`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, fileName));
}

console.log(`Generated ${frames} PNG caption overlay frames in ${outputDir}`);