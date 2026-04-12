'use client'

import dynamic from 'next/dynamic'
import { useSelectionStore } from '@/store/selectionStore'
import FilterPanel from './FilterPanel'
import StateSummaryPanel from './StateSummaryPanel'
import BuildingListPanel from './BuildingListPanel'
import BuildingProfilePanel from './BuildingProfilePanel'

// MapLibre must be loaded client-side only (no SSR)
const ProspectingMap = dynamic(() => import('@/components/map/ProspectingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
      <div className="text-slate-500 text-sm">Loading map...</div>
    </div>
  ),
})

export default function ProspectingDashboard() {
  const { mapMode, selectedStateId, selectedBuildingId, reset } = useSelectionStore()

  const modeLabel: Record<typeof mapMode, string> = {
    national: 'National',
    state: 'State',
    metro: 'Metro',
    building: 'Building',
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d1117] text-slate-100">
      {/* ── Left Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-800 overflow-y-auto">
        {/* Logo / Title */}
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="text-sm font-bold text-slate-100 tracking-tight">RainUSE Nexus</div>
          <div className="text-xs text-slate-500 mt-0.5">Prospecting Engine</div>
        </div>

        {/* Mode indicator */}
        <div className="px-4 py-2 border-b border-slate-800/60 flex items-center gap-2">
          <span className="text-xs text-slate-500">View:</span>
          <span className="text-xs font-semibold text-teal-400">{modeLabel[mapMode]}</span>
        </div>

        <div className="flex-1 px-4 py-4 flex flex-col gap-5">
          <FilterPanel />
        </div>
      </aside>

      {/* ── Center Map ────────────────────────────────────────────────── */}
      <main className="flex-1 relative min-w-0">
        <ProspectingMap />

        {/* Floating scope label */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded px-3 py-1.5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">{modeLabel[mapMode]} View</span>
            {selectedStateId && (
              <span className="text-xs text-slate-500">· {selectedStateId}</span>
            )}
          </div>
        </div>

        {/* Reset button */}
        {mapMode !== 'national' && (
          <div className="absolute top-3 left-3 z-10 mt-10">
            <button
              onClick={reset}
              className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/80 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded transition-colors"
            >
              ← Reset to National
            </button>
          </div>
        )}
      </main>

      {/* ── Right Panel ───────────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 flex flex-col border-l border-slate-800 overflow-y-auto">
        {mapMode === 'national' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 gap-3">
            <div className="text-slate-600 text-sm">Click any state to begin</div>
            <div className="text-xs text-slate-700 leading-relaxed">
              States are scored by Market Readiness. Select one to see metro markets and building candidates.
            </div>
          </div>
        )}

        {(mapMode === 'state' || mapMode === 'metro') && !selectedBuildingId && (
          <div className="px-4 py-4">
            <StateSummaryPanel />
            <div className="mt-5">
              <BuildingListPanel />
            </div>
          </div>
        )}

        {mapMode === 'building' && selectedBuildingId && (
          <div className="px-4 py-4">
            <BuildingProfilePanel />
          </div>
        )}
      </aside>
    </div>
  )
}
