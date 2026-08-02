import * as nodemailer from 'nodemailer';

class MailService {
  private transporter: nodemailer.Transporter | null = null;

  private initTransporter() {
    if (this.transporter) return;

    // If GMAIL_USER is set in .env, use Gmail. Otherwise, use SMTP or fallback to Mailtrap
    const isGmail = !!process.env.GMAIL_USER;
    const host =
      process.env.SMTP_HOST ||
      (isGmail ? 'smtp.gmail.com' : 'sandbox.smtp.mailtrap.io');
    const port = Number(process.env.SMTP_PORT || (isGmail ? 465 : 2525));
    const user =
      process.env.SMTP_USER || process.env.GMAIL_USER || '6a84b5f6f43c1b';
    const pass =
      process.env.SMTP_PASS || process.env.GMAIL_PASSWORD || '4697e2cdaaa024';
    const secure = process.env.SMTP_SECURE === 'true' || isGmail;

    console.log(
      'MailService init - Using SMTP_HOST =',
      host,
      'SMTP_PORT =',
      port,
      isGmail ? '(Gmail Mode)' : '(Mailtrap/SMTP Mode)',
    );

    const transportOptions: any = {
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    };

    if (isGmail && !process.env.SMTP_HOST) {
      transportOptions.service = 'gmail';
    }

    this.transporter = nodemailer.createTransport(transportOptions);
  }

  async sendMail(to: string, subject: string, html: string) {
    this.initTransporter();
    const from =
      process.env.MAIL_FROM || '"Headless CMS" <noreply@mailtrap.io>';
    await this.transporter!.sendMail({
      from,
      to,
      subject,
      html,
    });
  }
}

export const mailService = new MailService();
export type MailServiceType = MailService;
