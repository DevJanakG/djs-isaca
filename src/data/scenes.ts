export const scenes = [
  { id: 'S00', title: 'Intro / Darkness', start: 0, end: .08, description: 'Recruitment introduction placeholder.' },
  { id: 'S01', title: 'Highway', start: .08, end: .23, description: 'Road journey placeholder.' },
  { id: 'S02', title: 'Case File', start: .23, end: .34, description: 'Event introduction placeholder.' },
  { id: 'S03', title: 'Investigation Board', start: .34, end: .48, description: 'Cases and investigations placeholder.' },
  { id: 'S04', title: 'Archive', start: .48, end: .57, description: 'Benefits and bounties placeholder.' },
  { id: 'S05', title: 'Bunker', start: .57, end: .70, description: 'Venue, Hunter’s Code and FAQ placeholder.' },
  { id: 'S06', title: 'Timeline', start: .70, end: .76, description: 'Case timeline placeholder.' },
  { id: 'S07', title: 'Encounter', start: .76, end: .84, description: 'Encounter scene placeholder.' },
  { id: 'S08', title: 'Judges', start: .84, end: .90, description: 'Council dossiers placeholder.' },
  { id: 'S09', title: 'Sponsors', start: .90, end: .96, description: 'Allies placeholder.' },
  { id: 'S10', title: 'Finale / Registration', start: .96, end: 1, description: 'Join the Hunt via Unstop.' },
] as const
export type Scene = typeof scenes[number]
export const clamp = (value: number) => Math.min(1, Math.max(0, value))
export const localProgress = (progress: number, scene: Scene) => clamp((progress - scene.start) / (scene.end - scene.start))
export function getScrollState(progress: number) {
  const global = clamp(progress)
  const index = scenes.findIndex(scene => global < scene.end)
  const active = scenes[index < 0 ? scenes.length - 1 : index]
  return { global, active, local: localProgress(global, active) }
}
