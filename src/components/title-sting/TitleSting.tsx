import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useScrollState } from '../../architecture/scrollContext'
import { usePreferences } from '../../architecture/preferences'
import { createTitleStingTimeline, STING_DURATION } from './createTitleStingTimeline'
import { useStingAudio } from './useStingAudio'
import ShearLayers from './ShearLayers'
import './TitleSting.css'

function ShutterCue({ settled = false }: { settled?: boolean }) {
  return <div className={`s01-shutter-cue${settled ? ' s01-shutter-cue--settled' : ''}`} aria-hidden="true">
    <div className="s01-shutter-haze" data-sting-layer="shutter-haze" />
    <div className="s01-shutter-line" data-sting-layer="shutter-line" />
  </div>
}

export default function TitleSting() {
  const { state, lockScroll } = useScrollState()
  const { mobile, reducedMotion } = usePreferences()
  const active = state.active.id === 'S01'
  const root = useRef<HTMLDivElement>(null)
  const releaseScroll = useRef<(() => void) | null>(null)
  const [seal, setSeal] = useState('')
  const [handoff, setHandoff] = useState(false)
  const { enabled: soundEnabled, cue, stop, toggle } = useStingAudio(active)

  useEffect(() => {
    const controller = new AbortController()
    // Prepare while S00 plays, not after the electrical strike is due.
    const smoke = new Image()
    smoke.src = '/s01/images/smoke.webp'
    // Inline the trusted local SVG so its groups remain GSAP targets.
    void fetch('/s01/symbols/seal.svg', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`S01 seal could not load (${response.status})`)
        return response.text()
      })
      .then(markup => { if (!controller.signal.aborted) setSeal(markup) })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error(error)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (state.active.id !== 'S00') return
    const matte = document.querySelector('.intro-exit-black')
    if (!matte) return
    let entered = false
    const enterAfterBlack = () => {
      if (entered || Number(getComputedStyle(matte).opacity) < 1) return
      const destination = document.getElementById('S01')
      if (!destination) return
      entered = true
      window.scrollTo({ top: destination.offsetTop + 2, behavior: 'instant' })
    }
    const observer = new MutationObserver(enterAfterBlack)
    observer.observe(matte, { attributes: true, attributeFilter: ['style'] })
    enterAfterBlack()
    return () => observer.disconnect()
  }, [state.active.id])

  useEffect(() => {
    // Future S02 can claim the stage once its shutter implementation is ready.
    const releaseHandoff = () => setHandoff(false)
    window.addEventListener('hunt:s02-ready', releaseHandoff)
    return () => window.removeEventListener('hunt:s02-ready', releaseHandoff)
  }, [])

  useLayoutEffect(() => {
    if (!active) return
    const release = lockScroll()
    releaseScroll.current = release
    return () => { release(); releaseScroll.current = null }
  }, [active, lockScroll])

  useLayoutEffect(() => {
    const element = root.current
    if (!active || !seal || !element) return
    let cancelled = false
    let context: gsap.Context | undefined
    let timeline: gsap.core.Timeline | undefined
    const visibility = () => {
      if (document.hidden) timeline?.pause()
      else timeline?.resume()
    }
    document.addEventListener('visibilitychange', visibility)
    const smoke = element.querySelector<HTMLImageElement>('.s01-smoke')!
    void Promise.allSettled([
      smoke.decode(),
      document.fonts.load('600 48px "Cormorant Garamond"'),
      document.fonts.load('400 12px "IBM Plex Mono"'),
    ]).then(() => {
      if (cancelled) return
      context = gsap.context(() => {
        timeline = createTitleStingTimeline(element, {
          reducedMotion,
          mobile,
          cue,
          stopAudio: stop,
          onComplete: () => {
            stop()
            setHandoff(true)
            releaseScroll.current?.()
            element.dataset.phase = 'handoff'
            window.dispatchEvent(new CustomEvent('hunt:s01-complete', {
              detail: { duration: STING_DURATION, nextScene: 'S02', shutterOpen: false },
            }))
            const destination = document.getElementById('S02')
            if (destination) {
              history.replaceState(null, '', '#S02')
              window.scrollTo({ top: destination.offsetTop + 2, behavior: 'instant' })
            }
          },
        })
        if (!document.hidden) timeline.play(0)
      }, element)
    })
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', visibility)
      context?.revert()
      stop()
    }
  }, [active, seal, mobile, reducedMotion, cue, stop])

  if (!active) return <>
    <h2 id="S01-title" className="s01-accessible-title">THE HUNT</h2>
    {handoff && state.active.id === 'S02' && createPortal(
      <div className="s01-sting s01-sting--handoff" data-phase="handoff">
        <div className="s01-black" aria-hidden="true" />
        <ShutterCue settled />
      </div>, document.body,
    )}
  </>

  return createPortal(<div ref={root} className="s01-sting" data-phase="playing" data-duration-seconds={STING_DURATION}>
    <div className="s01-black" aria-hidden="true" />
    <img className="s01-smoke" data-sting-layer="smoke" src="/s01/images/smoke.webp" alt="" />
    <div className="s01-vignette" data-sting-layer="vignette" aria-hidden="true" />
    <div className="s01-seal" data-sting-layer="seal" aria-hidden="true" dangerouslySetInnerHTML={{ __html: seal }} />
    <div className="s01-typography">
      <p className="s01-presenter" data-sting-layer="presenter">DJS ISACA PRESENTS</p>
      <h2 id="S01-title" className="s01-title" data-sting-layer="title"><span>THE HUNT</span></h2>
    </div>
    <div className="s01-interference" data-sting-layer="interference" aria-hidden="true" />
    <ShearLayers seal={seal} mobile={mobile} />
    <div className="s01-grain" data-sting-layer="grain" aria-hidden="true" />
    <div className="s01-flash" data-sting-layer="flash" aria-hidden="true" />
    <div className="s01-failure-black" data-sting-layer="failure-black" aria-hidden="true" />
    <ShutterCue />
    <button className="s01-sound" type="button" onClick={toggle} aria-pressed={soundEnabled}
      aria-label={soundEnabled ? 'Mute title sting sound' : 'Enable title sting sound'}>
      SOUND {soundEnabled ? 'ON' : 'OFF'}
    </button>
  </div>, document.body)
}
