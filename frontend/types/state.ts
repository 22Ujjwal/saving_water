export type ScoreBreakdown = {
  water_cost_pressure: number
  rainfall_availability: number
  building_density: number
  regulatory_friendliness: number
  drought_resilience_pressure: number
}

export type MetroSummary = {
  metro_id: string
  metro_name: string
  score: number
  lat: number
  lng: number
  top_drivers: string[]
}

export type StateScore = {
  state_id: string
  state_name: string
  market_readiness_score: number
  top_drivers: string[]
  score_breakdown: ScoreBreakdown
  metros: MetroSummary[]
}

export type AppSelectionState = {
  selectedStateId: string | null
  selectedMetroId: string | null
  selectedBuildingId: string | null
  mapMode: 'national' | 'state' | 'metro' | 'building'
  filters: {
    roofAboveThreshold: boolean
    coolingTowerOnly: boolean
    highWaterCostOnly: boolean
    esgPrioritizedOnly: boolean
    minViabilityScore: number
    minCvConfidence: number
  }
}
