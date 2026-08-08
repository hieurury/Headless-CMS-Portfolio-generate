import { Test, TestingModule } from '@nestjs/testing';
import { PosttypeController } from './posttype.controller';
import { PosttypeService } from './posttype.service';
import { getModelToken } from '@nestjs/mongoose';
import { Posttype } from './schema/posttype.schema';
import { Post } from '../posts/schemas/post.schema';

describe('PosttypeController', () => {
  let controller: PosttypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosttypeController],
      providers: [
        PosttypeService,
        {
          provide: getModelToken(Posttype.name),
          useValue: {},
        },
        {
          provide: getModelToken(Post.name),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PosttypeController>(PosttypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
