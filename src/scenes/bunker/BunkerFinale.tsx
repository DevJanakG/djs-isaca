export function BunkerSeal() {
  return <svg viewBox="0 0 240 240" fill="none" aria-hidden="true">
      <circle cx="120" cy="120" r="108" /><circle cx="120" cy="120" r="96" />
      <path d="M120 37 191 161H49Z M120 203 49 79h142Z M120 54v132 M63 87l114 66 M63 153l114-66" />
      <circle cx="120" cy="120" r="28" /><path d="M109 110v20m22-20v20m-22-10h22" />
      <path d="M120 8v14m0 196v14M8 120h14m196 0h14" />
    </svg>
}

export default function BunkerFinale() {
  return <div className="bunker-object bunker-seal" data-object="finale">
    <BunkerSeal />
  </div>
}
