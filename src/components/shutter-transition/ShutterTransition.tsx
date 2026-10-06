import { useEffect, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useScrollState } from '../../architecture/scrollContext'
import './ShutterTransition.css'

const slatExposure = [.98, 1.02, .96, 1, 1.03, .97, 1.01, .98, 1.02, .96, 1, .99, 1.03, .97, 1.01, .91]
const dust = [
  [28, 6, 1.2, .12], [37, 17, 1, .09], [44, 9, 1.5, .1],
  [52, 25, 1.1, .08], [59, 12, 1.3, .11], [66, 21, 1, .08],
  [47, 31, 1, .07], [57, 4, 1.2, .1],
]
type SurfaceStyle = CSSProperties & { '--slat-exposure'?: number }

export default function ShutterTransition() {
  const { state } = useScrollState()
  const active = state.active.id === 'S02'

  useEffect(() => {
    if (!active) return
    let cancelled = false
    // S01 retains its existing black seam until the static replacement is ready.
    const assets = ['/s02/bunker/bunker-room.webp', '/s02/shutter/shutter-metal.jpg', '/s02/shutter/frame-metal.jpg']
    void Promise.all(assets.map(src => {
      const image = new Image()
      image.src = src
      return image.decode()
    })).then(() => {
      if (!cancelled) window.dispatchEvent(new Event('hunt:s02-ready'))
    }).catch((error: unknown) => {
      if (!cancelled) console.error('S02 surface could not load', error)
    })
    return () => { cancelled = true }
  }, [active])

  return <>
    <h2 id="S02-title" className="s02-accessible-title">Bunker shutter</h2>
    {active && createPortal(<div className="s02-stage" data-phase="static-closed" aria-hidden="true">
      <div className="s02-black" />
      <img className="s02-bunker" src="/s02/bunker/bunker-room.webp" alt="" decoding="async" />
      <div className="s02-bunker-darkness" />
      <div className="s02-light-spill"><div className="s02-light-haze" /><div className="s02-light-seam" /></div>
      <div className="s02-dust-light">
        {dust.map(([left, bottom, size, opacity], index) => <i key={index} style={{ left: `${left}%`, bottom: `${bottom}px`, width: size, height: size, opacity }} />)}
      </div>
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
      <div className="s02-vignette" />
      <div className="s02-grain" />
    </div>, document.body)}
  </>
}
