import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3000';

const ALICE = {
  id: 'user-1',
  email: 'alice@example.com',
  name: 'Alice',
  role: 'user',
  createdAt: new Date('2026-01-01').toISOString(),
};

export const handlers = [
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === ALICE.email && body.password === 'password123') {
      return HttpResponse.json({ access_token: 'fake-jwt-token', user: ALICE });
    }
    return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }),

  http.get(`${API_URL}/users/me`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (auth !== 'Bearer fake-jwt-token') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(ALICE);
  }),

  http.get(`${API_URL}/tasks`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (auth !== 'Bearer fake-jwt-token') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json([]);
  }),
];
