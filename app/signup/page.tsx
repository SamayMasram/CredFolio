'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { api } from '@/lib/api/client';
import { Navbar } from '@/components/Navbar';
import { Award, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { loginWithGoogle, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [headline, setHeadline] = useState('');

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = async (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(clean);
    if (clean.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const avail = await api.checkUsernameAvailability(clean);
      setUsernameAvailable(avail);
    } catch {
      setUsernameAvailable(true); // Fallback for dev mode
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (usernameAvailable === false) {
      setError('Username is already taken');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Create Profile & reserve Username via Backend API
      await api.createProfile({
        uid: userCred.user.uid,
        username,
        full_name: fullName,
        headline: headline || 'Lifelong Learner',
        visibility: 'public',
      });

      await refreshProfile();
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D8F3DC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-[#1B4332] rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl my-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#1B4332] text-[#D8F3DC] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#1B4332] shadow-sm">
              <Award className="w-6 h-6 text-[#D8F3DC]" />
            </div>
            <h1 className="text-2xl font-black text-[#1B4332]">Create Your CredFolio</h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Build your public credential showcase page in 2 minutes.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1B4332] uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8F3DC] focus:border-[#1B4332] outline-none text-sm text-[#1B4332] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B4332] uppercase tracking-wider mb-1">
                Choose Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="janedoe"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8F3DC] focus:border-[#1B4332] outline-none text-sm text-[#1B4332] font-mono font-bold lowercase"
                />
                {usernameAvailable === true && (
                  <span className="absolute right-3 top-3 text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Available
                  </span>
                )}
                {usernameAvailable === false && (
                  <span className="absolute right-3 top-3 text-xs text-red-600 font-bold">
                    Taken
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#40916C] mt-1 font-mono font-bold">
                Your link: credfolio.app/{username || 'username'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B4332] uppercase tracking-wider mb-1">
                Headline / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Cloud Engineer"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8F3DC] focus:border-[#1B4332] outline-none text-sm text-[#1B4332] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B4332] uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8F3DC] focus:border-[#1B4332] outline-none text-sm text-[#1B4332] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B4332] uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8F3DC] focus:border-[#1B4332] outline-none text-sm text-[#1B4332] font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#40916C] hover:bg-[#1B4332] text-white font-extrabold text-sm py-3 rounded-xl border border-[#40916C] shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Get Your Link'}</span>
              <ArrowRight className="w-4 h-4 text-[#D8F3DC]" />
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D8F3DC]"></div>
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
            className="w-full bg-white hover:bg-[#D8F3DC]/40 text-[#1B4332] font-bold text-xs py-3 rounded-xl border border-[#D8F3DC] shadow-sm flex items-center justify-center gap-2 transition-colors"
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
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#40916C] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

