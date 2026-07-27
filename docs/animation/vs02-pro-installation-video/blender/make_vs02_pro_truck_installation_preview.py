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


def arrow_between(name, start, end, mat=None, radius=0.018, head_radius=0.06, head_depth=0.16):
    start_vec = Vector(start)
    end_vec = Vector(end)
    direction = end_vec - start_vec
    shaft_end = end_vec - direction.normalized() * head_depth
    return [
        cylinder_between(f"{name} shaft", start_vec, shaft_end, radius, mat),
        cone_at(f"{name} head", end_vec, direction, head_radius, head_depth, mat),
    ]


def rect_outline(prefix, width_x, length_y, z, mat=None, radius=0.018, center=(0, 0)):
    x, y = center
    return [
        cylinder_between(f"{prefix} front", (x - width_x / 2, y - length_y / 2, z), (x + width_x / 2, y - length_y / 2, z), radius, mat),
        cylinder_between(f"{prefix} rear", (x - width_x / 2, y + length_y / 2, z), (x + width_x / 2, y + length_y / 2, z), radius, mat),
        cylinder_between(f"{prefix} left", (x - width_x / 2, y - length_y / 2, z), (x - width_x / 2, y + length_y / 2, z), radius, mat),
        cylinder_between(f"{prefix} right", (x + width_x / 2, y - length_y / 2, z), (x + width_x / 2, y + length_y / 2, z), radius, mat),
    ]


def add_text(name, text, location, size, mat=None):
    bpy.ops.object.text_add(location=location, rotation=(math.radians(75), 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.body = text
    obj.data.align_x = "CENTER"
    obj.data.align_y = "CENTER"
    obj.data.size = size
    if mat:
        obj.data.materials.append(mat)
    return obj


def world_bounds(objects):
    mins = [1e18, 1e18, 1e18]
    maxs = [-1e18, -1e18, -1e18]
    for obj in objects:
        if obj.type != "MESH":
            continue
        for corner in obj.bound_box:
            value = obj.matrix_world @ Vector(corner)
            for index in range(3):
                mins[index] = min(mins[index], value[index])
                maxs[index] = max(maxs[index], value[index])
    return Vector(mins), Vector(maxs)


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
    scene.world.color = (0.92, 0.95, 0.98)


def import_vs02_obj(params, mats):
    obj_path = params["sourceCad"]["convertedLiteObjPath"]
    before = set(bpy.data.objects)
    bpy.ops.wm.obj_import(filepath=obj_path)
    imported = [obj for obj in bpy.data.objects if obj not in before and obj.type == "MESH"]
    for obj in imported:
        obj.name = f"VS02 PRO real OBJ {obj.name}"
        if not obj.data.materials:
            obj.data.materials.append(mats["product_white"])

    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    rig = bpy.context.object
    rig.name = "VS02 PRO real mesh rig"
    for obj in imported:
        obj.parent = rig
        obj.matrix_parent_inverse = rig.matrix_world.inverted()

    rig.rotation_euler[0] = math.radians(-90)
    target_width = params["exteriorDimensions"]["mm"]["leftRightWidth"] * MM
    source_mins, source_maxs = world_bounds(imported)
    source_width = max(source_maxs.x - source_mins.x, 0.001)
    rig.scale = (target_width / source_width, target_width / source_width, target_width / source_width)
    bpy.context.view_layer.update()
    return rig, imported


def place_product_on_truck(product_rig, product_meshes, params):
    install = params["truckScene"]["installPoint"]
    roof_z = install["roofZ"]
    target_center = Vector((install["x"], install["y"], roof_z))
    mins, maxs = world_bounds(product_meshes)
    center = (mins + maxs) / 2
    delta = Vector((target_center.x - center.x, target_center.y - center.y, roof_z - mins.z + 0.025))
    product_rig.location += delta
    bpy.context.view_layer.update()
    return product_rig.location.z


def create_roof_install_markers(params, mats):
    install = params["truckScene"]["installPoint"]
    x = install["x"]
    y = install["y"]
    z = install["roofZ"] + 0.018
    opening_x = params["roofOpening"]["mm"]["width"] * MM
    opening_y = params["roofOpening"]["mm"]["length"] * MM
    objects = [cube("dark 14 inch roof opening marker", (x, y, z - 0.006), (opening_x, opening_y, 0.012), mats["opening"])]
    objects.extend(rect_outline("truck roof 14 inch opening", opening_x, opening_y, z + 0.012, mats["green"], 0.018, (x, y)))
    objects.extend([
        cube("truck gasket front strip", (x, y - opening_y / 2, z + 0.034), (opening_x + 0.16, 0.055, 0.026), mats["foam"]),
        cube("truck gasket rear strip", (x, y + opening_y / 2, z + 0.034), (opening_x + 0.16, 0.055, 0.026), mats["foam"]),
        cube("truck gasket left strip", (x - opening_x / 2, y, z + 0.034), (0.055, opening_y + 0.16, 0.026), mats["foam"]),
        cube("truck gasket right strip", (x + opening_x / 2, y, z + 0.034), (0.055, opening_y + 0.16, 0.026), mats["foam"]),
    ])
    objects.extend([
        add_text("truck opening label", "14 x 14 in", (x, y + 0.48, z + 0.08), 0.12, mats["dark"]),
        add_text("truck opening mm label", "356 x 356 mm", (x + 0.48, y, z + 0.08), 0.08, mats["blue_dark"]),
    ])
    return objects


def create_prep_and_alignment(params, mats):
    install = params["truckScene"]["installPoint"]
    x = install["x"]
    y = install["y"]
    z = install["roofZ"] + 0.08
    prep = [
        cube("cleaning cloth on Volvo roof", (x - 0.44, y - 0.34, z), (0.32, 0.18, 0.04), mats["blue"]),
        cube("front roof beam warning overlay", (x, y - 0.56, z + 0.01), (0.82, 0.045, 0.045), mats["red"]),
        cube("rear roof beam warning overlay", (x, y + 0.56, z + 0.01), (0.82, 0.045, 0.045), mats["red"]),
    ]
    alignment = []
    for index, (dx, dy) in enumerate([(-0.52, -0.52), (0.52, -0.52), (-0.52, 0.52), (0.52, 0.52)]):
        alignment.extend(arrow_between(f"truck straight down alignment {index + 1}", (x + dx, y + dy, z + 0.90), (x + dx * 0.28, y + dy * 0.28, z + 0.12), mats["green"], 0.016, 0.055, 0.14))
    return prep, alignment


def create_mounting_power_airflow(params, mats):
    install = params["truckScene"]["installPoint"]
    x = install["x"]
    y = install["y"]
    z = install["roofZ"] - 0.02
    opening_x = params["roofOpening"]["mm"]["width"] * MM
    opening_y = params["roofOpening"]["mm"]["length"] * MM
    bolt_positions = [
        (x - opening_x / 2 - 0.11, y - opening_y / 2 - 0.11),
        (x + opening_x / 2 + 0.11, y + opening_y / 2 + 0.11),
        (x + opening_x / 2 + 0.11, y - opening_y / 2 - 0.11),
        (x - opening_x / 2 - 0.11, y + opening_y / 2 + 0.11),
    ]
    mounting = []
    for index, (bolt_x, bolt_y) in enumerate(bolt_positions):
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.035, depth=0.12, location=(bolt_x, bolt_y, z + 0.10))
        bolt = bpy.context.object
        bolt.name = f"Volvo roof bolt marker {index + 1}"
        bolt.data.materials.append(mats["metal"])
        mounting.append(bolt)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.065, minor_radius=0.008, major_segments=32, minor_segments=8, location=(bolt_x, bolt_y, z + 0.18))
        ring = bpy.context.object
        ring.name = f"Volvo cross pattern highlight {index + 1}"
        ring.data.materials.append(mats["yellow"])
        mounting.append(ring)

    power = [
        cube("truck battery callout", (-1.35, 0.72, 1.28), (0.36, 0.25, 0.24), mats["dark"]),
        cube("truck inline fuse callout", (-1.18, 1.10, 1.34), (0.22, 0.16, 0.13), mats["yellow"]),
    ]
    power.extend(arrow_between("truck positive fused cable", (-1.33, 0.84, 1.48), (-1.10, 1.12, 1.48), mats["red"], 0.018, 0.055, 0.13))
    power.extend(arrow_between("truck cable route to roof", (-1.08, 1.18, 1.48), (x - 0.36, y + 0.38, z + 0.34), mats["red"], 0.016, 0.052, 0.14))

    airflow = []
    for index, dx in enumerate([-0.24, 0, 0.24]):
        airflow.extend(arrow_between(f"Volvo cool airflow {index + 1}", (x + dx, y - 0.22, z + 0.20), (x + dx, y - 0.78, z - 0.28), mats["blue"], 0.018, 0.060, 0.16))
    return mounting, power, airflow


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


def animate_product(product_rig, installed_z):
    for frame, z in [(1, installed_z), (144, installed_z), (385, installed_z + 0.86), (432, installed_z + 0.86), (504, installed_z), (720, installed_z)]:
        product_rig.location.z = z
        product_rig.keyframe_insert(data_path="location", frame=frame)
    set_keyframe_interpolation(product_rig)


def animate_cleaning(prep_objects):
    cloth = prep_objects[0]
    cloth.keyframe_insert(data_path="location", frame=217)
    cloth.location.x += 0.82
    cloth.location.y += 0.54
    cloth.keyframe_insert(data_path="location", frame=288)
    set_keyframe_interpolation(cloth)


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


def animate_camera(camera, params):
    install = params["truckScene"]["installPoint"]
    target = (install["x"], install["y"], install["roofZ"])
    shots = [
        (1, (3.35, -1.80, 3.35), (0.0, 2.10, 2.95), 4.4),
        (72, (3.10, -1.20, 3.60), (0.0, 2.15, 3.05), 3.8),
        (73, (3.45, -0.85, 4.75), target, 2.45),
        (144, (2.75, -0.45, 4.65), target, 2.05),
        (145, (0.0, 2.30, 6.95), target, 1.18),
        (216, (0.0, 2.30, 6.95), target, 1.02),
        (217, (2.10, 0.75, 5.25), target, 1.55),
        (288, (2.00, 0.92, 5.12), target, 1.35),
        (289, (0.35, 2.34, 6.55), target, 1.15),
        (384, (0.35, 2.34, 6.55), target, 1.04),
        (385, (2.50, -0.10, 5.45), (0.0, 2.32, 4.65), 1.75),
        (504, (2.25, 0.08, 5.25), target, 1.52),
        (505, (2.00, 0.68, 5.00), target, 1.42),
        (600, (1.85, 0.85, 4.95), target, 1.28),
        (601, (3.20, -0.25, 3.35), (-0.78, 1.42, 2.75), 3.08),
        (672, (3.00, -0.05, 3.55), (-0.72, 1.58, 2.90), 2.65),
        (673, (3.10, -1.05, 3.60), (0.0, 2.10, 3.05), 3.65),
        (720, (3.20, -1.35, 3.82), (0.0, 2.10, 3.12), 3.45),
    ]
    for frame, location, target_point, ortho_scale in shots:
        add_camera_key(camera, frame, location, target_point, ortho_scale)
    set_keyframe_interpolation(camera)
    set_keyframe_interpolation(camera.data)


def build_scene(params):
    truck_path = params["truckScene"]["blendPath"]
    bpy.ops.wm.open_mainfile(filepath=truck_path)
    setup_scene()

    mats = {
        "product_white": material("VS02 satin white fallback", (0.92, 0.96, 1.0, 1)),
        "opening": material("dark roof opening overlay", (0.02, 0.03, 0.035, 1)),
        "green": material("fit green overlay", (0.07, 0.68, 0.34, 1)),
        "blue": material("cooldrive action blue", (0.20, 0.55, 0.82, 1)),
        "blue_dark": material("instruction blue", (0.05, 0.26, 0.46, 1)),
        "red": material("warning red", (0.92, 0.18, 0.17, 1)),
        "yellow": material("fuse yellow", (0.96, 0.63, 0.05, 1)),
        "foam": material("black gasket foam", (0.02, 0.025, 0.03, 1)),
        "dark": material("battery dark", (0.03, 0.04, 0.05, 1)),
        "metal": material("bolt metal", (0.55, 0.58, 0.60, 1)),
    }

    product_rig, product_meshes = import_vs02_obj(params, mats)
    installed_z = place_product_on_truck(product_rig, product_meshes, params)
    roof_markers = create_roof_install_markers(params, mats)
    prep, alignment = create_prep_and_alignment(params, mats)
    mounting, power, airflow = create_mounting_power_airflow(params, mats)

    animate_product(product_rig, installed_z)
    animate_cleaning(prep)

    show_intervals([product_rig] + product_meshes, [(1, 144), (385, 720)])
    show_intervals(roof_markers, [(145, 216), (289, 720)])
    show_intervals(prep, [(217, 288)])
    show_intervals(alignment, [(385, 504)])
    show_intervals(mounting, [(505, 720)])
    show_intervals(power, [(601, 720)])
    show_intervals(airflow, [(1, 72), (673, 720)])

    bpy.ops.object.light_add(type="AREA", location=(0.0, -1.5, 7.0))
    light = bpy.context.object
    light.name = "truck installation large softbox"
    light.data.energy = 950
    light.data.size = 5.4

    bpy.ops.object.camera_add(location=(3.2, -1.4, 3.8))
    camera = bpy.context.object
    bpy.context.scene.camera = camera
    camera.data.type = "ORTHO"
    animate_camera(camera, params)

    for frame, name in [
        (1, "Final installed result on Volvo truck"),
        (73, "Real VS02 OBJ orientation"),
        (145, "14 x 14 inch roof opening"),
        (217, "Clean and check roof structure"),
        (289, "Apply gasket on real truck roof"),
        (385, "Lower VS02 onto cab roof"),
        (505, "Four-bolt cross pattern"),
        (601, "Fused DC power path"),
        (673, "Airflow test"),
    ]:
        bpy.context.scene.timeline_markers.new(name, frame=frame)

    bpy.context.scene.frame_set(73)


def main():
    params = load_params()
    build_scene(params)

    blend_path = OUTPUT_DIR / "vs02-pro-truck-installation-preview.blend"
    still_path = OUTPUT_DIR / "vs02-pro-truck-installation-preview.png"
    video_path = OUTPUT_DIR / "vs02-pro-truck-installation-preview-clean.mp4"

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

    print(f"Saved VS02 PRO truck blend: {blend_path}")
    print(f"Saved VS02 PRO truck still: {still_path}")
    print(f"Saved VS02 PRO truck clean preview video: {video_path}")


if __name__ == "__main__":
    main()