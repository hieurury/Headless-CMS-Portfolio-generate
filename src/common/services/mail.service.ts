import * as nodemailer from 'nodemailer';

class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Ép giá trị fallback sang Mailtrap nếu process.env.SMTP_HOST bị undefined
    const host = process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io';
    const port = Number(process.env.SMTP_PORT || 2525);
    const user = process.env.SMTP_USER || '6a84b5f6f43c1b';
    const pass = process.env.SMTP_PASS || '4697e2cdaaa024';

    // eslint-disable-next-line no-console
    console.log(
      'MailService init - Using SMTP_HOST =',
      host,
      'SMTP_PORT =',
      port,
    );

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user,
        pass,
      },
    });

    // Verify connection configuration
    this.transporter
      .verify()
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('MailService: SMTP transporter verified successfully!');
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(
          'MailService: SMTP verify failed ->',
          err && err.message ? err.message : err,
        );
      });
  }

  async sendMail(to: string, subject: string, html: string) {
    const from =
      process.env.MAIL_FROM || '"Headless CMS" <noreply@mailtrap.io>';
    await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  }
}

export const mailService = new MailService();
export type MailServiceType = MailService;
