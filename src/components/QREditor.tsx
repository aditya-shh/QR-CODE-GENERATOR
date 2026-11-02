import React, { useState, useEffect } from 'react';
import {
  QRConfig,
  QRTemplateId,
  StudioMode,
  PROFESSIONAL_PRESETS,
  FUN_SHAPE_PRESETS,
  ModuleStyle,
  EyeStyle,
  DepthLevel,
} from '../types/qr';
import { VCardProfile } from '../types/vcard';
import { getActiveProfile } from '../utils/profileStorage';
import { buildVcfString } from '../utils/vcardFormatter';
import { getPublicCardUrl } from '../utils/urlHelper';
import { FunQRCodeRenderer } from './FunQRCodeRenderer';
import {
  Link,
  Wifi,
  UserCheck,
  FileText,
  Sliders,
  Copy,
  Check,
  RefreshCw,
  Upload,
  X,
  Briefcase,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface QREditorProps {
  initialConfig?: Partial<QRConfig>;
  initialMode?: StudioMode;
  initialContentType?: 'url' | 'vcard' | 'wifi' | 'text';
  onOpenPublicProfile?: (id: string) => void;
}

export const QREditor: React.FC<QREditorProps> = ({
  initialConfig,
  initialMode = 'fun',
  initialContentType = 'url',
  onOpenPublicProfile,
}) => {
  const [studioMode, setStudioMode] = useState<StudioMode>(
    initialConfig?.studioMode || initialMode
  );

  const [contentType, setContentType] = useState<'url' | 'vcard' | 'wifi' | 'text'>(
    initialContentType
  );

  const [activeProfile, setActiveProfile] = useState<VCardProfile>(() => getActiveProfile());

  const [config, setConfig] = useState<QRConfig>(() => {
    const defaultMode = initialConfig?.studioMode || initialMode;
    const presets = defaultMode === 'professional' ? PROFESSIONAL_PRESETS : FUN_SHAPE_PRESETS;
    const defaultTplId = initialConfig?.templateId || (defaultMode === 'professional' ? 'monochrome' : 'heart');
    const defaultPreset = presets.find((p) => p.id === defaultTplId) || presets[0];

    return {
      text: initialConfig?.text || (defaultMode === 'professional' ? 'https://shapeqr.studio/pro' : 'https://shapeqr.studio'),
      templateId: defaultPreset.id,
      studioMode: defaultMode,
      moduleStyle: initialConfig?.moduleStyle || defaultPreset.defaultConfig.moduleStyle || 'squircle',
      eyeStyle: initialConfig?.eyeStyle || defaultPreset.defaultConfig.eyeStyle || 'rounded',
      primaryColor: initialConfig?.primaryColor || defaultPreset.defaultConfig.primaryColor || '#E31B23',
      bgColor: initialConfig?.bgColor || defaultPreset.defaultConfig.bgColor || '#FFFFFF',
      accentColor: initialConfig?.accentColor || defaultPreset.defaultConfig.accentColor || '#FF6B7A',
      depth: initialConfig?.depth || 'natural',
      cornerSmoothing: initialConfig?.cornerSmoothing ?? 24,
      quietZone: initialConfig?.quietZone ?? 18,
      centerBadge: null,
      centerLogo: initialConfig?.centerLogo ?? null,
      title: defaultPreset.name,
      subtitle: defaultPreset.tagline,
    };
  });

  // Sync if initialConfig changes externally
  useEffect(() => {
    if (initialConfig?.templateId) {
      handleSelectTemplate(initialConfig.templateId);
    }
    if (initialConfig?.studioMode) {
      setStudioMode(initialConfig.studioMode);
    }
  }, [initialConfig?.templateId, initialConfig?.studioMode]);

  // Wi-Fi fields
  const [wifiSsid, setWifiSsid] = useState('Office_5G');
  const [wifiPass, setWifiPass] = useState('shapeqr2026');
  const [wifiSec, setWifiSec] = useState('WPA');

  const [copied, setCopied] = useState(false);

  // Switch between Professional and Fun modes
  const handleSwitchMode = (mode: StudioMode) => {
    setStudioMode(mode);
    const presets = mode === 'professional' ? PROFESSIONAL_PRESETS : FUN_SHAPE_PRESETS;
    const targetPreset = presets[0];

    setConfig((prev) => ({
      ...prev,
      ...targetPreset.defaultConfig,
      templateId: targetPreset.id,
      studioMode: mode,
      primaryColor: mode === 'professional' ? '#000000' : (targetPreset.defaultConfig.primaryColor || '#E31B23'),
      bgColor: '#FFFFFF',
      title: targetPreset.name,
      subtitle: targetPreset.tagline,
    }));
  };

  // Select a specific template shape
  const handleSelectTemplate = (templateId: QRTemplateId) => {
    const allPresets = [...PROFESSIONAL_PRESETS, ...FUN_SHAPE_PRESETS];
    const preset = allPresets.find((p) => p.id === templateId);
    if (!preset) return;

    setConfig((prev) => ({
      ...prev,
      ...preset.defaultConfig,
      templateId: preset.id,
      studioMode: preset.category === 'Professional' ? 'professional' : 'fun',
      primaryColor: preset.defaultConfig.primaryColor || (preset.category === 'Professional' ? '#000000' : '#E31B23'),
      bgColor: preset.defaultConfig.bgColor || '#FFFFFF',
      title: preset.name,
      subtitle: preset.tagline,
    }));

    if (preset.category === 'Professional') {
      setStudioMode('professional');
    } else {
      setStudioMode('fun');
    }
  };

  const updateWifiPayload = (ssid: string, pass: string, sec: string) => {
    setWifiSsid(ssid);
    setWifiPass(pass);
    setWifiSec(sec);
    const payload = `WIFI:T:${sec};S:${ssid};P:${pass};;`;
    setConfig((prev) => ({ ...prev, text: payload }));
  };

  // Sync QR payload when vCard profile updates
  const handleProfileUpdated = (profile: VCardProfile) => {
    setActiveProfile(profile);

    if (contentType === 'vcard') {
      if (profile.qrMode === 'interactive') {
        const profileUrl = getPublicCardUrl(profile.id);
        setConfig((p) => ({
          ...p,
          text: profileUrl,
          centerLogo: profile.avatarUrl || p.centerLogo,
        }));
      } else {
        const vcfText = buildVcfString(profile);
        setConfig((p) => ({
          ...p,
          text: vcfText,
          centerLogo: profile.avatarUrl || p.centerLogo,
        }));
      }
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(config.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo image size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setConfig((prev) => ({
        ...prev,
        centerLogo: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setConfig((prev) => ({
      ...prev,
      centerLogo: null,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Top Control Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-[#FFFCF7] rounded-3xl border border-[rgba(216,209,196,0.9)] shadow-sm">
        <div>
          {/* Mode Switcher Buttons */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-[#F5F2EB] rounded-2xl border border-[rgba(216,209,196,0.8)] shadow-inner mb-3">
            <button
              type="button"
              onClick={() => handleSwitchMode('professional')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                studioMode === 'professional'
                  ? 'bg-black text-white shadow-md'
                  : 'text-[#85818A] hover:text-[#30303B]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Professional (B&W)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('fun')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                studioMode === 'fun'
                  ? 'bg-[#8B80E8] text-white shadow-md'
                  : 'text-[#85818A] hover:text-[#30303B]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fun Shapes Studio</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#30303B]">
            {studioMode === 'professional'
              ? 'Executive Monochrome Studio'
              : 'Sculpted Silhouette Studio'}
          </h1>
          <p className="text-xs text-[#85818A] mt-1">
            {studioMode === 'professional'
              ? 'High-contrast black & white precision with clean quiet zones for cards and corporate branding.'
              : '12 sculpted collectible silhouettes: Pizza Slice, Heart, Star, Flower, Cloud, Shield, Diamond, Brioche Burger, Hexagon, Donut, Mug, Circle.'}
          </p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {contentType === 'vcard' && onOpenPublicProfile && (
            <button
              type="button"
              onClick={() => onOpenPublicProfile(activeProfile.id)}
              className="tactile-btn-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Live Public Card</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyPayload}
            className="tactile-btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#85818A]" />}
            <span>{copied ? 'Copied!' : 'Copy Encoded Payload'}</span>
          </button>
        </div>
      </div>

      {/* THREE-PANEL ARCHITECTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            PANEL 1 (LEFT): Content Payload & Template Selector (4 cols)
           ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section: Content Payload Selector */}
          <div className="tactile-panel rounded-3xl p-5 space-y-4">
            <span className="text-xs font-bold text-[#30303B] uppercase tracking-wider block">
              1. Content Payload
            </span>

            {/* Content Type Selector Buttons */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#F5F2EB] rounded-xl border border-[rgba(216,209,196,0.8)] shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setContentType('url');
                  setConfig((p) => ({ ...p, text: 'https://shapeqr.studio' }));
                }}
                className={`py-1.5 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  contentType === 'url' ? 'bg-white text-[#30303B] shadow-xs' : 'text-[#85818A] hover:text-[#30303B]'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">URL</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setContentType('vcard');
                  handleProfileUpdated(activeProfile);
                }}
                className={`py-1.5 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  contentType === 'vcard' ? 'bg-white text-[#30303B] shadow-xs' : 'text-[#85818A] hover:text-[#30303B]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#8B80E8]" />
                <span className="text-[10px] font-bold">vCard ★</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setContentType('wifi');
                  updateWifiPayload(wifiSsid, wifiPass, wifiSec);
                }}
                className={`py-1.5 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  contentType === 'wifi' ? 'bg-white text-[#30303B] shadow-xs' : 'text-[#85818A] hover:text-[#30303B]'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">Wi-Fi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setContentType('text');
                  setConfig((p) => ({ ...p, text: 'Shape QR: Your Identity. Your Shape. Your QR.' }));
                }}
                className={`py-1.5 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  contentType === 'text' ? 'bg-white text-[#30303B] shadow-xs' : 'text-[#85818A] hover:text-[#30303B]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">Text</span>
              </button>
            </div>

            {/* Inputs based on type */}
            {contentType === 'url' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#85818A] block">Destination Website URL</label>
                <input
                  type="url"
                  value={config.text}
                  onChange={(e) => setConfig((p) => ({ ...p, text: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className="tactile-input w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                />
              </div>
            )}

            {contentType === 'vcard' && (
              <div className="space-y-3 p-3 bg-[#FBF9F3] rounded-2xl border border-[rgba(216,209,196,0.8)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#30303B]">
                    Digital vCard Linked
                  </span>
                  <span className="text-[10px] font-semibold text-[#8B80E8] bg-white px-2 py-0.5 rounded-full border border-[#8B80E8]/30">
                    {activeProfile.qrMode === 'interactive' ? 'Mode B: Interactive' : 'Mode A: Offline VCF'}
                  </span>
                </div>

                <div className="text-xs text-[#6B7280]">
                  Connected profile: <strong className="text-[#30303B]">{activeProfile.fullName}</strong>
                </div>

                <div className="text-[11px] text-[#85818A] font-mono truncate bg-white p-2 rounded-lg border border-[rgba(216,209,196,0.8)]">
                  {config.text.slice(0, 48)}...
                </div>

                <p className="text-[11px] text-[#85818A]">
                  Use the Digital vCard Studio tab below to add/reorder any social media links or custom fields.
                </p>
              </div>
            )}

            {contentType === 'wifi' && (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-medium text-[#85818A] block mb-1">Network (SSID)</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => updateWifiPayload(e.target.value, wifiPass, wifiSec)}
                    className="tactile-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#85818A] block mb-1">Password</label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => updateWifiPayload(wifiSsid, e.target.value, wifiSec)}
                    className="tactile-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {contentType === 'text' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#85818A] block">Text</label>
                <textarea
                  rows={3}
                  value={config.text}
                  onChange={(e) => setConfig((p) => ({ ...p, text: e.target.value }))}
                  className="tactile-input w-full px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>
            )}
          </div>

          {/* Section: Shape / Silhouette Selection */}
          <div className="tactile-panel rounded-3xl p-5 space-y-4">
            <span className="text-xs font-bold text-[#30303B] uppercase tracking-wider block">
              {studioMode === 'professional' ? '2. Professional Layouts' : '2. Select Fun Shape Silhouette'}
            </span>

            {/* List of shapes/styles */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {(studioMode === 'professional' ? PROFESSIONAL_PRESETS : FUN_SHAPE_PRESETS).map((tpl) => {
                const isSelected = config.templateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? studioMode === 'professional'
                          ? 'bg-white border-black shadow-md ring-2 ring-black/20 translate-y-[-1px]'
                          : 'bg-white border-[#8B80E8] shadow-md ring-2 ring-[#8B80E8]/20 translate-y-[-1px]'
                        : 'bg-[#F9F7F1] border-[rgba(216,209,196,0.8)] hover:bg-white hover:border-[#8B80E8]/40'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                        studioMode === 'professional' ? 'text-black' : 'text-[#8B80E8]'
                      }`}>
                        {tpl.badgeLabel}
                      </span>
                      <span className="text-xs font-bold text-[#30303B] block mt-0.5 truncate">
                        {tpl.name}
                      </span>
                      <p className="text-[11px] text-[#85818A] line-clamp-2 mt-1 leading-tight">
                        {tpl.tagline}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-end">
                      {isSelected && (
                        <span className={`w-2 h-2 rounded-full ${
                          studioMode === 'professional' ? 'bg-black' : 'bg-[#8B80E8]'
                        }`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            PANEL 2 (CENTER): Creative Canvas Preview & Downloads (4 cols)
           ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <FunQRCodeRenderer
            config={config}
            size={380}
            interactive={true}
            className="w-full"
          />
        </div>

        {/* =========================================================================
            PANEL 3 (RIGHT): Tactile Customization Studio Controls (4 cols)
           ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="tactile-panel rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(224,218,206,0.7)]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#8B80E8]" />
                <span className="text-xs font-bold text-[#30303B] uppercase tracking-wider">
                  Tactile Controls
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTemplate(config.templateId)}
                className="text-[11px] text-[#85818A] hover:text-[#30303B] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Direct Logo / Avatar Upload in Studio */}
            <div className="p-3 bg-[#F9F7F1] rounded-2xl border border-[rgba(216,209,196,0.8)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#30303B]">
                  Center Logo / Avatar
                </span>
                {config.centerLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {config.centerLogo ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-white">
                    <img
                      src={config.centerLogo}
                      alt="Center badge"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-[#30303B] truncate">
                    Embedded badge active
                  </span>
                </div>
              ) : (
                <label className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-[rgba(216,209,196,0.9)] bg-white/70 hover:bg-white hover:border-[#8B80E8] cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5 text-[#8B80E8]" />
                  <span className="text-xs font-medium text-[#30303B]">Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Color Swatches */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#85818A] block mb-1.5">
                  Primary Theme Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="tactile-input px-2.5 py-1 text-xs font-mono uppercase flex-1 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#85818A] block mb-1.5">
                  Background Surface Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => setConfig((p) => ({ ...p, bgColor: e.target.value }))}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={config.bgColor}
                    onChange={(e) => setConfig((p) => ({ ...p, bgColor: e.target.value }))}
                    className="tactile-input px-2.5 py-1 text-xs font-mono uppercase flex-1 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Module Styling */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#85818A] block">
                Module Geometry
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F5F2EB] rounded-xl border border-[rgba(216,209,196,0.8)] shadow-inner">
                {(['squircle', 'rounded', 'dots'] as ModuleStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setConfig((p) => ({ ...p, moduleStyle: style }))}
                    className={`py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      config.moduleStyle === style
                        ? 'bg-white text-[#30303B] shadow-xs'
                        : 'text-[#85818A] hover:text-[#30303B]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Quiet Zone Padding Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#85818A]">Quiet Zone Margin</span>
                <span className="font-mono font-bold text-[#30303B]">{config.quietZone}%</span>
              </div>
              <input
                type="range"
                min={12}
                max={32}
                value={config.quietZone}
                onChange={(e) => setConfig((p) => ({ ...p, quietZone: Number(e.target.value) }))}
                className="w-full accent-[#8B80E8] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
