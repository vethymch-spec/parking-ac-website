# Blender Preview Master

This folder contains a runnable Blender preview generator for the VTH1 installation animation master.

## What It Builds

- A simplified vehicle roof section.
- A VTH1 rooftop unit using the product drawing proportion: 925 mm front-to-back by 891 mm left-to-right.
- A rear-positioned fan grille on the top shell.
- Clear roof opening measurement graphics.
- Red, green, and yellow fit-state examples.
- A simplified seal, mounting frame, bolt, and wiring diagram.
- A saved `.blend` file, one preview still frame, and a short low-resolution MP4 animatic for fast review.

## Run

From the repository root:

```bash
/usr/local/bin/blender --background --python docs/animation/vth1-installation-video/blender/make_vth1_preview.py
```

Reference-style V3 preview:

This cut follows the same practical tutorial category as the public reference video `OutEquipPro Summit 2 Rooftop Air Conditioner Installation Tutorial`, but it does not copy that video's footage, exact frames, audio, or text. It uses an original VTH1 storyboard: finished result first, roof opening measurement, fit decision, sealing, straight-down lowering, inner frame tightening, fused DC power, and final airflow test.

```bash
/usr/local/bin/blender --background --python docs/animation/vth1-installation-video/blender/make_vth1_reference_style_preview.py
node docs/animation/vth1-installation-video/blender/make_reference_style_caption_overlays.mjs
ffmpeg -y -i docs/animation/vth1-installation-video/blender/output/vth1-reference-style-preview-clean.mp4 -framerate 24 -i docs/animation/vth1-installation-video/blender/output/reference-style-caption-overlays/frame_%04d.png -filter_complex "[0:v][1:v]overlay=0:0:shortest=1:format=auto" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart docs/animation/vth1-installation-video/blender/output/vth1-reference-style-preview.mp4
ffmpeg -y -i docs/animation/vth1-installation-video/blender/output/vth1-reference-style-preview.mp4 -vf "fps=1/3,scale=426:-1,tile=3x3" -frames:v 1 -update 1 docs/animation/vth1-installation-video/blender/output/vth1-reference-style-preview-contact-sheet.jpg
```

Output files:

- `docs/animation/vth1-installation-video/blender/output/vth1-installation-preview.blend`
- `docs/animation/vth1-installation-video/blender/output/vth1-installation-preview.png`
- `docs/animation/vth1-installation-video/blender/output/vth1-installation-preview.mp4`
- `docs/animation/vth1-installation-video/blender/output/vth1-installation-preview-contact-sheet.jpg`

V2 reference-style output files:

- `docs/animation/vth1-installation-video/blender/output/vth1-reference-style-preview.blend`
- `docs/animation/vth1-installation-video/blender/output/vth1-reference-style-preview.png`
- `docs/animation/vth1-installation-video/blender/output/vth1-reference-style-preview-clean.mp4`
- `docs/animation/vth1-installation-video/blender/output/vth1-reference-style-preview.mp4`
- `docs/animation/vth1-installation-video/blender/output/vth1-reference-style-preview-contact-sheet.jpg`

The MP4 is a quick working preview, not the final production render. Use it to check camera flow, product orientation, fan placement, dimension readability, and installation sequence before committing to a high-quality render.

For iterative review, rerun the command after script changes and refresh the MP4 preview. The current preview is 18 seconds at 1280x720 and is intentionally fast to render.
The reference-style preview is now 60 seconds at 1280x720, long enough to review the tutorial rhythm without waiting for a final-quality render.

## Local Preview Player

Open this file in a browser while iterating:

```text
docs/animation/vth1-installation-video/blender/preview-player.html
```

It embeds the latest MP4 and key-frame contact sheet. Use the refresh button after each render, or enable auto refresh while the preview is being revised.

## Orientation

- Vehicle front is negative Y.
- Vehicle rear is positive Y.
- Product length is front-to-back on the vehicle roof.
- Product fan grille is in the rear half of the rooftop unit.
