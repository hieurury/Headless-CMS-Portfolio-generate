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

  /** Secure random token for the password-reset flow */
  @Prop({ type: String, default: null })
  resetPasswordToken: string | null;

  /** Expiry timestamp for the reset token (1-hour window) */
  @Prop({ type: Date, default: null })
  resetPasswordExpires: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Exclude sensitive fields from JSON responses by default
UserSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    return ret;
  },
});
