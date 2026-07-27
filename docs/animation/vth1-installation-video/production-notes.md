# Production Notes

## Render Style

- Clean 3D animation with realistic but simplified materials.
- Model the VTH1 body with the drawing proportion: 925 mm front-to-back length and 891 mm left-to-right width. Place the circular fan grille toward the rear of the unit.
- Use bright, readable lighting. Avoid dark cinematic scenes that hide the opening and labels.
- Keep the roof opening, gasket, mounting frame, and dimension labels readable on mobile.
- Do not overuse exploded-view complexity. The audience is a buyer or first-time installer, not an engineer.

## Unit And Localization Rules

- US version: inches first, millimeters second.
- Example primary line: `20.1 in x 15.0 in to 31.5 in x 19.3 in`.
- Example secondary line: `510 x 380 mm to 800 x 490 mm`.
- For non-US versions, reverse the hierarchy: millimeters first, inches optional.
- Keep `clear roof opening` consistent in English.

## Safety And Compliance Notes

The animation is an installation guide preview, not a replacement for the product manual.

Must show:

- Disconnect vehicle power before wiring.
- Use fuse protection near the battery.
- Avoid roof reinforcement beams.
- Clean and dry the sealing surface.
- Tighten bolts evenly, not one side fully first.

Do not show:

- Cutting into roof beams.
- Bare unfused cable from battery to unit.
- One person lifting the rooftop unit unsafely.
- Water test before the gasket and frame are properly compressed.

## Quality Checklist

Before final delivery, verify:

- The video never says or implies a fixed standard sunroof size.
- The VTH1 fit range appears at least twice.
- Inch values are correct: `20.1 in x 15.0 in` and `31.5 in x 19.3 in`.
- Millimeter values are correct: `510 x 380 mm` and `800 x 490 mm`.
- The red, green, and yellow fit states are visually distinct.
- The green fit state is clearly the desired state.
- Text is readable on mobile in 9:16 crop.
- The opening orientation is confirmed against the final product manual.
- The final render has no overlapping labels, clipped text, or unreadable warning icons.

## Deliverables

Recommended final exports:

- 16:9 master: 1920 x 1080, 90-120 seconds.
- 9:16 social cut: 1080 x 1920, 45-60 seconds.
- 1:1 social cut: 1080 x 1080, 45-60 seconds.
- Transparent or still frames for website support: opening range, fit states, sealing step, wiring diagram.
- Project source files with editable text layers and a JSON or spreadsheet dimension table.

## Reuse For Other Models

For each future product, duplicate the package and update the parameter file first. The renderer should read or manually copy:

- `model`
- `openingRange.min`
- `openingRange.max`
- `electricalLabel`
- `fitStates`
- product shell and underside panel assets

Keep the same story order unless the model has a different mounting method.
