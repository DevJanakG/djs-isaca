# S02 desktop framing review

The tungsten-lit investigation table remains the subject. The case board on
the left and archive shelves/radio on the right establish the room's depth;
the rigid shutter, rails and housing frame the reveal. Lighting and the
six-second master remain unchanged. Review covers the closed hold (0.10s),
main opening (2.45s), room hold (4.50s) and final camera step (5.80s).

| Viewport | Review and adjustment |
| --- | --- |
| 1920×1080 | Retained framing. Table objects, case board, radio and glass display remain readable. |
| 1440×900 | Plate starts 12px behind the housing's lower edge to reduce horizontal cover cropping. Previously clipped right-hand glass display now fits. Table and investigation board retain their hierarchy. |
| 1366×768 | Retained framing. Table stays central; board and shelves/radio remain visible. |

The desktop adjustment applies only at aspect ratios at or below 17:10 and
widths of at least 768px. It is established before playback and persists in
S03; it is not a completion-time reposition. Cover fit preserves the plate's
aspect ratio and fills the aperture without empty bands. Normal peripheral
cover cropping remains, but the reviewed tabletop objects, radio and display
are retained.

Housing remains 9svh (approximately 97, 81 and 69px at the requested sizes).
Sixteen slats remain equal-height (approximately 67, 56 and 48px). Rails stay
on the viewport perimeter, including the existing subtle foreground step.
Frame material uses one non-repeating cover texture per surface; each rail
samples a different horizontal region. Slats continue to sample successive
strips of one texture rather than repeat the whole texture on every slat.

Desktop screenshots were visually inspected before and after the changes.
390×844 mobile and reduced-motion captures were also reviewed for regressions.
One six-second master remains; browser checks found no console errors or page
overflow. Build and lint pass, with the existing Vite bundle-size warning.
Captures and geometry are in `/tmp/hunt-browser/desktop-before-*` and
`/tmp/hunt-browser/desktop-after-*`.
