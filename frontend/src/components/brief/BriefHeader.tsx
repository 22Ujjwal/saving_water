"use client";

import React from "react";
import Link from "next/link";

type RecommendedAngle = "cost_savings" | "resilience" | "compliance" | "esg_credibility";

interface BriefHeaderProps {
  address: string;
  metro: string;
  state: string;
  buildingType: string;
  ownerTenant?: string;
  viabilityScore: number;
  recommendedAngle: RecommendedAngle;
  generatedAt: string;
  buildingId: string;
}

const ANGLE: Record<RecommendedAngle, { badge: string; label: string }> = {
  cost_savings:    { badge: "bg-teal-50 text-teal-700 border-teal-200",    label: "Cost Savings" },
  resilience:      { badge: "bg-blue-50 text-blue-700 border-blue-200",    label: "Resilience" },
  compliance:      { badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Compliance" },
  esg_credibility: { badge: "bg-purple-50 text-purple-700 border-purple-200", label: "ESG Credibility" },
};

const VIABILITY_COLOR = (score: number) =>
  score >= 80 ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
  score >= 60 ? "text-blue-700 bg-blue-50 border-blue-200" :
  score >= 40 ? "text-amber-700 bg-amber-50 border-amber-200" :
               "text-red-700 bg-red-50 border-red-200";

export default function BriefHeader({
  address,
  metro,
  state,
  buildingType,
  ownerTenant,
  viabilityScore,
  recommendedAngle,
  generatedAt,
  buildingId,
}: BriefHeaderProps) {
  const angle = ANGLE[recommendedAngle];
  const viabilityClasses = VIABILITY_COLOR(viabilityScore);
  const streetAddress = address.split(",")[0];
  const cityStateZip = address.split(",").slice(1).join(",").trim();

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm">

      {/* ── Nav bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <Link
            href="/map"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200 group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to Map</span>
          </Link>

          <span className="text-slate-200">·</span>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm shadow-blue-500/30">
              <svg viewBox="0 0 16 16" className="w-3 h-3 fill-white">
                <path d="M8 2c-.5 2-2 3.5-2 5.5a2 2 0 0 0 4 0C10 5.5 8.5 4 8 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-800">RainUSE Nexus</span>
            <span className="text-sm text-slate-400">/ Investment Brief</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono hidden sm:block">
            {buildingId} · {generatedAt}
          </span>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9V2h12v7" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="6" y="14" width="12" height="8" rx="1" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Building identity ────────────────────────────────── */}
      <div className="px-6 py-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
              {streetAddress}
            </h1>
            {ownerTenant && (
              <span className="text-base text-slate-500 font-medium shrink-0">{ownerTenant}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-sm text-slate-600">{metro}, {state}</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500 capitalize">{buildingType.replace(/_/g, " ")}</span>
            {cityStateZip && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-400">{cityStateZip}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: badges */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-bold shadow-sm ${viabilityClasses}`}>
            <span>{viabilityScore}</span>
            <span className="text-xs font-semibold uppercase tracking-wide opacity-75">Viability</span>
          </div>
          <div className={`px-3 py-2 rounded-xl border text-sm font-medium shadow-sm ${angle.badge}`}>
            {angle.label}
          </div>
        </div>
      </div>
    </div>
  );
}
