# models.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional

# ── Input from buildings.json ──────────────────────────────────────────────

class BuildingRecord(BaseModel):
    building_id: str
    address: str
    state: str
    metro: str
    building_type: str
    owner_tenant: Optional[str] = None

    roof_area_sqft: float
    cooling_tower_present: bool
    cooling_tower_count: int = 0
    cv_confidence_score: float = Field(ge=0.0, le=1.0)

    annual_rainfall_in: float
    water_rate_per_kgal: float
    sewer_rate_per_kgal: float
    stormwater_fee_active: bool = False
    stormwater_fee_usd_yr: float = 0.0
    incentive_value_usd: float = 0.0
    system_capex_range: tuple[float, float]

    sbti_committed: bool = False
    net_zero_pledge_yr: Optional[int] = None
    leed_certified: bool = False
    water_risk_in_10k: bool = False
    sec_filing_snippet: Optional[str] = None
    drought_risk_index: float = 0.0

    urgency_score: int = Field(default=5, ge=1, le=10)
    urgency_drivers: list[str] = []
    recommended_angle: Optional[str] = None
    viability_score: float = 0.0

    @field_validator("address", "metro", mode="before")
    @classmethod
    def coerce_str(cls, v):
        if v is None or (isinstance(v, float) and v != v):  # NaN check
            return ""
        return str(v)

    @field_validator("urgency_score", mode="before")
    @classmethod
    def scale_urgency(cls, v):
        v = float(v)
        if v > 10:  # old 0-100 scale from pipeline
            v = round(v / 10)
        return max(1, min(10, int(v)))

# ── ROI request / response ─────────────────────────────────────────────────

class ROIRequest(BaseModel):
    building_id: str
    scenario: str = "base"  # conservative | base | upside

class ROIResponse(BaseModel):
    building_id: str
    scenario: str
    harvestable_gal: int
    annual_water_savings_usd: float
    annual_sewer_savings_usd: float
    stormwater_fee_avoidance_usd: float
    total_annual_savings_usd: float
    capex_mid_usd: float
    simple_payback_yrs: float
    npv_10yr_usd: float
    base_roi_pct: float
    confidence_adj_roi_pct: float
    co2_offset_lbs: int
    cv_confidence_pct: int

# ── /roi/calculate — frontend-compatible ──────────────────────────────────

class RoiCalculateResponse(BaseModel):
    annual_harvestable_gal: int
    annual_water_savings_usd: float
    annual_sewer_savings_usd: float
    capex_range: tuple[float, float]
    payback_yrs: float
    npv_10yr_usd: float
    base_roi_percent: float
    confidence_adj_roi_percent: float

# ── Brief request / response ───────────────────────────────────────────────

class BriefRequest(BaseModel):
    building_id: str

class BriefGenerateRequest(BaseModel):
    building: BuildingRecord
    roi: Optional[dict] = None  # accepted but ROI is recalculated server-side

class KeyMetrics(BaseModel):
    roi: str
    payback: str
    water_savings: str

class BriefResponse(BaseModel):
    building_id: str
    title: str
    executive_summary: str
    key_metrics: KeyMetrics
    recommended_angle: str
    pitch_script: str
    risks_and_mitigation: list[str]
