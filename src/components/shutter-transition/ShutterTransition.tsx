import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { createPortal } from 'react-dom'
import { useScrollState } from '../../architecture/scrollContext'
import { usePreferences } from '../../architecture/preferences'
import { toggleAudio, useAudioEnabled } from '../../architecture/audioState'
import { createShutterTimeline, SHUTTER_DURATION } from './createShutterTimeline'
import { useBunkerAudio } from './useBunkerAudio'
import './ShutterTransition.css'

const slatExposure = [.98, 1.02, .96, 1, 1.03, .97, 1.01, .98, 1.02, .96, 1, .99, 1.03, .97, 1.01, .91]
const dust = [
  // First seven also compose the mobile field. Fixed seeds avoid random jumps.
  // left %, bottom vh, size px, opacity, duration s, phase s, drift x/y px
  [43, 4, 1.6, .15, 12, -3, 7, 18], [56, 11, 2.2, .12, 17, -9, -6, 22],
  [48, 21, 1.3, .16, 10, -6, 5, 14], [61, 29, 2.6, .11, 18, -4, -8, 20],
  [39, 38, 1.8, .14, 14, -10, 6, 16], [53, 47, 2, .13, 16, -7, -5, 24],
  [46, 59, 1.2, .12, 11, -2, 4, 15], [31, 9, 2.4, .1, 15, -11, 8, 19],
  [67, 18, 1.4, .13, 9, -4, -4, 12], [36, 26, 2.1, .12, 13, -8, 5, 21],
  [57, 35, 1.1, .16, 8, -3, -3, 12], [44, 44, 2.8, .1, 18, -13, 7, 23],
  [64, 7, 1.7, .14, 11, -7, -6, 17], [50, 16, 2.3, .12, 16, -5, 4, 20],
  [34, 33, 1.5, .11, 14, -2, 6, 18], [58, 55, 1.9, .13, 17, -12, -5, 22],
]
type SurfaceStyle = CSSProperties & { '--slat-exposure'?: number }
type DustStyle = CSSProperties & {
  '--mote-opacity': number
  '--drift-x': string
  '--drift-y': string
}

export default function ShutterTransition() {
  const { state, lockScroll } = useScrollState()
  const { reducedMotion } = usePreferences()
  const enabled = useAudioEnabled()
  const active = state.active.id === 'S02'
  const root = useRef<HTMLDivElement>(null)
  const [requested, setRequested] = useState(false)
  const [assetsReady, setAssetsReady] = useState(false)
  const [playback, setPlayback] = useState<{ reducedMotion: boolean } | null>(null)
  const [complete, setComplete] = useState(false)
  const visible = active || (complete && state.active.id === 'S03')
  const { cue, levels, syncVolumes, stopMechanics, stop, setPresent } = useBunkerAudio()

  useEffect(() => {
    const start = () => setRequested(true)
    window.addEventListener('hunt:s01-complete', start)
    return () => window.removeEventListener('hunt:s01-complete', start)
  }, [])

  useEffect(() => {
    let cancelled = false
    // Decode during S00/S01; retain S01's black handoff until all surfaces exist.
    const assets = ['/s02/bunker/bunker-room.webp', '/s02/shutter/shutter-metal.jpg', '/s02/shutter/frame-metal.jpg']
    void Promise.all(assets.map(src => {
      const image = new Image()
      image.src = src
      return image.decode()
    })).then(() => {
      if (!cancelled) setAssetsReady(true)
    }).catch((error: unknown) => {
      if (!cancelled) console.error('S02 surface could not load', error)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!active || !assetsReady || playback) return
    let cancelled = false
    // Direct scene navigation also gets the same timed sequence for review.
    // Normal entry is requested by the S01 completion event above.
    queueMicrotask(() => {
      if (!cancelled) {
        if (!requested) setRequested(true)
        setPlayback({ reducedMotion })
      }
    })
    return () => { cancelled = true }
  }, [active, assetsReady, playback, reducedMotion, requested])

  useEffect(() => { setPresent(visible) }, [visible, setPresent])

  useLayoutEffect(() => {
    const element = root.current
    if (!playback || !element) return
    let release: (() => void) | null = lockScroll()
    let timeline!: gsap.core.Timeline
    const context = gsap.context(() => {
      timeline = createShutterTimeline(element, {
        reducedMotion: playback.reducedMotion, cue, levels: levels.current,
        syncVolumes, stopMechanics,
        onComplete: () => {
          element.dataset.phase = 'ready'
          element.dataset.bunkerReady = 'true'
          setComplete(true)
          release?.()
          release = null
          // S03 inherits this exact DOM surface and final transforms.
          window.dispatchEvent(new CustomEvent('hunt:s02-complete', {
            detail: { duration: SHUTTER_DURATION, nextScene: 'S03', bunkerReady: true,
              surface: element, image: element.querySelector('.s02-bunker') },
          }))
          window.dispatchEvent(new CustomEvent('hunt:bunker-ready', {
            detail: { scene: 'S03', surface: element },
          }))
        },
      })
    }, element)
    const visibility = () => {
      element.dataset.dustPaused = String(document.hidden)
      if (document.hidden) timeline.pause()
      else if (timeline.progress() < 1) timeline.resume()
    }
    document.addEventListener('visibilitychange', visibility)
    // Release S01 only after the first S02 frame is initialized.
    element.dataset.phase = 'playing'
    window.dispatchEvent(new Event('hunt:s02-ready'))
    if (!document.hidden) timeline.play(0)
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      timeline.data.dispose()
      context.revert()
      release?.()
      stop()
    }
  }, [playback, lockScroll, cue, levels, syncVolumes, stopMechanics, stop])

  return <>
    <h2 id="S02-title" className="s02-accessible-title">Bunker shutter</h2>
    {createPortal(<div ref={root} className="s02-stage" data-phase={complete ? 'ready' : 'closed'} hidden={!visible} aria-hidden="true">
      <div className="s02-black" />
      <div className="s02-room">
        <img className="s02-bunker" src="/s02/bunker/bunker-room.webp" alt="" decoding="async" />
        <div className="s02-bunker-darkness" />
      </div>
      <div className="s02-dust-light">
        {dust.map(([left, bottom, size, opacity, duration, phase, x, y], index) => <i key={index} style={{
          left: `${left}%`, bottom: `${bottom}svh`, width: size, height: size,
          '--mote-opacity': opacity, '--drift-x': `${x}px`, '--drift-y': `${-y}px`,
          animationDuration: `${duration}s`, animationDelay: `${phase}s`,
        } as DustStyle} />)}
      </div>
      <div className="s02-frame">
        <div className="s02-shutter-opening">
          <div className="s02-shutter">
            {slatExposure.map((exposure, index) => <div className="s02-slat" key={index} style={{ '--slat-exposure': exposure } as SurfaceStyle}>
              <div className="s02-slat-texture" style={{ backgroundPosition: `50% ${index / (slatExposure.length - 1) * 100}%` }} />
            </div>)}
          </div>
        </div>
        <div className="s02-bottom-edge" />
        <div className="s02-rail s02-rail--left"><div className="s02-rail-groove" /></div>
        <div className="s02-rail s02-rail--right"><div className="s02-rail-groove" /></div>
        <div className="s02-housing"><div className="s02-housing-slot" /></div>
      </div>
      <div className="s02-light-spill">
        <div className="s02-light-floor"><div className="s02-light-floor-projection" /></div>
        <div className="s02-light-source">
          <div className="s02-light-haze" />
          <div className="s02-light-seam" />
        </div>
      </div>
      <div className="s02-forward-spill" />
      <div className="s02-entry-darkness" />
      <div className="s02-vignette" />
      <div className="s02-grain" />
    </div>, document.body)}
    {visible && createPortal(<button className={`s02-sound${complete ? '' : ' s02-sound--concealed'}`} type="button" onClick={toggleAudio}
      aria-pressed={enabled} aria-label={enabled ? 'Mute bunker sound' : 'Enable bunker sound'}>
      SOUND {enabled ? 'ON' : 'OFF'}
    </button>, document.body)}
  </>
}
