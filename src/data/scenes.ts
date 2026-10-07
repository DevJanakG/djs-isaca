export const scenes = [
  { id: 'S00', title: 'Intro / Darkness', start: 0, end: .08, description: 'Recruitment introduction placeholder.' },
  { id: 'S01', title: 'Title Sting', start: .08, end: .23, description: 'A 4.1-second supernatural title sting, ending at the closed bunker shutter.' },
  { id: 'S02', title: 'Case File', start: .23, end: .34, description: 'Event introduction placeholder.' },
  { id: 'S03', title: 'The Bunker', start: .34, end: 1, description: 'Investigation, field briefing, schedule, archive, allies, and registration.' },
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
