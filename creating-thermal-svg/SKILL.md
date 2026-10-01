---
name: creating-thermal-svg
description: Creates parameterized animated thermal-material SVG lettering and a standalone HTML preview. Use for thermal typography, heat-map gradients, tuning the PRO effect, or exporting matching SVG code and previews.
compatibility: Node.js 18+ for generation; a modern browser with SVG filters and SMIL for preview. No npm packages or network requests required.
---

# Creating Thermal SVG

Generate the user's reconstructed thermal effect with one shared renderer. The default SVG must remain byte-for-byte identical to `reference/pro-thermal.svg`.

## Generate

Run from this skill directory, or use the absolute script path. Choose a new output directory; the script refuses to overwrite existing outputs.

```sh
node scripts/build.mjs --out /absolute/workspace/thermal-preview
node scripts/build.mjs --out /absolute/workspace/thermal-heat --word HEAT --dur 6 --angle -28 --grain .1
node scripts/build.mjs --out /absolute/workspace/thermal-custom --config /absolute/workspace/thermal.json
```

Outputs:
- `index.html`: self-contained offline preview of the complete, continuously looping effect, English parameter controls, code display, copy, and SVG/HTML downloads.
- `thermal.svg`: the same complete animated SVG shown in the preview.
- `thermal.json`: normalized parameters; CLI flags override JSON values.

Open the HTML in a browser. In an Amp orb, load the browser skill for verification and serve only the output directory with a supervised service and portal. Share the portal and downloadable HTML, not a loopback URL.

## Parameters

| Key | Default | Meaning / range |
| --- | --- | --- |
| `word` | `PRO` | 1–32 Unicode characters |
| `dur` | `4.4` | Loop seconds, 0.2–60 |
| `angle` | `-35` | Gradient angle in degrees, −180–180 |
| `period` | `486` | Gradient length in SVG user units, 48–2000 |
| `edge` | `8` | Alpha blur for inner shading, 0–32 |
| `heat` | `7.3` | Final heat blur, 0–32 |
| `grain` | `0.14` | Noise contribution, 0–1 |
| `seed` | `0` | Integer noise seed, 0–9999 |
| `palette` | Original 17 colors | 2–32 `#RRGGBB` entries, dark-to-light lookup table |
| `stops` | Original 9 grays | 2–32 `#RRGGBB` gradient stops at equal intervals |
| `path` | `null` | Optional compound SVG path data, not SVG markup |
| `bounds` | `[0,0,337,129]` | Custom path `[x,y,width,height]`, positive width/height |
| `fillRule` | `nonzero` | `nonzero` or `evenodd` |

Use JSON for arrays and paths. Blur and period are in user units, so retune them for unusually large or small custom outlines. The palette's last color also affects the paper background.

**Geometry matters:** `PRO` uses the user's exact traced outline. Custom Latin text defaults to **Archivo Black**, a broad, heavy sans-serif with bundled outlines. The renderer combines the glyphs into one SVG path at a 129-unit cap height. Adjacent letters are fitted by their facing contours with a 6.9-unit gap matching the traced PRO's P–R spacing: the thermal edges join while the blue cores stay distinct. Do not stretch or physically merge the letter shapes. Explicit spaces retain their font advance between words. Preview and exports need no installed fonts or network. This is a compatible visual weight, not a claim that Archivo Black is the font of the traced PRO.

If a word contains characters outside the bundled font, the whole word falls back to live SVG `<text>` for browser shaping. The preview marks this mode as `Text`; it is not guaranteed portable. For a different typeface or unsupported script with identical lettering across devices, obtain licensed outlines and supply `path` and the actual `bounds`. Do not silently omit unsupported characters.

The original bright stripe can still fade portions of the lettering into white during the loop. A heavier font reduces the thin-stroke problem; it does not remove that animation phase. For thin custom paths or fallback fonts, tune `edge` and `heat` down and lower the peak grayscale `stops` if needed. Do not change the PRO defaults to accommodate a different shape.

`assets/archivo-black.mjs` contains generated glyph data and its SIL Open Font License. `scripts/prepare-font.py` documents the source and checksum-pinned regeneration command; fontTools is needed only to regenerate that asset, not to build or use the preview. Keep the font's license when redistributing the skill or HTML.

Custom path example:

```json
{
  "word": "Mark",
  "path": "M10 20H210V100H10Z M50 40V80H170V40Z",
  "bounds": [10, 20, 200, 80],
  "fillRule": "evenodd",
  "period": 300,
  "angle": -25
}
```

## Preserve the rendering contract

`assets/thermal.mjs` owns validation, geometry, filters, and SVG serialization. `scripts/build.mjs` embeds that exact engine and the bundled glyph data into `assets/preview.html`. The preview, visible code, clipboard, and downloaded SVG all consume the same generated source. Do not replace the code display with simplified snippets, omit the path or lookup table, or render a separate hidden approximation.

Preserve the baseline pipeline: repeating grayscale gradient → blurred alpha / gray matrix / alpha composite → overlay → white paper and heat blur → fractal noise and arithmetic exposure compensation → RGB lookup table. In particular, grain compensation is `k4 = −0.38 − grain / 2`, with `k2 = 2`. `reference/Thermal-PRO.html` is the user's unmodified source reference, not the offline template.

The preview is for evaluating the final result, not teaching the build process. Always show the full effect with looping motion; do not add stage selectors, a playback timeline, or pause controls. Saved HTML retains parameters and restarts the loop. SVGs have fixed internal IDs; use separate `<img>` elements or iframe documents when embedding several, rather than duplicating them inline in one document.

## Verify and deliver

1. Run `node --test scripts/thermal.test.mjs` after changing the renderer or template.
2. Render the generated HTML and exported SVG in a browser. Inspect the default and requested non-default result at a fixed animation time, plus narrow layout if the preview changed. Capture and inspect screenshots.
3. Confirm the displayed source equals the copied/downloaded SVG and the parsed preview DOM. Verify the full effect keeps looping after edits, reset, and saved HTML reopening. Check browser errors. Do not treat source inspection as rendered verification.
4. Share the HTML and SVG, the chosen parameters and font caveat if applicable, and verification evidence. Generate video/audio only if requested; this skill does not export video.
