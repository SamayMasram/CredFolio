'use client';

import Link from 'next/link';
import { Award, LogOut, User, LayoutDashboard, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const activeUsername = profile?.username || (user?.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : null);

  return (
    <header className="border-b border-[#D8F3DC] bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-[#1B4332] text-[#D8F3DC] p-2 rounded-xl shadow-md border border-[#1B4332] group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5 text-[#D8F3DC]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#1B4332]">CredFolio</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="bg-[#40916C] hover:bg-[#1B4332] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm border border-[#40916C] flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <LayoutDashboard className="w-4 h-4 text-[#D8F3DC]" />
                <span>Dashboard</span>
              </Link>
              {activeUsername && (
                <Link
                  href={`/${activeUsername}`}
                  target="_blank"
                  className="text-xs font-extrabold text-[#1B4332] bg-[#D8F3DC]/40 hover:bg-[#D8F3DC] px-3.5 py-2 rounded-xl border border-[#D8F3DC] transition-all flex items-center gap-1 shadow-xs"
                  title="View Public Profile Page"
                >
                  <span>My Showcase</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#40916C]" />
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
                className="text-[#1B4332] hover:text-[#40916C] font-extrabold text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-[#40916C] hover:bg-[#1B4332] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm border border-[#40916C] transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
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

