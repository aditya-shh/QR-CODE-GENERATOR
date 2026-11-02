import React, { useState } from 'react';
import { FunQRCodeRenderer } from './FunQRCodeRenderer';
import { QRConfig, QRTemplateId, StudioMode, PROFESSIONAL_PRESETS, FUN_SHAPE_PRESETS } from '../types/qr';
import { Sparkles, ArrowRight, Briefcase, Link as LinkIcon, UserCheck } from 'lucide-react';

interface HeroSectionProps {
  onOpenStudio: (mode: StudioMode, templateId?: QRTemplateId) => void;
  onOpenVCard?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenStudio, onOpenVCard }) => {
  const [activeTab, setActiveTab] = useState<StudioMode>('fun');
  const [demoUrl, setDemoUrl] = useState('https://shapeqr.studio');
  const [demoTemplate, setDemoTemplate] = useState<QRTemplateId>('heart');

  const currentPreset =
    (activeTab === 'professional' ? PROFESSIONAL_PRESETS : FUN_SHAPE_PRESETS).find(
      (p) => p.id === demoTemplate
    ) || (activeTab === 'professional' ? PROFESSIONAL_PRESETS[0] : FUN_SHAPE_PRESETS[0]);

  const liveConfig: QRConfig = {
    text: demoUrl || 'https://shapeqr.studio',
    templateId: demoTemplate,
    studioMode: activeTab,
    moduleStyle: currentPreset.defaultConfig.moduleStyle || (activeTab === 'professional' ? 'squircle' : 'rounded'),
    eyeStyle: currentPreset.defaultConfig.eyeStyle || 'theme-native',
    primaryColor: activeTab === 'professional' ? '#000000' : currentPreset.defaultConfig.primaryColor || '#E31B23',
    bgColor: activeTab === 'professional' ? '#FFFFFF' : currentPreset.defaultConfig.bgColor || '#FFFFFF',
    accentColor: activeTab === 'professional' ? '#1A1A1A' : currentPreset.defaultConfig.accentColor || '#FF6B7A',
    depth: 'natural',
    cornerSmoothing: currentPreset.defaultConfig.cornerSmoothing || 24,
    quietZone: currentPreset.defaultConfig.quietZone || 18,
    centerBadge: null,
    title: currentPreset.name,
    subtitle: currentPreset.tagline,
  };

  // Satellite previews
  const heartConfig: QRConfig = {
    text: 'https://shapeqr.studio/heart',
    templateId: 'heart',
    studioMode: 'fun',
    moduleStyle: 'squircle',
    eyeStyle: 'theme-native',
    primaryColor: '#E31B23',
    bgColor: '#FFFFFF',
    accentColor: '#FF6B7A',
    depth: 'natural',
    cornerSmoothing: 28,
    quietZone: 18,
    centerBadge: null,
    title: 'Heart',
    subtitle: 'Heart QR',
  };

  const proBwConfig: QRConfig = {
    text: 'https://shapeqr.studio/pro',
    templateId: 'monochrome',
    studioMode: 'professional',
    moduleStyle: 'squircle',
    eyeStyle: 'rounded',
    primaryColor: '#000000',
    bgColor: '#FFFFFF',
    accentColor: '#000000',
    depth: 'subtle',
    cornerSmoothing: 20,
    quietZone: 18,
    centerBadge: null,
    title: 'Executive B&W',
    subtitle: 'Professional',
  };

  const pizzaConfig: QRConfig = {
    text: 'https://shapeqr.studio/pizza',
    templateId: 'pizza',
    studioMode: 'fun',
    moduleStyle: 'theme-native',
    eyeStyle: 'theme-native',
    primaryColor: '#B8281B',
    bgColor: '#FFF5D6',
    accentColor: '#D3832B',
    depth: 'natural',
    cornerSmoothing: 24,
    quietZone: 18,
    centerBadge: null,
    title: 'Pizza Slice',
    subtitle: 'Artisan',
  };

  const starConfig: QRConfig = {
    text: 'https://shapeqr.studio/star',
    templateId: 'star',
    studioMode: 'fun',
    moduleStyle: 'squircle',
    eyeStyle: 'rounded',
    primaryColor: '#D97706',
    bgColor: '#FFFBEB',
    accentColor: '#F59E0B',
    depth: 'natural',
    cornerSmoothing: 24,
    quietZone: 18,
    centerBadge: null,
    title: 'Star',
    subtitle: 'Celestial',
  };

  return (
    <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Soft Studio Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-[#8B80E8]/8 via-[#F4BFA8]/12 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Headline */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        {/* Sub-tagline Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[rgba(216,209,196,0.9)] shadow-2xs text-xs font-semibold text-[#85818A]">
          <span className="w-2 h-2 rounded-full bg-[#8B80E8]" />
          <span>Your Identity. Your Shape. Your QR.</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#30303B] [text-wrap:balance] leading-[1.12]">
          Make QR Codes <span className="text-[#8B80E8]">Worth Scanning.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#85818A] leading-relaxed max-w-2xl mx-auto">
          Craft modern digital business cards with clickable social links, or transform links into playful, collectible shapes — from pizza and hearts to stars and flowers.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          {onOpenVCard && (
            <button
              type="button"
              onClick={onOpenVCard}
              className="tactile-btn-primary px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-white" />
              <span>Create Digital vCard</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenStudio('fun', demoTemplate)}
            className="tactile-btn-secondary px-6 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#8B80E8]" />
            <span>Launch Shape Studio</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenStudio('professional', 'monochrome')}
            className="tactile-btn-secondary px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-2 cursor-pointer hidden sm:flex"
          >
            <Briefcase className="w-4 h-4 text-[#30303B]" />
            <span>Executive B&W</span>
          </button>
        </div>
      </div>

      {/* Main Split: Live Interactive Plinth & Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left: Quick Live Generator */}
        <div className="lg:col-span-5 p-6 rounded-3xl tactile-panel space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-[#30303B] uppercase tracking-wider">
              {activeTab === 'professional' ? 'Executive Generator' : 'Shape Silhouette Generator'}
            </span>
            <span className="text-xs font-mono text-[#85818A]">
              1:1 Live
            </span>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F5F2EB] rounded-xl border border-[rgba(216,209,196,0.8)] shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveTab('fun');
                setDemoTemplate('heart');
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'fun'
                  ? 'bg-[#8B80E8] text-white shadow-xs'
                  : 'text-[#85818A] hover:text-[#30303B]'
              }`}
            >
              Fun Shapes
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('professional');
                setDemoTemplate('monochrome');
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'professional'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-[#85818A] hover:text-[#30303B]'
              }`}
            >
              Executive B&W
            </button>
          </div>

          {/* URL Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#85818A]">
              <LinkIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://yourlink.com"
              className="tactile-input w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-medium"
            />
          </div>

          {/* Shape Selector for Active Tab */}
          <div>
            <label className="text-[11px] font-medium text-[#85818A] block mb-1.5">
              {activeTab === 'professional' ? 'Choose Precision Architecture' : 'Choose Shape Silhouette'}
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(activeTab === 'professional' ? PROFESSIONAL_PRESETS : FUN_SHAPE_PRESETS).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setDemoTemplate(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    demoTemplate === s.id
                      ? activeTab === 'professional'
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-[#8B80E8] text-white shadow-xs'
                      : 'bg-[#F5F2EB] text-[#85818A] hover:text-[#30303B] hover:bg-white'
                  }`}
                >
                  {s.badgeLabel}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenStudio(activeTab, demoTemplate)}
            className="w-full tactile-btn-secondary py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Open in Full Studio</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#8B80E8] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Right: Live Interactive Canvas + Satellites */}
        <div className="lg:col-span-7 relative flex items-center justify-center min-h-[460px]">
          {/* Satellite 1: Top-Left */}
          <div className="absolute -top-4 -left-4 z-20 w-32 h-32 rounded-3xl tactile-panel-lifted p-2 shadow-lg transform -rotate-6 hover:rotate-0 hover:scale-105 transition-transform duration-300 hidden sm:block">
            <FunQRCodeRenderer
              config={activeTab === 'professional' ? heartConfig : proBwConfig}
              size={110}
              interactive={false}
              className="w-full h-full"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full text-[9px] font-bold text-[#30303B] shadow-xs border border-[rgba(216,209,196,0.8)] whitespace-nowrap">
              {activeTab === 'professional' ? '❤️ Heart' : '⬛ Executive B&W'}
            </span>
          </div>

          {/* Satellite 2: Top-Right */}
          <div className="absolute -top-6 -right-2 z-20 w-32 h-32 rounded-3xl tactile-panel-lifted p-2 shadow-lg transform rotate-8 hover:rotate-0 hover:scale-105 transition-transform duration-300 hidden sm:block">
            <FunQRCodeRenderer
              config={pizzaConfig}
              size={110}
              interactive={false}
              className="w-full h-full"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full text-[9px] font-bold text-[#B8281B] shadow-xs border border-[rgba(216,209,196,0.8)] whitespace-nowrap">
              🍕 Pizza Slice
            </span>
          </div>

          {/* Satellite 3: Bottom-Right */}
          <div className="absolute -bottom-6 -right-4 z-20 w-32 h-32 rounded-3xl tactile-panel-lifted p-2 shadow-lg transform -rotate-8 hover:rotate-0 hover:scale-105 transition-transform duration-300 hidden sm:block">
            <FunQRCodeRenderer
              config={starConfig}
              size={110}
              interactive={false}
              className="w-full h-full"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full text-[9px] font-bold text-[#D97706] shadow-xs border border-[rgba(216,209,196,0.8)] whitespace-nowrap">
              ⭐ Star
            </span>
          </div>

          {/* Central Live Canvas */}
          <div className="relative z-10 w-full max-w-[360px] rounded-3xl p-3 tactile-panel-lifted transition-all duration-300 transform hover:scale-[1.01] bg-white/80 backdrop-blur-sm">
            <div className="text-center pb-2 mb-2 border-b border-[rgba(224,218,206,0.6)] flex items-center justify-between">
              <span className="text-xs font-bold text-[#30303B]">Live Shape Preview</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% Scannable</span>
              </span>
            </div>
            <FunQRCodeRenderer
              config={liveConfig}
              size={310}
              interactive={false}
              className="w-full"
            />
            <div className="pt-3 mt-3 border-t border-[rgba(224,218,206,0.6)] text-center">
              <button
                type="button"
                onClick={() => onOpenStudio(activeTab, demoTemplate)}
                className="text-xs font-bold text-[#8B80E8] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <span>Customize & Download in Full Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
