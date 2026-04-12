import React from "react";
import { cn } from "@/lib/utils";
import type { Scenario } from "./ScenarioToggle";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export function KpiSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 animate-pulse">
            <div className="h-2.5 w-20 bg-gray-800 rounded" />
            <div className="h-7 w-24 bg-gray-800 rounded" />
            <div className="h-2 w-28 bg-gray-800 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-32 bg-gray-800 rounded" />
            <div className="h-3 w-48 bg-gray-800 rounded" />
            <div className="h-2 w-64 bg-gray-800 rounded" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-12 w-32 bg-gray-800 rounded" />
            <div className="h-2 w-24 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export interface RoiKpis {
  harvestableGal: number;
  annualSavingsUsd: number;
  capexMidUsd: number;
  paybackYrs: number;
  npv10yrUsd: number;
  baseRoiPct: number;
  confAdjRoiPct: number;
  co2OffsetLbs: number;
}

interface KpiGridProps {
  data: RoiKpis;
  scenario: Scenario;
  cvConfidencePct: number;
}

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtGal(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M gal/yr`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K gal/yr`;
  return `${n.toLocaleString()} gal/yr`;
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  variant?: "default" | "positive" | "warning";
}

function KpiCard({ label, value, sub, icon, variant = "default" }: KpiCardProps) {
  const valueColor =
    variant === "positive" ? "text-emerald-400" :
    variant === "warning"  ? "text-amber-400"  :
                             "text-white";
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          {label}
        </span>
        {icon && <span className="text-gray-600">{icon}</span>}
      </div>
      <span className={cn("text-2xl font-black leading-none tabular-nums", valueColor)}>
        {value}
      </span>
      {sub && (
        <span className="text-[10px] text-gray-600 leading-snug">{sub}</span>
      )}
    </div>
  );
}

const SCENARIO_LABEL: Record<Scenario, string> = {
  conservative: "Conservative",
  base: "Base Case",
  upside: "Upside",
};

export default function KpiGrid({ data, scenario, cvConfidencePct }: KpiGridProps) {
  const paybackColor: KpiCardProps["variant"] =
    data.paybackYrs <= 3 ? "positive" :
    data.paybackYrs <= 5 ? "warning"  : "default";

  return (
    <div className="space-y-3">
      {/* ── Standard KPI row ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard
          label="Harvestable Gallons"
          value={fmtGal(data.harvestableGal)}
          sub="Annual capture, base efficiency"
          icon={
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c-.5 2-2 3.5-2 5.5a2 2 0 0 0 4 0C14 5.5 12.5 4 12 2z M6 14c-.5 2-2 3.5-2 5.5a2 2 0 0 0 4 0C8 17.5 6.5 16 6 14z M18 14c-.5 2-2 3.5-2 5.5a2 2 0 0 0 4 0C20 17.5 18.5 16 18 14z" />
            </svg>
          }
        />
        <KpiCard
          label="Annual Savings"
          value={fmtUsd(data.annualSavingsUsd)}
          sub="Water + sewer + stormwater + incentive"
          variant="positive"
          icon={
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" />
            </svg>
          }
        />
        <KpiCard
          label="CapEx Midpoint"
          value={fmtUsd(data.capexMidUsd)}
          sub={`${SCENARIO_LABEL[scenario]} scenario`}
          icon={
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeLinecap="round" />
            </svg>
          }
        />
        <KpiCard
          label="Payback Period"
          value={`${data.paybackYrs.toFixed(1)} yrs`}
          sub="Simple payback on net CapEx"
          variant={paybackColor}
          icon={
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
          }
        />
        <KpiCard
          label="10-Year NPV"
          value={fmtUsd(data.npv10yrUsd)}
          sub="5% discount rate"
          variant={data.npv10yrUsd > 0 ? "positive" : "default"}
          icon={
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="16 7 22 7 22 13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <KpiCard
          label="Base ROI"
          value={`${data.baseRoiPct.toFixed(1)}%`}
          sub="10-yr horizon, pre-confidence adj."
          icon={
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" strokeLinecap="round" />
              <path d="m19 9-5 5-4-4-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <KpiCard
          label="CO₂ Offset"
          value={`${(data.co2OffsetLbs / 1000).toFixed(1)}K lbs/yr`}
          sub="3.2 lbs per kgal avoided"
          icon={
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12a10 10 0 1 0 20 0A10 10 0 0 0 2 12z" />
              <path d="M12 8v4l3 3" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      {/* ── Featured: Confidence-Adjusted ROI ─────────────── */}
      <div className="relative rounded-xl overflow-hidden border border-teal-600/50 bg-teal-900/20 ring-1 ring-teal-500/20 p-5">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/30 via-transparent to-transparent pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Left: label + explanation */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-teal-500">
                Core Differentiator
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 font-semibold border border-teal-500/30">
                CV-Adjusted
              </span>
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-300 mb-2">
              Confidence-Adjusted ROI
            </h3>
            <p className="text-[11px] text-teal-400/70 leading-relaxed max-w-md">
              Satellite CV score ({cvConfidencePct}%) applied directly to the base ROI, making this the
              most conservative and credible figure in the brief. A site survey raises it, not lowers it.
            </p>
          </div>

          {/* Right: the big number */}
          <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
            <div className="text-[10px] text-teal-500/70 font-semibold uppercase tracking-widest">
              {SCENARIO_LABEL[scenario]} Scenario
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-teal-300 tabular-nums leading-none">
                {data.confAdjRoiPct.toFixed(1)}
              </span>
              <span className="text-2xl font-black text-teal-400 mb-0.5">%</span>
            </div>
            <div className="flex items-center gap-2">
              {/* CV confidence bar */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-teal-600">CV</span>
                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${cvConfidencePct}%` }}
                  />
                </div>
                <span className="text-[9px] text-teal-500 font-semibold">{cvConfidencePct}%</span>
              </div>
              <span className="text-[9px] text-gray-600">confidence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
