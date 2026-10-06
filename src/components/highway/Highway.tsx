import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useScrollState } from '../../architecture/scrollContext'
import { usePreferences } from '../../architecture/preferences'
import './Highway.css'

export default function Highway() {
  const { state } = useScrollState()
  const { simple, reducedMotion } = usePreferences()
  const interfaceRoot = useRef<HTMLDivElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const active = state.active.id === 'S01'
  useLayoutEffect(() => {
    if (!active || !interfaceRoot.current) return
    const animation = gsap.timeline({ paused: true })
      .set(interfaceRoot.current, { '--presenter': 0, '--title': 0, '--copy': 0, '--lift': reducedMotion ? '0px' : '14px' }, 0)
      .to(interfaceRoot.current, { '--presenter': 1, duration: .25, ease: 'power2.out' }, .3)
      .to(interfaceRoot.current, { '--title': 1, '--lift': '0px', duration: .3, ease: 'power2.out' }, .45)
      .to(interfaceRoot.current, { '--copy': 1, duration: .25, ease: 'power2.out' }, .6)
      .to(interfaceRoot.current, { '--presenter': 0, '--title': 0, '--copy': 0,
        '--lift': reducedMotion ? '0px' : '-8px', duration: .15, ease: 'power2.in' }, .85)
    timeline.current = animation
    return () => { animation.kill(); timeline.current = null }
  }, [active, reducedMotion])
  useLayoutEffect(() => { timeline.current?.progress(state.local) }, [state.local, active, reducedMotion])
  if (!active) return <h2 id="S01-title" className="highway-accessible-title">DJS ISACA PRESENTS — THE HUNT. BUILD. BREAK. DEFEND. SURVIVE.</h2>
  return <>
    <div className={`highway${simple ? ' highway--simple' : ''}`} aria-hidden="true">
      <div className="highway-horizon" />
      {simple && <div className="highway-still" />}
    </div>
    {createPortal(<div ref={interfaceRoot} className="highway-interface">
      <div className="highway-editorial"><p className="highway-presenter">DJS ISACA PRESENTS</p>
        <h2 id="S01-title" className="highway-title">THE HUNT</h2>
        <p className="highway-manifesto">BUILD.<br />BREAK.<br />DEFEND.<br />SURVIVE.</p>
      </div>
      <div className="highway-matte" aria-hidden="true" />
      <div className="highway-grain" aria-hidden="true" />
      <a className="highway-continue" href="#S02" onClick={event => {
        const destination = document.getElementById('S02')
        if (!destination) return
        if (!simple) {
          // Keep the existing Lenis anchor route, but cross the scene boundary
          // by two pixels rather than settling fractionally before it.
          const margin = destination.style.scrollMarginTop
          destination.style.scrollMarginTop = '-2px'
          requestAnimationFrame(() => { destination.style.scrollMarginTop = margin })
          return
        }
        event.preventDefault()
        history.pushState(null, '', '#S02')
        window.scrollTo({ top: destination.offsetTop + 2, behavior: 'instant' })
      }}>Open the case file <span aria-hidden="true">↓</span></a>
      <a className="highway-credit" href="https://sketchfab.com/3d-models/chevrolet-impala-1967-supernatural-cb03ce730658410499f084c493f142bd" target="_blank" rel="noreferrer">Vehicle model: Negrin · CC BY 4.0</a>
    </div>, document.body)}
  </>
}
