import { useSyncExternalStore } from 'react'

export const BUNKER_IMAGE = '/s02/bunker/bunker-room.webp'

export type BunkerBackgroundState = Readonly<{
  phase: 'unavailable' | 'opening' | 'ready'
  surface: HTMLDivElement | null
  room: HTMLDivElement | null
  image: HTMLImageElement | null
  // Diagnostic snapshot of the completed presentation, never reapplied to DOM.
  finalVisual: Readonly<{
    roomTransform: string
    imageTransform: string
    imageFilter: string
    exposureOpacity: string
    dustOpacity: string
    spillOpacity: string
    shutterOpen: number
  }> | null
}>

const initialState: BunkerBackgroundState = {
  phase: 'unavailable', surface: null, room: null, image: null, finalVisual: null,
}
let state = initialState
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export const getBunkerBackgroundState = () => state

// S03 subscribes to readiness and uses the existing nodes; it must not render
// another background, replay S02 or reapply the captured styles.
export function useBunkerBackground() {
  return useSyncExternalStore(subscribe, getBunkerBackgroundState, () => initialState)
}

export function publishBunkerBackground(surface: HTMLDivElement, phase: 'opening' | 'ready') {
  const room = surface.querySelector<HTMLDivElement>('.s02-room')!
  const image = surface.querySelector<HTMLImageElement>('.s02-bunker')!
  const style = (selector: string) => getComputedStyle(surface.querySelector(selector)!)
  state = {
    phase, surface, room, image,
    finalVisual: phase === 'ready' ? Object.freeze({
      roomTransform: getComputedStyle(room).transform,
      imageTransform: getComputedStyle(image).transform,
      imageFilter: getComputedStyle(image).filter,
      exposureOpacity: style('.s02-bunker-darkness').opacity,
      dustOpacity: style('.s02-dust-light').opacity,
      spillOpacity: style('.s02-forward-spill').opacity,
      shutterOpen: Number(surface.dataset.open),
    }) : null,
  }
  for (const listener of listeners) listener()
  return state
}

export function releaseBunkerBackground(surface: HTMLDivElement) {
  if (state.surface !== surface) return
  state = initialState
  for (const listener of listeners) listener()
}
