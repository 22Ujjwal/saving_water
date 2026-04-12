import React from "react";
import { cn } from "@/lib/utils";

export type Scenario = "conservative" | "base" | "upside";

interface ScenarioConfig {
  label: string;
  sub: string;
  active: string;
  inactive: string;
  dot: string;
}

const SCENARIOS: Record<Scenario, ScenarioConfig> = {
  conservative: {
    label: "Conservative",
    sub: "×0.75 rainfall · 80% efficiency · +15% capex",
    active:   "bg-gray-700 border-gray-500 text-white",
    inactive: "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300",
    dot: "bg-gray-400",
  },
  base: {
    label: "Base Case",
    sub: "30-yr avg rainfall · 85% efficiency · standard capex",
    active:   "bg-blue-600/20 border-blue-500 text-blue-200",
    inactive: "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300",
    dot: "bg-blue-400",
  },
  upside: {
    label: "Upside",
    sub: "×1.15 rainfall · 90% efficiency · −10% capex",
    active:   "bg-emerald-600/20 border-emerald-500 text-emerald-200",
    inactive: "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300",
    dot: "bg-emerald-400",
  },
};

interface ScenarioToggleProps {
  scenario: Scenario;
  onChange: (s: Scenario) => void;
}

export default function ScenarioToggle({ scenario, onChange }: ScenarioToggleProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 shrink-0">
        Scenario
      </span>
      <div className="flex gap-2 flex-wrap">
        {(["conservative", "base", "upside"] as Scenario[]).map((s) => {
          const cfg = SCENARIOS[s];
          const isActive = scenario === s;
          return (
            <button
              key={s}
              onClick={() => onChange(s)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all",
                isActive ? cfg.active : cfg.inactive
              )}
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
              <span>{cfg.label}</span>
              {isActive && (
                <span className="hidden lg:inline text-[10px] font-normal opacity-60 ml-1">
                  {cfg.sub}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Show sub-text for active scenario on smaller screens */}
      <span className="lg:hidden text-[10px] text-gray-600">
        {SCENARIOS[scenario].sub}
      </span>
    </div>
  );
}
