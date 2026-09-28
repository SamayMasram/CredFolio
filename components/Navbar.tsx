'use client';

import Link from 'next/link';
import { Award, LogOut, User, LayoutDashboard, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const activeUsername = profile?.username || (user?.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : null);

  return (
    <header className="border-b border-[#F4FCD9] bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-[#004b23] text-[#F4FCD9] p-2 rounded-xl shadow-md border border-[#004b23] group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5 text-[#F4FCD9]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-black">CredFolio</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="bg-[#008000] hover:bg-[#004b23] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm border border-[#008000] flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <LayoutDashboard className="w-4 h-4 text-[#F4FCD9]" />
                <span>Dashboard</span>
              </Link>
              {activeUsername && (
                <Link
                  href={`/${activeUsername}`}
                  target="_blank"
                  className="text-xs font-extrabold text-black bg-[#F4FCD9]/40 hover:bg-[#F4FCD9] px-3.5 py-2 rounded-xl border border-[#F4FCD9] transition-all flex items-center gap-1 shadow-xs"
                  title="View Public Profile Page"
                >
                  <span>My Showcase</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#008000]" />
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
                className="text-black hover:text-[#008000] font-extrabold text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-[#008000] hover:bg-[#004b23] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm border border-[#008000] transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
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


