import React from 'react';
import { BriefResult } from '@/types/brief';

type Props = {
  briefResult: BriefResult | null;
  loading: boolean;
  error: string | null;
};

export default function BriefPreviewPanel({ briefResult, loading, error }: Props) {
  if (error) {
    return <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 rounded-lg text-sm">{error}</div>;
  }

  if (loading) {
    return (
      <div className="p-4 border border-purple-500/20 bg-purple-500/10 rounded-lg text-sm text-center flex flex-col items-center gap-2">
        <div className="animate-spin w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full" />
        <span className="font-semibold text-purple-300">Generating AI Investment Brief...</span>
      </div>
    );
  }

  if (!briefResult) return null;

  return (
    <div className="bg-gray-900 border border-purple-500/20 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-purple-500/20 bg-purple-500/10 border-l-2 border-l-purple-500">
        <p className="text-[11px] uppercase tracking-widest text-purple-300 font-medium">AI Investment Brief</p>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-2">Executive Summary</div>
          <p className="text-[13px] text-gray-300 leading-relaxed">{briefResult.executive_summary}</p>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-2">Pitch Script</div>
          <div className="bg-gray-800/60 border border-gray-700/40 rounded-md p-3 italic text-[13px] text-gray-200">
            "{briefResult.pitch_script}"
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-2">Risks & Mitigations</div>
          <ul className="list-disc list-outside ml-4 space-y-1.5 text-[13px] text-gray-300">
            {briefResult.risks_and_mitigation.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
