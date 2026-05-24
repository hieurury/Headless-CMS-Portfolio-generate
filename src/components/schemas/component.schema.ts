import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ComponentDocument = ComponentDefinition & Document;

export enum ComponentCategory {
  LAYOUT = 'layout',
  CONTENT = 'content',
  MEDIA = 'media',
  NAVIGATION = 'navigation',
  FORM = 'form',
}

@Schema({ timestamps: true })
export class ComponentDefinition {
  /**
   * Unique machine-readable type identifier.
   * Used as the "type" field in page layout sections.
   * Examples: "hero", "navbar", "card-grid"
   */
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  type: string;

  /**
   * Human-readable display name
   */
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    type: String,
    enum: ComponentCategory,
    default: ComponentCategory.CONTENT,
  })
  category: ComponentCategory;

  /**
   * JSON Schema definition for the component's props.
   * Used by AI (future phases) to validate generated layouts.
   * Also used by the frontend (future phases) for visual editing.
   */
  @Prop({ type: Object, default: () => ({}) })
  schema: Record<string, unknown>;

  /**
   * Default prop values used when adding this component to a layout
   */
  @Prop({ type: Object, default: () => ({}) })
  defaultProps: Record<string, unknown>;

  /**
   * true = system-provided (cannot be deleted)
   * false = user-defined (can be managed)
   */
  @Prop({ default: false })
  isBuiltIn: boolean;

  @Prop({ default: '1.0.0' })
  version: string;
}

export const ComponentSchema = SchemaFactory.createForClass(ComponentDefinition);
