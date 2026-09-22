'use client';

import React from 'react';
import { X, ExternalLink, FileText, FileCode, HardDrive } from 'lucide-react';
import { getMediaInfo } from '@/lib/utils/media';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  title,
}: ImageViewerModalProps) {
  if (!isOpen || !imageUrl) return null;

  const media = getMediaInfo(imageUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#1B4332] rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D8F3DC]">
          <div className="flex items-center gap-3 truncate pr-4">
            {media.isDrive ? (
              <span className="bg-blue-100 text-blue-800 text-xs font-black px-2.5 py-1 rounded-lg border border-blue-300 flex items-center gap-1 shrink-0">
                <HardDrive className="w-3.5 h-3.5" /> Google Drive
              </span>
            ) : media.isPdf ? (
              <span className="bg-red-100 text-red-800 text-xs font-black px-2.5 py-1 rounded-lg border border-red-300 flex items-center gap-1 shrink-0">
                <FileText className="w-3.5 h-3.5" /> PDF Document
              </span>
            ) : (
              <span className="bg-[#D8F3DC] text-[#1B4332] text-xs font-black px-2.5 py-1 rounded-lg border border-[#40916C]/30 flex items-center gap-1 shrink-0">
                Image
              </span>
            )}
            <h3 className="text-lg font-black text-[#1B4332] truncate">{title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#1B4332] rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Area */}
        <div className="flex-1 min-h-[50vh] bg-[#D8F3DC]/40 border border-[#D8F3DC] rounded-2xl overflow-hidden flex items-center justify-center p-2 relative">
          {media.isPdf || media.isDrive ? (
            <iframe
              src={media.embedUrl}
              title={title}
              className="w-full h-full min-h-[55vh] rounded-xl border-0 bg-white"
              allow="autoplay"
            />
          ) : (
            <img
              src={media.embedUrl}
              alt={title}
              className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
              }}
            />
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 mt-4 border-t border-[#D8F3DC] flex flex-wrap items-center justify-between gap-3">
          <a
            href={media.originalUrl || imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#1B4332] hover:bg-[#D8F3DC] bg-[#D8F3DC]/50 px-4 py-2.5 rounded-xl border border-[#D8F3DC] flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#40916C]" />
            <span>Open Original Document</span>
          </a>

          <button
            onClick={onClose}
            className="bg-[#1B4332] hover:bg-[#063A4E] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

