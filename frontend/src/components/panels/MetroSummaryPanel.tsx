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
      <div className="rounded-xl bg-slate-900/95 border border-slate-700/60 p-4 text-slate-400 text-sm">
        No metros available for this state.
      </div>
    );
  }

  const metros = [...currentState.metros].sort((a, b) => b.market_readiness_score - a.market_readiness_score);

  return (
    <div className="rounded-xl bg-slate-900/95 border border-slate-700/60 p-4 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-3">Metric Markets</p>
      <div className="space-y-1.5">
        {metros.map((m) => (
          <button
            key={m.metro}
            onClick={() => setSelection(prev => ({ ...prev, mapMode: "metro", selectedMetro: m.metro }))}
            className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-500/70 transition-colors group"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                {m.metro.split(",")[0]}
              </div>
              {m.top_drivers.length > 0 && (
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
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
