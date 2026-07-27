import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve('docs/animation/vth1-installation-video/sora-review/overlays-en');
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const width = 1280;
const height = 720;
const fps = 30;
const durationSeconds = 8;
const frames = fps * durationSeconds;

const captions = [
  [0.00, 0.85, 'Position the rooftop unit above the clear roof opening'],
  [0.85, 1.70, 'Align the sealing gasket around the roof cutout'],
  [1.70, 2.50, 'Center the unit and confirm the mounting direction'],
  [2.50, 3.30, 'Insert fasteners and tighten each point evenly'],
  [3.30, 4.30, 'Confirm every corner is secured before wiring'],
  [4.30, 5.40, 'Route the protected power cable into the cabin'],
  [5.40, 6.65, 'Connect 12V power through a fuse near the battery'],
  [6.65, 8.00, 'Power on and verify airflow and roof seal'],
];

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function captionForSecond(second) {
  return captions.find(([start, end]) => second >= start && second < end)?.[2] || captions.at(-1)[2];
}

for (let frame = 1; frame <= frames; frame += 1) {
  const second = (frame - 1) / fps;
  const caption = captionForSecond(second);
  const progressWidth = Math.round((width - 120) * (second / durationSeconds));
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="none"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <rect x="18" y="18" width="250" height="42" rx="4" fill="#07111f" opacity="0.68"/>
    <text x="34" y="47" font-size="24" font-weight="700" fill="#ffffff">CoolDrivePro</text>

    <rect x="680" y="0" width="580" height="82" rx="4" fill="#078fa4" opacity="0.96"/>
    <text x="715" y="52" font-size="30" font-weight="700" fill="#ffffff">Parking AC Installation Demo</text>

    <rect x="0" y="586" width="1280" height="134" fill="#07111f" opacity="0.90"/>
    <rect x="60" y="696" width="1160" height="5" rx="2.5" fill="#d7e2ea" opacity="0.42"/>
    <rect x="60" y="696" width="${progressWidth}" height="5" rx="2.5" fill="#16c7d9"/>
    <text x="640" y="660" font-size="29" font-weight="700" text-anchor="middle" fill="#ffffff">${escapeXml(caption)}</text>
  </g>
</svg>
`;
  const fileName = `frame_${String(frame).padStart(4, '0')}.png`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, fileName));
}

console.log(`Generated ${frames} Sora overlay frames in ${outputDir}`);