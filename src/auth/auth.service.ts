import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private buildPayload(user: UserDocument): JwtPayload {
    return {
      sub: (user._id as unknown as string).toString(),
      email: user.email,
      name: user.name,
    };
  }

  private signAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: (this.configService.get<string>('jwt.accessExpiresIn') ?? '15m') as any,
    });
  }

  private signRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d') as any,
    });
  }

  private async issueTokens(
    user: UserDocument,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.buildPayload(user);
    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(
      (user._id as unknown as string).toString(),
      hashed,
    );
    return { accessToken, refreshToken };
  }

  /** Generate a random 6-digit numeric OTP */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /** Hash the OTP using bcrypt */
  private hashOtp(otp: string): Promise<string> {
    return bcrypt.hash(otp, 10);
  }

  // ─── Register ────────────────────────────────────────────────────────────────

  /**
   * Step 1: Create a new unverified account.
   * Returns userId so the client can proceed to OTP verification (step 2).
   */
  async register(dto: RegisterDto): Promise<{ userId: string; message: string }> {
    const email = (dto.email || '').trim().toLowerCase();
    const existing = await this.usersService.findByEmail(email);

    if (existing) {
      // If already registered but unverified, resend OTP instead of rejecting
      if (!existing.isEmailVerified) {
        await this.sendVerificationOtp(
          (existing._id as unknown as string).toString(),
          existing.email,
          existing.name,
        );
        return {
          userId: (existing._id as unknown as string).toString(),
          message: 'Account already exists. Verification code resent.',
        };
      }
      throw new ConflictException('An account with this email already exists');
    }

    // Derive a default name from the email local part
    const defaultName = email.split('@')[0];
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name: defaultName,
    });

    await this.sendVerificationOtp(
      (user._id as unknown as string).toString(),
      user.email,
      user.name,
    );

    return {
      userId: (user._id as unknown as string).toString(),
      message: 'Account created. Verification code sent to your email.',
    };
  }

  /** Internal: generate & send email verification OTP */
  private async sendVerificationOtp(
    userId: string,
    email: string,
    name: string,
  ): Promise<void> {
    const otp = this.generateOtp();
    const codeHash = await this.hashOtp(otp);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await this.usersService.setVerificationCode(userId, codeHash, expires);

    this.logger.log(`Generated verification OTP [${otp}] for ${email}`);

    // Send OTP email
    this.mailService.sendOtpEmail(email, name, otp, 'verify-email').catch((err) => {
      this.logger.error(`Failed to send verification OTP to ${email}: ${err?.message ?? err}`);
    });
  }

  // ─── Verify Email OTP ────────────────────────────────────────────────────────

  /**
   * Step 2: Verify the 6-digit OTP and activate the account.
   * Returns auth tokens so the client is logged in immediately after.
   */
  async verifyEmailOtp(
    userId: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserDocument }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    if (user.isEmailVerified) throw new BadRequestException('Email is already verified');

    if (
      !user.verificationCode ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      throw new BadRequestException('OTP code has expired. Please request a new one.');
    }

    const isValid = await bcrypt.compare(code.trim(), user.verificationCode);
    if (!isValid) throw new BadRequestException('Invalid OTP code');

    await this.usersService.activateAccount(userId);

    // Re-fetch to get clean document
    const activated = await this.usersService.findById(userId);
    const { accessToken, refreshToken } = await this.issueTokens(activated!);
    return { accessToken, refreshToken, user: activated! };
  }

  // ─── Resend OTP ──────────────────────────────────────────────────────────────

  async resendVerificationOtp(userId: string): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.isEmailVerified) throw new BadRequestException('Email is already verified');

    await this.sendVerificationOtp(
      (user._id as unknown as string).toString(),
      user.email,
      user.name,
    );
    return { message: 'Verification code resent.' };
  }

  // ─── Login ───────────────────────────────────────────────────────────────────

  /**
   * Login:
   * - If email is not verified → returns { requiresVerification: true, userId }
   *   and resends a fresh OTP automatically.
   * - Otherwise → returns full auth tokens.
   */
  async login(
    dto: LoginDto,
  ): Promise<
    | { accessToken: string; refreshToken: string; user: UserDocument }
    | { requiresVerification: true; userId: string }
  > {
    const email = (dto.email || '').trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // Account not yet verified → resend OTP and signal the client
    if (!user.isEmailVerified) {
      await this.sendVerificationOtp(
        (user._id as unknown as string).toString(),
        user.email,
        user.name,
      );
      return {
        requiresVerification: true,
        userId: (user._id as unknown as string).toString(),
      };
    }

    const { accessToken, refreshToken } = await this.issueTokens(user);
    return { accessToken, refreshToken, user };
  }

  // ─── Refresh Tokens ──────────────────────────────────────────────────────────

  async refreshTokens(userId: string, incomingRefreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException('Access denied');

    const isTokenValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
    if (!isTokenValid) throw new UnauthorizedException('Access denied');

    return this.issueTokens(user);
  }

  // ─── Logout ──────────────────────────────────────────────────────────────────

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  // ─── Forgot Password ─────────────────────────────────────────────────────────

  async forgotPassword(email: string): Promise<void> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await this.usersService.findByEmail(cleanEmail);
    if (!user) {
      this.logger.warn(`forgotPassword requested for non-existent email: "${cleanEmail}"`);
      return; // Don't reveal whether the email exists to prevent enumeration
    }

    const otp = this.generateOtp();
    const codeHash = await this.hashOtp(otp);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await this.usersService.setResetPasswordCode(
      (user._id as unknown as string).toString(),
      codeHash,
      expires,
    );

    this.logger.log(`Generated reset-password OTP [${otp}] for ${user.email}`);

    this.mailService.sendOtpEmail(user.email, user.name, otp, 'reset-password').catch((err) => {
      this.logger.error(`Failed to send reset-password OTP to ${user.email}: ${err?.message ?? err}`);
    });
  }

  // ─── Verify Reset OTP ────────────────────────────────────────────────────────

  /**
   * Verify the reset OTP, return a short-lived reset token.
   * The reset token is a JWT signed with the refresh secret, valid for 15 minutes.
   */
  async verifyResetOtp(
    email: string,
    code: string,
  ): Promise<{ resetToken: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await this.usersService.findByEmail(cleanEmail);
    if (!user) throw new BadRequestException('Invalid OTP');

    if (
      !user.resetPasswordCode ||
      !user.resetPasswordCodeExpires ||
      user.resetPasswordCodeExpires < new Date()
    ) {
      throw new BadRequestException('OTP code has expired. Please request a new one.');
    }

    const isValid = await bcrypt.compare(code.trim(), user.resetPasswordCode);
    if (!isValid) throw new BadRequestException('Invalid OTP code');

    // Issue a short-lived one-time reset token
    const resetToken = this.jwtService.sign(
      { sub: (user._id as unknown as string).toString(), purpose: 'reset-password' },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: '15m' as any,
      },
    );

    // Clear the OTP so it cannot be reused
    await this.usersService.setResetPasswordCode(
      (user._id as unknown as string).toString(),
      '',
      new Date(0),
    );

    return { resetToken };
  }

  // ─── Reset Password ──────────────────────────────────────────────────────────

  /**
   * Step 3 of forgot-password: reset the password and auto-login.
   */
  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserDocument }> {
    let payload: { sub: string; purpose: string };
    try {
      payload = this.jwtService.verify(resetToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (payload.purpose !== 'reset-password') {
      throw new BadRequestException('Invalid reset token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new BadRequestException('User not found');

    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    await user.save();

    // Auto-login after reset
    const { accessToken, refreshToken } = await this.issueTokens(user);
    return { accessToken, refreshToken, user };
  }

  // ─── Update Profile ──────────────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.usersService.updateProfile(userId, dto);
    if (!updated) throw new NotFoundException('User not found');
    return { user: updated };
  }

  // ─── Get Me ──────────────────────────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return { user };
  }

  // ─── Get Categories ────────────────────────────────────────────────────────
  async getCategories(): Promise<string[]> {
    const defaultCategories = [
      'Công nghệ thông tin',
      'Phát triển phần mềm',
      'Thiết kế UI/UX',
      'Thiết kế đồ họa',
      'Marketing & Truyền thông',
      'Sáng tạo nội dung',
      'Kinh doanh & Khởi nghiệp',
      'Nhiếp ảnh & Quay phim',
      'Trí tuệ nhân tạo (AI)',
      'Khoa học dữ liệu',
      'Giáo dục & Đào tạo',
      'Nghệ thuật & Âm nhạc',
      'Viết lách & Dịch thuật',
      'Thương mại điện tử',
      'Quản trị sản phẩm (PM)',
      'Tài chính & Đầu tư',
    ];

    try {
      const dbInterests = await this.usersService.getDistinctInterests();
      const allSet = new Set([...defaultCategories, ...(dbInterests || [])]);
      return Array.from(allSet).filter((c) => Boolean(c && typeof c === 'string' && c.trim().length > 0));
    } catch {
      return defaultCategories;
    }
  }
}

