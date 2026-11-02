export type FieldType = 'url' | 'text' | 'email' | 'phone';

export type FieldCategory = 'Contact' | 'Social Media' | 'Professional' | 'Other';

export interface VCardField {
  id: string;
  key: string;
  label: string;
  category: FieldCategory;
  type: FieldType;
  value: string;
  isVisible: boolean;
  iconName?: string;
  placeholder?: string;
  prefixUrl?: string;
}

export type CardThemeId =
  | 'minimal-white'
  | 'soft-lavender'
  | 'elegant-black'
  | 'warm-beige'
  | 'ocean-blue'
  | 'soft-skeuomorphic';

export type VCardQRMode = 'interactive' | 'standard'; // Interactive Digital Card (Mode B) vs Standard vCard QR (Mode A)

export interface DigitalCardTheme {
  id: CardThemeId;
  name: string;
  bgPage: string;
  bgCard: string;
  textColor: string;
  textMuted: string;
  accentColor: string;
  borderColor: string;
  buttonRadius: 'rounded-xl' | 'rounded-2xl' | 'rounded-full';
  styleVariant: 'minimal' | 'skeuomorphic' | 'dark' | 'gradient';
}

export interface VCardProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  jobTitle?: string;
  company?: string;
  avatarUrl?: string | null;
  bannerColor?: string;
  themeId: CardThemeId;
  qrMode: VCardQRMode;
  fields: VCardField[];
  createdAt: number;
  updatedAt: number;
}
