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

  // ─── Auth State ────────────────────────────────────────────────────────────

  /** Hashed refresh token — null means logged out */
  @Prop({ type: String, default: null })
  refreshToken: string | null;

  /** Whether the email address has been verified via OTP */
  @Prop({ default: false })
  isEmailVerified: boolean;

  /** Whether the account is active (true after first OTP verification) */
  @Prop({ default: false })
  isActive: boolean;

  // ─── Email Verification OTP ────────────────────────────────────────────────

  @Prop()
  verificationCode?: string; // bcrypt-hashed 6-digit OTP

  @Prop()
  verificationCodeExpires?: Date;

  // ─── Password Reset OTP ────────────────────────────────────────────────────

  @Prop()
  resetPasswordCode?: string; // bcrypt-hashed 6-digit OTP

  @Prop()
  resetPasswordCodeExpires?: Date;

  // ─── Profile (optional — filled in step 3 of registration or profile page) ──

  @Prop({ type: String, trim: true })
  avatar?: string;

  @Prop({ type: String, trim: true })
  background?: string;

  @Prop({ type: Number })
  age?: number;

  @Prop({ type: String, trim: true })
  slogan?: string;

  @Prop({ type: String, trim: true })
  occupation?: string;

  @Prop({ type: [String], default: [] })
  interests?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Exclude all sensitive fields from JSON responses
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const res = ret as unknown as Record<string, unknown>;
    delete res.password;
    delete res.refreshToken;
    delete res.verificationCode;
    delete res.verificationCodeExpires;
    delete res.resetPasswordCode;
    delete res.resetPasswordCodeExpires;
    return res;
  },
});
