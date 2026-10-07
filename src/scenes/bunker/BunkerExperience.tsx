import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useBunkerBackground } from '../../components/bunker/bunkerBackgroundState'
import { usePreferences } from '../../architecture/preferences'
import { useScrollState } from '../../architecture/scrollContext'
import BunkerWorld from './BunkerWorld'
import BunkerOverlays from './BunkerOverlays'
import { bunkerChapters } from './bunkerChapters'
import { createBunkerTimeline } from './bunkerTimeline'
import './BunkerExperience.css'

export default function BunkerExperience() {
  const background = useBunkerBackground()
  const { simple } = usePreferences()
  const { state, scrollTo } = useScrollState()
  const section = useRef<HTMLElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const master = useRef<ReturnType<typeof createBunkerTimeline> | null>(null)
  const pendingChapter = useRef<string | null>(null)
  const [artReady, setArtReady] = useState(false)
  const active = state.active.id === 'S03'

  useEffect(() => {
    if (!background.room) return
    let cancelled = false
    // Decode the real mounted sprites during S02, before opacity reveals can
    // trigger an asynchronous first paint. Never reload/decode the bunker plate.
    const images = Array.from(background.room.querySelectorAll<HTMLImageElement>('.bunker-object img'))
    void Promise.all(images.map(image => image.decode())).then(() => {
      if (!cancelled) setArtReady(true)
    }).catch((error: unknown) => {
      if (!cancelled) { console.warn('Bunker detail image unavailable', error); setArtReady(true) }
    })
    return () => { cancelled = true }
  }, [background.room])

  const navigate = useCallback((id: string) => {
    const chapter = bunkerChapters.find(item => item.id === id)
    if (!chapter) return
    if (background.phase !== 'ready') {
      pendingChapter.current = id
      const shutter = document.getElementById('S02')
      if (shutter) scrollTo(shutter.offsetTop + 2)
      return
    }
    const trigger = master.current?.timeline.scrollTrigger
    const element = document.getElementById(id)
    if (simple && element) scrollTo(element.getBoundingClientRect().top + window.scrollY - 32)
    else if (trigger) scrollTo(trigger.start + (trigger.end - trigger.start) * chapter.at)
    else { pendingChapter.current = id; return }
    if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`)
    requestAnimationFrame(() => {
      if (element) { element.tabIndex = -1; element.focus({ preventScroll: true }) }
    })
  }, [background.phase, simple, scrollTo])

  useEffect(() => {
    const handoff = () => { if (section.current) scrollTo(section.current.offsetTop) }
    window.addEventListener('hunt:s02-complete', handoff)
    return () => window.removeEventListener('hunt:s02-complete', handoff)
  }, [scrollTo])

  useEffect(() => {
    // Preserve the existing intro's #S10 link and chapter deep links. A cold
    // entry first runs S02, then seeks within the same retained surface.
    const intercept = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null
      const id = link?.getAttribute('href')?.slice(1)
      if (id && bunkerChapters.some(chapter => chapter.id === id)) {
        event.preventDefault()
        // Lenis's delegated window click handler does not honor defaultPrevented.
        // Intercept only S03 chapter links before that automatic anchor seek.
        event.stopPropagation()
        navigate(id)
      }
    }
    const hash = () => {
      const id = location.hash.slice(1)
      if (bunkerChapters.some(chapter => chapter.id === id)) navigate(id)
      else if (id === 'S03') {
        const destination = background.phase === 'ready' ? section.current : document.getElementById('S02')
        if (destination) scrollTo(destination.offsetTop + (background.phase === 'ready' ? 0 : 2))
      }
    }
    document.addEventListener('click', intercept, true)
    window.addEventListener('hashchange', hash)
    // The initial fragment can arrive before React creates its destination,
    // so there may be no native hashchange or automatic anchor scroll.
    const initialHash = requestAnimationFrame(hash)
    return () => { cancelAnimationFrame(initialHash); document.removeEventListener('click', intercept, true); window.removeEventListener('hashchange', hash) }
  }, [navigate, background.phase, scrollTo])

  useEffect(() => {
    if (active && background.phase === 'unavailable') {
      const id = location.hash.slice(1)
      if (bunkerChapters.some(chapter => chapter.id === id)) pendingChapter.current = id
      const shutter = document.getElementById('S02')
      if (shutter) scrollTo(shutter.offsetTop + 2)
    }
  }, [active, background.phase, scrollTo])

  useLayoutEffect(() => {
    const root = section.current
    const screen = viewport.current
    const { room, surface } = background
    if (!root || !screen || !room || !surface || background.phase !== 'ready' || !artReady) return
    if (simple) {
      screen.querySelectorAll<HTMLElement>('[data-panel]').forEach(panel => { panel.inert = false; panel.removeAttribute('aria-hidden') })
      const nav = screen.querySelector<HTMLElement>('.bunker-chapters')
      if (nav) nav.inert = false
      ScrollTrigger.refresh()
      if (pendingChapter.current) { const id = pendingChapter.current; pendingChapter.current = null; navigate(id) }
      return
    }
    const context = gsap.context(() => { master.current = createBunkerTimeline(root, screen, room, surface) }, root)
    if (pendingChapter.current) { const id = pendingChapter.current; pendingChapter.current = null; navigate(id) }
    return () => { master.current?.dispose(); context.revert(); master.current = null }
  }, [background, simple, navigate, artReady])

  useLayoutEffect(() => {
    if (viewport.current) viewport.current.inert = !active || background.phase !== 'ready'
  }, [active, background.phase])

  return <section ref={section} id="S03" className={`bunker-experience${simple ? ' bunker-experience--simple' : ''}`}
    aria-labelledby="S03-title" data-ready={background.phase === 'ready'}>
    <h2 id="S03-title" className="bunker-accessible-title">The Bunker — DJS ISACA: The Hunt</h2>
    <BunkerWorld background={background} />
    <div ref={viewport} className="bunker-viewport" aria-hidden={!active || background.phase !== 'ready'}>
      <BunkerOverlays navigate={navigate} />
    </div>
  </section>
}
