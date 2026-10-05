import { useScrollState } from '../architecture/scrollContext'
import { usePreferences } from '../architecture/preferences'
export default function DevelopmentHud() {
  const { state } = useScrollState()
  const { mobile, reducedMotion } = usePreferences()
  return <aside className="hud" aria-label="Development scroll diagnostics">
    <strong>Development HUD</strong>
    <div>Global: {state.global.toFixed(4)}</div>
    <div>Active: {state.active.id} · {state.active.title}</div>
    <div>Local: {state.local.toFixed(4)}</div>
    <div>{mobile ? 'Mobile fallback' : 'Desktop'}{reducedMotion ? ' · Reduced motion' : ''}</div>
  </aside>
}
