'use client'

import { useSelectionStore } from '@/store/selectionStore'
import { loadBuildings } from '@/lib/data/loaders'
import { mockRoiResult, mockBrief, calculateRoi, generateBrief } from '@/lib/api'
import ScoreBadge from '@/components/ui/ScoreBadge'
import ConfidenceChip from '@/components/ui/ConfidenceChip'
import DriverTag from '@/components/ui/DriverTag'
import MetricRow from '@/components/ui/MetricRow'
import EvidenceViewerPanel from './EvidenceViewerPanel'
import { formatUSD, formatGallons, formatSqft, formatPct, angleLabel } from '@/lib/formatters'

const allBuildings = loadBuildings()

export default function BuildingProfilePanel() {
  const {
    selectedBuildingId,
    roiResult,
    roiLoading,
    brief,
    briefLoading,
    setRoiResult,
    setRoiLoading,
    setBrief,
    setBriefLoading,
  } = useSelectionStore()

  if (!selectedBuildingId) return null

  const building = allBuildings.find((b) => b.building_id === selectedBuildingId)
  if (!building) return null

  const handleAnalyzeRoi = async () => {
    setRoiLoading(true)
    try {
      const result = await calculateRoi(building)
      setRoiResult(result)
    } catch {
      // Backend unavailable — use mock
      await new Promise((r) => setTimeout(r, 800))
      setRoiResult(mockRoiResult(building))
    } finally {
      setRoiLoading(false)
    }
  }

  const handleGenerateBrief = async () => {
    if (!roiResult) return
    setBriefLoading(true)
    try {
      const result = await generateBrief(building, roiResult)
      setBrief(result)
    } catch {
      await new Promise((r) => setTimeout(r, 1200))
      setBrief(mockBrief(building, roiResult))
    } finally {
      setBriefLoading(false)
    }
  }

  const angleColors: Record<string, string> = {
    cost_savings: 'bg-green-900/30 text-green-400 border-green-700/30',
    resilience: 'bg-blue-900/30 text-blue-400 border-blue-700/30',
    compliance: 'bg-purple-900/30 text-purple-400 border-purple-700/30',
    esg_credibility: 'bg-teal-900/30 text-teal-400 border-teal-700/30',
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Selected Building</div>
        <div className="text-sm font-semibold text-slate-100 leading-snug mb-1">{building.address}</div>
        <div className="text-xs text-slate-400 mb-2">{building.building_type} · {building.owner_tenant}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <ScoreBadge score={building.viability_score} size="md" />
          <ConfidenceChip value={building.cv_confidence_score} />
          <span
            className={`text-xs px-2 py-0.5 rounded border ${angleColors[building.recommended_angle] ?? 'bg-slate-700/30 text-slate-300 border-slate-600/30'}`}
          >
            {angleLabel(building.recommended_angle)}
          </span>
        </div>
      </div>

      {/* Urgency drivers */}
      <div>
        <div className="text-xs text-slate-500 mb-1.5">Urgency Drivers</div>
        <div className="flex flex-wrap gap-1">
          {building.urgency_drivers.map((d) => (
            <DriverTag key={d} label={d} variant="urgent" />
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Physical</div>
        <MetricRow label="Roof Area" value={formatSqft(building.roof_area_sqft)} />
        <MetricRow label="Annual Rainfall" value={`${building.annual_rainfall_in}"`} />
        <MetricRow label="Harvestable" value={formatGallons(building.harvestable_gal_yr)} highlight />
        <MetricRow label="Water Stress" value={building.water_stress_tier} />
        {building.cooling_tower_present && (
          <MetricRow label="Cooling Towers" value={`${building.cooling_tower_count} detected`} />
        )}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Financial Snapshot</div>
        <MetricRow label="Annual Water Savings" value={formatUSD(building.annual_water_savings_usd)} highlight />
        <MetricRow label="Annual Sewer Savings" value={formatUSD(building.annual_sewer_savings_usd)} highlight />
        <MetricRow label="Incentive Value" value={formatUSD(building.incentive_value_usd)} />
        <MetricRow label="CapEx Range" value={`${formatUSD(building.system_capex_range[0])} – ${formatUSD(building.system_capex_range[1])}`} />
        <MetricRow label="Simple Payback" value={`${building.simple_payback_yrs} yrs`} highlight />
        <MetricRow label="10-yr NPV" value={formatUSD(building.npv_10yr_usd)} highlight />
      </div>

      {/* ESG flags */}
      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">ESG Profile</div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {building.sbti_committed && <DriverTag label={`SBTi → ${building.net_zero_pledge_yr}`} variant="esg" />}
          {building.leed_certified && <DriverTag label="LEED Certified" variant="esg" />}
          {building.water_risk_in_10k && <DriverTag label="Water Risk in 10-K" variant="urgent" />}
        </div>
        {building.sec_filing_snippet && (
          <p className="text-xs text-slate-500 italic leading-relaxed">
            &ldquo;{building.sec_filing_snippet.slice(0, 140)}...&rdquo;
          </p>
        )}
      </div>

      {/* Evidence viewer */}
      <EvidenceViewerPanel building={building} />

      <div className="border-t border-slate-700/60" />

      {/* ROI Section */}
      <div>
        <button
          onClick={handleAnalyzeRoi}
          disabled={roiLoading}
          className="w-full py-2.5 px-4 rounded bg-teal-700 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
        >
          {roiLoading ? 'Analyzing...' : 'Analyze ROI'}
        </button>

        {roiResult && (
          <div className="mt-3 bg-teal-900/20 border border-teal-700/30 rounded-lg p-3">
            <div className="text-xs text-teal-400 uppercase tracking-widest mb-2">ROI Analysis</div>
            <MetricRow label="Annual Savings" value={formatUSD(roiResult.annual_savings_usd)} highlight />
            <MetricRow label="Simple Payback" value={`${roiResult.simple_payback_yrs} yrs`} />
            <MetricRow label="10-yr NPV" value={formatUSD(roiResult.npv_10yr_usd)} highlight />
            <MetricRow label="IRR" value={`${roiResult.irr_pct}%`} />
            <MetricRow label="Water Offset" value={`${roiResult.water_offset_pct}%`} />
            <MetricRow label="CO₂ Offset" value={`${roiResult.co2_offset_tons_yr} t/yr`} />
            <MetricRow label="Confidence Adj. ROI" value={formatPct(roiResult.confidence_adj_roi)} highlight />
          </div>
        )}
      </div>

      {/* Brief Section */}
      {roiResult && (
        <div>
          <button
            onClick={handleGenerateBrief}
            disabled={briefLoading}
            className="w-full py-2.5 px-4 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            {briefLoading ? 'Generating Brief...' : 'Generate Investment Brief'}
          </button>

          {brief && (
            <div className="mt-3 flex flex-col gap-3">
              <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-3">
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Executive Summary</div>
                <p className="text-xs text-slate-300 leading-relaxed">{brief.executive_summary}</p>
              </div>

              {[brief.financial_case, brief.risk_and_mitigation, brief.regulatory_context, brief.esg_narrative].map(
                (section) => (
                  <div key={section.heading} className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1.5">{section.heading}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{section.body}</p>
                  </div>
                )
              )}

              <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Next Steps</div>
                <ol className="flex flex-col gap-1">
                  {brief.recommended_next_steps.map((step, i) => (
                    <li key={i} className="text-xs text-slate-400 flex gap-2">
                      <span className="text-teal-500 font-mono flex-shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <p className="text-xs text-slate-600 italic leading-relaxed">{brief.confidence_note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
