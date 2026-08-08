import { Test, TestingModule } from '@nestjs/testing';
import { PosttypeService } from './posttype.service';
import { getModelToken } from '@nestjs/mongoose';
import { Posttype } from './schema/posttype.schema';
import { Post } from '../posts/schemas/post.schema';

describe('PosttypeService', () => {
  let service: PosttypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<PosttypeService>(PosttypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
