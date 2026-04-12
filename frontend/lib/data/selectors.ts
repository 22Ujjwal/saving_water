import type { BuildingCandidate } from '@/types/building'
import type { AppSelectionState } from '@/types/state'

export function filterBuildings(
  buildings: BuildingCandidate[],
  metroId: string | null,
  filters: AppSelectionState['filters']
): BuildingCandidate[] {
  return buildings.filter((b) => {
    if (metroId && b.metro_id !== metroId) return false
    if (filters.coolingTowerOnly && !b.cooling_tower_present) return false
    if (filters.roofAboveThreshold && b.roof_area_sqft < 150000) return false
    if (filters.highWaterCostOnly && b.water_rate_per_kgal < 7) return false
    if (filters.esgPrioritizedOnly && b.esg_score_proxy < 80) return false
    if (b.viability_score < filters.minViabilityScore) return false
    if (b.cv_confidence_score < filters.minCvConfidence) return false
    return true
  })
}
