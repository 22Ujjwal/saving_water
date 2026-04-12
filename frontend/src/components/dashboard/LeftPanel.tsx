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
      <div className="px-4 py-4 border-b border-gray-800">
        <h1 className="text-base font-bold tracking-tight text-white leading-none">RainUSE Nexus</h1>
        <p className="text-[11px] text-gray-500 mt-0.5">Prospecting Engine</p>
      </div>

      {/* Current view + back button */}
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1.5 font-semibold">View</p>
        <div className="flex items-center gap-2">
          {parentAction && (
            <button
              onClick={parentAction}
              className="flex items-center gap-0.5 text-gray-400 hover:text-white transition-colors text-xs"
            >
              <ChevronLeft size={13} />
            </button>
          )}
          <span className="text-sm font-semibold text-white">{VIEW_LABELS[selection.mapMode]}</span>
        </div>
      </div>

      {/* Scope breadcrumb */}
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-semibold">Scope</p>
        <div className="space-y-0.5">
          <button
            onClick={goNational}
            className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
              selection.mapMode === "national"
                ? "bg-gray-700 text-white font-semibold"
                : "text-gray-400 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            National
          </button>

          {selection.selectedState && (
            <button
              onClick={goState}
              className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors flex items-center gap-1 ${
                selection.mapMode === "state"
                  ? "bg-gray-700 text-white font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <ChevronLeft size={10} className="text-gray-600 shrink-0" />
              State: {selection.selectedState}
            </button>
          )}

          {selection.selectedMetro && (
            <button
              onClick={goMetro}
              className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors flex items-center gap-1 ${
                selection.mapMode === "metro"
                  ? "bg-gray-700 text-white font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <ChevronLeft size={10} className="text-gray-600 shrink-0" />
              Metro selected
            </button>
          )}

          {selection.selectedBuildingId && (
            <button
              onClick={() => setSelection(prev => ({ ...prev, mapMode: "building" }))}
              className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors flex items-center gap-1 ${
                selection.mapMode === "building"
                  ? "bg-gray-700 text-white font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <ChevronLeft size={10} className="text-gray-600 shrink-0" />
              Building
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3 font-semibold">Filters</p>
        {selection.mapMode === "national" ? (
          <p className="text-xs text-gray-600 leading-relaxed">
            Select a state to activate building filters.
          </p>
        ) : (
          <FilterPanel selection={selection} setSelection={setSelection} />
        )}
      </div>
    </div>
  );
}
