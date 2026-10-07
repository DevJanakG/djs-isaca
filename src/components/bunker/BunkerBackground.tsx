import BunkerAnchors from '../shutter-transition/BunkerAnchors'
import { BUNKER_IMAGE } from './bunkerBackgroundState'

// Rendered once by the persistent bunker stage above the scene sections.
// S02 animates these nodes; S03 inherits them without switching components.
export default function BunkerBackground() {
  return <div className="s02-room" data-bunker-background="persistent">
    <img className="s02-bunker" src={BUNKER_IMAGE} alt="" decoding="async" />
    <div className="s02-bunker-darkness" />
    <BunkerAnchors />
  </div>
}
