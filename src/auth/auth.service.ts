import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { mailService } from '../common/services/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private genToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    // send verification email (async, don't block registration)
    try {
      const token = this.genToken();
      const tokenHash = this.hashToken(token);
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      await this.usersService.setVerificationToken(
        user._id as any,
        tokenHash,
        expires,
      );
      const url = `${process.env.APP_URL}/verify-email?token=${token}`;
      const html = `<p>Hi ${user.name},</p><p>Please verify your email by clicking <a href="${url}">this link</a>.</p>`;
      await mailService.sendMail(user.email, 'Verify your email', html);
    } catch (err) {
      // log error but don't fail registration
    }

    const payload = {
      sub: (user._id as unknown as string).toString(),
      email: user.email,
      name: user.name,
    };

    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: (user._id as unknown as string).toString(),
      email: user.email,
      name: user.name,
    };

    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);
    const user = await this.usersService.findByVerifyTokenHash(tokenHash);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }
    user.isEmailVerified = true;
    user.verifyEmailTokenHash = undefined;
    user.verifyEmailExpires = undefined;
    await user.save();
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // do not reveal existence
      return;
    }
    const token = this.genToken();
    const tokenHash = this.hashToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.usersService.setResetPasswordToken(
      user._id as any,
      tokenHash,
      expires,
    );
    const url = `${process.env.APP_URL}/reset-password?token=${token}`;
    const html = `<p>Hi ${user.name},</p><p>Reset your password: <a href="${url}">Click here</a></p>`;
    await mailService.sendMail(user.email, 'Reset your password', html);
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);
    const user = await this.usersService.findByResetTokenHash(tokenHash);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }
    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return { success: true };
  }
}
