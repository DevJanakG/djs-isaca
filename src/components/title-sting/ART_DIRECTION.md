# S01 — final title sting

The approved static composition plays through one GSAP timeline lasting exactly
4.1 seconds. Its clock is independent of scroll progress. No Three.js, canvas,
CSS animation, additional animation library, or nested authored timeline is used.

The emotional purpose is a sudden, hostile identification of the investigation.
The title is the single hero element. A worn warm-silver seal occupies 42svh
behind it, against nearly invisible smoke and absolute black. Grain and
interference sit in the foreground, with a vignette extinguishing the edges.
Full-screen grain uses a seamless, fine monochrome 256px SVG noise tile at
3.2% opacity with soft-light blending and no pointer events. A single high
frequency octave avoids cloudy texture; opaque grayscale noise preserves
neutral colour. The tile never translates, cycles, or animates. Only the
master timeline reveals and extinguishes it, preserving both true-black holds.
Grain QA covered 1920×1080, 1440×900, 390×844, and reduced motion at 1440×900.
Hold, exit, black, and cue frames showed full viewport coverage, no spatial
animation, and no console errors. Grain-on/off comparisons changed channels
by at most 2/255; final-black pixels remained exactly zero in every channel.
Light is limited to dull silver ink; there is no glow or depicted light source.
The view is frontal and centered. Smoke drifts organically; brief horizontal
cuts interrupt the drawing. The hold remains still except for smoke and one
tiny seal flicker. No camera or parallax exists.

Cormorant Garamond 600 forms a severe, horizontal episode wordmark: 9.2vw type,
92% horizontal and 90% vertical proportions, tighter −.045em tracking, and a
fine .004em ink stroke for heavier perceived weight. Warm off-white #e6e0d3
concentrates contrast on the title; no text shadows or luminous relief are used.
Mobile uses 18.5vw type. Interference copies share every typographic rule.
Browser measurements at the settled hold are 757.5px at 1920×1080 and 567.9px
at 1440×900 (39.4–39.5vw), including reduced motion. At 390×844 the wordmark
is 315.9px wide with no clipping. Impact, hold, tear, exit, black, and shutter
cue frames were captured at all four configurations with no console errors.
The small presenter sits just above the title. The existing
local font files are reused without changing S00. The original SVG loads inline
from `/s01/symbols/seal.svg`, preserving individually addressable groups and paths.
CSS masks add subtle worn ink, while a converted WebP supplies the smoke.

All effect targets have `data-sting-layer` attributes and CSS opacity zero and
visibility hidden before playback. The black base remains opaque. A scoped
GSAP context cleans up every tween when leaving the scene. Path lengths are
measured once before playback; dash drawing uses stepped easing and irregular
opacity cuts rather than continuous, perfect tracing.

| Time | Beat |
| --- | --- |
| 0–0.25 | Absolute black and silence, including the sound control |
| 0.25–0.65 | Very faint smoke emergence, scale 1.08 to 1.03 |
| 0.40 | Quiet reverse whoosh, when global audio is enabled |
| 0.55–0.825 | Ghost seal: 0.10, 0.03, 0.18, then zero |
| 0.90–0.975 | Electrical hit, desaturated flash, sudden seal, smoke lift, horizontal tear |
| 1.00–1.53 | Fractured stroke construction: rings, major geometry, secondary geometry, markings |
| 1.475–1.540 | Small synchronization failure, opposite 3px vertical slips |
| 1.60–1.75 | Bass hit; title cuts to full opacity and settles scale/blur; 50ms grey flash |
| 1.72–2.05 | Presenter reveal |
| 2.05–2.65 | Quiet hold; smoke drift, one tiny seal flicker, static grain |
| 2.65–2.80 | Clipped horizontal shear, opposite vertical slips, desaturated spike and hard blackout |
| 2.80–3.20 | Seal strokes and opacity vanish first |
| 2.80–3.35 | Smoke contracts and disappears |
| 3.15–3.45 | Title dims, compresses, blurs, and disappears |
| 3.45–3.65 | Absolute black; all sound is stopped |
| 3.65–4.10 | Bottom-center warm line grows 15vw to 65vw and 1px to 3px; faint haze |

## Entry, sound, and handoff

### Reusable scripted disturbances

`createStingDisturbances(root, master, reducedMotion)` exposes three helpers in
`disturbances.ts`. Every helper adds immediate sets to the supplied master;
none creates a timeline, starts an independent clock, repeats, or uses randomness.
All three do nothing when reduced motion is requested.

- **A — horizontalShear:** Three full-size decorative copies are clipped into
  narrow horizontal bands. Only those bands shift; their displacement is capped
  at ±5px. Copies omit SVG IDs and are hidden from assistive technology. The
  real seal remains the only named path construction. `showTitle` controls whether
  the copied lettering is included.
- **B — brightnessFailure:** A desaturated exposure frame cuts directly to an
  opaque black overlay, then directly back to the scene. Both transitions are
  zero-duration sets. Exposure strength and spike/blackout lengths are parameters.
- **C — verticalSyncFailure:** The actual title slips vertically 2–4px while
  the real seal moves in the opposite direction. It reverses once and settles
  to zero after 65ms by default; caller durations are capped below 80ms.

The explicit cue list at the bottom of `createTitleStingTimeline.ts` schedules
A+B at 0.90, C at 1.475, B at 1.60, A at 2.65, B at 2.665, and C at 2.705.
There are no disturbance cues during the 2.05–2.65 hold. No chromatic separation
or rainbow effect is used. The master remains exactly 4.1 seconds.

Disturbance QA checked desktop, laptop, mobile, and reduced motion: clipped-band
displacement stays within ±5px, brightness spikes cut to opaque black without
a fade, and opposite 2–4px vertical offsets settle within 65ms. All disturbance
layers and offsets are inactive during the hold, after recovery, and throughout
reduced-motion playback. Desktop and mobile disturbance screenshots were
reviewed; the mobile bass-impact blackout was additionally checked at 1.66.
Playback, sound consent, pausing, and S02 handoff still pass without browser
errors. Build and ESLint passed. Additional evidence is in
`/tmp/hunt-browser/sting-disturbances-mobile-qa.json`.

S01 observes S00's existing exit matte without changing S00. Once its computed
opacity is exactly one, S01 crosses the scene boundary automatically. A direct
S01 navigation also starts playback against the black base. The SVG and smoke
are prepared during S00; actual playback waits for image decoding and local fonts.
Scroll input is held during S01, with Lenis stopped and wheel/touch/key input
blocked. Leaving the scene always releases the lock and stops its sounds.
The timeline and any playing cues pause while the document is hidden.

S00 and S01 now subscribe to the same page-wide audio-enabled store; neither
reads the other's DOM. Per the latest brief, audio starts enabled and attempts
audible autoplay. Browser denial switches the shared state off and leaves the
existing sound controls available. Explicit mute persists across scenes.
Audio calls stay on the master timeline. Reverse, electrical, and impact volumes
are .18, .32, and .40. The decoded, scheduled mix peaks at −3.04 dBFS before
the 3.45-second audio cutoff, leaving headroom below clipping.
Each cue is consumed once per S01 entry, even while muted. Rerenders, sound
toggles, and timeline rebuilds cannot repeat it. A real scene re-entry resets
the ledger. Hidden-tab resume continues interrupted audio without seeking to zero.
Audio integration QA passed at 1920×1080 and 390×844 with autoplay permitted,
and at 1440×900 with gesture-required playback. Verified browser rejection,
gesture recovery, shared mute, consumed muted cues, no replay after sound-state
rerenders or reduced-motion timeline rebuilds, fresh cues on scene re-entry,
and stopped/reset tracks at handoff. No browser console errors occurred.

At 4.1 seconds, S01 releases scrolling, emits `hunt:s01-complete` on `window`,
and moves to S02. Event detail is `{ duration: 4.1, nextScene: 'S02',
shutterOpen: false }`. A black handoff surface retains the settled warm line
and haze while S02 owns the scene. A future S02 component can listen for the
completion event, use that closed-shutter cue, then dispatch `hunt:s02-ready`
when it can replace the surface. The shutter is never opened by S01.

Mobile keeps the same centered composition with a 72vw seal (capped by height
in short landscape screens) and approximately 79vw single-line wordmark. Its
initial 1.035 scale keeps the impact within 82vw. The presenter remains .56rem.
There is one smoke image, brightness-only filtering, lower .25 resting opacity,
and smaller expansion. Title blur and the extra seal ink mask are removed.
One clipped shear copy replaces three; both horizontal and vertical disturbance
helpers cap mobile translations at 3px. All cue times and the 4.1-second duration
match desktop, leaving the surrounding black negative space intact. Reduced
motion retains these mobile proportions while disabling disturbances as before.
At 390×844 the seal measures 280.8px (72vw) and the settled title measures
309.1px (79.3vw). Impact, hold, tear, vertical slips, exit, black, and cue frames
passed viewport and translation checks, including mobile reduced motion.
Desktop 1920×1080 and laptop 1440×900 retain their original proportions and
three tear bands. All four browser checks reported no console errors. Reduced
motion keeps the 4.1-second rhythm with no flashes, tearing, jitter, blur,
scale movement, or dash flicker; it uses restrained opacity reveals instead.
S01 mounts no WebGL canvas. S00 and the existing S02 placeholder are preserved.

Smoke visibility revision: broadened the radial mask to 58% × 50% with a 24%
central plateau, removed desktop contrast that crushed smoke detail, and raised
brightness to .72 desktop / .62 mobile. Resting opacity is .32 / .25 with scale
1.12 / 1.09; the impact expands it briefly before collapse. Reduced motion
keeps the larger resting scale fixed. Desktop, laptop, mobile, and reduced-motion
ghost/hold/exit frames were reviewed without console errors. Initial and final
black screenshots remain exactly RGB 0,0,0. Timing and title treatment are unchanged.

## Approved static baseline

Browser screenshots were reviewed at 1920×1080, 1440×900, 390×844, and
1440×900 with reduced motion. Both the fully black initial state and a temporary
QA-only reveal were checked. The title fits without horizontal overflow, the
flash stays hidden, and the smoke remains subordinate to the title and seal.
The initial ink texture was softened after screenshot review to avoid granular
lettering. All eight effect targets start hidden, the seal retains 112 paths,
and the original static S01 contained zero canvas elements and zero running animations. Returning
to S00 restores its title and journal. No browser console or asset-load errors
were observed. Build and ESLint passed; the existing later-scene World bundle
still produces Vite's large-chunk warning. Screenshots and the runtime report
are in `/tmp/hunt-browser/s01-*-composition.png` and `s01-static-qa.json`.

## Sequence verification

The full timeline was inspected at 1920×1080, 1440×900, 390×844, and
1440×900 with reduced motion. Screenshots cover the black holds, ghost seal,
strike, partially drawn seal, title impact, quiet hold, final tear, seal exit,
warm cue, and retained handoff. The hold was also captured during actual
playback at all four sizes. A laptop repaint defect was resolved by removing
the title's tiled SVG mask, limiting persistent compositor hints to smoke,
and clearing the title's blur filter once its impact settles. Grain still
supplies the title's restrained surface texture; the seal retains its ink mask.

Runtime checks confirmed one authored master timeline, duration 4.1 seconds,
zero canvases in S01, true black at 0.1 and 3.55, full title opacity on impact,
complete path construction during the hold, and a settled 3px warm line at
handoff. Wheel input and arrow-key input cannot advance the scene. A simulated
document-visibility change paused the timeline without advancing its clock,
then resumed it. The S02 completion event fired once per playback; the cue
remained closed, and `hunt:s02-ready` successfully released the surface.

With sound off, no S01 audio play calls occurred. After enabling sound in S00,
the browser accepted all three cues in order, at volumes .09, .32, and .52,
with the expected relative timing. Returning to S00 and replaying S01 worked.
No browser console or asset-load errors were observed. Build and ESLint pass;
Vite still reports its chunk-size advisory. Evidence is in
`/tmp/hunt-browser/sting-*.png` and `sting-sequence-qa.json`.
