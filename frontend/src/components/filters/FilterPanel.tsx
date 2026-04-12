"use client";
import React from "react";
import { SelectionState } from "../dashboard/ProspectingDashboard";

type FilterPanelProps = {
  selection: SelectionState;
  setSelection: React.Dispatch<React.SetStateAction<SelectionState>>;
};

const FILTER_META: Record<keyof SelectionState["filters"], { label: string; sub?: string; color: string }> = {
  roofAboveThreshold: { label: "Roof area > 150K sqft",    sub: "Large commercial footprint",   color: "bg-blue-500" },
  coolingTowerOnly:   { label: "Cooling tower detected",   sub: "Confirmed CV detection",        color: "bg-emerald-500" },
  highWaterCostOnly:  { label: "High water cost metro",    sub: "≥ $10/kgal water rate",         color: "bg-amber-500" },
  esgPrioritizedOnly: { label: "ESG-prioritized owner",    sub: "SBTi, LEED, or ESG score >80",  color: "bg-purple-500" },
};

export default function FilterPanel({ selection, setSelection }: FilterPanelProps) {
  const toggle = (key: keyof SelectionState["filters"]) => {
    setSelection(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: !prev.filters[key] },
    }));
  };

  return (
    <div className="space-y-2">
      {(Object.entries(selection.filters) as [keyof SelectionState["filters"], boolean][]).map(([key, active]) => {
        const meta = FILTER_META[key];
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`w-full text-left flex items-start gap-3 px-2.5 py-2 rounded-md transition-colors ${
              active ? "bg-gray-700/80" : "hover:bg-gray-800/50"
            }`}
          >
            <span className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/20 ${active ? meta.color : "bg-gray-700"}`} />
            <div className="min-w-0">
              <div className={`text-[13px] font-medium leading-tight ${active ? "text-white" : "text-gray-300"}`}>
                {meta.label}
              </div>
              {active && meta.sub && (
                <div className="text-xs text-gray-400 mt-0.5 truncate">{meta.sub}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
