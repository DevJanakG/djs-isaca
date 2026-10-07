import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createBunkerEffects } from './bunkerAudio'

gsap.registerPlugin(ScrollTrigger)

export function createBunkerTimeline(section: HTMLElement, viewport: HTMLElement, room: HTMLDivElement, stage: HTMLDivElement) {
  const select = gsap.utils.selector(viewport)
  const worldSelect = gsap.utils.selector(room)
  const baseline = { scale: Number(gsap.getProperty(room, 'scaleX')), x: Number(gsap.getProperty(room, 'x')), y: Number(gsap.getProperty(room, 'y')) }
  const originalHeight = room.clientHeight
  const relativeY = baseline.y / originalHeight
  const camera = (scale: number, x: number, y: number) => ({
    scale: baseline.scale * scale,
    x: () => gsap.utils.clamp(-(baseline.scale * scale - 1) * room.clientWidth * .5,
      (baseline.scale * scale - 1) * room.clientWidth * .5, baseline.x + innerWidth * x),
    y: () => gsap.utils.clamp(-(baseline.scale * scale - 1) * room.clientHeight * .42,
      (baseline.scale * scale - 1) * room.clientHeight * .58, relativeY * room.clientHeight + innerHeight * y),
  })
  const poses = [camera(1, 0, 0), camera(1.45, .20, .035), camera(1.42, -.045, -.15),
    camera(1.55, -.085, -.20), camera(1.46, -.10, .025), camera(1.62, -.265, .025), camera(1.06, 0, -.01)]
  const panels = Array.from(viewport.querySelectorAll<HTMLElement>('[data-panel]'))
  const links = Array.from(viewport.querySelectorAll<HTMLElement>('[data-chapter]'))
  const effects = createBunkerEffects()
  let current = ''
  let enabled = false
  let activeLink = -1
  const panelAt = (p: number) => p < .135 ? '' : p < .28 ? 'board' : p < .43 ? 'journal' : p < .58 ? 'watch'
    : p < .665 ? 'rules' : p < .705 ? 'prizes' : p < .74 ? 'faq' : p < .88 ? 'radio' : 'finale'
  const sync = (p: number, active: boolean) => {
    const panel = active ? panelAt(p) : ''
    if (panel !== current || enabled !== active) {
      panels.forEach(element => {
        const available = active && element.dataset.panel === panel
        element.inert = !available
        element.setAttribute('aria-hidden', String(!available))
      })
      current = panel
      enabled = active
      viewport.dataset.chapter = panel
      room.style.willChange = active ? 'transform' : ''
    }
    const nav = viewport.querySelector<HTMLElement>('.bunker-chapters')!
    nav.inert = !active || p < .11
    const index = !panel ? -1 : ['board', 'journal', 'watch', 'rules', 'prizes', 'faq', 'radio', 'finale'].indexOf(panel)
    const chapter = index < 3 ? index : index < 6 ? 3 : index === 6 ? 4 : 5
    if (chapter !== activeLink) {
      links.forEach((link, i) => { if (i === chapter) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current') })
      activeLink = chapter
    }
    effects.update(p, active)
  }
  const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
    id: 'S03-bunker', trigger: section, start: 'top top', end: 'bottom bottom',
    pin: viewport, pinSpacing: false, scrub: true, invalidateOnRefresh: true,
    onUpdate: self => sync(self.progress, self.isActive || self.progress === 1),
    onRefresh: self => sync(self.progress, self.isActive || self.progress === 1),
    onToggle: self => sync(self.progress, self.isActive || self.progress === 1),
  } })
  // The inherited room is untouched until 10%. Every segment has explicit
  // start/end poses, so refresh never captures an intermediate pose as entry.
  for (const [from, to, at, duration] of [[0, 1, 10, 6], [1, 2, 28, 5], [2, 3, 43, 5],
    [3, 4, 58, 5], [4, 5, 74, 5], [5, 6, 88, 6]]) {
    timeline.fromTo(room, poses[from], { ...poses[to], duration, ease: 'power2.inOut', immediateRender: false }, at)
  }
  const object = (name: string, enter: number, exit: number, scale: number, rotation = 0) => {
    const nodes = worldSelect(`[data-object="${name}"]`)
    timeline.fromTo(nodes, { opacity: 0, scale: .94, rotation }, { opacity: 1, scale, rotation: 0, duration: 4, ease: 'power2.inOut', immediateRender: false }, enter)
    if (exit < 100) timeline.to(nodes, { opacity: 0, duration: 2.5 }, exit)
  }
  object('board', 11, 27, 1)
  object('journal', 30, 42, 1.75, -5)
  timeline.fromTo(worldSelect('.bunker-journal-cover'), { rotationY: 0 }, { rotationY: -145, duration: 3, ease: 'power2.inOut', immediateRender: false }, 33)
  object('watch', 44, 57, 1.62, -6)
  object('archive', 59, 73, 1.35)
  for (const [index, at] of [[0, 63], [1, 67], [2, 71]]) {
    timeline.fromTo(worldSelect(`[data-drawer="${index}"]`), { z: 0, y: 0 }, { z: 65, y: 12, duration: 2, ease: 'power2.out', immediateRender: false }, at)
  }
  object('radio', 75, 87, 1.15, 3)
  object('radio-light', 76, 87, 1)
  object('finale', 93, 100, 1, -12)
  const show = (name: string, enter: number, leave: number) => {
    const node = select(`[data-panel="${name}"]`)
    timeline.fromTo(node, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: ['rules', 'prizes', 'faq'].includes(name) ? .7 : 2, ease: 'power1.out', immediateRender: false }, enter)
    if (leave < 100) timeline.to(node, { opacity: 0, y: -12, duration: 1.2 }, leave)
  }
  show('board', 14, 26.5); show('journal', 35, 41.5); show('watch', 48, 56.5)
  show('rules', 63.5, 65.3); show('prizes', 67, 69.3); show('faq', 71, 72.8)
  show('radio', 79, 86.5); show('finale', 94, 100)
  timeline.fromTo(select('.bunker-entry-note'), { opacity: 0 }, { opacity: 1, duration: 2, immediateRender: false }, 2)
    .to(select('.bunker-entry-note'), { opacity: 0, duration: 2 }, 8)
    .fromTo(select('.bunker-chapters'), { opacity: 0 }, { opacity: 1, duration: 2, immediateRender: false }, 11)
    .fromTo(stage.querySelector('.s02-frame'), { opacity: 1 }, { opacity: 0, duration: 6, immediateRender: false }, 10)
    .fromTo(select('.bunker-chapter-wash'), { opacity: 0 }, { opacity: 1, duration: 3, immediateRender: false }, 12)
    .to(select('.bunker-chapter-wash'), { opacity: 0, duration: 4 }, 88)
    .fromTo(select('.bunker-room-shade'), { opacity: 0 }, { opacity: .80, duration: 7, immediateRender: false }, 90)
    .fromTo(select('.bunker-progress span'), { scaleX: 0 }, { scaleX: 1, duration: 100, immediateRender: false }, 0)
    .addLabel('room', 0).addLabel('board', 16).addLabel('journal', 36).addLabel('watch', 49)
    .addLabel('archive', 64).addLabel('radio', 80).addLabel('finale', 98)
  timeline.scrollTrigger?.refresh()
  sync(timeline.scrollTrigger?.progress ?? 0, timeline.scrollTrigger?.isActive ?? false)
  return { timeline, dispose: () => { effects.dispose(); room.style.willChange = '' } }
}
