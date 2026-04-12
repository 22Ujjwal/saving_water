"use client";

import React, { use, useState, useEffect } from "react";
import RoiHeader from "@/components/roi/RoiHeader";
import ScenarioToggle, { type Scenario } from "@/components/roi/ScenarioToggle";
import KpiGrid, { KpiSkeleton, type RoiKpis } from "@/components/roi/KpiGrid";
import CumulativeChart from "@/components/roi/CumulativeChart";
import SavingsBreakdown, { type SavingsData } from "@/components/roi/SavingsBreakdown";
import FinancialTable, { type ScenarioRow } from "@/components/roi/FinancialTable";
import { fetchROI, fetchBuilding } from "@/lib/api";
import type { ROIResponse, BuildingInfo } from "@/types/roi";

// ─── Scenario multipliers (mirrors roi_engine.py, used for display-only fields) ─

const SCENARIO_MULTIPLIERS: Record<Scenario, { rainfall: number; efficiency: number }> = {
  conservative: { rainfall: 0.75, efficiency: 0.80 },
  base:         { rainfall: 1.00, efficiency: 0.85 },
  upside:       { rainfall: 1.15, efficiency: 0.90 },
};

// ─── Adapters: map ROIResponse → component prop shapes ────────────────────────

function toKpis(r: ROIResponse): RoiKpis {
  return {
    harvestableGal:   r.harvestable_gal,
    annualSavingsUsd: r.total_annual_savings_usd,
    capexMidUsd:      r.capex_mid_usd,
    paybackYrs:       r.simple_payback_yrs,
    npv10yrUsd:       r.npv_10yr_usd,
    baseRoiPct:       r.base_roi_pct,
    confAdjRoiPct:    r.confidence_adj_roi_pct,
    co2OffsetLbs:     r.co2_offset_lbs,
  };
}

function toSavings(r: ROIResponse): SavingsData {
  // incentive amortization is not returned separately — derive it as the remainder
  const incentiveAmort = Math.max(
    0,
    r.total_annual_savings_usd
      - r.annual_water_savings_usd
      - r.annual_sewer_savings_usd
      - r.stormwater_fee_avoidance_usd
  );
  return {
    waterSavingsUsd:   r.annual_water_savings_usd,
    sewerSavingsUsd:   r.annual_sewer_savings_usd,
    stormwaterUsd:     r.stormwater_fee_avoidance_usd,
    incentiveAmortUsd: incentiveAmort,
  };
}

function toTableRow(
  r: ROIResponse,
  building: BuildingInfo,
  scenario: Scenario
): ScenarioRow {
  const m = SCENARIO_MULTIPLIERS[scenario];
  const incentiveAmort = Math.max(
    0,
    r.total_annual_savings_usd
      - r.annual_water_savings_usd
      - r.annual_sewer_savings_usd
      - r.stormwater_fee_avoidance_usd
  );
  return {
    harvestableGal:          r.harvestable_gal,
    annualRainfallUsed:      parseFloat((building.annual_rainfall_in * m.rainfall).toFixed(1)),
    collectionEfficiencyPct: m.efficiency * 100,
    waterSavingsUsd:         r.annual_water_savings_usd,
    sewerSavingsUsd:         r.annual_sewer_savings_usd,
    stormwaterUsd:           r.stormwater_fee_avoidance_usd,
    incentiveAmortUsd:       incentiveAmort,
    totalSavingsUsd:         r.total_annual_savings_usd,
    capexMidUsd:             r.capex_mid_usd,
    incentiveUsd:            building.incentive_value_usd,
    netCapexUsd:             r.capex_mid_usd - building.incentive_value_usd,
    paybackYrs:              r.simple_payback_yrs,
    npv10yrUsd:              r.npv_10yr_usd,
    baseRoiPct:              r.base_roi_pct,
    confAdjRoiPct:           r.confidence_adj_roi_pct,
    co2OffsetLbs:            r.co2_offset_lbs,
  };
}

/** Cumulative net cash flow for Year 0–10 from a single ROI response */
function toCumulative(r: ROIResponse): number[] {
  return Array.from({ length: 11 }, (_, y) =>
    -r.capex_mid_usd + r.total_annual_savings_usd * y
  );
}

// ─── Error card ───────────────────────────────────────────────────────────────

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-rose-950/40 border border-rose-700/50 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-rose-300 mb-1">Unable to load ROI data</p>
          <p className="text-xs text-rose-400/80 leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="self-start px-4 py-2 rounded-lg bg-rose-800/50 hover:bg-rose-700/50 border border-rose-600/50 text-sm font-semibold text-rose-200 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// ─── Table / chart skeleton ───────────────────────────────────────────────────

function PanelSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl ${height} flex items-center justify-center animate-pulse`}>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-700">
        Loading…
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoiPage({
  params,
}: {
  params: Promise<{ buildingId: string }>;
}) {
  const { buildingId } = use(params);
  const [scenario, setScenario] = useState<Scenario>("base");

  const [building, setBuilding]   = useState<BuildingInfo | null>(null);
  const [roiCache, setRoiCache]   = useState<Partial<Record<Scenario, ROIResponse>>>({});
  const [loading, setLoading]     = useState(true);
  const [loadingScenario, setLoadingScenario] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [retryKey, setRetryKey]   = useState(0);

  // ── Initial load: building + all 3 scenarios ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchBuilding(buildingId),
      fetchROI(buildingId, "conservative"),
      fetchROI(buildingId, "base"),
      fetchROI(buildingId, "upside"),
    ])
      .then(([bld, cons, base, upside]) => {
        if (cancelled) return;
        setBuilding(bld);
        setRoiCache({ conservative: cons, base, upside });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load data from backend");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [buildingId, retryKey]);

  // ── Scenario change: refetch if somehow not cached ────────────────────────
  useEffect(() => {
    if (loading || roiCache[scenario]) return;

    let cancelled = false;
    setLoadingScenario(true);

    fetchROI(buildingId, scenario)
      .then((roi) => {
        if (!cancelled) setRoiCache((prev) => ({ ...prev, [scenario]: roi }));
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load scenario data");
      })
      .finally(() => {
        if (!cancelled) setLoadingScenario(false);
      });

    return () => { cancelled = true; };
  }, [scenario, buildingId, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derive display data ───────────────────────────────────────────────────
  const activeRoi = roiCache[scenario];

  const currentKpis    = activeRoi ? toKpis(activeRoi)    : null;
  const currentSavings = activeRoi ? toSavings(activeRoi) : null;

  const allTableData =
    building &&
    roiCache.conservative &&
    roiCache.base &&
    roiCache.upside
      ? {
          conservative: toTableRow(roiCache.conservative, building, "conservative"),
          base:         toTableRow(roiCache.base,         building, "base"),
          upside:       toTableRow(roiCache.upside,       building, "upside"),
        }
      : null;

  const realCumulativeData =
    roiCache.conservative && roiCache.base && roiCache.upside
      ? {
          conservative: toCumulative(roiCache.conservative),
          base:         toCumulative(roiCache.base),
          upside:       toCumulative(roiCache.upside),
        }
      : undefined;

  const cvConfidencePct = activeRoi?.cv_confidence_pct ?? 81;

  // ── Render ─────────────────────────────────────────────────────────────────

  // Header fallback while building loads
  const headerBuilding = building ?? {
    address: buildingId,
    metro: "—", state: "—", building_type: "—",
    viability_score: 0,
    recommended_angle: "cost_savings" as const,
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">

      {/* Sticky header — renders immediately with fallback values */}
      <RoiHeader
        address={headerBuilding.address}
        metro={headerBuilding.metro}
        state={headerBuilding.state}
        buildingType={headerBuilding.building_type}
        ownerTenant={"owner_tenant" in headerBuilding ? (headerBuilding as BuildingInfo).owner_tenant : undefined}
        viabilityScore={headerBuilding.viability_score}
        recommendedAngle={headerBuilding.recommended_angle}
        scenario={scenario}
      />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-6 space-y-6">

        {/* Scenario toggle */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl px-5 py-3">
          <ScenarioToggle scenario={scenario} onChange={setScenario} />
        </div>

        {/* Error state */}
        {error && (
          <ErrorCard
            message={error}
            onRetry={() => { setRetryKey((k) => k + 1); setError(null); }}
          />
        )}

        {/* KPI grid — skeleton while loading, real data once ready */}
        {loading || loadingScenario || !currentKpis ? (
          <KpiSkeleton />
        ) : (
          <KpiGrid
            data={currentKpis}
            scenario={scenario}
            cvConfidencePct={cvConfidencePct}
          />
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            {loading ? (
              <PanelSkeleton height="h-[320px]" />
            ) : (
              <CumulativeChart
                activeScenario={scenario}
                realData={realCumulativeData}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            {loading || !currentSavings ? (
              <PanelSkeleton height="h-[320px]" />
            ) : (
              <SavingsBreakdown data={currentSavings} />
            )}
          </div>
        </div>

        {/* Financial breakdown table */}
        {loading || !allTableData ? (
          <PanelSkeleton height="h-48" />
        ) : (
          <FinancialTable
            data={allTableData}
            activeScenario={scenario}
            cvConfidencePct={cvConfidencePct}
          />
        )}

        <div className="h-8" />
      </main>
    </div>
  );
}
