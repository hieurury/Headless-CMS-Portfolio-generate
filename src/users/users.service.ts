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

  async setVerificationToken(id: string, tokenHash: string, expires: Date) {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { verifyEmailTokenHash: tokenHash, verifyEmailExpires: expires },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async findByVerifyTokenHash(tokenHash: string) {
    return this.userModel
      .findOne({
        verifyEmailTokenHash: tokenHash,
        verifyEmailExpires: { $gt: new Date() },
      })
      .exec();
  }

  async setResetPasswordToken(id: string, tokenHash: string, expires: Date) {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { resetPasswordTokenHash: tokenHash, resetPasswordExpires: expires },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async findByResetTokenHash(tokenHash: string) {
    return this.userModel
      .findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();
  }

}
