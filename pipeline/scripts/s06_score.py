"""
Step 6: Apply the 5-dimension Viability Scoring formula to every building,
        then produce the final output files:
          - output/buildings.json   (per-building records, top 50/state)
          - output/state_scores.json (aggregate market readiness per state)

Viability Score = weighted sum of 5 dimensions (each 0–100):
  Physical     (25%): roof area tier + cooling tower flag
  Financial    (25%): estimated annual water savings vs local rate
  Regulatory   (20%): state regulatory/incentive environment
  ESG          (20%): placeholder (50); upgraded if SBTi/LEED data available
  Climate Risk (10%): drought + water scarcity pressure
"""

import sys
import json
import logging
from pathlib import Path

import numpy as np
import pandas as pd
import geopandas as gpd
from pyproj import Transformer

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import (
    TARGET_STATES,
    DATA_PROC,
    OUTPUT_DIR,
    BUILDINGS_JSON,
    STATE_SCORES_JSON,
    STATE_WATER_RATES,
    SEWER_RATE_MULTIPLIER,
    SEWER_DISCHARGE_FRACTION,
    REGULATORY_SCORES,
    DROUGHT_INDEX,
    SCORE_WEIGHTS,
    RUNOFF_COEFFICIENT,
    GALLON_PER_SQFT_INCH,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# Buildings to include per state in buildings.json (stratified grid sample)
STATE_SAMPLE_BUDGET = {
    "TX": 400, "CA": 400, "PA": 400,   # large states
    "AZ": 300,                           # small state
}

# Financial score: annual savings that maps to score=100
FINANCIAL_SCORE_MAX_SAVINGS = 75_000   # $75k/yr → score 100

# Physical score: roof area that maps to score=100 (beyond this it's still 100)
PHYSICAL_SCORE_MAX_SQFT = 500_000

# Stratified grid sampling constants
GRID_CELL_SIZE_M      = 25_000   # 25km cells in EPSG:5070
METRO_BIAS_FACTOR     = 2.0      # metro cells get 2× slots vs rural
METRO_DENSITY_PCTILE  = 75       # top-quartile cell density defines "metro"


# ── Scoring functions ──────────────────────────────────────────────────────────

def score_physical(row) -> float:
    """
    25% of total score.
    Components: roof area tier (70%) + cooling tower presence (30%).
    """
    area_norm = min(row["roof_area_sqft"] / PHYSICAL_SCORE_MAX_SQFT, 1.0)
    cooling   = 1.0 if row.get("cooling_tower") else 0.0
    raw = area_norm * 0.70 + cooling * 0.30
    return round(raw * 100, 1)


def score_financial(row) -> float:
    """
    25% of total score.
    Formula: annual_harvestable_gallons × (water_rate + sewer_avoidance).
    """
    state = row.get("state", "")
    water_rate  = STATE_WATER_RATES.get(state, 5.0)   # $/kgal
    sewer_rate  = water_rate * SEWER_RATE_MULTIPLIER

    precip  = float(row.get("annual_precip_in", 20.0))
    area    = float(row.get("roof_area_sqft", 0))

    # Annual harvestable gallons
    yield_gal = area * (precip / 12.0) * GALLON_PER_SQFT_INCH * RUNOFF_COEFFICIENT

    water_savings = (yield_gal / 1000.0) * water_rate
    sewer_savings = (yield_gal / 1000.0) * sewer_rate * SEWER_DISCHARGE_FRACTION
    total_savings = water_savings + sewer_savings

    # Store computed values back (used in output JSON)
    row["annual_harvestable_gallons"] = round(yield_gal)
    row["annual_water_savings"]       = round(water_savings, 2)
    row["annual_sewer_savings"]       = round(sewer_savings, 2)
    row["annual_total_savings"]       = round(total_savings, 2)
    row["water_rate_per_kgal"]        = water_rate

    norm = min(total_savings / FINANCIAL_SCORE_MAX_SAVINGS, 1.0)
    return round(norm * 100, 1)


def score_regulatory(row) -> float:
    """20% of total score. State-level pre-scored lookup."""
    return float(REGULATORY_SCORES.get(row.get("state", ""), 50))


def score_esg(_row) -> float:
    """
    20% of total score.
    Defaults to 50 (neutral). Upgraded to 80 if building owner is in SBTi list.
    SBTi enrichment is a future step — placeholder here.
    """
    return 50.0


def score_climate_risk(row) -> float:
    """10% of total score. State drought/water-scarcity pressure."""
    return float(DROUGHT_INDEX.get(row.get("state", ""), 50))


def compute_viability_score(row: pd.Series) -> dict:
    """
    Compute all dimension scores and the weighted composite.
    Modifies row in-place for computed financial fields.
    Returns dict of score breakdown.
    """
    # Pass as mutable dict so financial scores can store computed values
    r = row.to_dict()

    s_physical     = score_physical(r)
    s_financial    = score_financial(r)   # also populates financial fields in r
    s_regulatory   = score_regulatory(r)
    s_esg          = score_esg(r)
    s_climate_risk = score_climate_risk(r)

    composite = (
        s_physical     * SCORE_WEIGHTS["physical"]     +
        s_financial    * SCORE_WEIGHTS["financial"]     +
        s_regulatory   * SCORE_WEIGHTS["regulatory"]   +
        s_esg          * SCORE_WEIGHTS["esg"]           +
        s_climate_risk * SCORE_WEIGHTS["climate_risk"]
    )

    return {
        "viability_score": round(composite, 1),
        "score_physical":     s_physical,
        "score_financial":    s_financial,
        "score_regulatory":   s_regulatory,
        "score_esg":          s_esg,
        "score_climate_risk": s_climate_risk,
        # Financial computed values
        "annual_harvestable_gallons": r.get("annual_harvestable_gallons", 0),
        "annual_water_savings":       r.get("annual_water_savings", 0.0),
        "annual_sewer_savings":       r.get("annual_sewer_savings", 0.0),
        "annual_total_savings":       r.get("annual_total_savings", 0.0),
        "water_rate_per_kgal":        r.get("water_rate_per_kgal", 0.0),
    }


def score_state(gdf: gpd.GeoDataFrame, state_abbr: str) -> pd.DataFrame:
    log.info(f"[{state_abbr}] Scoring {len(gdf):,} buildings ...")
    records = []
    for _, row in gdf.iterrows():
        scores = compute_viability_score(row)
        rec = {
            "building_id":              row.get("building_id", ""),
            "state":                    row.get("state", state_abbr),
            "county_fips":              row.get("county_fips", ""),
            "county_name":              row.get("county_name", ""),
            "city_name":                row.get("city_name", ""),
            "address":                  row.get("address", "") or row.get("fac_address", ""),
            "fac_name":                 row.get("fac_name", ""),
            "building_class":           row.get("building_class", "commercial"),
            "centroid_lat":             row.get("centroid_lat"),
            "centroid_lon":             row.get("centroid_lon"),
            "roof_area_sqft":           int(row.get("roof_area_sqft", 0)),
            "cooling_tower":            bool(row.get("cooling_tower", False)),
            "cooling_tower_confidence": round(float(row.get("cooling_tower_confidence", 0.0)), 2),
            "cooling_tower_source":     row.get("cooling_tower_source", "none"),
            "annual_rainfall_in":       float(row.get("annual_precip_in", 0.0)),
            **scores,
        }
        records.append(rec)

    df = pd.DataFrame(records)
    df = df.sort_values("viability_score", ascending=False)
    log.info(
        f"[{state_abbr}] Score range: "
        f"{df['viability_score'].min():.1f} – {df['viability_score'].max():.1f}"
    )
    return df


def build_state_summary(df: pd.DataFrame, state_abbr: str) -> dict:
    """Aggregate metrics for state_scores.json."""
    ct_pct = df["cooling_tower"].mean() if len(df) > 0 else 0.0
    top_drivers = []
    if STATE_WATER_RATES.get(state_abbr, 5) > 7:
        top_drivers.append("High water utility costs")
    if DROUGHT_INDEX.get(state_abbr, 50) > 70:
        top_drivers.append("Drought & water scarcity pressure")
    if REGULATORY_SCORES.get(state_abbr, 50) > 75:
        top_drivers.append("Strong regulatory / incentive environment")
    if ct_pct > 0.3:
        top_drivers.append("High cooling tower density")
    if not top_drivers:
        top_drivers = ["Commercial building density", "Rainfall availability"]

    return {
        "state": state_abbr,
        "market_readiness_score": round(df["viability_score"].mean(), 1),
        "top_drivers": top_drivers[:3],
        "candidate_count": len(df),
        "avg_roof_area_sqft": int(df["roof_area_sqft"].mean()),
        "pct_cooling_tower": round(ct_pct, 3),
        "avg_annual_rainfall_in": round(df["annual_rainfall_in"].mean(), 1),
        "avg_annual_savings_usd": round(df["annual_total_savings"].mean(), 0),
        "top_building_score": df["viability_score"].max(),
    }


def to_building_record(row: pd.Series) -> dict:
    """Format a single building for buildings.json."""
    return {
        "building_id":   row["building_id"],
        "address":       row["address"] or row.get("fac_name", ""),
        "facility_name": row.get("fac_name", ""),
        "coordinates":   [row["centroid_lat"], row["centroid_lon"]],
        "state":         row["state"],
        "city":          row.get("city_name", ""),
        "county":        row.get("county_name", ""),
        "county_fips":   row.get("county_fips", ""),
        "building_class": row.get("building_class", "commercial"),
        "roof_area_sqft": row["roof_area_sqft"],
        "cooling_tower":  row["cooling_tower"],
        "cooling_tower_source":     row.get("cooling_tower_source", "none"),
        "cooling_tower_confidence": row["cooling_tower_confidence"],
        "annual_rainfall_in":        row["annual_rainfall_in"],
        "annual_harvestable_gallons": int(row["annual_harvestable_gallons"]),
        "water_rate_per_kgal":        row["water_rate_per_kgal"],
        "annual_water_savings_usd":   row["annual_water_savings"],
        "annual_sewer_savings_usd":   row["annual_sewer_savings"],
        "annual_total_savings_usd":   row["annual_total_savings"],
        "viability_score": row["viability_score"],
        "score_breakdown": {
            "physical":     row["score_physical"],
            "financial":    row["score_financial"],
            "regulatory":   row["score_regulatory"],
            "esg":          row["score_esg"],
            "climate_risk": row["score_climate_risk"],
        },
        "satellite_tile_path": f"tiles/{row['building_id']}.jpg",
    }


def stratified_sample(df: pd.DataFrame, budget: int) -> pd.DataFrame:
    """
    Select `budget` buildings from `df` using a 25km grid with metro bias.

    Algorithm:
      1. Project centroids to EPSG:5070, assign each to a 25km grid cell.
      2. Count buildings per cell; top-quartile cells are "metro" → get 2× weight.
      3. Allocate slots proportionally (min 1 per cell), take top-k per cell by score.
      4. Trim/backfill to hit exactly `budget`.
    """
    if len(df) <= budget:
        return df

    df = df.copy().reset_index(drop=True)

    # Project centroids to metric CRS
    tr = Transformer.from_crs("EPSG:4326", "EPSG:5070", always_xy=True)
    xs, ys = tr.transform(df["centroid_lon"].values, df["centroid_lat"].values)

    df["_cx"] = (xs // GRID_CELL_SIZE_M).astype(int)
    df["_cy"] = (ys // GRID_CELL_SIZE_M).astype(int)
    df["_cell"] = df["_cx"].astype(str) + ":" + df["_cy"].astype(str)

    # Per-cell building counts
    counts = df.groupby("_cell").size()
    metro_thresh = float(np.percentile(counts.values, METRO_DENSITY_PCTILE))

    df["_weight"] = df["_cell"].map(counts).ge(metro_thresh).map(
        {True: METRO_BIAS_FACTOR, False: 1.0}
    )

    # Allocate slots per cell (proportional to weighted count, min 1)
    cell_info = df.groupby("_cell").agg(
        count=("building_id", "count"),
        weight=("_weight", "first"),
    )
    cell_info["wc"] = cell_info["count"] * cell_info["weight"]
    cell_info["slots"] = (
        (cell_info["wc"] / cell_info["wc"].sum() * budget)
        .round()
        .astype(int)
        .clip(lower=1)
    )

    # Select top-k per cell by viability_score
    selected_idx = []
    for cell_id, cell_df in df.groupby("_cell"):
        k = int(cell_info.loc[cell_id, "slots"])
        selected_idx.extend(cell_df.nlargest(k, "viability_score").index.tolist())

    result = df.loc[selected_idx].sort_values("viability_score", ascending=False)

    # Trim or backfill to exact budget
    if len(result) > budget:
        result = result.head(budget)
    elif len(result) < budget:
        gap = budget - len(result)
        extras = df[~df.index.isin(selected_idx)].nlargest(gap, "viability_score")
        result = pd.concat([result, extras]).sort_values("viability_score", ascending=False)

    return result.drop(columns=["_cx", "_cy", "_cell", "_weight"], errors="ignore")


def run(states: dict = None):
    states = states or TARGET_STATES
    all_buildings   = []
    state_summaries = {}

    for _, state_abbr in states.items():
        addressed_path = DATA_PROC / f"buildings_addressed_{state_abbr}.gpkg"
        if not addressed_path.exists():
            log.warning(
                f"[{state_abbr}] Missing buildings_addressed file — "
                "trying buildings_rainfall as fallback."
            )
            addressed_path = DATA_PROC / f"buildings_rainfall_{state_abbr}.gpkg"
        if not addressed_path.exists():
            log.error(f"[{state_abbr}] No input file found. Run previous steps first.")
            continue

        gdf     = gpd.read_file(addressed_path, layer="buildings")
        scored  = score_state(gdf, state_abbr)

        # State summary uses all buildings
        state_summaries[state_abbr] = build_state_summary(scored, state_abbr)

        # buildings.json uses stratified grid sample
        budget = STATE_SAMPLE_BUDGET.get(state_abbr, 300)
        top = stratified_sample(scored, budget)
        all_buildings.extend(top.apply(to_building_record, axis=1).tolist())
        log.info(f"[{state_abbr}] {len(top)} buildings selected via stratified grid sample.")

    # Write buildings.json
    with open(BUILDINGS_JSON, "w") as f:
        json.dump(all_buildings, f, indent=2, default=str)
    log.info(f"Written {len(all_buildings)} buildings → {BUILDINGS_JSON}")

    # Write state_scores.json
    with open(STATE_SCORES_JSON, "w") as f:
        json.dump(state_summaries, f, indent=2, default=str)
    log.info(f"Written {len(state_summaries)} state summaries → {STATE_SCORES_JSON}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        abbrs = set(sys.argv[1:])
        states = {k: v for k, v in TARGET_STATES.items() if v in abbrs}
    else:
        states = TARGET_STATES
    run(states)
