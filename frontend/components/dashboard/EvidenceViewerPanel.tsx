'use client'

import Image from 'next/image'
import type { BuildingCandidate } from '@/types/building'
import ConfidenceChip from '@/components/ui/ConfidenceChip'
import { formatSqft } from '@/lib/formatters'

type Props = {
  building: BuildingCandidate
}

export default function EvidenceViewerPanel({ building }: Props) {
  return (
    <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/40">
      <div className="px-3 pt-2.5 pb-2 border-b border-slate-700/40">
        <div className="text-xs text-slate-500 uppercase tracking-widest">CV / Satellite Evidence</div>
        <div className="text-xs text-slate-600 mt-0.5">Preprocessed from satellite imagery</div>
      </div>

      {/* Imagery thumbnail */}
      <div className="relative w-full h-40 bg-slate-900">
        <Image
          src={building.imagery_url}
          alt={`Satellite imagery of ${building.address}`}
          fill
          className="object-cover opacity-80"
          unoptimized
        />
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="text-xs px-2 py-0.5 rounded bg-green-900/80 text-green-300 border border-green-700/50 backdrop-blur-sm">
            Roof polygon detected
          </span>
          {building.cooling_tower_present && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-900/80 text-amber-300 border border-amber-700/50 backdrop-blur-sm">
              {building.cooling_tower_count} cooling tower{building.cooling_tower_count > 1 ? 's' : ''} detected
            </span>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="px-3 py-2.5 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ConfidenceChip value={building.cv_confidence_score} />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div>
            <div className="text-xs text-slate-500">Source</div>
            <div className="text-xs text-slate-300">{building.imagery_source}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Date</div>
            <div className="text-xs text-slate-300">{building.imagery_date}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Roof area</div>
            <div className="text-xs text-slate-300">{formatSqft(building.roof_area_sqft)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Towers</div>
            <div className="text-xs text-slate-300">
              {building.cooling_tower_present ? `${building.cooling_tower_count} detected` : 'None detected'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
