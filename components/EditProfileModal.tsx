'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, User, Camera, Sparkles, AlertCircle, Upload, Database, Loader2, Check, Save } from 'lucide-react';
import { UserProfile } from '@/types';
import { useAuth } from '@/lib/context/AuthContext';
import { api } from '@/lib/api/client';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updates: Partial<UserProfile>) => Promise<void>;
  currentProfile?: UserProfile | null;
}

const PRESET_AVATARS = [
  { id: 'dp1', path: '/dp/dp1.png', label: 'Avatar 1' },
  { id: 'dp2', path: '/dp/dp2.png', label: 'Avatar 2' },
  { id: 'dp3', path: '/dp/dp3.png', label: 'Avatar 3' },
  { id: 'dp4', path: '/dp/dp4.png', label: 'Avatar 4' },
  { id: 'dp5', path: '/dp/dp5.png', label: 'Avatar 5' },
  { id: 'dp6', path: '/dp/dp6.png', label: 'Avatar 6' },
  { id: 'dp7', path: '/dp/dp7.png', label: 'Avatar 7' },
  { id: 'dp8', path: '/dp/dp8.png', label: 'Avatar 8' },
  { id: 'dp9', path: '/dp/dp9.png', label: 'Avatar 9' },
];

export function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  currentProfile,
}: EditProfileModalProps) {
  const { profile: authProfile, updateProfile } = useAuth();
  const effectiveProfile = currentProfile !== undefined ? currentProfile : authProfile;

  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (effectiveProfile) {
      setFullName(effectiveProfile.full_name || '');
      setHeadline(effectiveProfile.headline || '');
      setBio(effectiveProfile.bio || '');
      setAvatarUrl(effectiveProfile.avatar_url || '');
      setSuccessMsg('');
      setError('');
    }
  }, [effectiveProfile, isOpen]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload avatar to database');
      }

      setAvatarUrl(data.url);
      setSuccessMsg('Avatar uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setError(err.message || 'Avatar upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setError('Full Name is required');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        full_name: fullName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim() || '',
      };

      if (onSave) {
        await onSave(updates);
      } else {
        await updateProfile(updates);
      }
      
      setSuccessMsg('Profile saved successfully!');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022B3A]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#022B3A] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-[#022B3A] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-6">
          <div className="bg-[#022B3A] text-[#BFDBF7] p-2.5 rounded-xl border border-[#022B3A] font-bold shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#022B3A]">Edit & Save Profile</h3>
            <p className="text-slate-500 text-xs font-semibold">Update your avatar, full name, headline, and bio.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-xl border border-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />

          {/* Current Profile Photo Preview */}
          <div className="flex items-center gap-4 bg-[#E1E5F2]/40 p-4 rounded-2xl border border-[#E1E5F2]">
            <div className="w-16 h-16 rounded-2xl bg-[#022B3A] border-2 border-[#022B3A] overflow-hidden flex items-center justify-center font-black text-xl text-[#BFDBF7] shrink-0 shadow-md relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                  onError={() => setError('Avatar image could not be loaded')}
                />
              ) : (
                <span>{fullName.substring(0, 2).toUpperCase() || 'UP'}</span>
              )}
            </div>

            <div className="flex-1 flex items-center justify-end">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[#022B3A] bg-[#BFDBF7] hover:bg-[#A4CEF4] px-3.5 py-2 rounded-xl border border-[#1F7A8C]/30 flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1F7A8C]" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-[#1F7A8C]" />
                    <span>Upload Custom Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Avatars Selection from components/dp */}
          <div className="bg-[#E1E5F2]/30 p-4 rounded-2xl border border-[#E1E5F2]">
            <label className="block text-xs font-bold text-[#022B3A] uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1F7A8C]" />
                <span>Choose Profile Picture (Preset DPs)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Click to select</span>
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
              {PRESET_AVATARS.map((avatar) => {
                const isSelected = avatarUrl === avatar.path;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(avatar.path);
                      setError('');
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square group ${
                      isSelected
                        ? 'border-[#022B3A] ring-2 ring-[#1F7A8C] scale-105 shadow-md z-10'
                        : 'border-[#E1E5F2] hover:border-[#1F7A8C] hover:scale-105 bg-white'
                    }`}
                    title={avatar.label}
                  >
                    <img
                      src={avatar.path}
                      alt={avatar.label}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#022B3A]/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-[#BFDBF7] stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#022B3A] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E5F2] focus:border-[#022B3A] outline-none text-sm text-[#022B3A] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#022B3A] uppercase tracking-wider mb-1">
              Headline / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Cloud Architect | AWS & GCP Certified"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E5F2] focus:border-[#022B3A] outline-none text-sm text-[#022B3A] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#022B3A] uppercase tracking-wider mb-1">
              Short Bio
            </label>
            <textarea
              rows={3}
              placeholder="Brief overview of your experience, skills, and certifications..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E5F2] focus:border-[#022B3A] outline-none text-sm text-[#022B3A] font-medium resize-none"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#E1E5F2] hover:bg-[#BFDBF7]/60 text-[#022B3A] font-bold text-sm py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#1F7A8C] hover:bg-[#175F6D] text-white font-black text-sm py-3 rounded-xl border border-[#1F7A8C] shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#BFDBF7]" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#BFDBF7]" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

