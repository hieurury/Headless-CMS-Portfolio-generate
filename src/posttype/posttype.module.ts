import { Module } from '@nestjs/common';
import { PosttypeService } from './posttype.service';
import { PosttypeController } from './posttype.controller';

@Module({
  controllers: [PosttypeController],
  providers: [PosttypeService],
})
export class PosttypeModule {}
