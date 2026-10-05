import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
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
  const { simple } = usePreferences()
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
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
    }
    ScrollTrigger.refresh()
    return () => { trigger.kill(); gsap.ticker.remove(tick); lenis?.destroy() }
  }, [simple])
  return <ScrollContext.Provider value={{ state, progress }}>{children}</ScrollContext.Provider>
}
