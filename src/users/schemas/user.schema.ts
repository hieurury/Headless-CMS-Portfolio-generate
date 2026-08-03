import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  name: string;

  /** Hashed refresh token — null means logged out */
  @Prop({ type: String, default: null })
  refreshToken: string | null;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  verifyEmailTokenHash?: string;

  @Prop()
  verifyEmailExpires?: Date;

  @Prop()
  resetPasswordTokenHash?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Exclude sensitive fields from JSON responses by default
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const res = ret as unknown as Record<string, unknown>;
    delete res.password;
    delete res.refreshToken;
    delete res.resetPasswordTokenHash;
    delete res.resetPasswordExpires;
    delete res.verifyEmailTokenHash;
    delete res.verifyEmailExpires;
    return res;
  },
});
