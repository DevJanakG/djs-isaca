import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { createPortal } from 'react-dom'
import { useScrollState } from '../../architecture/scrollContext'
import { usePreferences } from '../../architecture/preferences'
import { toggleAudio, useAudioEnabled } from '../../architecture/audioState'
import { createShutterTimeline } from './createShutterTimeline'
import { useBunkerAudio } from './useBunkerAudio'
import BunkerBackground from '../bunker/BunkerBackground'
import { BUNKER_IMAGE, publishBunkerBackground, releaseBunkerBackground } from '../bunker/bunkerBackgroundState'
import './ShutterTransition.css'

const slatExposure = [.98, 1.02, .96, 1, 1.03, .97, 1.01, .98, 1.02, .96, 1, .99, 1.03, .97, 1.01, .91]
const dust = [
  // First seven also compose the mobile field. Fixed seeds avoid random jumps.
  // left %, bottom vh, size px, opacity, duration s, phase s, drift x/y px
  [43, 4, 2.2, 0.5, 12, -3, 7, 18], [56, 11, 2.6, 0.42, 17, -9, -6, 22],
  [48, 21, 2, 0.48, 10, -6, 5, 14], [61, 29, 2.8, 0.4, 18, -4, -8, 20],
  [39, 38, 2.4, 0.46, 14, -10, 6, 16], [53, 47, 2.5, 0.44, 16, -7, -5, 24],
  [46, 59, 1.8, 0.42, 11, -2, 4, 15], [31, 9, 2.6, 0.4, 15, -11, 8, 19],
  [67, 18, 2, 0.44, 9, -4, -4, 12], [36, 26, 2.4, 0.42, 13, -8, 5, 21],
  [57, 35, 1.8, 0.48, 8, -3, -3, 12], [44, 44, 3, 0.4, 18, -13, 7, 23],
  [64, 7, 2.2, 0.46, 11, -7, -6, 17], [50, 16, 2.7, 0.42, 16, -5, 4, 20],
  [34, 33, 2.1, 0.4, 14, -2, 6, 18], [58, 55, 2.4, 0.44, 17, -12, -5, 22],
]
type SurfaceStyle = CSSProperties & { '--slat-exposure'?: number; '--slat-count'?: number }
type DustStyle = CSSProperties & {
  '--mote-opacity': number
  '--drift-x': string
  '--drift-y': string
}

export default function ShutterTransition() {
  const { state, lockScroll } = useScrollState()
  const { reducedMotion, mobile } = usePreferences()
  const slats = mobile ? [...slatExposure.slice(0, 12), slatExposure[15]] : slatExposure
  const enabled = useAudioEnabled()
  const active = state.active.id === 'S02'
  const root = useRef<HTMLDivElement>(null)
  const [requested, setRequested] = useState(false)
  const [assetsReady, setAssetsReady] = useState(false)
  const [playback, setPlayback] = useState<{ reducedMotion: boolean; mobile: boolean } | null>(null)
  const [complete, setComplete] = useState(false)
  // Keep the surface present even if an S03 consumer navigates synchronously
  // during the readiness notification, before React commits completion state.
  const visible = active || (playback !== null && state.active.id === 'S03')
  const { cue, levels, syncVolumes, stopMechanics, stop, setPresent } = useBunkerAudio()

  useEffect(() => {
    const start = () => setRequested(true)
    window.addEventListener('hunt:s01-complete', start)
    return () => window.removeEventListener('hunt:s01-complete', start)
  }, [])

  useEffect(() => {
    let cancelled = false
    // Decode during S00/S01; retain S01's black handoff until all surfaces exist.
    const assets = [BUNKER_IMAGE, '/s02/shutter/shutter-metal.jpg', '/s02/shutter/frame-metal.jpg']
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
        setPlayback({ reducedMotion, mobile })
      }
    })
    return () => { cancelled = true }
  }, [active, assetsReady, playback, reducedMotion, mobile, requested])

  useEffect(() => { setPresent(visible) }, [visible, setPresent])

  useLayoutEffect(() => {
    const element = root.current
    if (!playback || !element) return
    let release: (() => void) | null = lockScroll()
    let timeline!: gsap.core.Timeline
    const context = gsap.context(() => {
      timeline = createShutterTimeline(element, {
        reducedMotion: playback.reducedMotion, mobile: playback.mobile, cue, levels: levels.current,
        syncVolumes, stopMechanics,
        onComplete: () => {
          element.dataset.phase = 'ready'
          element.dataset.bunkerReady = 'true'
          const background = publishBunkerBackground(element, 'ready')
          setComplete(true)
          release?.()
          release = null
          // S03 inherits this exact DOM surface and final transforms.
          window.dispatchEvent(new CustomEvent('hunt:s02-complete', {
            detail: { duration: timeline.duration(), nextScene: 'S03', bunkerReady: true,
              surface: element, image: background.image, background },
          }))
          window.dispatchEvent(new CustomEvent('hunt:bunker-ready', {
            detail: { scene: 'S03', surface: element, background },
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
    publishBunkerBackground(element, 'opening')
    window.dispatchEvent(new Event('hunt:s02-ready'))
    if (!document.hidden) timeline.play(0)
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      timeline.data.dispose()
      context.revert()
      release?.()
      stop()
      releaseBunkerBackground(element)
    }
  }, [playback, lockScroll, cue, levels, syncVolumes, stopMechanics, stop])

  return <>
    {createPortal(<div ref={root} className="s02-stage" data-phase={complete ? 'ready' : 'closed'} hidden={!visible} aria-hidden="true">
      <div className="s02-black" />
      <BunkerBackground />
      <div className="s02-dust-light">
        {dust.slice(0, mobile ? 7 : dust.length).map(([left, bottom, size, opacity, duration, phase, x, y], index) => <i key={index} style={{
          left: `${left}%`, bottom: `${bottom}svh`, width: size, height: size,
          '--mote-opacity': opacity, '--drift-x': `${x}px`, '--drift-y': `${-y}px`,
          animationDuration: `${duration}s`, animationDelay: `${phase}s`,
        } as DustStyle} />)}
      </div>
      <div className="s02-frame">
        <div className="s02-shutter-opening">
          <div className="s02-shutter" style={{ '--slat-count': slats.length } as SurfaceStyle}>
            {slats.map((exposure, index) => <div className="s02-slat" key={index} style={{ '--slat-exposure': exposure } as SurfaceStyle}>
              <div className="s02-slat-texture" style={{ backgroundPosition: `50% ${index / (slats.length - 1) * 100}%` }} />
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
