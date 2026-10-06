import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { getAudioEnabled, setAudioEnabled, subscribeAudio, toggleAudio, useAudioEnabled } from '../../architecture/audioState'

export function useIntroAudio(active: boolean) {
  const forest = useRef<HTMLAudioElement | null>(null)
  const impact = useRef<HTMLAudioElement | null>(null)
  const activeRef = useRef(active)
  const enabled = useAudioEnabled()
  useLayoutEffect(() => { activeRef.current = active }, [active])

  const startForest = useCallback(() => {
    const audio = forest.current
    if (!audio || !getAudioEnabled() || !activeRef.current || document.hidden) return
    void audio.play().then(() => {
      if (!getAudioEnabled() || !activeRef.current || document.hidden) audio.pause()
    }).catch((error: unknown) => {
      if (!activeRef.current || !getAudioEnabled() ||
        (error instanceof DOMException && error.name === 'AbortError')) return
      // A denied playback request leaves a usable, explicit sound control.
      setAudioEnabled(false)
    })
  }, [])

  useEffect(() => subscribeAudio(() => {
    if (getAudioEnabled()) startForest()
    else { forest.current?.pause(); impact.current?.pause() }
  }), [startForest])

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

  const cueImpact = useCallback(() => {
    const audio = impact.current
    if (!audio || !getAudioEnabled() || !activeRef.current || document.hidden) return
    audio.currentTime = 0
    void audio.play().then(() => {
      if (!getAudioEnabled() || !activeRef.current || document.hidden) audio.pause()
    }).catch(() => { /* The optional impact never interrupts the scene. */ })
  }, [])

  // The shared subscription starts playback synchronously inside this gesture.
  return { enabled, toggle: toggleAudio, cueImpact }
}
