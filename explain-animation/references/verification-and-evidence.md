# Verification and evidence

Verify rendered appearance and behavior, not merely code or bundling.

## Render and inspect

Run typechecks/tests and a targeted Remotion render. Inspect rest,
mid-transition, peak deformation/overshoot, settle, reverse, and endpoint states.
Watch the full clip at normal speed. A successful bundle or first-frame still
cannot verify animation.

Compare source and reconstruction at corresponding event-relative times, not
merely equal frame numbers. Prioritize identity and anchors, phase order, timing,
trajectory, masks, then styling. State known deviations and neutral assets.

Check an isolated still at frame N against a real sequential render from 0–N
with concurrency 1. A short N–N or N−2–N+2 render is not a playback-history
test. Use the actual sequence filename. Report residuals/failures separately;
repeat-still stability alone is not a deterministic-seek pass.

## Evidence bundle

For a completed visual reconstruction, provide evidence proportional to the
claim:

- source/output dimensions, duration, cadence, and frame count when available;
- a labeled contact sheet pairing representative source/output states;
- a labeled native-resolution crop of the decisive transition frame;
- a labeled full-playback comparison when redistribution is permitted;
- explicit rest, transition, settled, reverse, and endpoint inspection results;
- code checks and deterministic-seek evidence for frame-driven implementations.

Use labels such as **Original** and **Reconstruction**, never **Exact** unless a
stated metric and tolerance establish exactness. A decisive-frame match may
prove the renderer can produce the mechanism while timing, typography, blur,
waveform, or other details still differ. It does not prove the source used that
renderer or implementation.

When media reviewers conflict, inspect the disputed frame directly and retain
the narrower claim. Never cherry-pick a favorable description over visible
contradictory evidence.

## Verify reuse

For reusable recipes, render and watch:

- a meaningfully different content length or geometry; and
- a different duration.

Choose variants that expose fixed offsets, clipping, desynchronized phases, or
stale final states. Palette-only changes do not test reuse. Where relevant,
change emphasized ranges, line count, font metrics, or canvas width. Inspect
typography/layout at output size and realistic smaller display size, including
mid-transition. For overlays, verify labels and connectors remain attached
throughout motion.

Do not promise arbitrary copy, aspect ratios, or fps unless tested. Report exact
commands, decisive results, inspected artifacts, and limitations. If rendering
is blocked, label the result **implemented but unverified**. Do not claim
numerical similarity without a stated alignment, metric, and tolerance.
