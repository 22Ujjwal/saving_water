'use client'

import { useSelectionStore } from '@/store/selectionStore'
import { loadStateScores } from '@/lib/data/loaders'
import ScoreBadge from '@/components/ui/ScoreBadge'
import DriverTag from '@/components/ui/DriverTag'

const stateScores = loadStateScores()

export default function StateSummaryPanel() {
  const { selectedStateId, selectedMetroId, setSelectedMetro } = useSelectionStore()

  if (!selectedStateId) return null

  const state = stateScores.find((s) => s.state_id === selectedStateId)
  if (!state) return null

  const breakdown = state.score_breakdown
  const breakdownItems = [
    { label: 'Water Cost Pressure', value: breakdown.water_cost_pressure },
    { label: 'Rainfall Availability', value: breakdown.rainfall_availability },
    { label: 'Building Density', value: breakdown.building_density },
    { label: 'Regulatory Friendliness', value: breakdown.regulatory_friendliness },
    { label: 'Drought Resilience Need', value: breakdown.drought_resilience_pressure },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">State</div>
          <div className="text-lg font-semibold text-slate-100">{state.state_name}</div>
        </div>
        <ScoreBadge score={state.market_readiness_score} size="lg" />
      </div>

      {/* Drivers */}
      <div>
        <div className="text-xs text-slate-500 mb-2">Top Drivers</div>
        <div className="flex flex-wrap gap-1.5">
          {state.top_drivers.map((d) => (
            <DriverTag key={d} label={d} variant="urgent" />
          ))}
        </div>
      </div>

      {/* Score breakdown bars */}
      <div>
        <div className="text-xs text-slate-500 mb-2">Score Breakdown</div>
        <div className="flex flex-col gap-2">
          {breakdownItems.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-slate-400">{item.label}</span>
                <span className="text-slate-300 font-mono">{item.value}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: item.value >= 80 ? '#00c87a' : item.value >= 60 ? '#f59e0b' : '#64748b',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-700/60" />

      {/* Metro list */}
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Metro Markets</div>
        <div className="flex flex-col gap-1.5">
          {[...state.metros].sort((a, b) => b.score - a.score).map((metro) => (
            <button
              key={metro.metro_id}
              onClick={() => setSelectedMetro(metro.metro_id)}
              className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                selectedMetroId === metro.metro_id
                  ? 'border-teal-600/60 bg-teal-900/20 text-teal-200'
                  : 'border-slate-700/40 bg-slate-800/40 hover:bg-slate-700/40 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{metro.metro_name}</span>
                <span className="text-xs font-mono text-teal-400">{metro.score}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {metro.top_drivers.slice(0, 2).join(' · ')}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
