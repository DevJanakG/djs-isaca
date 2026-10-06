---
name: visual-qa
description: Inspect and improve the rendered visual quality of major scenes in the DJS ISACA — THE HUNT website after implementation. Use for browser-based composition, lighting, typography, motion, and responsive review against the approved creative brief.
---

# Visual QA

Use after implementing any major scene. Build success proves technical compilation, not visual quality. Never say "done" merely because the build succeeds.

## Workflow

1. Run the local site and open the assigned scene in a browser. Use the approved creative brief as the review baseline; do not invent approval or change the requested direction.
2. Inspect the scene at desktop **1920×1080**, laptop **1440×900**, and mobile approximately **390×844**.
3. Capture screenshots when browser tooling permits. For scroll-driven scenes, inspect entry, key reveals, and exit, and watch the motion between those frames. Include reduced-motion behavior and the transition to neighboring scenes.
4. Check composition, typography hierarchy, lighting, depth, contrast, perspective, spacing, animation timing, clipping, responsiveness, visible placeholder geometry, and generic AI aesthetics.
5. Compare the rendered result with the approved brief. Confirm the intended focal point, emotional tone, depth layers, camera framing, and timing are actually visible, not merely represented in code.
6. Fix obvious visual defects within the assigned scene's scope before reporting completion, then inspect the affected views again. Preserve stable neighboring scenes and shared architecture unless changes are explicitly authorized or technically required.
7. Report the viewports and scene states actually inspected, screenshots captured, defects corrected, and remaining limitations. Include runtime console findings and required build validation, separately from the visual-quality judgment.

If browser inspection is unavailable, disclose it and identify which checks could not be performed. Do not substitute code inspection or automated assertions for a visual-quality review, and do not claim an unreviewed scene is visually approved. If a final scene still visibly contains placeholder geometry or fails the approved brief, report it as incomplete.
