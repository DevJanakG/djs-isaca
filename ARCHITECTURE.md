# Scroll architecture scaffold

This is a functional placeholder scaffold, without final art or event facts.

- `src/data/scenes.ts` is the canonical scene registry: identifiers, titles, descriptions and contiguous normalized ranges. The requested S06 Timeline / S07 Encounter / S08 Judges / S09 Sponsors order takes precedence over PROJECT_SPEC.md; its percentage boundaries are retained.
- `Story` renders semantic, anchor-addressable DOM sections above the fixed WebGL layer. Section heights are proportional to their ranges across 2000vh of travel. A final 100vh tail compensates for viewport height, so ScrollTrigger's `bottom bottom` endpoint matches the registry. Change the travel multiplier with care.
- `ScrollProvider` owns one ScrollTrigger for the story. It publishes global progress and the active scene through context and a mutable progress ref. Local progress is `clamp((global - start) / (end - start), 0, 1)`. Exact boundaries belong to the next scene; 1 belongs to S10 with local progress 1.
- Desktop Lenis runs from GSAP's ticker and updates ScrollTrigger. Listeners, triggers and ticker callbacks are removed on cleanup, including React StrictMode remounts.
- `World` is a lazy-loaded, persistent Canvas with capped DPR and demand rendering. Its paused GSAP camera timeline is sampled using the shared scroll progress. Drei primitives provide foreground, subject and background placeholders. No assets or postprocessing are used.
- Mobile (below 768px) and reduced-motion modes use native scrolling and a static DOM fallback. Preference changes are observed at runtime. Reduced motion also disables Motion hover movement. Failed/unavailable WebGL retains the complete semantic story.
- Motion handles only the next-link hover. Camera motion remains in GSAP.
- `DevelopmentHud` appears only in Vite development mode; it displays global progress, scene, local progress and rendering mode.
- `event.ts` holds organizer-editable information. The registration CTA becomes a link when an official Unstop URL is supplied; no invented URL or form is provided.

Run `npm run dev`, `npm run build`, and `npm run lint`. No audio, backend, final artwork or unrelated interactions are included.
