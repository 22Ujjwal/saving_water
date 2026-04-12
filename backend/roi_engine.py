# roi_engine.py
from dataclasses import dataclass
from models import BuildingRecord

COLLECTION_EFFICIENCY = 0.85
DISCHARGE_FRACTION = 0.70
GAL_PER_SQFT_PER_INCH = 0.623
CO2_LBS_PER_KGAL = 3.2
DISCOUNT_RATE = 0.05

SCENARIO_MULTIPLIERS = {
    "conservative": {"rainfall": 0.75, "efficiency": 0.80, "capex": 1.15},
    "base":         {"rainfall": 1.00, "efficiency": 0.85, "capex": 1.00},
    "upside":       {"rainfall": 1.15, "efficiency": 0.90, "capex": 0.90},
}

def calc_harvestable_gallons(
    roof_area_sqft: float,
    annual_rainfall_in: float,
    efficiency: float = COLLECTION_EFFICIENCY,
) -> float:
    return roof_area_sqft * annual_rainfall_in * GAL_PER_SQFT_PER_INCH * efficiency

def calc_npv(annual_savings: float, capex: float, years: int = 10) -> float:
    npv = -capex
    for y in range(1, years + 1):
        npv += annual_savings / (1 + DISCOUNT_RATE) ** y
    return npv

def calc_scenario(building: BuildingRecord, scenario: str = "base") -> dict:
    m = SCENARIO_MULTIPLIERS[scenario]
    capex_mid = sum(building.system_capex_range) / 2

    harvestable = calc_harvestable_gallons(
        building.roof_area_sqft,
        building.annual_rainfall_in * m["rainfall"],
        efficiency=m["efficiency"],
    )

    water_savings  = (harvestable / 1000) * building.water_rate_per_kgal
    sewer_savings  = (harvestable / 1000) * building.sewer_rate_per_kgal * DISCHARGE_FRACTION
    stormwater_avoidance = building.stormwater_fee_usd_yr if building.stormwater_fee_active else 0.0
    incentive_annual = building.incentive_value_usd / 10
    total_savings  = water_savings + sewer_savings + stormwater_avoidance + incentive_annual

    capex          = capex_mid * m["capex"]
    payback        = capex / total_savings if total_savings else 0
    npv            = calc_npv(total_savings, capex)
    base_roi       = ((total_savings * 10) - capex) / capex * 100
    adj_roi        = base_roi * building.cv_confidence_score
    co2_offset     = (harvestable / 1000) * CO2_LBS_PER_KGAL

    return {
        "harvestable_gal":              int(harvestable),
        "annual_water_savings_usd":     round(water_savings, 2),
        "annual_sewer_savings_usd":     round(sewer_savings, 2),
        "stormwater_fee_avoidance_usd": round(stormwater_avoidance, 2),
        "total_annual_savings_usd":     round(total_savings, 2),
        "capex_mid_usd":                round(capex, 2),
        "simple_payback_yrs":           round(payback, 1),
        "npv_10yr_usd":                 round(npv, 2),
        "base_roi_pct":                 round(base_roi, 1),
        "confidence_adj_roi_pct":       round(adj_roi, 1),
        "co2_offset_lbs":               int(co2_offset),
        "cv_confidence_pct":            int(building.cv_confidence_score * 100),
    }
