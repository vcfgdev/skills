---
name: explain-animation
description: "Explains video sequences and specific animations, and turns selected reference motion into reusable Remotion recipes. Use for videos, GIFs, UI recordings, or animated pages involving motion, typography, layout, and product demonstrations."
---

# Explaining animation

Explain why reference motion reads the way it does—not merely which properties
change—and, when requested, turn it into a reusable Remotion recipe.

## Choose the outcome

| Request | Deliverable |
| --- | --- |
| Explain a sequence | Timestamped scene map of content, product actions, presentation effects, transitions, and holds |
| Explain one animation | Evidence-backed states, layers, motion grammar, typography, layout, and implementation hypotheses |
| Replicate or create a recipe | Scoped breakdown, reusable Remotion component, recipe card, reference-inspired render, adaptation render, and verification limits |

Default to explanation when no build is requested. If asked only for a written
recipe, do not force an implementation. Honor combined requests without another
approval step. Do not install skills, publish media, or modify an external
collection without authorization.

Scope work to the named effect or interval. Map long videos coarsely, then study
only the relevant sequence. Follow the motion through its trigger, handoff, and
settled state even when that crosses a shot cut.

## Workflow

1. **Inspect and classify.** Read
   [inspection and analysis](references/inspection-and-analysis.md). Record
   metadata, inspect playback and native-resolution frames, separate presentation
   from product behavior, classify timeline/interaction/hybrid motion, and label
   claims by evidence tier. Run `bun scripts/dissect.ts` on local footage to produce
   timestamped evidence; see [extraction](references/extraction.md).
2. **Model the mechanism.** Track persistent objects, layers, anchors, phase
   order, typography, layout, and replaceable inputs. For disputed transitions,
   run the decisive-frame falsification loop before selecting an implementation.
3. **Reconstruct only when requested.** For an offline video, follow
   [Remotion reconstruction](references/remotion-reconstruction.md): use the
   existing project, explicit frame-derived motion, and deterministic state.
   For a requested live drag, scroll, or scrub interaction, follow
   [interaction reconstruction](references/interaction-reconstruction.md) in the
   existing app instead; do not impose Remotion on working UI.
4. **Verify rendered behavior.** Follow
   [verification and evidence](references/verification-and-evidence.md). Inspect
   representative states and full playback; produce evidence proportional to
   the claim.
5. **Extract the reusable rule.** Use the
   [recipe template](references/recipe-template.md). Name the mechanism rather
   than the source brand, and separate invariants, tunable values, decoration,
   tested ranges, and unknowns.

Pixels support visual reconstruction, not recovery of source code. Never infer
SwiftUI, CSS/DOM, Canvas, native views, Remotion, easing primitives, or author
intent from footage alone. A close render proves what the selected renderer can
produce; it does not prove how the source was made.

## Recipe rules

Search the destination collection for the same mechanism before adding a card.
Prefer a variant when only content, styling, or tuning differs. A recipe is one
technique; this skill is the procedure for selecting, implementing, and checking
it. Do not create one skill per visual variant.

Close with the reusable rule, boundaries, status, and artifact links. Use exactly
one honest status: **conceptual recipe**, **implemented but unverified**, or
**verified recipe**.

## Final checks

Before completion, confirm:

- observations, derivations, inferences, proposals, and unknowns are distinct;
- the explanation identifies a perceptual mechanism beyond “spring + fade”;
- source timestamps and target frames remain separate;
- failed mechanisms were genuinely falsified at a decisive frame;
- no source framework or implementation provenance was invented;
- changed content tests the reusable rule rather than only changing colors;
- verification claims cite executed checks and inspected rendered media.
