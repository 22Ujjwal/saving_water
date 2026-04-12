import React from "react";

interface SatellitePanelProps {
  address: string;
  lat: number;
  lng: number;
  roofAreaSqft: number;
  coolingTowerCount: number;
  cvConfidencePct: number;
  urgencyScore: number;
  imageryDate?: string;
  imagerySource?: string;
  imageryUrl?: string;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">{label}</span>
      <span className="text-sm font-bold text-white leading-tight">{value}</span>
      {sub && <span className="text-[10px] text-gray-500">{sub}</span>}
    </div>
  );
}

export default function SatellitePanel({
  address,
  lat,
  lng,
  roofAreaSqft,
  coolingTowerCount,
  cvConfidencePct,
  urgencyScore,
  imageryDate,
  imagerySource,
  imageryUrl,
}: SatellitePanelProps) {
  const cvColor =
    cvConfidencePct >= 85 ? "text-emerald-400" :
    cvConfidencePct >= 65 ? "text-amber-400" :
                            "text-rose-400";

  const urgencyColor =
    urgencyScore >= 8 ? "text-rose-400" :
    urgencyScore >= 5 ? "text-amber-400" :
                        "text-emerald-400";

  return (
    <div className="flex flex-col h-full bg-gray-900">

      {/* ── Imagery area ─────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 overflow-hidden">

        {imageryUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageryUrl}
            alt={`Satellite view of ${address}`}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Placeholder when no imagery is available yet */
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#0d1117]">

            {/* Subtle dot-grid background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #4b5563 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            {/* Gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/80" />

            {/* Building footprint SVG illustration */}
            <svg
              viewBox="0 0 320 240"
              className="w-full max-w-[340px] opacity-30 relative z-10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer roof outline */}
              <rect x="40" y="60" width="240" height="140" rx="2" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="6 3" />
              {/* Inner sections */}
              <rect x="60" y="80" width="80" height="100" rx="1" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
              <rect x="160" y="80" width="100" height="100" rx="1" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
              {/* Cooling tower markers */}
              <circle cx="100" cy="175" r="8" stroke="#34d399" strokeWidth="1.5" />
              <circle cx="100" cy="175" r="3" fill="#34d399" opacity="0.6" />
              <circle cx="200" cy="175" r="8" stroke="#34d399" strokeWidth="1.5" />
              <circle cx="200" cy="175" r="3" fill="#34d399" opacity="0.6" />
              <circle cx="240" cy="155" r="8" stroke="#34d399" strokeWidth="1.5" />
              <circle cx="240" cy="155" r="3" fill="#34d399" opacity="0.6" />
              {/* North indicator */}
              <line x1="290" y1="40" x2="290" y2="20" stroke="#9ca3af" strokeWidth="1.5" />
              <polygon points="290,14 286,24 294,24" fill="#9ca3af" />
              <text x="288" y="50" fill="#9ca3af" fontSize="8" fontFamily="monospace">N</text>
              {/* Scale bar */}
              <line x1="40" y1="218" x2="140" y2="218" stroke="#6b7280" strokeWidth="1" />
              <line x1="40" y1="213" x2="40" y2="223" stroke="#6b7280" strokeWidth="1" />
              <line x1="140" y1="213" x2="140" y2="223" stroke="#6b7280" strokeWidth="1" />
              <text x="65" y="230" fill="#6b7280" fontSize="7" fontFamily="monospace">~200 ft</text>
              {/* Corner coordinates */}
              <text x="36" y="55" fill="#374151" fontSize="7" fontFamily="monospace">{lat.toFixed(4)}°N</text>
              <text x="36" y="215" fill="#374151" fontSize="7" fontFamily="monospace">{lng.toFixed(4)}°W</text>
            </svg>

            {/* Status badge */}
            <div className="relative z-10 mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-widest">
                  Satellite imagery pending
                </span>
              </div>
              {imageryDate && (
                <span className="text-[9px] text-gray-600">
                  Last capture: {imageryDate}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Top-left: label */}
        <div className="absolute top-3 left-3 z-20">
          <div className="flex items-center gap-1.5 bg-gray-950/80 backdrop-blur-sm border border-gray-700/50 rounded px-2.5 py-1">
            <svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Satellite View</span>
          </div>
        </div>

        {/* Top-right: source badge */}
        {imagerySource && (
          <div className="absolute top-3 right-3 z-20">
            <span className="text-[9px] font-medium text-gray-500 bg-gray-950/70 px-2 py-0.5 rounded">
              {imagerySource}
            </span>
          </div>
        )}

        {/* Cooling tower legend */}
        <div className="absolute bottom-4 left-3 z-20 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-emerald-400 bg-emerald-400/20 inline-block" />
          <span className="text-[9px] text-gray-400 font-medium">Cooling tower detected</span>
        </div>
      </div>

      {/* ── Building intelligence stats ───────────────────────── */}
      <div className="border-t border-gray-800 px-5 py-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-3">
          Building Intelligence
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-500 block mb-0.5">
              CV Confidence
            </span>
            <span className={`text-lg font-black leading-none ${cvColor}`}>
              {cvConfidencePct}%
            </span>
            <span className="text-[9px] text-gray-600 block mt-0.5">Satellite detection</span>
          </div>
          <div>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-500 block mb-0.5">
              Urgency Score
            </span>
            <span className={`text-lg font-black leading-none ${urgencyColor}`}>
              {urgencyScore}<span className="text-xs font-medium text-gray-600">/10</span>
            </span>
            <span className="text-[9px] text-gray-600 block mt-0.5">Composite signal</span>
          </div>
          <Stat
            label="Roof Area"
            value={`${(roofAreaSqft / 1000).toFixed(0)}K sqft`}
            sub="Harvestable surface"
          />
          <Stat
            label="Cooling Towers"
            value={`${coolingTowerCount} detected`}
            sub="Active systems"
          />
        </div>
      </div>
    </div>
  );
}
