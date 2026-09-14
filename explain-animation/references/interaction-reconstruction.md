# Reconstructing live interactions

Read only when the user requests working interactive UI. For offline Remotion,
use a scripted input trace and the existing frame-driven reconstruction guide.
This distinction changes the implementation, not the standard of visual evidence.

## Model input before selecting an animation API

Write a small mapping table: input range → continuous properties → discrete
state → behavior after release. Include stationary layers and relationships
that must remain attached, such as a label following a slider thumb.

Use one authoritative normalized progress value for a shared interaction.
Derive related translations, masks, colors, and labels from it. In an existing
Motion project this can be a MotionValue with derived transforms; otherwise use
the framework's existing equivalent. Do not add a dependency solely for this rule.

Keep separate responsibilities explicit:

- **Continuous mappings:** geometry and visual properties derived from progress.
- **Discrete state:** selected item or mode, updated only at a defined boundary.
- **Timed settling:** an optional spring/easing after release, not a second
  independent writer fighting the drag position.
- **Input ownership:** drag, keyboard, autoplay, and reset must not update progress
  concurrently. State what interrupts autoplay and how reset cancels settling.

Record threshold inclusivity and direction. Use hysteresis only when observed or
deliberately introduced; document that deviation. Do not assume a reverse trace
has the same ordering, duration, or threshold behavior as forward motion.

## Verify input paths, not only screenshots

Compare source and output at corresponding input values and event-relative
times. Capture mid-transition states, not only resting endpoints. Exercise:

- Both sides of each meaningful threshold, endpoints, and out-of-range input.
- Slow and rapid forward/reverse movement, including a reversal during settling.
- Release, pointer cancellation, reset near and far from the default position.
- Keyboard operation and autoplay interruption when those controls exist.

Assert the selected state and geometry, not merely event delivery. Check that
labels stay attached and no stale animation overwrites newer input. Keep these
runtime checks separate from offline rendering and deterministic-seek checks.
Use the app's accessibility and reduced-motion conventions; document intentional
departures from the visual source for readability or usability.
