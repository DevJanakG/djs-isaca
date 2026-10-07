import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ScrollContext } from './scrollContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { getScrollState, scenes, clamp } from '../data/scenes'
import { usePreferences } from './preferences'

gsap.registerPlugin(ScrollTrigger)
export function ScrollProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => getScrollState(0))
  const progress = useRef(0)
  const smoothScroll = useRef<Lenis | null>(null)
  const { simple } = usePreferences()
  const scrollTo = useCallback((top: number) => {
    if (smoothScroll.current) smoothScroll.current.scrollTo(top, { immediate: true, force: true })
    else window.scrollTo({ top, behavior: 'instant' })
    ScrollTrigger.update()
  }, [])
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
    let bounds: { start: number; end: number }[] = []
    let lastScene = ''
    const measure = () => {
      const starts = scenes.map(scene => {
        const element = document.getElementById(scene.id)
        return element ? element.getBoundingClientRect().top + window.scrollY : 0
      })
      const story = document.getElementById('scroll-story')!
      const end = Math.max(starts[starts.length - 1] + 1, story.getBoundingClientRect().bottom + window.scrollY - innerHeight)
      bounds = starts.map((start, index) => ({ start, end: starts[index + 1] ?? end }))
    }
    const update = () => {
      const position = window.scrollY
      let index = bounds.findIndex(bound => position < bound.end - .5)
      if (index < 0) index = scenes.length - 1
      const scene = scenes[index]
      const local = clamp((position - bounds[index].start) / Math.max(1, bounds[index].end - bounds[index].start))
      const global = scene.start + local * (scene.end - scene.start)
      progress.current = global
      // S03's GSAP timeline owns frame updates. React only hears its entry/exit.
      if (scene.id !== 'S03' || lastScene !== scene.id) setState({ global, active: scene, local })
      lastScene = scene.id
    }
    measure()
    const trigger = ScrollTrigger.create({
      trigger: '#scroll-story', start: 'top top', end: 'bottom bottom',
      onUpdate: update, onRefresh: () => { measure(); update() },
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
  return <ScrollContext.Provider value={{ state, progress, lockScroll, scrollTo }}>{children}</ScrollContext.Provider>
}
