import React from 'react';
import { RoiResult } from '@/types/roi';

type Props = {
  roiResult: RoiResult | null;
  loading: boolean;
  error: string | null;
};

export default function RoiPreviewPanel({ roiResult, loading, error }: Props) {
  if (error) {
    return <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 rounded-lg text-sm">{error}</div>;
  }

  if (loading) {
    return (
      <div className="p-4 border border-blue-500/20 bg-blue-500/10 rounded-lg text-sm text-center flex flex-col items-center gap-2">
        <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
        <span className="font-semibold text-blue-300">Calculating comprehensive ROI & Savings...</span>
      </div>
    );
  }

  if (!roiResult) return null;

  return (
    <div className="bg-gray-900 border border-gray-700/50 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/60">
        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">ROI & Financial Analysis</p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1">Water Savings</div>
          <div className="text-[15px] font-bold text-emerald-400">${roiResult.annual_water_savings_usd.toLocaleString()} <span className="text-xs text-gray-500 font-normal">/ yr</span></div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1">Sewer Savings</div>
          <div className="text-[15px] font-bold text-teal-400">${roiResult.annual_sewer_savings_usd.toLocaleString()} <span className="text-xs text-gray-500 font-normal">/ yr</span></div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1">Payback Period</div>
          <div className="text-[15px] font-bold text-white">{roiResult.payback_yrs} <span className="text-xs text-gray-500 font-normal">yrs</span></div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1">10-Yr NPV</div>
          <div className="text-[15px] font-bold text-white">${roiResult.npv_10yr_usd.toLocaleString()}</div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="bg-gray-800/60 border border-gray-700/40 rounded-md px-3 py-2 flex justify-between items-center">
          <span className="text-xs text-gray-400 font-medium">Base ROI</span>
          <span className="text-sm font-bold text-white">{roiResult.base_roi_percent}%</span>
        </div>
      </div>
    </div>
  );
}
