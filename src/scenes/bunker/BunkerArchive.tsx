const labels = ['HUNTER’S CODE', 'BOUNTIES', 'OPEN QUESTIONS']
export default function BunkerArchive() {
  return <div className="bunker-object bunker-archive" data-object="archive">
    <div className="bunker-cabinet-heading">ISACA / CASE ARCHIVE</div>
    {labels.map((label, index) => <div className="bunker-drawer-slot" key={label}>
      <div className="bunker-drawer-paper"><span>0{index + 1}</span><i /><i /><i /></div>
      <div className="bunker-drawer-front" data-drawer={index}>
        <span>{label}</span><i className="bunker-drawer-handle" /><small>FILE 0{index + 1}</small>
      </div>
    </div>)}
    <div className="bunker-cabinet-feet" />
  </div>
}
