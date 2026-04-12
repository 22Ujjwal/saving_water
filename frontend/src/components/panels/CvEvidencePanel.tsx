import { Camera } from "lucide-react";
import { BuildingCandidate } from "@/types/building";

export default function CvEvidencePanel({ building }: { building: BuildingCandidate }) {
  const confPct = Math.round(building.cv_confidence_score * 100);
  const confColor =
    confPct >= 90 ? "text-emerald-400" :
    confPct >= 70 ? "text-amber-400"  :
    "text-red-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold">Imagery Evidence</p>
        <span className="flex items-center gap-1 text-[10px] text-gray-600">
          <Camera size={10} /> Precomputed
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800/60 rounded-md p-2.5 border border-gray-700/40">
          <p className="text-[10px] text-gray-500 mb-1">CV Confidence</p>
          <p className={`text-sm font-black ${confColor}`}>{confPct}%</p>
        </div>
        <div className="bg-gray-800/60 rounded-md p-2.5 border border-gray-700/40">
          <p className="text-[10px] text-gray-500 mb-1">Cooling Towers</p>
          <p className={`text-sm font-bold ${building.cooling_tower_present ? "text-blue-400" : "text-gray-500"}`}>
            {building.cooling_tower_present ? `${building.cooling_tower_count} detected` : "None"}
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-gray-600">
        <span>Source: {building.imagery_source ?? "Satellite"}</span>
        <span>Date: {building.imagery_date ?? "Unknown"}</span>
      </div>
    </div>
  );
}
