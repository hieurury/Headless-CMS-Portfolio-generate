/**
 * Layout JSON types — mirror the backend Page schema.
 * These are the runtime contracts between CMS data and the renderer.
 */

export interface LayoutSection {
  id: string;
  type: string; // Maps to ComponentRegistry key (e.g. 'hero', 'navbar')
  name?: string; // Anchor/class name for scroll-link targeting (e.g. 'hero', 'about')
  props: Record<string, unknown>;
  children?: LayoutSection[]; // Nested sections support
}

export interface PageLayout {
  sections: LayoutSection[];
}

// ─── CMS Data Models ─────────────────────────────────────────────────────────

export interface SeoMeta {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
}

export interface AioMeta {
  authorName?: string;
  jobTitle?: string;
  bio?: string;
  socialLinks?: string[];
}

// ─── Design System Types ──────────────────────────────────────────────────────

/** A color palette for light or dark mode */
export interface ColorScheme {
  primary: string;
  secondary: string;
  accents: string[];
}

/** Combined color palettes for both modes */
export interface PortfolioColors {
  light: ColorScheme;
  dark: ColorScheme;
}

/** Font settings: a single font for the entire system */
export interface PortfolioFonts {
  main: string;
}

/** Page layout margin/padding settings */
export interface PageLayoutPadding {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export interface PageLayoutSettings {
  type: 'normal' | 'fluid' | 'custom';
  padding: PageLayoutPadding;
}

export interface PortfolioMeta {
  /** @deprecated Use colors.light.primary */
  primaryColor?: string;
  /** @deprecated Use fonts.heading or fonts.body */
  fontFamily?: string;
  theme?: string;
  icon?: string;
  seo?: SeoMeta;
  aio?: AioMeta;
  /** Page layout / margin settings */
  pageLayout?: PageLayoutSettings;
  /** Color palettes for light and dark modes */
  colors?: PortfolioColors;
  /** Font family settings */
  fonts?: PortfolioFonts;
}

// ─── Design System Constants ──────────────────────────────────────────────────

/** Available Google Fonts */
export const AVAILABLE_FONTS = [
  'Inter',
  'Roboto',
  'Poppins',
  'Lato',
  'Outfit',
  'Nunito',
  'Raleway',
  'Open Sans',
  'Source Sans Pro',
  'DM Sans',
  'Playfair Display',
  'Merriweather',
  'Lora',
  'EB Garamond',
  'Source Code Pro',
] as const;

export type AvailableFont = typeof AVAILABLE_FONTS[number];

/** Default design settings for a new portfolio */
export const DEFAULT_PORTFOLIO_SETTINGS: Required<Pick<PortfolioMeta, 'pageLayout' | 'colors' | 'fonts'>> = {
  pageLayout: {
    type: 'normal',
    padding: { top: '0', right: '24', bottom: '0', left: '24' },
  },
  colors: {
    light: { primary: '#6366f1', secondary: '#8b5cf6', accents: [] },
    dark: { primary: '#818cf8', secondary: '#a78bfa', accents: [] },
  },
  fonts: {
    main: 'Inter',
  },
};

export interface Portfolio {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  meta: PortfolioMeta;
  pages: Page[] | string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageMeta {
  icon?: string;
  /** Page layout / margin settings */
  pageLayout?: PageLayoutSettings;
  /** Color palettes for light and dark modes */
  colors?: PortfolioColors;
  /** Font family settings */
  fonts?: PortfolioFonts;
}

export interface Page {
  _id: string;
  portfolio: string;
  title: string;
  slug: string;
  order: number;
  isPublished: boolean;
  meta?: PageMeta;
  layout: PageLayout;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  isActive: boolean;
  avatar?: string;
  background?: string;
  age?: number;
  slogan?: string;
  occupation?: string;
  interests?: string[];
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** Returned by register endpoint before email verification */
export interface RegisterResponse {
  userId: string;
  message: string;
}

/** Returned by login when account is unverified */
export interface UnverifiedLoginResponse {
  requiresVerification: true;
  userId: string;
}
