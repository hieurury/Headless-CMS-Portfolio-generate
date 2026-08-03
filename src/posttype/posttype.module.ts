import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PosttypeService } from './posttype.service';
import { PosttypeController } from './posttype.controller';
import { Posttype, PosttypeSchema } from './schema/posttype.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Posttype.name, schema: PosttypeSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [PosttypeController],
  providers: [PosttypeService],
})
export class PosttypeModule {}
