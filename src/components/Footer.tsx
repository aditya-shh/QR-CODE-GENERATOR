import React from 'react';
import DeveloperSignature from './DeveloperSignature';
import { QrCode } from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: 'home' | 'studio' | 'vcard') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-[rgba(224,218,206,0.85)] bg-[#F0EBE1]/60 py-12 text-[#85818A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[rgba(224,218,206,0.7)]">
          {/* Brand & Mission */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#30303B] via-[#24242D] to-[#141419] p-0.5 shadow-sm border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-white">
              <QrCode className="w-5 h-5 text-[#8B80E8]" />
            </div>
            <div>
              <span className="text-base font-extrabold text-[#30303B]">Shape QR</span>
              <p className="text-xs text-[#85818A]">
                Your Identity. Your Shape. Your QR. Professional digital business cards & sculpted designs.
              </p>
            </div>
          </div>

          {/* Quick Footer Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#30303B]">
            {onNavigate && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#8B80E8] transition-colors cursor-pointer"
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('vcard')}
                  className="hover:text-[#8B80E8] transition-colors cursor-pointer"
                >
                  Digital vCard
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('studio')}
                  className="hover:text-[#8B80E8] transition-colors cursor-pointer"
                >
                  Shape Studio
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Bar with Developer Signature */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Shape QR. All rights reserved.</p>

          {/* Developer Signature Component */}
          <div className="flex items-center gap-2">
            <DeveloperSignature />
          </div>
        </div>
      </div>
    </footer>
  );
};
