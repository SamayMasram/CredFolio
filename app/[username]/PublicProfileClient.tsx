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
      <div className="bg-white border-2 border-[#134611] rounded-3xl p-6 sm:p-8 shadow-xl mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#E8FCCF]">
          <div className="flex items-center gap-5">
            {profile.avatar_url && !avatarError ? (
              <img
                key={profile.avatar_url}
                src={profile.avatar_url}
                alt={profile.full_name}
                onError={() => setAvatarError(true)}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#134611] shadow-md shrink-0 bg-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#134611] text-[#E8FCCF] flex items-center justify-center font-black text-3xl shadow-md border border-[#134611] shrink-0">
                {getInitials(profile.full_name)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#134611]">{profile.full_name}</h1>
                <CheckCircle2 className="w-6 h-6 text-[#3E8914] fill-[#E8FCCF]" />
              </div>
              <p className="text-[#3E8914] font-bold text-sm sm:text-base mt-0.5">{profile.headline}</p>
              <p className="text-slate-500 text-xs font-mono mt-1">credfolio.app/{profile.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex-1 sm:flex-initial bg-white border-2 border-[#134611] hover:bg-[#134611] hover:text-white text-[#134611] text-xs px-3.5 py-2 rounded-xl flex items-center justify-center gap-2 font-mono font-bold transition-colors shadow-xs"
            >
              <QrCode className="w-4 h-4 text-[#134611] group-hover:text-white" />
              <span>QR Code</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial bg-[#3E8914] hover:bg-[#134611] text-white font-black text-xs px-4 py-2 rounded-xl border border-[#3E8914] flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#E8FCCF]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#E8FCCF]" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 text-[#134611] text-sm leading-relaxed max-w-3xl font-medium">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Categories & Filter Bar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#3E8914]" />
          <h2 className="text-xl font-black text-[#134611]">Verified Credentials</h2>
          <span className="text-xs bg-[#E8FCCF] text-[#134611] px-2.5 py-0.5 rounded-full border border-[#3E8914]/30 font-extrabold ml-2">
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
                  ? 'bg-[#3E8914] text-white border-[#3E8914] shadow-xs'
                  : 'bg-white text-[#134611] hover:bg-[#E8FCCF] border-[#E8FCCF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Certificate Cards Grid */}
      {filteredCerts.length === 0 ? (
        <div className="bg-white border-2 border-[#E8FCCF] rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#E8FCCF]/40 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#3E8914]">
            <Award className="w-8 h-8 text-[#134611]" />
          </div>
          <h3 className="text-lg font-bold text-[#134611]">No verified credentials to display</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1">
            This showcase does not have any certificates listed in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => (
            <div
              key={cert.id}
              className="bg-white border-2 border-[#E8FCCF] hover:border-[#134611] rounded-2xl p-6 transition-all shadow-sm group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#E8FCCF] text-[#134611] px-2.5 py-0.5 rounded-md border border-[#3E8914]/30">
                    {cert.category || 'Credential'}
                  </span>
                  <div className="flex items-center gap-2">
                    {cert.file_url && (
                      <button
                        onClick={() => setViewingImage({ url: cert.file_url!, title: cert.title })}
                        className="p-1.5 text-[#134611] bg-[#E8FCCF]/50 hover:bg-[#E8FCCF] rounded-lg border border-[#3E8914]/30 transition-colors"
                        title="View Certificate Image"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#134611]" />
                      </button>
                    )}
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-[#3E8914] transition-colors p-1"
                        title="Verify Credential"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-[#134611] text-lg leading-snug group-hover:text-[#3E8914] transition-colors">
                  {cert.title}
                </h3>
                <p className="text-[#3E8914] text-xs font-semibold mt-1">{cert.issuer}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8FCCF] flex justify-between items-center text-xs font-mono text-slate-600">
                <span>Issued: {cert.issue_date}</span>
                <span className="text-[#134611] font-bold flex items-center gap-1 bg-[#E8FCCF]/60 px-2 py-0.5 rounded border border-[#3E8914]/30">
                  <Check className="w-3.5 h-3.5 text-[#3E8914]" /> Verified
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
