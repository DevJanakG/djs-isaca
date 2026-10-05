import { useSyncExternalStore } from 'react'
function useMedia(query: string) {
  return useSyncExternalStore(callback => {
    const media = window.matchMedia(query)
    media.addEventListener('change', callback)
    return () => media.removeEventListener('change', callback)
  }, () => window.matchMedia(query).matches, () => false)
}
export function usePreferences() {
  const mobile = useMedia('(max-width: 767px)')
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)')
  return { mobile, reducedMotion, simple: mobile || reducedMotion }
}
