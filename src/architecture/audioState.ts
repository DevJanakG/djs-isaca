import { useSyncExternalStore } from 'react'

// Request audible autoplay once; browser denial restores the sound control.
// Explicit mute persists across scenes for the lifetime of this page.
let audioEnabled = true
const listeners = new Set<() => void>()

export const getAudioEnabled = () => audioEnabled
export function setAudioEnabled(value: boolean) {
  if (value === audioEnabled) return
  audioEnabled = value
  for (const listener of listeners) listener()
}
export function subscribeAudio(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
export const toggleAudio = () => setAudioEnabled(!getAudioEnabled())
export function useAudioEnabled() {
  return useSyncExternalStore(subscribeAudio, getAudioEnabled, () => false)
}
