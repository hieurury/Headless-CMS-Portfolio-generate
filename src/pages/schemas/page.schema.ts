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
