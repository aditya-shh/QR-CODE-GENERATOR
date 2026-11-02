import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { VCardProfile, VCardField } from '../types/vcard';
import {
  getActiveProfile,
  saveProfile,
  saveQRCodeToDatabase,
  DIGITAL_CARD_THEMES,
} from '../utils/profileStorage';
import { AddFieldModal } from './AddFieldModal';
import { getPlatformIcon, normalizeFieldValue } from '../utils/socialIcons';
import { downloadVcfFile } from '../utils/vcardFormatter';
import { getPublicCardUrl } from '../utils/urlHelper';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Check,
  ExternalLink,
  Smartphone,
  Save,
  Palette,
  User,
  Phone,
  Copy,
  Share2,
  Download,
  QrCode as QrCodeIcon,
  Sparkles,
} from 'lucide-react';

interface VCardStudioProps {
  onProfileUpdated: (profile: VCardProfile) => void;
  onOpenPublicProfile: (profileId: string) => void;
}

export const VCardStudio: React.FC<VCardStudioProps> = ({
  onProfileUpdated,
  onOpenPublicProfile,
}) => {
  const [profile, setProfile] = useState<VCardProfile>(() => getActiveProfile());
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync with parent when profile changes
  useEffect(() => {
    onProfileUpdated(profile);
  }, [profile, onProfileUpdated]);

  const publicProfileUrl = getPublicCardUrl(profile.id);

  // Generate live QR code for the public profile URL
  useEffect(() => {
    if (profile.id) {
      QRCode.toDataURL(publicProfileUrl, {
        width: 480,
        margin: 2,
        color: {
          dark: '#1E293B',
          light: '#FFFFFF',
        },
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [profile.id, publicProfileUrl]);

  const handleFieldChange = (id: string, updates: Partial<VCardField>) => {
    setProfile((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveField = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
    setHasUnsavedChanges(true);
  };

  const handleToggleVisibility = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, isVisible: !f.isVisible } : f)),
    }));
    setHasUnsavedChanges(true);
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= profile.fields.length) return;

    const newFields = [...profile.fields];
    const [moved] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, moved);

    setProfile((prev) => ({ ...prev, fields: newFields }));
    setHasUnsavedChanges(true);
  };

  const handleAddField = (newField: VCardField) => {
    setProfile((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setHasUnsavedChanges(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Photo size exceeds 3MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setProfile((prev) => ({ ...prev, avatarUrl: result }));
      setHasUnsavedChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile.fullName.trim() || !profile.phoneNumber.trim()) {
      alert('Please enter your Full Name and Phone Number to create your digital card.');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveProfile(profile);
      setProfile(saved);

      // Save QR code to database with absolute public HTTPS URL
      await saveQRCodeToDatabase({
        profileId: saved.id,
        text: getPublicCardUrl(saved.id),
        templateId: 'vcard-direct',
        config: {
          fullName: saved.fullName,
          themeId: saved.themeId,
        },
      });

      setHasUnsavedChanges(false);
      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleShareProfile = async () => {
    const shareData = {
      title: `${profile.fullName || 'Digital Business Card'} — Shape QR`,
      text: `Connect with ${profile.fullName || 'me'} on Shape QR`,
      url: publicProfileUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to copy link
      }
    }

    handleCopyPublicLink();
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `shape-qr-${profile.id || 'card'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const selectedTheme =
    DIGITAL_CARD_THEMES.find((t) => t.id === profile.themeId) || DIGITAL_CARD_THEMES[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-[#FFFCF7] rounded-3xl border border-[rgba(216,209,196,0.9)] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B80E8]" />
            <h2 className="text-xl font-bold text-[#30303B]">
              Digital vCard Creator
            </h2>
          </div>
          <p className="text-xs text-[#85818A] mt-1">
            Create your unified digital card with one QR code. Enter your name and phone, then add anything you want.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="tactile-btn-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Smartphone className="w-4 h-4 text-[#8B80E8]" />
            <span>Preview Card</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="tactile-btn-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {saveSuccessToast ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved to Neon DB!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Save Card'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Form: Clean, Simple, Only Two Permanent Fields */}
      <div className="space-y-6">
        {/* Core Required Fields */}
        <div className="tactile-panel rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(224,218,206,0.6)]">
            <span className="text-xs font-bold text-[#30303B] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#8B80E8]" />
              <span>Core Information</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Required
            </span>
          </div>

          {/* Profile Photo Upload */}
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-white shadow-md overflow-hidden bg-[#F5F2EB] flex items-center justify-center text-xl font-bold text-[#85818A]">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {profile.fullName
                      ? profile.fullName
                          .split(/\s+/)
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      : 'QR'}
                  </span>
                )}
              </div>

              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setProfile((p) => ({ ...p, avatarUrl: null }));
                    setHasUnsavedChanges(true);
                  }}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-xs hover:bg-red-600 cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(216,209,196,0.9)] bg-white hover:bg-neutral-50 text-xs font-bold text-[#30303B] cursor-pointer shadow-2xs">
                <Upload className="w-4 h-4 text-[#8B80E8]" />
                <span>Upload Profile Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-[#85818A]">
                Optional square portrait photo (PNG/JPG up to 3MB)
              </p>
            </div>
          </div>

          {/* Only 2 Permanent Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#30303B] block mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => {
                  setProfile((p) => ({ ...p, fullName: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                placeholder="e.g. Alex Morgan"
                className="tactile-input w-full px-4 py-3 rounded-2xl text-xs font-bold text-[#30303B]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#30303B] block mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={profile.phoneNumber}
                onChange={(e) => {
                  setProfile((p) => ({ ...p, phoneNumber: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                placeholder="+1 (555) 019-2834"
                className="tactile-input w-full px-4 py-3 rounded-2xl text-xs font-semibold text-[#30303B]"
                required
              />
            </div>
          </div>

          {/* Prominent + Add More Details Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAddFieldModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-[#8B80E8]/50 hover:border-[#8B80E8] bg-[#F5F2FF]/50 hover:bg-[#F5F2FF] text-xs font-bold text-[#4F46E5] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add More Details (Social Links, Email, WhatsApp, Job, Company...)</span>
            </button>
          </div>
        </div>

        {/* Added Optional Fields List (Shown only when added by user) */}
        {profile.fields.length > 0 && (
          <div className="tactile-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(224,218,206,0.6)]">
              <div>
                <span className="text-xs font-bold text-[#30303B] uppercase tracking-wider block">
                  Added Details & Social Links ({profile.fields.length})
                </span>
                <span className="text-[11px] text-[#85818A]">
                  Edit values, reorder with arrows, or delete fields anytime.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAddFieldModalOpen(true)}
                className="tactile-btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another</span>
              </button>
            </div>

            <div className="space-y-3">
              {profile.fields.map((field, index) => {
                const normalizedUrl =
                  field.type === 'url' ? normalizeFieldValue(field.key, field.value) : null;

                return (
                  <div
                    key={field.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      field.isVisible
                        ? 'bg-[#FAF8F4] border-[rgba(216,209,196,0.85)]'
                        : 'bg-neutral-100/70 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white border border-[rgba(216,209,196,0.8)] shadow-inner flex items-center justify-center text-[#30303B]">
                          {getPlatformIcon(field.key, 'w-4 h-4')}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#30303B]">
                            {field.label}
                          </span>
                          <span className="text-[10px] text-[#85818A] ml-2">
                            ({field.category})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMoveField(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-[#85818A] hover:text-[#30303B] disabled:opacity-30 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveField(index, 'down')}
                          disabled={index === profile.fields.length - 1}
                          className="p-1.5 text-[#85818A] hover:text-[#30303B] disabled:opacity-30 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(field.id)}
                          className="p-1.5 text-[#85818A] hover:text-[#30303B] rounded-lg hover:bg-white transition-colors cursor-pointer"
                          title={field.isVisible ? 'Hide on card' : 'Show on card'}
                        >
                          {field.isVisible ? (
                            <Eye className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-neutral-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(field.id)}
                          className="p-1.5 text-[#85818A] hover:text-red-500 rounded-lg hover:bg-white transition-colors cursor-pointer ml-1"
                          title="Delete field"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <input
                      type={field.type === 'email' ? 'email' : 'text'}
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.id, { value: e.target.value })}
                      placeholder={field.placeholder || `Enter ${field.label}`}
                      className="tactile-input w-full px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#30303B]"
                    />

                    {normalizedUrl && field.value.trim().length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#85818A]">
                        <span>Direct Link:</span>
                        <a
                          href={normalizedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8B80E8] hover:underline flex items-center gap-1 truncate max-w-[320px]"
                        >
                          <span>{normalizedUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Card Theme Picker */}
        <div className="tactile-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(224,218,206,0.6)]">
            <span className="text-xs font-bold text-[#30303B] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#8B80E8]" />
              <span>Card Visual Theme</span>
            </span>
            <span className="text-xs font-semibold text-[#85818A]">
              {selectedTheme.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {DIGITAL_CARD_THEMES.map((theme) => {
              const isSelected = profile.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setProfile((p) => ({ ...p, themeId: theme.id }));
                    setHasUnsavedChanges(true);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    isSelected
                      ? 'border-[#8B80E8] ring-2 ring-[#8B80E8]/30 shadow-md bg-white'
                      : 'border-[rgba(216,209,196,0.8)] bg-[#FAF8F3] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <span className="text-[11px] font-bold text-[#30303B] truncate">
                      {theme.name}
                    </span>
                  </div>

                  <div
                    className="w-full h-5 rounded-md border flex items-center px-2"
                    style={{
                      backgroundColor: theme.bgCard,
                      borderColor: theme.borderColor,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dedicated QR Code & Share Card Section */}
        <div className="tactile-panel rounded-3xl p-6 sm:p-8 space-y-6 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FAF6EE] border border-[rgba(216,209,196,0.9)] shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(224,218,206,0.6)]">
            <div className="flex items-center gap-2">
              <QrCodeIcon className="w-5 h-5 text-[#8B80E8]" />
              <div>
                <h3 className="text-sm font-bold text-[#30303B]">
                  Your Unified QR Code & Public Card Link
                </h3>
                <p className="text-[11px] text-[#85818A]">
                  When someone scans this QR code, it opens your public profile with all working links and details.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Scannable QR Code */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-[rgba(216,209,196,0.8)] shadow-inner">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${profile.fullName || 'Digital Card'}`}
                  className="w-48 h-48 object-contain rounded-xl drop-shadow-sm"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-[#F8F5EE] rounded-xl text-xs text-[#85818A]">
                  Generating QR...
                </div>
              )}

              <div className="w-full mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadQrPng}
                  disabled={!qrDataUrl}
                  className="tactile-btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer w-full justify-center"
                >
                  <Download className="w-3.5 h-3.5 text-[#8B80E8]" />
                  <span>Download QR (PNG)</span>
                </button>
              </div>
            </div>

            {/* Right: Public URL & Share Buttons */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#30303B] block mb-1.5">
                  Public Profile URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicProfileUrl}
                    className="tactile-input w-full px-3.5 py-2.5 rounded-xl text-xs font-mono text-[#30303B] bg-white select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPublicLink}
                    className="tactile-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    await handleSave();
                    onOpenPublicProfile(profile.id);
                  }}
                  className="tactile-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Public Card Page</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="tactile-btn-secondary py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#85818A]" />
                  <span>Share Profile</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[rgba(224,218,206,0.6)] flex items-center justify-between text-xs text-[#85818A]">
                <span>Also available as standard vCard file:</span>
                <button
                  type="button"
                  onClick={() => downloadVcfFile(profile)}
                  className="text-xs font-semibold text-[#8B80E8] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .vcf</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Field Modal */}
      <AddFieldModal
        isOpen={isAddFieldModalOpen}
        onClose={() => setIsAddFieldModalOpen(false)}
        onAddField={handleAddField}
        existingKeys={profile.fields.map((f) => f.key)}
      />

      {/* Live Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#FFFCF7] rounded-3xl shadow-2xl border border-[rgba(216,209,196,0.9)] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(224,218,206,0.6)]">
              <span className="text-sm font-bold text-[#30303B] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#8B80E8]" />
                <span>Digital Card Live Preview</span>
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-200/50 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-[#F5F2EB]">
              <div className="w-full max-w-xs">
                <div
                  className="w-full rounded-3xl overflow-hidden shadow-xl border text-center transition-all"
                  style={{
                    backgroundColor: selectedTheme.bgCard,
                    borderColor: selectedTheme.borderColor,
                    color: selectedTheme.textColor,
                  }}
                >
                  <div
                    className="w-full h-20 relative"
                    style={{ backgroundColor: profile.bannerColor || selectedTheme.accentColor }}
                  />

                  <div className="px-5 pb-6 relative -mt-10 flex flex-col items-center">
                    <div
                      className="w-20 h-20 rounded-full border-3 shadow-md overflow-hidden bg-white flex items-center justify-center text-base font-bold"
                      style={{ borderColor: selectedTheme.bgCard }}
                    >
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white"
                          style={{ backgroundColor: selectedTheme.accentColor }}
                        >
                          {profile.fullName
                            ? profile.fullName
                                .split(/\s+/)
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()
                            : 'QR'}
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-bold mt-2 leading-tight">
                      {profile.fullName || 'Alex Morgan'}
                    </h3>

                    {profile.phoneNumber && (
                      <p className="text-xs text-[#85818A] mt-0.5">
                        {profile.phoneNumber}
                      </p>
                    )}

                    <div className="w-full grid grid-cols-2 gap-2 mt-4">
                      <div
                        className="py-2 px-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-xs"
                        style={{ backgroundColor: selectedTheme.accentColor }}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </div>
                      <div
                        className="py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 shadow-xs"
                        style={{ borderColor: selectedTheme.borderColor }}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </div>
                    </div>

                    {profile.fields.some((f) => f.isVisible && f.value) && (
                      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4 pt-3 border-t w-full" style={{ borderColor: selectedTheme.borderColor }}>
                        {profile.fields
                          .filter((f) => f.isVisible && f.value)
                          .map((f) => (
                            <div
                              key={f.id}
                              className="w-8 h-8 rounded-xl border flex items-center justify-center shadow-2xs"
                              style={{
                                borderColor: selectedTheme.borderColor,
                                color: selectedTheme.accentColor,
                              }}
                              title={f.label}
                            >
                              {getPlatformIcon(f.key, 'w-4 h-4')}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[rgba(224,218,206,0.6)] bg-white flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="tactile-btn-primary px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
