# main.py
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import BuildingRecord, ROIRequest, ROIResponse, BriefRequest, BriefResponse
from roi_engine import calc_scenario

app = FastAPI(title="RainUSE Nexus API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load once at startup — never mutate
# Use stub file during development; drop real buildings.json from Person 1 to switch
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


@app.post("/brief", response_model=BriefResponse)
def generate_investment_brief(req: BriefRequest):
    # Placeholder — implemented in Step 7 after brief_generator.py is wired up
    raise HTTPException(status_code=501, detail="Brief generation not yet implemented")
