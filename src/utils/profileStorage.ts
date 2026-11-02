import { VCardProfile, CardThemeId, DigitalCardTheme } from '../types/vcard';

export const DIGITAL_CARD_THEMES: DigitalCardTheme[] = [
  {
    id: 'minimal-white',
    name: 'Minimal White',
    bgPage: '#F8F9FA',
    bgCard: '#FFFFFF',
    textColor: '#1E293B',
    textMuted: '#64748B',
    accentColor: '#0F172A',
    borderColor: '#E2E8F0',
    buttonRadius: 'rounded-xl',
    styleVariant: 'minimal',
  },
  {
    id: 'soft-lavender',
    name: 'Soft Lavender',
    bgPage: '#F5F3FF',
    bgCard: '#FFFFFF',
    textColor: '#30303B',
    textMuted: '#6B7280',
    accentColor: '#8B80E8',
    borderColor: '#E0E7FF',
    buttonRadius: 'rounded-2xl',
    styleVariant: 'skeuomorphic',
  },
  {
    id: 'elegant-black',
    name: 'Elegant Black',
    bgPage: '#0F172A',
    bgCard: '#1E293B',
    textColor: '#F8FAFC',
    textMuted: '#94A3B8',
    accentColor: '#38BDF8',
    borderColor: '#334155',
    buttonRadius: 'rounded-xl',
    styleVariant: 'dark',
  },
  {
    id: 'warm-beige',
    name: 'Warm Beige',
    bgPage: '#F5F2EB',
    bgCard: '#FFFCF7',
    textColor: '#30303B',
    textMuted: '#85818A',
    accentColor: '#D97706',
    borderColor: '#E6E0D4',
    buttonRadius: 'rounded-2xl',
    styleVariant: 'skeuomorphic',
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    bgPage: '#F0F9FF',
    bgCard: '#FFFFFF',
    textColor: '#0C4A6E',
    textMuted: '#0369A1',
    accentColor: '#0284C7',
    borderColor: '#BAE6FD',
    buttonRadius: 'rounded-2xl',
    styleVariant: 'gradient',
  },
  {
    id: 'soft-skeuomorphic',
    name: 'Soft Skeuomorphic',
    bgPage: '#F4EFE6',
    bgCard: '#FFFDF9',
    textColor: '#2D2B32',
    textMuted: '#7D7885',
    accentColor: '#7C3AED',
    borderColor: '#DDD6C9',
    buttonRadius: 'rounded-2xl',
    styleVariant: 'skeuomorphic',
  },
];

const STORAGE_KEY = 'shape_qr_vcard_profiles';
const ACTIVE_PROFILE_KEY = 'shape_qr_active_profile_id';

/**
 * Generates a clean, unique, non-sequential slug ID for public profile URL
 */
export function generateUniqueProfileId(fullName: string = ''): string {
  const slug = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 16);

  const randPart = Math.random().toString(36).substring(2, 7);
  return slug ? `${slug}-${randPart}` : `profile-${randPart}`;
}

export const INITIAL_DEMO_PROFILE: VCardProfile = {
  id: 'alex-morgan-lead',
  fullName: 'Alex Morgan',
  phoneNumber: '+1 (555) 019-2834',
  jobTitle: 'Creative Director & Full-Stack Engineer',
  company: 'Shape Studio Inc.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
  bannerColor: '#8B80E8',
  themeId: 'soft-lavender',
  qrMode: 'interactive',
  fields: [
    {
      id: 'f_email',
      key: 'email',
      label: 'Email',
      category: 'Contact',
      type: 'email',
      value: 'alex.morgan@shapestudio.com',
      isVisible: true,
    },
    {
      id: 'f_instagram',
      key: 'instagram',
      label: 'Instagram',
      category: 'Social Media',
      type: 'url',
      value: '@alexmorgan.design',
      isVisible: true,
    },
    {
      id: 'f_github',
      key: 'github',
      label: 'GitHub',
      category: 'Social Media',
      type: 'url',
      value: 'alex-morgan',
      isVisible: true,
    },
    {
      id: 'f_linkedin',
      key: 'linkedin',
      label: 'LinkedIn',
      category: 'Social Media',
      type: 'url',
      value: 'alex-morgan-design',
      isVisible: true,
    },
    {
      id: 'f_website',
      key: 'website',
      label: 'Portfolio Website',
      category: 'Contact',
      type: 'url',
      value: 'https://alexmorgan.design',
      isVisible: true,
    },
    {
      id: 'f_whatsapp',
      key: 'whatsapp',
      label: 'WhatsApp',
      category: 'Contact',
      type: 'phone',
      value: '+15550192834',
      isVisible: true,
    },
  ],
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now(),
};

export const BLANK_PROFILE: VCardProfile = {
  id: '',
  fullName: '',
  phoneNumber: '',
  jobTitle: '',
  company: '',
  avatarUrl: null,
  bannerColor: '#8B80E8',
  themeId: 'soft-lavender',
  qrMode: 'interactive',
  fields: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Loads all saved profiles
 */
export function getAllProfiles(): Record<string, VCardProfile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading profiles from localStorage:', err);
  }
  return {};
}

/**
 * Retrieves a profile by unique ID from local memory/storage
 */
export function getProfileById(id: string): VCardProfile | null {
  const profiles = getAllProfiles();
  return profiles[id] || null;
}

const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Asynchronously fetches a profile from the server API or local cache.
 * Ensures anyone visiting /card/:id from any device can load the profile!
 */
export async function fetchProfileById(id: string): Promise<VCardProfile | null> {
  if (!id || typeof id !== 'string' || !SAFE_ID_PATTERN.test(id)) {
    return null;
  }

  // First check local storage
  const local = getProfileById(id);
  if (local && local.fullName && local.phoneNumber) {
    return local;
  }

  // Fetch from backend API
  try {
    const res = await fetch(`/api/profiles/${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.fullName) {
        // Cache locally for fast navigation
        const profiles = getAllProfiles();
        profiles[data.id] = data;
        saveProfilesToStorage(profiles);
        return data as VCardProfile;
      }
    }
  } catch (err) {
    console.error('Failed to fetch profile from server:', err);
  }

  return local || null;
}

/**
 * Saves a profile to local storage and syncs to backend API
 */
export async function saveProfile(profile: VCardProfile): Promise<VCardProfile> {
  const profileId =
    profile.id && SAFE_ID_PATTERN.test(profile.id)
      ? profile.id
      : generateUniqueProfileId(profile.fullName);

  const updated: VCardProfile = {
    ...profile,
    id: profileId,
    updatedAt: Date.now(),
    createdAt: profile.createdAt || Date.now(),
  };

  const profiles = getAllProfiles();
  profiles[profileId] = updated;
  saveProfilesToStorage(profiles);
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);

  // Sync with backend API
  try {
    await fetch(`/api/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  } catch (err) {
    console.error('Failed to sync profile to server:', err);
  }

  return updated;
}

/**
 * Persists QR code configuration directly into storage
 */
export async function saveQRCodeToDatabase(params: {
  id?: string;
  profileId?: string;
  text: string;
  templateId: string;
  config: any;
}): Promise<string | null> {
  try {
    const res = await fetch('/api/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      return data.id;
    }
  } catch (err) {
    console.error('Failed to save QR code:', err);
  }
  return null;
}

/**
 * Gets a fresh blank profile on reload/refresh.
 * "remove every data of v card if user refresh or reloads the app"
 */
export function getActiveProfile(): VCardProfile {
  return {
    ...BLANK_PROFILE,
    id: generateUniqueProfileId(),
  };
}

function saveProfilesToStorage(profiles: Record<string, VCardProfile>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to write profiles to localStorage', err);
  }
}
