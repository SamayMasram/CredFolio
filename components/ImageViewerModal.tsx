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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#134611]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#134611] rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8FCCF]">
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
              <span className="bg-[#E8FCCF] text-[#134611] text-xs font-black px-2.5 py-1 rounded-lg border border-[#3E8914]/30 flex items-center gap-1 shrink-0">
                Image
              </span>
            )}
            <h3 className="text-lg font-black text-[#134611] truncate">{title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#134611] rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Area */}
        <div className="flex-1 min-h-[50vh] bg-[#E8FCCF]/40 border border-[#E8FCCF] rounded-2xl overflow-hidden flex items-center justify-center p-2 relative">
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
        <div className="pt-4 mt-4 border-t border-[#E8FCCF] flex flex-wrap items-center justify-between gap-3">
          <a
            href={media.originalUrl || imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#134611] hover:bg-[#E8FCCF] bg-[#E8FCCF]/50 px-4 py-2.5 rounded-xl border border-[#E8FCCF] flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#3E8914]" />
            <span>Open Original Document</span>
          </a>

          <button
            onClick={onClose}
            className="bg-[#134611] hover:bg-[#063A4E] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

