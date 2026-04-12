import React from "react";
import { cn } from "@/lib/utils";

export interface SavingsData {
  waterSavingsUsd: number;
  sewerSavingsUsd: number;
  stormwaterUsd: number;
  incentiveAmortUsd: number;
}

interface SavingsBreakdownProps {
  data: SavingsData;
}

interface Segment {
  key: keyof SavingsData;
  label: string;
  sub: string;
  color: string;
  bg: string;
  border: string;
  textColor: string;
}

const SEGMENTS: Segment[] = [
  {
    key: "waterSavingsUsd",
    label: "Water Savings",
    sub: "Potable water avoided",
    color: "bg-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    textColor: "text-blue-400",
  },
  {
    key: "sewerSavingsUsd",
    label: "Sewer Savings",
    sub: "70% discharge offset",
    color: "bg-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    textColor: "text-cyan-400",
  },
  {
    key: "stormwaterUsd",
    label: "Stormwater Avoidance",
    sub: "Active fee offset",
    color: "bg-teal-500",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    textColor: "text-teal-400",
  },
  {
    key: "incentiveAmortUsd",
    label: "Incentive (Amortized)",
    sub: "$25K over 10 yrs",
    color: "bg-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    textColor: "text-emerald-400",
  },
];

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString()}`;
}

export default function SavingsBreakdown({ data }: SavingsBreakdownProps) {
  const total = SEGMENTS.reduce((acc, s) => acc + data[s.key], 0);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-4">
      <div>
        <h3 className="text-xs font-bold text-white">Annual Savings Composition</h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Breakdown by savings category</p>
      </div>

      {/* ── Total hero ──────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-500 mb-0.5">
            Total Annual Savings
          </div>
          <div className="text-3xl font-black text-emerald-400 tabular-nums leading-none">
            {fmtUsd(total)}
          </div>
          <div className="text-[10px] text-gray-600 mt-1">per year</div>
        </div>
        {/* Simple donut ring */}
        <DonutRing data={data} total={total} />
      </div>

      {/* ── Stacked bar ─────────────────────────────────── */}
      <div>
        <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-600 mb-2">
          Composition
        </div>
        <div className="flex h-4 rounded-full overflow-hidden gap-px bg-gray-800">
          {SEGMENTS.map((s) => {
            const pct = total > 0 ? (data[s.key] / total) * 100 : 0;
            if (pct < 1) return null;
            return (
              <div
                key={s.key}
                className={cn("h-full transition-all", s.color)}
                style={{ width: `${pct}%` }}
                title={`${s.label}: ${fmtUsd(data[s.key])}`}
              />
            );
          })}
        </div>
      </div>

      {/* ── Segment breakdown list ──────────────────────── */}
      <div className="space-y-2">
        {SEGMENTS.map((s) => {
          const pct = (total > 0 ? (data[s.key] / total) * 100 : 0).toFixed(0);
          return (
            <div
              key={s.key}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 border",
                s.bg, s.border
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={cn("w-2 h-2 rounded-full shrink-0", s.color)} />
                <div className="min-w-0">
                  <div className={cn("text-xs font-semibold", s.textColor)}>{s.label}</div>
                  <div className="text-[10px] text-gray-600">{s.sub}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[10px] text-gray-600">{pct}%</span>
                <span className={cn("text-sm font-bold tabular-nums", s.textColor)}>
                  {fmtUsd(data[s.key])}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer note ─────────────────────────────────── */}
      <div className="pt-2 border-t border-gray-800">
        <p className="text-[10px] text-gray-600 text-center">
          Water + sewer + stormwater avoidance + incentive amortization
        </p>
      </div>
    </div>
  );
}

// ─── Donut ring (pure SVG, no deps) ──────────────────────────────────────────

const DONUT_COLORS = ["#3b82f6", "#06b6d4", "#14b8a6", "#10b981"];

function DonutRing({ data, total }: { data: SavingsData; total: number }) {
  const r = 28;
  const cx = 36;
  const cy = 36;
  const circumference = 2 * Math.PI * r;

  const values = SEGMENTS.map((s) => data[s.key]);
  let offset = 0;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth="8" />
      {/* Segments */}
      {total > 0 && values.map((v, i) => {
        const pct = v / total;
        const dash = circumference * pct;
        const gap = circumference - dash;
        const rotation = -90 + (offset / total) * 360;
        offset += v;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={DONUT_COLORS[i]}
            strokeWidth="8"
            strokeDasharray={`${dash.toFixed(1)} ${gap.toFixed(1)}`}
            strokeLinecap="butt"
            transform={`rotate(${rotation.toFixed(1)} ${cx} ${cy})`}
          />
        );
      })}
      {/* Center label */}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#9ca3af" fontSize="7" fontFamily="monospace">
        /yr
      </text>
      <text x={cx} y={cy + 7} textAnchor="middle" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">
        {((total / 1000)).toFixed(0)}K
      </text>
    </svg>
  );
}
