import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User, UserRole } from '../src/users/entities/user.entity';

describe('Roles (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;

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

    // Regular user via the public API
    const userEmail = `role-user-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: userEmail, name: 'Regular User', password: 'password123' });
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password: 'password123' });
    userToken = userLogin.body.access_token;

    // Admin user: registration can never grant admin, so promote directly
    // through the repository the same way the seed script would.
    const adminEmail = `role-admin-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, name: 'Admin User', password: 'password123' });

    const usersRepo: Repository<User> = moduleRef.get(getRepositoryToken(User));
    await usersRepo.update({ email: adminEmail }, { role: UserRole.ADMIN });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: 'password123' });
    adminToken = adminLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('a regular user gets 403 from GET /users (admin only)', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('an admin can list all users via GET /users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('a regular user can view only their own profile via GET /users/me', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).not.toHaveProperty('password');
  });
});
