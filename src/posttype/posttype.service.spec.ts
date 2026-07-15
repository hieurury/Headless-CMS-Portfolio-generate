import { Test, TestingModule } from '@nestjs/testing';
import { PosttypeService } from './posttype.service';
import { getModelToken } from '@nestjs/mongoose';

describe('PosttypeService', () => {
  let service: PosttypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PosttypeService,
        {
          provide: getModelToken('Posttype'),
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
