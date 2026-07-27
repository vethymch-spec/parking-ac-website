import json
import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
PARAMS_PATH = ROOT / "vth1-parameters.json"
OUTPUT_DIR = ROOT / "blender" / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MM = 0.001
PREVIEW_FPS = 24
PREVIEW_FRAME_END = 432


def load_params():
    with PARAMS_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    return mat


def cube(name, location, scale, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    return obj


def cylinder_between(name, start, end, radius, mat):
    start_vec = Vector(start)
    end_vec = Vector(end)
    mid = (start_vec + end_vec) / 2
    direction = end_vec - start_vec
    length = direction.length
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=radius, depth=length, location=mid)
    obj = bpy.context.object
    obj.name = name
    quat = direction.to_track_quat("Z", "Y")
    obj.rotation_euler = quat.to_euler()
    if mat:
        obj.data.materials.append(mat)
    return obj


def add_text(name, text, location, size, mat, align="CENTER"):
    bpy.ops.object.text_add(location=location, rotation=(math.radians(90), 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.body = text
    obj.data.align_x = align
    obj.data.align_y = "CENTER"
    obj.data.size = size
    if mat:
        obj.data.materials.append(mat)
    return obj


def rounded_body(name, length_y, width_x, height, mat):
    obj = cube(name, (0, 0, height / 2), (width_x, length_y, height), mat)
    bevel = obj.modifiers.new("soft rounded product edges", "BEVEL")
    bevel.width = 0.055
    bevel.segments = 12
    obj.modifiers.new("smooth product shell", "WEIGHTED_NORMAL")
    return obj


def add_fan_grille(y_position, z_position, mats):
    objects = []
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.13, depth=0.012, location=(0, y_position, z_position))
    disk = bpy.context.object
    disk.name = "rear fan grille base"
    disk.data.materials.append(mats["blue"])
    objects.append(disk)

    for index, radius in enumerate([0.055, 0.085, 0.115, 0.145]):
        bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=0.0035, major_segments=64, minor_segments=8, location=(0, y_position, z_position + 0.009 + index * 0.001))
        ring = bpy.context.object
        ring.name = f"fan grille ring {index + 1}"
        ring.data.materials.append(mats["blue_dark"])
        objects.append(ring)

    for index in range(16):
        angle = (math.pi * 2 / 16) * index
        length = 0.26
        center_x = math.cos(angle) * length / 4
        center_y = y_position + math.sin(angle) * length / 4
        spoke = cube(
            f"fan grille spoke {index + 1}",
            (center_x, center_y, z_position + 0.018),
            (length, 0.006, 0.006),
            mats["blue_dark"],
        )
        spoke.rotation_euler[2] = angle
        objects.append(spoke)

    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.045, depth=0.018, location=(0, y_position, z_position + 0.02))
    hub = bpy.context.object
    hub.name = "fan grille center hub"
    hub.data.materials.append(mats["white"])
    objects.append(hub)

    return objects


def parent_to_empty(name, objects):
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    empty = bpy.context.object
    empty.name = name
    for obj in objects:
        obj.parent = empty
        obj.matrix_parent_inverse = empty.matrix_world.inverted()
    return empty


def set_keyframe_interpolation(obj, interpolation="LINEAR"):
    if not obj.animation_data or not obj.animation_data.action:
        return
    for fcurve in obj.animation_data.action.fcurves:
        for keyframe in fcurve.keyframe_points:
            keyframe.interpolation = interpolation


def animate_descent_rig(rig):
    for frame, height in [(1, 0.0), (72, 0.0), (73, 0.34), (216, 0.34), (288, 0.0), (432, 0.0)]:
        rig.location.z = height
        rig.keyframe_insert(data_path="location", frame=frame)
    set_keyframe_interpolation(rig)


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_camera_key(camera, frame, location, target, ortho_scale):
    camera.location = location
    look_at(camera, target)
    camera.data.ortho_scale = ortho_scale
    camera.keyframe_insert(data_path="location", frame=frame)
    camera.keyframe_insert(data_path="rotation_euler", frame=frame)
    camera.data.keyframe_insert(data_path="ortho_scale", frame=frame)


def animate_camera(camera):
    shots = [
        (1, (0.0, -3.6, 2.55), (0.0, 0.0, 0.10), 2.25),
        (72, (0.0, -3.6, 2.55), (0.0, 0.0, 0.10), 2.25),
        (120, (0.0, -3.0, 2.8), (0.0, 0.0, 0.08), 1.85),
        (180, (0.0, -5.1, 3.75), (0.0, -2.05, 0.05), 5.05),
        (216, (0.0, -5.1, 3.75), (0.0, -2.05, 0.05), 5.05),
        (264, (0.0, -3.6, 2.75), (0.0, 0.0, 0.16), 2.10),
        (312, (-2.35, -1.25, 2.35), (-2.45, 1.65, 0.12), 1.45),
        (372, (-2.35, -1.25, 2.35), (-2.45, 1.65, 0.12), 1.45),
        (432, (0.0, -4.2, 3.0), (0.0, 0.0, 0.10), 2.65),
    ]
    for frame, location, target, ortho_scale in shots:
        add_camera_key(camera, frame, location, target, ortho_scale)
    set_keyframe_interpolation(camera)
    set_keyframe_interpolation(camera.data)


def set_visible(objects, visible, frame):
    for obj in objects:
        obj.hide_viewport = not visible
        obj.hide_render = not visible
        obj.keyframe_insert(data_path="hide_viewport", frame=frame)
        obj.keyframe_insert(data_path="hide_render", frame=frame)


def show_only_between(objects, start_frame, end_frame):
    set_visible(objects, False, 1)
    if start_frame > 1:
        set_visible(objects, False, start_frame - 1)
    set_visible(objects, True, start_frame)
    set_visible(objects, True, end_frame)
    if end_frame < PREVIEW_FRAME_END:
        set_visible(objects, False, end_frame + 1)


def add_caption(name, headline, detail, location, start_frame, end_frame, mats):
    x, y, z = location
    panel = cube(f"{name} caption panel", (x, y + 0.025, z), (2.15, 0.024, 0.34), mats["panel"])
    headline_obj = add_text(f"{name} caption headline", headline, (x, y, z + 0.065), 0.07, mats["dark"])
    detail_obj = add_text(f"{name} caption detail", detail, (x, y, z - 0.06), 0.042, mats["blue_dark"])
    objects = [panel, headline_obj, detail_obj]
    show_only_between(objects, start_frame, end_frame)
    return objects


def create_roof_with_opening(prefix, center_x, center_y, opening_x, opening_y, mats, roof_w=1.55, roof_l=1.8):
    z = -0.02
    thickness = 0.04
    left_w = (roof_w - opening_x) / 2
    side_x = center_x - (opening_x / 2 + left_w / 2)
    cube(f"{prefix} roof left", (side_x, center_y, z), (left_w, roof_l, thickness), mats["roof"])
    side_x = center_x + (opening_x / 2 + left_w / 2)
    cube(f"{prefix} roof right", (side_x, center_y, z), (left_w, roof_l, thickness), mats["roof"])

    front_l = (roof_l - opening_y) / 2
    front_y = center_y - (opening_y / 2 + front_l / 2)
    cube(f"{prefix} roof front", (center_x, front_y, z), (opening_x, front_l, thickness), mats["roof"])
    rear_y = center_y + (opening_y / 2 + front_l / 2)
    cube(f"{prefix} roof rear", (center_x, rear_y, z), (opening_x, front_l, thickness), mats["roof"])

    # Opening outline.
    line_z = 0.01
    cylinder_between(f"{prefix} opening front edge", (center_x - opening_x / 2, center_y - opening_y / 2, line_z), (center_x + opening_x / 2, center_y - opening_y / 2, line_z), 0.005, mats["dark"])
    cylinder_between(f"{prefix} opening rear edge", (center_x - opening_x / 2, center_y + opening_y / 2, line_z), (center_x + opening_x / 2, center_y + opening_y / 2, line_z), 0.005, mats["dark"])
    cylinder_between(f"{prefix} opening left edge", (center_x - opening_x / 2, center_y - opening_y / 2, line_z), (center_x - opening_x / 2, center_y + opening_y / 2, line_z), 0.005, mats["dark"])
    cylinder_between(f"{prefix} opening right edge", (center_x + opening_x / 2, center_y - opening_y / 2, line_z), (center_x + opening_x / 2, center_y + opening_y / 2, line_z), 0.005, mats["dark"])


def add_dimension_graphics(center_x, center_y, opening_x, opening_y, label_main, label_secondary, mats):
    z = 0.08
    offset_y = center_y + opening_y / 2 + 0.16
    cylinder_between("dimension width line", (center_x - opening_x / 2, offset_y, z), (center_x + opening_x / 2, offset_y, z), 0.006, mats["blue_dark"])
    cylinder_between("dimension length line", (center_x + opening_x / 2 + 0.13, center_y - opening_y / 2, z), (center_x + opening_x / 2 + 0.13, center_y + opening_y / 2, z), 0.006, mats["blue_dark"])
    add_text("opening range main label", label_main, (center_x, offset_y + 0.11, z + 0.01), 0.055, mats["dark"])
    add_text("opening range secondary label", label_secondary, (center_x, offset_y + 0.02, z + 0.01), 0.035, mats["blue_dark"])


def add_fit_card(prefix, x, opening_x, opening_y, color_mat, title, detail, mats):
    create_roof_with_opening(prefix, x, -2.2, opening_x, opening_y, mats, roof_w=1.15, roof_l=1.25)
    z = 0.08
    cube(f"{prefix} color frame front", (x, -2.2 - opening_y / 2, z), (opening_x, 0.025, 0.025), color_mat)
    cube(f"{prefix} color frame rear", (x, -2.2 + opening_y / 2, z), (opening_x, 0.025, 0.025), color_mat)
    cube(f"{prefix} color frame left", (x - opening_x / 2, -2.2, z), (0.025, opening_y, 0.025), color_mat)
    cube(f"{prefix} color frame right", (x + opening_x / 2, -2.2, z), (0.025, opening_y, 0.025), color_mat)
    add_text(f"{prefix} title", title, (x, -1.46, 0.09), 0.07, color_mat)
    add_text(f"{prefix} detail", detail, (x, -1.58, 0.09), 0.04, mats["dark"])


def build_scene(params):
    clear_scene()
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = PREVIEW_FRAME_END
    scene.render.fps = PREVIEW_FPS
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    try:
        scene.render.engine = "BLENDER_WORKBENCH"
    except TypeError:
        pass
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "Medium High Contrast"

    mats = {
        "white": material("product satin white", (0.92, 0.96, 1.0, 1)),
        "roof": material("vehicle roof light gray", (0.66, 0.70, 0.74, 1)),
        "dark": material("label dark", (0.03, 0.04, 0.05, 1)),
        "blue": material("cooldrive blue", (0.28, 0.55, 0.78, 1)),
        "blue_dark": material("dimension blue", (0.08, 0.33, 0.55, 1)),
        "foam": material("black sealing foam", (0.02, 0.025, 0.03, 1)),
        "green": material("fit green", (0.13, 0.77, 0.37, 1)),
        "red": material("too small red", (0.94, 0.27, 0.27, 1)),
        "yellow": material("adapter yellow", (0.95, 0.62, 0.05, 1)),
        "cable_red": material("dc cable red", (0.85, 0.06, 0.08, 1)),
        "cable_black": material("dc cable black", (0.01, 0.01, 0.012, 1)),
        "panel": material("caption soft white panel", (0.96, 0.98, 1.0, 1)),
    }

    exterior = params["exteriorDimensions"]["mm"]
    product_y = exterior["frontBackLength"] * MM
    product_x = exterior["leftRightWidth"] * MM
    fan_y = product_y * 0.22

    min_open_y = params["openingRange"]["min"]["mm"]["width"] * MM
    min_open_x = params["openingRange"]["min"]["mm"]["length"] * MM
    max_open_y = params["openingRange"]["max"]["mm"]["width"] * MM
    max_open_x = params["openingRange"]["max"]["mm"]["length"] * MM
    fit_open_y = (min_open_y + max_open_y) / 2
    fit_open_x = (min_open_x + max_open_x) / 2

    # Main installation station.
    create_roof_with_opening("main", 0, 0, fit_open_x, fit_open_y, mats)
    body = rounded_body("VTH1 rooftop unit - 925mm length x 891mm width", product_y, product_x, 0.16, mats["white"])
    body.location.z = 0.10
    fan_objects = add_fan_grille(fan_y, 0.19, mats)
    descent_rig = parent_to_empty("VTH1 rooftop unit descent rig", [body, *fan_objects])
    animate_descent_rig(descent_rig)

    # Seal and inner frame.
    cube("sealing foam front", (0, -fit_open_y / 2, 0.045), (fit_open_x + 0.08, 0.035, 0.025), mats["foam"])
    cube("sealing foam rear", (0, fit_open_y / 2, 0.045), (fit_open_x + 0.08, 0.035, 0.025), mats["foam"])
    cube("sealing foam left", (-fit_open_x / 2, 0, 0.045), (0.035, fit_open_y + 0.08, 0.025), mats["foam"])
    cube("sealing foam right", (fit_open_x / 2, 0, 0.045), (0.035, fit_open_y + 0.08, 0.025), mats["foam"])
    cube("inner mounting frame preview", (0, 0, -0.09), (fit_open_x + 0.18, fit_open_y + 0.18, 0.035), mats["blue"])

    # Measurement graphics.
    add_dimension_graphics(
        0,
        0,
        max_open_x,
        max_open_y,
        "Fits 20.1 in x 15.0 in to 31.5 in x 19.3 in",
        "510 x 380 mm to 800 x 490 mm",
        mats,
    )
    add_text("front label", "FRONT", (0, -1.02, 0.08), 0.055, mats["dark"])
    add_text("rear label", "REAR - fan grille side", (0, 1.02, 0.08), 0.055, mats["blue_dark"])

    # Fit-state cards.
    add_fit_card("too small card", -2.3, min_open_x * 0.75, min_open_y * 0.75, mats["red"], "Too small", "Enlarge opening", mats)
    add_fit_card("fits card", 0, fit_open_x, fit_open_y, mats["green"], "Fits VTH1", "Ready to install", mats)
    add_fit_card("too large card", 2.3, max_open_x * 1.15, max_open_y * 1.10, mats["yellow"], "Too large", "Adapter plate required", mats)

    # Simplified wiring diagram.
    cube("battery block", (-2.9, 1.65, 0.08), (0.38, 0.22, 0.16), mats["dark"])
    cube("fuse block", (-2.25, 1.65, 0.08), (0.22, 0.16, 0.12), mats["yellow"])
    cylinder_between("positive dc cable", (-2.7, 1.65, 0.18), (-1.85, 1.65, 0.18), 0.012, mats["cable_red"])
    cylinder_between("negative dc cable", (-2.7, 1.53, 0.18), (-1.85, 1.53, 0.18), 0.012, mats["cable_black"])
    add_text("wiring label", "Fuse protection near battery", (-2.45, 1.98, 0.12), 0.045, mats["dark"])

    # Title and orientation note.
    add_text("title", "CoolDrivePro VTH1 Installation Animation Preview", (0, 1.32, 0.34), 0.08, mats["dark"])
    add_text("orientation note", "925 mm front-to-back x 891 mm left-to-right. Fan grille toward rear.", (0, 1.20, 0.24), 0.045, mats["blue_dark"])

    # Stage captions for quick client review.
    add_caption(
        "opening",
        "Measure the clear roof opening",
        "Do not look for one fixed sunroof size.",
        (0, -1.25, 0.42),
        73,
        148,
        mats,
    )
    add_caption(
        "range",
        "VTH1 fit range",
        "20.1 x 15.0 in to 31.5 x 19.3 in  |  510 x 380 mm to 800 x 490 mm",
        (0, -1.25, 0.42),
        149,
        222,
        mats,
    )
    add_caption(
        "fit states",
        "Three installation decisions",
        "Too small: enlarge  |  Fits: install  |  Too large: adapter plate",
        (0, -3.0, 0.44),
        169,
        228,
        mats,
    )
    add_caption(
        "lowering",
        "Lower the unit onto the sealed opening",
        "Keep the fan grille toward the rear of the vehicle.",
        (0, -1.25, 0.42),
        229,
        300,
        mats,
    )
    add_caption(
        "power",
        "Protect the DC power line",
        "Place fuse protection near the battery, then test cooling and airflow.",
        (-2.45, 0.95, 0.48),
        301,
        384,
        mats,
    )
    add_caption(
        "final",
        "Ready for a customer self-install guide",
        "This preview checks sequence, orientation, and measurement logic.",
        (0, -1.25, 0.42),
        385,
        432,
        mats,
    )

    # Lighting.
    bpy.ops.object.light_add(type="AREA", location=(0, -2.8, 4.0))
    light = bpy.context.object
    light.name = "large softbox"
    light.data.energy = 600
    light.data.size = 5

    # Camera.
    bpy.ops.object.camera_add(location=(0, -4.8, 3.2), rotation=(math.radians(60), 0, 0))
    camera = bpy.context.object
    scene.camera = camera
    camera.data.lens = 28
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 4.6

    animate_camera(camera)

    for frame, name in [
        (1, "Finished result / orientation preview"),
        (96, "Measure clear roof opening"),
        (168, "Fit range and three states"),
        (240, "Lower rooftop unit"),
        (312, "Fuse protected power connection"),
        (408, "Final installed result"),
    ]:
        scene.timeline_markers.new(name, frame=frame)

    scene.frame_set(180)


def main():
    params = load_params()
    build_scene(params)

    blend_path = OUTPUT_DIR / "vth1-installation-preview.blend"
    image_path = OUTPUT_DIR / "vth1-installation-preview.png"
    video_path = OUTPUT_DIR / "vth1-installation-preview.mp4"

    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))

    bpy.context.scene.render.image_settings.file_format = "PNG"
    bpy.context.scene.render.filepath = str(image_path)
    bpy.ops.render.render(write_still=True)

    bpy.context.scene.frame_set(1)
    bpy.context.scene.render.filepath = str(video_path)
    bpy.context.scene.render.image_settings.file_format = "FFMPEG"
    bpy.context.scene.render.ffmpeg.format = "MPEG4"
    bpy.context.scene.render.ffmpeg.codec = "H264"
    bpy.context.scene.render.ffmpeg.constant_rate_factor = "MEDIUM"
    bpy.context.scene.render.ffmpeg.ffmpeg_preset = "GOOD"
    bpy.ops.render.render(animation=True)

    print(f"Saved Blender preview: {blend_path}")
    print(f"Saved preview image: {image_path}")
    print(f"Saved preview video: {video_path}")


if __name__ == "__main__":
    main()
