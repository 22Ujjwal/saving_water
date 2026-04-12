import React from "react";
import { SelectionState } from "../dashboard/ProspectingDashboard";
import { BuildingCandidate } from "@/types/building";

type Props = {
  selection: SelectionState;
  setSelection: React.Dispatch<React.SetStateAction<SelectionState>>;
  filteredBuildings: BuildingCandidate[];
};

const ANGLE_COLORS: Record<BuildingCandidate["recommended_angle"], string> = {
  cost_savings:    "bg-teal-500/20 text-teal-300 border-teal-500/30",
  resilience:      "bg-blue-500/20 text-blue-300 border-blue-500/30",
  compliance:      "bg-amber-500/20 text-amber-300 border-amber-500/30",
  esg_credibility: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function BuildingListPanel({ selection, setSelection, filteredBuildings }: Props) {
  const buildings = filteredBuildings.filter(b => b.metro === selection.selectedMetro);

  return (
    <div className="flex flex-col h-full">
      <div className="pb-3 border-b border-slate-800 mb-3">
        <h2 className="text-sm font-bold text-white">{selection.selectedMetro?.split(",")[0]}</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {buildings.length} candidate{buildings.length !== 1 ? "s" : ""} match current filters
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5">
        {buildings.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No buildings match active filters.</p>
        ) : (
          buildings.map((b) => (
            <button
              key={b.building_id}
              onClick={() => setSelection(prev => ({ ...prev, mapMode: "building", selectedBuildingId: b.building_id }))}
              className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-900/95 border border-slate-700/60 hover:border-slate-500/70 hover:bg-slate-900 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                  {b.address?.trim() ? b.address.split(",")[0] : `${b.building_type.replace(/_/g, " ")} · ${b.metro}`}
                </span>
                <span className="text-xs font-black text-emerald-400 shrink-0">{b.viability_score}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-300 capitalize truncate">
                  {b.building_type.replace(/_/g, " ")}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-300">CV {(b.cv_confidence_score * 100).toFixed(0)}%</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${ANGLE_COLORS[b.recommended_angle] ?? ANGLE_COLORS["cost_savings"]}`}>
                    {b.recommended_angle.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
