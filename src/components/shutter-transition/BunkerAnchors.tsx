import { useLayoutEffect, useRef } from 'react'
import { bunkerAnchors } from './bunkerAnchors'

export default function BunkerAnchors() {
  const plane = useRef<HTMLDivElement>(null)
  const debug = new URLSearchParams(window.location.search).get('debug') === 'true'

  useLayoutEffect(() => {
    const element = plane.current
    const room = element?.parentElement?.parentElement
    const image = room?.querySelector<HTMLImageElement>('.s02-bunker')
    if (!element || !room || !image) return

    const align = () => {
      if (!image.naturalWidth || !image.naturalHeight) return
      const width = room.clientWidth
      const height = room.clientHeight
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      const paintedWidth = image.naturalWidth * scale
      const paintedHeight = image.naturalHeight * scale
      const [horizontal, vertical] = getComputedStyle(image).objectPosition.split(' ').map(value => parseFloat(value) / 100)
      Object.assign(element.style, {
        width: `${paintedWidth}px`, height: `${paintedHeight}px`,
        left: `${(width - paintedWidth) * horizontal}px`,
        top: `${(height - paintedHeight) * vertical}px`,
      })
    }
    const observer = new ResizeObserver(align)
    observer.observe(room)
    image.addEventListener('load', align)
    align()
    return () => {
      observer.disconnect()
      image.removeEventListener('load', align)
    }
  }, [])

  return <div className="s02-anchors" aria-hidden="true" data-debug={debug}>
    <div ref={plane} className="s02-anchor-plane">
      {Object.entries(bunkerAnchors).map(([name, { x, y }]) => <span key={name}
        className="s02-anchor" data-bunker-anchor={name} style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>
        {debug && <span className="s02-anchor-marker">{name}</span>}
      </span>)}
    </div>
  </div>
}
