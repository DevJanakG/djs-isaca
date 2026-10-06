import gsap from 'gsap'
import type { StingCue } from './useStingAudio'
import { createStingDisturbances } from './disturbances'

export const STING_DURATION = 4.1

export function createTitleStingTimeline(root: HTMLElement, options: {
  reducedMotion: boolean
  mobile: boolean
  cue: (name: StingCue) => void
  stopAudio: () => void
  onComplete: () => void
}) {
  const { reducedMotion, mobile, cue, stopAudio, onComplete } = options
  const smokeOpacity = mobile ? .25 : .32
  const smokeScale = mobile ? 1.09 : 1.12
  const blurTitle = !reducedMotion && !mobile
  const select = gsap.utils.selector(root)
  const paths = [...root.querySelectorAll<SVGPathElement>('.s01-seal path')]
  // Measure geometry once, before any frame work starts.
  const lengths = paths.map(path => path.getTotalLength())
  const allVisuals = select('[data-sting-layer], .s01-sound')
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onComplete })
  timeline.data = 'S01-title-sting'
  const disturbances = createStingDisturbances(root, timeline, reducedMotion, mobile ? 3 : 5)

  timeline.addLabel('true-black', 0)
    .set(allVisuals, { autoAlpha: 0 }, 0)
    .set(paths, { opacity: 1, strokeDasharray: 'none', strokeDashoffset: 0 }, 0)
    .set(select('.s01-smoke'), { scale: reducedMotion ? smokeScale : smokeScale + .06, x: 0, y: 0 }, 0)
    .set(select('.s01-seal'), { xPercent: -50, yPercent: -50, x: 0, y: 0, rotation: -7, color: '#9c978d' }, 0)
    .set(select('.s01-title'), { scale: reducedMotion ? 1 : mobile ? 1.035 : 1.08, x: 0, y: 0, color: getComputedStyle(root).getPropertyValue('--title-ink').trim(), filter: blurTitle ? 'blur(8px)' : 'none' }, 0)
    .set(select('.s01-vignette'), { autoAlpha: 1 }, .25)
    .to(select('.s01-smoke'), { autoAlpha: smokeOpacity, scale: smokeScale, duration: .4, ease: 'sine.inOut' }, .25)
    .to(select('.s01-smoke'), { x: reducedMotion ? 0 : mobile ? -2 : -3, y: reducedMotion ? 0 : 2, duration: .8, ease: 'sine.inOut' }, .65)
    .to(select('.s01-sound'), { autoAlpha: .5, duration: .2 }, .25)
    .call(() => cue('reverse'), [], .4)

  if (!reducedMotion) {
    timeline.addLabel('ghost', .55)
      .set(select('.s01-seal'), { autoAlpha: .1 }, .55)
      .set(select('.s01-seal'), { autoAlpha: .03 }, .615)
      .set(select('.s01-seal'), { autoAlpha: .18 }, .705)
      .set(select('.s01-seal'), { autoAlpha: 0 }, .825)
      .addLabel('electrical-strike', .9)
      .set(select('.s01-seal'), { autoAlpha: .9, color: '#dddcd5' }, .9)
      .set(select('.s01-interference'), { autoAlpha: .65 }, .9)
      .set(select('.s01-smoke'), { opacity: mobile ? .42 : .55 }, .9)
      .set(select('.s01-interference'), { autoAlpha: 0 }, .975)
      .set(select('.s01-seal'), { autoAlpha: .12, color: '#9c978d' }, .975)
      .set(select('.s01-smoke'), { opacity: smokeOpacity }, .975)
      .set(paths, { strokeDasharray: (index: number) => `${lengths[index]} ${lengths[index]}`, strokeDashoffset: (index: number) => lengths[index], opacity: 1 }, .99)
  }
  timeline.call(() => cue('electrical'), [], .9)
    .addLabel('construct', 1)

  if (reducedMotion) {
    timeline.to(select('.s01-seal'), { autoAlpha: .48, duration: .4, ease: 'sine.out' }, 1)
  } else {
    const groups = [
      { selector: '#newstar-fractured-outer-ward path, #newstar-inner-ward path', time: 1, duration: .18 },
      { selector: '#newstar-inverted-star path, #newstar-scored-star-edges path', time: 1.13, duration: .16 },
      { selector: '#newstar-broken-star-orbit path, #newstar-heart-ward path, #newstar-secondary-circles path', time: 1.25, duration: .14 },
      { selector: '#newstar-thorn-crown path, #newstar-barbed-vertices path, #newstar-angular-sigils path, #newstar-crosscuts-and-abrasions path', time: 1.37, duration: .1 },
    ]
    timeline.set(select('.s01-seal'), { autoAlpha: .5 }, 1)
    for (const group of groups) {
      const targets = select(group.selector)
      timeline.to(targets, { strokeDashoffset: 0, duration: group.duration, stagger: { amount: .06, from: 'start' }, ease: 'steps(4)' }, group.time)
        .set(targets.filter((_: unknown, index: number) => index % 3 === 0), { opacity: .16 }, group.time + .075)
        .set(targets.filter((_: unknown, index: number) => index % 3 === 0), { opacity: 1 }, group.time + .115)
    }
    timeline.set(select('.s01-seal'), { opacity: .22 }, 1.205)
      .set(select('.s01-seal'), { opacity: .53 }, 1.24)
      .set(select('.s01-seal'), { opacity: .32 }, 1.385)
      .set(select('.s01-seal'), { opacity: .55 }, 1.42)
      .set(select('.s01-interference'), { autoAlpha: .3 }, 1.475)
      .set(select('.s01-interference'), { autoAlpha: 0 }, 1.54)
  }

  timeline.addLabel('bass-impact', 1.6)
    .call(() => cue('impact'), [], 1.6)
    // Opacity cuts to full on the impact; only blur and scale settle afterward.
    .set(select('.s01-title'), { autoAlpha: 1 }, 1.6)
    .to(select('.s01-title'), { scale: 1, filter: blurTitle ? 'blur(0px)' : 'none', duration: .15, ease: 'power3.out' }, 1.6)
    .set(select('.s01-title'), { filter: 'none' }, 1.75)
    .set(select('.s01-seal'), { autoAlpha: reducedMotion ? .48 : .82, color: reducedMotion ? '#9c978d' : '#d0cec5' }, 1.6)
    .to(select('.s01-seal'), { opacity: .48, color: '#9c978d', duration: .32, ease: 'power2.out' }, 1.66)
    .to(select('.s01-presenter'), { autoAlpha: .65, duration: .33, ease: 'sine.out' }, 1.72)
    .to(select('.s01-grain'), { autoAlpha: Number(getComputedStyle(root).getPropertyValue('--grain-opacity')), duration: .15 }, 1.6)
    .addLabel('hold', 2.05)

  if (!reducedMotion) {
    timeline.to(select('.s01-smoke'), { scale: smokeScale + .065, opacity: mobile ? .32 : .4, duration: .2, ease: 'power2.out' }, 1.6)
      .to(select('.s01-smoke'), { scale: smokeScale + .01, x: mobile ? 2 : 4, y: -2, opacity: smokeOpacity, duration: .99, ease: 'sine.inOut' }, 1.81)
      .set(select('.s01-seal'), { opacity: .445 }, 2.32)
      .set(select('.s01-seal'), { opacity: .48 }, 2.37)
      .addLabel('final-interference', 2.65)
      .set(select('.s01-interference'), { autoAlpha: .6 }, 2.65)
      .set(select('.s01-interference'), { autoAlpha: 0 }, 2.795)
  }

  timeline.addLabel('extinguish-seal', 2.8)
    .to(select('.s01-seal'), { autoAlpha: 0, duration: .4, ease: 'power2.in' }, 2.8)
    .to(select('.s01-smoke'), { scale: reducedMotion ? smokeScale : smokeScale - .1, x: 0, y: 0, autoAlpha: 0, duration: .55, ease: 'power2.in' }, 2.8)
    .addLabel('extinguish-title', 3.15)
    .to(select('.s01-title'), { color: '#33312d', autoAlpha: 0, scaleY: reducedMotion ? 1 : .93, filter: blurTitle ? 'blur(3px)' : 'none', duration: .3, ease: 'power3.in' }, 3.15)
    .to(select('.s01-presenter'), { autoAlpha: 0, duration: .18 }, 3.15)
    .to(select('.s01-grain, .s01-sound'), { autoAlpha: 0, duration: .12 }, 3.33)
    .addLabel('final-black', 3.45)
    .set(allVisuals, { autoAlpha: 0 }, 3.45)
    .call(stopAudio, [], 3.45)
    .addLabel('shutter-light', 3.65)
    .set(select('.s01-shutter-line'), { width: '15vw', height: 1, autoAlpha: 0 }, 0)
    .to(select('.s01-shutter-line'), { width: '65vw', height: 3, autoAlpha: .65, duration: .45, ease: 'sine.inOut' }, 3.65)
    .to(select('.s01-shutter-haze'), { autoAlpha: .1, duration: .45, ease: 'sine.inOut' }, 3.65)
    .addLabel('handoff', STING_DURATION)

  if (!reducedMotion) {
    timeline.to(paths, { strokeDasharray: (index: number) => `${lengths[index]} ${lengths[index]}`, strokeDashoffset: (index: number) => lengths[index], duration: .36, stagger: { amount: .04 }, ease: 'steps(3)' }, 2.8)
  }

  // Deliberate cues only. All three helpers write into this same master.
  disturbances.horizontalShear(.9)
  disturbances.brightnessFailure(.9)
  disturbances.verticalSyncFailure(1.475)
  disturbances.brightnessFailure(1.6, { exposure: .3, spikeDuration: .05, blackoutDuration: .02 })
  disturbances.horizontalShear(2.65, { duration: .145, showTitle: true })
  disturbances.brightnessFailure(2.665, { exposure: .3, spikeDuration: .025, blackoutDuration: .02 })
  disturbances.verticalSyncFailure(2.705, { displacement: 4 })

  return timeline
}
