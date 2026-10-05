# DJS ISACA - THE HUNT: Agent Rules

## Mission
Build a premium, cinematic, supernatural-hunter-noir hackathon event website. The experience should feel like an interactive investigation/road-trip title sequence, not a normal event landing page and not a Halloween template.

## Architectural invariants
1. React + TypeScript + Vite.
2. Prefer one fixed global React Three Fiber canvas; do not create a WebGL canvas per section.
3. Use GSAP ScrollTrigger for macro scroll choreography and camera timelines.
4. Use Lenis for smooth scrolling only when it remains accessible/stable.
5. Use Motion/CSS for DOM microinteractions; do not make the main camera choreography depend on Motion.
6. Essential text/information must be semantic HTML, not baked into images or WebGL text.
7. Every scene must have a mobile/reduced-effects path.
8. Respect `prefers-reduced-motion`.
9. Audio never autoplays; always provide mute/unmute control.
10. Never introduce backend/database/auth unless explicitly requested.

## Visual invariants
- Visual language: occult noir + vintage detective + road trip + aged case files + tungsten bunker lighting.
- Avoid generic SaaS cards, glassmorphism, neon cyberpunk, giant rounded rectangles, gradient-blob backgrounds, random particle spam, cheesy Halloween clipart.
- Red is an accent, not the entire color palette.
- Each scene needs foreground, subject and background depth.
- Typography hierarchy is more important than adding another effect.
- Motion should be cinematic, motivated and eased; avoid constant-speed floating.

## Workflow
- Work scene-by-scene.
- Do not redesign stable scenes when assigned to one scene.
- Before modifying a complex scene, inspect current code and dependencies.
- For visual changes, use the browser and screenshots. Do not claim visual success from code inspection alone.
- After significant changes run `npm run build`.
- Fix console errors before adding features.
- Prefer a working simple technique over a fragile impressive technique.

## Performance
- Keep asset sizes small.
- Prefer 1K/2K textures for web.
- Lazy-load later scenes/assets.
- Cap WebGL DPR on high-DPI/mobile devices.
- Minimize dynamic lights and expensive post-processing.
- Use instancing/reuse for repeated meshes.
- Do not add a heavy dependency for an effect that CSS/SVG can implement cleanly.

## Copyright / branding
Create an original supernatural hunter-noir experience inspired by the genre. Do not ship copyrighted Supernatural footage, soundtrack, logos, actor likenesses, exact proprietary graphics or an exact Impala replica asset without permission. Use generic/original equivalents.

## Acceptance for every task
- No TypeScript/build errors.
- No obvious browser console errors.
- Desktop and mobile checked.
- Existing navigation/content remains functional.
- State what changed and what was actually verified.
