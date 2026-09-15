# Illustrated HTML field guide

For an explanation request, turn the analysis into one self-contained HTML page
that helps a reader see the mechanism. This is an explanatory artifact, not a
pixel-exact reconstruction and not evidence of the source implementation.

## Show the analysis visually

Include only elements that clarify the selected sequence:

- a concise timestamped scene map or cycle timeline;
- selectable representative states such as rest, handoff, peak, settle, reverse,
  and endpoint;
- persistent objects, layer order, stable anchors, approximate geometry, and
  motion direction;
- the decisive frame or visible signature that rules out a plausible competing
  mechanism;
- typography and layout relationships when they affect the motion; and
- nearby **Observed**, **Derived**, **Inferred**, **Proposed**, and **Unknown**
  labels rather than one global disclaimer.

Use original, neutral CSS/SVG diagrams. Do not trace source artwork or embed
source frames unless reuse is authorized and comparison requires them. Distinguish
approximate source-pixel measurements from normalized diagram coordinates. Keep
product actions described as apparent unless the interaction was executed.

Prefer manual state selection so the reader can compare evidence. Add illustrative
motion only when it teaches phase order or coupling. Make it opt-in, label it as
schematic, and do not fabricate source timing. The page must still explain the
mechanism when motion is paused or reduced.

## Shape the page

Use Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
as the visual reference for the field guide's character. Inspect the current page
when access permits. Adapt its clarity, strong sans-serif hierarchy, generous
spacing, light neutral materials, hairline separation, compact controls, and
restrained functional color. Do not copy Apple branding or proprietary artwork,
and do not claim that the field guide is an Apple interface or HIG-compliant.

Apply these learned practices directly; loading another design skill is not
required:

- Treat the field guide as a reading-oriented surface. Reader success is
  understanding the mechanism, so prose measure and navigation matter more than
  component density.
- Build a continuous evidence trail rather than a dashboard of equal cards. Give
  one explanatory diagram or artifact dominant visual weight and keep its state
  explanation and controls nearby.
- Establish the thesis and source boundary early, then order the evidence as the
  material supports it: scene map, layers and anchors, decisive-frame
  falsification, motion grammar, reusable rule, and unknowns. Do not force empty
  sections or this exact sequence when the analysis calls for another order.
- Use desktop width purposefully. Keep prose to a readable measure and use an
  index or secondary rail only when it improves navigation or evidence comparison,
  not to fill space.
- Reserve containers for distinct artifacts and meaningful boundaries. Prefer
  sections, alignment, whitespace, and dividers over nested cards, excessive
  pills, and component-showcase layouts.
- Transform structure for narrow screens instead of merely shrinking it: collapse
  control grids, turn dense tables into labeled records, stack comparison regions,
  and keep one DOM-aligned reading order.
- Give dense reference material enough type size and row spacing. Keep diagram
  annotations legible and attached to the geometry at every representative
  viewport and state.

These are directional principles, not a fixed page template. Let the selected
mechanism and evidence determine the final structure. Resolve design choices in
favor of factual fidelity, readable evidence, accessibility, and the requirements
in this skill.

## Package the artifact

Keep HTML, CSS, JavaScript, and SVG in a single `.html` file with no external
runtime or asset dependency. Save it in the repository's review-artifact location;
in an Amp orb, use `.amp/in/artifacts/<descriptive-slug>/index.html`. Link the page
in the final response. If a live preview is useful, use the repository's existing
preview workflow or a supervised portal service rather than an unmanaged server.

Build a semantic document with readable contrast and hierarchy. State controls
must be buttons with visible focus, `aria-pressed` or an equivalent selected-state
contract, and an announced caption when the explanation changes. Keep controls
usable at narrow widths and honor `prefers-reduced-motion`.

## Verify the page

Render and inspect, at minimum, a representative desktop viewport and a narrow
mobile-sized viewport. Exercise every selectable state and any pause/reset control.
Check that:

- diagrams, labels, and controls do not overlap, clip, or overflow horizontally;
- the selected state and caption agree, including keyboard activation;
- reduced-motion mode removes nonessential animation without hiding information;
- the browser console has no errors and the page has no unexpected external
  requests; and
- the final screenshots show the corrected page, not an earlier render.

Inspect the captures visually; dimensions and DOM assertions alone are
insufficient. Report the viewports, interactions, and states checked, plus browser
or device limitations. An HTML diagram does not change a **conceptual recipe**
into an implemented animation recipe.
