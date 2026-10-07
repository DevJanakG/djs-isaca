import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { BunkerBackgroundState } from '../../components/bunker/bunkerBackgroundState'
import BunkerBoard from './BunkerBoard'
import BunkerJournal from './BunkerJournal'
import BunkerWatch from './BunkerWatch'
import BunkerArchive from './BunkerArchive'
import BunkerRadio from './BunkerRadio'
import BunkerFinale from './BunkerFinale'

export default function BunkerWorld({ background }: { background: BunkerBackgroundState }) {
  const plane = useRef<HTMLDivElement>(null)
  const { room, image } = background
  useLayoutEffect(() => {
    if (!room || !image || !plane.current) return
    const element = plane.current
    // Alias the existing room, rather than introducing another camera wrapper
    // or moving/remounting S02's image. The class adds no entry transform.
    room.classList.add('bunker-world')
    const align = () => {
      if (!image.naturalWidth || !image.naturalHeight) return
      const scale = Math.max(room.clientWidth / image.naturalWidth, room.clientHeight / image.naturalHeight)
      const width = image.naturalWidth * scale
      const height = image.naturalHeight * scale
      const [x, y] = getComputedStyle(image).objectPosition.split(' ').map(value => parseFloat(value) / 100)
      // Layout measurements run only at decode/resize, never during scroll.
      Object.assign(element.style, { width: `${width}px`, height: `${height}px`,
        left: `${(room.clientWidth - width) * x}px`, top: `${(room.clientHeight - height) * y}px` })
    }
    const observer = new ResizeObserver(align)
    observer.observe(room)
    image.addEventListener('load', align)
    align()
    return () => {
      observer.disconnect()
      image.removeEventListener('load', align)
      room.classList.remove('bunker-world')
    }
  }, [room, image])
  if (!room) return null
  return createPortal(<div ref={plane} className="bunker-layer-plane" aria-hidden="true">
    <BunkerBoard /><BunkerJournal /><BunkerWatch /><BunkerArchive /><BunkerRadio /><BunkerFinale />
  </div>, room)
}
