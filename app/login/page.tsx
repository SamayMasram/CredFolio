'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Navbar } from '@/components/Navbar';
import { Award, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, refreshProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await refreshProfile();
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FCD9] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-[#004b23] rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl my-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#004b23] text-[#F4FCD9] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#004b23] shadow-sm">
              <Award className="w-6 h-6 text-[#F4FCD9]" />
            </div>
            <h1 className="text-2xl font-black text-black">Welcome Back</h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Sign in to manage your credentials and shareable link.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F4FCD9] focus:border-[#004b23] outline-none text-sm text-black font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F4FCD9] focus:border-[#004b23] outline-none text-sm text-black font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#008000] hover:bg-[#004b23] text-white font-extrabold text-sm py-3 rounded-xl border border-[#008000] shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 text-[#F4FCD9]" />
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F4FCD9]"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] uppercase font-bold text-slate-400">
              Or
            </span>
          </div>

          <button
            onClick={async () => {
              try {
                await loginWithGoogle();
                router.push('/dashboard');
              } catch (err: any) {
                setError(err.message || 'Google sign in failed');
              }
            }}
            className="w-full bg-white hover:bg-[#F4FCD9]/40 text-black font-bold text-xs py-3 rounded-xl border border-[#F4FCD9] shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account yet?{' '}
            <Link href="/signup" className="font-bold text-[#008000] hover:underline">
              Create Your Link
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}


