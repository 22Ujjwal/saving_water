"""
Shared configuration, static lookup tables, and constants for the RainUse Nexus pipeline.
All scripts import from here.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

# ── Directories ────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent
DATA_RAW   = BASE_DIR / "data" / "raw"
DATA_PROC  = BASE_DIR / "data" / "processed"
OUTPUT_DIR = BASE_DIR / "output"
TILES_DIR  = OUTPUT_DIR / "tiles"

for d in [DATA_RAW, DATA_PROC, OUTPUT_DIR, TILES_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── Target states ──────────────────────────────────────────────────────────────
TARGET_STATES = {
    "Texas":        "TX",
    "California":   "CA",
    "Arizona":      "AZ",
    "Pennsylvania": "PA",
}
# Maps 2-letter code → full name (for download URLs)
STATE_ABBR_TO_NAME = {v: k for k, v in TARGET_STATES.items()}

# ── Microsoft Building Footprints ──────────────────────────────────────────────
# URL pattern for each state's GeoJSON zip
MS_FOOTPRINTS_URL = (
    "https://usbuildingdata.blob.core.windows.net/usbuildings-v2/{state_name}.geojsonl.zip"
)
ROOF_AREA_MIN_SQFT = 100_000  # flag buildings larger than this

# ── EPA FRS ────────────────────────────────────────────────────────────────────
# State single-file CSV download page (manual download or scraped)
EPA_FRS_BASE_URL = "https://www.epa.gov/frs/epa-frs-facilities-state-single-file-csv-download"
# Direct S3/FTP download pattern (confirmed working):
EPA_FRS_DOWNLOAD_URL = (
    "https://ordsext.epa.gov/FLA/www3/state_files/{state_abbr_lower}_FACILITIES.zip"
)

# NAICS prefixes (4-digit) that reliably indicate cooling tower presence
# Value = (industry description, cooling_tower_confidence 0–1)
COOLING_TOWER_NAICS = {
    "2211": ("Electric Power Generation/Transmission", 0.98),
    "2212": ("Natural Gas Distribution", 0.85),
    "3241": ("Petroleum Refineries", 0.98),
    "3312": ("Steel Mills", 0.92),
    "3252": ("Resin & Synthetic Rubber Mfg", 0.88),
    "3251": ("Basic Chemical Mfg", 0.87),
    "3253": ("Pesticide/Agricultural Chemical Mfg", 0.85),
    "3559": ("Industrial Machinery Mfg", 0.82),
    "3119": ("Other Food Mfg", 0.75),
    "6221": ("General Medical & Surgical Hospitals", 0.90),
    "7211": ("Hotels & Motels (except Casino Hotels)", 0.80),
    "7212": ("Casino Hotels", 0.82),
    "5182": ("Data Processing & Hosting", 0.85),
    "5171": ("Wired Telecommunications Carriers", 0.78),
    "4931": ("Electric Bulk Power Transmission", 0.95),
    "3272": ("Glass Product Mfg from Purchased Glass", 0.80),
    "3221": ("Pulp, Paper & Paperboard Mills", 0.90),
}

# ── Water / financial rates (state-level averages) ────────────────────────────
# Source: worldpopulationreview.com/state-rankings/water-prices-by-state (2024)
# Units: $/1,000 gallons ($/kgal)
STATE_WATER_RATES = {
    "TX": 5.20,
    "CA": 9.80,
    "NY": 10.50,
    "AZ": 4.90,
    "PA": 8.30,
    "FL": 4.10,
    "IL": 7.20,
    "WA": 6.80,
    "CO": 5.60,
    "NV": 5.10,
}

# Sewer/discharge rate as fraction of water rate (typical municipal ratio)
SEWER_RATE_MULTIPLIER = 0.85  # sewer ≈ 85% of water cost for most municipalities

# Fraction of harvested water that avoids sewer discharge
SEWER_DISCHARGE_FRACTION = 0.70

# ── Viability scoring weights ──────────────────────────────────────────────────
SCORE_WEIGHTS = {
    "physical":     0.25,
    "financial":    0.25,
    "regulatory":   0.20,
    "esg":          0.20,
    "climate_risk": 0.10,
}

# Pre-scored regulatory environment per state (0–100)
# Based on: active stormwater utility fees, state harvesting incentives, permit clarity
REGULATORY_SCORES = {
    "TX": 75,   # TCEQ framework, active incentives, clear permit path
    "CA": 85,   # Strict water regulations → high urgency, strong incentive programs
    "NY": 80,   # NYC stormwater credit program, high water costs
    "AZ": 70,   # Water scarcity drives urgency, some municipal rebates
    "PA": 82,   # Philadelphia Stormwater Billing (impervious surface fee is large)
    "FL": 65,
    "WA": 72,
    "CO": 68,
    "NV": 73,
    "IL": 62,
}

# Drought / climate risk index per state (0–100, higher = more urgent)
# Based on: NOAA drought monitor, EPA climate risk, water restriction history
DROUGHT_INDEX = {
    "TX": 65,
    "CA": 90,
    "NY": 30,
    "AZ": 95,
    "PA": 28,
    "FL": 55,
    "WA": 45,
    "CO": 72,
    "NV": 93,
    "IL": 35,
}

# ── Rainfall physics constants ─────────────────────────────────────────────────
RUNOFF_COEFFICIENT   = 0.85   # collection efficiency for flat commercial roofs
GALLON_PER_SQFT_INCH = 0.623  # gallons collected per sqft per inch of rain

# ── NOAA Climate Normals ───────────────────────────────────────────────────────
# 1991-2020 US Climate Normals hosted on AWS Open Data
NOAA_NORMALS_S3 = "s3://noaa-climate-normals-pds/normals-annualseasonal/1991-2020/"
# CDO API (free, requires registration)
NOAA_CDO_API_BASE = "https://www.ncei.noaa.gov/access/services/data/v1"
NOAA_CDO_TOKEN    = os.getenv("NOAA_CDO_TOKEN", "")

# ── Census TIGER boundaries ────────────────────────────────────────────────────
CENSUS_COUNTIES_URL = (
    "https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_us_county_500k.zip"
)
CENSUS_PLACES_URL = (
    "https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_us_place_500k.zip"
)

# ── Overture Maps (DuckDB S3 query) ───────────────────────────────────────────
OVERTURE_RELEASE = "2024-07-22.0"
OVERTURE_S3_PATH = (
    f"s3://overturemaps-us-west-2/release/{OVERTURE_RELEASE}"
    "/theme=buildings/type=building/*"
)

# Bounding boxes for target states [min_lon, min_lat, max_lon, max_lat]
STATE_BBOXES = {
    "TX": (-106.65, 25.84,  -93.51, 36.50),
    "CA": (-124.48, 32.53, -114.13, 42.01),
    "AZ": (-114.82, 31.33, -109.05, 37.00),
    "PA": ( -80.52, 39.72,  -74.69, 42.27),
}

# ── Google Maps Static API (Step 7 — CV layer) ────────────────────────────────
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
NOAA_CDO_API_BASE   = "https://www.ncei.noaa.gov/cdo-web/api/v2"
SATELLITE_TILE_ZOOM = 18
SATELLITE_TILE_SIZE = "640x640"

# ── Output files ──────────────────────────────────────────────────────────────
BUILDINGS_JSON   = OUTPUT_DIR / "buildings.json"
STATE_SCORES_JSON = OUTPUT_DIR / "state_scores.json"
