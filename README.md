# Skills

Reusable agent skills for focused creative and engineering workflows.

## Available skills

- [`explain-animation`](explain-animation/SKILL.md) — analyzes videos, GIFs,
  UI recordings, and animated pages; explains their motion and can turn selected
  mechanisms into reusable Remotion recipes.
- [`creating-thermal-svg`](creating-thermal-svg/SKILL.md) — generates animated
  thermal lettering with a parameterized renderer and an offline HTML preview.
  The preview supports live edits, complete source, SVG downloads, and copying code.
  See its [preview and GitHub Pages guide](creating-thermal-svg/README.md).

## Install

Choose from the skills in this repository:

```bash
npx skills add vcfgdev/skills
```

Or install a specific skill:

```bash
npx skills add vcfgdev/skills --skill explain-animation
```

## License

[MIT](LICENSE), except the bundled Archivo Black glyph data, which retains its
[SIL Open Font License](creating-thermal-svg/assets/archivo-black.mjs).
