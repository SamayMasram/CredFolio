'use client';

import Link from 'next/link';
import { Award, LogOut, User, LayoutDashboard, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const activeUsername = profile?.username || (user?.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : null);

  return (
    <header className="border-b border-[#E8FCCF] bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-[#134611] text-[#E8FCCF] p-2 rounded-xl shadow-md border border-[#134611] group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5 text-[#E8FCCF]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#134611]">CredFolio</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="bg-[#3E8914] hover:bg-[#134611] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm border border-[#3E8914] flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <LayoutDashboard className="w-4 h-4 text-[#E8FCCF]" />
                <span>Dashboard</span>
              </Link>
              {activeUsername && (
                <Link
                  href={`/${activeUsername}`}
                  target="_blank"
                  className="text-xs font-extrabold text-[#134611] bg-[#E8FCCF]/40 hover:bg-[#E8FCCF] px-3.5 py-2 rounded-xl border border-[#E8FCCF] transition-all flex items-center gap-1 shadow-xs"
                  title="View Public Profile Page"
                >
                  <span>My Showcase</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#3E8914]" />
                </Link>
              )}
              <button
                onClick={logout}
                className="text-slate-500 hover:text-red-600 p-2 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[#134611] hover:text-[#3E8914] font-extrabold text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-[#3E8914] hover:bg-[#134611] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm border border-[#3E8914] transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Your Link
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

