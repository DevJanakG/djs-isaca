import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export function useIntroAudio(active: boolean) {
  const forest = useRef<HTMLAudioElement | null>(null)
  const impact = useRef<HTMLAudioElement | null>(null)
  const enabledRef = useRef(false)
  const activeRef = useRef(active)
  const [enabled, setEnabled] = useState(false)
  useLayoutEffect(() => { activeRef.current = active }, [active])

  const startForest = useCallback(() => {
    const audio = forest.current
    if (!audio || !enabledRef.current || !activeRef.current || document.hidden) return
    void audio.play().then(() => {
      if (!enabledRef.current || !activeRef.current || document.hidden) audio.pause()
    }).catch((error: unknown) => {
      if (!activeRef.current || !enabledRef.current ||
        (error instanceof DOMException && error.name === 'AbortError')) return
      // A denied playback request leaves a usable, explicit sound control.
      enabledRef.current = false
      setEnabled(false)
    })
  }, [])

  useEffect(() => {
    forest.current = new Audio('/audio/s00-forest.mp3')
    forest.current.loop = true
    forest.current.volume = .35
    forest.current.preload = 'auto'
    impact.current = new Audio('/audio/s00-impact.mp3')
    impact.current.volume = .5
    impact.current.preload = 'auto'
    return () => {
      for (const audio of [forest.current, impact.current]) {
        if (!audio) continue
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      }
      forest.current = null
      impact.current = null
    }
  }, [])

  useEffect(() => {
    const silence = () => {
      for (const audio of [forest.current, impact.current]) {
        if (!audio) continue
        audio.pause()
        audio.currentTime = 0
      }
    }
    if (active) startForest()
    else silence()
    const visibility = () => {
      if (document.hidden) silence()
      else startForest()
    }
    document.addEventListener('visibilitychange', visibility)
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      silence()
    }
  }, [active, startForest])

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current
    setEnabled(enabledRef.current)
    // Call play inside the gesture itself, including on Safari/mobile.
    if (enabledRef.current) startForest()
    else { forest.current?.pause(); impact.current?.pause() }
  }, [startForest])

  const cueImpact = useCallback(() => {
    const audio = impact.current
    if (!audio || !enabledRef.current || !activeRef.current || document.hidden) return
    audio.currentTime = 0
    void audio.play().then(() => {
      if (!enabledRef.current || !activeRef.current || document.hidden) audio.pause()
    }).catch(() => { /* The optional impact never interrupts the scene. */ })
  }, [])

  return { enabled, toggle, cueImpact }
}
