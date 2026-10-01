# Thermal SVG

Create animated thermal lettering with shifting color bands, soft edges, and
grain. Customize the text and effect, then export a looping SVG.

**[Open the playground](https://vcfgdev.github.io/skills/thermal-svg/)** — no
installation needed. Everything runs in your browser; your text is not uploaded.

## Create an SVG in your browser

1. Enter your **Text** (1–32 characters). The preview updates as you type.
2. Adjust the effect:
   - **Loop duration** controls how long one animation cycle takes.
   - **Stripe angle** and **Stripe period** change the direction and spacing of the color bands.
   - **Edge shade** and **Heat blur** change the shading and softness of the lettering.
   - **Grain** changes the amount of noise.
3. For a custom palette, expand **Color lookup table & noise seed**. Enter
   2–32 `#RRGGBB` colors in dark-to-light order, then select **Apply colors**.
   The last color also affects the surrounding background.
4. Select **Copy** to copy the complete SVG code, or **Download** to save
   `thermal.svg`. Both export the same full, looping effect shown in the preview.

**Reset** restores the original PRO text and effect settings. The bright stripe
can fade parts of the lettering toward white as it moves; this is part of the effect.

To use the downloaded SVG on a website:

```html
<img src="thermal.svg" alt="Thermal lettering">
```

Use separate image elements when displaying multiple exports on one page; pasting
several copies inline can cause their internal SVG IDs to conflict.

## Use it with your coding agent

Install the skill:

```bash
npx skills add vcfgdev/skills --skill creating-thermal-svg
```

Then ask your agent, for example:

> Use creating-thermal-svg to make “HEAT” lettering with a six-second loop,
> a stripe angle of −28°, and subtle grain. Give me the animated SVG and an
> HTML preview I can adjust offline.

The skill produces the SVG, a self-contained HTML playground, and a JSON file
with your parameters. See [the parameter reference](SKILL.md#parameters) for
custom palettes, outlines, and other options.

## Generate files locally

With Node.js 18 or newer, run this from the cloned repository's root. No npm
packages are required:

```bash
node creating-thermal-svg/scripts/build.mjs \
  --out ./thermal-output \
  --word HEAT --dur 6 --angle -28 --grain 0.1
```

Open `thermal-output/index.html` directly in your browser to tune the result
offline. The folder also contains `thermal.svg` and `thermal.json`. Choose a new
output folder for each build; existing output files are never overwritten.

To reuse saved parameters, pass `--config path/to/thermal.json`. Additional CLI
flags override the values in that file.

## Lettering and compatibility

The default **PRO** preserves the original traced lettering. Other supported
Latin text uses wide, heavy **Archivo Black** vector outlines. In **Outline**
mode, exported lettering needs no installed font or network connection.

If any character is outside the bundled font, the whole word uses your system
fonts instead, and the preview shows **Text**. Its appearance can vary across
devices. For a different font or unsupported script with a consistent appearance,
ask your agent to use licensed vector outlines.

The exported SVG contains no JavaScript. View it in a browser or renderer that
supports SVG filters and SMIL animation; some design tools and image viewers
may show a static frame or render the effect differently.
