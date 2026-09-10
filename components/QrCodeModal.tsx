'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check } from 'lucide-react';

interface QrCodeModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function QrCodeModal({ url, isOpen, onClose, title = 'Scan or Share Profile' }: QrCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (url && isOpen) {
      QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#022b3a',
          light: '#ffffff',
        },
      })
        .then(setQrDataUrl)
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [url, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022B3A]/70 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
      <div className="bg-white border-2 border-[#022B3A] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-[#022B3A] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="text-lg font-black text-[#022B3A]">{title}</h3>
          <p className="text-[#1F7A8C] text-xs mt-1 truncate font-mono bg-[#E1E5F2]/50 p-1.5 rounded-lg border border-[#E1E5F2]">
            {url}
          </p>

          <div className="my-6 flex items-center justify-center bg-white p-4 rounded-2xl border-2 border-[#022B3A] shadow-md">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-52 h-52 rounded-xl" />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs font-mono">
                Generating QR...
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 bg-[#E1E5F2] hover:bg-[#BFDBF7]/60 text-[#022B3A] font-bold text-xs py-2.5 px-3 rounded-xl transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 inline mr-1" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 inline mr-1 text-[#1F7A8C]" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download="credfolio-qrcode.png"
                className="flex-1 bg-[#1F7A8C] hover:bg-[#175F6D] text-white font-extrabold text-xs py-2.5 px-3 rounded-xl border border-[#1F7A8C] flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-4 h-4 text-[#BFDBF7]" />
                <span>Save QR</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

