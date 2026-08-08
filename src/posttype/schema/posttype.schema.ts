import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class FieldDefinition {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  label: string;

  @Prop({ type: [String] })
  options?: string[];
}
const FieldDefinitionSchema = SchemaFactory.createForClass(FieldDefinition);

@Schema({
  timestamps: true,
})
export class Posttype extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: [FieldDefinitionSchema], default: [] })
  customFieldsSchema: FieldDefinition[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  authorId: string;
}

export const PosttypeSchema = SchemaFactory.createForClass(Posttype);
