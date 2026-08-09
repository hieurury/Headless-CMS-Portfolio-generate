import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserProfileDocument = UserProfile & Document;

/**
 * UserProfile — public-facing profile information.
 * Safe to return in API responses (no auth data).
 * email is intentionally public per product requirements.
 */
@Schema({ timestamps: true, collection: 'user_profiles' })
export class UserProfile {
  // ─── Link to Account ───────────────────────────────────────────────────────

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, unique: true, index: true })
  accountId: Types.ObjectId;

  /**
   * Mirror of Account.username — kept here for fast public queries
   * without needing to join Account collection.
   * Must stay in sync with Account.username.
   */
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  username: string;

  /**
   * Public email — intentionally exposed in profile.
   * Mirror of Account.email for public display.
   */
  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  // ─── Profile (optional) ────────────────────────────────────────────────────

  /** Full display name — optional, no uniqueness constraint */
  @Prop({ type: String, trim: true, default: null })
  fullName?: string | null;

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

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
