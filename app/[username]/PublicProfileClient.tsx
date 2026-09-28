'use client';

import React, { useState } from 'react';
import { Certificate, UserProfile } from '@/types';
import { QrCodeModal } from '@/components/QrCodeModal';
import { ImageViewerModal } from '@/components/ImageViewerModal';
import { getInitials } from '@/lib/utils/format';
import {
  Award,
  CheckCircle2,
  Share2,
  QrCode,
  ExternalLink,
  Check,
  Filter,
  Eye,
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  certificates: Certificate[];
}

export function PublicProfileClient({ profile, certificates }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string } | null>(null);
  const [avatarError, setAvatarError] = useState<boolean>(false);

  React.useEffect(() => {
    setAvatarError(false);
  }, [profile.avatar_url]);

  const categories = ['All', ...Array.from(new Set(certificates.map((c) => c.category || 'Other')))];

  const filteredCerts =
    selectedCategory === 'All'
      ? certificates
      : certificates.filter((c) => (c.category || 'Other') === selectedCategory);

  const profileUrl = typeof window !== 'undefined' ? window.location.href : `https://credfolio.app/${profile.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Profile Header Card */}
      <div className="bg-white border-2 border-[#1B4332] rounded-3xl p-6 sm:p-8 shadow-xl mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#D8F3DC]">
          <div className="flex items-center gap-5">
            {profile.avatar_url && !avatarError ? (
              <img
                key={profile.avatar_url}
                src={profile.avatar_url}
                alt={profile.full_name}
                onError={() => setAvatarError(true)}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#1B4332] shadow-md shrink-0 bg-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#1B4332] text-[#D8F3DC] flex items-center justify-center font-black text-3xl shadow-md border border-[#1B4332] shrink-0">
                {getInitials(profile.full_name)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#1B4332]">{profile.full_name}</h1>
                <CheckCircle2 className="w-6 h-6 text-[#40916C] fill-[#D8F3DC]" />
              </div>
              <p className="text-[#40916C] font-bold text-sm sm:text-base mt-0.5">{profile.headline}</p>
              <p className="text-slate-500 text-xs font-mono mt-1">credfolio.app/{profile.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex-1 sm:flex-initial bg-white border-2 border-[#1B4332] hover:bg-[#1B4332] hover:text-white text-[#1B4332] text-xs px-3.5 py-2 rounded-xl flex items-center justify-center gap-2 font-mono font-bold transition-colors shadow-xs"
            >
              <QrCode className="w-4 h-4 text-[#1B4332] group-hover:text-white" />
              <span>QR Code</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial bg-[#40916C] hover:bg-[#1B4332] text-white font-black text-xs px-4 py-2 rounded-xl border border-[#40916C] flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#D8F3DC]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#D8F3DC]" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 text-[#1B4332] text-sm leading-relaxed max-w-3xl font-medium">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Categories & Filter Bar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#40916C]" />
          <h2 className="text-xl font-black text-[#1B4332]">Verified Credentials</h2>
          <span className="text-xs bg-[#D8F3DC] text-[#1B4332] px-2.5 py-0.5 rounded-full border border-[#40916C]/30 font-extrabold ml-2">
            {certificates.length} Total
          </span>
        </div>

        {/* Category Pills */}
        <div className="hidden sm:flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all border ${
                selectedCategory === cat
                  ? 'bg-[#40916C] text-white border-[#40916C] shadow-xs'
                  : 'bg-white text-[#1B4332] hover:bg-[#D8F3DC] border-[#D8F3DC]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Certificate Cards Grid */}
      {filteredCerts.length === 0 ? (
        <div className="bg-white border-2 border-[#D8F3DC] rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#D8F3DC]/40 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#40916C]">
            <Award className="w-8 h-8 text-[#1B4332]" />
          </div>
          <h3 className="text-lg font-bold text-[#1B4332]">No verified credentials to display</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1">
            This showcase does not have any certificates listed in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => (
            <div
              key={cert.id}
              className="bg-white border-2 border-[#D8F3DC] hover:border-[#1B4332] rounded-2xl p-6 transition-all shadow-sm group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#D8F3DC] text-[#1B4332] px-2.5 py-0.5 rounded-md border border-[#40916C]/30">
                    {cert.category || 'Credential'}
                  </span>
                  <div className="flex items-center gap-2">
                    {cert.file_url && (
                      <button
                        onClick={() => setViewingImage({ url: cert.file_url!, title: cert.title })}
                        className="p-1.5 text-[#1B4332] bg-[#D8F3DC]/50 hover:bg-[#D8F3DC] rounded-lg border border-[#40916C]/30 transition-colors"
                        title="View Certificate Image"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#1B4332]" />
                      </button>
                    )}
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-[#40916C] transition-colors p-1"
                        title="Verify Credential"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-[#1B4332] text-lg leading-snug group-hover:text-[#40916C] transition-colors">
                  {cert.title}
                </h3>
                <p className="text-[#40916C] text-xs font-semibold mt-1">{cert.issuer}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#D8F3DC] flex justify-between items-center text-xs font-mono text-slate-600">
                <span>Issued: {cert.issue_date}</span>
                <span className="text-[#1B4332] font-bold flex items-center gap-1 bg-[#D8F3DC]/60 px-2 py-0.5 rounded border border-[#40916C]/30">
                  <Check className="w-3.5 h-3.5 text-[#40916C]" /> Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ImageViewerModal */}
      <ImageViewerModal
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        imageUrl={viewingImage?.url || ''}
        title={viewingImage?.title || 'Certificate Image'}
      />

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        url={profileUrl}
        title={`${profile.full_name}'s Profile QR Code`}
      />
    </div>
  );
}
