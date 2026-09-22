'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Award, Upload, Link as LinkIcon, Eye, FileText, HardDrive, Sparkles, HelpCircle, Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Certificate, CertificateType } from '@/types';
import { ImageViewerModal } from '@/components/ImageViewerModal';
import { getMediaInfo } from '@/lib/utils/media';

interface AddCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (certData: Partial<Certificate>) => Promise<void>;
  initialData?: Certificate | null;
}

export function AddCertificateModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddCertificateModalProps) {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [type, setType] = useState<CertificateType>('certificate');
  const [category, setCategory] = useState('Cloud');
  const [fileUrl, setFileUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setIssuer(initialData.issuer || '');
      setIssueDate(initialData.issue_date || '');
      setExpiryDate(initialData.expiry_date || '');
      setCredentialUrl(initialData.credential_url || '');
      setType(initialData.type || 'certificate');
      setCategory(initialData.category || 'Cloud');
      setFileUrl(initialData.file_url || '');
      setUploadedFileName(null);
      setUploadError(null);
    } else {
      setTitle('');
      setIssuer('');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setExpiryDate('');
      setCredentialUrl('');
      setType('certificate');
      setCategory('Cloud');
      setFileUrl('');
      setUploadedFileName(null);
      setUploadError(null);
    }
  }, [initialData, isOpen]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showDriveGuide, setShowDriveGuide] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload file to MongoDB');
      }

      setFileUrl(data.url);
      setUploadedFileName(file.name);
    } catch (err: any) {
      console.error('MongoDB file upload error:', err);
      setUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen) return null;

  const media = getMediaInfo(fileUrl);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !issuer || !issueDate) return;

    setSaving(true);
    try {
      await onSave({
        title,
        issuer,
        issue_date: issueDate,
        expiry_date: expiryDate || null,
        credential_url: credentialUrl || null,
        type,
        category,
        file_url: fileUrl || null,
        is_featured: initialData ? initialData.is_featured : false,
        sort_order: initialData ? initialData.sort_order : 0,
      });
      onClose();
    } catch (err) {
      console.error('Error saving certificate:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white border-2 border-[#1B4332] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-[#1B4332] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-6">
            <div className="bg-[#1B4332] text-[#D8F3DC] p-2.5 rounded-xl border border-[#1B4332] font-bold">
              <Award className="w-5 h-5 text-[#D8F3DC]" />
            </div>
            <h3 className="text-xl font-black text-[#1B4332]">
              {initialData ? 'Edit Credential' : 'Add New Credential'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Certificate / Badge Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Certified Solutions Architect"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Issuing Organization *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Amazon Web Services, Coursera, Google"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CertificateType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 outline-none text-sm text-slate-900 font-semibold bg-white"
                >
                  <option value="certificate">Certificate</option>
                  <option value="badge">Digital Badge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category / Tag
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 outline-none text-sm text-slate-900 font-semibold bg-white"
                >
                  <option value="Cloud">Cloud</option>
                  <option value="Data">Data & AI</option>
                  <option value="Frontend">Frontend & Web</option>
                  <option value="Backend">Backend & DevOps</option>
                  <option value="Design">Design & UX</option>
                  <option value="Management">Management</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 outline-none text-sm text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 outline-none text-sm text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Verification / Credential URL <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  placeholder="https://credly.com/badges/... or issuer link (optional)"
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 outline-none text-sm text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Certificate File (PDF / Image) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDriveGuide(!showDriveGuide)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <HardDrive className="w-3 h-3 text-blue-600" />
                    <span>Drive Link</span>
                  </button>
                  {fileUrl && (
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="text-[11px] font-black text-slate-950 bg-[#74C69D] hover:bg-[#52B788] px-2.5 py-0.5 rounded border border-slate-900 flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{media.isPdf ? 'View PDF' : 'View Image'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Hidden HTML File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* MongoDB Direct File Upload Card */}
              <div className="mb-2 p-3 bg-emerald-50/70 border border-emerald-300/80 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                    <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Store directly in MongoDB</span>
                  </div>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading to DB...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose File (PDF/Image)</span>
                      </>
                    )}
                  </button>
                </div>

                {uploadError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {fileUrl && fileUrl.startsWith('/api/media/') && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>File stored safely in MongoDB ({uploadedFileName || 'Binary Media'})</span>
                  </div>
                )}
              </div>

              {/* Alternative: Direct URL input */}
              <div className="relative">
                {media.isDrive ? (
                  <HardDrive className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5" />
                ) : media.isPdf ? (
                  <FileText className="w-4 h-4 text-red-600 absolute left-3.5 top-3.5" />
                ) : (
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                )}
                <input
                  type="url"
                  placeholder="Or paste Direct Image/PDF URL or Google Drive link"
                  value={fileUrl}
                  onChange={(e) => {
                    setFileUrl(e.target.value);
                    setUploadedFileName(null);
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 outline-none text-sm text-slate-900 font-medium"
                />
              </div>

              {/* Google Drive Import Guide Callout */}
              {showDriveGuide && (
                <div className="mt-2.5 p-3 bg-blue-50/90 border border-blue-300 rounded-xl text-xs text-blue-900 font-medium leading-relaxed space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>How to import from Google Drive:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-blue-900 pl-1">
                    <li>In Google Drive, right click your certificate file & select <strong>Share &gt; Copy link</strong>.</li>
                    <li>Ensure link access is set to <strong>"Anyone with the link can view"</strong>.</li>
                    <li>Paste the copied link above — CredFolio will automatically generate an interactive PDF preview!</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Document / Media Preview Card */}
            {fileUrl && (
              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {media.isDrive ? (
                    <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center font-bold shrink-0">
                      <HardDrive className="w-5 h-5 text-blue-600" />
                    </div>
                  ) : media.isPdf ? (
                    <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-300 text-red-700 flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                  ) : (
                    <img
                      src={fileUrl}
                      alt="Thumbnail"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-300 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-slate-300 bg-white">
                        {media.isDrive ? 'Google Drive PDF' : media.isPdf ? 'PDF Document' : 'Image File'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono truncate mt-0.5">
                      {fileUrl}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-[#74C69D] hover:bg-[#52B788] border border-slate-900 rounded-lg transition-colors shrink-0 shadow-xs flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-950" />
                  <span>View</span>
                </button>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#D8F3DC] hover:bg-[#D8F3DC]/60 text-[#1B4332] font-bold text-sm py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#40916C] hover:bg-[#1B4332] text-white font-black text-sm py-3 rounded-xl border border-[#40916C] shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Saving...' : initialData ? 'Save Changes' : 'Add Credential'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ImageViewerModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={fileUrl}
        title={title || 'Certificate Preview'}
      />
    </>
  );
}
