import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const userPayload = {
    email: `user-${Date.now()}@example.com`,
    name: 'E2E User',
    password: 'password123',
  };

  it('POST /auth/register creates a user and never returns the password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userPayload)
      .expect(201);

    expect(res.body.email).toBe(userPayload.email);
    expect(res.body.role).toBe('user');
    expect(res.body).not.toHaveProperty('password');
  });

  it('POST /auth/register rejects an invalid email with 400', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email', name: 'Bad', password: 'password123' })
      .expect(400);
  });

  it('POST /auth/register rejects a duplicate email with 409', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(userPayload)
      .expect(409);
  });

  it('POST /auth/login returns a JWT access token for valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userPayload.email, password: userPayload.password })
      .expect(200);

    expect(typeof res.body.access_token).toBe('string');
  });

  it('POST /auth/login rejects a wrong password with 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userPayload.email, password: 'wrong-password' })
      .expect(401);
  });
});
