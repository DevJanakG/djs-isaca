import { getAudioEnabled, setAudioEnabled, subscribeAudio } from '../../architecture/audioState'

// S02 remains the sole owner of the continuous bunker hum.
export function createBunkerEffects() {
  const files = { page: 'page-turn.mp3', drawer: 'drawer-open.mp3', watch: 'clock-tick.mp3', radio: 'radio-static.mp3' }
  type Name = keyof typeof files
  const tracks = Object.fromEntries(Object.entries(files).map(([name, file]) => {
    const track = new Audio(`/s03/audio/${file}`)
    track.preload = 'none'
    track.loop = name === 'watch' || name === 'radio'
    track.volume = name === 'radio' ? .035 : name === 'watch' ? .055 : .10
    return [name, track]
  })) as Record<Name, HTMLAudioElement>
  const pending = new Set<HTMLAudioElement>()
  const fired = new Set<string>()
  let generation = 0
  let previous = 0
  let progress = 0
  let present = false
  const allowed = () => present && getAudioEnabled() && !document.hidden
  const play = (name: Name) => {
    const track = tracks[name]
    if (!allowed() || !track.paused || pending.has(track)) return
    const token = generation
    pending.add(track)
    void track.play().then(() => {
      if (token !== generation || !allowed()) track.pause()
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'NotAllowedError') setAudioEnabled(false)
    }).finally(() => pending.delete(track))
  }
  const pause = () => { generation++; Object.values(tracks).forEach(track => track.pause()) }
  const sync = () => {
    if (!allowed()) { pause(); return }
    if (progress >= .43 && progress < .58) play('watch')
    else tracks.watch.pause()
    if (progress >= .74 && progress < .88) play('radio')
    else tracks.radio.pause()
  }
  const unsubscribe = subscribeAudio(sync)
  document.addEventListener('visibilitychange', sync)
  return {
    update(value: number, active: boolean) {
      progress = value
      const changed = active !== present
      present = active
      const advancing = value > previous && value - previous < .12
      for (const [at, name, key] of [[.335, 'page', 'journal'], [.635, 'drawer', 'rules'], [.675, 'drawer', 'prizes'], [.715, 'drawer', 'faq']] as const) {
        if (advancing && previous < at && value >= at && !fired.has(key)) {
          fired.add(key)
          play(name)
        }
      }
      if (changed || (previous >= .43 && previous < .58) !== (value >= .43 && value < .58) ||
        (previous >= .74 && previous < .88) !== (value >= .74 && value < .88)) sync()
      previous = value
    },
    dispose() {
      present = false
      unsubscribe()
      document.removeEventListener('visibilitychange', sync)
      pause()
      Object.values(tracks).forEach(track => { track.removeAttribute('src'); track.load() })
    },
  }
}
