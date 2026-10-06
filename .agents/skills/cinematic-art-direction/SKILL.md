---
name: cinematic-art-direction
description: Plan, build, modify, and visually review major visual scenes in the DJS ISACA — THE HUNT website. Use for cinematic scene composition, lighting, atmosphere, camera choreography, and visual-quality decisions; exclude nonvisual maintenance and architecture-only scaffolding.
---

# Cinematic Art Direction

Make this website feel like a premium cinematic interactive experience. Its visual language is supernatural road trip, occult noir, vintage investigation, and grounded physical spaces. A functional scene is not automatically a visually successful scene.

Apply this guidance to the assigned scene. Inspect its existing implementation and dependencies before making decisions, preserve stable neighboring scenes, and follow the project's architectural and performance constraints. This skill does not authorize an unrelated redesign or asset acquisition. Explicit requests for primitive architecture scaffolding take precedence; do not treat a scaffold as finished art.

## Before implementing a scene

Write a concise scene brief that establishes:

1. **Emotional purpose:** What should the visitor feel, and how does this scene advance the investigation?
2. **Depth layers:** Identify the foreground occluder, midground subject, and background environment. Describe their relative scale and separation.
3. **Motivated light:** Define one primary light source, its physical origin, direction, softness, and falloff. Any fill or reflected light must support that source rather than illuminate every object equally.
4. **Camera:** Define height, focal length or FOV, target, and the scroll-driven movement. Use believable perspective and a deliberate path rather than reactive steering.
5. **Atmosphere:** Choose fog, dust, or volumetric-looking layers only where they explain depth or light. Prefer lightweight techniques that preserve the composition.
6. **Color temperature:** Define the dominant temperature and any restrained contrasting accent.
7. **Stillness:** State what must remain visually still while scrolling. Movement needs narrative or physical motivation.
8. **Hero element:** Choose exactly one hero visual element. Supporting scenery, typography, and effects must not compete with it.

Resolve these choices before adding detail or effects. Keep the brief proportional to the task; it is an implementation guide, not an approval request.

## Visual standards

For every major 3D scene, require:

- **Foreground occlusion** that establishes the camera's position in the world without hiding essential content.
- **Atmospheric perspective** that separates near, middle, and distant forms through contrast, tone, and detail.
- **Selective contrast** concentrated around the hero element; allow supporting areas to fall into shadow.
- **Restrained motion** with motivated timing and easing. Scrolling must not turn the scene into an arcade environment.
- **Proper hierarchy** with one clear focal point and legible supporting information.
- **Editorial typography** integrated into the composition with intentional scale, placement, and negative space. Keep essential text in semantic HTML.
- **Physically believable scale** for objects, light, road markings, environment spacing, and camera height.

Preserve a coherent mobile and reduced-motion composition, not just a disabled effect. Keep the single persistent canvas, capped DPR, and accessible navigation. Reuse geometry and materials, instance repeated objects, and avoid expensive effects when a simpler technique achieves the visual intent.

## Avoid

- Primitive low-poly assets presented as final scene art.
- Generic glowing gradients, excessive red, and random particles.
- Centered giant text over everything.
- Generic glassmorphism and game-like environments.
- Identical lighting across objects or flat ambient lighting.
- Arbitrary camera wobble.

## Visual-quality review

Run the site in a browser and inspect screenshots at the scene's entry, key reveal, and exit. Check desktop, mobile, and reduced-motion paths. Review the transition with adjacent scenes without redesigning them.

Judge the actual rendered frames against the brief: emotional purpose, depth separation, motivated lighting, hero hierarchy, believable scale, typography legibility, and restrained motion. Look for flat silhouettes, repeated asset patterns, implausible perspective, effects obscuring the subject, and atmosphere that merely coats everything equally.

Fix concrete visual failures within the assigned scope and inspect again. Never approve a scene solely because it functions or passes a build. If browser inspection is unavailable or visual problems remain, report that limitation and do not claim visual approval.

After significant implementation changes, run `npm run build`, fix TypeScript/build errors, and inspect browser console errors. Report what changed, what was actually verified, and any remaining visual-quality limitations. Technical validation and visual review are separate requirements.
