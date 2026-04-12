import React from 'react';
import { BriefResult } from '@/types/brief';

type Props = {
  briefResult: BriefResult | null;
  loading: boolean;
  error: string | null;
};

export default function BriefPreviewPanel({ briefResult, loading, error }: Props) {
  if (error) {
    return <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded text-sm">{error}</div>;
  }

  if (loading) {
    return (
      <div className="p-4 border border-purple-200 bg-purple-50 rounded text-sm text-center flex flex-col items-center gap-2">
         <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full" />
         <span className="font-semibold text-purple-800">Generating AI Investment Brief...</span>
      </div>
    );
  }

  if (!briefResult) return null;

  return (
    <div className="bg-white border border-purple-200 text-sm rounded shadow-sm overflow-hidden">
      <div className="p-3 border-b border-purple-100 bg-purple-50 font-bold text-purple-900 border-l-4 border-l-purple-600">
         AI Investment Brief
      </div>
      <div className="p-3 space-y-4">
         <div>
           <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wide">Executive Summary</div>
           <p className="text-slate-700 leading-relaxed text-[13px]">{briefResult.executive_summary}</p>
         </div>
         <div>
           <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wide">Pitch Script</div>
           <div className="bg-slate-50 border border-slate-100 italic p-2 text-[13px] text-slate-800 rounded">
             "{briefResult.pitch_script}"
           </div>
         </div>
         <div>
           <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wide">Risks & Mitigations</div>
           <ul className="list-disc list-outside ml-4 space-y-1 text-[13px] text-slate-700">
             {briefResult.risks_and_mitigation.map((risk, i) => (
                <li key={i}>{risk}</li>
             ))}
           </ul>
         </div>
      </div>
    </div>
  );
}
