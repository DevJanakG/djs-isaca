import { lazy, Suspense } from 'react'
import { ScrollProvider } from './architecture/ScrollProvider'
import { scenes } from './data/scenes'
import Story from './components/Story'
import DevelopmentHud from './components/DevelopmentHud'
import './App.css'
const World = lazy(() => import('./components/World'))
export default function App() {
  return <ScrollProvider>
    <a className="skip-link" href="#scroll-story">Skip to content</a>
    <Suspense fallback={null}><World /></Suspense>
    <header><details><summary>Hunter’s Journal</summary><nav aria-label="Scenes">{scenes.map(scene => <a key={scene.id} href={`#${scene.id}`}>{scene.id} {scene.title}</a>)}</nav></details></header>
    <Story />
    {import.meta.env.DEV && new URLSearchParams(window.location.search).get('debug') === '1' && <DevelopmentHud />}
  </ScrollProvider>
}
