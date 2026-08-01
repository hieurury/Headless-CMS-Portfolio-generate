import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1 (GET) - Check if server is running', () => {
    // If you have a root endpoint, we test it. Since the API prefix is v1, let's test a 404 or a known health endpoint
    return request(app.getHttpServer())
      .get('/api/v1/unknown-route')
      .expect(404);
  });
});
