import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from './mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
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

  /** Generate tokens, hash + persist the refresh token, return both tokens */
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

  // ─── Public Methods ─────────────────────────────────────────────────────────

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

    const { accessToken, refreshToken } = await this.issueTokens(user);
    return { user, accessToken, refreshToken };
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

    const { accessToken, refreshToken } = await this.issueTokens(user);
    return { user, accessToken, refreshToken };
  }

  /**
   * Validate the provided refresh token, then issue a fresh token pair.
   * The old refresh token is invalidated (rotated).
   */
  async refreshTokens(userId: string, incomingRefreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isTokenValid = await bcrypt.compare(
      incomingRefreshToken,
      user.refreshToken,
    );
    if (!isTokenValid) {
      throw new UnauthorizedException('Access denied');
    }

    const { accessToken, refreshToken } = await this.issueTokens(user);
    return { accessToken, refreshToken };
  }

  /** Invalidate the user's refresh token (logout) */
  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  /**
   * Generate a secure reset token, store its hash in the DB,
   * and email the reset link to the user.
   *
   * NOTE: Always returns a generic success message to prevent
   * email-enumeration attacks.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (user) {
      // Generate a cryptographically secure random token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(rawToken, 10);
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.usersService.setResetToken(
        (user._id as unknown as string).toString(),
        hashedToken,
        expires,
      );

      const clientUrl = this.configService.get<string>('clientUrl') ?? '';
      const resetLink = `${clientUrl}/reset-password?token=${rawToken}`;
      await this.mailService.sendPasswordResetEmail(user.email, resetLink);
    }

    // Generic message to avoid revealing whether the email exists
    return {
      message:
        'If an account with that email exists, a reset link has been sent.',
    };
  }

  /** Verify the reset token and update the user's password */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // Find user whose stored (hashed) token matches AND has not expired
    const allUsersWithToken = await this.usersService.findByResetToken(
      dto.token,
    );

    if (!allUsersWithToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = allUsersWithToken;

    // Validate incoming token against stored hash
    const isValid = await bcrypt.compare(
      dto.token,
      user.resetPasswordToken ?? '',
    );
    if (!isValid) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    const userId = (user._id as unknown as string).toString();

    // Update password, clear reset token, and invalidate refresh tokens
    await Promise.all([
      this.usersService.updatePassword(userId, hashedPassword),
      this.usersService.clearResetToken(userId),
      this.usersService.updateRefreshToken(userId, null),
    ]);

    return { message: 'Password has been reset successfully.' };
  }
}
