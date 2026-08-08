import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { verifyEmailTemplate } from './templates/verify-email.template';
import { resetPasswordTemplate } from './templates/reset-password.template';
import { otpTemplate, OtpPurpose } from './templates/otp.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    const user = (this.configService.get<string>('email.user') ?? '').trim();
    const rawAppPassword = this.configService.get<string>('email.appPassword') ?? '';
    this.fromName = this.configService.get<string>('email.fromName') ?? 'Ruryfo CMS';
    this.fromAddress = user;

    // Sanitize app password to strip all whitespace/spaces
    const cleanPassword = rawAppPassword.replace(/\s+/g, '');

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass: cleanPassword,
      },
    });

    if (user && cleanPassword) {
      this.transporter.verify((err) => {
        if (err) {
          this.logger.error(`[MailService] SMTP Connection Error: ${err.message}`);
        } else {
          this.logger.log(`[MailService] SMTP connection established & verified for ${user}`);
        }
      });
    } else {
      this.logger.warn('[MailService] Missing Gmail credentials (GMAIL_USER or GMAIL_APP_PASSWORD)');
    }
  }

  // ─── Generic send ────────────────────────────────────────────────────────────

  /**
   * Low-level method to send any email with multipart HTML and plain text fallback.
   */
  async sendMail(to: string, subject: string, html: string, text?: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to: to.trim().toLowerCase(),
        subject,
        text: text || subject,
        html,
      });
      this.logger.log(`Email delivered to SMTP for ${to} (MessageId: ${info.messageId}) — subject: "${subject}"`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error?.message ?? error}`);
      throw error;
    }
  }

  // ─── Auth Emails ─────────────────────────────────────────────────────────────

  /**
   * Send email verification link to a newly registered user.
   */
  async sendVerifyEmail(to: string, name: string, verifyUrl: string): Promise<void> {
    const html = verifyEmailTemplate(name, verifyUrl, this.fromName);
    const text = `Xin chào ${name},\n\nCảm ơn bạn đã đăng ký tài khoản tại ${this.fromName}.\nVui lòng truy cập đường link sau để xác thực email của bạn:\n${verifyUrl}\n\nLink có hiệu lực trong 24 giờ.`;
    await this.sendMail(to, `[${this.fromName}] Xác thực địa chỉ Email`, html, text);
  }

  /**
   * Send a password reset link to the user.
   */
  async sendResetPasswordEmail(to: string, name: string, resetUrl: string): Promise<void> {
    const html = resetPasswordTemplate(name, resetUrl, this.fromName);
    const text = `Xin chào ${name},\n\nChúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản tại ${this.fromName}.\nVui lòng truy cập đường link sau để đặt lại mật khẩu:\n${resetUrl}\n\nLink có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.`;
    await this.sendMail(to, `[${this.fromName}] Yêu cầu đặt lại mật khẩu`, html, text);
  }

  /**
   * Send a 6-digit OTP code email.
   * Used for both email verification and password reset.
   */
  async sendOtpEmail(
    to: string,
    name: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<void> {
    const html = otpTemplate(name, code, purpose, this.fromName);
    const subject =
      purpose === 'verify-email'
        ? `[${this.fromName}] Mã xác thực Email — ${code}`
        : `[${this.fromName}] Mã đặt lại mật khẩu — ${code}`;
    const text =
      purpose === 'verify-email'
        ? `Xin chào ${name},\n\nMã xác thực email của bạn tại ${this.fromName} là: ${code}\nMã có hiệu lực trong 10 phút. Tuyệt đối không chia sẻ mã này với bất kỳ ai.`
        : `Xin chào ${name},\n\nMã đặt lại mật khẩu của bạn tại ${this.fromName} là: ${code}\nMã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.`;

    await this.sendMail(to, subject, html, text);
  }
}
