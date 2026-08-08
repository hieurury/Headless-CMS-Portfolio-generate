import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * MailModule — provides MailService globally to any module that imports it.
 *
 * Import this module in any feature module that needs to send emails.
 * Example: AuthModule, UsersModule, etc.
 */
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
