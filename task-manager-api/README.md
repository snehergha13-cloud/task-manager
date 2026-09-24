# Task Manager API

A backend system for user registration/login and per-user task management,
built with **NestJS**, **TypeORM** (SQLite), and **JWT authentication**.

## Tech stack

| Concern            | Choice                                   |
|---------------------|-------------------------------------------|
| Framework           | NestJS (TypeScript)                      |
| Database            | SQLite                                   |
| ORM                 | TypeORM                                  |
| Auth                | JWT (`@nestjs/jwt` + `passport-jwt`)     |
| Password hashing    | bcrypt                                   |
| Validation          | class-validator / class-transformer      |
| Testing             | Jest (unit) + Supertest (API/e2e)        |

## Project structure

```
src/
  auth/           # register/login, JWT strategy, guards, decorators
  users/          # user entity, service, controller (profile + admin)
  tasks/          # task entity, service, controller (CRUD + ownership)
  common/filters/ # global HTTP exception filter
  app.module.ts
  main.ts
  seed-admin.ts   # creates the first admin account from env vars
test/
  auth.e2e-spec.ts
  tasks.e2e-spec.ts
  roles.e2e-spec.ts
.env.example      # documents required env vars (no real secrets)
.env.test          # non-sensitive config used only by the e2e test suite
```

Unit tests live next to the code they test (`src/**/*.spec.ts`); API/e2e
tests live in `test/`.

## 1. Setup

```bash
npm install
cp .env.example .env
```

Open `.env` and set a real `JWT_SECRET` (a long random string). Never commit
`.env` — it's already in `.gitignore`.

## 2. Run the server

```bash
npm run start:dev
```

The API listens on `http://localhost:3000` (or `PORT` from `.env`). TypeORM
`synchronize: true` will create `db.sqlite` and the tables automatically on
first run.

### Creating the first admin account

Registration (`POST /auth/register`) always creates a normal `user` — this is
intentional, so nobody can grant themselves admin through the public API.
Create the first admin with:

```bash
npm run seed:admin
```

This reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` from `.env` (falls
back to sensible defaults if unset) and creates that user with `role=admin`.
Run it again any time you need another admin (change the env vars first).

## 3. Run the tests

```bash
# Unit tests (service-level logic: hashing, JWT issuance, ownership rules)
npm test

# Unit tests with coverage report
npm run test:cov

# API / e2e tests (spins up the real Nest app + a throwaway SQLite file
# defined in .env.test, and exercises the HTTP endpoints with Supertest)
npm run test:e2e
```

- **Unit tests** (`src/auth/auth.service.spec.ts`, `src/tasks/tasks.service.spec.ts`)
  mock the repository layer and test business rules in isolation: password
  hashing, JWT issuance, invalid-login handling, and task ownership
  enforcement (a user can't touch another user's task; an admin can).
- **API tests** (`test/*.e2e-spec.ts`) hit real HTTP endpoints end-to-end:
  register → login → CRUD tasks, validation errors, and role-based access
  (403 for a normal user hitting an admin route, 200 for an admin).

## API reference

All protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Path            | Auth | Body                              |
|--------|-----------------|------|------------------------------------|
| POST   | `/auth/register`| No   | `{ email, name, password }`        |
| POST   | `/auth/login`   | No   | `{ email, password }`              |

### Users

| Method | Path         | Auth        | Notes                          |
|--------|--------------|-------------|---------------------------------|
| GET    | `/users/me`  | Any user    | Own profile only                |
| GET    | `/users`     | Admin only  | List all users                  |
| DELETE | `/users/:id` | Admin only  | Delete a user                   |

### Tasks

| Method | Path         | Auth     | Notes                                   |
|--------|--------------|----------|-------------------------------------------|
| POST   | `/tasks`     | Any user | Creates a task owned by the caller        |
| GET    | `/tasks`     | Any user | Own tasks (user) / all tasks (admin)      |
| PUT    | `/tasks/:id` | Any user | Owner or admin only                       |
| DELETE | `/tasks/:id` | Any user | Owner or admin only                       |

Task body: `{ title (required), description? (optional), status? ("pending" | "completed") }`

## Sample API requests (curl)

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","name":"Alice","password":"password123"}'

# Login -> copy the access_token from the response
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'

TOKEN="paste-the-access_token-here"

# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Write README","description":"Explain setup and usage"}'

# List my tasks
curl http://localhost:3000/tasks -H "Authorization: Bearer $TOKEN"

# Update a task
curl -X PUT http://localhost:3000/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"completed"}'

# Delete a task
curl -X DELETE http://localhost:3000/tasks/TASK_ID -H "Authorization: Bearer $TOKEN"

# My profile
curl http://localhost:3000/users/me -H "Authorization: Bearer $TOKEN"

# Admin: list all users (requires an admin token, see "Creating the first admin account")
curl http://localhost:3000/users -H "Authorization: Bearer $ADMIN_TOKEN"

# Admin: delete a user
curl -X DELETE http://localhost:3000/users/USER_ID -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Security notes

- Passwords are hashed with bcrypt (10 salt rounds) — never stored or
  returned in plaintext. API responses strip the `password` field.
- JWT secret and all other config come from environment variables
  (`.env`, not committed); `.env.example` documents what's needed.
- `ValidationPipe` runs globally with `whitelist` + `forbidNonWhitelisted`,
  so unexpected fields are rejected rather than silently accepted.
- Role-based access is enforced with a `RolesGuard` + `@Roles()` decorator
  on admin-only routes, and task ownership is enforced in `TasksService`
  (a non-admin can only read/update/delete their own tasks).
- A global exception filter returns a consistent `{ statusCode, message,
  path, timestamp }` error shape for every failure.

See `TESTING_GUIDE.md` for a manual test walkthrough and a checklist of
screenshots to capture for submission.
