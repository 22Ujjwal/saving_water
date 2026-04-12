import React from "react";
import { SelectionState } from "../dashboard/ProspectingDashboard";
import { StateScore } from "@/types/state";

type Props = {
  selection: SelectionState;
  setSelection: React.Dispatch<React.SetStateAction<SelectionState>>;
  stateScores: StateScore[];
};

export default function MetroSummaryPanel({ selection, setSelection, stateScores }: Props) {
  const currentState = stateScores.find(
    s => s.state_code === selection.selectedState || s.state === selection.selectedState
  );

  if (!currentState || currentState.metros.length === 0) {
    return (
      <div className="rounded-lg bg-gray-900 border border-gray-700/50 p-4 text-gray-500 text-sm">
        No metros available for this state.
      </div>
    );
  }

  const metros = [...currentState.metros].sort((a, b) => b.market_readiness_score - a.market_readiness_score);

  return (
    <div className="rounded-lg bg-gray-900 border border-gray-700/50 p-4">
      <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-3">Metric Markets</p>
      <div className="space-y-1.5">
        {metros.map((m) => (
          <button
            key={m.metro}
            onClick={() => setSelection(prev => ({ ...prev, mapMode: "metro", selectedMetro: m.metro }))}
            className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-md bg-gray-800/50 hover:bg-gray-700/60 border border-gray-700/40 hover:border-gray-600/60 transition-colors group"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                {m.metro.split(",")[0]}
              </div>
              {m.top_drivers.length > 0 && (
                <div className="text-[10px] text-gray-500 truncate mt-0.5">
                  {m.top_drivers.join(" · ")}
                </div>
              )}
            </div>
            <div className="shrink-0 text-lg font-black text-blue-400 group-hover:text-blue-300 transition-colors">
              {m.market_readiness_score}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
