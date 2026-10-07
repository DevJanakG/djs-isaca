// The environmental radio stays in the original plate. Only its glow and the
// foreground dossiers are separate layers; no replacement photograph is needed.
export default function BunkerRadio() {
  return <>
    <div className="bunker-object bunker-radio-light" data-object="radio-light" />
    <div className="bunker-object bunker-dossiers" data-object="radio">
      <div className="bunker-dossier bunker-dossier--back"><span>ALLIES / THE HUNT</span></div>
      <div className="bunker-dossier"><span>COUNCIL DOSSIERS</span><i /><small>DJS ISACA<br />INVESTIGATION DIVISION</small><b>CLASSIFIED</b></div>
    </div>
  </>
}
