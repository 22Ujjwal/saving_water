import React from 'react';
import { RoiResult } from '@/types/roi';

type Props = {
  roiResult: RoiResult | null;
  loading: boolean;
  error: string | null;
};

export default function RoiPreviewPanel({ roiResult, loading, error }: Props) {
  if (error) {
    return <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded text-sm">{error}</div>;
  }

  if (loading) {
    return (
      <div className="p-4 border border-blue-200 bg-blue-50 rounded text-sm text-center flex flex-col items-center gap-2">
        <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
        <span className="font-semibold text-blue-800">Calculating comprehensive ROI & Savings...</span>
      </div>
    );
  }

  if (!roiResult) return null;

  return (
    <div className="bg-white border text-sm rounded shadow-sm">
      <div className="p-3 border-b bg-slate-50 font-semibold text-slate-800">ROI & Financial Analysis</div>
      <div className="p-3 grid grid-cols-2 gap-y-3 gap-x-4">
         <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Water Savings</div>
            <div className="font-semibold text-green-700">${roiResult.annual_water_savings_usd.toLocaleString()} / <span className="text-xs text-slate-500 font-normal">yr</span></div>
         </div>
         <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Sewer Savings</div>
            <div className="font-semibold text-emerald-700">${roiResult.annual_sewer_savings_usd.toLocaleString()} / <span className="text-xs text-slate-500 font-normal">yr</span></div>
         </div>
         <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Payback Period</div>
            <div className="font-semibold text-slate-800">{roiResult.payback_yrs} <span className="text-xs text-slate-500 font-normal">yrs</span></div>
         </div>
         <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">10-Yr NPV</div>
            <div className="font-semibold text-slate-800">${roiResult.npv_10yr_usd.toLocaleString()}</div>
         </div>
      </div>
      <div className="px-3 pb-3">
         <div className="bg-slate-100 rounded p-2 flex justify-between items-center text-xs">
           <span className="font-semibold text-slate-600">Base ROI</span>
           <span className="font-bold text-slate-800">{roiResult.base_roi_percent}%</span>
         </div>
      </div>
    </div>
  );
}
