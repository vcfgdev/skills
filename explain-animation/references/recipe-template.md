# Reusable animation recipe

Use this structure for a standalone card. Omit inapplicable sections rather than
invent values. Adapt it to an existing collection's schema when exporting there.

```markdown
# <mechanism-based name>

Status: conceptual recipe | implemented but unverified | verified recipe
Category / search tags: <intent and motion mechanism>
Source: <URL/path, author if known, studied interval, inspection date>
Assets: <rights, neutral replacements, dependencies>

## Intent and fit
<What this communicates; when to choose it; when not to use it.>

## Mechanism
<One paragraph explaining the causal/perceptual relationship.>

## Scope and product boundary
<Selected motion's start, handoff, and settled state; explain any boundary that
crosses a shot cut. What is presentation motion versus product behavior?>
<Demo content: supplied footage / replaceable scene / scripted UI / actual
runtime. State what is simulated and what functionality was actually tested.
Do not infer how the reference was produced from its visual polish.>

## Motion, typography, and layout contract
| Layer | Changes during playback | Stable relationships | Replaceable inputs / constraints |
| --- | --- | --- | --- |
| Motion | <properties, order, emphasis progression> | <anchors, coupling> | <timing and phase controls> |
| Typography | <text replacement vs emphasis on unchanged text> | <font role, hierarchy, leading, tracking> | <copy, font, emphasis unit/range, line-count limits> |
| Layout | <position, scale, alignment, space handoff> | <bounds, margins, parent coordinates> | <canvas, width, scene content, reflow policy> |
| Background / assets | <observed motion or static texture> | <contrast/density role> | <palette, seed, neutral assets> |

<Omit irrelevant rows. Record observed font characteristics separately from a
proposed substitute. Identify whether wrapping is supported, fixed, or requires
reauthoring; do not silently shrink or clip changed copy.>

## Evidence and uncertainty
| Claim | Tier | Timestamp/capture or derivation | Limits |
| --- | --- | --- | --- |

<Name the decisive frame and why competing mechanisms visibly diverge there.
Record rejected mechanisms and their disqualifying artifacts. Pixels alone do
not establish the source framework or rendering stack.>

## Layers and identity
<Back-to-front stack; persistent objects; anchors; coordinate system; masks.>

## Choreography
Source timing: <timestamps and uncertainty, or unavailable>
Proposed composition: <width × height, fps, duration in frames>

| Phase | Target frame range | Progress / curve | Objects and properties | Dependency |
| --- | --- | --- | --- | --- |

<Specify inclusive/exclusive boundaries and settle/hold/reverse behavior.>

## Parameters
| Parameter | Proposed default + unit | Supported/tested range | Perceptual effect |
| --- | --- | --- | --- |

## Invariants and failure modes
<Relationships that must hold; likely wrong implementations and visible symptoms.>

## Implementation
<Relative TSX/asset paths, exported component, props, duration export,
composition registration, package requirements, and exact preview/render command.>
<For a conceptual card, explicitly say no implementation exists.>

## Validation
<Commands/results, inspected output paths and frames, normal-speed review,
isolated still vs sequential 0–N seek comparison, residuals, known mismatches.>
<Link the labeled contact sheet, decisive native-resolution source/output crop,
and full-playback comparison when available. Distinguish evidence that the
renderer can produce the mechanism from evidence that the source used it.>
<Rendered and watched content/layout adaptation and retiming variant; name the
constraint tested, expected behavior, and actual result. Palette-only changes
and registered-but-unrendered compositions do not establish reuse.>
<Inspect typography/layout at output and smaller viewing sizes, including
intermediate frames. Keep product-functionality tests separate from render checks.>
<For an unverified card, state what remains to be run.>

## Adaptation
<How to change content/layout/timing without breaking invariants; what does not
transfer, including licensed assets and layout-specific values.>
```

Keep the explanation useful without opening the TSX. Keep a verified card's
implementation runnable without guessing missing fixtures, fonts, or assets.
Do not populate “safe ranges” from imagination; distinguish proposed ranges
from tested ranges.
