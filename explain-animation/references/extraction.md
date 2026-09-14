# Extract timestamped evidence

Run the bundled helper after acquiring a local reference with the user's
authorized source/download workflow. It does not download media, execute remote
scripts, copy the original into the evidence bundle, or publish artifacts.

Requires Bun, ffmpeg with `drawtext`, ffprobe, and an installed font.
Paths below are relative to this skill directory. Output must be a new directory;
existing evidence is never overwritten. A failed run may leave partial output;
inspect the failure and choose a new destination for retry.

```sh
# Up to 12 real frames distributed over the decoded presentation timeline.
bun scripts/dissect.ts /tmp/reference.mp4 /tmp/overview

# Every decoded frame in the inclusive source-PTS window, native 600×220 crop.
bun scripts/dissect.ts /tmp/reference.mp4 /tmp/transition \
  --window 0.45 0.75 --every 1 --crop 600 220 160 370

# Test the helper with synthetic media; fixtures live in temporary directories.
bun test scripts/dissect.test.ts
```

The helper emits:

- `probe.json`: first-video-stream metadata and decoded frame timestamps,
  including nominal/average fps and time base.
- `frames/NNN.png`: selected native-resolution frames or exact crops, without
  timestamp overlays. Use these for decisive geometry comparisons.
- `contact-sheet.png`: aspect-preserving, letterboxed thumbnails with source
  frame indices and actual presentation timestamps in a separate label band.
- `manifest.json`: source SHA-256/name, crop, sampling parameters, and each
  output's decoded index, source PTS, and time elapsed since the first frame.

`--window` uses **source PTS seconds**, not nominal-fps frame arithmetic or time
relative to zero. Read the first timestamp when the stream has a nonzero start.
Overview targets choose the nearest existing frame (earlier frame on a tie),
deduplicate repeats, and include the first/last eligible frames. `--every N`
counts from the first frame inside the window; it does not resample to CFR.
Dense extraction is capped at 256 frames: narrow the window or increase N.

The contact sheet is for navigation, not measurement. Derive crop coordinates
from the native frame; letterboxed thumbnail coordinates include padding. Do not
estimate a fast transition's duration from widely spaced overview frames.

Limits: the helper scans/decodes the clip and is intended for short reference
videos. It rejects rotated or non-square-pixel sources rather than silently
changing coordinates. Normalize a working copy explicitly and retain provenance
if needed. It does not infer easing, recover input events, score fidelity, or
prove a source framework. Decode timestamps are ffprobe's best-effort PTS;
missing/non-monotonic timestamps fail rather than falling back to nominal fps.
