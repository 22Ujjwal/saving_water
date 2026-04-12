export type RoiResult = {
  annual_harvestable_gal: number;
  annual_water_savings_usd: number;
  annual_sewer_savings_usd: number;
  capex_range: [number, number];
  payback_yrs: number;
  npv_10yr_usd: number;
  base_roi_percent: number;
  confidence_adj_roi_percent: number;
};
