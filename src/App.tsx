import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { TemplateGallery } from './components/TemplateGallery';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { QREditor } from './components/QREditor';
import { VCardStudio } from './components/VCardStudio';
import { DigitalCardView } from './components/DigitalCardView';
import { Footer } from './components/Footer';
import {
  QRConfig,
  QRTemplateId,
  StudioMode,
  PROFESSIONAL_PRESETS,
  FUN_SHAPE_PRESETS,
} from './types/qr';
import { VCardProfile } from './types/vcard';
import { getProfileById, getActiveProfile } from './utils/profileStorage';

function parseCardIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  if (path.startsWith('/card/')) {
    const raw = path.replace('/card/', '').split('/')[0].split('?')[0].trim();
    return raw ? decodeURIComponent(raw) : null;
  }
  return null;
}

export default function App() {
  const initialCardId = parseCardIdFromUrl();
  const [activeView, setActiveView] = useState<'home' | 'studio' | 'vcard' | 'card-view'>(
    initialCardId ? 'card-view' : 'home'
  );
  const [currentMode, setCurrentMode] = useState<StudioMode>('fun');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(initialCardId);

  const [editorInitialConfig, setEditorInitialConfig] = useState<Partial<QRConfig>>({
    templateId: 'heart',
    studioMode: 'fun',
    text: 'https://shapeqr.studio',
  });

  // Listen for browser back/forward and direct navigation
  useEffect(() => {
    const handleUrlRouting = () => {
      const cardId = parseCardIdFromUrl();
      if (cardId) {
        setViewingProfileId(cardId);
        setActiveView('card-view');
      } else if (window.location.pathname === '/' || window.location.pathname === '') {
        setActiveView((prev) => (prev === 'card-view' ? 'home' : prev));
        setViewingProfileId(null);
      }
    };

    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, []);

  const handleOpenStudio = (mode: StudioMode, templateId?: QRTemplateId) => {
    setCurrentMode(mode);
    const presets = mode === 'professional' ? PROFESSIONAL_PRESETS : FUN_SHAPE_PRESETS;
    const targetTemplate = templateId || presets[0].id;
    const preset = presets.find((p) => p.id === targetTemplate) || presets[0];

    setEditorInitialConfig({
      ...preset.defaultConfig,
      templateId: targetTemplate,
      studioMode: mode,
      text: mode === 'professional' ? 'https://shapeqr.studio/pro' : 'https://shapeqr.studio',
    });

    setActiveView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPublicProfile = (profileId: string) => {
    setViewingProfileId(profileId);
    setActiveView('card-view');
    window.history.pushState({}, '', `/card/${profileId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStudio = () => {
    setActiveView('studio');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in public card view route
  if (activeView === 'card-view') {
    return (
      <DigitalCardView
        profileId={viewingProfileId || undefined}
        profile={viewingProfileId ? getProfileById(viewingProfileId) || undefined : getActiveProfile()}
        onBackToStudio={handleBackToStudio}
        isStandalonePage={true}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EB] text-[#30303B] antialiased selection:bg-[#8B80E8]/20 selection:text-[#30303B]">
      {/* Top Header Navigation */}
      <Navigation
        activeView={activeView}
        studioMode={currentMode}
        onNavigate={(view, mode) => {
          if (view === 'studio' && mode) {
            handleOpenStudio(mode);
          } else {
            setActiveView(view);
            if (window.location.pathname.startsWith('/card/')) {
              window.history.pushState({}, '', '/');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <HeroSection
              onOpenStudio={handleOpenStudio}
              onOpenVCard={() => {
                setActiveView('vcard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <div id="templates-gallery">
              <TemplateGallery
                onSelectTemplate={(templateId, mode) => handleOpenStudio(mode, templateId)}
              />
            </div>

            <div id="features">
              <FeaturesSection />
            </div>

            <div id="how-it-works">
              <HowItWorksSection onStartCreating={() => handleOpenStudio('fun')} />
            </div>
          </>
        )}

        {activeView === 'studio' && (
          <QREditor
            initialConfig={editorInitialConfig}
            initialMode={currentMode}
            onOpenPublicProfile={handleOpenPublicProfile}
          />
        )}

        {activeView === 'vcard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <VCardStudio
              onProfileUpdated={() => {}}
              onOpenPublicProfile={handleOpenPublicProfile}
            />
          </div>
        )}
      </main>

      {/* Footer with Developer Signature */}
      <Footer
        onNavigate={(view) => {
          setActiveView(view);
          if (window.location.pathname.startsWith('/card/')) {
            window.history.pushState({}, '', '/');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
