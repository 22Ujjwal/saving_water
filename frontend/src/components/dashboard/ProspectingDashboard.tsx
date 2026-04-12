"use client";
import React, { useEffect, useState, useMemo } from "react";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import MainMap from "../map/MainMap";
import { BuildingCandidate } from "@/types/building";
import { StateScore } from "@/types/state";
import { RoiResult } from "@/types/roi";
import { BriefResult } from "@/types/brief";
import { loadBuildings, loadStateScores, loadStatesGeoJSON, calculateRoi, generateBrief } from "@/lib/api";
import { FeatureCollection } from "geojson";

export type MapMode = "national" | "state" | "metro" | "building";

export type Filters = {
  roofAboveThreshold: boolean;
  coolingTowerOnly: boolean;
  highWaterCostOnly: boolean;
  esgPrioritizedOnly: boolean;
};

export type SelectionState = {
  selectedState: string | null;
  selectedMetro: string | null;
  selectedBuildingId: string | null;
  mapMode: MapMode;
  filters: Filters;
};

const initialSelectionState: SelectionState = {
  selectedState: null,
  selectedMetro: null,
  selectedBuildingId: null,
  mapMode: "national",
  filters: {
    roofAboveThreshold: false,
    coolingTowerOnly: false,
    highWaterCostOnly: false,
    esgPrioritizedOnly: false,
  },
};

export default function ProspectingDashboard() {
  const [selection, setSelection] = useState<SelectionState>(initialSelectionState);

  // Global Data State
  const [buildings, setBuildings] = useState<BuildingCandidate[]>([]);
  const [stateScores, setStateScores] = useState<StateScore[]>([]);
  const [statesGeo, setStatesGeo] = useState<FeatureCollection | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Async API State
  const [roiResult, setRoiResult] = useState<RoiResult | null>(null);
  const [isCalculatingRoi, setIsCalculatingRoi] = useState(false);
  const [roiError, setRoiError] = useState<string | null>(null);

  const [briefResult, setBriefResult] = useState<BriefResult | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);

  // Initial Data Load
  useEffect(() => {
    async function loadAllData() {
      setIsLoadingData(true);
      setDataError(null);
      try {
        const [bData, sScores, sGeo] = await Promise.all([
          loadBuildings(),
          loadStateScores(),
          loadStatesGeoJSON(),
        ]);
        setBuildings(bData);
        setStateScores(sScores);
        setStatesGeo(sGeo);
      } catch (err: any) {
        console.error("Failed to load global application data:", err);
        setDataError(err.message || "Failed to load global data");
      } finally {
        setIsLoadingData(false);
      }
    }
    loadAllData();
  }, []);

  // Filter computation
  const filteredBuildings = useMemo(() => {
    let result = buildings;

    // Filter by selection
    if (selection.selectedMetro) {
      result = result.filter(b => b.metro === selection.selectedMetro);
    } else if (selection.selectedState) {
      result = result.filter(b => b.state === selection.selectedState);
    }

    // Filter by toggle states
    const f = selection.filters;
    if (f.roofAboveThreshold) {
      result = result.filter(b => b.roof_area_sqft > 50000); 
    }
    if (f.coolingTowerOnly) {
      result = result.filter(b => b.cooling_tower_present);
    }
    if (f.highWaterCostOnly) {
      result = result.filter(b => b.water_rate_per_kgal >= 10.0);
    }
    if (f.esgPrioritizedOnly) {
      result = result.filter(b => b.sbti_committed || b.leed_certified || (b.esg_score_proxy && b.esg_score_proxy > 80));
    }
    
    return result;
  }, [buildings, selection]);


  // Action handlers
  const handleCalculateRoi = async (building: BuildingCandidate) => {
    setIsCalculatingRoi(true);
    setRoiError(null);
    setRoiResult(null);
    setBriefResult(null); // Clear brief when recalculating ROI
    try {
      const res = await calculateRoi(building);
      setRoiResult(res);
    } catch (err: any) {
      setRoiError(err.message || "ROI calculation failed");
    } finally {
      setIsCalculatingRoi(false);
    }
  };

  const handleGenerateBrief = async (building: BuildingCandidate) => {
    if (!roiResult) {
       setBriefError("Please calculate ROI first before generating a brief.");
       return;
    }
    setIsGeneratingBrief(true);
    setBriefError(null);
    try {
      const payload = { building, roi: roiResult };
      const res = await generateBrief(payload);
      setBriefResult(res);
    } catch (err: any) {
      setBriefError(err.message || "Brief generation failed");
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  // Reset API states when building selection changes
  useEffect(() => {
    setRoiResult(null);
    setRoiError(null);
    setBriefResult(null);
    setBriefError(null);
  }, [selection.selectedBuildingId]);

  if (isLoadingData) {
    return <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-500 font-medium tracking-wide">Loading Foundation Data...</div>;
  }

  if (dataError) {
    return <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-red-600 font-medium">Error: {dataError}</div>;
  }

  return (
    <div className="flex h-screen w-full bg-gray-950 text-white overflow-hidden">
      {/* Left Panel */}
      <div className="w-56 h-full border-r border-gray-800 flex flex-col shrink-0 z-10 hidden md:flex">
        <LeftPanel selection={selection} setSelection={setSelection} />
      </div>

      {/* Center — Main Map */}
      <div className="flex-1 h-full relative">
        <MainMap
          selection={selection}
          setSelection={setSelection}
          filteredBuildings={filteredBuildings}
          stateScores={stateScores}
          statesGeo={statesGeo}
        />
      </div>

      {/* Right Panel */}
      <div className="w-[340px] h-full border-l border-gray-800 flex flex-col shrink-0 z-10 overflow-y-auto hidden lg:flex">
        <RightPanel
          selection={selection}
          setSelection={setSelection}
          buildings={buildings}
          filteredBuildings={filteredBuildings}
          stateScores={stateScores}
          roiResult={roiResult}
          isCalculatingRoi={isCalculatingRoi}
          roiError={roiError}
          onCalculateRoi={handleCalculateRoi}
          briefResult={briefResult}
          isGeneratingBrief={isGeneratingBrief}
          briefError={briefError}
          onGenerateBrief={handleGenerateBrief}
        />
      </div>
    </div>
  );
}
