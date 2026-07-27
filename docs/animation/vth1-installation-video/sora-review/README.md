# Sora Installation Video Optimization

Source file: `/Users/mac/Desktop/sora 安装视频.mp4`

This folder contains local review assets and optimized exports for the Sora-generated parking AC installation demo. The source video is kept unchanged.

## Source Specs

- Duration: 8 seconds
- Resolution: 1280 x 720
- Frame rate: 30 fps
- Video: H.264, yuv420p
- Audio: AAC

## Output Plan

- `sora-install-contact-sheet.jpg`: key-frame overview for quick review.
- `sora-install-midframe.jpg`: representative middle frame.
- `sora-installation-web.mp4`: compressed web-ready version, no added captions.
- `sora-installation-en-preview.mp4`: English customer preview with top title, brand label, dark lower caption band, and English step captions.
- `make_sora_installation_overlays.mjs`: Generates transparent PNG overlay frames for the English preview. This avoids relying on FFmpeg text/subtitle filters.
- `overlays-en/`: generated overlay frame sequence, safe to delete and regenerate.

## Notes

- The English overlay is a localization layer. It does not overwrite the original desktop file.
- The video is still a Sora concept preview, not final installation documentation.
- Before production use, replace generic visuals with final product dimensions, manual language, wiring warnings, and real install footage where available.
