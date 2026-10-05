import { createContext, useContext, type RefObject } from 'react'
import { getScrollState } from '../data/scenes'
export const ScrollContext = createContext<{ state: ReturnType<typeof getScrollState>; progress: RefObject<number> } | null>(null)
export function useScrollState() {
  const context = useContext(ScrollContext)
  if (!context) throw new Error('useScrollState requires ScrollProvider')
  return context
}
