"use client";

import React from "react";
import Link from "next/link";

type RecommendedAngle = "cost_savings" | "resilience" | "compliance" | "esg_credibility";
type Scenario = "conservative" | "base" | "upside";

interface RoiHeaderProps {
  buildingId: string;
  address: string;
  metro: string;
  state: string;
  buildingType: string;
  ownerTenant?: string;
  viabilityScore: number;
  recommendedAngle: RecommendedAngle;
  scenario: Scenario;
}

const ANGLE: Record<RecommendedAngle, { badge: string; label: string }> = {
  cost_savings:    { badge: "bg-teal-500/20 text-teal-300 border-teal-500/40",       label: "Cost Savings" },
  resilience:      { badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",       label: "Resilience" },
  compliance:      { badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",    label: "Compliance" },
  esg_credibility: { badge: "bg-purple-500/20 text-purple-300 border-purple-500/40", label: "ESG Credibility" },
};

const SCENARIO_LABEL: Record<Scenario, string> = {
  conservative: "Conservative",
  base: "Base Case",
  upside: "Upside",
};

const SCENARIO_COLORS: Record<Scenario, string> = {
  conservative: "bg-gray-700 text-gray-300",
  base:         "bg-blue-600/30 text-blue-300 border-blue-500/40",
  upside:       "bg-emerald-600/30 text-emerald-300 border-emerald-500/40",
};

const VIABILITY_COLOR = (score: number) =>
  score >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" :
  score >= 60 ? "text-blue-400 bg-blue-500/10 border-blue-500/30" :
  score >= 40 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
               "text-rose-400 bg-rose-500/10 border-rose-500/30";

export default function RoiHeader({
  buildingId,
  address,
  metro,
  state,
  buildingType,
  ownerTenant,
  viabilityScore,
  recommendedAngle,
  scenario,
}: RoiHeaderProps) {
  const angle = ANGLE[recommendedAngle];
  const viabilityClasses = VIABILITY_COLOR(viabilityScore);
  const streetAddress = address.split(",")[0];

  return (
    <div className="sticky top-0 z-20 bg-gray-900 border-b border-gray-800">

      {/* ── Nav strip ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-gray-800/60">
        <div className="flex items-center gap-3">
          <Link
            href="/map"
            className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors group"
          >
            <svg
              className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Map
          </Link>
          <span className="text-gray-700">·</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-white">
                <path d="M8 2c-.5 2-2 3.5-2 5.5a2 2 0 0 0 4 0C10 5.5 8.5 4 8 2z" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-gray-300">RainUSE Nexus</span>
            <span className="text-[10px] text-gray-600">/ ROI Analysis</span>
          </div>
        </div>

        {/* Active scenario pill */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-semibold ${SCENARIO_COLORS[scenario]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {SCENARIO_LABEL[scenario]} Scenario
        </div>
      </div>

      {/* ── Building identity ────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h1 className="text-lg font-black text-white tracking-tight truncate">
              {streetAddress}
            </h1>
            {ownerTenant && (
              <span className="text-sm text-gray-500 font-medium shrink-0">{ownerTenant}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {metro}, {state}
            <span className="mx-1.5 text-gray-700">·</span>
            <span className="capitalize">{buildingType.replace(/_/g, " ")}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-black ${viabilityClasses}`}>
            <span>{viabilityScore}</span>
            <span className="text-[9px] font-semibold uppercase tracking-widest opacity-70">Viability</span>
          </div>
          <div className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold ${angle.badge}`}>
            {angle.label}
          </div>
          <Link
            href={`/brief/${buildingId}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-[11px] font-semibold text-gray-300 transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View Brief
          </Link>
        </div>
      </div>
    </div>
  );
}
