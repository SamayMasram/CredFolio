'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  User,
  Sparkles,
  AlertCircle,
  Database,
  Loader2,
  Check,
  Save,
  Globe,
  EyeOff,
  Lock,
  AtSign,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, ProfileVisibility } from '@/types';
import { useAuth } from '@/lib/context/AuthContext';
import { api } from '@/lib/api/client';
import { getInitials } from '@/lib/utils/format';

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
  const [username, setUsername] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [visibility, setVisibility] = useState<ProfileVisibility>('public');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Username availability state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'valid' | 'taken' | 'invalid' | 'unchanged' | null>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (effectiveProfile) {
      setFullName(effectiveProfile.full_name || '');
      setUsername(effectiveProfile.username || '');
      setHeadline(effectiveProfile.headline || '');
      setBio(effectiveProfile.bio || '');
      setAvatarUrl(effectiveProfile.avatar_url || '');
      setVisibility(effectiveProfile.visibility || 'public');
      setSuccessMsg('');
      setError('');
      setUsernameStatus('unchanged');
    }
  }, [effectiveProfile, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Username validation and debounced check
  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(clean);
    setError('');

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (!clean || clean.length < 3) {
      setUsernameStatus('invalid');
      return;
    }

    if (effectiveProfile && clean === effectiveProfile.username?.toLowerCase()) {
      setUsernameStatus('unchanged');
      return;
    }

    setIsCheckingUsername(true);
    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const available = await api.checkUsernameAvailability(clean, effectiveProfile?.uid);
        setUsernameStatus(available ? 'valid' : 'taken');
      } catch {
        setUsernameStatus('valid');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();

    if (!trimmedName) {
      setError('Full Name is required');
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('Username is already taken by another user');
      return;
    }

    setSaving(true);
    try {
      const updates: Partial<UserProfile> = {
        full_name: trimmedName,
        username: cleanUsername,
        headline: headline.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        visibility: visibility,
      };

      if (onSave) {
        await onSave(updates);
      } else {
        await updateProfile(updates);
      }

      setSuccessMsg('Profile changes saved successfully to database!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const previewInitials = getInitials(fullName || 'User Profile');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022B3A]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#022B3A] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-[#022B3A] hover:bg-slate-100 rounded-full transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="bg-[#022B3A] text-[#BFDBF7] p-2.5 rounded-xl border border-[#022B3A] font-bold shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#022B3A]">Edit Profile & Showcase</h3>
            <p className="text-slate-500 text-xs font-semibold">Changes are saved permanently in MongoDB.</p>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-xl border border-red-200 flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-50 text-emerald-800 text-xs font-bold p-3.5 rounded-xl border border-emerald-300 flex items-center gap-2.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Live Profile Card Preview */}
        <div className="mb-5 bg-gradient-to-br from-[#022B3A] to-[#1F7A8C] p-4 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#BFDBF7]">Live Showcase Preview</span>
            <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              {visibility === 'public' && <Globe className="w-3 h-3" />}
              {visibility === 'unlisted' && <EyeOff className="w-3 h-3" />}
              {visibility === 'private' && <Lock className="w-3 h-3" />}
              <span className="capitalize">{visibility}</span>
            </span>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#022B3A] border-2 border-white/40 overflow-hidden flex items-center justify-center font-black text-xl text-[#BFDBF7] shrink-0 shadow-inner">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{previewInitials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-black truncate leading-snug">
                {fullName.trim() || 'Your Name'}
              </h4>
              <p className="text-xs text-[#BFDBF7] truncate font-medium">
                {headline.trim() || 'Your Professional Headline'}
              </p>
              <p className="text-[11px] font-mono text-slate-300 truncate mt-0.5">
                credfolio.app/{username || 'username'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />

          {/* Profile Photo & Preset Avatars */}
          <div className="bg-[#E1E5F2]/30 p-4 rounded-2xl border border-[#E1E5F2]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-[#022B3A] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1F7A8C]" />
                <span>Profile Picture</span>
              </label>
              <div className="flex items-center gap-2">
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                    title="Remove picture and use initials"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Use Initials</span>
                  </button>
                )}
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-[#022B3A] bg-[#BFDBF7] hover:bg-[#A4CEF4] px-3 py-1.5 rounded-xl border border-[#1F7A8C]/30 flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-[#1F7A8C]" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3 h-3 text-[#1F7A8C]" />
                      <span>Upload Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preset Avatars Grid */}
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

          {/* Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E5F2] focus:border-[#022B3A] outline-none text-sm text-[#022B3A] font-semibold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#022B3A] uppercase tracking-wider flex items-center gap-1">
                  <AtSign className="w-3 h-3 text-[#1F7A8C]" />
                  <span>Username *</span>
                </label>
                {isCheckingUsername ? (
                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>Checking...</span>
                  </span>
                ) : usernameStatus === 'valid' ? (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" />
                    <span>Available</span>
                  </span>
                ) : usernameStatus === 'taken' ? (
                  <span className="text-[10px] text-red-600 font-bold">Taken</span>
                ) : null}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm font-mono font-bold transition-colors ${
                    usernameStatus === 'taken'
                      ? 'border-red-400 bg-red-50/50 text-red-800'
                      : usernameStatus === 'valid'
                      ? 'border-emerald-400 bg-emerald-50/30 text-[#022B3A]'
                      : 'border-[#E1E5F2] focus:border-[#022B3A] text-[#022B3A]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Headline */}
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

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#022B3A] uppercase tracking-wider">
                Short Bio
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {bio.length}/350
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={350}
              placeholder="Brief overview of your experience, skills, and certifications..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E5F2] focus:border-[#022B3A] outline-none text-sm text-[#022B3A] font-medium resize-none"
            />
          </div>

          {/* Visibility Selector */}
          <div>
            <label className="block text-xs font-bold text-[#022B3A] uppercase tracking-wider mb-2">
              Profile Visibility
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-2.5 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
                  visibility === 'public'
                    ? 'border-[#1F7A8C] bg-[#1F7A8C]/10 text-[#022B3A]'
                    : 'border-[#E1E5F2] hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs">
                  <Globe className="w-3.5 h-3.5 text-[#1F7A8C]" />
                  <span>Public</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">Searchable & visible to all</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('unlisted')}
                className={`p-2.5 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
                  visibility === 'unlisted'
                    ? 'border-[#1F7A8C] bg-[#1F7A8C]/10 text-[#022B3A]'
                    : 'border-[#E1E5F2] hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs">
                  <EyeOff className="w-3.5 h-3.5 text-[#1F7A8C]" />
                  <span>Unlisted</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">Only direct link access</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-2.5 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
                  visibility === 'private'
                    ? 'border-[#022B3A] bg-[#022B3A]/10 text-[#022B3A]'
                    : 'border-[#E1E5F2] hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs">
                  <Lock className="w-3.5 h-3.5 text-[#022B3A]" />
                  <span>Private</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">Hidden from showcase</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#E1E5F2] hover:bg-[#BFDBF7]/60 text-[#022B3A] font-bold text-sm py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || isCheckingUsername || usernameStatus === 'taken'}
              className="flex-1 bg-[#1F7A8C] hover:bg-[#175F6D] text-white font-black text-sm py-3 rounded-xl border border-[#1F7A8C] shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#BFDBF7]" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#BFDBF7]" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
