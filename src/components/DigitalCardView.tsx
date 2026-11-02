import React, { useState, useEffect } from 'react';
import { VCardProfile } from '../types/vcard';
import {
  DIGITAL_CARD_THEMES,
  fetchProfileById,
  getProfileById,
  INITIAL_DEMO_PROFILE,
} from '../utils/profileStorage';
import { getPlatformIcon, normalizeFieldValue } from '../utils/socialIcons';
import { downloadVcfFile } from '../utils/vcardFormatter';
import { getPublicCardUrl } from '../utils/urlHelper';
import DeveloperSignature from './DeveloperSignature';
import {
  Phone,
  UserCheck,
  Share2,
  Check,
  ExternalLink,
  QrCode,
  ArrowLeft,
  Mail,
  MapPin,
  Globe,
  Building,
  Briefcase,
  Loader2,
  AlertCircle,
  Plus,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

interface DigitalCardViewProps {
  profile?: VCardProfile;
  profileId?: string;
  onBackToStudio?: () => void;
  isStandalonePage?: boolean;
}

export const DigitalCardView: React.FC<DigitalCardViewProps> = ({
  profile: initialProfile,
  profileId,
  onBackToStudio,
  isStandalonePage = false,
}) => {
  const [currentProfile, setCurrentProfile] = useState<VCardProfile | null>(() => {
    if (initialProfile && initialProfile.fullName) return initialProfile;
    if (profileId) {
      const local = getProfileById(profileId);
      if (local && local.fullName) return local;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(!currentProfile && Boolean(profileId));
  const [notFound, setNotFound] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (profileId) {
      let isMounted = true;
      setIsLoading(true);
      fetchProfileById(profileId)
        .then((data) => {
          if (!isMounted) return;
          if (data && data.fullName) {
            setCurrentProfile(data);
            setNotFound(false);
          } else {
            setNotFound(true);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('Error loading digital card:', err);
          if (!currentProfile) {
            setNotFound(true);
          }
          setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    } else if (initialProfile) {
      setCurrentProfile(initialProfile);
      setIsLoading(false);
    }
  }, [profileId, initialProfile]);

  const activeProfile = currentProfile || INITIAL_DEMO_PROFILE;
  const theme =
    DIGITAL_CARD_THEMES.find((t) => t.id === activeProfile.themeId) || DIGITAL_CARD_THEMES[0];

  const visibleFields = (activeProfile.fields || []).filter(
    (f) => f.isVisible && f.value && f.value.trim().length > 0
  );

  // Extract designated contact channels for prominent buttons
  const emailField = visibleFields.find(
    (f) => f.key === 'email' || f.key === 'work_email' || f.type === 'email'
  );
  const whatsAppField = visibleFields.find((f) => f.key === 'whatsapp');
  const websiteField = visibleFields.find(
    (f) => f.key === 'website' || f.key === 'business_website' || f.key === 'portfolio'
  );
  const addressField = visibleFields.find(
    (f) => f.key === 'address' || f.key === 'office_address'
  );

  const socialFields = visibleFields.filter((f) => f.category === 'Social Media');
  const detailFields = visibleFields.filter((f) => f.category !== 'Social Media');

  const canonicalUrl = getPublicCardUrl(activeProfile.id);

  const handleShare = async () => {
    const shareData = {
      title: `${activeProfile.fullName} — Digital Business Card`,
      text: `Connect with ${activeProfile.fullName} on Shape QR`,
      url: canonicalUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleSaveContact = () => {
    downloadVcfFile(activeProfile);
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: theme.bgPage }}
      >
        <div className="w-full max-w-sm p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-[rgba(216,209,196,0.8)] shadow-2xl text-center space-y-4">
          <Loader2 className="w-9 h-9 text-[#8B80E8] animate-spin mx-auto" />
          <p className="text-base font-bold text-[#30303B]">Opening Digital Card...</p>
          <p className="text-xs text-[#85818A]">Retrieving verified digital business card</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#F5F2EB]">
        <div className="w-full max-w-sm p-8 bg-white rounded-3xl border border-[rgba(216,209,196,0.8)] shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#30303B]">Card Not Found</h2>
          <p className="text-xs text-[#85818A] leading-relaxed">
            This digital business card profile does not exist or may have expired.
          </p>
          <a
            href="/"
            className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md bg-[#30303B] text-white hover:bg-black transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your Free Digital Card</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 transition-colors duration-300"
      style={{ backgroundColor: theme.bgPage }}
    >
      {/* Top Bar with Branding & Quick Actions */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        {onBackToStudio && !isStandalonePage ? (
          <button
            type="button"
            onClick={onBackToStudio}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-white/80 backdrop-blur-sm border border-[rgba(216,209,196,0.7)] text-[#30303B] hover:bg-white shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio</span>
          </button>
        ) : (
          <a href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-7 h-7 rounded-xl bg-[#30303B] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <QrCode className="w-4 h-4 text-[#8B80E8]" />
            </div>
            <span className="text-xs font-extrabold tracking-tight text-[#30303B]">
              Shape QR
            </span>
          </a>
        )}

        <button
          type="button"
          onClick={handleShare}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-white/90 backdrop-blur-sm border border-[rgba(216,209,196,0.7)] text-[#30303B] hover:bg-white shadow-xs transition-all"
        >
          {copied || shareSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-[#85818A]" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Main Digital Business Card */}
      <div className="w-full max-w-md my-auto flex flex-col items-center">
        <div
          className="w-full rounded-3xl overflow-hidden shadow-2xl border transition-all"
          style={{
            backgroundColor: theme.bgCard,
            borderColor: theme.borderColor,
            color: theme.textColor,
          }}
        >
          {/* Top Banner */}
          <div
            className="w-full h-32 relative"
            style={{
              backgroundColor: activeProfile.bannerColor || theme.accentColor,
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.18) 100%)',
            }}
          >
            <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Verified Card</span>
            </div>
          </div>

          {/* Profile Identity Details */}
          <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="-mt-16 mb-3 relative">
              <div
                className="w-28 h-28 rounded-full border-4 shadow-xl overflow-hidden flex items-center justify-center"
                style={{
                  backgroundColor: theme.bgCard,
                  borderColor: theme.bgCard,
                }}
              >
                {activeProfile.avatarUrl ? (
                  <img
                    src={activeProfile.avatarUrl}
                    alt={activeProfile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    {activeProfile.fullName
                      ? activeProfile.fullName
                          .split(/\s+/)
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      : 'QR'}
                  </div>
                )}
              </div>
            </div>

            {/* Name, Title & Company */}
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ color: theme.textColor }}
            >
              {activeProfile.fullName || 'Alex Morgan'}
            </h1>

            {activeProfile.jobTitle && (
              <p
                className="text-sm font-semibold mt-1"
                style={{ color: theme.accentColor }}
              >
                {activeProfile.jobTitle}
              </p>
            )}

            {activeProfile.company && (
              <p
                className="text-xs flex items-center gap-1.5 mt-1 font-medium"
                style={{ color: theme.textMuted }}
              >
                <Building className="w-3.5 h-3.5" />
                <span>{activeProfile.company}</span>
              </p>
            )}

            {addressField && (
              <p
                className="text-xs flex items-center gap-1.5 mt-1"
                style={{ color: theme.textMuted }}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{addressField.value}</span>
              </p>
            )}

            {/* Direct Quick Action Buttons (Call, WhatsApp, Email, Website) */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
              {activeProfile.phoneNumber && (
                <a
                  href={`tel:${activeProfile.phoneNumber.replace(/[^\d+]/g, '')}`}
                  className="py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-transform active:scale-95 shadow-xs"
                  style={{
                    backgroundColor: theme.accentColor,
                    color: '#FFFFFF',
                  }}
                  title="Call Now"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </a>
              )}

              {whatsAppField && (
                <a
                  href={normalizeFieldValue('whatsapp', whatsAppField.value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-transform active:scale-95 shadow-xs bg-[#25D366] text-white"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}

              {emailField && (
                <a
                  href={`mailto:${emailField.value.replace(/^mailto:/i, '').trim()}`}
                  className="py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-transform active:scale-95 shadow-xs border"
                  style={{
                    backgroundColor: theme.styleVariant === 'dark' ? '#1E293B' : '#FFFFFF',
                    borderColor: theme.borderColor,
                    color: theme.textColor,
                  }}
                  title="Send Email"
                >
                  <Mail className="w-4 h-4 text-[#8B80E8]" />
                  <span>Email</span>
                </a>
              )}

              {websiteField && (
                <a
                  href={normalizeFieldValue('website', websiteField.value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-transform active:scale-95 shadow-xs border"
                  style={{
                    backgroundColor: theme.styleVariant === 'dark' ? '#1E293B' : '#FFFFFF',
                    borderColor: theme.borderColor,
                    color: theme.textColor,
                  }}
                  title="Visit Website"
                >
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Website</span>
                </a>
              )}
            </div>

            {/* Primary Action Button: Save Contact directly to phone address book */}
            <div className="w-full mt-3">
              <button
                type="button"
                onClick={handleSaveContact}
                className="w-full py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold transition-all active:scale-98 shadow-md cursor-pointer"
                style={{
                  backgroundColor: theme.accentColor,
                  color: '#FFFFFF',
                }}
              >
                <UserCheck className="w-5 h-5" />
                <span>Save Contact to Phone (.vcf)</span>
              </button>
            </div>

            {/* Social Media Platform Icons */}
            {socialFields.length > 0 && (
              <div
                className="w-full mt-6 pt-5 border-t border-dashed"
                style={{ borderColor: theme.borderColor }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block mb-3 text-center"
                  style={{ color: theme.textMuted }}
                >
                  Connect on Social Media
                </span>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {socialFields.map((field) => {
                    const normalizedUrl = normalizeFieldValue(field.key, field.value);
                    return (
                      <a
                        key={field.id}
                        href={normalizedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${field.label}`}
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs border hover:scale-110 transition-all active:scale-95 cursor-pointer"
                        style={{
                          backgroundColor:
                            theme.styleVariant === 'dark' ? '#1E293B' : '#FFFFFF',
                          borderColor: theme.borderColor,
                          color: theme.accentColor,
                        }}
                        title={field.label}
                      >
                        {getPlatformIcon(field.key, 'w-5 h-5')}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional Contact & Professional Information */}
            {detailFields.length > 0 && (
              <div
                className="w-full mt-5 pt-4 border-t space-y-2 text-left"
                style={{ borderColor: theme.borderColor }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block mb-2"
                  style={{ color: theme.textMuted }}
                >
                  Contact & Details
                </span>

                {detailFields.map((field) => {
                  const normalizedUrl =
                    field.type === 'url' || field.type === 'email' || field.type === 'phone'
                      ? normalizeFieldValue(field.key, field.value)
                      : null;

                  const isClickable = Boolean(normalizedUrl && normalizedUrl !== '#');

                  const itemContent = (
                    <div
                      className="p-3 rounded-2xl border flex items-center gap-3 transition-colors"
                      style={{
                        backgroundColor:
                          theme.styleVariant === 'dark' ? '#0F172A' : '#FAF8F4',
                        borderColor: theme.borderColor,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor:
                            theme.styleVariant === 'dark' ? '#1E293B' : '#FFFFFF',
                          color: theme.accentColor,
                        }}
                      >
                        {getPlatformIcon(field.key, 'w-4 h-4')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span
                          className="text-[10px] uppercase font-semibold block leading-tight"
                          style={{ color: theme.textMuted }}
                        >
                          {field.label}
                        </span>
                        <span
                          className="text-xs font-semibold block truncate mt-0.5"
                          style={{ color: theme.textColor }}
                        >
                          {field.value}
                        </span>
                      </div>

                      {isClickable && (
                        <ExternalLink
                          className="w-3.5 h-3.5 shrink-0 opacity-60"
                          style={{ color: theme.textMuted }}
                        />
                      )}
                    </div>
                  );

                  if (isClickable) {
                    return (
                      <a
                        key={field.id}
                        href={normalizedUrl!}
                        target={field.type === 'url' ? '_blank' : undefined}
                        rel={field.type === 'url' ? 'noopener noreferrer' : undefined}
                        className="block hover:opacity-90 transition-opacity"
                      >
                        {itemContent}
                      </a>
                    );
                  }

                  return <div key={field.id}>{itemContent}</div>;
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="w-full max-w-md mt-6 pt-4 text-center space-y-2 border-t border-[rgba(216,209,196,0.6)]">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#85818A] hover:text-[#30303B] transition-colors"
        >
          <span>Created with</span>
          <span className="font-extrabold text-[#30303B]">Shape QR</span>
          <span className="text-[10px] bg-[#30303B] text-white px-1.5 py-0.5 rounded-md font-bold">
            Create Free
          </span>
        </a>
        <div className="flex justify-center">
          <DeveloperSignature />
        </div>
      </div>
    </div>
  );
};
export default DigitalCardView;
