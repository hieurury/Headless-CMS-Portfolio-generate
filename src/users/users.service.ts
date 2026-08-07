import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    if (!email) return null;
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  /** Store a hashed refresh token for the user (null to invalidate) */
  async updateRefreshToken(
    userId: string,
    hashedToken: string | null,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { refreshToken: hashedToken })
      .exec();
  }

  // ─── Email Verification OTP ─────────────────────────────────────────────────

  /** Store hashed verification OTP and expiry */
  async setVerificationCode(
    userId: string,
    codeHash: string,
    expires: Date,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        verificationCode: codeHash,
        verificationCodeExpires: expires,
      })
      .exec();
  }

  /** Find a user whose verification OTP hash matches and has not expired */
  async findByVerificationCode(codeHash: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        verificationCode: codeHash,
        verificationCodeExpires: { $gt: new Date() },
      })
      .exec();
  }

  /** Mark email as verified and activate the account, clear OTP */
  async activateAccount(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        isEmailVerified: true,
        isActive: true,
        verificationCode: undefined,
        verificationCodeExpires: undefined,
      })
      .exec();
  }

  // ─── Password Reset OTP ─────────────────────────────────────────────────────

  /** Store hashed reset OTP and expiry */
  async setResetPasswordCode(
    userId: string,
    codeHash: string,
    expires: Date,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        resetPasswordCode: codeHash,
        resetPasswordCodeExpires: expires,
      })
      .exec();
  }

  /** Find a user whose reset OTP hash matches and has not expired */
  async findByResetCode(codeHash: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        resetPasswordCode: codeHash,
        resetPasswordCodeExpires: { $gt: new Date() },
      })
      .exec();
  }

  // ─── Profile ────────────────────────────────────────────────────────────────

  /** Update optional profile fields */
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      avatar?: string;
      background?: string;
      age?: number;
      slogan?: string;
      occupation?: string;
      interests?: string[];
    },
  ): Promise<UserDocument | null> {
    // Filter out undefined values so we don't overwrite with undefined
    const update = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    return this.userModel
      .findByIdAndUpdate(userId, update, { returnDocument: 'after' })
      .exec();
  }

  /** Get all distinct interests across all users */
  async getDistinctInterests(): Promise<string[]> {
    return this.userModel.distinct('interests').exec();
  }
}

