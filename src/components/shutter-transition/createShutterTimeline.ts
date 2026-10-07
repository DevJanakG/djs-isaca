import gsap from 'gsap'
import type { BunkerCue } from './useBunkerAudio'

export const SHUTTER_DURATION = 6

// Integral of a positive industrial velocity profile: long acceleration,
// nearly steady travel, then a short load/resistance region. No overshoot.
const industrialTravel = (t: number) => {
  if (t < .22) return (.18 * t + .82 * t * t / .44) / .851
  if (t < .8) return (.1298 + t - .22) / .851
  const tail = t - .8
  return (.7098 + tail - .588 * tail * tail / .4) / .851
}

export function createShutterTimeline(root: HTMLElement, options: {
  reducedMotion: boolean
  cue: (name: BunkerCue) => void
  levels: Record<BunkerCue, number>
  syncVolumes: () => void
  stopMechanics: () => void
  onComplete: () => void
}) {
  const { reducedMotion, cue, levels, syncVolumes, stopMechanics, onComplete } = options
  const select = gsap.utils.selector(root)
  const curtain = root.querySelector<HTMLElement>('.s02-shutter')!
  const edge = root.querySelector<HTMLElement>('.s02-bottom-edge')!
  const source = root.querySelector<HTMLElement>('.s02-light-source')!
  const dust = root.querySelector<HTMLElement>('.s02-dust-light')!
  const forward = root.querySelector<HTMLElement>('.s02-forward-spill')!
  const housing = root.querySelector<HTMLElement>('.s02-housing')!
  const shutterY = gsap.quickSetter(curtain, 'y', 'px')
  const edgeY = gsap.quickSetter(edge, 'y', 'px')
  const sourceY = gsap.quickSetter(source, 'y', 'px')
  let height = root.clientHeight || window.innerHeight
  // The approved housing is 9vh: stop with just 3px of metal below it,
  // rather than pushing the complete edge behind the housing at exactly 93%.
  let stopFraction = (height - (housing.offsetHeight || height * .09) - 6) / height
  const mechanics = { open: 0, jolt: 0 }
  const renderOpening = () => {
    const rise = mechanics.open * height - mechanics.jolt
    shutterY(-rise)
    edgeY(-rise)
    sourceY(-rise)
    const revealed = Math.max(3, rise + 3)
    dust.style.clipPath = `inset(${Math.max(0, height - revealed)}px 0 0)`
    forward.style.top = `${height - revealed}px`
    root.dataset.open = mechanics.open.toFixed(4)
  }
  const resize = () => {
    height = root.clientHeight || window.innerHeight
    const previous = stopFraction
    stopFraction = (height - (housing.offsetHeight || height * .09) - 6) / height
    if (mechanics.open >= previous - .001) mechanics.open = stopFraction
    renderOpening()
  }
  window.addEventListener('resize', resize)
  const timeline = gsap.timeline({
    paused: true, defaults: { ease: 'none' },
    onComplete: () => { mechanics.open = stopFraction; renderOpening(); onComplete() },
    onUpdate: renderOpening,
    onInterrupt: () => window.removeEventListener('resize', resize),
  })
  // The owning effect also removes this listener on normal completion/cleanup.
  timeline.data = { id: 'S02-shutter-master', resize, dispose: () => window.removeEventListener('resize', resize) }

  timeline.addLabel('closed-hold', 0)
    .set(select('.s02-entry-darkness'), { opacity: .96 }, 0)
    .set(select('.s02-bunker-darkness'), { opacity: 1 }, 0)
    .set(select('.s02-dust-light, .s02-forward-spill'), { opacity: 0 }, 0)
    .set(select('.s02-light-seam'), { opacity: .65 }, 0)
    .set(select('.s02-bunker'), { scale: 1, y: 0, filter: 'contrast(1.08)' }, 0)
    .addLabel('latch-release', .25)
    .call(() => cue('latch'), [], .25)

  if (!reducedMotion) {
    timeline.to(mechanics, { jolt: -4, duration: .07 }, .25)
      .to(mechanics, { jolt: -2, duration: .1 }, .32)
      .to(select('.s02-rail'), { x: .7, duration: .055 }, .25)
      .to(select('.s02-rail'), { x: -.4, duration: .06 }, .305)
      .to(select('.s02-rail'), { x: 0, duration: .065 }, .365)
    // Finite sub-pixel motor vibration, confined to the metal, never the stage.
    for (let index = 0; index < 6; index++) {
      timeline.to(mechanics, { jolt: index % 2 ? -2 : -2.7, duration: .065 }, .46 + index * .065)
    }
  }

  timeline.addLabel('motor-power', .45)
    .call(() => { cue('motor'); cue('groan') }, [], .45)
    .to(select('.s02-light-seam'), { opacity: .86, duration: .45 }, .45)
    .to(select('.s02-entry-darkness'), { opacity: 0, duration: .85, ease: 'power1.in' }, .45)
    .addLabel('first-opening', .9)
    .to(mechanics, { open: .07, jolt: 0, duration: .4, ease: 'power2.in' }, .9)
    .to(select('.s02-light-floor'), { opacity: 0, duration: .4 }, .9)
    .to(select('.s02-forward-spill'), { opacity: .26, duration: .4 }, .9)
    .to(select('.s02-light-haze'), { opacity: .16, duration: .4 }, .9)
    .to(select('.s02-bunker-darkness'), { opacity: .62, duration: .4 }, .9)
    .to(select('.s02-dust-light'), { opacity: .6, duration: .4 }, .9)
    .addLabel('main-opening', 1.3)
    .to(mechanics, { open: .78, duration: 2.3, ease: industrialTravel }, 1.3)
    .to(select('.s02-bunker-darkness'), { opacity: .09, duration: 2.3, ease: 'power1.out' }, 1.3)
    .to(select('.s02-bunker'), { filter: 'contrast(1.025)', duration: 2.3 }, 1.3)
    .to(select('.s02-forward-spill'), { opacity: .035, duration: 2.3 }, 1.3)
    .to(select('.s02-light-seam'), { opacity: .05, duration: 2.3 }, 1.3)
    .to(select('.s02-light-haze'), { opacity: .015, duration: 2.3 }, 1.3)
    .addLabel('resistance', 3.6)
    .to(mechanics, { open: () => stopFraction, duration: .6, ease: 'power2.out' }, 3.6)
    .to(levels, { groan: .075, motor: .13, duration: .6, onUpdate: syncVolumes }, 3.6)
    .to(select('.s02-bunker-darkness'), { opacity: .025, duration: .6 }, 3.6)
    .to(select('.s02-forward-spill, .s02-light-source'), { opacity: 0, duration: .6 }, 3.6)
    .addLabel('stop', 4.2)

  if (!reducedMotion) {
    timeline.to(mechanics, { jolt: -3, duration: .045 }, 4.2)
      .to(mechanics, { jolt: -2, duration: .055 }, 4.245)
      .to(mechanics, { jolt: 0, duration: .08 }, 4.3)
  }

  timeline.to(levels, { motor: 0, groan: 0, duration: .18, onUpdate: syncVolumes }, 4.2)
    .call(stopMechanics, [], 4.38)
    .addLabel('room-hold', 4.38)
    .addLabel('small-step', 4.7)

  if (!reducedMotion) {
    timeline.to(select('.s02-room'), { scale: 1.025, y: '-0.5vh', duration: 1.1, ease: 'power1.inOut' }, 4.7)
      .to(select('.s02-frame'), { scale: 1.01, duration: 1.1, ease: 'power1.inOut' }, 4.7)
  }

  timeline.addLabel('ambience', 5.6)
    .call(() => cue('hum'), [], 5.6)
    .to(levels, { hum: .12, duration: .4, onUpdate: syncVolumes }, 5.6)
    .addLabel('bunker-ready', SHUTTER_DURATION)
  renderOpening()
  return timeline
}
