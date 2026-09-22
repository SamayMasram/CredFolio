import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FileQuestion, Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-300 shadow-sm">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">404</h1>
          <h2 className="text-lg font-bold text-slate-800 mt-1">Page Not Found</h2>
          <p className="text-slate-500 text-xs mt-2 mb-6">
            The page or credential link you are looking for does not exist or has been moved.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full bg-[#96E072] hover:bg-[#3DA35D] text-slate-950 font-black text-xs py-3 px-4 rounded-xl border border-slate-900 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-950" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/signup"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs py-3 px-4 rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <span>Create Your CredFolio</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
