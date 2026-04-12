"use client";
import React from "react";
import { ChevronLeft } from "lucide-react";
import { SelectionState } from "./ProspectingDashboard";
import FilterPanel from "../filters/FilterPanel";

type LeftPanelProps = {
  selection: SelectionState;
  setSelection: React.Dispatch<React.SetStateAction<SelectionState>>;
};

const VIEW_LABELS: Record<SelectionState["mapMode"], string> = {
  national: "National View",
  state:    "State View",
  metro:    "Metro View",
  building: "Building View",
};

export default function LeftPanel({ selection, setSelection }: LeftPanelProps) {
  const goNational = () => setSelection(prev => ({ ...prev, mapMode: "national", selectedState: null, selectedMetro: null, selectedBuildingId: null }));
  const goState    = () => setSelection(prev => ({ ...prev, mapMode: "state",    selectedMetro: null, selectedBuildingId: null }));
  const goMetro    = () => setSelection(prev => ({ ...prev, mapMode: "metro",    selectedBuildingId: null }));

  const parentAction =
    selection.mapMode === "building" ? goMetro :
    selection.mapMode === "metro"    ? goState  :
    selection.mapMode === "state"    ? goNational : null;

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white overflow-y-auto">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <h1 className="text-[16px] font-bold tracking-tight text-white leading-none">RainUSE Nexus</h1>
        <p className="text-[12px] text-gray-400 mt-1.5 font-normal">Prospecting Engine</p>
      </div>

      {/* Current view + back button */}
      <div className="px-5 py-4 border-b border-white/8">
        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-2 font-semibold">View</p>
        <div className="flex items-center gap-2">
          {parentAction && (
            <button
              onClick={parentAction}
              className="flex items-center gap-0.5 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
          )}
          <span className="text-[14px] font-semibold text-white">{VIEW_LABELS[selection.mapMode]}</span>
        </div>
      </div>

      {/* Scope breadcrumb */}
      <div className="px-5 py-4 border-b border-white/8">
        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-2.5 font-semibold">Scope</p>
        <div className="space-y-0.5">
          <button
            onClick={goNational}
            className={`w-full text-left text-[13px] font-medium px-2.5 py-2 rounded-md transition-colors ${
              selection.mapMode === "national"
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            National
          </button>

          {selection.selectedState && (
            <button
              onClick={goState}
              className={`w-full text-left text-[13px] font-medium px-2.5 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                selection.mapMode === "state"
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <ChevronLeft size={12} className="text-gray-500 shrink-0" />
              State: {selection.selectedState}
            </button>
          )}

          {selection.selectedMetro && (
            <button
              onClick={goMetro}
              className={`w-full text-left text-[13px] font-medium px-2.5 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                selection.mapMode === "metro"
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <ChevronLeft size={12} className="text-gray-500 shrink-0" />
              Metro selected
            </button>
          )}

          {selection.selectedBuildingId && (
            <button
              onClick={() => setSelection(prev => ({ ...prev, mapMode: "building" }))}
              className={`w-full text-left text-[13px] font-medium px-2.5 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                selection.mapMode === "building"
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <ChevronLeft size={12} className="text-gray-500 shrink-0" />
              Building
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 py-4 flex-1">
        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-3 font-semibold">Filters</p>
        {selection.mapMode === "national" ? (
          <p className="text-[13px] text-gray-400 leading-[1.6]">
            Select a state to activate building filters.
          </p>
        ) : (
          <FilterPanel selection={selection} setSelection={setSelection} />
        )}
      </div>
    </div>
  );
}
