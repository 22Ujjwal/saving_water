import type { BuildingCandidate } from '@/types/building'
import type { RoiResult } from '@/types/roi'
import type { InvestmentBrief } from '@/types/brief'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function calculateRoi(building: BuildingCandidate): Promise<RoiResult> {
  const res = await fetch(`${API_BASE}/roi/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      building_id: building.building_id,
      roof_area_sqft: building.roof_area_sqft,
      annual_rainfall_in: building.annual_rainfall_in,
      harvestable_gal_yr: building.harvestable_gal_yr,
      water_rate_per_kgal: building.water_rate_per_kgal,
      sewer_rate_per_kgal: building.sewer_rate_per_kgal,
      incentive_value_usd: building.incentive_value_usd,
      system_capex_range: building.system_capex_range,
      stormwater_fee_usd_yr: building.stormwater_fee_usd_yr,
    }),
  })
  if (!res.ok) throw new Error(`ROI API error: ${res.status}`)
  return res.json()
}

export async function generateBrief(
  building: BuildingCandidate,
  roi: RoiResult
): Promise<InvestmentBrief> {
  const res = await fetch(`${API_BASE}/brief/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ building, roi }),
  })
  if (!res.ok) throw new Error(`Brief API error: ${res.status}`)
  return res.json()
}

// Mock fallbacks used when the real backend is unavailable
export function mockRoiResult(building: BuildingCandidate): RoiResult {
  return {
    annual_savings_usd: building.annual_water_savings_usd + building.annual_sewer_savings_usd,
    simple_payback_yrs: building.simple_payback_yrs,
    npv_10yr_usd: building.npv_10yr_usd,
    irr_pct: Math.round(18 + building.viability_score * 0.12),
    confidence_adj_roi: building.confidence_adj_roi,
    capex_low: building.system_capex_range[0],
    capex_high: building.system_capex_range[1],
    water_offset_pct: Math.round(40 + building.viability_score * 0.35),
    co2_offset_tons_yr: Math.round(building.harvestable_gal_yr / 50000),
  }
}

export function mockBrief(building: BuildingCandidate, roi: RoiResult): InvestmentBrief {
  return {
    building_id: building.building_id,
    generated_at: new Date().toISOString(),
    executive_summary: `${building.address} presents a high-conviction rainwater harvesting opportunity with a ${roi.simple_payback_yrs.toFixed(1)}-year payback and ${(roi.confidence_adj_roi * 100).toFixed(0)}% confidence-adjusted ROI. Viability score: ${building.viability_score}/100.`,
    opportunity_overview: `This ${building.building_type} operated by ${building.owner_tenant} sits in a ${building.water_stress_tier.toLowerCase()} water-stress zone with ${building.annual_rainfall_in}" annual rainfall and ${building.roof_area_sqft.toLocaleString()} sqft of harvestable roof area.`,
    financial_case: {
      heading: 'Financial Case',
      body: `Annual savings of $${roi.annual_savings_usd.toLocaleString()} (water + sewer combined). CapEx range $${roi.capex_low.toLocaleString()}–$${roi.capex_high.toLocaleString()}. 10-year NPV: $${roi.npv_10yr_usd.toLocaleString()}. Available incentives: $${building.incentive_value_usd.toLocaleString()} (${building.state_incentive_type}).`,
    },
    risk_and_mitigation: {
      heading: 'Risk & Mitigation',
      body: `Drought risk index: ${(building.drought_risk_index * 100).toFixed(0)}/100. CV confidence: ${(building.cv_confidence_score * 100).toFixed(0)}%. Permit pathway: ${building.permit_pathway}. ${building.water_restriction_active ? 'Active water restriction in place — accelerates payback case.' : 'No current restriction — regulatory risk is moderate.'}`,
    },
    regulatory_context: {
      heading: 'Regulatory Context',
      body: `Permit pathway: ${building.permit_pathway}. Regulatory urgency score: ${building.regulatory_urgency}/10. ${building.stormwater_fee_active ? `Active stormwater fee of $${building.stormwater_fee_usd_yr.toLocaleString()}/yr adds to savings case.` : 'No stormwater fee currently active.'} State incentive: ${building.state_incentive_type}.`,
    },
    esg_narrative: {
      heading: 'ESG Narrative',
      body: `ESG score proxy: ${building.esg_score_proxy}/100. ${building.sbti_committed ? `SBTi committed — net-zero target year ${building.net_zero_pledge_yr}.` : 'Not yet SBTi committed.'} ${building.leed_certified ? 'LEED certified — aligns with existing sustainability infrastructure.' : ''} ${building.water_risk_in_10k ? 'Water risk disclosed in 10-K filing: "' + building.sec_filing_snippet.slice(0, 120) + '..."' : ''}`,
    },
    recommended_next_steps: [
      'Schedule on-site roof inspection and structural assessment',
      'Obtain detailed water utility rate schedule from local authority',
      `Submit ${building.state_incentive_type} pre-application within 30 days`,
      'Engage facilities team to review cooling tower blowdown reuse potential',
      'Prepare preliminary system design for permit submission',
    ],
    confidence_note: `This brief is generated from preprocessed satellite CV data (${building.imagery_source}, ${building.imagery_date}) and pre-scored building records. All financial estimates assume standard system sizing. On-site verification required before final investment decision.`,
  }
}
