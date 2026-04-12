'use client'

import { useSelectionStore } from '@/store/selectionStore'
import type { AppSelectionState } from '@/types/state'

export default function FilterPanel() {
  const { filters, setFilter, mapMode, selectedStateId, selectedMetroId, setSelectedState, setSelectedMetro, setSelectedBuilding, reset } = useSelectionStore()

  const active = mapMode === 'metro' || mapMode === 'building'

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb navigation */}
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Scope</div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => reset()}
            className={`text-left text-xs px-2 py-1 rounded transition-colors ${
              mapMode === 'national'
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            National
          </button>
          {selectedStateId && (
            <button
              onClick={() => { setSelectedMetro(null); setSelectedBuilding(null); }}
              className={`text-left text-xs px-2 py-1 rounded transition-colors ${
                mapMode === 'state'
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              → State: {selectedStateId}
            </button>
          )}
          {selectedMetroId && (
            <button
              onClick={() => setSelectedBuilding(null)}
              className={`text-left text-xs px-2 py-1 rounded transition-colors ${
                mapMode === 'metro'
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              → Metro selected
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/60" />

      {/* Filters */}
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">Filters</div>

        {!active && (
          <p className="text-xs text-slate-600 italic">
            Select a metro to activate building filters.
          </p>
        )}

        {active && (
          <div className="flex flex-col gap-3">
            <FilterToggle
              label="Roof area &gt; 150K sqft"
              description="Large commercial footprint"
              checked={filters.roofAboveThreshold}
              onChange={(v) => setFilter('roofAboveThreshold', v)}
            />
            <FilterToggle
              label="Cooling tower detected"
              description="CV-verified cooling tower present"
              checked={filters.coolingTowerOnly}
              onChange={(v) => setFilter('coolingTowerOnly', v)}
            />
            <FilterToggle
              label="High water cost metro"
              description="Water rate &gt; $7/kgal"
              checked={filters.highWaterCostOnly}
              onChange={(v) => setFilter('highWaterCostOnly', v)}
            />
            <FilterToggle
              label="ESG-prioritized owner"
              description="ESG proxy score &gt; 80"
              checked={filters.esgPrioritizedOnly}
              onChange={(v) => setFilter('esgPrioritizedOnly', v)}
            />

            <div className="pt-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Min viability score</span>
                <span className="text-teal-400 font-mono">{filters.minViabilityScore}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={filters.minViabilityScore}
                onChange={(e) => setFilter('minViabilityScore', Number(e.target.value))}
                className="w-full accent-teal-500 h-1.5"
              />
            </div>

            <div className="pt-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Min CV confidence</span>
                <span className="text-teal-400 font-mono">
                  {Math.round(filters.minCvConfidence * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={filters.minCvConfidence}
                onChange={(e) => setFilter('minCvConfidence', Number(e.target.value))}
                className="w-full accent-teal-500 h-1.5"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-8 h-4 bg-slate-700 rounded-full peer-checked:bg-teal-600 transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-slate-400 rounded-full peer-checked:translate-x-4 peer-checked:bg-white transition-all" />
      </div>
      <div>
        <div className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors">{label}</div>
        <div className="text-xs text-slate-600">{description}</div>
      </div>
    </label>
  )
}
