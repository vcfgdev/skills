# Creating Thermal SVG

## Browser previews and GitHub Pages

The site is built from the skill's shared renderer, not a separate implementation.
Everything runs in the browser; text is not uploaded.
The original PRO outline is preserved. Custom Latin text uses bundled Archivo Black
outlines for wide, heavy lettering that stays identical across devices. Characters
outside that font use a system-font fallback, marked as `Text` in the preview.

Run these commands from the repository root (`skills/`), not this skill directory:

```bash
node --test creating-thermal-svg/scripts/thermal.test.mjs scripts/pages.test.mjs
node scripts/build-pages.mjs
python3 -m http.server 8000 --directory _site
```

`_site/` is a generated, ignored directory. The builder refuses to overwrite an
existing directory; remove only that disposable output before rebuilding, or
pass a new output directory as the script's first argument. The thermal preview
is at `thermal-svg/` within the output; its generated HTML also opens directly offline.

After deployment, the project-site paths are:

- Skills index: `https://vcfgdev.github.io/skills/`
- Thermal preview: `https://vcfgdev.github.io/skills/thermal-svg/`
- Konpeki stays at `https://vcfgdev.github.io/konpeki/` in its own repository.

Do not deploy this artifact to `vcfgdev.github.io`, add a `CNAME`, or modify the
Konpeki Pages workflow. The artifact root is mounted at `/skills/` by GitHub;
do not nest it inside another `skills/` directory. Links are relative, and the
preview has no origin-root assets, service worker, or shared-origin storage.

**Publishing requires explicit owner approval.** The workflow only supports
`workflow_dispatch` on `main`; pushes and pull requests do not deploy anything.
Once approved:

1. Push the reviewed changes to `vcfgdev/skills`.
2. In **that repository's** Settings → Pages, choose **GitHub Actions** as the source.
3. Manually run **Deploy skill previews to Pages** on `main` and approve the
   `github-pages` environment if GitHub requires it.
4. Verify the new `/skills/thermal-svg/` URL and confirm `/konpeki/` still opens.

No Pages setting or deployment is changed by running the local build or tests.
