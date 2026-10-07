# S02 bunker opening

The approved curtain, rails, housing, textures and room plate remain the scene's
composition. The curtain is the foreground occluder; the table is the revealed
subject; the board, shelves and lamps supply depth. Tungsten light originates
inside the bunker and spills beneath the moving metal edge. The initial frame
keeps S01's bottom-centered 65vw, 3px, #d8b16b line at 0.65 opacity against black.

`createShutterTimeline.ts` owns one six-second GSAP master, with no ScrollTrigger
or scroll-progress binding. The existing scroll provider locks input until the
master finishes. S01's `hunt:s01-complete` event requests playback; assets decode
ahead of entry, and `hunt:s02-ready` releases S01's retained handoff only after
S02's initial frame is initialized. Direct navigation to S02 uses the same
sequence. React rerenders and passage into S03 do not reconstruct the master.

| Time | Action |
| --- | --- |
| 0–0.25s | Black hold and inherited tungsten line |
| 0.25s | Latch cue, 4px release, 2px settlement; restrained rail vibration |
| 0.45–0.90s | Motor and low groan; subpixel curtain vibration; seam brightens |
| 0.90–1.30s | First 7% opening, exposure and clipped light/dust emerge |
| 1.30–3.60s | Continuous 7–78% travel using an integrated industrial velocity curve |
| 3.60–4.20s | Resistance and deceleration; groan gains prominence |
| 4.20–4.38s | One 3px stop jerk and settlement; mechanical audio fades out |
| 4.38–4.70s | Still room, no visible text or UI |
| 4.70–5.80s | Room scale 1–1.025, y 0 to -0.5vh; frame scale 1–1.01 |
| 5.60–6.00s | Looping bunker hum fades to 0.12 volume |

The physical stop leaves 3px of bottom edge beneath the approved 9vh housing.
This yields roughly 90–91% viewport travel instead of hiding the entire edge
at precisely 93%. The room image remains opaque throughout: moving metal
occludes it while a separate black exposure overlay and contrast change the
visible light. Dust is clipped below the moving edge. Reduced motion omits
jolts, vibration, dust travel and the camera step while preserving reveal timing.

## S03 contract

Completion emits `hunt:s02-complete` with `{ duration: 6, nextScene: 'S03',
bunkerReady: true, surface, image }`, followed by `hunt:bunker-ready` with
`{ scene: 'S03', surface }`. The fixed stage and the actual image DOM node stay
mounted, with their completed transforms. The room remains in place while the
visitor proceeds into S03; completion itself does not force another scroll.
S03's existing semantic content can appear above the retained background.
S03 should use this surface rather than mount a replacement image or canvas.

The hum controller remains mounted across S02/S03. Completion only stops the
mechanical tracks. Global mute pauses the hum; unmute resumes it without
replaying old mechanical cues. Tab hiding pauses timeline/audio and resumes
from the same position. Leaving the bunker scenes pauses ambience. The sound
control is available to keyboard/screen-reader users during playback, visually
concealed until focused or until completion.

## Verification

Browser QA covers 1920×1080, 1440×900, 390×844 and mobile reduced motion.
Actual playback measures approximately six seconds, one readiness event,
blocked wheel scrolling, correctly timed audio requests, zero S02 playback
requests when muted, and continued hum in S03. Exact-frame captures check the
7% and 78% openings, release/stop offsets, exposure, dust clipping, still hold,
and final camera framing. The image's DOM identity, transform and bounds match
before and after entry into S03. Hidden-tab pause/resume is exercised separately.
Screenshots and measurements are under `/tmp/hunt-browser/s02-*`.
Audio validation checks browser playback and volume state; it does not constitute
a listening review of the supplied recordings.
