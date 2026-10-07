# S02 bunker opening

The approved curtain, rails, housing, textures and room plate remain the scene's
composition. The curtain is the foreground occluder; the table is the revealed
subject; the board, shelves and lamps supply depth. Tungsten light originates
inside the bunker and spills beneath the moving metal edge. The initial frame
keeps S01's bottom-centered 65vw, 3px, #d8b16b line at 0.65 opacity against black.

`createShutterTimeline.ts` owns one GSAP master (six seconds desktop, five seconds
mobile, 1.2 seconds reduced motion), with no ScrollTrigger
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
| 5.60–6.00s | Looping bunker hum fades to 0.10 volume |

The physical stop leaves 3px of bottom edge beneath the approved 9vh housing.
This yields roughly 90–91% viewport travel instead of hiding the entire edge
at precisely 93%. The room image remains opaque throughout: moving metal
occludes it while a separate black exposure overlay and contrast change the
visible light. Dust is clipped below the moving edge. Reduced motion omits
jolts, vibration, dust travel and the camera step using the short reveal below.

## Mobile adaptation

At 390×844, centered `object-position: 50% 58%` keeps the investigation desktop,
map, journal and watch in view while peripheral board/shelves crop naturally.
Mobile renders 13 equal-height slats with continuous texture sampling, 22px
rails, an 8svh housing and only seven dust nodes. There is no page overflow.
The room push ends at scale 1.015 / y -0.3vh; foreground scale ends at 1.006.
Reduced motion overrides this profile with the short reveal below.

Only the main loaded travel is shortened, from 2.3s to 1.3s. The same paused
master is retimed before its first frame, including audio callbacks and labels;
its mobile/desktop timing profile is captured on entry and never rebuilt during
playback or handoff. Latch (0.25s), motor/groan (0.45s), first opening (0.90s)
and main opening start (1.30s) retain desktop timing. The remaining phases keep
their durations and sequence, beginning one second earlier after main travel:

| Mobile time | Action |
| --- | --- |
| 1.30–2.60s | Main opening to 78% |
| 2.60–3.20s | Resistance to calibrated mobile stop |
| 3.20–3.38s | Stop jerk; mechanical sound fade and stop |
| 3.38–3.70s | Quiet room hold |
| 3.70–4.80s | Subtle camera entry |
| 4.60–5.00s | Consent-gated hum fade |
| 5.00s | Publish ready state for S03 |

Audio remains synchronized to the same physical actions, with the same gains,
consent checks and ambience lifetime. The completed mobile transform/exposure
stays on the original image nodes through S03. Browser playback at 390×844 was
checked with audio enabled and muted: approximately 5.00s,
one master, correctly timed cues, seven motes, no horizontal overflow or console
errors. Thirty rendered handoff frames per run retained identical image/room
bounds, transforms and exposure, with the enabled hum continuing. Desktop
1920×1080 and 1440×900 retain six-second timing and desktop framing. Captures:
`/tmp/hunt-browser/mobile-s02-*`.

## Reduced motion

`prefers-reduced-motion: reduce` selects a dedicated branch of the same master
on desktop and mobile, before any normal choreography is scheduled. It holds
S01's almost-black/tungsten state for 250ms, then raises and fades the shutter
over 800ms while exposure reaches the same final 0.025 and contrast 1.025.
There are no jolts, rail movements, loaded-travel oscillations or camera tweens.
The existing reduced-motion CSS makes motes stationary (`animation: none`).

At 1.05s the mechanical tracks stop and the consent-gated hum starts its 150ms
fade. At 1.20s the same completion callback releases scroll input and publishes
the ready bunker surface for S03. Room/image nodes remain mounted without
reapplying styles or moving the camera. The existing S03 semantic content and
navigation remain available; reduced motion never removes bunker content.
Mute/consent behavior remains unchanged.
Desktop 1920×1080, laptop 1440×900 and mobile 390×844 browser checks verify the
1.2-second master, zero shutter jitter/vibration, stationary rails/room, no dust
animations, visible S03 heading and unchanged background over 30 handoff frames.
Enabled mobile audio cues fire once; muted runs play none. Exact-frame captures
at 0.10, 0.65 and 1.05 seconds were visually reviewed. Normal desktop/mobile
still complete in six/five seconds. Captures: `/tmp/hunt-browser/reduced-*`.

Dust uses 16 fixed DOM motes (7 on mobile), sized 1.8–3px with a warm-grey
color and subtle blur. Independent CSS drift loops last 8–18 seconds, moving
only 3–8px sideways and 12–24px upward per cycle. Fades hide each loop reset.
A feathered central light mask excludes dark corners; the shutter-driven clip
expands the illuminated vertical region. Hidden scenes/tabs pause drift, and
reduced motion renders stationary motes. No particle canvas or extra GSAP
timeline is used.

During loaded travel only (1.30–4.20s), a clock inside the same master drives
bounded rigid-metal vibration (at most 0.8px vertically) and four short lateral
load pulses (0.25–0.35px). Both taper to zero before the stop. Curtain and lower
edge share these offsets; rails and camera do not. Reduced motion omits them.
The lower edge gains a feathered tungsten reflection while its downward shadow
changes gently with the opening, then remains still during the room hold.

## S03 contract

`App` mounts the bunker stage independently of the story sections. The reusable
`components/bunker/BunkerBackground.tsx` image/exposure surface is rendered once
inside that stage, never once per scene. S03 imports `useBunkerBackground` from
`components/bunker/bunkerBackgroundState.ts` and waits for `phase === 'ready'`.
The hook exposes the existing `surface`, `room` and `image` nodes, plus a
`finalVisual` snapshot of their completed transforms, filter, exposure, dust,
spill and shutter opening. `getBunkerBackgroundState()` provides the same state
to non-React consumers or consumers mounted after the completion event. This
snapshot is informational: do not reapply it or render a replacement image.
The owning timeline and ambience controller survive passage into S03.

Completion emits `hunt:s02-complete` with `{ duration, nextScene: 'S03',
bunkerReady: true, surface, image, background }`, followed by `hunt:bunker-ready`
with `{ scene: 'S03', surface, background }`. Both include the published ready
state. The fixed stage and the actual image DOM node stay
mounted, with their completed transforms. The room remains in place while the
visitor proceeds into S03; completion itself does not force another scroll.
S03's existing semantic content can appear above the retained background.
S03 should use this surface rather than mount a replacement image or canvas.
The event duration is the actual master duration: 6 desktop, 5 mobile, or 1.2
with reduced motion.

The hum controller remains mounted across S02/S03. Completion only stops the
mechanical tracks. Global mute pauses the hum; unmute resumes it without
replaying old mechanical cues. Tab hiding pauses timeline/audio and resumes
from the same position. Leaving the bunker scenes pauses ambience. The sound
control is available to keyboard/screen-reader users during playback, visually
concealed until focused or until completion.

Shared audio defaults to off until the visitor enables it with a sound-control
gesture. S02 never changes that state to on. Latch/motor start at 0.35, the
supporting groan starts at 0.12 and rises to 0.16 during resistance, while the
motor remains louder at 0.30. Mechanical tracks fade out at the stop. At these
settings, their combined gain stays below unity even for coincident full-scale
sources. The 0.10 hum begins after mechanics have stopped. Pending-play guards
prevent repeated requests on the same element; late promises cannot resurrect
mechanical sounds after stop or mute.

Consent-enabled desktop/laptop browser runs request each S02 cue exactly once,
retain hum playback in S03 and pass mute/unmute checks. Mobile/reduced-motion
runs without consent request no audio at all and still complete the reveal.
FFmpeg analysis of decoded MP3 sample peaks gives a conservative simultaneous
mechanical mix bound of 0.807 at the selected gains, including the groan file's
decoded overshoot above unity. This checks gain headroom, not subjective mixing.

## Future S03 anchors

`bunkerAnchors.ts` exports ten named positions in normalized original-image
coordinates. `BunkerAnchors` aligns their plane with the plate's cover crop and
object position on resize, inside the existing camera transform. Anchors remain
non-interactive and invisible normally; only `?debug=true` renders crosshairs and
names. Mobile retains the same image positions, including anchors outside its
crop. S03 can import the configuration without replacing the S02 room surface.
Normal mode, `?debug=1`, desktop/laptop/mobile debug mode and reduced motion were
checked: ten anchors, no interactive elements, no page overflow or browser errors.

## Verification

Browser QA covers 1920×1080, 1440×900, 390×844 and mobile reduced motion.
Actual playback measures approximately six seconds, one readiness event,
blocked wheel scrolling, correctly timed audio requests, zero S02 playback
requests when muted, and continued hum in S03. Exact-frame captures check the
7% and 78% openings, release/stop offsets, exposure, dust clipping, still hold,
and final camera framing. The image's DOM identity, transform and bounds match
before and after entry into S03. Hidden-tab pause/resume is exercised separately.
Screenshots and measurements are under `/tmp/hunt-browser/s02-*`.
The persistent-background handoff check samples every animation frame across
completion and S03 entry (54–69 frames per run). Desktop, laptop, mobile,
reduced motion and synchronous completion-callback navigation retain identical
image/room nodes, bounds, transforms, exposure, dust and spill values, with one
readiness event and one rendered bunker image. Consent-enabled runs retain the
same playing hum at 0.10; muted runs request no audio. Screenshots are under
`/tmp/hunt-browser/handoff-*`.
Audio validation checks browser playback and volume state; it does not constitute
a listening review of the supplied recordings.
