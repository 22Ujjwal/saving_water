# main.py
import json
import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from models import (
    BuildingRecord, ROIRequest, ROIResponse,
    RoiCalculateResponse, BriefRequest, BriefGenerateRequest, BriefResponse,
)
from roi_engine import calc_scenario
from brief_generator import generate_brief

load_dotenv()
logger = logging.getLogger(__name__)
app = FastAPI(title="RainUSE Nexus API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_data_file = Path("data/buildings.json") if Path("data/buildings.json").exists() else Path("data/buildings_stub.json")
_raw = json.loads(_data_file.read_text())
BUILDINGS: dict[str, BuildingRecord] = {
    b["building_id"]: BuildingRecord(**b) for b in _raw
}


def get_building(building_id: str) -> BuildingRecord:
    if building_id not in BUILDINGS:
        raise HTTPException(status_code=404, detail=f"Building {building_id} not found")
    return BUILDINGS[building_id]


@app.get("/buildings", response_model=list[BuildingRecord])
def list_buildings():
    return list(BUILDINGS.values())


@app.get("/buildings/{building_id}", response_model=BuildingRecord)
def get_building_by_id(building_id: str):
    return get_building(building_id)


@app.post("/roi", response_model=ROIResponse)
def calculate_roi(req: ROIRequest):
    if req.scenario not in ("conservative", "base", "upside"):
        raise HTTPException(status_code=400, detail="scenario must be conservative, base, or upside")
    building = get_building(req.building_id)
    result = calc_scenario(building, req.scenario)
    return ROIResponse(building_id=req.building_id, scenario=req.scenario, **result)


@app.post("/roi/calculate", response_model=RoiCalculateResponse)
def calculate_roi_from_building(building: BuildingRecord):
    roi = calc_scenario(building, "base")
    return RoiCalculateResponse(
        annual_harvestable_gal=roi["harvestable_gal"],
        annual_water_savings_usd=roi["annual_water_savings_usd"],
        annual_sewer_savings_usd=roi["annual_sewer_savings_usd"],
        capex_range=building.system_capex_range,
        payback_yrs=roi["simple_payback_yrs"],
        npv_10yr_usd=roi["npv_10yr_usd"],
        base_roi_percent=roi["base_roi_pct"],
        confidence_adj_roi_percent=roi["confidence_adj_roi_pct"],
    )


@app.post("/brief", response_model=BriefResponse)
def generate_investment_brief(req: BriefRequest):
    building = get_building(req.building_id)
    roi_data = calc_scenario(building, "base")
    roi = ROIResponse(building_id=req.building_id, scenario="base", **roi_data)
    try:
        return generate_brief(building, roi)
    except ValidationError as e:
        logger.error("BriefResponse validation failed for %s: %s", req.building_id, str(e))
        raise HTTPException(status_code=422, detail=f"Brief schema validation failed: {str(e)}")
    except Exception as e:
        logger.error("Brief generation failed for %s: %s", req.building_id, str(e))
        raise HTTPException(status_code=500, detail=f"Brief generation failed: {str(e)}")


@app.post("/brief/generate", response_model=BriefResponse)
def generate_brief_from_building(req: BriefGenerateRequest):
    building = req.building
    roi_data = calc_scenario(building, "base")
    roi = ROIResponse(building_id=building.building_id, scenario="base", **roi_data)
    try:
        return generate_brief(building, roi)
    except ValidationError as e:
        logger.error("BriefResponse validation failed for %s: %s", building.building_id, str(e))
        raise HTTPException(status_code=422, detail=f"Brief schema validation failed: {str(e)}")
    except Exception as e:
        logger.error("Brief generation failed for %s: %s", building.building_id, str(e))
        raise HTTPException(status_code=500, detail=f"Brief generation failed: {str(e)}")
