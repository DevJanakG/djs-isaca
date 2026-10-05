import { motion } from 'motion/react'
import { scenes } from '../data/scenes'
import { event } from '../data/event'
import { usePreferences } from '../architecture/preferences'
export default function Story() {
  const { reducedMotion } = usePreferences()
  return <main id="scroll-story" tabIndex={-1}>
    {scenes.map((scene, index) => <section key={scene.id} id={scene.id} aria-labelledby={`${scene.id}-title`} style={{ height: `${(scene.end - scene.start) * 2000}vh` }}>
      <div className="scene-content">
        <p>{scene.id} · {(scene.start * 100).toFixed(0)}–{(scene.end * 100).toFixed(0)}%</p>
        {index === 0 ? <h1 id={`${scene.id}-title`}>{scene.title}</h1> : <h2 id={`${scene.id}-title`}>{scene.title}</h2>}
        <p>{scene.description}</p>
        {index === 2 && <p>{event.title}</p>}
        {index === 5 && <p>Venue: {event.venue} · Eligibility: {event.eligibility}</p>}
        {index === 10 && <><p>{event.title} · {event.dateTime}</p>{event.registrationUrl ? <a href={event.registrationUrl}>Join the Hunt on Unstop</a> : <p>Registration link to be announced.</p>}</>}
        {index < scenes.length - 1 && <motion.a href={`#${scenes[index + 1].id}`} whileHover={reducedMotion ? undefined : { x: 4 }} transition={{ duration: .15 }}>Next section ↓</motion.a>}
      </div>
    </section>)}
    <div className="scroll-tail" aria-hidden="true" />
  </main>
}
