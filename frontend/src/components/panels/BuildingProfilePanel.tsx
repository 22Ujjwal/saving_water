import React from "react";
import { SelectionState } from "../dashboard/ProspectingDashboard";
import CvEvidencePanel from "./CvEvidencePanel";
import { BuildingCandidate } from "@/types/building";

type Props = {
  selection: SelectionState;
  filteredBuildings: BuildingCandidate[];
  isCalculatingRoi: boolean;
  onCalculateRoi: (building: BuildingCandidate) => void;
  isGeneratingBrief: boolean;
  onGenerateBrief: (building: BuildingCandidate) => void;
};

const ANGLE_STYLES: Record<BuildingCandidate["recommended_angle"], { badge: string; label: string }> = {
  cost_savings:    { badge: "bg-teal-500/20 text-teal-300 border-teal-500/40",    label: "Cost Savings" },
  resilience:      { badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",    label: "Resilience" },
  compliance:      { badge: "bg-amber-500/20 text-amber-300 border-amber-500/40", label: "Compliance" },
  esg_credibility: { badge: "bg-purple-500/20 text-purple-300 border-purple-500/40", label: "ESG Credibility" },
};

const DRIVER_COLORS = [
  "text-orange-300",
  "text-amber-300",
  "text-emerald-300",
  "text-blue-300",
  "text-rose-300",
];

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtGal(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M gal/yr`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K gal/yr`;
  return `${n.toLocaleString()} gal/yr`;
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800/60 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

export default function BuildingProfilePanel({
  selection, filteredBuildings, isCalculatingRoi, onCalculateRoi, isGeneratingBrief, onGenerateBrief,
}: Props) {
  const building = filteredBuildings.find(b => b.building_id === selection.selectedBuildingId);
  if (!building) return <div className="p-4 text-gray-500 text-sm">No building selected.</div>;

  const angle = ANGLE_STYLES[building.recommended_angle];
  const cvPct = Math.round(building.cv_confidence_score * 100);
  const cvColor = cvPct >= 90 ? "text-emerald-400" : cvPct >= 70 ? "text-amber-400" : "text-red-400";

  return (
    <div className="flex flex-col bg-gray-950">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-800">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white truncate">{building.address.split(",")[0]}</h2>
            <p className="text-[13px] text-gray-400 mt-0.5 truncate">
              {building.metro}, {building.state} • {building.building_type.replace(/_/g, " ")}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-black text-white leading-none">{building.viability_score}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Viability</div>
          </div>
        </div>

        {/* Detection confidence + angle */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-gray-800 rounded-md px-2.5 py-1">
            <span className="text-xs text-gray-400 font-medium">Detection confidence:</span>
            <span className={`text-xs font-black ${cvColor}`}>{cvPct}%</span>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-1 rounded border ${angle.badge}`}>
            {angle.label}
          </span>
        </div>
      </div>

      {/* ── Agency Drivers ─────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-2">Agency Drivers</p>
        <ul className="space-y-1">
          {building.urgency_drivers.map((d, i) => (
            <li key={i} className={`text-xs font-medium flex items-start gap-1.5 ${DRIVER_COLORS[i % DRIVER_COLORS.length]}`}>
              <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Physical ───────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1">Physical</p>
        <MetricRow label="Roof Area"        value={`${(building.roof_area_sqft / 1000).toFixed(0)}K sqft`} />
        <MetricRow label="Annual Rainfall"  value={`${building.annual_rainfall_in}"`} />
        <MetricRow label="Harvestable"      value={fmtGal(building.harvestable_gal_yr)} />
        <MetricRow label="Drought Risk"     value={`${building.drought_risk_index.toFixed(1)} / 10`} />
        <MetricRow
          label="Cooling Towers"
          value={building.cooling_tower_present ? `${building.cooling_tower_count} detected` : "None"}
        />
      </div>

      {/* ── Financial Snapshot ─────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1">Financial Snapshot</p>
        <MetricRow label="Annual Water Savings"  value={fmtUsd(building.annual_water_savings_usd)} />
        <MetricRow label="Annual Sewer Savings"  value={fmtUsd(building.annual_sewer_savings_usd)} />
        <MetricRow label="Incentive Value"        value={fmtUsd(building.incentive_value_usd)} />
        <MetricRow
          label="CapEx Range"
          value={`${fmtUsd(building.system_capex_range[0])} — ${fmtUsd(building.system_capex_range[1])}`}
        />
        <MetricRow label="Simple Payback"        value={`${building.simple_payback_yrs.toFixed(1)} yrs`} />
        <MetricRow label="10yr NPV"               value={fmtUsd(building.npv_10yr_usd)} />
        <MetricRow label="Confidence-Adj ROI"    value={`${building.confidence_adj_roi_pct.toFixed(1)}%`} />
      </div>

      {/* ── CV Evidence metadata ────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-800">
        <CvEvidencePanel building={building} />
      </div>

      {/* ── Actions ────────────────────────────────────────────── */}
      <div className="px-4 py-4 space-y-2">
        <button
          onClick={() => onCalculateRoi(building)}
          disabled={isCalculatingRoi}
          className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors"
        >
          {isCalculatingRoi ? "Calculating..." : "Analyze ROI"}
        </button>
        <button
          onClick={() => onGenerateBrief(building)}
          disabled={isGeneratingBrief}
          className="w-full py-2.5 rounded-md bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-gray-200 border border-gray-700 transition-colors"
        >
          {isGeneratingBrief ? "Generating..." : "Generate Brief"}
        </button>
      </div>
    </div>
  );
}
