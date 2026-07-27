# VTH1 Rooftop Installation Animation Package

This package defines a reusable 3D installation animation master for the CoolDrivePro VTH1 rooftop parking air conditioner. It is written for animation vendors, Blender artists, editors, and future model-specific variants.

## Goal

Create a 90-120 second 3D installation video that helps a non-expert customer understand whether the VTH1 can fit their existing roof opening and how the installation sequence works.

The video must not describe a fixed sunroof size or a specific truck/RV hatch model. Roof openings vary by vehicle. The main message is:

> VTH1 fits clear roof openings from 20.1 in x 15.0 in to 31.5 in x 19.3 in.
> 510 x 380 mm to 800 x 490 mm.

## Core Creative Direction

- Start with the finished interior result first: the installed ceiling outlet panel, cool air, clean cabin view.
- Then explain the clear roof opening measurement and fit range.
- Use three visual fit states: too small, fits, too large.
- Keep the physical installation steps simple and confidence-building.
- Use clean 3D product renders rather than heavy engineering CAD visuals.
- Use the product top-view proportion from the drawing: exterior shell about 925 x 891 mm. The 925 mm length runs front-to-back on the roof, and the fan grille sits toward the rear section.

## Files

- `vth1-parameters.json`: source-of-truth values for model, dimensions, labels, and fit states.
- `storyboard.md`: timecoded scene plan for the 90-120 second video.
- `voiceover-and-onscreen-text.md`: English US voiceover and screen copy, with Chinese production notes.
- `shot-list.md`: shot-by-shot execution details for camera, motion, assets, and edit notes.
- `asset-list.md`: required 3D models, labels, materials, and graphic elements.
- `production-notes.md`: render style, localization rules, safety notes, QA checklist, and future model reuse guide.

## Future Model Reuse

For another rooftop AC model, do not rebuild the whole video. Duplicate this package and update:

1. Model name and title.
2. Minimum and maximum clear roof opening values.
3. Product shell proportions and underside outlet panel style.
4. Voltage, wiring notes, and any model-specific adapter requirement.
5. Final callout frame.

The scene order stays the same unless the installation structure is meaningfully different.

## Items To Confirm Before Final Render

- Confirm whether the installation opening labels should follow the manual order exactly as `800 x 490 mm` and `510 x 380 mm`, while the animation maps the product body length front-to-back.
- Confirm exact VTH1 exterior shell proportions, underside panel shape, and remote/control panel visuals.
- Confirm whether the US video should say `adapter plate required` or `contact us for adapter plate` for oversized openings.
- Confirm final brand CTA: website only, dealer contact, or WhatsApp/email.
