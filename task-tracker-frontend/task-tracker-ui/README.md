# Task Tracker — Frontend

A React + TypeScript frontend for the Task Manager API (the NestJS backend
built earlier in this project). Implements auth screens, a role-aware
dashboard, full task CRUD, and a UI styled after Apple's **Liquid Glass**
design language (WWDC 2025 / iOS·macOS 26).

## Tech stack

| Concern     | Choice                                             |
|-------------|-----------------------------------------------------|
| Framework   | React 18 + TypeScript, built with Vite              |
| Routing     | react-router-dom v6                                 |
| Styling     | Tailwind CSS + a custom "Liquid Glass" CSS layer     |
| API layer   | `fetch`, wrapped in a small typed client (no axios)  |
| Testing     | Vitest (Jest-compatible API) + React Testing Library + MSW |

> **Why Vitest instead of Jest?** Vitest is Vite's native test runner: it
> shares Vite's config/transform pipeline (so `import.meta.env.VITE_API_URL`
> "just works" without extra shims) and its API is intentionally
> Jest-compatible — `describe`/`it`/`expect`/mocking all read the same as
> Jest. Combined with React Testing Library, it satisfies the assignment's
> "Jest / React Testing Library / Cypress (any)" requirement.

## Design language: Liquid Glass

This UI implements a CSS approximation of Apple's **Liquid Glass** material
(announced at WWDC 2025, shipped September 2025 with iOS 26 / macOS 26
Tahoe). Per Apple's own description, Liquid Glass is *"a dynamic material
system that mimics real glass, featuring translucency, refraction, depth,
and motion responsiveness"* — content stays primary while controls visually
recede into a glass layer above it.

A browser can't reproduce Apple's native, GPU-driven refraction pipeline
(real Liquid Glass bends the pixels of whatever sits behind it and reacts to
the device's gyroscope), so this is a faithful CSS/SVG-era approximation of
its **visual grammar**, built in `src/index.css`:

- **Translucency** — `backdrop-filter: blur() saturate()` on every panel,
  button and input (`.glass-panel`, `.glass-button`, `.glass-input`).
- **A moving specular highlight** — instead of a gyroscope, `GlassCard`
  tracks the pointer and updates `--glass-x`/`--glass-y` custom properties
  that drive a radial-gradient "light catch" (`.glass-specular`), so panels
  visibly react as you move the mouse across them.
- **Depth via layered shadow + rim light** — a soft outer drop shadow paired
  with a 1px inset highlight along the top edge, so the glass edge reads as
  a physical material rather than a flat tint.
- **Large, continuous corner radii** (28px panels, pill-shaped nav/buttons),
  echoing Liquid Glass's superellipse-based shapes.
- **Content never sits directly on raw blur** — every glass surface wraps
  its content in a `.glass-content` layer, matching Apple's own rule that
  *"text always remains on solid layers... preserving accessibility."*
- **Adaptive light/dark** — colors are CSS custom properties that flip via
  `prefers-color-scheme`, the same way Liquid Glass "can independently
  switch between light and dark."
- **An ambient, slowly drifting gradient backdrop** (`.liquid-backdrop`)
  gives the glass panels something varied to refract/reflect, the way a
  real window needs light and color behind it to read as glass.
- **Respects accessibility preferences** — `prefers-reduced-motion` stops
  the ambient animation, and `prefers-reduced-transparency` (where a
  browser supports it) turns panels opaque, matching macOS/iOS's own
  Reduce Transparency setting.

Sources consulted while building this: Apple's WWDC25 session *"Meet Liquid
Glass"* and Apple Newsroom's Liquid Glass announcement (for the material's
described optical behavior), plus several developer write-ups on
implementing glass/refraction effects with `backdrop-filter` and SVG
filters in the browser.

## Project structure

```
src/
  api/            # fetch-based client + auth/tasks/users endpoints
  context/        # AuthContext (JWT + current user, persisted in localStorage)
  hooks/          # useAuth
  components/
    layout/       # GlassCard, Navbar, ProtectedRoute, Spinner, EmptyState, ErrorBanner
    tasks/        # TaskList, TaskItem, TaskFormModal (+ tests)
    users/        # UsersTable (admin)
  pages/          # LoginPage, RegisterPage, DashboardPage (+ tests)
  utils/          # validation.ts (client-side form validation)
  types/          # User, Task, enums shared with the backend's shape
  test/           # Vitest setup + MSW mocks + integration test
.env.example      # documents VITE_API_URL (no secrets)
```

## 1. Setup

This frontend expects the **Task Manager API backend** (built earlier) to
be running. From the backend project:

```bash
npm install
cp .env.example .env   # set a real JWT_SECRET
npm run start:dev      # → http://localhost:3000
npm run seed:admin     # creates an admin account, see backend README
```

Then, in this project:

```bash
npm install
cp .env.example .env
```

`.env` just needs the backend's URL:
```
VITE_API_URL=http://localhost:3000
```

**No API URL is hardcoded anywhere in the source** — `src/api/client.ts`
reads it exclusively from `import.meta.env.VITE_API_URL` (with a
`localhost:3000` fallback purely as a local-dev convenience if `.env` is
missing).

## 2. Run the app

```bash
npm run dev
```

Opens on `http://localhost:5173`. Register a new account, or log in with
the admin account created by `npm run seed:admin` on the backend.

## 3. Run the tests

```bash
npm test             # run once
npm run test:watch   # watch mode
npm run test:coverage
```

- **Component tests** (`src/components/tasks/__tests__/TaskItem.test.tsx`,
  `src/pages/__tests__/LoginPage.test.tsx`) render real components with
  React Testing Library and assert on what the user sees/can do: task
  rendering, the delete action firing with the right task, permission
  gating (no edit/delete controls when you don't own the task), and
  client-side validation messages.
- **Integration/API test** (`src/test/integration/auth-flow.test.tsx`) spins
  up the actual `LoginPage` → `AuthContext` → `fetch` → `ProtectedRoute` →
  `DashboardPage` chain, with **MSW** intercepting the network call to
  simulate the real backend (`src/test/mocks/handlers.ts`). It asserts the
  full flow: submit credentials → JWT stored in `localStorage` → redirected
  into the protected dashboard route — and the inverse: wrong credentials
  → the backend's error message is shown, no token is stored.

## Feature checklist against the assignment

- **Auth**: register/login pages, client-side validation with inline error
  messages, JWT saved on login, redirect to `/dashboard` on success.
- **Dashboard**: shows the logged-in user's name/email/role; admins
  additionally see an "All users" table and every task (not just their
  own) — the backend already scopes `GET /tasks` by role, the UI just
  renders whatever it returns and adds owner labels for admins.
- **Task management**: create / view / edit / delete, with a one-click
  status toggle; `title`, `description`, `status` fields; non-owners never
  see edit/delete controls for a task in the admin's combined list (or
  those controls are hidden client-side and the backend independently
  rejects the request if bypassed).
- **Integration**: every screen talks to the real API; JWT is attached via
  an `Authorization: Bearer` header automatically; API errors surface
  through `<ErrorBanner>`; every async action has a loading state
  (spinners on fetch, disabled+"Saving…" buttons on submit); logout clears
  the token and redirects to login.
- **UI/UX**: single responsive layout (mobile-first, `max-w-4xl` content
  column, wrapping flex/table layouts), consistent spacing/radii/colors
  driven by CSS custom properties, Liquid Glass surfaces throughout.
- **Validation & errors**: required-field + format checks before any
  request is sent; backend validation errors are displayed verbatim if
  they get through; empty states for "no tasks yet" and "no users found".
- **Security**: JWT in `localStorage` behind a single `TOKEN_KEY` constant
  (see the code comment in `AuthContext.tsx` for the trade-off vs. an
  httpOnly cookie); `ProtectedRoute` blocks `/dashboard` without a valid
  session; no secrets in the frontend — only a public API base URL, itself
  from an environment variable.

## Screenshots to capture for submission

1. Register page with a validation error showing (e.g. empty submit).
2. Login page, then the dashboard immediately after logging in.
3. Dashboard as a normal user — own info + own tasks only.
4. Dashboard as an admin — "All users" table + all tasks with owner labels.
5. The "New task" / "Edit task" glass modal, including a validation error.
6. A task list showing the empty state (new account, no tasks yet).
7. An API error banner (e.g. stop the backend and trigger a task fetch).
8. Mobile-width view of the dashboard (resize to ~375px) showing the
   responsive layout still reads well.
