import { Test, TestingModule } from '@nestjs/testing';
import { PosttypeController } from './posttype.controller';
import { PosttypeService } from './posttype.service';

describe('PosttypeController', () => {
  let controller: PosttypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosttypeController],
      providers: [PosttypeService],
    }).compile();

    controller = module.get<PosttypeController>(PosttypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
