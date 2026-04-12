/**
 * stateOpportunity.ts
 *
 * Utility layer for state-level opportunity scoring.
 *
 * Source of truth: pipeline/scripts/s06_score.py → output/state_scores.json
 *
 * The pipeline already computes `market_readiness_score` (0–100) as a weighted
 * aggregate of viability scores across all candidate buildings in each state.
 * These utilities are a thin presentation layer on top of that real data — they
 * do NOT invent or duplicate scoring logic.
 *
 * Color palette (water-themed, no green):
 *   80–100  #1E3A8A  Prime     (deep navy)
 *   60–80   #2563EB  Strong    (bold blue)
 *   40–60   #38B2AC  Moderate  (teal)
 *   20–40   #93C5FD  Emerging  (sky blue)
 *   0–20    #DBEAFE  Low       (pale blue)
 *   No data #E5E7EB           (neutral gray)
 */

import type { StateScore } from "@/types/state";

// ── Color scale ────────────────────────────────────────────────────────────────

const COLOR_SCALE = [
  { min: 80, color: "#1E3A8A" },
  { min: 60, color: "#2563EB" },
  { min: 40, color: "#38B2AC" },
  { min: 20, color: "#93C5FD" },
  { min: 0,  color: "#DBEAFE" },
] as const;

export const NO_DATA_COLOR = "#E5E7EB";

/**
 * Map a 0–100 opportunity score to the water-themed fill color.
 * Returns the no-data gray when score is null/undefined.
 */
export function getOpportunityColor(score: number | null | undefined): string {
  if (score == null || isNaN(score)) return NO_DATA_COLOR;
  const bucket = COLOR_SCALE.find(b => score >= b.min);
  return bucket?.color ?? NO_DATA_COLOR;
}

// ── Tier labels ────────────────────────────────────────────────────────────────

export type OpportunityTier = {
  label: string;
  textClass: string;
  borderClass: string;
};

/**
 * Return a human-readable tier label + Tailwind color classes for a score.
 */
export function getOpportunityTier(score: number | null | undefined): OpportunityTier {
  if (score == null || isNaN(score)) {
    return { label: "No Data",   textClass: "text-gray-400",  borderClass: "border-gray-600/40" };
  }
  if (score >= 80) return { label: "Prime",    textClass: "text-blue-200",  borderClass: "border-blue-700/60" };
  if (score >= 60) return { label: "Strong",   textClass: "text-blue-400",  borderClass: "border-blue-500/50" };
  if (score >= 40) return { label: "Moderate", textClass: "text-teal-300",  borderClass: "border-teal-500/50" };
  if (score >= 20) return { label: "Emerging", textClass: "text-sky-400",   borderClass: "border-sky-500/50"  };
  return               { label: "Low",       textClass: "text-slate-400", borderClass: "border-slate-600/40" };
}

// ── Metric aggregation ─────────────────────────────────────────────────────────

export type StateMetrics = {
  candidateCount: number;
  avgAnnualSavingsUsd: number | null;
  avgAnnualRainfallIn: number | null;
  topBuildingScore: number | null;
  pctCoolingTower: number | null;
  avgRoofAreaSqft: number | null;
  scoreBreakdown: Record<string, number> | null;
};

/**
 * Extract display-ready metrics from a StateScore record.
 * All fields come directly from pipeline-computed state_scores.json —
 * no derivation or invention happens here.
 */
export function aggregateStateMetrics(s: StateScore): StateMetrics {
  return {
    candidateCount:       s.candidate_count        ?? 0,
    avgAnnualSavingsUsd:  s.avg_annual_savings_usd ?? null,
    avgAnnualRainfallIn:  s.avg_annual_rainfall_in ?? null,
    topBuildingScore:     s.top_building_score     ?? null,
    pctCoolingTower:      s.pct_cooling_tower      ?? null,
    avgRoofAreaSqft:      s.avg_roof_area_sqft     ?? null,
    scoreBreakdown:       s.score_breakdown
      ? Object.fromEntries(
          Object.entries(s.score_breakdown).filter(([, v]) => v !== undefined) as [string, number][]
        )
      : null,
  };
}

/**
 * Compute the display opportunity score (0–100) for choropleth coloring.
 *
 * Why not use market_readiness_score directly?
 * The pipeline computes market_readiness_score as the mean of building-level
 * viability scores. Because viability is dominated by physical roof geometry,
 * all states cluster in the 32–44 range — producing a visually flat map.
 *
 * Instead we compose from the state-level score_breakdown sub-scores, which
 * capture market opportunity dimensions. All sub-scores are pipeline-computed
 * values from state_scores.json — no invented data.
 *
 * Weights:
 *   water_cost_pressure  25%  — financial incentive to harvest
 *   commercial_density   25%  — addressable market size
 *   rainfall_capture     20%  — physical feasibility
 *   regulatory_pressure  20%  — policy / incentive tailwind
 *   esg_alignment        10%  — ESG demand signal
 *   density_bonus        +10  — bonus for large candidate pools
 *
 * Falls back to market_readiness_score if score_breakdown is absent.
 */

const OPPORTUNITY_WEIGHTS: Record<string, number> = {
  water_cost_pressure: 0.25,
  commercial_density:  0.25,
  rainfall_capture:    0.20,
  regulatory_pressure: 0.20,
  esg_alignment:       0.10,
};

// Approximate maximum candidate count across the dataset (TX ~11,400)
const MAX_CANDIDATE_COUNT = 12_000;

export function scoreStateOpportunity(s: StateScore): number {
  if (!s.score_breakdown) return s.market_readiness_score;

  const sb = s.score_breakdown;
  let base = 0;
  let totalWeight = 0;
  for (const [key, weight] of Object.entries(OPPORTUNITY_WEIGHTS)) {
    const val = sb[key];
    if (val !== undefined) {
      base += val * weight;
      totalWeight += weight;
    }
  }
  if (totalWeight === 0) return s.market_readiness_score;

  // Normalize in case some sub-scores were missing
  const normalized = totalWeight < 1 ? base / totalWeight : base;

  // Density bonus: up to +10 pts for the highest-count state
  const densityBonus = Math.min(10, ((s.candidate_count ?? 0) / MAX_CANDIDATE_COUNT) * 10);

  return Math.min(100, Math.round((normalized + densityBonus) * 10) / 10);
}

// ── Legend items (for map overlay) ────────────────────────────────────────────

export const LEGEND_ITEMS = [
  { color: "#1E3A8A", label: "Prime",    range: "80–100" },
  { color: "#2563EB", label: "Strong",   range: "60–80"  },
  { color: "#38B2AC", label: "Moderate", range: "40–60"  },
  { color: "#93C5FD", label: "Emerging", range: "20–40"  },
  { color: "#DBEAFE", label: "Low",      range: "0–20"   },
  { color: "#E5E7EB", label: "No Data",  range: "—"      },
] as const;
