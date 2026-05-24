import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PortfolioDocument = Portfolio & Document;

export class PortfolioMeta {
  @Prop({ default: 'default' })
  theme: string;

  @Prop({ default: '#6366f1' })
  primaryColor: string;

  @Prop({ default: 'Inter' })
  fontFamily: string;
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

// Compound unique index: one slug per owner
PortfolioSchema.index({ owner: 1, slug: 1 }, { unique: true });
