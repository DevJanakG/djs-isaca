import { useCallback, useEffect, useRef } from 'react'
import { getAudioEnabled, setAudioEnabled, subscribeAudio } from '../../architecture/audioState'

export type BunkerCue = 'latch' | 'motor' | 'groan' | 'hum'
const files: Record<BunkerCue, string> = {
  latch: 'latch-clang.mp3', motor: 'shutter-open.mp3',
  groan: 'metal-groan.mp3', hum: 'bunker-hum.mp3',
}

// This hook lives with the retained bunker surface, including throughout S03.
export function useBunkerAudio() {
  const tracks = useRef<Partial<Record<BunkerCue, HTMLAudioElement>>>({})
  const consumed = useRef(new Set<BunkerCue>())
  const interrupted = useRef(new Set<HTMLAudioElement>())
  const generation = useRef(0)
  const present = useRef(false)
  const levels = useRef({ latch: .26, motor: .22, groan: .025, hum: 0 })

  const play = useCallback((audio: HTMLAudioElement) => {
    const request = generation.current
    void audio.play().then(() => {
      if (request !== generation.current || !present.current || !getAudioEnabled() || document.hidden) audio.pause()
    }).catch((error: unknown) => {
      if (request !== generation.current) return
      if (error instanceof DOMException && error.name === 'NotAllowedError') setAudioEnabled(false)
    })
  }, [])

  const syncVolumes = useCallback(() => {
    for (const name of Object.keys(files) as BunkerCue[]) {
      const audio = tracks.current[name]
      if (audio) audio.volume = levels.current[name]
    }
  }, [])

  const stopMechanics = useCallback(() => {
    for (const name of ['latch', 'motor', 'groan'] as const) {
      const audio = tracks.current[name]
      if (audio) { audio.pause(); interrupted.current.delete(audio) }
    }
  }, [])

  const stop = useCallback(() => {
    generation.current++
    interrupted.current.clear()
    for (const audio of Object.values(tracks.current)) audio.pause()
    consumed.current.clear()
    levels.current = { latch: .26, motor: .22, groan: .025, hum: 0 }
  }, [])

  const setPresent = useCallback((value: boolean) => {
    present.current = value
    if (!value) {
      generation.current++
      interrupted.current.clear()
      for (const audio of Object.values(tracks.current)) audio.pause()
    } else if (consumed.current.has('hum') && getAudioEnabled() && !document.hidden) {
      const hum = tracks.current.hum
      if (hum) play(hum)
    }
  }, [play])

  useEffect(() => {
    for (const name of Object.keys(files) as BunkerCue[]) {
      const audio = new Audio(`/s02/audio/${files[name]}`)
      audio.preload = 'auto'
      audio.loop = name === 'hum'
      tracks.current[name] = audio
    }
    syncVolumes()
    const unsubscribe = subscribeAudio(() => {
      if (!getAudioEnabled()) {
        generation.current++
        interrupted.current.clear()
        for (const audio of Object.values(tracks.current)) audio.pause()
      } else if (present.current && consumed.current.has('hum') && !document.hidden) {
        const hum = tracks.current.hum
        if (hum) play(hum)
      }
    })
    const visibility = () => {
      if (document.hidden) {
        generation.current++
        for (const audio of Object.values(tracks.current)) {
          if (!audio.paused && !audio.ended) interrupted.current.add(audio)
          audio.pause()
        }
      } else {
        if (present.current && getAudioEnabled()) for (const audio of interrupted.current) play(audio)
        interrupted.current.clear()
      }
    }
    document.addEventListener('visibilitychange', visibility)
    return () => {
      unsubscribe()
      document.removeEventListener('visibilitychange', visibility)
      stop()
      for (const audio of Object.values(tracks.current)) {
        audio.removeAttribute('src')
        audio.load()
      }
      tracks.current = {}
    }
  }, [play, stop, syncVolumes])

  const cue = useCallback((name: BunkerCue) => {
    if (consumed.current.has(name)) return
    consumed.current.add(name)
    const audio = tracks.current[name]
    if (!audio || !present.current || !getAudioEnabled() || document.hidden) return
    audio.currentTime = 0
    syncVolumes()
    play(audio)
  }, [play, syncVolumes])

  return { cue, levels, syncVolumes, stopMechanics, stop, setPresent }
}
