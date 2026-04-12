'use client'

import { useSelectionStore } from '@/store/selectionStore'
import { loadBuildings } from '@/lib/data/loaders'
import { filterBuildings } from '@/lib/data/selectors'
import ScoreBadge from '@/components/ui/ScoreBadge'
import ConfidenceChip from '@/components/ui/ConfidenceChip'
import { formatSqft } from '@/lib/formatters'

const allBuildings = loadBuildings()

export default function BuildingListPanel() {
  const { selectedMetroId, selectedBuildingId, filters, setSelectedBuilding, mapMode } =
    useSelectionStore()

  if (mapMode !== 'metro' && mapMode !== 'building') return null
  if (!selectedMetroId) return null

  const filtered = filterBuildings(allBuildings, selectedMetroId, filters)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 uppercase tracking-widest">Building Candidates</div>
        <div className="text-xs text-slate-500">{filtered.length} shown</div>
      </div>

      {filtered.length === 0 && (
        <div className="text-xs text-slate-600 italic py-4 text-center">
          No candidates match the active filters.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {[...filtered].sort((a, b) => b.viability_score - a.viability_score).map((b) => (
          <button
            key={b.building_id}
            onClick={() => setSelectedBuilding(b.building_id)}
            className={`w-full text-left p-3 rounded border transition-colors ${
              selectedBuildingId === b.building_id
                ? 'border-teal-600/60 bg-teal-900/20'
                : 'border-slate-700/40 bg-slate-800/40 hover:bg-slate-700/40'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="text-xs font-medium text-slate-200 leading-snug">{b.address}</div>
              <ScoreBadge score={b.viability_score} size="sm" />
            </div>
            <div className="text-xs text-slate-500 mb-1.5">{b.building_type} · {formatSqft(b.roof_area_sqft)}</div>
            <div className="flex flex-wrap gap-1">
              <ConfidenceChip value={b.cv_confidence_score} label="CV" />
              {b.cooling_tower_present && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400 border border-amber-700/30">
                  {b.cooling_tower_count} tower{b.cooling_tower_count > 1 ? 's' : ''}
                </span>
              )}
              {b.water_restriction_active && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-700/30">
                  Restricted
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
