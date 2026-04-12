export function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export function formatGallons(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M gal/yr`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K gal/yr`
  return `${value.toFixed(0)} gal/yr`
}

export function formatSqft(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K sqft`
  return `${value.toFixed(0)} sqft`
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(0)}%`
}

export function formatScore(value: number): string {
  return value.toFixed(0)
}

export function formatConfidence(value: number): string {
  return `${(value * 100).toFixed(0)}%`
}

export function angleLabel(angle: string): string {
  const map: Record<string, string> = {
    cost_savings: 'Cost Savings',
    resilience: 'Resilience',
    compliance: 'Compliance',
    esg_credibility: 'ESG Credibility',
  }
  return map[angle] ?? angle
}
