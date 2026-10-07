// Normalized coordinates on the original bunker plate, measured from top-left.
// These remain independent of viewport size, cover cropping and camera entry.
export const bunkerAnchors = {
  caseBoard: { x: 0.18, y: 0.39 },
  centerDesk: { x: 0.50, y: 0.81 },
  pocketWatch: { x: 0.426, y: 0.727 },
  caseJournal: { x: 0.534, y: 0.733 },
  map: { x: 0.513, y: 0.64 },
  artifact: { x: 0.585, y: 0.704 },
  radio: { x: 0.803, y: 0.482 },
  archiveShelf: { x: 0.866, y: 0.38 },
  judgeDossiers: { x: 0.457, y: 0.341 },
  prizeDisplay: { x: 0.906, y: 0.337 },
} as const

export type BunkerAnchorName = keyof typeof bunkerAnchors
