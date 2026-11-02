import React from 'react';
import { ArrowRight, Sparkles, QrCode, Sliders, Palette, Download } from 'lucide-react';

interface HowItWorksSectionProps {
  onStartCreating: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartCreating }) => {
  const steps = [
    {
      step: '01',
      title: 'Enter Payload',
      desc: 'Paste a website link, create an interactive digital vCard with social links, or input contact info.',
      icon: QrCode,
    },
    {
      step: '02',
      title: 'Choose Shape or Style',
      desc: 'Select a sculpted shape like heart, pizza slice, star, hexagon, or executive monochrome B&W.',
      icon: Palette,
    },
    {
      step: '03',
      title: 'Refine & Validate',
      desc: 'Customize colors, profile avatar, themes, and verify scannability in real time with jsQR.',
      icon: Sliders,
    },
    {
      step: '04',
      title: 'Download & Share',
      desc: 'Download crisp PNGs, SVGs, or WebP files at up to 2048px, or share your live digital card instantly.',
      icon: Download,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8B80E8] block mb-2">
          Workflow
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#30303B] [text-wrap:balance]">
          How Shape QR Works
        </h2>
        <p className="mt-3 text-sm text-[#85818A] leading-relaxed">
          From your identity to beautiful scannable artwork in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.step}
              className="tactile-panel rounded-3xl p-6 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-[#D5CEBF]">
                    {st.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#F5F2EB] border border-[rgba(216,209,196,0.8)] flex items-center justify-center text-[#8B80E8] shadow-inner">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#30303B]">{st.title}</h3>
                <p className="text-xs text-[#85818A] mt-2 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <button
          type="button"
          onClick={onStartCreating}
          className="tactile-btn-primary px-8 py-3 rounded-2xl text-sm font-semibold inline-flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Shape Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
