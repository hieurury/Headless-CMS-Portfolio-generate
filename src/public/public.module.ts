import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import {
  Portfolio,
  PortfolioSchema,
} from '../portfolios/schemas/portfolio.schema';
import { Page, PageSchema } from '../pages/schemas/page.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { Posttype, PosttypeSchema } from '../posttype/schema/posttype.schema';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    AccountsModule,
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: Page.name, schema: PageSchema },
      { name: Post.name, schema: PostSchema },
      { name: Posttype.name, schema: PosttypeSchema },
    ]),
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
