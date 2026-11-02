import React from 'react';
import { Sparkles, Download, Layers, Briefcase } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Professional Monochrome Studio',
      description:
        'Pure black & white precision with corporate typography, clean quiet zones, and uploaded executive headshots for business cards.',
      icon: Briefcase,
      color: '#000000',
    },
    {
      title: 'Sculpted Fun Silhouettes',
      description:
        'A rich variety of sculpted shapes — from hearts and wood-fired pizza slices to stars, clouds, shields, and blooming flowers.',
      icon: Sparkles,
      color: '#8B80E8',
    },
    {
      title: 'Lossless Vector & 2000px Export',
      description:
        'Download crisp 2000x2000px PNGs or infinitely scalable SVG vectors with exact shape clipping paths for printing and digital displays.',
      icon: Download,
      color: '#F4BFA8',
    },
    {
      title: 'Universal Smart Payloads',
      description:
        'Instant digital vCards with photo embedding, enterprise Wi-Fi logins, websites, and text notes ready in seconds.',
      icon: Layers,
      color: '#0F766E',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8B80E8] block mb-2">
          Two Worlds in One Studio
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#30303B] [text-wrap:balance]">
          Engineered for Executive Trust & Creative Play
        </h2>
        <p className="mt-3 text-sm text-[#85818A] leading-relaxed">
          Switch effortlessly between corporate black & white standards and imaginative tactile silhouettes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="tactile-panel rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <div>
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 border shadow-xs"
                  style={{
                    backgroundColor: `${feat.color === '#000000' ? '#000000' : feat.color}15`,
                    borderColor: `${feat.color === '#000000' ? '#000000' : feat.color}35`,
                    color: feat.color,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-[#30303B]">{feat.title}</h3>
                <p className="text-xs text-[#85818A] mt-2 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
