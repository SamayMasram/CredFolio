'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/context/AuthContext';
import { Certificate, UserProfile, ProfileVisibility } from '@/types';
import { AddCertificateModal } from '@/components/AddCertificateModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { ImageViewerModal } from '@/components/ImageViewerModal';
import { QrCodeModal } from '@/components/QrCodeModal';
import { AmbientTheme } from '@/components/AmbientTheme';
import { api } from '@/lib/api/client';
import { getInitials, formatDisplayName } from '@/lib/utils/format';
import {
  Award,
  Plus,
  Share2,
  QrCode,
  Globe,
  Lock,
  EyeOff,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Check,
  Copy,
  Sparkles,
  Eye,
  User,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, updateProfile, loading: authLoading } = useAuth();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [visibility, setVisibility] = useState<ProfileVisibility>('public');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string } | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayName = formatDisplayName(profile?.full_name, user?.email);
  const initials = getInitials(displayName);

  useEffect(() => {
    setAvatarError(false);
  }, [profile?.avatar_url]);

  const activeUsername = profile?.username || (user?.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : 'user');
  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${activeUsername}`
    : `https://credfolio.app/${activeUsername}`;

  // Fetch user certificates from backend API when profile loads
  useEffect(() => {
    if (profile?.visibility) {
      setVisibility(profile.visibility);
    }

    const activeUid = profile?.uid || user?.uid || (activeUsername ? `uid-${activeUsername}` : 'demo-user');
    
    // Load local storage cache if available
    try {
      const cached = localStorage.getItem(`credfolio_certs_${activeUsername}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCertificates(parsed);
        }
      }
    } catch {}

    if (activeUid) {
      setLoadingCerts(true);
      api.getCertificates(activeUid).then((fetched) => {
        if (fetched && Array.isArray(fetched)) {
          setCertificates(fetched);
          try {
            localStorage.setItem(`credfolio_certs_${activeUsername}`, JSON.stringify(fetched));
          } catch {}
        }
        setLoadingCerts(false);
      }).catch(() => setLoadingCerts(false));
    } else if (!authLoading) {
      setLoadingCerts(false);
    }
  }, [profile, user, authLoading, activeUsername]);

  if (authLoading || ((profile?.uid || user?.uid) && loadingCerts)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        {/* Animated Progress Line */}
        <div className="w-full h-1 bg-slate-200 overflow-hidden">
          <div className="h-full bg-[#9ef01a] w-1/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>

        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full animate-pulse">
          {/* Skeleton Header Card */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-5 bg-slate-200 rounded-lg w-40" />
                  <div className="h-4 bg-slate-200 rounded-lg w-56" />
                  <div className="h-3 bg-slate-100 rounded-md w-32 font-mono" />
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="h-9 bg-slate-200 rounded-xl w-32" />
                <div className="h-9 bg-slate-200 rounded-xl w-24" />
                <div className="h-9 bg-[#9ef01a]/40 rounded-xl w-32" />
              </div>
            </div>
          </div>

          {/* Skeleton Certificates Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-slate-200 rounded-lg w-56" />
            <div className="h-9 bg-[#9ef01a]/40 rounded-xl w-36" />
          </div>

          {/* Skeleton Items */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-8 bg-slate-200 rounded-md" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded-md w-24" />
                    <div className="h-5 bg-slate-200 rounded-lg w-64" />
                    <div className="h-3 bg-slate-100 rounded-md w-36" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl" />
                  <div className="w-8 h-8 bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const handleVisibilityChange = async (newVis: ProfileVisibility) => {
    setVisibility(newVis);
    if (profile?.uid) {
      try {
        await api.updateProfile(profile.uid, { visibility: newVis });
      } catch (err) {
        console.error('Failed to update visibility:', err);
      }
    }
  };

  const handleCopyLink = () => {
    if (!activeUsername) return;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCert = async (certData: Partial<Certificate>) => {
    // Always prefer real Firebase Auth UID for consistent profile_id
    const userUid = profile?.uid || user?.uid;
    if (!userUid) {
      alert('You must be logged in to save certificates.');
      return;
    }

    if (editingCert) {
      try {
        const updated = await api.updateCertificate(editingCert.id, certData);
        setCertificates((prev) => {
          const newList = prev.map((c) => (c.id === editingCert.id ? updated : c));
          try {
            localStorage.setItem(`credfolio_certs_${activeUsername}`, JSON.stringify(newList));
          } catch {}
          return newList;
        });
      } catch (err) {
        console.error('Failed to update certificate in database:', err);
        alert('Failed to update certificate in database.');
      }
    } else {
      try {
        const created = await api.createCertificate({
          profile_id: userUid,
          title: certData.title || 'Untitled Certificate',
          issuer: certData.issuer || 'Issuer',
          issue_date: certData.issue_date || new Date().toISOString().split('T')[0],
          expiry_date: certData.expiry_date || null,
          credential_url: certData.credential_url || null,
          file_url: certData.file_url || null,
          type: certData.type || 'certificate',
          category: certData.category || 'Other',
          is_featured: false,
          sort_order: certificates.length,
        });
        setCertificates((prev) => {
          const newList = [...prev, created];
          try {
            localStorage.setItem(`credfolio_certs_${activeUsername}`, JSON.stringify(newList));
          } catch {}
          return newList;
        });
      } catch (err) {
        console.error('Failed to create certificate in database:', err);
        alert('Failed to save certificate to database.');
      }
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (confirm('Are you sure you want to delete this credential?')) {
      try {
        await api.deleteCertificate(id);
      } catch (err) {
        console.warn('API delete failed, updating local state:', err);
      }
      setCertificates((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === certificates.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...certificates];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reorderedItems = updated.map((item, idx) => ({ id: item.id, sort_order: idx }));
    setCertificates(updated);

    try {
      await api.reorderCertificates(reorderedItems);
    } catch (err) {
      console.warn('API reorder failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FCD9] flex flex-col">
      <AmbientTheme imageUrl={profile?.avatar_url} />
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Top Control Header */}
        <div className="bg-white border-2 border-[#004b23] rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {profile?.avatar_url && !avatarError ? (
                <img
                  key={profile.avatar_url}
                  src={profile.avatar_url}
                  alt={displayName}
                  onError={() => setAvatarError(true)}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#004b23] shadow-md shrink-0 bg-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#004b23] text-[#F4FCD9] flex items-center justify-center font-black text-2xl shadow-md border border-[#004b23] shrink-0">
                  {initials}
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-black">
                    {displayName}
                  </h1>
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="p-1.5 text-black hover:text-white bg-[#F4FCD9] hover:bg-[#008000] border border-[#004b23]/30 rounded-lg transition-all text-xs font-extrabold flex items-center gap-1 shadow-xs ml-1"
                    title="Edit Profile & Photo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
                <p className="text-[#008000] text-sm font-semibold mt-0.5">
                  {profile?.headline || 'Credential Showcase'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-black bg-[#F4FCD9] px-2.5 py-1 rounded-lg border border-[#F4FCD9]">
                    {profileUrl}
                  </span>
                  <Link
                    href={`/${activeUsername}`}
                    target="_blank"
                    className="text-xs font-black text-white bg-[#008000] hover:bg-[#004b23] px-3.5 py-1 rounded-lg border border-[#008000] flex items-center gap-1 shadow-xs transition-all hover:scale-105"
                    title="View public profile page"
                  >
                    <span>View Public Showcase</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#F4FCD9]" />
                  </Link>
                </div>

                {profile?.bio && (
                  <p className="mt-2.5 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Share & Controls Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Visibility Selector */}
              <div className="bg-[#F4FCD9]/60 p-1 rounded-xl border border-[#F4FCD9] flex items-center gap-1 text-xs font-bold">
                <button
                  onClick={() => handleVisibilityChange('public')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    visibility === 'public'
                      ? 'bg-[#008000] text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public</span>
                </button>

                <button
                  onClick={() => handleVisibilityChange('unlisted')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    visibility === 'unlisted'
                      ? 'bg-[#008000] text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Unlisted</span>
                </button>

                <button
                  onClick={() => handleVisibilityChange('private')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    visibility === 'private'
                      ? 'bg-[#004b23] text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private</span>
                </button>
              </div>

              {/* QR Code Trigger */}
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="bg-white border-2 border-[#004b23] hover:bg-[#004b23] hover:text-white text-black font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </button>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="bg-[#008000] hover:bg-[#004b23] text-white font-extrabold text-xs px-4 py-2 rounded-xl border border-[#008000] flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#F4FCD9]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-[#F4FCD9]" />
                    <span>Copy My Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Certificates Management Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-black flex items-center gap-2">
              <Award className="w-5 h-5 text-[#008000]" />
              <span>Your Certificates & Badges</span>
            </h2>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">
              Reorder, edit, or feature your credentials shown on your public showcase.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingCert(null);
              setIsAddModalOpen(true);
            }}
            className="bg-[#008000] hover:bg-[#004b23] text-white font-black text-xs px-4 py-2.5 rounded-xl border border-[#008000] flex items-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#F4FCD9]" />
            <span>Add Credential</span>
          </button>
        </div>

        {/* Certificate List */}
        {certificates.length === 0 ? (
          <div className="bg-white border-2 border-[#F4FCD9] rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#F4FCD9]/40 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#008000]">
              <Award className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-lg font-bold text-black">No certificates added yet</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1 mb-6">
              Start building your shareable link by adding your AWS, Google, Coursera, or university certificates.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#008000] hover:bg-[#004b23] text-white font-black text-xs px-5 py-2.5 rounded-xl border border-[#008000] shadow-md"
            >
              Add Your First Certificate
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert, index) => (
              <div
                key={cert.id}
                className="bg-white border-2 border-[#F4FCD9] hover:border-[#004b23] rounded-2xl p-5 shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  {/* Reorder buttons */}
                  <div className="flex flex-col items-center gap-1 text-slate-400 pt-1">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="hover:text-black disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === certificates.length - 1}
                      className="hover:text-black disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#F4FCD9] text-black px-2.5 py-0.5 rounded-md border border-[#008000]/30">
                        {cert.category || 'Credential'}
                      </span>
                      {cert.type === 'badge' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F4FCD9] text-black px-2 py-0.5 rounded">
                          Badge
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-black text-base">{cert.title}</h3>
                    <p className="text-[#008000] text-xs font-semibold">{cert.issuer}</p>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono mt-2">
                      <span>Issued: {cert.issue_date}</span>
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#008000] font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Verification Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {cert.file_url && (
                    <button
                      onClick={() => setViewingImage({ url: cert.file_url!, title: cert.title })}
                      className="p-2 text-black bg-[#F4FCD9]/60 hover:bg-[#F4FCD9] border border-[#008000]/40 rounded-xl transition-all font-bold flex items-center gap-1.5 text-xs shadow-xs"
                      title="View Certificate Image"
                    >
                      <Eye className="w-4 h-4 text-black" />
                      <span className="hidden sm:inline font-black">View</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingCert(cert);
                      setIsAddModalOpen(true);
                    }}
                    className="p-2 text-black hover:bg-[#F4FCD9] bg-slate-50 rounded-xl transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCert(cert.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddCertificateModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCert(null);
        }}
        onSave={handleSaveCert}
        initialData={editingCert}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={async (updates) => {
          await updateProfile(updates);
          if (updates.visibility) {
            setVisibility(updates.visibility);
          }
        }}
      />

      <ImageViewerModal
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        imageUrl={viewingImage?.url || ''}
        title={viewingImage?.title || 'Certificate Preview'}
      />

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        url={profileUrl}
        title={`${profile?.full_name || 'Profile'}'s QR Code`}
      />
    </div>
  );
}

