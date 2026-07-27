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
FPS = 24
FRAME_END = 528


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


def cylinder_between(name, start, end, radius, mat, vertices=24):
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


def cone_at(name, end, direction, radius, depth, mat):
    direction_vec = Vector(direction).normalized()
    center = Vector(end) - direction_vec * (depth / 2)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=radius, radius2=0, depth=depth, location=center)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = direction_vec.to_track_quat("Z", "Y").to_euler()
    if mat:
        obj.data.materials.append(mat)
    return obj


def arrow_between(name, start, end, mat, radius=0.008, head_radius=0.035, head_depth=0.08):
    start_vec = Vector(start)
    end_vec = Vector(end)
    direction = end_vec - start_vec
    shaft_end = end_vec - direction.normalized() * head_depth
    return [
        cylinder_between(f"{name} shaft", start_vec, shaft_end, radius, mat),
        cone_at(f"{name} head", end_vec, direction, head_radius, head_depth, mat),
    ]


def rounded_body(name, width_x, length_y, height, mat):
    obj = cube(name, (0, 0, height / 2), (width_x, length_y, height), mat)
    bevel = obj.modifiers.new("rounded VTH1 shell", "BEVEL")
    bevel.width = 0.055
    bevel.segments = 14
    obj.modifiers.new("smooth shell normals", "WEIGHTED_NORMAL")
    return obj


def rect_outline(prefix, width_x, length_y, z, mat, radius=0.01, center=(0, 0)):
    x, y = center
    return [
        cylinder_between(f"{prefix} front", (x - width_x / 2, y - length_y / 2, z), (x + width_x / 2, y - length_y / 2, z), radius, mat),
        cylinder_between(f"{prefix} rear", (x - width_x / 2, y + length_y / 2, z), (x + width_x / 2, y + length_y / 2, z), radius, mat),
        cylinder_between(f"{prefix} left", (x - width_x / 2, y - length_y / 2, z), (x - width_x / 2, y + length_y / 2, z), radius, mat),
        cylinder_between(f"{prefix} right", (x + width_x / 2, y - length_y / 2, z), (x + width_x / 2, y + length_y / 2, z), radius, mat),
    ]


def create_roof_with_opening(prefix, opening_x, opening_y, mats, center=(0, 0), roof_w=1.55, roof_l=1.85):
    x, y = center
    z = 0.0
    thickness = 0.05
    side_w = (roof_w - opening_x) / 2
    front_l = (roof_l - opening_y) / 2
    objects = [
        cube(f"{prefix} roof left", (x - opening_x / 2 - side_w / 2, y, z), (side_w, roof_l, thickness), mats["roof"]),
        cube(f"{prefix} roof right", (x + opening_x / 2 + side_w / 2, y, z), (side_w, roof_l, thickness), mats["roof"]),
        cube(f"{prefix} roof front", (x, y - opening_y / 2 - front_l / 2, z), (opening_x, front_l, thickness), mats["roof"]),
        cube(f"{prefix} roof rear", (x, y + opening_y / 2 + front_l / 2, z), (opening_x, front_l, thickness), mats["roof"]),
    ]
    objects.extend(rect_outline(f"{prefix} clear opening", opening_x, opening_y, 0.045, mats["opening"], 0.008, center))
    return objects


def create_vehicle_base(mats):
    objects = []
    objects.append(cube("truck roof shell", (0, 0, -0.055), (1.72, 2.05, 0.045), mats["roof_shadow"]))
    objects.append(cube("windshield blue glass", (0, -1.08, 0.035), (1.12, 0.26, 0.02), mats["glass"]))
    objects.append(cube("rear cab hint", (0, 1.05, 0.0), (1.25, 0.18, 0.035), mats["roof_shadow"]))
    return objects


def create_hatch_cover(opening_x, opening_y, mats):
    objects = [
        cube("existing roof hatch cover", (0, 0, 0.105), (opening_x + 0.24, opening_y + 0.24, 0.035), mats["hatch"]),
        cube("existing hatch trim front", (0, -opening_y / 2 - 0.08, 0.13), (opening_x + 0.32, 0.035, 0.045), mats["metal"]),
        cube("existing hatch trim rear", (0, opening_y / 2 + 0.08, 0.13), (opening_x + 0.32, 0.035, 0.045), mats["metal"]),
        cube("existing hatch trim left", (-opening_x / 2 - 0.08, 0, 0.13), (0.035, opening_y + 0.32, 0.045), mats["metal"]),
        cube("existing hatch trim right", (opening_x / 2 + 0.08, 0, 0.13), (0.035, opening_y + 0.32, 0.045), mats["metal"]),
    ]
    return objects


def create_cleaning_scene(opening_x, opening_y, mats):
    cloth = [cube("blue cleaning cloth", (-opening_x / 2 - 0.34, -opening_y / 2 - 0.22, 0.155), (0.30, 0.18, 0.028), mats["blue"])]
    dust = []
    for index, (x, y) in enumerate([(-0.33, -0.24), (-0.12, 0.31), (0.18, -0.34), (0.36, 0.22), (0.04, 0.05)]):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.027, location=(x, y, 0.14))
        particle = bpy.context.object
        particle.name = f"roof dust marker {index + 1}"
        particle.data.materials.append(mats["dust"])
        dust.append(particle)

    warning = [
        cube("front roof beam warning", (0, -opening_y / 2 - 0.22, 0.15), (opening_x + 0.58, 0.035, 0.035), mats["red"]),
        cube("rear roof beam warning", (0, opening_y / 2 + 0.22, 0.15), (opening_x + 0.58, 0.035, 0.035), mats["red"]),
    ]
    return cloth, dust, warning


def create_alignment_guides(opening_x, opening_y, mats):
    z = 0.42
    objects = []
    for index, (start, end) in enumerate([
        ((-opening_x / 2 - 0.22, -opening_y / 2 - 0.22, z), (-opening_x / 2 - 0.04, -opening_y / 2 - 0.04, z)),
        ((opening_x / 2 + 0.22, -opening_y / 2 - 0.22, z), (opening_x / 2 + 0.04, -opening_y / 2 - 0.04, z)),
        ((-opening_x / 2 - 0.22, opening_y / 2 + 0.22, z), (-opening_x / 2 - 0.04, opening_y / 2 + 0.04, z)),
        ((opening_x / 2 + 0.22, opening_y / 2 + 0.22, z), (opening_x / 2 + 0.04, opening_y / 2 + 0.04, z)),
    ]):
        objects.extend(arrow_between(f"straight-down alignment arrow {index + 1}", start, end, mats["green"], 0.012, 0.035, 0.08))
    return objects


def create_product_rig(product_x, product_y, fan_y, mats):
    body = rounded_body("VTH1 clean product shell", product_x, product_y, 0.16, mats["white"])
    body.location.z = 0.11
    parts = [body]

    bpy.ops.mesh.primitive_cylinder_add(vertices=72, radius=0.145, depth=0.014, location=(0, fan_y, 0.205))
    fan_base = bpy.context.object
    fan_base.name = "rear circular fan deck"
    fan_base.data.materials.append(mats["blue"])
    parts.append(fan_base)

    for index, radius in enumerate([0.055, 0.085, 0.115, 0.145]):
        bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=0.004, major_segments=72, minor_segments=8, location=(0, fan_y, 0.216 + index * 0.001))
        ring = bpy.context.object
        ring.name = f"rear fan ring {index + 1}"
        ring.data.materials.append(mats["blue_dark"])
        parts.append(ring)

    for index in range(16):
        angle = math.pi * 2 * index / 16
        spoke = cube(
            f"rear fan spoke {index + 1}",
            (math.cos(angle) * 0.055, fan_y + math.sin(angle) * 0.055, 0.225),
            (0.25, 0.006, 0.006),
            mats["blue_dark"],
        )
        spoke.rotation_euler[2] = angle
        parts.append(spoke)

    parts.append(cube("rear direction marker", (0, fan_y + 0.22, 0.205), (0.36, 0.035, 0.018), mats["blue_dark"]))

    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    rig = bpy.context.object
    rig.name = "VTH1 reference style descent rig"
    for obj in parts:
        obj.parent = rig
        obj.matrix_parent_inverse = rig.matrix_world.inverted()
    return [rig, *parts], rig


def create_measurement_scene(opening_x, opening_y, max_x, max_y, mats):
    objects = []
    z = 0.18
    objects.extend(arrow_between("clear opening width arrow", (-max_x / 2, opening_y / 2 + 0.24, z), (max_x / 2, opening_y / 2 + 0.24, z), mats["blue_dark"], 0.01))
    objects.extend(arrow_between("clear opening width arrow reverse", (max_x / 2, opening_y / 2 + 0.20, z), (-max_x / 2, opening_y / 2 + 0.20, z), mats["blue_dark"], 0.01))
    objects.extend(arrow_between("clear opening length arrow", (max_x / 2 + 0.22, -max_y / 2, z), (max_x / 2 + 0.22, max_y / 2, z), mats["blue_dark"], 0.01))
    objects.extend(arrow_between("clear opening length arrow reverse", (max_x / 2 + 0.18, max_y / 2, z), (max_x / 2 + 0.18, -max_y / 2, z), mats["blue_dark"], 0.01))
    objects.extend(rect_outline("maximum accepted opening", max_x, max_y, 0.075, mats["green"], 0.012))
    objects.extend(rect_outline("minimum accepted opening", opening_x * 0.88, opening_y * 0.78, 0.095, mats["blue"], 0.01))
    return objects


def create_seal(opening_x, opening_y, mats):
    z = 0.11
    objects = [
        cube("seal front strip", (0, -opening_y / 2, z), (opening_x + 0.12, 0.04, 0.03), mats["foam"]),
        cube("seal rear strip", (0, opening_y / 2, z), (opening_x + 0.12, 0.04, 0.03), mats["foam"]),
        cube("seal left strip", (-opening_x / 2, 0, z), (0.04, opening_y + 0.12, 0.03), mats["foam"]),
        cube("seal right strip", (opening_x / 2, 0, z), (0.04, opening_y + 0.12, 0.03), mats["foam"]),
    ]
    return objects


def create_fit_cards(min_x, min_y, fit_x, fit_y, max_x, max_y, mats):
    objects = []
    centers = [(-1.08, 0), (0, 0), (1.08, 0)]
    sizes = [(min_x * 0.72, min_y * 0.72), (fit_x, fit_y), (max_x * 1.16, max_y * 1.08)]
    colors = [mats["red"], mats["green"], mats["yellow"]]
    for index, (center, size, color) in enumerate(zip(centers, sizes, colors)):
        objects.extend(create_roof_with_opening(f"decision card {index + 1}", size[0], size[1], mats, center, roof_w=0.96, roof_l=1.12))
        objects.extend(rect_outline(f"decision color {index + 1}", size[0], size[1], 0.115, color, 0.017, center))

    objects.extend([
        cylinder_between("red decision x stroke 1", (-1.24, -0.17, 0.22), (-0.92, 0.17, 0.22), 0.018, mats["red"]),
        cylinder_between("red decision x stroke 2", (-0.92, -0.17, 0.22), (-1.24, 0.17, 0.22), 0.018, mats["red"]),
        cylinder_between("green decision check short", (-0.18, -0.02, 0.22), (-0.04, -0.18, 0.22), 0.018, mats["green"]),
        cylinder_between("green decision check long", (-0.04, -0.18, 0.22), (0.22, 0.18, 0.22), 0.018, mats["green"]),
    ])
    objects.extend(rect_outline("yellow adapter plate", 0.66, 0.90, 0.21, mats["yellow"], 0.017, centers[2]))
    return objects


def create_mounting_and_power(opening_x, opening_y, mats):
    mounting = []
    power = []
    mounting.append(cube("interior mounting frame", (0, 0, -0.14), (opening_x + 0.23, opening_y + 0.23, 0.045), mats["blue"])
    )
    bolt_positions = [
        (-opening_x / 2 - 0.08, -opening_y / 2 - 0.08),
        (opening_x / 2 + 0.08, opening_y / 2 + 0.08),
        (opening_x / 2 + 0.08, -opening_y / 2 - 0.08),
        (-opening_x / 2 - 0.08, opening_y / 2 + 0.08),
    ]
    for index, (x, y) in enumerate(bolt_positions):
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.028, depth=0.12, location=(x, y, -0.055))
        bolt = bpy.context.object
        bolt.name = f"mounting bolt cross pattern {index + 1}"
        bolt.data.materials.append(mats["metal"])
        mounting.append(bolt)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.045, minor_radius=0.006, major_segments=32, minor_segments=8, location=(x, y, 0.03))
        ring = bpy.context.object
        ring.name = f"bolt sequence highlight {index + 1}"
        ring.data.materials.append(mats["yellow"])
        mounting.append(ring)

    power.append(cube("battery visual", (-0.72, 1.25, 0.12), (0.34, 0.22, 0.20), mats["dark"])
    )
    power.append(cube("fuse visual", (-0.30, 1.25, 0.13), (0.20, 0.15, 0.13), mats["yellow"])
    )
    power.extend(arrow_between("positive power path", (-0.56, 1.25, 0.26), (-0.05, 1.25, 0.26), mats["red"], 0.012, 0.03, 0.07))
    power.extend(arrow_between("negative power path", (-0.56, 1.10, 0.22), (-0.05, 1.10, 0.22), mats["dark"], 0.012, 0.03, 0.07))
    return mounting, power


def create_airflow(mats):
    objects = []
    for index, x in enumerate([-0.28, 0, 0.28]):
        objects.extend(arrow_between(f"cool air arrow {index + 1}", (x, -0.30, 0.13), (x, -0.78, 0.13), mats["blue"], 0.012, 0.04, 0.09))
    return objects


def add_text(name, text, location, size, mat):
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


def create_stage_caption(prefix, headline, detail, mats, y=-0.95):
    z = 0.46
    objects = [
        cube(f"{prefix} caption plate", (0, y, z - 0.02), (1.92, 0.40, 0.02), mats["panel"]),
        add_text(f"{prefix} headline", headline, (0, y + 0.055, z + 0.01), 0.115, mats["dark"]),
        add_text(f"{prefix} detail", detail, (0, y - 0.105, z + 0.01), 0.06, mats["blue_dark"]),
    ]
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
    for frame, z in [(1, 0.0), (240, 0.0), (841, 0.62), (936, 0.62), (1032, 0.0), (1440, 0.0)]:
        rig.location.z = z
        rig.keyframe_insert(data_path="location", frame=frame)
    set_keyframe_interpolation(rig)


def animate_seal(objects):
    for obj in objects:
        obj.location.z = 0.36
        obj.keyframe_insert(data_path="location", frame=841)
        obj.location.z = 0.11
        obj.keyframe_insert(data_path="location", frame=936)
        set_keyframe_interpolation(obj)


def animate_hatch(objects):
    for obj in objects:
        obj.keyframe_insert(data_path="location", frame=241)
        obj.location.z += 0.42
        obj.location.y -= 0.34
        obj.keyframe_insert(data_path="location", frame=336)
        set_keyframe_interpolation(obj)


def animate_cleaning_cloth(objects, opening_x):
    for obj in objects:
        obj.keyframe_insert(data_path="location", frame=697)
        obj.location.x = opening_x / 2 + 0.34
        obj.location.y += 0.44
        obj.keyframe_insert(data_path="location", frame=816)
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
        (1, (0.0, -3.25, 2.15), (0.0, 0.05, 0.10), 1.95),
        (120, (0.0, -3.25, 2.15), (0.0, 0.05, 0.10), 1.82),
        (121, (0.78, -3.15, 2.10), (0.0, 0.0, 0.14), 1.95),
        (240, (-0.72, -3.10, 2.08), (0.0, 0.0, 0.14), 1.86),
        (241, (0.0, -0.03, 3.78), (0.0, 0.0, 0.03), 1.82),
        (360, (0.0, -0.03, 3.78), (0.0, 0.0, 0.03), 1.66),
        (361, (0.0, -0.02, 3.75), (0.0, 0.0, 0.04), 1.48),
        (528, (0.0, -0.02, 3.75), (0.0, 0.0, 0.04), 1.48),
        (529, (0.0, -0.12, 4.05), (0.0, 0.0, 0.04), 3.05),
        (696, (0.0, -0.12, 4.05), (0.0, 0.0, 0.04), 3.05),
        (697, (0.0, -2.72, 1.82), (0.0, 0.0, 0.10), 1.60),
        (840, (0.0, -2.72, 1.82), (0.0, 0.0, 0.10), 1.44),
        (841, (0.0, -3.35, 2.35), (0.0, 0.0, 0.25), 1.84),
        (1032, (0.0, -3.35, 2.35), (0.0, 0.0, 0.18), 1.62),
        (1033, (0.0, -2.55, 1.56), (0.0, 0.0, -0.08), 1.78),
        (1176, (0.0, -2.55, 1.56), (0.0, 0.0, -0.08), 1.78),
        (1177, (0.0, -3.05, 2.05), (-0.18, 0.86, 0.15), 2.08),
        (1320, (0.0, -3.05, 2.05), (-0.18, 0.86, 0.15), 2.08),
        (1321, (0.0, -3.25, 2.15), (0.0, 0.0, 0.12), 1.88),
        (1440, (0.0, -3.25, 2.15), (0.0, 0.0, 0.12), 1.78),
    ]
    for frame, location, target, ortho_scale in shots:
        add_camera_key(camera, frame, location, target, ortho_scale)
    set_keyframe_interpolation(camera)
    set_keyframe_interpolation(camera.data)


def setup_scene():
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = FRAME_END
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
    setup_scene()

    mats = {
        "white": material("satin white product", (0.92, 0.96, 1.0, 1)),
        "roof": material("clean gray vehicle roof", (0.68, 0.73, 0.76, 1)),
        "roof_shadow": material("roof side shadow", (0.44, 0.50, 0.55, 1)),
        "opening": material("opening black edge", (0.03, 0.04, 0.05, 1)),
        "glass": material("windshield blue gray", (0.25, 0.38, 0.48, 1)),
        "blue": material("cooldrive action blue", (0.22, 0.56, 0.82, 1)),
        "blue_dark": material("deep instruction blue", (0.06, 0.28, 0.48, 1)),
        "green": material("fit green", (0.08, 0.70, 0.34, 1)),
        "red": material("too small red", (0.92, 0.18, 0.17, 1)),
        "yellow": material("adapter yellow", (0.96, 0.63, 0.05, 1)),
        "hatch": material("removed translucent hatch", (0.78, 0.86, 0.90, 0.72)),
        "dust": material("roof dust before cleaning", (0.50, 0.45, 0.38, 1)),
        "foam": material("black sealing foam", (0.02, 0.025, 0.03, 1)),
        "dark": material("electrical dark", (0.03, 0.04, 0.05, 1)),
        "metal": material("bolt metal", (0.55, 0.58, 0.60, 1)),
        "panel": material("caption white panel", (0.96, 0.98, 1.0, 1)),
    }

    exterior = params["exteriorDimensions"]["mm"]
    product_y = exterior["frontBackLength"] * MM
    product_x = exterior["leftRightWidth"] * MM
    fan_y = product_y * 0.23

    min_y = params["openingRange"]["min"]["mm"]["width"] * MM
    min_x = params["openingRange"]["min"]["mm"]["length"] * MM
    max_y = params["openingRange"]["max"]["mm"]["width"] * MM
    max_x = params["openingRange"]["max"]["mm"]["length"] * MM
    fit_y = (min_y + max_y) / 2
    fit_x = (min_x + max_x) / 2

    vehicle = create_vehicle_base(mats)
    main_roof = create_roof_with_opening("main", fit_x, fit_y, mats)
    hatch = create_hatch_cover(fit_x, fit_y, mats)
    product_group, product_rig = create_product_rig(product_x, product_y, fan_y, mats)
    measure = create_measurement_scene(min_x, min_y, max_x, max_y, mats)
    seal = create_seal(fit_x, fit_y, mats)
    fit_cards = create_fit_cards(min_x, min_y, fit_x, fit_y, max_x, max_y, mats)
    cleaning_cloth, cleaning_dust, roof_beam_warning = create_cleaning_scene(fit_x, fit_y, mats)
    alignment_guides = create_alignment_guides(fit_x, fit_y, mats)
    mounting, power = create_mounting_and_power(fit_x, fit_y, mats)
    airflow = create_airflow(mats)

    animate_product(product_rig)
    animate_seal(seal)
    animate_hatch(hatch)
    animate_cleaning_cloth(cleaning_cloth, fit_x)

    show_intervals(vehicle + main_roof, [(1, 528), (697, 1440)])
    show_intervals(product_group, [(1, 240), (841, 1440)])
    show_intervals(hatch, [(241, 360)])
    show_intervals(measure, [(361, 528)])
    show_intervals(fit_cards, [(529, 696)])
    show_intervals(cleaning_cloth, [(697, 840)])
    show_intervals(cleaning_dust, [(697, 780)])
    show_intervals(roof_beam_warning, [(760, 840)])
    show_intervals(seal, [(841, 1440)])
    show_intervals(alignment_guides, [(937, 1032)])
    show_intervals(mounting, [(1033, 1440)])
    show_intervals(power, [(1177, 1440)])
    show_intervals(airflow, [(1321, 1440)])

    bpy.ops.object.light_add(type="AREA", location=(0, -2.6, 4.0))
    light = bpy.context.object
    light.name = "large installation studio softbox"
    light.data.energy = 700
    light.data.size = 4.5

    bpy.ops.object.camera_add(location=(0, -3.3, 2.2))
    camera = bpy.context.object
    bpy.context.scene.camera = camera
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 2.0
    camera.data.lens = 35
    animate_camera(camera)

    for frame, name in [
        (1, "Finished tutorial result"),
        (121, "Exterior product position"),
        (241, "Remove hatch and expose clear opening"),
        (361, "Measure and confirm fit range"),
        (529, "Three opening decisions"),
        (697, "Clean roof and avoid beams"),
        (841, "Seal and lower rooftop unit"),
        (1033, "Inner frame cross-pattern bolts"),
        (1177, "Fused DC power path"),
        (1321, "Power on and airflow test"),
    ]:
        bpy.context.scene.timeline_markers.new(name, frame=frame)

    bpy.context.scene.frame_set(361)


def main():
    params = load_params()
    build_scene(params)

    blend_path = OUTPUT_DIR / "vth1-reference-style-preview.blend"
    still_path = OUTPUT_DIR / "vth1-reference-style-preview.png"
    video_path = OUTPUT_DIR / "vth1-reference-style-preview-clean.mp4"

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

    print(f"Saved reference-style blend: {blend_path}")
    print(f"Saved reference-style still: {still_path}")
    print(f"Saved reference-style preview video: {video_path}")


if __name__ == "__main__":
    main()