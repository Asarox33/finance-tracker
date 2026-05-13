# Finance Tracker — AI Development Guide

This file is a **team + AI reference**. In Cursor it is loaded as a **workspace rule**, so coding agents see it in context for this repo each session (it does not replace chat history, but restates stack, commands, and integration order). For **Windows + PowerShell** defaults and the **npm install (local) vs npm ci (CI)** rule, see [`AGENTS.md`](AGENTS.md).

---

## Execution Model

### Modes (strict — select before acting)

| Mode | When | Rule |
|---|---|---|
| **FULL GENERATION** | New module / new architecture | Generate complete new structure |
| **PATCH** | Bug fix / compilation issue / file-level change | Output modified files/sections only — never regenerate full project |
| **INSTRUCTION** | Small change < 50 lines | Line-level or textual diff only |

### Scope discipline (absolute)

- Never expand scope beyond the current request
- Never add features not explicitly asked for
- Never anticipate future steps
- Execute only the current step, then stop
- Prefer minimal change over full rewrite
- If unclear → choose simplest correct solution, or ask

### Step pipeline (follow strictly, one step at a time)

```
STEP 0  → Context definition
STEP 1  → Architecture design (NO CODE) — only when adding a new subsystem or major boundary change
STEP 2  → Backend bootstrap only
STEP 3  → Shared module
STEP 4  → Business modules (one by one)
STEP 5  → FX module
STEP 6  → Inflation module
STEP 7  → Analytics module
STEP 8  → Frontend shell (App Router baseline, AppShell, http.ts, shared UI, auth routes)
STEP 9  → Frontend feature integration (one feature at a time: api/ → hooks/ → page/ → tests)
STEP 10 → Test completion (missing coverage only)
STEP 11 → Docker setup (optional full-stack compose; see Environment Model)
STEP 12 → CI/CD pipeline
```

Each step must end completely before the next begins. No forward implementation.

**Active focus:** **STEP 9** (frontend feature integration). **STEP 1** (architecture design, no code) runs only when introducing a new subsystem or changing major boundaries — then document decisions in `ai-context/` if needed.

#### STEP 9 — Frontend feature integration (current programme)

Integrate **one vertical slice at a time** (types in `shared/types`, `features/<name>/api`, `hooks`, `app/<route>`, `__tests__`; no cross-feature imports). Order below matches **backend bounded contexts** (do not skip ahead).

| # | Backend module | Typical frontend feature dir | Status (baseline) |
|---|----------------|------------------------------|-------------------|
| 1 | `auth` | `features/auth/` | Done |
| 2 | `user-profile` | `features/user-profile/` | Done |
| 3 | `institution` | `features/institutions/` | Done |
| 4 | `asset` | `features/assets/` (to create) | Not started |
| 5 | `account` | `features/accounts/` | In progress — align UX with institutions (picker / search; drop raw UUID where possible) |
| 6 | `transaction` | `features/transactions/` | In progress — date filters, asset linkage for BUY/SELL, tests as needed |
| 7 | `fees` | `features/fees/` (to create) | Not started |
| 8 | `price` | `features/price/` (to create) | Not started |
| 9 | `fx` | `features/fx/` (to create) | Not started |
| 10 | `inflation` | `features/inflation/` (to create) | Not started |
| 11 | `analytics` | `features/analytics/` | In progress — preferred currency from profile, E2E |

**Composite UI:** `/dashboard` combines data from **account** + **analytics**; refine it after rows **5** and **11** are in good shape.

When resuming: pick the **next single row** by order (or the lowest-numbered row still “In progress” / “Not started”), finish it, then stop per scope discipline.

---

## Language Rule

All code, comments, logs, error messages, variable names, and test method names must be in **English only**. No French anywhere in the codebase.

---

## Repository Shape

Monorepo layout (primary code under `backend/` and `frontend/`; team editor configs at repo root — see `.gitignore`):

```
finance-tracker/
├── backend/      # Kotlin 2.3.20 + Spring Boot 4.0.5, Gradle 9.4.1, JVM 25
├── frontend/     # Next.js 16, TypeScript 6, React 19, SWR 2.4
├── .vscode/      # Shared: extensions.json, settings.json (tasks.json / launch.json optional)
├── .idea/        # Shared (optional): codeStyles, inspectionProfiles, runConfigurations — see .gitignore
└── ai-context/   # Architecture docs (read these for deep dives)
```

**Deep-reference docs** (read when the task needs it):
- `/ai-context/architecture.md` — full stack overview, directory trees, auth flow, API mapping
- `/ai-context/conventions.md` — naming rules, testing patterns, formatting, accessibility
- `/ai-context/module-rules.md` — per-module responsibilities + frontend integration notes
- `/ai-context/current-state.md` — what is built, known limitations, what is missing

---

## Docker & local database

- **Typical dev setup:** PostgreSQL runs **locally in Docker** (or any reachable host); Spring `dev` profile points to that instance. This is separate from the application containers below.
- **Backend integration tests** use **Testcontainers** and require the **Docker daemon** running (containers are managed by the test runtime, not by manual `docker run` of the app).

Optional full-stack layout (when present in the repo):

```
docker/
├── docker-compose.yml           # Production baseline
├── docker-compose.override.yml  # Dev overrides (dev seeds, ports, hot reload)
├── backend.Dockerfile
└── frontend.Dockerfile
```

**Run production (if compose files exist):** `docker compose up -d`  
**Run development (if compose files exist):** `docker compose -f docker-compose.yml up -d` (override applied automatically when named `docker-compose.override.yml`)

---

## Tech Stack at a Glance

| Side | Key Technologies |
|---|---|
| Backend | Kotlin, Spring Boot 4, Spring Data JPA, PostgreSQL 16, Flyway 12, JWT, Bucket4j |
| Frontend | Next.js 16 App Router, TypeScript 6 strict, SWR, CSS Modules, clsx |
| Testing (BE) | JUnit 5 (Jupiter 6.x), Testcontainers 2, Kover |
| Testing (FE) | Jest 30, React Testing Library 16, Playwright 1.59 |
| Build | Gradle 9.4.1 (BE), npm (FE) |

---

## Environment Model

| Rule | Detail |
|---|---|
| DEV/PROD parity | Identical codebase — no environment-specific business logic |
| Environment switching | Spring profiles (`dev`, `prod`, `test`); optional Docker Compose for full stack when files exist |
| Seeds | DEV only (Flyway seed locations / compose overrides as configured) — never in PROD |
| Spring config | `application.yml` (shared) · `application-dev.yml` · `application-prod.yml` · `application-test.yml` (CI only) |

No `if (env == "dev")` logic in application code. Ever.

---

## Version Locking (Critical)

- **No version ranges** — `^`, `~`, `latest` are forbidden everywhere
- All versions must be explicit and pinned
- Backend: Gradle dependency locking enabled (`./gradlew dependencies --write-locks`)
- Frontend: `package-lock.json` is mandatory and committed. **Local dev:** `npm install` in `frontend/`. **CI/CD:** `npm ci` only (never `npm install` in pipelines)

---

## Core Architecture Rules

### Backend — Hexagonal, Module-per-Bounded-Context

Every feature module (`auth`, `account`, `transaction`, …) has exactly three layers:

```
domain/        ← pure Kotlin data classes + repository interfaces (no framework)
application/   ← use cases (plain Kotlin, one execute() method each)
infrastructure/← Spring config, JPA entities, REST controllers, repository adapters
```

**Hard rules:**
- Domain and application layers: **zero** Spring / JPA annotations
- Modules never import each other's `infrastructure` layer
- Business logic lives in use cases, never in controllers or config classes
- `shared/` is framework-free; do not add Spring deps or feature logic there
- Currency conversion logic only in `fx` module; pricing logic only in `price` module; transaction logic only in `transaction` module
- **No cross-module database access** — each module owns its PostgreSQL schema exclusively
- **No implicit FX conversion** — all currency conversion must go through the `fx` module explicitly, using historical rates only
- `analytics` module: read-only computed layer, no persistence of any kind

**Current backend modules:**
`shared` · `auth` · `user-profile` · `institution` · `asset` · `account` · `transaction` · `fees` · `price` · `fx` · `inflation` · `analytics` · `app`

`analytics` is special: no DB, depends on other modules via port interfaces only.

### Frontend — Feature-Oriented, App Router

```
src/
├── app/           # Routes + layouts (Next.js App Router)
├── features/      # One directory per feature: api/, hooks/, __tests__/
├── shared/        # components/, hooks/, types/index.ts
└── lib/           # http.ts, format.ts, currencies.ts
```

**Hard rules:**
- No cross-feature imports (e.g. `analytics` must not import from `accounts`)
- All API calls go through `src/lib/http.ts` — never raw `fetch` in components or hooks
- All shared TypeScript types live in `src/shared/types/index.ts` — never duplicated in features
- CSS Modules only — no Tailwind, no external component libraries
- Every authenticated page section has a `layout.tsx` that wraps children in `<AppShell>`
- Monetary amounts are **always minor-unit integers** end-to-end (e.g. €100.50 = `10050`)

---

## Monetary Convention (Critical)

| Context | Rule |
|---|---|
| Backend storage | `Long` in minor units (cents). Never `Double` or `BigDecimal` |
| Backend FX/inflation | `Long rate` + `Int scale`; formula: `amount * rate / 10^scale` |
| Frontend display | `formatMoney(amount, currency)` in `src/lib/format.ts` divides by `10^2` |
| Frontend input | Collect decimal string, convert: `Math.round(parseFloat(val) * 100)` before POST |
| Frontend perf | Basis points; `formatBasisPoints(bp)` divides by 100, prefixes `+` |

---

## Key Patterns to Follow

### Adding a Backend Use Case

1. Add a pure Kotlin class in `<module>/application/` with a nested `Command`/`Query` and one `execute()` method
2. Inject only domain repository interfaces via constructor
3. Register as a `@Bean` in `<module>/infrastructure/<Module>Config.kt`
4. Add or update the `@RestController` in `infrastructure/`
5. Add Flyway migration if the schema changes (`V<n>_<minor>__<description>.sql`)
6. Add unit test in `src/test/kotlin/` using `InMemory*Repository`

### Adding a Frontend Feature

1. Create `src/features/<name>/api/<name>Api.ts` — export a const object with typed `http.*` calls
2. Create `src/features/<name>/hooks/use<Name>.ts` — SWR for GETs, direct API call + `mutate()` for mutations
3. Add types to `src/shared/types/index.ts` if the feature introduces new shapes
4. Create the page at `src/app/<name>/page.tsx` (`"use client"`) and a matching `layout.tsx`
5. Add tests in `src/features/<name>/__tests__/`

### Adding a Frontend Page

```tsx
"use client";
// 1. Fetch data with feature hooks (SWR)
// 2. Render loading state with <Skeleton>
// 3. Render error state with <ErrorState>
// 4. Render empty state with <EmptyState>
// 5. Render content
// 6. Use shared UI primitives: Card, Button, Badge, PageHeader
```

Layout alongside:
```tsx
import AppShell from "@/shared/components/AppShell";
export default function MyLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
```

---

## Shared UI Primitives

All in `src/shared/components/ui.tsx`:

| Component | Key Props |
|---|---|
| `Card` | `children`, `className?` |
| `Skeleton` | `className?` — shimmer placeholder |
| `Badge` | `variant`: `default` \| `success` \| `danger` \| `warning` |
| `Button` | `variant`: `primary` \| `secondary` \| `danger` \| `ghost`; `size`: `sm` \| `md`; `loading?` |
| `PageHeader` | `title`, `description?`, `action?` (right-side slot) |
| `EmptyState` | `title`, `description?` |
| `ErrorState` | `message?` |

---

## Authentication

- JWT stored in `localStorage` as `auth_token`; user ID as `user_id`
- `http.ts` injects the token on every request, checks expiry before use, auto-redirects on 401
- `useAuthGuard` (in `AppShell`) redirects unauthenticated users to `/login`
- `useSessionTimeout` auto-logs out after **5 minutes** of inactivity
- Lock detection: backend returns HTTP 429; frontend checks `message.includes("locked")`

---

## API Proxy

Frontend `/api/*` → proxied by Next.js to `${NEXT_PUBLIC_API_URL}/api/*`

Default: `NEXT_PUBLIC_API_URL=http://localhost:8080`

This means frontend code always uses paths like `/accounts`, `/transactions`, etc. (without `/api` prefix — that is prepended by `http.ts`'s `BASE_URL = "/api"`).

---

## Dev Credentials (seed data)

| Field | Value |
|---|---|
| Email | `github@meraville.fr` |
| Password | `MyStrongPassword123!` |
| User ID | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |

Start backend: `./gradlew :app:bootRun` (with `dev` profile active)
Start frontend: `cd frontend && npm run dev`

---

## CI/CD Rules

CI is the source of truth for dependency resolution. No "works on my machine" assumptions.

### Backend CI (Windows — primary commands in this repo)

```bat
cd backend
.\gradlew.bat clean build
```

- Default `skipIT` is **false**: `build` runs **unit tests** and **integration tests** (Testcontainers — **Docker must be running**).
- Use `-PskipIT=true` on agents or laptops **without** Docker when only unit tests should run.

On Unix, use `./gradlew clean build` from `backend/`.

### Frontend CI (GitHub Actions — reproducible install)

**Package manager:** **npm only** — do **not** use Yarn or pnpm. In **CI/CD**, use **`npm ci` only** (never `npm install`). On **developer machines**, normal workflow is **`npm install`** in `frontend/`; see [`AGENTS.md`](AGENTS.md).

```powershell
cd frontend
npm ci
npm run lint
npm run build
```

No implicit installs in CI. No environment-specific workarounds in application code.

---

## Testing

### Backend (from `backend/` — Windows)

Integration tests use **Testcontainers**; **Docker must be running**. A local PostgreSQL in Docker for day-to-day `bootRun` is separate, but the same Docker daemon must be available when `skipIT` is false.

```bat
cd backend
.\gradlew.bat build
.\gradlew.bat build -PskipIT=true
.\gradlew.bat integrationTest -PskipIT=false
.\gradlew.bat testAggregateReport
```

| Command | Effect |
|---------|--------|
| `.\gradlew.bat build` | Unit tests + integration tests (default `skipIT=false`; needs Docker) |
| `.\gradlew.bat build -PskipIT=true` | Unit tests only (integration tests skipped) |
| `.\gradlew.bat integrationTest -PskipIT=false` | Integration tests only (needs Docker) |
| `.\gradlew.bat testAggregateReport` | All tests + Kover coverage report (needs Docker) |

On Unix, use `./gradlew` from `backend/` with the same tasks and properties. On Windows **cmd.exe**, `gradlew.bat` works when the current directory is `backend/`; **PowerShell** requires `.\gradlew.bat`.

### Frontend (from `frontend/` — PowerShell examples)

```powershell
cd frontend
npm install            # local development (default); commit package-lock.json when deps change
# npm ci               # CI/CD and reproducible agents only — strict lockfile install

npm test               # Jest unit + integration tests
npm run test:watch     # Jest watch mode
npm run test:e2e       # Playwright E2E — trace **on** (`--trace on`; requires dev server, e.g. npm run dev)
npm run lint           # ESLint
npm run test:coverage  # Jest with coverage
npm run format         # Prettier, whole frontend tree (`prettier . --write`)
npm run clean          # rimraf .next .swc coverage playwright-report test-results
npm run reinstall      # local recovery: rimraf node_modules + lockfile then npm install — not for CI
```

**Frontend test patterns:**
- Mock `global.fetch` for API module tests
- Mock `jest.mock("next/navigation", ...)` for hooks that use `useRouter`
- Mock `jest.mock("swr", ...)` with a null-key guard: skip fetcher when key is falsy
- Mock `jest.mock("<feature>/api/<feature>Api", ...)` for hook tests
- Seed `localStorage` via `jest.spyOn(Storage.prototype, "getItem")` or `localStorage.setItem`
- Build test JWTs inline: `btoa(JSON.stringify({ sub, exp }))` as the payload segment
- SWR mock pattern (always use this form):
```ts
  jest.mock("swr", () => ({
    __esModule: true,
    default: jest.fn((key, fetcher) => {
      if (!key || !fetcher) return { data: undefined, error: undefined, isLoading: false, mutate: jest.fn() };
      try { fetcher(); } catch {}
      return { data: undefined, error: undefined, isLoading: false, mutate: jest.fn() };
    }),
  }));
```

**What to unit test:**
- `src/features/**/api/` — all API modules
- `src/features/**/hooks/` — all hooks with business logic
- `src/lib/` — http client, format utilities (exclude currencies.ts — static data, no logic)

**What NOT to unit test (covered by E2E instead):**
- `src/app/` — page components (too much mocking, covered by Playwright)
- `src/shared/components/` — UI primitives and AppShell (covered by Playwright)
- `src/shared/hooks/` — auth guard, session timeout, theme (depend on window/router)

## Known Gaps (Things Not Yet Built)

**Backend:** refresh tokens, email verification, admin endpoints, asset holdings, budget tracking, notifications, import (CSV/OFX), audit log.

**Frontend:** wire **account creation** to **institutions** (search/picker; avoid raw UUID where possible); asset selector in transaction form; fee/price/FX/inflation management UIs; date range filter on transactions page; E2E tests for accounts/transactions/analytics/institutions; user-preferred currency applied to analytics (where still hardcoded `EUR`); internationalised formatting (currently hardcoded `fr-FR`).

---

## Before You Make a Change — Checklist

1. **Identify the owning module** — backend feature or frontend feature directory
2. **Respect layer boundaries** — no framework annotations in domain/application; no cross-feature imports in frontend
3. **Check `module-rules.md`** for the specific module's constraints before touching it
4. **Follow naming conventions** — see `conventions.md`
5. **Update migrations** if the backend schema changes
6. **Keep amounts in minor units** throughout; use `formatMoney` only at display time
7. **Add tests** — unit test for use cases (BE) or API/hook modules (FE); E2E for new user flows
8. **Keep frontend/backend naming aligned** — type names in `shared/types/index.ts` should match backend DTO field names (camelCase)