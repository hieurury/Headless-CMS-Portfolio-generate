import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('email.gmailUser'),
        pass: this.configService.get<string>('email.gmailPassword'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const gmailUser = this.configService.get<string>('email.gmailUser') ?? '';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#4f46e5">Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <p>This link will expire in <strong>1 hour</strong>.</p>
        <a
          href="${resetLink}"
          style="display:inline-block;margin:20px 0;padding:12px 24px;background-color:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold"
        >
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:12px">
          If you didn't request this, you can safely ignore this email.<br/>
          Or copy this link: ${resetLink}
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"CMS Portfolio" <${gmailUser}>`,
        to,
        subject: 'Reset your password',
        html,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send reset email to ${to}`, error);
      throw new InternalServerErrorException('Failed to send reset email');
    }
  }
}
