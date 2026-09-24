# Testing Guide

This guide covers three layers of testing and exactly what to screenshot at
each step so a reviewer can verify the assignment requirements at a glance.

Use **Postman**, **Insomnia**, or plain `curl`/terminal — screenshots below
assume a REST client like Postman because it's the clearest to read, but
terminal output works too as long as the request and response are both
visible in the same shot.

---

## Layer 1 — Automated tests (run first, screenshot the summary)

```bash
npm test          # unit tests
npm run test:cov  # unit tests + coverage table
npm run test:e2e  # API/e2e tests against real HTTP endpoints
```

**Screenshot checklist:**
1. Terminal output of `npm test` showing all unit test suites passing
   (look for the green `PASS` lines and the final `Tests: X passed`).
2. Terminal output of `npm run test:cov` showing the coverage table.
3. Terminal output of `npm run test:e2e` showing all API test suites
   passing (`auth.e2e-spec.ts`, `tasks.e2e-spec.ts`, `roles.e2e-spec.ts`).

These three screenshots alone demonstrate the "minimum 3 unit tests" and
"minimum 2 API tests" requirements are met (there are 7 unit tests and 14
e2e tests in this project).

---

## Layer 2 — Manual walkthrough with a REST client

Do these **in order**, since later steps reuse tokens/IDs from earlier ones.
Import or replicate as a Postman collection if you like — the payloads are
below verbatim.

### Step 1 — Register a normal user
`POST /auth/register`
```json
{ "email": "alice@example.com", "name": "Alice", "password": "password123" }
```
✅ Expect `201 Created`, body has no `password` field, `role` is `"user"`.
📸 **Screenshot**: request + response.

### Step 2 — Try to register the same email again
Same request again.
✅ Expect `409 Conflict` with a clear message ("Email is already registered").
📸 **Screenshot**: shows duplicate-email handling.

### Step 3 — Register with an invalid payload
```json
{ "email": "not-an-email", "name": "", "password": "123" }
```
✅ Expect `400 Bad Request` listing each validation failure (email format,
name required, password min length).
📸 **Screenshot**: shows validation is real, not decorative.

### Step 4 — Login
`POST /auth/login`
```json
{ "email": "alice@example.com", "password": "password123" }
```
✅ Expect `200 OK` with an `access_token`. Copy it — you'll use it as a
Bearer token for every request below.
📸 **Screenshot**: response showing the JWT.

### Step 5 — Login with the wrong password
Same email, wrong password.
✅ Expect `401 Unauthorized`.
📸 **Screenshot**: shows failed login is rejected cleanly.

### Step 6 — Hit a protected route with no token
`GET /tasks` with **no** `Authorization` header.
✅ Expect `401 Unauthorized`.
📸 **Screenshot**: proves the route is actually protected, not just decorated
with a guard that isn't wired up.

### Step 7 — Create a task
`POST /tasks` with `Authorization: Bearer <alice's token>`
```json
{ "title": "Write README", "description": "Explain setup and usage" }
```
✅ Expect `201 Created`, `status` defaults to `"pending"`, response includes
`created_at`.
📸 **Screenshot**. Note the returned task `id` for the next steps.

### Step 8 — Create a task with no title
```json
{ "description": "missing the required field" }
```
✅ Expect `400 Bad Request` ("Title is required").
📸 **Screenshot**.

### Step 9 — List tasks as Alice
`GET /tasks` with Alice's token.
✅ Expect `200 OK`, an array containing only Alice's task(s).
📸 **Screenshot**.

### Step 10 — Update the task
`PUT /tasks/{id}` with Alice's token.
```json
{ "status": "completed" }
```
✅ Expect `200 OK`, `status` is now `"completed"`.
📸 **Screenshot**.

### Step 11 — Register a second user (Bob) and try to touch Alice's task
Register + login Bob the same way as Steps 1 and 4, then:
`PUT /tasks/{alice's task id}` with **Bob's** token.
✅ Expect `403 Forbidden` ("You do not have access to this task").
📸 **Screenshot** — this is the core "users can access only their own tasks"
requirement, so make sure this one is crisp and clearly shows Bob's token
being rejected on Alice's task.

### Step 12 — Delete the task
`DELETE /tasks/{id}` with Alice's token.
✅ Expect `200 OK` with a confirmation message.
📸 **Screenshot**. Then repeat the request once more and confirm it now
returns `404 Not Found`.

### Step 13 — Own profile
`GET /users/me` with Alice's token.
✅ Expect `200 OK`, Alice's own data, no `password` field.
📸 **Screenshot**.

### Step 14 — Non-admin hits an admin-only route
`GET /users` with Alice's (non-admin) token.
✅ Expect `403 Forbidden`.
📸 **Screenshot** — demonstrates role-based access control working, not just
present in code.

### Step 15 — Create an admin and use admin routes
Run `npm run seed:admin` (see README) to create an admin account, then log
in as that admin.

`GET /users` with the admin token.
✅ Expect `200 OK` with a list of all users, including Alice and Bob.
📸 **Screenshot**.

`GET /tasks` with the admin token (after creating a task or two as Alice/Bob
again if needed).
✅ Expect `200 OK` with tasks from **all** users, not just the admin's own.
📸 **Screenshot** — demonstrates "admin can access all tasks."

`DELETE /users/{bob's id}` with the admin token.
✅ Expect `200 OK` confirmation.
📸 **Screenshot**.

---

## Layer 3 — Security spot-checks (screenshot the evidence)

1. **No plaintext passwords**: open `db.sqlite` in a SQLite viewer (e.g. DB
   Browser for SQLite, or `sqlite3 db.sqlite "SELECT email, password FROM
   users;"`) and screenshot the `users` table showing bcrypt hashes
   (`$2b$10$...`), never the raw password.
2. **No secrets in git**: run `git status` after `.env` exists locally and
   screenshot that `.env` does **not** appear as a tracked/staged file
   (it should be silently ignored because of `.gitignore`).
3. **JWT payload**: paste a copied `access_token` into [jwt.io](https://jwt.io)
   (or decode it locally) and screenshot the payload showing `sub`, `email`,
   `role`, and an expiry (`exp`) — no password or sensitive data in the
   token itself.

---

## Suggested screenshot naming (for the submission zip/folder)

```
01-unit-tests-pass.png
02-coverage.png
03-e2e-tests-pass.png
04-register-success.png
05-register-duplicate-email.png
06-register-validation-error.png
07-login-success-jwt.png
08-login-wrong-password.png
09-tasks-no-token-401.png
10-task-create-success.png
11-task-create-missing-title.png
12-task-list-own-only.png
13-task-update.png
14-task-forbidden-other-user.png
15-task-delete-then-404.png
16-users-me.png
17-users-forbidden-non-admin.png
18-admin-list-all-users.png
19-admin-list-all-tasks.png
20-admin-delete-user.png
21-db-hashed-passwords.png
22-env-not-in-git.png
23-jwt-payload-decoded.png
```

Not every screenshot is mandatory — but 4–8 (auth), 9–15 (tasks/ownership),
17–19 (roles), and 21 (hashed passwords) are the ones that most directly
prove the assignment's hard requirements, so don't skip those.
