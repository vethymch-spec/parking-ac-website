# VS02 PRO Installation Video

This folder contains the working package for a 30-second VS02 PRO rooftop parking AC installation animation.

## Goal

- Duration: 30 seconds at 24 fps, 720 frames.
- Product: CoolDrivePro VS02 PRO top-mounted parking air conditioner.
- Core install story: finished result first, 14 x 14 in roof opening, clean and seal, lower unit, tighten four bolts, connect fused 12V/24V DC power, test airflow.
- Geometry rule: use the real VS02 PRO STP/CAD conversion for final product geometry. Use procedural geometry only for review animatics until the STP model is converted to GLB, FBX, or OBJ.

## Known Product Inputs

- Exterior dimensions: 980 x 680 x 190 mm.
- Roof opening: standard 14 in / 356 mm square opening.
- Mounting: four mounting bolts, cross-pattern tightening.
- Electrical: 12V/24V DC power, inline fuse near the battery.
- Local STP source: `/Users/mac/Desktop/cooldrivepro-素材/3d-models/VS02-PRO.stp`.

## Run Preview

From the repository root:

```bash
/usr/local/bin/blender --background --python docs/animation/vs02-pro-installation-video/blender/make_vs02_pro_installation_preview.py
node docs/animation/vs02-pro-installation-video/blender/make_vs02_pro_caption_overlays.mjs
ffmpeg -y -i docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-installation-preview-clean.mp4 -framerate 24 -i docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-caption-overlays/frame_%04d.png -filter_complex "[0:v][1:v]overlay=0:0:shortest=1:format=auto" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-installation-preview.mp4
rm -rf docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-caption-overlays
ffmpeg -y -i docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-installation-preview.mp4 -vf "fps=1/3,scale=426:-1,tile=3x3" -frames:v 1 -update 1 docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-installation-preview-contact-sheet.jpg
```

## Run Truck Preview

This version opens the Desktop Volvo FH 16 model and imports the converted VS02 PRO lite OBJ onto the cab roof.

```bash
/usr/local/bin/blender --background --python docs/animation/vs02-pro-installation-video/blender/make_vs02_pro_truck_installation_preview.py
node docs/animation/vs02-pro-installation-video/blender/make_vs02_pro_caption_overlays.mjs
ffmpeg -y -i docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-truck-installation-preview-clean.mp4 -framerate 24 -i docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-caption-overlays/frame_%04d.png -filter_complex "[0:v][1:v]overlay=0:0:shortest=1:format=auto" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-truck-installation-preview.mp4
rm -rf docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-caption-overlays
ffmpeg -y -i docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-truck-installation-preview.mp4 -vf "fps=1/3,scale=426:-1,tile=3x3" -frames:v 1 -update 1 docs/animation/vs02-pro-installation-video/blender/output/vs02-pro-truck-installation-preview-contact-sheet.jpg
```

## Output Files

- `blender/output/vs02-pro-installation-preview.blend`
- `blender/output/vs02-pro-installation-preview.png`
- `blender/output/vs02-pro-installation-preview-clean.mp4`
- `blender/output/vs02-pro-installation-preview.mp4`
- `blender/output/vs02-pro-installation-preview-contact-sheet.jpg`
- `blender/output/vs02-pro-truck-installation-preview.blend`
- `blender/output/vs02-pro-truck-installation-preview.png`
- `blender/output/vs02-pro-truck-installation-preview-clean.mp4`
- `blender/output/vs02-pro-truck-installation-preview.mp4`
- `blender/output/vs02-pro-truck-installation-preview-contact-sheet.jpg`

## Next Production Step

Convert the VS02 PRO STP file to a lightweight mesh asset, then replace the procedural rooftop shell in the Blender script with the real converted product model.