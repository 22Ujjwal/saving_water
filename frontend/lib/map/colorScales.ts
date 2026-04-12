// Score colour ramps — all scores are 0-100
// Dark-professional palette: grey base → amber → teal

export const STATE_CHOROPLETH_COLORS = [
  [0, '#1e2533'],
  [40, '#2d3a52'],
  [55, '#3a5068'],
  [65, '#2e6b7a'],
  [75, '#1e8a7a'],
  [85, '#12a67a'],
  [95, '#00c87a'],
] as const

/** Returns a MapLibre expression for choropleth fill-color (satellite-optimised palette) */
export function stateChoroplethExpression(): unknown[] {
  return [
    'interpolate',
    ['linear'],
    ['get', 'market_readiness_score'],
    0,  '#fbbf24',
    50, '#f59e0b',
    65, '#10b981',
    75, '#06d6a0',
    85, '#00e5a0',
    95, '#00f5c4',
  ]
}

/** Returns a MapLibre expression for building viability fill-color */
export function buildingViabilityExpression(): unknown[] {
  return [
    'interpolate',
    ['linear'],
    ['get', 'viability_score'],
    0,  '#64748b',
    50, '#f59e0b',
    75, '#10b981',
    90, '#06d6a0',
    100,'#00f5c4',
  ]
}

/** Tailwind-safe hex for score bands (used in React components) */
export function scoreColor(score: number): string {
  if (score >= 90) return '#00c87a'
  if (score >= 75) return '#12a67a'
  if (score >= 65) return '#2e6b7a'
  if (score >= 50) return '#f59e0b'
  return '#64748b'
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Exceptional'
  if (score >= 75) return 'Strong'
  if (score >= 65) return 'Moderate'
  if (score >= 50) return 'Low'
  return 'Minimal'
}
