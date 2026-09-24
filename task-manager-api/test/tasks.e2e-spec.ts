import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let taskId: string;

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

    const email = `tasks-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, name: 'Task User', password: 'password123' });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' });

    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /tasks without a token returns 401', async () => {
    await request(app.getHttpServer()).get('/tasks').expect(401);
  });

  it('POST /tasks creates a task for the authenticated user', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Finish assignment', description: 'NestJS backend' })
      .expect(201);

    expect(res.body.title).toBe('Finish assignment');
    expect(res.body.status).toBe('pending');
    taskId = res.body.id;
  });

  it('POST /tasks rejects a missing title with 400', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'no title here' })
      .expect(400);
  });

  it("GET /tasks lists only the current user's tasks", async () => {
    const res = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((t: { id: string }) => t.id === taskId)).toBe(true);
  });

  it('PUT /tasks/:id updates the task', async () => {
    const res = await request(app.getHttpServer())
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' })
      .expect(200);

    expect(res.body.status).toBe('completed');
  });

  it('DELETE /tasks/:id removes the task', async () => {
    await request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('PUT /tasks/:id on a deleted task returns 404', async () => {
    await request(app.getHttpServer())
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'ghost' })
      .expect(404);
  });
});
