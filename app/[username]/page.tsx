'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Certificate, UserProfile } from '@/types';
import { ShieldCheck, UserX, Loader2 } from 'lucide-react';
import { PublicProfileClient } from './PublicProfileClient';
import { AmbientTheme } from '@/components/AmbientTheme';
import { api } from '@/lib/api/client';

interface Props {
  params: { username: string };
}

export default function PublicProfilePage({ params }: Props) {
  const username = params.username.toLowerCase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadPublicData() {
      setLoading(true);
      
      // Load local storage fallback if present
      let localCerts: Certificate[] = [];
      try {
        const cached = localStorage.getItem(`credfolio_certs_${username}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localCerts = parsed;
            setCertificates(parsed);
          }
        }
      } catch {}

      try {
        const data = await api.getPublicProfile(username);
        if (data.isPrivate) {
          setIsPrivate(true);
          setProfile(data.profile);
        } else {
          setProfile(data.profile);
          if (data.certificates && data.certificates.length > 0) {
            setCertificates(data.certificates);
            try {
              localStorage.setItem(`credfolio_certs_${username}`, JSON.stringify(data.certificates));
            } catch {}
          } else if (localCerts.length > 0) {
            setCertificates(localCerts);
          } else {
            setCertificates([]);
          }
        }
      } catch (err) {
        console.warn('Failed to load profile:', err);
        if (localCerts.length > 0) {
          setCertificates(localCerts);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }

    loadPublicData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        {/* Animated Progress Line */}
        <div className="w-full h-1 bg-slate-200 overflow-hidden">
          <div className="h-full bg-[#9ef01a] w-1/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>

        <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full animate-pulse">
          {/* Skeleton Header Card */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-slate-200 rounded-2xl shrink-0" />
                <div className="space-y-2.5 flex-1">
                  <div className="h-6 bg-slate-200 rounded-lg w-48" />
                  <div className="h-4 bg-slate-200 rounded-lg w-64" />
                  <div className="h-3 bg-slate-100 rounded-md w-32 font-mono" />
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="h-9 bg-slate-200 rounded-xl w-24" />
                <div className="h-9 bg-[#9ef01a]/40 rounded-xl w-28" />
              </div>
            </div>
            <div className="mt-4 h-4 bg-slate-100 rounded-lg w-full max-w-2xl" />
          </div>

          {/* Skeleton Filter & Cards */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-slate-200 rounded-lg w-48" />
            <div className="flex gap-2">
              <div className="h-8 bg-slate-200 rounded-xl w-16" />
              <div className="h-8 bg-slate-100 rounded-xl w-16" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border-2 border-slate-200 rounded-2xl p-6 h-48 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded-md w-20" />
                  <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <div className="h-3 bg-slate-200 rounded-md w-24" />
                  <div className="h-4 bg-[#9ef01a]/30 rounded-md w-16" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 max-w-md text-center shadow-xl">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-300">
              <UserX className="w-8 h-8 text-slate-700" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Profile Not Found</h1>
            <p className="text-slate-500 text-xs mt-2 mb-6">
              The username <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">/{username}</code> does not exist or has not been registered yet.
            </p>
            <Link
              href="/signup"
              className="bg-[#9ef01a] hover:bg-[#38b000] text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl border border-slate-900 shadow-md inline-block"
            >
              Claim this link on CredFolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 max-w-md text-center shadow-xl">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-300">
              <ShieldCheck className="w-8 h-8 text-slate-700" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Private Profile</h1>
            <p className="text-slate-500 text-xs mt-2">
              This credential showcase page is currently private and visible only to its owner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <AmbientTheme imageUrl={profile.avatar_url} />
      <Navbar />

      <main className="flex-1">
        <PublicProfileClient profile={profile} certificates={certificates} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-600 text-sm">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#9ef01a] border border-slate-900"></div>
            <span className="font-bold text-slate-900">Verified by CredFolio</span>
          </div>
          <Link
            href="/signup"
            className="text-xs font-bold text-slate-900 hover:underline bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300"
          >
            Create your free credential page →
          </Link>
        </div>
      </footer>
    </div>
  );
}
