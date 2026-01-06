
export interface SlideData {
  title: string;
  content: string;
  imageUrl?: string;
}

export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9';
export type SlideLayout = 'centered' | 'top-text' | 'bottom-text' | 'side-by-side' | 'minimal' | 'quote' | 'impact';
export type TextEffect = 'none' | 'neon' | 'metallic' | 'shadow' | 'glow' | 'outline' | '3d' | 'glitch' | 'fire' | 'water' | 'pixel' | 'glass' | 'floating' | 'gradient';

export interface CarouselTheme {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  secondaryColor: string;
  fontFamily: string;
  pattern?: string;
}

export interface BrandingProfile {
  handle: string;
  logoUrl?: string;
  photoUrl?: string;
  type: 'personal' | 'company';
}

export interface GenerationSettings {
  topic: string;
  tone: Tone;
  slideCount: number;
  sourceUrl?: string;
  referenceImageUrls: string[];
  keyMessages: string[];
  profileType: 'personal' | 'company';
  layout: SlideLayout;
  textEffect: TextEffect;
  titleColor?: string;
}

export type Tone = 'Edukacyjny' | 'Ekscytujący' | 'Profesjonalny' | 'Opowieść' | 'Bezpośredni';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface BackgroundSettings {
  patternId: string;
  overlayColor: 'white' | 'black' | 'grey' | 'none';
  overlayOpacity: number;
  fadingCorner: boolean;
}

export interface Project {
  id: string;
  name: string;
  timestamp: number;
  slides: SlideData[];
  theme: CarouselTheme;
  aspectRatio: AspectRatio;
  slideLayout: SlideLayout;
  textEffect: TextEffect;
  overlayImageUrl: string;
  titleColor: string;
  bgSettings: BackgroundSettings;
  clnLinks: string[];
  keyMessages: string[];
  activeProfileType: 'personal' | 'company';
  personalProfile: BrandingProfile;
  companyProfile: BrandingProfile;
}
