import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useScrollState } from '../../architecture/scrollContext'
import { usePreferences } from '../../architecture/preferences'
import './Intro.css'

// Screen-relative anomaly location, shared by the writing and the detector.
const HOTSPOT = { x: .59, y: .43 }
export default function Intro() {
  const { state } = useScrollState()
  const { simple, reducedMotion } = usePreferences()
  const active = state.active.id === 'S00'
  const root = useRef<HTMLDivElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const [level, setLevel] = useState(1)

  useLayoutEffect(() => {
    if (!active || !root.current) return
    const animation = gsap.timeline({ paused: true })
    animation.to(root.current, { '--departure': 1, duration: .16, ease: 'power2.in' }, .84)
    if (!reducedMotion) {
      animation.to(root.current, { '--tear': 1, duration: .035 }, .89)
        .to(root.current, { '--tear': 0, duration: .075 }, .925)
    }
    timeline.current = animation
    return () => { animation.kill(); timeline.current = null }
  }, [active, reducedMotion])
  useLayoutEffect(() => { if (active) timeline.current?.progress(state.local) }, [active, state.local, reducedMotion])

  useEffect(() => {
    const element = root.current
    if (!active || simple || !element) return
    let frame = 0
    let x = innerWidth * .26
    let y = innerHeight * .58
    const paint = () => {
      frame = 0
      const bounds = element.getBoundingClientRect()
      element.style.setProperty('--beam-x', `${x - bounds.left}px`)
      element.style.setProperty('--beam-y', `${y - bounds.top}px`)
      const distance = Math.hypot((x / bounds.width - HOTSPOT.x) * bounds.width, (y / bounds.height - HOTSPOT.y) * bounds.height)
      const intensity = Math.max(0, 1 - distance / (Math.min(bounds.width, bounds.height) * .52))
      setLevel(1 + Math.round(intensity * 4))
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      x = event.clientX; y = event.clientY
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const leave = () => { element.style.setProperty('--beam-strength', '0'); setLevel(1) }
    const enter = () => element.style.setProperty('--beam-strength', '1')
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    document.addEventListener('pointerenter', enter)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); document.removeEventListener('pointerenter', enter) }
  }, [active, simple])

  if (!active) return <h1 id="S00-title" className="intro-accessible-title">THE GATE HAS BEEN OPENED. WE NEED HUNTERS.</h1>
  const signal = simple ? 1 + Math.round(state.local * 4) : level
  return <div ref={root} className={`intro${simple ? ' intro--simple' : ''}`}>
    <div className="intro-darkness" aria-hidden="true" />
    <div className="intro-wall">
      <div className="intro-seams" aria-hidden="true" />
      <div className="intro-scratches" aria-hidden="true">╱ ╱ ╱ ╱</div>
      <h1 id="S00-title" className="intro-message">THE GATE HAS<br />BEEN OPENED.</h1>
      <p className="intro-recruitment">WE NEED HUNTERS.</p>
      <span className="intro-wall-note" aria-hidden="true">DO NOT TRUST THE SIGNAL</span>
    </div>
    <div className="intro-beam" aria-hidden="true" />
    <div className="intro-grain" aria-hidden="true" />
    <div className="intro-scanlines" aria-hidden="true" />
    <div className="intro-tear" aria-hidden="true" />
    <div className="intro-caption"><span>DJS ISACA / THE HUNT</span><span>TRANSMISSION 00</span></div>
    <div className="intro-instruction"><p>{simple ? 'A signal has been detected.' : 'Move your light. Something is here.'}</p><a href="#S01" onClick={event => {
      if (!simple) return
      // Native anchor positions round fractional viewport heights down on mobile.
      event.preventDefault()
      const destination = document.getElementById('S01')
      if (destination) {
        history.pushState(null, '', '#S01')
        window.scrollTo({ top: destination.offsetTop + 2, behavior: 'instant' })
      }
    }}>Follow the signal <span aria-hidden="true">↓</span></a></div>
    <aside className="intro-emf" aria-label="EMF detector">
      <div className="intro-emf-label"><span>EMF</span><span>{String(signal).padStart(2, '0')} / 05</span></div>
      <div className="intro-emf-bars" role="meter" aria-label="Anomaly proximity" aria-valuemin={1} aria-valuemax={5} aria-valuenow={signal}>
        {[1, 2, 3, 4, 5].map(value => <i key={value} className={value <= signal ? 'is-lit' : ''} />)}
      </div>
      <span className="intro-emf-status">{signal >= 4 ? 'SIGNAL DETECTED' : 'SCANNING'}</span>
    </aside>
  </div>
}
