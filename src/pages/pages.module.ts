import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Page, PageSchema } from './schemas/page.schema';
import {
  Portfolio,
  PortfolioSchema,
} from '../portfolios/schemas/portfolio.schema';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Page.name, schema: PageSchema },
      // PagesService needs Portfolio model to verify ownership
      { name: Portfolio.name, schema: PortfolioSchema },
    ]),
  ],
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}
