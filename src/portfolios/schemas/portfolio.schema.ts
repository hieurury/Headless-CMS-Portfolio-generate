import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PortfolioDocument = Portfolio & Document;

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

export class PortfolioMeta {
  @Prop({ default: 'default' })
  theme: string;

  @Prop({ default: '#6366f1' })
  primaryColor: string;

  @Prop({ default: 'Inter' })
  fontFamily: string;

  @Prop()
  icon?: string;

  @Prop({ type: SeoMeta, default: () => ({}) })
  seo?: SeoMeta;

  @Prop({ type: AioMeta, default: () => ({}) })
  aio?: AioMeta;
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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Page' }], default: [] })
  pages: Types.ObjectId[];
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);

PortfolioSchema.index({ owner: 1, slug: 1 }, { unique: true });
