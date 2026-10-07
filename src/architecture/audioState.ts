import { useSyncExternalStore } from 'react'

// Audio requires an explicit sound-control gesture. Consent/mute then carries
// across scenes for the lifetime of this page; autoplay permission is not consent.
let audioEnabled = false
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
