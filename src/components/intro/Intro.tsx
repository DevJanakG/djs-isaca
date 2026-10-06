import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollState } from '../../architecture/scrollContext'
import { usePreferences } from '../../architecture/preferences'
import { useIntroAudio } from './useIntroAudio'
import './Intro.css'

gsap.registerPlugin(ScrollTrigger)

export default function Intro() {
  const { state } = useScrollState()
  const { mobile, reducedMotion } = usePreferences()
  const root = useRef<HTMLDivElement>(null)
  const exitBlack = useRef<HTMLDivElement>(null)
  const active = state.active.id === 'S00'
  const completed = useRef(false)
  const [introReady, setIntroReady] = useState(false)
  const { enabled: soundEnabled, toggle: toggleSound, cueImpact } = useIntroAudio(active)

  useEffect(() => {
    const element = root.current
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!active || !element || mobile || reducedMotion || !finePointer.matches || navigator.maxTouchPoints > 0) return

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0
    let frame = 0, previousTime = 0
    const paint = (time: number) => {
      frame = 0
      const delta = previousTime ? Math.min(time - previousTime, 64) : 16
      previousTime = time
      // Frame-rate independent lerp: about 360ms to settle 95% of the way.
      const blend = 1 - Math.exp(-delta / 120)
      currentX += (targetX - currentX) * blend
      currentY += (targetY - currentY) * blend
      const settled = Math.hypot(targetX - currentX, targetY - currentY) < .001
      if (settled) { currentX = targetX; currentY = targetY }
      element.style.setProperty('--pointer-x', String(currentX))
      element.style.setProperty('--pointer-y', String(currentY))
      if (!settled) frame = requestAnimationFrame(paint)
      else previousTime = 0
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint) }
    const reset = () => { targetX = 0; targetY = 0; schedule() }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !finePointer.matches) { reset(); return }
      const bounds = element.getBoundingClientRect()
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1))
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1))
      // Cap total displacement, including when the pointer is in a corner.
      const magnitude = Math.max(1, Math.hypot(x, y))
      targetX = x / magnitude; targetY = y / magnitude
      schedule()
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('blur', reset)
    document.documentElement.addEventListener('pointerleave', reset)
    finePointer.addEventListener('change', reset)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', reset)
      document.documentElement.removeEventListener('pointerleave', reset)
      finePointer.removeEventListener('change', reset)
      element.style.removeProperty('--pointer-x')
      element.style.removeProperty('--pointer-y')
    }
  }, [active, mobile, reducedMotion])

  useLayoutEffect(() => {
    const element = root.current
    if (!active || !element) return
    let cancelled = false
    let context: gsap.Context | undefined
    const fontFaces = ['600 48px "Cormorant Garamond"', '400 12px "IBM Plex Mono"']
    const fontsReady = Promise.allSettled(fontFaces.map(face => document.fonts.load(face)))

    if (completed.current || reducedMotion) {
      context = gsap.context(() => {
        gsap.set('.intro-entrance-black', { opacity: 0 })
      }, element)
      completed.current = true
      // Keep the final scenery immediately visible, but show text only once
      // its real fonts are ready so reduced motion never swaps visible faces.
      const revealFinalText = () => {
        if (cancelled) return
        context?.add(() => {
          gsap.set('.intro-presenter', { autoAlpha: .7 })
          gsap.set('.intro-title', { autoAlpha: 1 })
          gsap.set('.intro-join', { autoAlpha: .75 })
          gsap.set('.intro-scroll', { autoAlpha: .4 })
        })
        setIntroReady(true)
      }
      // On return, set the already-loaded typography before the exit effect
      // applies its scroll position, rather than overwriting that fade later.
      if (fontFaces.every(face => document.fonts.check(face))) revealFinalText()
      else void fontsReady.then(revealFinalText)
      return () => { cancelled = true; context?.revert() }
    }

    // Start the clock only once the actual scene images can be painted.
    const images = Array.from(element.querySelectorAll('img'))
    void Promise.allSettled([
      ...images.map(image => image.decode()),
      fontsReady,
    ]).then(() => {
      if (cancelled) return
      context = gsap.context(() => {
        const master = gsap.timeline({ onComplete: () => {
          completed.current = true
          setIntroReady(true)
        } })
        const left = '.intro-hunter--left'
        const right = '.intro-hunter--right'
        const center = '.intro-hunter--center'
        const atmosphere = '.intro-distant-fog, .intro-near-fog'

        // Explicit percent centering avoids rounding-dependent transform
        // inference on fractional mobile image widths.
        master.set('.intro-hunter', { xPercent: -50, x: 0 }, 0)
          .set('.intro-forest', {
            filter: 'saturate(.65) brightness(.25) contrast(1.08)', scale: 1.025,
          }, 0)
          .set(atmosphere, { opacity: 0 }, 0)
          .set(left, { x: -element.clientWidth * .18, y: element.clientHeight * .02 }, 0)
          .set(right, { x: element.clientWidth * .18, y: element.clientHeight * .02 }, 0)
          .set(center, { scale: .52, opacity: .3, y: -element.clientHeight * .06 }, 0)
          .set('.intro-entrance-black', { opacity: 0 }, .45)
          .to('.intro-forest', {
            filter: 'saturate(.65) brightness(.83) contrast(1)',
            scale: 1, duration: .85, ease: 'power2.inOut',
          }, .45)
          .to(atmosphere, { opacity: 1, duration: .85, ease: 'sine.inOut' }, .45)
          .to(left, { x: 0, y: 0, duration: 2.18, ease: 'power2.inOut' }, .95)
          .to(right, { x: 0, y: 0, duration: 2.27, ease: 'power2.inOut' }, .95)
          .to(center, {
            scale: 1, opacity: 1, y: 0, duration: 2.35, ease: 'power2.inOut',
          }, .95)

        // Rhythm lives on the image inside each moving wrapper, so the
        // approach and footfall transforms never overwrite one another.
        for (const [selector, start, direction] of [
          [left, 1.02, -1], [right, 1.09, 1], [center, 1.15, -1],
        ] as const) {
          master.to(`${selector} img`, {
            y: -2.3, rotation: .28 * direction,
            duration: .14, repeat: 11, yoyo: true, ease: 'sine.inOut',
          }, start)
            .to(`${selector} img`, {
              y: 0, rotation: 0, duration: .2, ease: 'sine.out',
            }, start + 1.68)
        }
        // Keep the stationary pause before revealing any typography.
        master.call(cueImpact, [], 3.08)
          .to({}, { duration: .45 }, 3.3)
          .fromTo('.intro-presenter', { autoAlpha: 0, y: 6 }, {
            autoAlpha: .7, y: 0, duration: .5, ease: 'power2.out',
          }, 3.75)
          .fromTo('.intro-title', {
            autoAlpha: 0, y: 12, filter: 'blur(5px)', '--title-tracking': '.16em',
          }, {
            autoAlpha: 1, y: 0, filter: 'blur(0px)', '--title-tracking': '.04em',
            duration: .9, ease: 'power2.out',
          }, 4.25)
          .fromTo('.intro-join', { autoAlpha: 0 }, {
            autoAlpha: .75, duration: .5, ease: 'sine.out',
          }, 4.5)
          .fromTo('.intro-scroll', { autoAlpha: 0 }, {
            autoAlpha: .4, duration: .5, ease: 'sine.out',
          }, 5.6)
      }, element)
    })
    return () => { cancelled = true; context?.revert() }
  }, [active, reducedMotion, cueImpact])

  useLayoutEffect(() => {
    const element = root.current
    const matte = exitBlack.current
    if (!active || !introReady || !element || !matte) return

    const context = gsap.context(() => {
      const exit = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
        .fromTo('.intro-scroll', { autoAlpha: .4 }, { autoAlpha: 0, duration: .3 }, .2)
        .fromTo('.intro-join', { autoAlpha: .75 }, { autoAlpha: 0, duration: .4 }, .2)
        .fromTo('.intro-title', { autoAlpha: 1, y: 0 }, {
          autoAlpha: 0, y: reducedMotion ? 0 : -10, duration: .4,
        }, .3)
        .fromTo('.intro-presenter', { autoAlpha: .7 }, { autoAlpha: 0, duration: .4 }, .3)
        .fromTo('.intro-backlight', { opacity: 1 }, { opacity: 0, duration: .45 }, .35)
        .fromTo('.intro-branches--left', { x: 0 }, {
          x: () => reducedMotion ? 0 : element.clientWidth * .015, duration: .45,
        }, .45)
        .fromTo('.intro-branches--right', { x: 0 }, {
          x: () => reducedMotion ? 0 : -element.clientWidth * .015, duration: .45,
        }, .45)
        .fromTo('.intro-distant-fog, .intro-near-fog', { opacity: 1 }, {
          opacity: 0, duration: .35,
        }, .55)
        .fromTo('.intro-hunter img', { filter: 'saturate(.5) brightness(.52)' }, {
          filter: 'saturate(.5) brightness(0)', duration: .35,
        }, .65)
        .fromTo('.intro-forest', { filter: 'saturate(.65) brightness(.83) contrast(1)' }, {
          filter: 'saturate(.65) brightness(0) contrast(1)', duration: .15,
        }, .85)
        // Finish the matte just before the boundary so fractional scroll
        // rounding cannot leave a sliver of light in the last S00 frame.
        .fromTo(matte, { opacity: 0 }, { opacity: 1, duration: .14 }, .85)
        .fromTo('.intro-sound', { autoAlpha: .6 }, { autoAlpha: 0, duration: .15 }, .85)

      const trigger = ScrollTrigger.create({
        // These sections sit outside the scoped intro root; pass elements
        // so GSAP's local selector scope cannot hide the scene boundaries.
        trigger: document.getElementById('S00'), start: 'top top',
        endTrigger: document.getElementById('S01'), end: 'top top',
        animation: exit, scrub: true, invalidateOnRefresh: true,
      })
      // Apply the current position, including when returning from S01.
      exit.progress(trigger.progress)
    }, element)
    return () => context.revert()
  }, [active, introReady, reducedMotion])

  return <>
    {!active && <h1 id="S00-title" className="intro-accessible-title">The Hunt</h1>}
    {active && <div ref={root} className={`intro${reducedMotion ? ' intro--reduced' : ''}`}>
      <div className="intro-black" aria-hidden="true" />
      <img className="intro-forest" src="/s00/background/forest-bg.png" alt="" />
      <div className="intro-distant-fog" aria-hidden="true">
        <div className="intro-backlight" />
        <div className="intro-fog intro-fog--distant" />
        <div className="intro-fog intro-fog--clearing" />
      </div>
      <div className="intro-hunters" aria-hidden="true">
        <div className="intro-hunter intro-hunter--center"><img src="/s00/hunters/hunter-center.png" alt="" /></div>
        <div className="intro-hunter intro-hunter--left"><img src="/s00/hunters/hunter-left.png" alt="" /></div>
        <div className="intro-hunter intro-hunter--right"><img src="/s00/hunters/hunter-right.png" alt="" /></div>
      </div>
      <div className="intro-near-fog" aria-hidden="true"><div className="intro-fog intro-fog--near" /></div>
      <div className="intro-foreground" aria-hidden="true">
        <img className="intro-branches intro-branches--left" src="/s00/foreground/branches-left.png" alt="" />
        <img className="intro-branches intro-branches--right" src="/s00/foreground/branches-right.png" alt="" />
      </div>
      <div className="intro-vignette" aria-hidden="true" />
      <div className="intro-typography">
        <p className="intro-presenter">DJS ISACA PRESENTS</p>
        <h1 id="S00-title" className="intro-title">THE HUNT</h1>
      </div>
      <div className="intro-actions">
        <a className="intro-join" href="#S10">JOIN THE HUNT</a>
        <a className="intro-scroll" href="#S01" onClick={event => {
          const destination = document.getElementById('S01')
          if (!destination) return
          if (!mobile && !reducedMotion) {
            // Keep Lenis's smooth anchor path, crossing fractional boundaries.
            const margin = destination.style.scrollMarginTop
            destination.style.scrollMarginTop = '-2px'
            requestAnimationFrame(() => { destination.style.scrollMarginTop = margin })
            return
          }
          event.preventDefault()
          history.pushState(null, '', '#S01')
          window.scrollTo({ top: destination.offsetTop + 2, behavior: 'instant' })
        }}>
          <span>SCROLL TO ENTER</span>
          <span className="intro-scroll-line" aria-hidden="true" />
        </a>
      </div>
      <div className="intro-grain" aria-hidden="true" />
      <div className="intro-entrance-black" aria-hidden="true" />
      <button className="intro-sound" type="button" onClick={toggleSound}
        aria-pressed={soundEnabled} aria-label={soundEnabled ? 'Mute S00 sound' : 'Enable S00 sound'}>
        SOUND {soundEnabled ? 'ON' : 'OFF'}
      </button>
    </div>}
    {active && createPortal(<div ref={exitBlack} className="intro-exit-black" aria-hidden="true" />, document.body)}
  </>
}
