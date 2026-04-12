import type { StateScore } from '@/types/state'
import type { BuildingCandidate } from '@/types/building'
import stateScoresRaw from '@/data/state_scores.json'
import buildingsRaw from '@/data/buildings.json'

export function loadStateScores(): StateScore[] {
  return stateScoresRaw as StateScore[]
}

export function loadBuildings(): BuildingCandidate[] {
  return buildingsRaw as BuildingCandidate[]
}
