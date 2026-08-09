import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountDocument } from './schemas/account.schema';
import { UserProfile, UserProfileDocument } from './schemas/user-profile.schema';

const USERNAME_REGEX = /^[a-z0-9][a-z0-9_-]{2,29}$/;

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(UserProfile.name) private profileModel: Model<UserProfileDocument>,
  ) {}

  // ─── Create ──────────────────────────────────────────────────────────────────

  /** Create Account + UserProfile atomically */
  async create(data: {
    email: string;
    password: string;
    username: string;
  }): Promise<{ account: AccountDocument; profile: UserProfileDocument }> {
    const account = new this.accountModel({
      email: data.email,
      password: data.password,
      username: data.username,
    });
    const savedAccount = await account.save();

    const profile = new this.profileModel({
      accountId: savedAccount._id,
      username: data.username,
      email: data.email,
    });
    const savedProfile = await profile.save();

    return { account: savedAccount, profile: savedProfile };
  }

  // ─── Lookup ──────────────────────────────────────────────────────────────────

  async findByEmail(email: string): Promise<AccountDocument | null> {
    if (!email) return null;
    return this.accountModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async findByIdentifier(identifier: string): Promise<AccountDocument | null> {
    if (!identifier) return null;
    const cleanId = identifier.trim().toLowerCase();
    // Try to find by email first, then username
    return this.accountModel.findOne({
      $or: [{ email: cleanId }, { username: cleanId }],
    }).exec();
  }

  async findById(id: string): Promise<AccountDocument | null> {
    return this.accountModel.findById(id).exec();
  }

  async findByUsername(username: string): Promise<AccountDocument | null> {
    if (!username) return null;
    return this.accountModel
      .findOne({ username: username.trim().toLowerCase() })
      .exec();
  }

  /** Get public profile by username — safe to return in API responses */
  async getPublicProfile(username: string): Promise<UserProfileDocument | null> {
    return this.profileModel
      .findOne({ username: username.trim().toLowerCase() })
      .exec();
  }

  /** Get profile by accountId */
  async getProfileByAccountId(accountId: string): Promise<UserProfileDocument | null> {
    return this.profileModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .exec();
  }

  // ─── Username availability ──────────────────────────────────────────────────

  /**
   * Check if a username is valid format and not taken.
   * Returns { available: true } or { available: false, reason: string }
   */
  async checkUsername(
    username: string,
    excludeAccountId?: string,
  ): Promise<{ available: boolean; reason?: string }> {
    if (!username) return { available: false, reason: 'Username is required' };

    if (!USERNAME_REGEX.test(username)) {
      return {
        available: false,
        reason:
          'Username must be 3–30 characters and contain only a-z, 0-9, - or _',
      };
    }

    const query: Record<string, unknown> = {
      username: username.toLowerCase(),
    };
    if (excludeAccountId) {
      query['accountId'] = { $ne: new Types.ObjectId(excludeAccountId) };
    }

    const existing = await this.profileModel.findOne(query).exec();
    if (existing) {
      return { available: false, reason: 'Username is already taken' };
    }

    return { available: true };
  }

  // ─── OTP Management ──────────────────────────────────────────────────────────

  async setVerificationCode(
    accountId: string,
    codeHash: string,
    expires: Date,
  ): Promise<void> {
    await this.accountModel
      .findByIdAndUpdate(accountId, {
        verificationCode: codeHash,
        verificationCodeExpires: expires,
      })
      .exec();
  }

  async activateAccount(accountId: string): Promise<void> {
    await this.accountModel
      .findByIdAndUpdate(accountId, {
        isEmailVerified: true,
        isActive: true,
        verificationCode: undefined,
        verificationCodeExpires: undefined,
      })
      .exec();
  }

  async setResetPasswordCode(
    accountId: string,
    codeHash: string,
    expires: Date,
  ): Promise<void> {
    await this.accountModel
      .findByIdAndUpdate(accountId, {
        resetPasswordCode: codeHash,
        resetPasswordCodeExpires: expires,
      })
      .exec();
  }

  // ─── Token Management ────────────────────────────────────────────────────────

  async updateRefreshToken(
    accountId: string,
    hashedToken: string | null,
  ): Promise<void> {
    await this.accountModel
      .findByIdAndUpdate(accountId, { refreshToken: hashedToken })
      .exec();
  }

  // ─── Profile Update ──────────────────────────────────────────────────────────

  async updateProfile(
    accountId: string,
    data: {
      username?: string;
      fullName?: string | null;
      avatar?: string;
      background?: string;
      age?: number;
      slogan?: string;
      occupation?: string;
      interests?: string[];
    },
  ): Promise<UserProfileDocument | null> {
    // If username is being changed, update Account too
    if (data.username) {
      const check = await this.checkUsername(data.username, accountId);
      if (!check.available) {
        throw new ConflictException(check.reason ?? 'Username is already taken');
      }
      await this.accountModel
        .findByIdAndUpdate(accountId, { username: data.username })
        .exec();
    }

    const update = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );

    return this.profileModel
      .findOneAndUpdate(
        { accountId: new Types.ObjectId(accountId) },
        update,
        { returnDocument: 'after' },
      )
      .exec();
  }

  // ─── Distinct interests ───────────────────────────────────────────────────────

  async getDistinctInterests(): Promise<string[]> {
    return this.profileModel.distinct('interests').exec();
  }
}
