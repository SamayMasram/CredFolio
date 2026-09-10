'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-300 shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Something Went Wrong</h1>
        <p className="text-slate-600 text-xs mt-2 mb-6">
          {error?.message || 'An unexpected error occurred while loading this page.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 bg-[#7ae582] hover:bg-[#6bd473] text-slate-950 font-black text-xs py-3 px-4 rounded-xl border border-slate-900 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-slate-950" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs py-3 px-4 rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-slate-900" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
