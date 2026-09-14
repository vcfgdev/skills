# Remotion reconstruction

Use this workflow only when implementation was requested.

Read repository guidance and the installed Remotion setup. Consult the installed
version's types or official documentation instead of inventing APIs. Use existing
project conventions and dependencies; do not scaffold another app inside one.
Start from settled layouts and neutral assets, then implement one representative
transition before repeating the full sequence.

- Declare composition width, height, fps, duration, inputs, and design
  coordinates. Convert source seconds to target frames explicitly and keep
  source timing separate from proposed retiming.
- Drive motion from `useCurrentFrame()` and `useVideoConfig()`. Use Remotion
  interpolation, easing, springs, and sequences where appropriate. Never use
  wall clocks, timers, CSS transitions/keyframes, or unseeded randomness.
- Make seeking deterministic: identical frame and props must produce identical
  pixels regardless of playback history. Schedule filmed clicks by frame; do
  not depend on React interaction state for offline rendering.
- Keep time domains explicit. `useCurrentFrame()` inside a `Sequence` is local;
  do not subtract its offset twice. Define whether each phase holds, unmounts,
  or reverses.
- Couple geometry that must move together with one progress signal. Use separate
  schedules only for observed lead/lag relationships.
- Springs are optional. Preserve observed positional overshoot, but clamp
  opacity and invalid geometry. Bound finite interpolation ranges.
- Use compatible topology for SVG path morphs. Prefer transforms, clipping,
  occlusion, or crossfades when decisive-frame evidence supports a simpler
  mechanism.
- Define repeated and reversed transition states explicitly. Do not assume the
  reverse is `1 - progress` when observed ordering differs. Keep cursor motion
  separate from UI motion.

Keep content, styling, and motion rules separable without creating a general
animation framework. Recreate product functionality only when it is the selected
subject; otherwise use clearly labeled scripted states or replaceable footage.
