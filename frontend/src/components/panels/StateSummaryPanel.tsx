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
      <div className="rounded-2xl border border-white/[0.08] p-4 text-slate-500 text-xs"
        style={{ background: "rgba(255,255,255,0.05)" }}>
        No data for this state.
      </div>
    );
  }

  const { label, color } = scoreTag(s.market_readiness_score);

  return (
    <div className="space-y-3">
      {/* Header card */}
      <div className="rounded-2xl border border-white/[0.08] p-4"
        style={{ background: "rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">State Overview</p>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-100 leading-tight">{s.state}</h2>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold text-white leading-none">{s.market_readiness_score}</div>
            <div className={`text-[10px] font-semibold uppercase tracking-wide mt-1 ${color}`}>{label}</div>
          </div>
        </div>

        {s.top_drivers.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Top Drivers</p>
            <div className="flex flex-wrap gap-1.5">
              {s.top_drivers.map((d, i) => (
                <span
                  key={i}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-lg border ${DRIVER_COLORS[i % DRIVER_COLORS.length]}`}
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
        <div className="rounded-2xl border border-white/[0.08] p-4"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">Score Breakdown</p>
          <div className="space-y-3">
            {Object.entries(s.score_breakdown).map(([key, val]) => {
              if (val === undefined) return null;
              const pct = Math.min(100, Math.max(0, val));
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-slate-400">{BREAKDOWN_LABELS[key] ?? key}</span>
                    <span className="text-xs font-semibold text-slate-200">{val}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor(pct)}`} style={{ width: `${pct}%` }} />
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
