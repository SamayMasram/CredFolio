'use client';

import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-800 border-2 border-slate-700 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">Critical System Error</h1>
          <p className="text-slate-400 text-xs mt-2 mb-6">
            {error?.message || 'A critical application error occurred.'}
          </p>

          <button
            onClick={() => reset()}
            className="w-full bg-[#74C69D] hover:bg-[#52B788] text-slate-950 font-black text-xs py-3 px-4 rounded-xl border border-slate-900 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-slate-950" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
