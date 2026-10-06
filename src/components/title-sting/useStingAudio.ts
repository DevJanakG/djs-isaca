import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { getAudioEnabled, setAudioEnabled, subscribeAudio, toggleAudio, useAudioEnabled } from '../../architecture/audioState'

export type StingCue = 'reverse' | 'electrical' | 'impact'
const sounds: Record<StingCue, { file: string; volume: number }> = {
  // Conservative combined peak budget, including decoded MP3 overshoot.
  reverse: { file: 'reverse-whoosh.mp3', volume: .18 },
  electrical: { file: 'electrical-hit.mp3', volume: .32 },
  impact: { file: 'sting-impact.mp3', volume: .40 },
}

export function useStingAudio(active: boolean) {
  const tracks = useRef<Partial<Record<StingCue, HTMLAudioElement>>>({})
  const played = useRef(new Set<StingCue>())
  const interrupted = useRef(new Set<HTMLAudioElement>())
  const activeRef = useRef(active)
  const generation = useRef(0)
  const enabled = useAudioEnabled()

  const stop = useCallback(() => {
    generation.current++
    interrupted.current.clear()
    for (const audio of Object.values(tracks.current)) {
      audio.pause()
      audio.currentTime = 0
    }
    // Keep the cue ledger: muting, rerenders, and rebuilds cannot replay.
  }, [])

  useLayoutEffect(() => {
    activeRef.current = active
    if (active) played.current.clear()
    else stop()
  }, [active, stop])

  useEffect(() => {
    for (const name of Object.keys(sounds) as StingCue[]) {
      const spec = sounds[name]
      const audio = new Audio(`/s01/audio/${spec.file}`)
      audio.volume = spec.volume
      audio.preload = 'auto'
      tracks.current[name] = audio
    }
    return () => {
      stop()
      for (const audio of Object.values(tracks.current)) {
        audio.removeAttribute('src')
        audio.load()
      }
      tracks.current = {}
    }
  }, [stop])

  useEffect(() => subscribeAudio(() => {
    if (!getAudioEnabled()) stop()
  }), [stop])

  const play = useCallback((audio: HTMLAudioElement) => {
    const requestedGeneration = generation.current
    void audio.play().then(() => {
      if (requestedGeneration !== generation.current || !activeRef.current || !getAudioEnabled() || document.hidden) audio.pause()
    }).catch((error: unknown) => {
      if (requestedGeneration !== generation.current || !activeRef.current) return
      if (error instanceof DOMException && error.name === 'NotAllowedError') setAudioEnabled(false)
      // A denied or interrupted request never delays the visual timeline.
    })
  }, [])

  useEffect(() => {
    const visibility = () => {
      if (document.hidden) {
        for (const audio of Object.values(tracks.current)) {
          if (!audio.paused && !audio.ended) interrupted.current.add(audio)
          audio.pause()
        }
      } else {
        if (activeRef.current && getAudioEnabled()) {
          for (const audio of interrupted.current) play(audio)
        }
        interrupted.current.clear()
      }
    }
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [play])

  const cue = useCallback((name: StingCue) => {
    if (!activeRef.current || played.current.has(name)) return
    // Consume even muted cues: enabling sound never replays an earlier impact.
    played.current.add(name)
    const audio = tracks.current[name]
    if (!audio || !getAudioEnabled() || document.hidden) return
    audio.currentTime = 0
    play(audio)
  }, [play])

  return { enabled, cue, stop, toggle: toggleAudio }
}
