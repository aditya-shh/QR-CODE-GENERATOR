import React from 'react';
import { Sparkles, QrCode, Briefcase, UserCheck } from 'lucide-react';
import { StudioMode } from '../types/qr';

interface NavigationProps {
  activeView: 'home' | 'studio' | 'vcard';
  studioMode: StudioMode;
  onNavigate: (view: 'home' | 'studio' | 'vcard', mode?: StudioMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeView,
  studioMode,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F5F2EB]/95 backdrop-blur-md border-b border-[rgba(224,218,206,0.85)] shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#30303B] via-[#24242D] to-[#141419] p-0.5 shadow-md border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-white transform transition-transform group-hover:scale-105 active:scale-95">
            <div className="relative flex items-center justify-center">
              <QrCode className="w-5 h-5 text-[#8B80E8]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F4BFA8]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-[#30303B]">
                Shape <span className="text-[#8B80E8]">QR</span>
              </span>
            </div>
            <span className="text-[10px] font-medium text-[#85818A] tracking-wider block -mt-1 hidden sm:block">
              Your Identity. Your Shape. Your QR.
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-[#EBE5DA] rounded-2xl border border-[rgba(216,209,196,0.8)] shadow-inner">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeView === 'home'
                ? 'bg-white text-[#30303B] shadow-xs'
                : 'text-[#85818A] hover:text-[#30303B]'
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => onNavigate('vcard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'vcard'
                ? 'bg-[#8B80E8] text-white shadow-xs'
                : 'text-[#85818A] hover:text-[#30303B]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Digital vCard</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('studio', 'professional')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'studio' && studioMode === 'professional'
                ? 'bg-black text-white shadow-xs'
                : 'text-[#85818A] hover:text-[#30303B]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Executive (B&W)</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('studio', 'fun')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'studio' && studioMode === 'fun'
                ? 'bg-[#30303B] text-white shadow-xs'
                : 'text-[#85818A] hover:text-[#30303B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F4BFA8]" />
            <span>Fun Shapes</span>
          </button>
        </nav>

        {/* Zone 3: Direct Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('vcard')}
            className="hidden sm:flex tactile-btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#8B80E8]" />
            <span>Create Digital vCard</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('studio', 'fun')}
            className="tactile-btn-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Creating</span>
          </button>
        </div>
      </div>
    </header>
  );
};
