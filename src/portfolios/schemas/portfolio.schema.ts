import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PortfolioDocument = Portfolio & Document;

/**
 * Canonical list of portfolio category keys.
 * - Min 1, Max 3 per portfolio.
 * - Default: ['technology']
 */
export const PORTFOLIO_CATEGORIES = [
  'technology',
  'design',
  'marketing',
  'photography',
  'music',
  'writing',
  'architecture',
  'education',
  'business',
  'finance',
  'healthcare',
  'legal',
  'engineering',
  'data_science',
  'art',
  'fashion',
  'hospitality',
  'sports',
  'real_estate',
  'media',
  'nonprofit',
  'gaming',
  'research',
] as const;

export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];

export class SeoMeta {
  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop()
  ogImage?: string;

  @Prop({ type: [String], default: [] })
  keywords?: string[];
}

export class AioMeta {
  @Prop()
  authorName?: string;

  @Prop()
  jobTitle?: string;

  @Prop()
  bio?: string;

  @Prop({ type: [String], default: [] })
  socialLinks?: string[];
}

/**
 * Color scheme for light or dark mode.
 * primary & secondary are the 2 main colors.
 * accents is an array of up to 5 accent colors.
 */
export class ColorScheme {
  @Prop({ default: '#6366f1' })
  primary: string;

  @Prop({ default: '#8b5cf6' })
  secondary: string;

  @Prop({ type: [String], default: [] })
  accents: string[];
}

/**
 * Colors config — separate palettes for light and dark modes.
 */
export class PortfolioColors {
  @Prop({
    type: ColorScheme,
    default: () => ({ primary: '#6366f1', secondary: '#8b5cf6', accents: [] }),
  })
  light: ColorScheme;

  @Prop({
    type: ColorScheme,
    default: () => ({ primary: '#818cf8', secondary: '#a78bfa', accents: [] }),
  })
  dark: ColorScheme;
}

/**
 * Font settings — a single main font for the system.
 */
export class PortfolioFonts {
  @Prop({ default: 'Inter' })
  main: string;
}

/**
 * Custom padding settings for the page layout (px values as strings).
 */
export class PageLayoutPadding {
  @Prop({ default: '0' })
  top: string;

  @Prop({ default: '24' })
  right: string;

  @Prop({ default: '0' })
  bottom: string;

  @Prop({ default: '24' })
  left: string;
}

/**
 * Page layout / margin settings.
 * - normal: page takes full frame width (no horizontal margin)
 * - fluid: page is constrained with side margins (similar to Bootstrap container-fluid)
 * - custom: user-defined padding on all 4 sides
 */
export class PageLayoutSettings {
  @Prop({ default: 'normal', enum: ['normal', 'fluid', 'custom'] })
  type: 'normal' | 'fluid' | 'custom';

  @Prop({
    type: PageLayoutPadding,
    default: () => ({ top: '0', right: '24', bottom: '0', left: '24' }),
  })
  padding: PageLayoutPadding;
}

export class PortfolioMeta {
  /** @deprecated Use colors.light.primary instead. Kept for backward compatibility. */
  @Prop({ default: '#6366f1' })
  primaryColor: string;

  /** @deprecated Use fonts.heading + fonts.body instead. Kept for backward compatibility. */
  @Prop({ default: 'Inter' })
  fontFamily: string;

  @Prop({ default: 'default' })
  theme: string;

  @Prop()
  icon?: string;

  @Prop({ type: SeoMeta, default: () => ({}) })
  seo?: SeoMeta;

  @Prop({ type: AioMeta, default: () => ({}) })
  aio?: AioMeta;

  /** Page layout / margin settings */
  @Prop({
    type: PageLayoutSettings,
    default: () => ({
      type: 'normal',
      padding: { top: '0', right: '24', bottom: '0', left: '24' },
    }),
  })
  pageLayout: PageLayoutSettings;

  /** Color palettes for light and dark modes */
  @Prop({
    type: PortfolioColors,
    default: () => ({
      light: { primary: '#6366f1', secondary: '#8b5cf6', accents: [] },
      dark: { primary: '#818cf8', secondary: '#a78bfa', accents: [] },
    }),
  })
  colors: PortfolioColors;

  /** Font family settings */
  @Prop({
    type: PortfolioFonts,
    default: () => ({ main: 'Inter' }),
  })
  fonts: PortfolioFonts;
}

@Schema({ timestamps: true })
export class Portfolio {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: PortfolioMeta, default: () => ({}) })
  meta: PortfolioMeta;

  /**
   * Industry/profession categories for this portfolio.
   * - Min: 1  Max: 3
   * - Default: ['technology']
   */
  @Prop({
    type: [String],
    enum: PORTFOLIO_CATEGORIES,
    default: ['technology'],
    validate: [
      { validator: (arr: string[]) => arr.length >= 1, message: 'At least 1 category is required' },
      { validator: (arr: string[]) => arr.length <= 3, message: 'At most 3 categories are allowed' },
    ],
  })
  categories: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Page' }], default: [] })
  pages: Types.ObjectId[];
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);

PortfolioSchema.index({ owner: 1, slug: 1 }, { unique: true });
