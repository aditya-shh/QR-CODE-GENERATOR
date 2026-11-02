import React, { useState } from 'react';
import {
  QRTemplateId,
  QRConfig,
  StudioMode,
  PROFESSIONAL_PRESETS,
  FUN_SHAPE_PRESETS,
} from '../types/qr';
import { FunQRCodeRenderer } from './FunQRCodeRenderer';
import { ArrowRight, Briefcase, Sparkles } from 'lucide-react';

interface TemplateGalleryProps {
  onSelectTemplate: (templateId: QRTemplateId, mode: StudioMode) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  const [activeTab, setActiveTab] = useState<StudioMode>('fun');

  const presets = activeTab === 'professional' ? PROFESSIONAL_PRESETS : FUN_SHAPE_PRESETS;

  return (
    <section id="templates-gallery" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        {/* Two-Part Switcher */}
        <div className="inline-flex items-center gap-1.5 p-1 bg-[#EBE5DA] rounded-2xl border border-[rgba(216,209,196,0.8)] shadow-inner mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('professional')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'professional' ? 'bg-black text-white shadow-sm' : 'text-[#85818A] hover:text-[#30303B]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Professional Use (B&W)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fun')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'fun' ? 'bg-[#8B80E8] text-white shadow-sm' : 'text-[#85818A] hover:text-[#30303B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fun Shapes Studio</span>
          </button>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#30303B] [text-wrap:balance]">
          {activeTab === 'professional'
            ? 'Monochrome Executive Collection'
            : 'Explore All Fun Sculpted Shapes'}
        </h2>
        <p className="mt-3 text-sm text-[#85818A] leading-relaxed">
          {activeTab === 'professional'
            ? 'Engineered with pure black & white contrast, clean quiet zones, and corporate typography.'
            : 'Every design sculpts the entire QR code into an authentic tactile silhouette.'}
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {presets.map((tpl) => {
          const previewConfig: QRConfig = {
            text: `https://shapeqr.studio/${tpl.id}`,
            templateId: tpl.id,
            studioMode: activeTab,
            moduleStyle: tpl.defaultConfig.moduleStyle || (activeTab === 'professional' ? 'squircle' : 'rounded'),
            eyeStyle: tpl.defaultConfig.eyeStyle || 'theme-native',
            primaryColor: tpl.defaultConfig.primaryColor || (activeTab === 'professional' ? '#000000' : '#E31B23'),
            bgColor: tpl.defaultConfig.bgColor || '#FFFFFF',
            accentColor: tpl.defaultConfig.accentColor || '#8B80E8',
            depth: tpl.defaultConfig.depth || 'natural',
            cornerSmoothing: tpl.defaultConfig.cornerSmoothing || 24,
            quietZone: tpl.defaultConfig.quietZone || 18,
            centerBadge: null,
            title: tpl.name,
            subtitle: tpl.tagline,
          };

          return (
            <div
              key={tpl.id}
              className="tactile-panel-lifted rounded-3xl p-5 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200"
            >
              {/* Mini Preview Plinth */}
              <div className="relative w-full aspect-square rounded-2xl bg-[#F8F5EE] border border-[rgba(216,209,196,0.6)] shadow-inner flex items-center justify-center p-3 overflow-hidden">
                <FunQRCodeRenderer
                  config={previewConfig}
                  size={190}
                  interactive={false}
                  className="w-full h-full object-contain"
                />

                <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-[rgba(216,209,196,0.8)] shadow-xs">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    activeTab === 'professional' ? 'text-black' : 'text-[#8B80E8]'
                  }`}>
                    {tpl.badgeLabel}
                  </span>
                </div>
              </div>

              {/* Card Meta */}
              <div className="mt-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#30303B]">{tpl.name}</h3>
                  <p className="text-xs text-[#85818A] mt-1 leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[rgba(224,218,206,0.6)]">
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(tpl.id, activeTab)}
                    className="w-full tactile-btn-secondary py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 group-hover:border-[#8B80E8]"
                  >
                    <span>Customize in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8B80E8] transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
