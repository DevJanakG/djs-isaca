import gsap from 'gsap'

/** Add finite cuts to the supplied master. These helpers never create a timeline. */
export function createStingDisturbances(root: HTMLElement, timeline: gsap.core.Timeline, reducedMotion: boolean, maxTranslation = 5) {
  const select = gsap.utils.selector(root)
  const shear = select('.s01-shear')
  const bands = select('.s01-shear-band')
  const titleCopies = select('.s01-title-copy, .s01-presenter-copy')
  const flash = select('.s01-flash')
  const blackout = select('.s01-failure-black')
  const title = select('.s01-title')
  const seal = select('.s01-seal')

  return {
    // A: Only the clipped duplicate bands move; the base image stays intact.
    horizontalShear(at: number, { duration = .075, strength = 5, showTitle = false } = {}) {
      if (reducedMotion) return
      const displacement = Math.min(5, maxTranslation, Math.abs(strength))
      const first = [-1, .6, -.8]
      const second = [.6, -1, .4]
      timeline.set(shear, { autoAlpha: 1 }, at)
        .set(titleCopies, { autoAlpha: showTitle ? 1 : 0 }, at)
        .set(bands, { autoAlpha: 1, x: (index: number) => first[index] * displacement }, at)
        .set(bands, { x: (index: number) => second[index] * displacement }, at + duration * .45)
        .set(shear, { autoAlpha: 0 }, at + duration)
        .set(bands, { autoAlpha: 0, x: 0 }, at + duration)
    },

    // B: Exposure cuts to an opaque black frame, then cuts back. No fade.
    brightnessFailure(at: number, { exposure = .38, spikeDuration = .05, blackoutDuration = .025 } = {}) {
      if (reducedMotion) return
      const cut = at + spikeDuration
      timeline.set(flash, { autoAlpha: Math.min(1, Math.max(0, exposure)) }, at)
        .set(flash, { autoAlpha: 0 }, cut)
        .set(blackout, { autoAlpha: 1 }, cut)
        .set(blackout, { autoAlpha: 0 }, cut + blackoutDuration)
    },

    // C: Opposite 2–4px vertical slips. Always settle in less than 80ms.
    verticalSyncFailure(at: number, { displacement = 3, duration = .065 } = {}) {
      if (reducedMotion) return
      const offset = Math.min(4, maxTranslation, Math.max(2, Math.abs(displacement)))
      const seconds = Math.min(.079, Math.max(.001, duration))
      timeline.set(title, { y: offset }, at)
        .set(seal, { y: -offset }, at)
        .set(title, { y: -2 }, at + seconds * .5)
        .set(seal, { y: 2 }, at + seconds * .5)
        .set(title, { y: 0 }, at + seconds)
        .set(seal, { y: 0 }, at + seconds)
    },
  }
}
