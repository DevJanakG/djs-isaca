import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ScrollContext } from './scrollContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { getScrollState } from '../data/scenes'
import { usePreferences } from './preferences'

gsap.registerPlugin(ScrollTrigger)
export function ScrollProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => getScrollState(0))
  const progress = useRef(0)
  const smoothScroll = useRef<Lenis | null>(null)
  const { simple } = usePreferences()
  const lockScroll = useCallback(() => {
    smoothScroll.current?.stop()
    const block = (event: Event) => event.preventDefault()
    const blockKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === ' ' && event.target instanceof HTMLElement && event.target.closest('button, a')) return
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) event.preventDefault()
    }
    window.addEventListener('wheel', block, { passive: false, capture: true })
    window.addEventListener('touchmove', block, { passive: false, capture: true })
    window.addEventListener('keydown', blockKey, true)
    let released = false
    return () => {
      if (released) return
      released = true
      window.removeEventListener('wheel', block, true)
      window.removeEventListener('touchmove', block, true)
      window.removeEventListener('keydown', blockKey, true)
      smoothScroll.current?.start()
    }
  }, [])
  useLayoutEffect(() => {
    const update = (value: number) => {
      progress.current = value
      setState(getScrollState(value))
    }
    const trigger = ScrollTrigger.create({
      trigger: '#scroll-story', start: 'top top', end: 'bottom bottom',
      onUpdate: self => update(self.progress), onRefresh: self => update(self.progress),
    })
    let lenis: Lenis | undefined
    const tick = (seconds: number) => lenis?.raf(seconds * 1000)
    if (!simple) {
      lenis = new Lenis({ anchors: true })
      smoothScroll.current = lenis
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
    }
    ScrollTrigger.refresh()
    return () => { trigger.kill(); gsap.ticker.remove(tick); lenis?.destroy(); smoothScroll.current = null }
  }, [simple])
  return <ScrollContext.Provider value={{ state, progress, lockScroll }}>{children}</ScrollContext.Provider>
}
