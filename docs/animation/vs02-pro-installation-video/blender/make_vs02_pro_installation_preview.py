import json
import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
PARAMS_PATH = ROOT / "vs02-pro-parameters.json"
OUTPUT_DIR = ROOT / "blender" / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MM = 0.001
FPS = 24
FRAME_END = 720


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


def cube(name, location, scale, mat=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    return obj


def cylinder_between(name, start, end, radius, mat=None, vertices=32):
    start_vec = Vector(start)
    end_vec = Vector(end)
    mid = (start_vec + end_vec) / 2
    direction = end_vec - start_vec
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=direction.length, location=mid)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    if mat:
        obj.data.materials.append(mat)
    return obj


def cone_at(name, end, direction, radius, depth, mat=None):
    direction_vec = Vector(direction).normalized()
    center = Vector(end) - direction_vec * (depth / 2)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=radius, radius2=0, depth=depth, location=center)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = direction_vec.to_track_quat("Z", "Y").to_euler()
    if mat:
        obj.data.materials.append(mat)
    return obj


def arrow_between(name, start, end, mat=None, radius=0.008, head_radius=0.032, head_depth=0.075):
    start_vec = Vector(start)
    end_vec = Vector(end)
    direction = end_vec - start_vec
    shaft_end = end_vec - direction.normalized() * head_depth
    return [
        cylinder_between(f"{name} shaft", start_vec, shaft_end, radius, mat),
        cone_at(f"{name} head", end_vec, direction, head_radius, head_depth, mat),
    ]


def rect_outline(prefix, width_x, length_y, z, mat=None, radius=0.009, center=(0, 0)):
    x, y = center
    return [
        cylinder_between(f"{prefix} front", (x - width_x / 2, y - length_y / 2, z), (x + width_x / 2, y - length_y / 2, z), radius, mat),
        cylinder_between(f"{prefix} rear", (x - width_x / 2, y + length_y / 2, z), (x + width_x / 2, y + length_y / 2, z), radius, mat),
        cylinder_between(f"{prefix} left", (x - width_x / 2, y - length_y / 2, z), (x - width_x / 2, y + length_y / 2, z), radius, mat),
        cylinder_between(f"{prefix} right", (x + width_x / 2, y - length_y / 2, z), (x + width_x / 2, y + length_y / 2, z), radius, mat),
    ]


def add_text(name, text, location, size, mat=None):
    bpy.ops.object.text_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.body = text
    obj.data.align_x = "CENTER"
    obj.data.align_y = "CENTER"
    obj.data.size = size
    if mat:
        obj.data.materials.append(mat)
    return obj


def create_vehicle_roof(opening_x, opening_y, mats):
    roof_w = 1.62
    roof_l = 1.92
    thickness = 0.045
    side_w = (roof_w - opening_x) / 2
    front_l = (roof_l - opening_y) / 2
    objects = [
        cube("roof left panel", (-opening_x / 2 - side_w / 2, 0, 0), (side_w, roof_l, thickness), mats["roof"]),
        cube("roof right panel", (opening_x / 2 + side_w / 2, 0, 0), (side_w, roof_l, thickness), mats["roof"]),
        cube("roof front panel", (0, -opening_y / 2 - front_l / 2, 0), (opening_x, front_l, thickness), mats["roof"]),
        cube("roof rear panel", (0, opening_y / 2 + front_l / 2, 0), (opening_x, front_l, thickness), mats["roof"]),
        cube("cab side shadow", (0, 1.04, -0.05), (1.28, 0.18, 0.06), mats["roof_shadow"]),
        cube("windshield hint", (0, -1.05, 0.03), (1.12, 0.22, 0.018), mats["glass"]),
    ]
    objects.extend(rect_outline("14 inch roof opening", opening_x, opening_y, 0.05, mats["opening"], 0.01))
    return objects


def create_product_rig(product_x, product_y, product_h, mats):
    parts = []
    body = cube("VS02 PRO procedural shell", (0, 0, 0.12), (product_x, product_y, product_h), mats["white"])
    bevel = body.modifiers.new("rounded VS02 shell", "BEVEL")
    bevel.width = 0.045
    bevel.segments = 12
    body.modifiers.new("smooth weighted normals", "WEIGHTED_NORMAL")
    parts.append(body)

    top_panel = cube("blue top service panel", (0, 0.02, 0.225), (product_x * 0.72, product_y * 0.56, 0.018), mats["blue_soft"])
    parts.append(top_panel)

    for side, x in [("left", -product_x * 0.19), ("right", product_x * 0.19)]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=72, radius=0.105, depth=0.015, location=(x, product_y * 0.12, 0.245))
        fan_deck = bpy.context.object
        fan_deck.name = f"{side} condenser fan deck"
        fan_deck.data.materials.append(mats["blue"])
        parts.append(fan_deck)
        for index, radius in enumerate([0.04, 0.067, 0.095]):
            bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=0.0035, major_segments=72, minor_segments=8, location=(x, product_y * 0.12, 0.257 + index * 0.001))
            ring = bpy.context.object
            ring.name = f"{side} fan ring {index + 1}"
            ring.data.materials.append(mats["blue_dark"])
            parts.append(ring)
        for index in range(10):
            angle = math.pi * 2 * index / 10
            spoke = cube(
                f"{side} fan spoke {index + 1}",
                (x + math.cos(angle) * 0.034, product_y * 0.12 + math.sin(angle) * 0.034, 0.266),
                (0.15, 0.005, 0.005),
                mats["blue_dark"],
            )
            spoke.rotation_euler[2] = angle
            parts.append(spoke)

    parts.extend([
        cube("front intake grille", (0, -product_y * 0.49, 0.13), (product_x * 0.62, 0.018, 0.07), mats["blue_dark"]),
        cube("rear cable port", (product_x * 0.28, product_y * 0.48, 0.12), (0.10, 0.03, 0.045), mats["dark"]),
        cube("front slim profile marker", (0, -product_y * 0.35, 0.225), (product_x * 0.76, 0.018, 0.016), mats["metal"]),
    ])

    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    rig = bpy.context.object
    rig.name = "VS02 PRO descent rig"
    for obj in parts:
        obj.parent = rig
        obj.matrix_parent_inverse = rig.matrix_world.inverted()
    return [rig, *parts], rig


def create_interior_panel(opening_x, opening_y, mats):
    objects = [
        cube("interior ceiling liner", (0, 0, -0.15), (opening_x + 0.42, opening_y + 0.30, 0.035), mats["interior"]),
        cube("interior air outlet", (0, -0.03, -0.105), (opening_x + 0.26, opening_y * 0.60, 0.035), mats["white"]),
        cube("digital display", (0, -0.12, -0.075), (0.18, 0.025, 0.035), mats["blue_dark"]),
    ]
    for x in [-0.18, 0, 0.18]:
        objects.append(cube(f"vent louver {x}", (x, -0.005, -0.068), (0.10, 0.012, 0.012), mats["blue"]))
    return objects


def create_measurement(opening_x, opening_y, mats):
    z = 0.18
    objects = []
    objects.extend(arrow_between("opening width measure", (-opening_x / 2, opening_y / 2 + 0.22, z), (opening_x / 2, opening_y / 2 + 0.22, z), mats["blue_dark"], 0.01))
    objects.extend(arrow_between("opening width measure reverse", (opening_x / 2, opening_y / 2 + 0.18, z), (-opening_x / 2, opening_y / 2 + 0.18, z), mats["blue_dark"], 0.01))
    objects.extend(arrow_between("opening length measure", (opening_x / 2 + 0.22, -opening_y / 2, z), (opening_x / 2 + 0.22, opening_y / 2, z), mats["blue_dark"], 0.01))
    objects.extend(arrow_between("opening length measure reverse", (opening_x / 2 + 0.18, opening_y / 2, z), (opening_x / 2 + 0.18, -opening_y / 2, z), mats["blue_dark"], 0.01))
    objects.extend(rect_outline("standard opening highlight", opening_x, opening_y, 0.10, mats["green"], 0.015))
    objects.extend([
        add_text("opening label", "14 x 14 in", (0, opening_y / 2 + 0.34, z + 0.02), 0.08, mats["dark"]),
        add_text("opening mm label", "356 x 356 mm", (opening_x / 2 + 0.36, 0, z + 0.02), 0.06, mats["blue_dark"]),
    ])
    return objects


def create_prep_scene(opening_x, opening_y, mats):
    cloth = [cube("roof cleaning cloth", (-0.47, -0.36, 0.13), (0.26, 0.16, 0.03), mats["blue"])]
    dust = []
    for index, (x, y) in enumerate([(-0.25, -0.22), (0.05, -0.30), (0.27, 0.18), (-0.18, 0.22), (0.20, -0.02)]):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.024, location=(x, y, 0.12))
        particle = bpy.context.object
        particle.name = f"dust marker {index + 1}"
        particle.data.materials.append(mats["dust"])
        dust.append(particle)
    beams = [
        cube("front roof beam avoid marker", (0, -opening_y / 2 - 0.25, 0.13), (opening_x + 0.58, 0.035, 0.035), mats["red"]),
        cube("rear roof beam avoid marker", (0, opening_y / 2 + 0.25, 0.13), (opening_x + 0.58, 0.035, 0.035), mats["red"]),
    ]
    return cloth, dust, beams


def create_seal(opening_x, opening_y, mats):
    z = 0.10
    return [
        cube("gasket front strip", (0, -opening_y / 2, z), (opening_x + 0.13, 0.04, 0.03), mats["foam"]),
        cube("gasket rear strip", (0, opening_y / 2, z), (opening_x + 0.13, 0.04, 0.03), mats["foam"]),
        cube("gasket left strip", (-opening_x / 2, 0, z), (0.04, opening_y + 0.13, 0.03), mats["foam"]),
        cube("gasket right strip", (opening_x / 2, 0, z), (0.04, opening_y + 0.13, 0.03), mats["foam"]),
    ]


def create_alignment_guides(opening_x, opening_y, mats):
    z = 0.47
    objects = []
    for index, (x, y) in enumerate([
        (-opening_x / 2 - 0.22, -opening_y / 2 - 0.22),
        (opening_x / 2 + 0.22, -opening_y / 2 - 0.22),
        (-opening_x / 2 - 0.22, opening_y / 2 + 0.22),
        (opening_x / 2 + 0.22, opening_y / 2 + 0.22),
    ]):
        objects.extend(arrow_between(f"straight down alignment {index + 1}", (x, y, z), (x * 0.55, y * 0.55, 0.23), mats["green"], 0.011, 0.035, 0.08))
    return objects


def create_mounting(opening_x, opening_y, mats):
    objects = [cube("interior mounting frame", (0, 0, -0.18), (opening_x + 0.25, opening_y + 0.25, 0.045), mats["blue"])]
    bolt_positions = [
        (-opening_x / 2 - 0.075, -opening_y / 2 - 0.075),
        (opening_x / 2 + 0.075, opening_y / 2 + 0.075),
        (opening_x / 2 + 0.075, -opening_y / 2 - 0.075),
        (-opening_x / 2 - 0.075, opening_y / 2 + 0.075),
    ]
    for index, (x, y) in enumerate(bolt_positions):
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.026, depth=0.13, location=(x, y, -0.08))
        bolt = bpy.context.object
        bolt.name = f"cross pattern bolt {index + 1}"
        bolt.data.materials.append(mats["metal"])
        objects.append(bolt)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.043, minor_radius=0.006, major_segments=32, minor_segments=8, location=(x, y, 0.03))
        marker = bpy.context.object
        marker.name = f"bolt order highlight {index + 1}"
        marker.data.materials.append(mats["yellow"])
        objects.append(marker)
    return objects


def create_power_scene(mats):
    objects = [
        cube("LiFePO4 battery bank", (-0.70, 1.18, 0.12), (0.34, 0.22, 0.20), mats["dark"]),
        cube("inline fuse near battery", (-0.28, 1.18, 0.13), (0.20, 0.14, 0.12), mats["yellow"]),
        cube("battery positive terminal", (-0.82, 1.18, 0.24), (0.055, 0.055, 0.035), mats["red"]),
        cube("battery negative terminal", (-0.58, 1.18, 0.24), (0.055, 0.055, 0.035), mats["blue_dark"]),
    ]
    objects.extend(arrow_between("positive DC cable path", (-0.82, 1.18, 0.29), (-0.38, 1.18, 0.29), mats["red"], 0.012, 0.032, 0.075))
    objects.extend(arrow_between("fused DC cable to unit", (-0.18, 1.18, 0.29), (0.44, 0.55, 0.26), mats["red"], 0.012, 0.032, 0.075))
    objects.extend(arrow_between("negative DC return", (-0.58, 1.08, 0.22), (0.38, 0.48, 0.22), mats["dark"], 0.010, 0.030, 0.07))
    return objects


def create_airflow(mats):
    objects = []
    for index, x in enumerate([-0.22, 0, 0.22]):
        objects.extend(arrow_between(f"cold airflow {index + 1}", (x, -0.12, -0.06), (x, -0.58, -0.06), mats["blue"], 0.011, 0.040, 0.085))
    return objects


def set_visible(objects, visible, frame):
    for obj in objects:
        obj.hide_viewport = not visible
        obj.hide_render = not visible
        obj.keyframe_insert(data_path="hide_viewport", frame=frame)
        obj.keyframe_insert(data_path="hide_render", frame=frame)


def show_intervals(objects, intervals):
    set_visible(objects, False, 1)
    for start, end in intervals:
        if start > 1:
            set_visible(objects, False, start - 1)
        set_visible(objects, True, start)
        set_visible(objects, True, end)
        if end < FRAME_END:
            set_visible(objects, False, end + 1)


def set_keyframe_interpolation(obj, interpolation="BEZIER"):
    if not obj.animation_data or not obj.animation_data.action:
        return
    for fcurve in obj.animation_data.action.fcurves:
        for keyframe in fcurve.keyframe_points:
            keyframe.interpolation = interpolation


def animate_product(rig):
    for frame, z in [(1, 0.0), (144, 0.0), (384, 0.58), (504, 0.0), (720, 0.0)]:
        rig.location.z = z
        rig.keyframe_insert(data_path="location", frame=frame)
    set_keyframe_interpolation(rig)


def animate_seal(objects):
    for obj in objects:
        obj.location.z = 0.31
        obj.keyframe_insert(data_path="location", frame=289)
        obj.location.z = 0.10
        obj.keyframe_insert(data_path="location", frame=384)
        set_keyframe_interpolation(obj)


def animate_cleaning_cloth(objects, opening_x):
    for obj in objects:
        obj.keyframe_insert(data_path="location", frame=217)
        obj.location.x = opening_x / 2 + 0.42
        obj.location.y += 0.42
        obj.keyframe_insert(data_path="location", frame=288)
        set_keyframe_interpolation(obj)


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
        (1, (0.0, -2.45, 0.88), (0.0, -0.08, -0.10), 1.20),
        (72, (0.0, -2.35, 0.86), (0.0, -0.08, -0.10), 1.10),
        (73, (0.78, -3.10, 2.05), (0.0, 0.0, 0.12), 1.70),
        (144, (-0.70, -3.00, 2.00), (0.0, 0.0, 0.14), 1.58),
        (145, (0.0, -0.05, 3.40), (0.0, 0.0, 0.04), 1.22),
        (216, (0.0, -0.05, 3.40), (0.0, 0.0, 0.04), 1.08),
        (217, (0.25, -2.45, 1.70), (0.0, 0.0, 0.09), 1.28),
        (288, (0.25, -2.45, 1.70), (0.0, 0.0, 0.09), 1.16),
        (289, (0.0, -0.10, 3.10), (0.0, 0.0, 0.05), 1.18),
        (384, (0.0, -0.10, 3.10), (0.0, 0.0, 0.05), 1.08),
        (385, (0.0, -3.15, 2.18), (0.0, 0.0, 0.24), 1.55),
        (504, (0.0, -3.15, 2.18), (0.0, 0.0, 0.15), 1.38),
        (505, (0.0, -2.20, 0.72), (0.0, 0.0, -0.12), 1.32),
        (600, (0.0, -2.20, 0.72), (0.0, 0.0, -0.12), 1.22),
        (601, (0.15, -2.90, 1.70), (-0.26, 0.83, 0.12), 1.82),
        (672, (0.15, -2.90, 1.70), (-0.26, 0.83, 0.12), 1.65),
        (673, (0.0, -2.55, 1.05), (0.0, -0.08, -0.08), 1.18),
        (720, (0.0, -2.80, 1.55), (0.0, 0.0, 0.10), 1.52),
    ]
    for frame, location, target, ortho_scale in shots:
        add_camera_key(camera, frame, location, target, ortho_scale)
    set_keyframe_interpolation(camera)
    set_keyframe_interpolation(camera.data)


def setup_scene(frame_end):
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = frame_end
    scene.render.fps = FPS
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    try:
        scene.render.engine = "BLENDER_WORKBENCH"
    except TypeError:
        pass
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "Medium High Contrast"
    scene.world.color = (0.94, 0.96, 0.98)


def build_scene(params):
    clear_scene()
    setup_scene(params.get("frameEnd", FRAME_END))

    mats = {
        "white": material("satin white product", (0.93, 0.96, 1.0, 1)),
        "roof": material("clean gray vehicle roof", (0.66, 0.72, 0.76, 1)),
        "roof_shadow": material("roof shadow", (0.42, 0.48, 0.54, 1)),
        "opening": material("cut opening black", (0.03, 0.04, 0.05, 1)),
        "glass": material("windshield blue gray", (0.25, 0.38, 0.48, 1)),
        "blue": material("cooldrive action blue", (0.20, 0.55, 0.82, 1)),
        "blue_soft": material("soft blue product detail", (0.48, 0.75, 0.92, 1)),
        "blue_dark": material("deep instruction blue", (0.05, 0.26, 0.46, 1)),
        "green": material("fit green", (0.08, 0.70, 0.34, 1)),
        "red": material("warning red", (0.92, 0.18, 0.17, 1)),
        "yellow": material("fuse yellow", (0.96, 0.63, 0.05, 1)),
        "foam": material("black gasket foam", (0.02, 0.025, 0.03, 1)),
        "dark": material("electrical dark", (0.03, 0.04, 0.05, 1)),
        "metal": material("bolt metal", (0.55, 0.58, 0.60, 1)),
        "dust": material("roof dust", (0.50, 0.45, 0.38, 1)),
        "interior": material("warm gray interior trim", (0.77, 0.78, 0.76, 1)),
    }

    exterior = params["exteriorDimensions"]["mm"]
    product_y = exterior["frontBackLength"] * MM
    product_x = exterior["leftRightWidth"] * MM
    product_h = exterior["height"] * MM
    opening = params["roofOpening"]["mm"]
    opening_x = opening["width"] * MM
    opening_y = opening["length"] * MM

    roof = create_vehicle_roof(opening_x, opening_y, mats)
    product_group, product_rig = create_product_rig(product_x, product_y, product_h, mats)
    interior = create_interior_panel(opening_x, opening_y, mats)
    measurement = create_measurement(opening_x, opening_y, mats)
    prep_cloth, prep_dust, beam_warnings = create_prep_scene(opening_x, opening_y, mats)
    seal = create_seal(opening_x, opening_y, mats)
    alignment = create_alignment_guides(opening_x, opening_y, mats)
    mounting = create_mounting(opening_x, opening_y, mats)
    power = create_power_scene(mats)
    airflow = create_airflow(mats)

    animate_product(product_rig)
    animate_seal(seal)
    animate_cleaning_cloth(prep_cloth, opening_x)

    show_intervals(roof, [(1, 720)])
    show_intervals(product_group, [(1, 144), (385, 720)])
    show_intervals(interior, [(1, 72), (505, 600), (673, 720)])
    show_intervals(measurement, [(145, 216)])
    show_intervals(prep_cloth, [(217, 288)])
    show_intervals(prep_dust, [(217, 260)])
    show_intervals(beam_warnings, [(241, 288)])
    show_intervals(seal, [(289, 720)])
    show_intervals(alignment, [(385, 504)])
    show_intervals(mounting, [(505, 720)])
    show_intervals(power, [(601, 720)])
    show_intervals(airflow, [(1, 72), (673, 720)])

    bpy.ops.object.light_add(type="AREA", location=(0, -2.7, 4.0))
    light = bpy.context.object
    light.name = "large tutorial softbox"
    light.data.energy = 720
    light.data.size = 4.6

    bpy.ops.object.camera_add(location=(0, -3.0, 2.0))
    camera = bpy.context.object
    bpy.context.scene.camera = camera
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 1.6
    animate_camera(camera)

    for frame, name in [
        (1, "Final installed interior result"),
        (73, "VS02 PRO rooftop orientation"),
        (145, "Measure 14 x 14 inch opening"),
        (217, "Clean and check roof structure"),
        (289, "Apply gasket seal"),
        (385, "Lower exterior unit"),
        (505, "Tighten four bolts"),
        (601, "Fused DC power path"),
        (673, "Power on airflow test"),
    ]:
        bpy.context.scene.timeline_markers.new(name, frame=frame)

    bpy.context.scene.frame_set(145)


def main():
    params = load_params()
    build_scene(params)

    blend_path = OUTPUT_DIR / "vs02-pro-installation-preview.blend"
    still_path = OUTPUT_DIR / "vs02-pro-installation-preview.png"
    video_path = OUTPUT_DIR / "vs02-pro-installation-preview-clean.mp4"

    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.context.scene.render.image_settings.file_format = "PNG"
    bpy.context.scene.render.filepath = str(still_path)
    bpy.ops.render.render(write_still=True)

    bpy.context.scene.frame_set(1)
    bpy.context.scene.render.filepath = str(video_path)
    bpy.context.scene.render.image_settings.file_format = "FFMPEG"
    bpy.context.scene.render.ffmpeg.format = "MPEG4"
    bpy.context.scene.render.ffmpeg.codec = "H264"
    bpy.context.scene.render.ffmpeg.constant_rate_factor = "MEDIUM"
    bpy.context.scene.render.ffmpeg.ffmpeg_preset = "GOOD"
    bpy.ops.render.render(animation=True)

    print(f"Saved VS02 PRO blend: {blend_path}")
    print(f"Saved VS02 PRO still: {still_path}")
    print(f"Saved VS02 PRO clean preview video: {video_path}")


if __name__ == "__main__":
    main()