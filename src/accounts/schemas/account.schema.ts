import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccountDocument = Account & Document;

/**
 * Account — authentication data only.
 * NEVER expose sensitive fields (password, tokens, OTPs) in responses.
 */
@Schema({ timestamps: true, collection: 'accounts' })
export class Account {
  // ─── Identity ──────────────────────────────────────────────────────────────

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  /**
   * Public-facing username — unique identifier for URL routing.
   * Format: /^[a-z0-9][a-z0-9_-]{2,29}$/
   */
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  username: string;

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
}

export const AccountSchema = SchemaFactory.createForClass(Account);

// Exclude all sensitive fields from JSON responses
AccountSchema.set('toJSON', {
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
