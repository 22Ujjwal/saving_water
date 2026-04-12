import React from "react";
import { SelectionState } from "../dashboard/ProspectingDashboard";
import { StateScore } from "@/types/state";

type Props = {
  selection: SelectionState;
  stateScores: StateScore[];
};

const BREAKDOWN_LABELS: Record<string, string> = {
  water_cost_pressure: "Water Cost Pressure",
  rainfall_capture:    "Rainfall Capture",
  commercial_density:  "Commercial Density",
  regulatory_pressure: "Regulatory Pressure",
  esg_alignment:       "ESG Alignment",
};

const DRIVER_COLORS = [
  "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-blue-500/20 text-blue-300 border-blue-500/30",
];

function scoreTag(score: number) {
  if (score >= 85) return { label: "Strong",   color: "text-emerald-400" };
  if (score >= 70) return { label: "Good",     color: "text-blue-400" };
  if (score >= 50) return { label: "Moderate", color: "text-amber-400" };
  return               { label: "Low",       color: "text-red-400" };
}

function barColor(pct: number) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-blue-500";
  if (pct >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export default function StateSummaryPanel({ selection, stateScores }: Props) {
  const s = stateScores.find(
    x => x.state_code === selection.selectedState || x.state === selection.selectedState
  );

  if (!s) {
    return (
      <div className="rounded-lg bg-gray-900 border border-gray-700/50 p-4 text-gray-500 text-sm">
        No data for this state.
      </div>
    );
  }

  const { label, color } = scoreTag(s.market_readiness_score);

  return (
    <div className="space-y-3">
      {/* Header card */}
      <div className="rounded-lg bg-gray-900 border border-gray-700/50 p-4">
        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1">State</p>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-white leading-tight">{s.state}</h2>
          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-white leading-none">{s.market_readiness_score}</div>
            <div className={`text-[10px] font-bold uppercase tracking-wide ${color}`}>{label}</div>
          </div>
        </div>

        {s.top_drivers.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">Top Drivers</p>
            <div className="flex flex-wrap gap-1.5">
              {s.top_drivers.map((d, i) => (
                <span
                  key={i}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${DRIVER_COLORS[i % DRIVER_COLORS.length]}`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Score breakdown bars */}
      {s.score_breakdown && (
        <div className="rounded-lg bg-gray-900 border border-gray-700/50 p-4">
          <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-3">Score Breakdown</p>
          <div className="space-y-2.5">
            {Object.entries(s.score_breakdown).map(([key, val]) => {
              if (val === undefined) return null;
              const pct = Math.min(100, Math.max(0, val));
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-300">{BREAKDOWN_LABELS[key] ?? key}</span>
                    <span className="text-xs font-bold text-white">{val}</span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
