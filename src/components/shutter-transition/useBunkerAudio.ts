import { useCallback, useEffect, useRef } from 'react'
import { getAudioEnabled, setAudioEnabled, subscribeAudio } from '../../architecture/audioState'

export type BunkerCue = 'latch' | 'motor' | 'groan' | 'hum'
const files: Record<BunkerCue, string> = {
  latch: 'latch-clang.mp3', motor: 'shutter-open.mp3',
  groan: 'metal-groan.mp3', hum: 'bunker-hum.mp3',
}
const initialLevels = () => ({ latch: .35, motor: .35, groan: .12, hum: 0 })

// This hook lives with the retained bunker surface, including throughout S03.
export function useBunkerAudio() {
  const tracks = useRef<Partial<Record<BunkerCue, HTMLAudioElement>>>({})
  const consumed = useRef(new Set<BunkerCue>())
  const interrupted = useRef(new Set<HTMLAudioElement>())
  const generation = useRef(0)
  const requestId = useRef(0)
  const owners = useRef(new WeakMap<HTMLAudioElement, number>())
  const pending = useRef(new Set<HTMLAudioElement>())
  const mechanicsStopped = useRef(false)
  const present = useRef(false)
  const levels = useRef(initialLevels())

  const play = useCallback((audio: HTMLAudioElement) => {
    if (!present.current || !getAudioEnabled() || document.hidden ||
      (mechanicsStopped.current && audio !== tracks.current.hum) ||
      !audio.paused || pending.current.has(audio)) return
    const requestedGeneration = generation.current
    const request = ++requestId.current
    owners.current.set(audio, request)
    pending.current.add(audio)
    void audio.play().then(() => {
      if (!present.current || !getAudioEnabled() || document.hidden ||
        (mechanicsStopped.current && audio !== tracks.current.hum)) {
        audio.pause()
        return
      }
      if (owners.current.get(audio) !== request) return
      if (requestedGeneration !== generation.current) audio.pause()
    }).catch((error: unknown) => {
      if (requestedGeneration !== generation.current || owners.current.get(audio) !== request) return
      if (error instanceof DOMException && error.name === 'NotAllowedError') setAudioEnabled(false)
    }).finally(() => {
      if (owners.current.get(audio) === request) pending.current.delete(audio)
    })
  }, [])

  const syncVolumes = useCallback(() => {
    for (const name of Object.keys(files) as BunkerCue[]) {
      const audio = tracks.current[name]
      if (audio) audio.volume = levels.current[name]
    }
  }, [])

  const stopMechanics = useCallback(() => {
    mechanicsStopped.current = true
    for (const name of ['latch', 'motor', 'groan'] as const) {
      const audio = tracks.current[name]
      if (audio) {
        audio.pause()
        audio.currentTime = 0
        pending.current.delete(audio)
        interrupted.current.delete(audio)
      }
    }
  }, [])

  const stop = useCallback(() => {
    generation.current++
    pending.current.clear()
    mechanicsStopped.current = false
    interrupted.current.clear()
    for (const audio of Object.values(tracks.current)) audio.pause()
    consumed.current.clear()
    levels.current = initialLevels()
  }, [])

  const setPresent = useCallback((value: boolean) => {
    present.current = value
    if (!value) {
      generation.current++
      pending.current.clear()
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
        pending.current.clear()
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
        pending.current.clear()
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
