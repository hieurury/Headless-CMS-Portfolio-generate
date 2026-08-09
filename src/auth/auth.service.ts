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
import { AccountsService } from '../accounts/accounts.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { AccountDocument } from '../accounts/schemas/account.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private buildPayload(account: AccountDocument): JwtPayload {
    return {
      sub: (account._id as unknown as string).toString(),
      email: account.email,
      username: account.username,
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
    account: AccountDocument,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.buildPayload(account);
    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.accountsService.updateRefreshToken(
      (account._id as unknown as string).toString(),
      hashed,
    );
    return { accessToken, refreshToken };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private hashOtp(otp: string): Promise<string> {
    return bcrypt.hash(otp, 10);
  }

  // ─── Register ────────────────────────────────────────────────────────────────

  /**
   * Step 1: Create a new unverified account with username.
   * Returns accountId so the client can proceed to OTP verification (step 2).
   */
  async register(dto: RegisterDto): Promise<{ accountId: string; message: string }> {
    const email = (dto.email || '').trim().toLowerCase();
    const username = (dto.username || '').trim().toLowerCase();

    // Check username availability first
    const usernameCheck = await this.accountsService.checkUsername(username);
    if (!usernameCheck.available) {
      throw new ConflictException(usernameCheck.reason ?? 'Username is already taken');
    }

    const existing = await this.accountsService.findByEmail(email);

    if (existing) {
      if (!existing.isEmailVerified) {
        // Resend OTP for unverified account
        await this.sendVerificationOtp(
          (existing._id as unknown as string).toString(),
          existing.email,
          existing.username,
        );
        return {
          accountId: (existing._id as unknown as string).toString(),
          message: 'Account already exists. Verification code resent.',
        };
      }
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const { account } = await this.accountsService.create({
      email,
      password: hashedPassword,
      username,
    });

    await this.sendVerificationOtp(
      (account._id as unknown as string).toString(),
      account.email,
      account.username,
    );

    return {
      accountId: (account._id as unknown as string).toString(),
      message: 'Account created. Verification code sent to your email.',
    };
  }

  private async sendVerificationOtp(
    accountId: string,
    email: string,
    username: string,
  ): Promise<void> {
    const otp = this.generateOtp();
    const codeHash = await this.hashOtp(otp);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await this.accountsService.setVerificationCode(accountId, codeHash, expires);

    this.logger.log(`Generated verification OTP [${otp}] for ${email}`);

    this.mailService.sendOtpEmail(email, username, otp, 'verify-email').catch((err) => {
      this.logger.error(`Failed to send verification OTP to ${email}: ${err?.message ?? err}`);
    });
  }

  // ─── Verify Email OTP ────────────────────────────────────────────────────────

  async verifyEmailOtp(
    accountId: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string; account: AccountDocument }> {
    const account = await this.accountsService.findById(accountId);
    if (!account) throw new BadRequestException('Account not found');
    if (account.isEmailVerified) throw new BadRequestException('Email is already verified');

    if (
      !account.verificationCode ||
      !account.verificationCodeExpires ||
      account.verificationCodeExpires < new Date()
    ) {
      throw new BadRequestException('OTP code has expired. Please request a new one.');
    }

    const isValid = await bcrypt.compare(code.trim(), account.verificationCode);
    if (!isValid) throw new BadRequestException('Invalid OTP code');

    await this.accountsService.activateAccount(accountId);

    const activated = await this.accountsService.findById(accountId);
    const { accessToken, refreshToken } = await this.issueTokens(activated!);
    return { accessToken, refreshToken, account: activated! };
  }

  // ─── Resend OTP ──────────────────────────────────────────────────────────────

  async resendVerificationOtp(accountId: string): Promise<{ message: string }> {
    const account = await this.accountsService.findById(accountId);
    if (!account) throw new NotFoundException('Account not found');
    if (account.isEmailVerified) throw new BadRequestException('Email is already verified');

    await this.sendVerificationOtp(
      (account._id as unknown as string).toString(),
      account.email,
      account.username,
    );
    return { message: 'Verification code resent.' };
  }

  // ─── Login ───────────────────────────────────────────────────────────────────

  async login(
    dto: LoginDto,
  ): Promise<
    | { accessToken: string; refreshToken: string; account: AccountDocument }
    | { requiresVerification: true; accountId: string }
  > {
    const identifier = (dto.email || '').trim().toLowerCase();
    const account = await this.accountsService.findByIdentifier(identifier);
    if (!account) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, account.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    if (!account.isEmailVerified) {
      await this.sendVerificationOtp(
        (account._id as unknown as string).toString(),
        account.email,
        account.username,
      );
      return {
        requiresVerification: true,
        accountId: (account._id as unknown as string).toString(),
      };
    }

    const { accessToken, refreshToken } = await this.issueTokens(account);
    return { accessToken, refreshToken, account };
  }

  // ─── Refresh Tokens ──────────────────────────────────────────────────────────

  async refreshTokens(accountId: string, incomingRefreshToken: string) {
    const account = await this.accountsService.findById(accountId);
    if (!account || !account.refreshToken) throw new UnauthorizedException('Access denied');

    const isTokenValid = await bcrypt.compare(incomingRefreshToken, account.refreshToken);
    if (!isTokenValid) throw new UnauthorizedException('Access denied');

    return this.issueTokens(account);
  }

  // ─── Logout ──────────────────────────────────────────────────────────────────

  async logout(accountId: string): Promise<void> {
    await this.accountsService.updateRefreshToken(accountId, null);
  }

  // ─── Forgot Password ─────────────────────────────────────────────────────────

  async forgotPassword(email: string): Promise<void> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const account = await this.accountsService.findByEmail(cleanEmail);
    if (!account) {
      this.logger.warn(`forgotPassword requested for non-existent email: "${cleanEmail}"`);
      return;
    }

    const otp = this.generateOtp();
    const codeHash = await this.hashOtp(otp);
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await this.accountsService.setResetPasswordCode(
      (account._id as unknown as string).toString(),
      codeHash,
      expires,
    );

    this.logger.log(`Generated reset-password OTP [${otp}] for ${account.email}`);

    this.mailService.sendOtpEmail(account.email, account.username, otp, 'reset-password').catch((err) => {
      this.logger.error(`Failed to send reset-password OTP to ${account.email}: ${err?.message ?? err}`);
    });
  }

  // ─── Verify Reset OTP ────────────────────────────────────────────────────────

  async verifyResetOtp(
    email: string,
    code: string,
  ): Promise<{ resetToken: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const account = await this.accountsService.findByEmail(cleanEmail);
    if (!account) throw new BadRequestException('Invalid OTP');

    if (
      !account.resetPasswordCode ||
      !account.resetPasswordCodeExpires ||
      account.resetPasswordCodeExpires < new Date()
    ) {
      throw new BadRequestException('OTP code has expired. Please request a new one.');
    }

    const isValid = await bcrypt.compare(code.trim(), account.resetPasswordCode);
    if (!isValid) throw new BadRequestException('Invalid OTP code');

    const resetToken = this.jwtService.sign(
      { sub: (account._id as unknown as string).toString(), purpose: 'reset-password' },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: '15m' as any,
      },
    );

    await this.accountsService.setResetPasswordCode(
      (account._id as unknown as string).toString(),
      '',
      new Date(0),
    );

    return { resetToken };
  }

  // ─── Reset Password ──────────────────────────────────────────────────────────

  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<{ accessToken: string; refreshToken: string; account: AccountDocument }> {
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

    const account = await this.accountsService.findById(payload.sub);
    if (!account) throw new BadRequestException('Account not found');

    const hashed = await bcrypt.hash(newPassword, 12);
    account.password = hashed;
    account.resetPasswordCode = undefined;
    account.resetPasswordCodeExpires = undefined;
    await account.save();

    const { accessToken, refreshToken } = await this.issueTokens(account);
    return { accessToken, refreshToken, account };
  }

  // ─── Update Profile ──────────────────────────────────────────────────────────

  async updateProfile(accountId: string, dto: UpdateProfileDto) {
    const updated = await this.accountsService.updateProfile(accountId, dto);
    if (!updated) throw new NotFoundException('Profile not found');

    // Return merged account + profile for frontend
    const account = await this.accountsService.findById(accountId);
    return { user: this.mergeAccountProfile(account!, updated) };
  }

  // ─── Get Me ──────────────────────────────────────────────────────────────────

  async getMe(accountId: string) {
    const account = await this.accountsService.findById(accountId);
    if (!account) throw new NotFoundException('Account not found');

    const profile = await this.accountsService.getProfileByAccountId(accountId);

    return { user: this.mergeAccountProfile(account, profile!) };
  }

  // ─── Check Username ──────────────────────────────────────────────────────────

  async checkUsername(username: string, excludeAccountId?: string) {
    return this.accountsService.checkUsername(username, excludeAccountId);
  }

  // ─── Helper: merge account + profile into single user object ─────────────────

  private mergeAccountProfile(account: AccountDocument, profile: any) {
    return {
      _id: (account._id as unknown as string).toString(),
      email: account.email,
      username: account.username,
      isEmailVerified: account.isEmailVerified,
      isActive: account.isActive,
      fullName: profile?.fullName ?? null,
      avatar: profile?.avatar ?? null,
      background: profile?.background ?? null,
      age: profile?.age ?? null,
      slogan: profile?.slogan ?? null,
      occupation: profile?.occupation ?? null,
      interests: profile?.interests ?? [],
    };
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
      const dbInterests = await this.accountsService.getDistinctInterests();
      const allSet = new Set([...defaultCategories, ...(dbInterests || [])]);
      return Array.from(allSet).filter((c) => Boolean(c && typeof c === 'string' && c.trim().length > 0));
    } catch {
      return defaultCategories;
    }
  }
}
