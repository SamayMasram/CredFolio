import React from 'react';
import { Award, Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      {/* Top Animated Progress Bar */}
      <div className="w-full h-1 bg-slate-200 overflow-hidden">
        <div className="h-full bg-[#9ef01a] w-1/3 animate-[pulse_1.5s_ease-in-out_infinite] transition-all duration-300" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Animated Glowing Badge */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-3xl bg-[#9ef01a] blur-xl opacity-60 animate-pulse" />
          <div className="relative w-20 h-20 bg-slate-900 text-[#9ef01a] rounded-3xl flex items-center justify-center border-2 border-slate-900 shadow-2xl animate-bounce">
            <Award className="w-10 h-10" />
          </div>
        </div>

        {/* Loading Spinner & Text */}
        <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm mb-8">
          <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
          <span className="tracking-wide">Refreshing CredFolio...</span>
        </div>

        {/* Skeleton Preview */}
        <div className="w-full max-w-xl bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
              <div className="h-3 bg-slate-200 rounded-lg w-3/4" />
            </div>
          </div>
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-20 bg-slate-100 rounded-xl" />
            <div className="h-20 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

