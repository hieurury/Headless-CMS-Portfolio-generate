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
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
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

  /** Store a reset token and its expiry on the user document */
  async setResetToken(
    userId: string,
    hashedToken: string,
    expires: Date,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expires,
      })
      .exec();
  }

  /** Find user by reset token (token NOT yet hashed — compared via bcrypt) */
  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();
  }

  /** Clear the reset token and expiry after a successful password reset */
  async clearResetToken(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .exec();
  }

  /** Update the user's hashed password */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { password: hashedPassword })
      .exec();
  }
}
