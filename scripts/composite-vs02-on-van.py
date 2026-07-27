"""
Composite VS02 PRO onto the Ford Transit van roof with correct orientation.
Orientation rule (from user):
  - AC fan-side faces the REAR of the vehicle, parallel to and close to the rear edge of the roof.
  - AC streamlined nose (front) faces the FRONT of the vehicle (toward the cab).

Source: hero perspective shot of VS02 PRO (curved nose on the left, fans on top-rear, rear vent on the right).
Target: 512x512 photo of a Ford Transit high-roof van, rear-3/4 left-elevated camera angle.

Output: previews/vs02-pro-product/assets/install-vs02pro-on-transit.webp
"""

from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
HERO_PATH = ROOT / "client/public/images/products/vs02pro/vs02pro-03-top-fans.webp"
VAN_PATH = ROOT / "previews/vs02-pro-product/assets/van-ford-transit-source.png"
OUT_PATH = ROOT / "previews/vs02-pro-product/assets/install-vs02pro-on-transit.webp"


def tight_crop_to_subject(im: Image.Image, threshold: int = 240, pad: int = 4) -> Image.Image:
    """Crop image tightly around non-white subject. Returns RGBA.
    Does NOT remove white background (subject is white); relies on destination being white too.
    """
    rgb = im.convert("RGB")
    arr = np.array(rgb)
    mask = ~((arr[..., 0] >= threshold) & (arr[..., 1] >= threshold) & (arr[..., 2] >= threshold))
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return im.convert("RGBA")
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max(), ys.max()
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(im.width - 1, x1 + pad); y1 = min(im.height - 1, y1 + pad)
    return im.convert("RGBA").crop((x0, y0, x1 + 1, y1 + 1))


def find_coeffs(source_coords, target_coords):
    """
    Given 4 source (x,y) and 4 target (x,y) corner pairs, return the 8 perspective
    coefficients needed by PIL.Image.transform(..., PERSPECTIVE, coeffs).
    PIL's perspective maps OUTPUT pixel -> INPUT pixel, so pass target_coords as the
    'source_coords' arg and source_coords as 'target_coords' arg when calling.
    Here we follow the common convention: source_coords are corners of the input image,
    target_coords are where those corners should land in the output canvas.
    """
    matrix = []
    for s, t in zip(source_coords, target_coords):
        sx, sy = s
        tx, ty = t
        matrix.append([tx, ty, 1, 0, 0, 0, -sx * tx, -sx * ty])
        matrix.append([0, 0, 0, tx, ty, 1, -sy * tx, -sy * ty])
    A = np.array(matrix, dtype=np.float64)
    B = np.array(source_coords, dtype=np.float64).reshape(8)
    res = np.linalg.solve(A, B)
    return res.tolist()


def main():
    van = Image.open(VAN_PATH).convert("RGBA")
    W, H = van.size

    # --- Tight-crop AC ---
    # vs02pro-03 shows the AC with smooth curved face at TOP and fan/intake grilles at BOTTOM.
    # We interpret this as an overhead-style view:
    #   image TOP edge    = AC FRONT (smooth nose, faces vehicle FRONT)
    #   image BOTTOM edge = AC REAR  (fan/condenser, faces vehicle REAR)
    #   image LEFT/RIGHT  = AC sides
    ac = tight_crop_to_subject(Image.open(HERO_PATH))
    aw, ah = ac.size

    # Source corners of the AC image (axis-aligned bounding box).
    # In hero: AC nose ~ left side, AC fan/rear ~ right side, top ~ top, bottom ~ baseline.
    # We treat the AC's "footprint" as the FULL bbox so its left edge = nose-front,
    # right edge = fan-rear, top edge = right-side-of-AC (toward driver), bottom edge = left-side-of-AC.
    # (The hero is a 3/4 view so the "top/bottom of bbox" don't map perfectly to AC sides,
    #  but for a visual mock-up this gives a believable result once perspective-warped.)
    src = [(0, 0), (aw, 0), (aw, ah), (0, ah)]
    # src order: nose-driver-top, fan-driver-top, fan-passenger-bottom, nose-passenger-bottom

    # --- Define where the AC footprint should land on the van roof ---
    # Roof corners of the HIGH-ROOF cargo area (estimated from the photo).
    # Camera angle: rear-3/4 LEFT elevated.  Vehicle FRONT is at image upper-left, REAR is at image lower-right.
    roof_front_left = np.array([138.0, 158.0])   # FL of roof (front, driver side, near camera at front)
    roof_front_right = np.array([288.0, 108.0])  # FR of roof (front, passenger side, far)
    roof_rear_right = np.array([478.0, 198.0])   # RR of roof (rear, passenger side, far)
    roof_rear_left = np.array([388.0, 296.0])    # RL of roof (rear, driver side, near camera at rear)

    # We want the AC footprint to:
    #   - sit on the REAR HALF of the roof
    #   - have its fan-edge parallel to and ~5% inset from the rear edge (RR->RL)
    #   - span ~55% of the roof width across (it's ~720mm wide on a ~1700mm roof ≈ 42%, bump to 55% for visual presence)
    #   - extend forward ~45% of roof length (AC depth ~720mm on ~3.2m roof ≈ 22% — bump to 45% so the unit reads clearly in the photo)

    # Helper: bilinear interpolate inside the roof quadrilateral.
    # Parameterize roof with u (front->rear) in [0,1] and v (driver->passenger) in [0,1].
    # u=0 is front edge, u=1 is rear edge.  v=0 is driver(near) side, v=1 is passenger(far) side.
    def roof_uv(u, v):
        front = (1 - v) * roof_front_left + v * roof_front_right
        rear = (1 - v) * roof_rear_left + v * roof_rear_right
        return (1 - u) * front + u * rear

    # AC footprint on roof: u in [u0, u1], v in [v0, v1]
    # VS02 PRO ~720x540mm; Transit cargo roof ~1700x3300mm.  Enlarge for visual presence.
    u0, u1 = 0.50, 0.96   # forward edge -> rear edge of AC (sits on rear half, hugs the rear)
    v0, v1 = 0.16, 0.84   # driver side -> passenger side

    # Destination corners in same order as src:
    #   src (0,0)   = top-left of bbox      = AC FRONT-driver (smooth nose, driver side)  -> (u=u0, v=v0)
    #   src (aw,0)  = top-right of bbox     = AC FRONT-passenger                          -> (u=u0, v=v1)
    #   src (aw,ah) = bottom-right of bbox  = AC REAR-passenger  (fan grille, passenger)  -> (u=u1, v=v1)
    #   src (0,ah)  = bottom-left of bbox   = AC REAR-driver     (fan grille, driver)     -> (u=u1, v=v0)
    dst_front_driver = roof_uv(u0, v0)
    dst_front_pass   = roof_uv(u0, v1)
    dst_rear_pass    = roof_uv(u1, v1)
    dst_rear_driver  = roof_uv(u1, v0)
    dst = [tuple(dst_front_driver), tuple(dst_front_pass),
           tuple(dst_rear_pass), tuple(dst_rear_driver)]

    # PIL's perspective: for each OUTPUT(x,y) it samples INPUT(x,y).
    # find_coeffs(source_coords, target_coords) returns T such that T(target)=source.
    # We want T(output_canvas) = input_image, so target_coords=dst, source_coords=src.
    coeffs = find_coeffs(src, dst)
    warped = ac.transform((W, H), Image.PERSPECTIVE, coeffs,
                          resample=Image.BICUBIC, fillcolor=(0, 0, 0, 0))

    # Build an explicit destination quad mask so only the AC footprint area is composited
    quad_mask = Image.new("L", (W, H), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(quad_mask).polygon([dst[0], dst[1], dst[2], dst[3]], fill=255)
    # Feather the edges slightly
    quad_mask = quad_mask.filter(ImageFilter.GaussianBlur(radius=1.2))
    # Apply quad mask to warped alpha
    wa = np.array(warped)
    qm = np.array(quad_mask)
    wa[..., 3] = np.minimum(wa[..., 3], qm)
    warped = Image.fromarray(wa, "RGBA")

    # --- Build a soft drop shadow ---
    shadow_mask = warped.split()[-1]
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow.paste((10, 14, 20, 170), mask=shadow_mask)
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=6))
    # Offset shadow slightly down-right (light from upper-left)
    shadow_off = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow_off.paste(shadow, (3, 5), shadow)

    # --- Compose: van + shadow + warped AC ---
    composed = van.copy()
    composed = Image.alpha_composite(composed, shadow_off)
    composed = Image.alpha_composite(composed, warped)

    # Slight overall warmth match (van photo is warm garage light)
    composed = composed.convert("RGB")

    # Save webp
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    composed.save(OUT_PATH, "WEBP", quality=88, method=6)
    print(f"Saved -> {OUT_PATH.relative_to(ROOT)}  ({OUT_PATH.stat().st_size//1024} KB)")

    # --- Also emit an ANNOTATED orientation-verification version ---
    from PIL import ImageDraw, ImageFont
    ann = composed.convert("RGBA").copy()
    draw = ImageDraw.Draw(ann)
    # arrow from rear-mid to front-mid of AC footprint
    rear_mid = roof_uv(u1, (v0 + v1) / 2)
    front_mid = roof_uv(u0, (v0 + v1) / 2)
    # Extend arrow further toward front for visibility
    ext_front = front_mid + (front_mid - rear_mid) * 0.55
    draw.line([tuple(rear_mid), tuple(ext_front)], fill=(220, 38, 38, 255), width=3)
    # arrowhead
    import math
    angle = math.atan2(ext_front[1] - rear_mid[1], ext_front[0] - rear_mid[0])
    head_len = 14
    ang_w = math.radians(28)
    p1 = (ext_front[0] - head_len * math.cos(angle - ang_w),
          ext_front[1] - head_len * math.sin(angle - ang_w))
    p2 = (ext_front[0] - head_len * math.cos(angle + ang_w),
          ext_front[1] - head_len * math.sin(angle + ang_w))
    draw.polygon([tuple(ext_front), p1, p2], fill=(220, 38, 38, 255))
    # labels
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
        font_sm = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 11)
    except Exception:
        font = ImageFont.load_default()
        font_sm = font
    # background plates for legibility
    def plate(xy, text, fnt, fg=(255, 255, 255, 255), bg=(220, 38, 38, 220)):
        bbox = draw.textbbox(xy, text, font=fnt)
        pad = 4
        draw.rectangle((bbox[0] - pad, bbox[1] - pad, bbox[2] + pad, bbox[3] + pad), fill=bg)
        draw.text(xy, text, fill=fg, font=fnt)
    plate((int(ext_front[0]) - 6, int(ext_front[1]) - 22), "FRONT (cab)", font)
    plate((int(rear_mid[0]) - 18, int(rear_mid[1]) + 8), "REAR (fan)", font, bg=(30, 64, 175, 220))
    # caption strip
    cap_text = "VS02 PRO orientation: fan side hugs roof rear edge, parallel to rear; nose points toward cab."
    cap_bbox = draw.textbbox((0, 0), cap_text, font=font_sm)
    cw, ch = cap_bbox[2] - cap_bbox[0], cap_bbox[3] - cap_bbox[1]
    draw.rectangle((0, H - ch - 12, W, H), fill=(0, 0, 0, 200))
    draw.text(((W - cw) // 2, H - ch - 7), cap_text, fill=(255, 255, 255, 255), font=font_sm)
    ann_path = OUT_PATH.with_name("install-vs02pro-on-transit-annotated.webp")
    ann.convert("RGB").save(ann_path, "WEBP", quality=90, method=6)
    print(f"Saved -> {ann_path.relative_to(ROOT)}  ({ann_path.stat().st_size//1024} KB)")


if __name__ == "__main__":
    main()
