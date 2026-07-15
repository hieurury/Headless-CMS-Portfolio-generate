import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PageDocument = Page & Document;

/**
 * A section within a layout.
 * type maps to a Component Registry entry.
 * props are validated against that component's schema.
 * children enables nested/recursive sections.
 */
export class LayoutSection {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children: LayoutSection[];
}

export class PageLayout {
  sections: LayoutSection[];
}

// ─── Design Settings (page-level) ────────────────────────────────────────────

export class PageColorScheme {
  @Prop({ default: '#6366f1' })
  primary: string;

  @Prop({ default: '#8b5cf6' })
  secondary: string;

  @Prop({ type: [String], default: [] })
  accents: string[];
}

export class PageColors {
  @Prop({ type: PageColorScheme, default: () => ({ primary: '#6366f1', secondary: '#8b5cf6', accents: [] }) })
  light: PageColorScheme;

  @Prop({ type: PageColorScheme, default: () => ({ primary: '#818cf8', secondary: '#a78bfa', accents: [] }) })
  dark: PageColorScheme;
}

export class PageFonts {
  @Prop({ default: 'Inter' })
  main: string;
}

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

export class PageLayoutSettings {
  @Prop({ default: 'normal', enum: ['normal', 'fluid', 'custom'] })
  type: 'normal' | 'fluid' | 'custom';

  @Prop({ type: PageLayoutPadding, default: () => ({ top: '0', right: '24', bottom: '0', left: '24' }) })
  padding: PageLayoutPadding;
}

export class PageMeta {
  @Prop()
  icon?: string;

  /** Page layout / margin settings */
  @Prop({
    type: PageLayoutSettings,
    default: () => ({ type: 'normal', padding: { top: '0', right: '24', bottom: '0', left: '24' } }),
  })
  pageLayout?: PageLayoutSettings;

  /** Color palettes for light and dark modes */
  @Prop({
    type: PageColors,
    default: () => ({
      light: { primary: '#6366f1', secondary: '#8b5cf6', accents: [] },
      dark: { primary: '#818cf8', secondary: '#a78bfa', accents: [] },
    }),
  })
  colors?: PageColors;

  /** Font family settings */
  @Prop({
    type: PageFonts,
    default: () => ({ main: 'Inter' }),
  })
  fonts?: PageFonts;
}

@Schema({ timestamps: true })
export class Page {
  @Prop({ type: Types.ObjectId, ref: 'Portfolio', required: true, index: true })
  portfolio: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  /**
   * URL slug for this page, e.g. "/" for home, "/about", "/projects"
   */
  @Prop({ required: true, trim: true })
  slug: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: PageMeta, default: () => ({}) })
  meta?: PageMeta;

  /**
   * The JSON layout — the core runtime-renderable structure.
   * Stored as a flexible Mixed type to allow deep nesting.
   */
  @Prop({
    type: Object,
    default: () => ({ sections: [] }),
  })
  layout: PageLayout;
}

export const PageSchema = SchemaFactory.createForClass(Page);

// Unique slug per portfolio
PageSchema.index({ portfolio: 1, slug: 1 }, { unique: true });
