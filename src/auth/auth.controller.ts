import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Register (Step 1) ──────────────────────────────────────────────────────

  /**
   * POST /api/v1/auth/register
   * Create a new unverified account. Sends OTP to email.
   * Returns { userId } — used to proceed to step 2 (OTP verification).
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ─── OTP Verification (Step 2) ──────────────────────────────────────────────

  /**
   * POST /api/v1/auth/verify-otp
   * Verify email with 6-digit OTP. Returns auth tokens (auto-login).
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyEmailOtp(dto.userId, dto.code);
  }

  /**
   * POST /api/v1/auth/resend-otp
   * Resend the verification OTP to the user's email.
   */
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendVerificationOtp(dto.userId);
  }

  // ─── Login ──────────────────────────────────────────────────────────────────

  /**
   * POST /api/v1/auth/login
   * - Verified account → { accessToken, refreshToken, user }
   * - Unverified account → { requiresVerification: true, userId } + fresh OTP sent
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ─── Refresh Tokens ─────────────────────────────────────────────────────────

  /**
   * POST /api/v1/auth/refresh
   * Exchange a valid refresh token for a new token pair.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return this.authService.refreshTokens(payload.sub, dto.refreshToken);
  }

  // ─── Logout ─────────────────────────────────────────────────────────────────

  /**
   * POST /api/v1/auth/logout
   * Invalidate the current user's refresh token.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }

  // ─── Me ─────────────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/auth/me
   * Get the currently authenticated user's full profile.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }

  // ─── Profile Update (Step 3) ────────────────────────────────────────────────

  /**
   * PATCH /api/v1/auth/profile
   * Update optional profile fields (step 3 of registration or settings page).
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.sub, dto);
  }

  // ─── Categories ────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/auth/categories
   * Returns list of all available system + user categories
   */
  @Get('categories')
  @HttpCode(HttpStatus.OK)
  getCategories() {
    return this.authService.getCategories();
  }

  // ─── Forgot Password (Step 1) ───────────────────────────────────────────────

  /**
   * POST /api/v1/auth/forgot-password
   * Send a 6-digit OTP to the user's email for password reset.
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return { message: 'If that email exists, a reset code has been sent.' };
  }

  // ─── Verify Reset OTP (Step 2) ──────────────────────────────────────────────

  /**
   * POST /api/v1/auth/verify-reset-otp
   * Verify the reset OTP. Returns a short-lived resetToken for step 3.
   */
  @Post('verify-reset-otp')
  @HttpCode(HttpStatus.OK)
  verifyResetOtp(@Body() dto: VerifyResetOtpDto) {
    return this.authService.verifyResetOtp(dto.email, dto.code);
  }

  // ─── Reset Password (Step 3) ────────────────────────────────────────────────

  /**
   * POST /api/v1/auth/reset-password
   * Reset the password and auto-login. Returns auth tokens.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.resetToken, dto.password);
  }
}
