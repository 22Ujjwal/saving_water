export type RoiInput = {
  building_id: string
  roof_area_sqft: number
  annual_rainfall_in: number
  harvestable_gal_yr: number
  water_rate_per_kgal: number
  sewer_rate_per_kgal: number
  incentive_value_usd: number
  system_capex_range: [number, number]
  stormwater_fee_usd_yr: number
}

export type RoiResult = {
  annual_savings_usd: number
  simple_payback_yrs: number
  npv_10yr_usd: number
  irr_pct: number
  confidence_adj_roi: number
  capex_low: number
  capex_high: number
  water_offset_pct: number
  co2_offset_tons_yr: number
}
