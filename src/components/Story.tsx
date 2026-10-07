import TitleSting from './title-sting/TitleSting'
import Intro from './intro/Intro'
import { scenes } from '../data/scenes'
import BunkerExperience from '../scenes/bunker/BunkerExperience'
export default function Story() {
  return <main id="scroll-story" tabIndex={-1}>
    {scenes.map((scene, index) => scene.id === 'S03' ? <BunkerExperience key={scene.id} /> : <section key={scene.id} id={scene.id} aria-labelledby={`${scene.id}-title`} style={{ height: `${(scene.end - scene.start) * 2000}vh` }}>
      {index === 0 ? <Intro /> : index === 1 ? <TitleSting /> : <h2 id="S02-title" className="s02-accessible-title">Bunker shutter</h2>}
    </section>)}
  </main>
}
