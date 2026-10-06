# S01 final QA — 7 October 2026

Result: passed. No implementation changes or redesign were needed.

Inspected browser frames and full muted/enabled playback at 1920×1080,
1440×900, and 390×844. Reduced motion was checked at both 1440×900 and
390×844. Mobile checks used Chromium device emulation, not physical devices.

| Check | Result / evidence |
| --- | --- |
| S00 exit and S01 entry | S00's full-viewport matte reaches opacity 1 with #000 background before automatic entry. S01's 0.1s screenshot is entirely RGB 0,0,0 in every configuration. |
| Black hold | 0–0.25s is empty black and silent, followed by a restrained emergence. |
| Smoke and ghost seal | Smoke stays subordinate; the ghost is faint, broken, and briefly disappears before the strike. |
| First strike | Abrupt exposure, seal reveal, narrow shear, and immediate black cut contrast sharply with the ghost. |
| Imperfect construction | Mixed completed and incomplete path offsets at 1.225s; stepped drawing and brief disappearing sections are visible. |
| Impact and title hit | Title opacity is 0 at 1.599s and 1 at 1.601s. Scale/blur settle separately; there is no slow opacity fade. The impact cue shares the 1.60s timeline position. |
| Readability | Desktop/laptop and mobile titles fit and remain legible during the hold. Mobile retains black negative space. |
| Quiet hold | No shear, exposure failure, or title/seal translation at 2.06s and 2.64s; only smoke and the tiny finite seal flicker remain. |
| Final interference | One 145ms shear burst; exposure spike lasts 25ms and vertical slip lasts 65ms. All disturbance layers are off at 2.796s. |
| Final blackout | Every pixel is RGB 0,0,0 at 3.55s in all five configurations. No residual smoke, grain, seal, or typography. |
| S02 cue | Warm #d8b16b line and low haze emerge from absolute bottom center at 3.65s. Handoff retains a 3px line with the shutter closed. |
| Audio state | Zero S01 play calls while global audio is muted. Enabling through S00 produces exactly three accepted cue plays, at .18/.32/.40 volume. Observed cue gaps are within 25ms of the prescribed .50s and .70s. |
| Motion preference | Reduced motion removes flashes, tearing, jitter, blur, scale travel, and dash flicker while retaining the 4.1s sequence. |
| Playback lifecycle | One master timeline, zero S01 canvases. Scroll input is held; hidden-tab pause preserves timeline position; completion releases control and emits the closed-shutter handoff. |
| Console/assets | No browser console, runtime, or asset-load errors in any run. |
| Scope | S00, Story, and World file hashes match their pre-QA hashes. S00 visual/timing files match Git HEAD; its previously approved global-audio hook integration remains. S02 remains an existing placeholder, with no bunker/shutter-opening implementation. |
| Build | npm run build and npm run lint passed. The existing bundle-size advisory remains. |

Browser artifacts and measurements are saved under `/tmp/hunt-browser/final-*`,
including `final-s01-qa.json`. Audio verification measures browser play requests
and acceptance; hardware output latency and physical-device playback were not tested.
