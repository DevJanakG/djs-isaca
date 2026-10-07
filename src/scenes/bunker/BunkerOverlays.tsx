import type { ReactNode } from 'react'
import { event } from '../../data/event'
import { bunkerChapters } from './bunkerChapters'
import { BunkerSeal } from './BunkerFinale'

function FactList({ entries, pending }: { entries: readonly unknown[]; pending: string }) {
  if (!entries.length) return pending ? <p className="bunker-pending">{pending}</p> : null
  return <ul className="bunker-facts">{entries.map((entry, index) => <li key={index}>
    {typeof entry === 'object' && entry !== null
      ? Object.entries(entry).map(([key, value]) => <p key={key}><span>{key.replace(/([A-Z])/g, ' $1')}</span> {String(value)}</p>)
      : String(entry)}
  </li>)}</ul>
}

function Panel({ name, id, kicker, title, children, side = 'right' }: {
  name: string; id?: string; kicker: string; title: string; children: ReactNode; side?: string
}) {
  return <article className={`bunker-panel bunker-panel--${side}`} data-panel={name} id={id}
    aria-labelledby={`bunker-${name}-title`}>
    {name === 'finale' && <div className="bunker-mobile-seal" aria-hidden="true"><BunkerSeal /></div>}
    <p className="bunker-eyebrow">{kicker}</p>
    <h3 id={`bunker-${name}-title`}>{title}</h3>
    {children}
    <span className="bunker-panel-number" aria-hidden="true">DJS / ISACA · CASE 03</span>
  </article>
}

export default function BunkerOverlays({ navigate }: { navigate: (id: string) => void }) {
  return <>
    <div className="bunker-room-shade" aria-hidden="true" />
    <div className="bunker-chapter-wash" aria-hidden="true" />
    <div className="bunker-entry-note"><p>THE BUNKER</p><span>Every hunt begins with a question.</span><small>SCROLL TO INVESTIGATE ↓</small></div>
    <nav className="bunker-chapters" aria-label="Bunker chapters">
      {bunkerChapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} data-chapter={index}
        onClick={e => { e.preventDefault(); navigate(chapter.id) }}><span>0{index + 1}</span>{chapter.title}</a>)}
    </nav>
    <div className="bunker-panels">
      <Panel name="board" id="bunker-about" kicker="01 / ABOUT THE HUNT" title="Follow the evidence.">
        <p className="bunker-lede">An investigation in ideas. A hackathon for the curious.</p>
        <p>Enter THE HUNT with DJS ISACA. Bring your questions, work together, and turn an idea into something you can put to the test.</p>
        <h4>Choose your trail</h4><FactList entries={event.tracks} pending="Tracks will be revealed in the next briefing." />
      </Panel>
      <Panel name="journal" id="bunker-details" kicker="02 / EVENT DETAILS" title="Your field briefing.">
        <p className="bunker-lede">Keep the essentials close.</p>
        <dl className="bunker-details">
          {[['Date & time', event.dateTime], ['Duration', event.duration], ['Venue', event.venue], ['Team size', event.teamSize], ['Eligibility', event.eligibility]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </Panel>
      <Panel name="watch" id="bunker-schedule" kicker="03 / SCHEDULE" title="Make every hour count.">
        <p className="bunker-lede">From the first clue to the final reveal.</p>
        <FactList entries={event.schedule} pending="The complete event timeline is being prepared. Check back for the schedule." />
        <p className="bunker-margin-note">All timings will be published here before the hunt begins.</p>
      </Panel>
      <Panel name="rules" id="bunker-archive" kicker="04 / THE ARCHIVE · FILE 01" title="The hunter’s code." side="left">
        <p className="bunker-lede">Know the ground rules before you enter.</p>
        <FactList entries={event.rules} pending="Official rules will be published with the event briefing." />
      </Panel>
      <Panel name="prizes" kicker="04 / THE ARCHIVE · FILE 02" title="The bounty." side="left">
        <p className="bunker-lede">Good ideas deserve their moment.</p>
        <FactList entries={event.prizes} pending="Prize details will be announced by DJS ISACA." />
      </Panel>
      <Panel name="faq" kicker="04 / THE ARCHIVE · FILE 03" title="Unanswered questions." side="left">
        <FactList entries={event.faq} pending="The FAQ is coming with the next briefing. Contact details will appear in the following dossier." />
      </Panel>
      <Panel name="radio" id="bunker-allies" kicker="05 / THE FREQUENCY" title="You’re not alone." side="left">
        <h4>The council / Judges</h4><FactList entries={event.judges} pending="Judge dossiers will be released soon." />
        <h4>Our allies / Sponsors</h4><FactList entries={event.sponsors} pending="Sponsor announcements are on their way." />
        <h4>Establish contact</h4><FactList entries={event.contacts} pending="Organizer contact details will be published here." />
        <FactList entries={event.socialLinks} pending="" />
      </Panel>
      <Panel name="finale" id="S10" kicker="06 / YOUR NEXT CASE" title="JOIN THE HUNT." side="center">
        <p className="bunker-lede">The evidence brought you here.<br />The next move is yours.</p>
        {event.registrationUrl ? <a className="bunker-join" href={event.registrationUrl}>REGISTER FOR THE HUNT <span>↗</span></a>
          : <p className="bunker-registration-pending">REGISTRATION OPENS SOON</p>}
        <p className="bunker-margin-note">{event.title}</p>
        <a className="bunker-revisit" href="#bunker-about" onClick={e => { e.preventDefault(); navigate('bunker-about') }}>Revisit the case files ↑</a>
      </Panel>
    </div>
    <div className="bunker-progress" aria-hidden="true"><span /></div>
  </>
}
