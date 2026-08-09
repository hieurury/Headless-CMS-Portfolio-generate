import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account.schema';
import { UserProfile, UserProfileSchema } from './schemas/user-profile.schema';
import { AccountsService } from './accounts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
    ]),
  ],
  providers: [AccountsService],
  exports: [AccountsService, MongooseModule],
})
export class AccountsModule {}
