export type QRTemplateId =
  // Professional
  | 'monochrome'
  | 'executive-dots'
  | 'corporate-squircle'
  // Fun Shapes
  | 'heart'
  | 'pizza'
  | 'star'
  | 'flower'
  | 'donut'
  | 'cloud'
  | 'diamond'
  | 'shield'
  | 'burger'
  | 'coffee'
  | 'hexagon'
  | 'circle';

export type StudioMode = 'professional' | 'fun';

export type ModuleStyle = 'dots' | 'rounded' | 'squircle' | 'theme-native';
export type EyeStyle = 'rounded' | 'square' | 'concentric' | 'theme-native';
export type DepthLevel = 'subtle' | 'natural' | 'deep';

export interface QRConfig {
  text: string;
  templateId: QRTemplateId;
  studioMode: StudioMode;
  moduleStyle: ModuleStyle;
  eyeStyle: EyeStyle;
  primaryColor: string;
  bgColor: string;
  accentColor: string;
  depth: DepthLevel;
  cornerSmoothing: number; // 0 to 32
  quietZone: number; // 12 to 36
  centerBadge: string | null;
  centerLogo?: string | null;
  centerLogoShape?: 'circle' | 'square' | 'rounded';
  title: string;
  subtitle: string;
}

export interface QRTemplatePreset {
  id: QRTemplateId;
  name: string;
  category: 'Professional' | 'Fun Shapes';
  tagline: string;
  description: string;
  defaultConfig: Partial<QRConfig>;
  badgeLabel: string;
}

// Professional B&W Presets
export const PROFESSIONAL_PRESETS: QRTemplatePreset[] = [
  {
    id: 'monochrome',
    name: 'Executive Minimalist',
    category: 'Professional',
    tagline: 'High-contrast black & white square',
    description: 'Crisp corporate architecture for business cards, resumes, LinkedIn, and packaging.',
    badgeLabel: 'Executive',
    defaultConfig: {
      templateId: 'monochrome',
      studioMode: 'professional',
      primaryColor: '#000000',
      bgColor: '#FFFFFF',
      accentColor: '#1A1A1A',
      moduleStyle: 'squircle',
      eyeStyle: 'rounded',
      depth: 'subtle',
      cornerSmoothing: 20,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'corporate-squircle',
    name: 'Modern Precision',
    category: 'Professional',
    tagline: 'Rounded executive squircle',
    description: 'Architectural rounded modules for tech founders, portfolios, and luxury brand tags.',
    badgeLabel: 'Modern',
    defaultConfig: {
      templateId: 'corporate-squircle',
      studioMode: 'professional',
      primaryColor: '#000000',
      bgColor: '#FFFFFF',
      accentColor: '#333333',
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      depth: 'subtle',
      cornerSmoothing: 28,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'executive-dots',
    name: 'Dot Matrix Precision',
    category: 'Professional',
    tagline: 'Circular micro-dot matrix',
    description: 'Clean typographic circular dots on pure white for enterprise badges and conference passes.',
    badgeLabel: 'Minimal Dots',
    defaultConfig: {
      templateId: 'executive-dots',
      studioMode: 'professional',
      primaryColor: '#000000',
      bgColor: '#FFFFFF',
      accentColor: '#222222',
      moduleStyle: 'dots',
      eyeStyle: 'square',
      depth: 'subtle',
      cornerSmoothing: 16,
      quietZone: 18,
      centerBadge: null,
    },
  },
];

// Fun Shapes Presets (Rich variety of sculpted silhouettes)
export const FUN_SHAPE_PRESETS: QRTemplatePreset[] = [
  {
    id: 'heart',
    name: 'Heart Silhouette',
    category: 'Fun Shapes',
    tagline: 'Entire QR sculpted as a Heart',
    description: 'Data modules fill an authentic heart silhouette with rotated diamond finder patterns.',
    badgeLabel: 'Heart QR',
    defaultConfig: {
      templateId: 'heart',
      studioMode: 'fun',
      primaryColor: '#E31B23',
      bgColor: '#FFFFFF',
      accentColor: '#FF6B7A',
      moduleStyle: 'squircle',
      eyeStyle: 'theme-native',
      depth: 'natural',
      cornerSmoothing: 28,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'pizza',
    name: 'Pizza Slice',
    category: 'Fun Shapes',
    tagline: 'Entire QR as a Wood-Fired Slice',
    description: 'Triangular pizza wedge with baked crust arc, melted cheese, and pepperoni modules.',
    badgeLabel: 'Pizza QR',
    defaultConfig: {
      templateId: 'pizza',
      studioMode: 'fun',
      primaryColor: '#B8281B',
      bgColor: '#FFF5D6',
      accentColor: '#D3832B',
      moduleStyle: 'theme-native',
      eyeStyle: 'theme-native',
      depth: 'natural',
      cornerSmoothing: 24,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'star',
    name: 'Celestial Star',
    category: 'Fun Shapes',
    tagline: 'Entire QR as a 5-Point Star',
    description: 'Sculpted star silhouette with golden gleam for VIP clubs, awards, and celebrations.',
    badgeLabel: 'Star QR',
    defaultConfig: {
      templateId: 'star',
      studioMode: 'fun',
      primaryColor: '#D97706',
      bgColor: '#FFFBEB',
      accentColor: '#F59E0B',
      moduleStyle: 'squircle',
      eyeStyle: 'rounded',
      depth: 'natural',
      cornerSmoothing: 24,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'flower',
    name: 'Blooming Flower',
    category: 'Fun Shapes',
    tagline: 'Entire QR as an 8-Petal Daisy',
    description: 'Organic scalloped flower silhouette with botanical seed modules for florists and eco events.',
    badgeLabel: 'Flower QR',
    defaultConfig: {
      templateId: 'flower',
      studioMode: 'fun',
      primaryColor: '#3E3447',
      bgColor: '#FDF7F3',
      accentColor: '#8EBA9F',
      moduleStyle: 'rounded',
      eyeStyle: 'theme-native',
      depth: 'natural',
      cornerSmoothing: 28,
      quietZone: 20,
      centerBadge: null,
    },
  },
  {
    id: 'donut',
    name: 'Glazed Donut',
    category: 'Fun Shapes',
    tagline: 'Entire QR as a Dripped Donut',
    description: 'Circular donut silhouette with wavy strawberry frosting and rainbow sprinkles.',
    badgeLabel: 'Donut QR',
    defaultConfig: {
      templateId: 'donut',
      studioMode: 'fun',
      primaryColor: '#5C2D3E',
      bgColor: '#FFF4F7',
      accentColor: '#F48E9F',
      moduleStyle: 'theme-native',
      eyeStyle: 'rounded',
      depth: 'natural',
      cornerSmoothing: 28,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'cloud',
    name: 'Fluffy Cloud',
    category: 'Fun Shapes',
    tagline: 'Entire QR as a Puffy Cloud',
    description: 'Curved cloud bubbles for cloud software, weather, dreams, and creative kids branding.',
    badgeLabel: 'Cloud QR',
    defaultConfig: {
      templateId: 'cloud',
      studioMode: 'fun',
      primaryColor: '#2563EB',
      bgColor: '#F0F9FF',
      accentColor: '#60A5FA',
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      depth: 'natural',
      cornerSmoothing: 30,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'shield',
    name: 'Heraldic Shield',
    category: 'Fun Shapes',
    tagline: 'Entire QR as a Crest Shield',
    description: 'Embossed knight shield silhouette for security, verification, sports, and guilds.',
    badgeLabel: 'Shield QR',
    defaultConfig: {
      templateId: 'shield',
      studioMode: 'fun',
      primaryColor: '#1E3A8A',
      bgColor: '#F8FAFC',
      accentColor: '#3B82F6',
      moduleStyle: 'squircle',
      eyeStyle: 'square',
      depth: 'natural',
      cornerSmoothing: 22,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'diamond',
    name: 'Gem Diamond',
    category: 'Fun Shapes',
    tagline: 'Entire QR as a Faceted Gem',
    description: 'Sharp diamond jewel silhouette for jewelry, luxury goods, and premium memberships.',
    badgeLabel: 'Diamond QR',
    defaultConfig: {
      templateId: 'diamond',
      studioMode: 'fun',
      primaryColor: '#7C3AED',
      bgColor: '#FAF5FF',
      accentColor: '#A855F7',
      moduleStyle: 'squircle',
      eyeStyle: 'theme-native',
      depth: 'natural',
      cornerSmoothing: 20,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'burger',
    name: 'Brioche Burger',
    category: 'Fun Shapes',
    tagline: 'Entire QR as a Sesame Burger',
    description: 'Domed bun and layered burger silhouette for restaurants and culinary brands.',
    badgeLabel: 'Burger QR',
    defaultConfig: {
      templateId: 'burger',
      studioMode: 'fun',
      primaryColor: '#3E2A1E',
      bgColor: '#FFF9EA',
      accentColor: '#DE8B2D',
      moduleStyle: 'rounded',
      eyeStyle: 'theme-native',
      depth: 'natural',
      cornerSmoothing: 24,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'coffee',
    name: 'Ceramic Mug',
    category: 'Fun Shapes',
    tagline: 'Entire QR as a Coffee Mug',
    description: 'Ceramic coffee cup complete with side handle and espresso crema modules.',
    badgeLabel: 'Coffee QR',
    defaultConfig: {
      templateId: 'coffee',
      studioMode: 'fun',
      primaryColor: '#3D2817',
      bgColor: '#FFFDF9',
      accentColor: '#C89355',
      moduleStyle: 'squircle',
      eyeStyle: 'rounded',
      depth: 'natural',
      cornerSmoothing: 22,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'hexagon',
    name: 'Honeycomb Hexagon',
    category: 'Fun Shapes',
    tagline: 'Entire QR as a Modern Hexagon',
    description: 'Six-sided geometric polygon silhouette for crypto, biology, and gaming.',
    badgeLabel: 'Hexagon QR',
    defaultConfig: {
      templateId: 'hexagon',
      studioMode: 'fun',
      primaryColor: '#0F766E',
      bgColor: '#F0FDFA',
      accentColor: '#14B8A6',
      moduleStyle: 'squircle',
      eyeStyle: 'rounded',
      depth: 'natural',
      cornerSmoothing: 20,
      quietZone: 18,
      centerBadge: null,
    },
  },
  {
    id: 'circle',
    name: 'Circular Coin',
    category: 'Fun Shapes',
    tagline: 'Entire QR as a Circle Medallion',
    description: 'Circular medallion disc with smooth rounded perimeter.',
    badgeLabel: 'Circle QR',
    defaultConfig: {
      templateId: 'circle',
      studioMode: 'fun',
      primaryColor: '#30303B',
      bgColor: '#FFFFFF',
      accentColor: '#8B80E8',
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      depth: 'natural',
      cornerSmoothing: 28,
      quietZone: 18,
      centerBadge: null,
    },
  },
];

export const TEMPLATE_PRESETS: QRTemplatePreset[] = [
  ...PROFESSIONAL_PRESETS,
  ...FUN_SHAPE_PRESETS,
];
