# AI 3D Asset Workflow For CoolDrivePro Animations

This document defines the practical workflow for using AI 3D tools in CoolDrivePro product animations while keeping real product geometry accurate.

## Principle

Use CAD/STP for real CoolDrivePro products. Use AI 3D generation for support props and environments.

For the VS02 PRO installation animation, the rooftop unit should come from the VS02 PRO STP model whenever conversion is available. AI tools can generate battery props, fuse holders, tools, roof context, cable connectors, workshop props, and generic vehicle context.

## Current Local Status

- Blender 4.5.9 LTS is installed.
- ffmpeg 8.1 is installed.
- Blender currently has no STEP/STP import operator.
- FreeCAD, CadQuery, and other local STEP conversion tools were not detected.
- VS02 PRO STP exists outside the repo at `/Users/mac/Desktop/cooldrivepro-素材/3d-models/VS02-PRO.stp`.

## Provider Matrix

| Provider | Use For | Output | Automation |
|---|---|---|---|
| STP/CAD conversion | VS02 PRO product body and engineering proportions | GLB, FBX, OBJ, BLEND | Needs conversion tool |
| Meshy | Fast props from text/image | GLB, OBJ, FBX | API via `MESHY_API_KEY` |
| Tripo AI | Props, retopology, format conversion, simple animation experiments | GLB, FBX, OBJ, USDZ | API via `TRIPO_API_KEY` |
| 3D AI Studio | Unified generation, remesh, texturing, export | GLB, FBX, OBJ, STL, BLEND | API via `THREE_D_AI_STUDIO_API_KEY` |
| Microsoft TRELLIS | Image-to-3D research workflow, GLB/PLY output | GLB, PLY, mesh | Remote Linux/NVIDIA host recommended |
| Luma AI | Reference images/video, visual ideation | Images/video | Not a primary mesh workflow here |

## Environment Variables

Do not commit API keys to the repository. Use environment variables or local ignored files.

```text
MESHY_API_KEY=
TRIPO_API_KEY=
THREE_D_AI_STUDIO_API_KEY=
TRELLIS_ENDPOINT=
TRELLIS_API_KEY=
```

## Folder Layout

Generated assets should use this structure:

```text
docs/animation/assets/generated/<provider>/<asset-slug>/
  asset.glb
  preview.jpg
  source.png
  prompt.md
  manifest.json
```

Reference images and screenshots should use:

```text
docs/animation/assets/reference/
```

## VS02 PRO First Asset Batch

For the 30 second VS02 PRO installation animation, generate or source these support assets first:

1. Battery box with visible positive/negative terminals.
2. Inline fuse holder near battery.
3. Red/black DC cable with protective loom.
4. Rubber roof grommet or cable gland.
5. Installation tool set: tape measure, marker, drill, torque wrench, sealant tube.
6. Generic clean vehicle roof section if procedural Blender geometry is not enough.
7. Simple interior ceiling context for the airflow test.

Do not use AI generation for the VS02 PRO rooftop unit if the STP model can be converted.

## Manual Web Workflow

Use this when no API key is available.

1. Prepare a prompt in `prompt.md`.
2. Generate the model in Meshy, Tripo, 3D AI Studio, or a TRELLIS Space.
3. Export GLB when possible; use FBX for Maya handoff.
4. Place files in `docs/animation/assets/generated/<provider>/<asset-slug>/`.
5. Create `manifest.json` with source, provider, intended use, and commercial-use note.
6. Import into Blender and run the quality checklist.

## Automated Workflow Target

The intended future automation is:

```text
prompt/source image -> provider API -> async polling -> download model -> manifest -> Blender import check
```

For TRELLIS, use a remote GPU service:

```text
source image -> remote TRELLIS endpoint -> sample.glb/sample.ply -> generated/trellis/<asset-slug>/
```

## Quality Checklist

- Correct source: CAD for product master, AI for support props.
- No accidental brand logos, fake labels, or competitor marks.
- Scale is plausible for the scene.
- Pivot is convenient for animation.
- Mesh normals are clean.
- Materials are readable under neutral lighting.
- Polycount is reasonable for a 30 second render.
- Manifest is present.

## Example Manifest

```json
{
  "assetId": "dc-fuse-holder-001",
  "provider": "3d-ai-studio",
  "sourceType": "text-to-3d",
  "sourceFiles": [],
  "promptFile": "prompt.md",
  "outputFiles": ["asset.glb"],
  "intendedUse": "VS02 PRO installation animation wiring shot",
  "licenseNote": "Generated under provider account terms; verify commercial use before final publishing.",
  "createdAt": "2026-05-08",
  "qaStatus": "draft"
}
```

## VS02 PRO Prompt Pack

### Battery And Fuse

```text
Create a clean industrial 3D prop for a vehicle auxiliary battery and inline fuse holder. Style: realistic but simplified, suitable for an instructional product animation. Include a rectangular battery box, a small yellow or translucent fuse holder, red and black DC cables, no brand logos, clean topology, neutral materials, export as GLB.
```

### Installation Tools

```text
Create a tidy 3D tool set for a vehicle rooftop air conditioner installation: tape measure, marker, jigsaw, cordless drill, torque wrench, sealant tube, and safety gloves. Style: clean product tutorial props, realistic proportions, no labels or logos, neutral workshop colors, export as GLB.
```

### Roof Scene

```text
Create a simplified commercial vehicle roof section for an instructional animation. Include a slightly curved light gray metal roof surface, a square 14 inch roof opening, subtle roof ribs, and clean edges. No brand logos, no people, no text, export as GLB.
```

### DC Connector

```text
Create a simplified heavy-duty DC wiring connector prop for a vehicle parking air conditioner installation. Include red and black cables, protective loom, a rubber grommet, and a compact connector housing. Clean topology, animation-ready pivot, export as GLB.
```