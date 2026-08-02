import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum MEDIA_TYPE {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENTS = 'documents',
}

@Schema({ timestamps: true })
export class Media {
  /** Owner of this media file */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /** Virtual folder name for grouping (e.g. "Hero Images", "Avatars") */
  @Prop({ type: String, default: 'Uncategorized' })
  folder: string;

  @Prop({ required: true })
  filename: string;

  /** Cloudinary public_id — used for deletion */
  @Prop({ required: true })
  publicId: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true, enum: MEDIA_TYPE })
  type: MEDIA_TYPE;

  @Prop({ required: true })
  size: number;

  @Prop()
  width?: number;

  @Prop()
  height?: number;

  @Prop()
  duration?: number;
}

export type MediaDocument = Media & Document;
export const MediaSchema = SchemaFactory.createForClass(Media);
