# Finance Tracker — AI Development Guide

**Scope:** Non-negotiable **workflow and architecture rules** (modes, STEP pipeline, layering, money, auth, proxy, checklist). **Not** pinned versions, full command matrices, or product backlog — see [`AGENTS.md`](AGENTS.md) and [`ai-context/README.md`](ai-context/README.md).

This file is a **team + AI reference**. In Cursor it is loaded as a **workspace rule**, so coding agents see it in context for this repo each session (it does not replace chat history, but restates rules and integration order). For **Windows + PowerShell** defaults and the **npm install (local) vs npm ci (CI)** rule, see [`AGENTS.md`](AGENTS.md).

---

## Documentation maintenance

See [`ai-context/README.md`](ai-context/README.md) for the **ownership map** (single source of truth per topic). When a change affects **user-visible behaviour**, **public APIs**, **integration order**, **pinned versions**, or **known limitations**, update the **owning doc in the same PR**. At minimum: **`ai-context/current-state.md`** for facts and version pins; **`CLAUDE.md`** only for rules or STEP table changes.

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
├── backend/      # Kotlin / Spring Boot / Gradle — pin matrix: ai-context/current-state.md
├── frontend/     # Next.js / TypeScript / React / SWR — pin matrix: ai-context/current-state.md
├── .vscode/      # Shared: extensions.json, settings.json (tasks.json / launch.json optional)
├── .idea/        # Shared (optional): codeStyles, inspectionProfiles, runConfigurations — see .gitignore
├── AGENTS.md     # Windows PowerShell, npm policy, Gradle commands
└── ai-context/   # See README.md for which file to open
```

**Which doc to read:** [`ai-context/README.md`](ai-context/README.md) (single source of truth per topic).

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
| Backend | Kotlin, Spring Boot 4, Spring Data JPA, PostgreSQL, Flyway, JWT, Bucket4j |
| Frontend | Next.js 16 App Router, TypeScript 6 strict, SWR, CSS Modules, clsx |
| Testing (BE) | JUnit Jupiter, Testcontainers, Kover |
| Testing (FE) | Jest, React Testing Library, Playwright |
| Build | Gradle wrapper + catalog (BE), npm (FE) |

**Exact pinned versions:** [`ai-context/current-state.md`](ai-context/current-state.md) § *Dependency Versions* (from `libs.versions.toml`, `gradle-wrapper.properties`, `frontend/package.json`).

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
- Backend: Gradle dependency locking enabled — run `.\gradlew.bat dependencies --write-locks` from `backend/` on Windows PowerShell, or `./gradlew dependencies --write-locks` from `backend/` on macOS/Linux, when changing dependencies
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
| `ListPagination` | `page`, `pageSize`, `totalItems`, `onPageChange`, optional `onPageSizeChange` — shows **`{from}–{to} of {total}`** |

**Paginated lists:** use `profile.tablePageSize` (allowed: 10, 20, 50, 100; default 20) for API `pageSize` and for client-side slices. Footer must use `ListPagination` with the items-range label, not page-index-only copy.

---

## Authentication

- **Access JWT** stored in `localStorage` as `auth_token`; user ID as `user_id`
- **Refresh token** in httpOnly cookie `ft_refresh` (path `/api`); all `http` calls use `credentials: "include"`
- `http.ts` injects the access token when valid, attempts **cookie refresh** on 401 or before guarded navigation (`ensureSession`), then auto-redirects to `/login` if refresh fails
- `useAuthGuard` (in `AppShell`) redirects unauthenticated users to `/login`
- `useSessionTimeout` uses `profile.sessionTimeoutMinutes` (**5–15**, default **10**) for idle deadline; JWT and refresh TTL align on login/refresh. Final **15-second** warning and wake/focus checks unchanged; modal offers **Stay signed in** or **Sign out**
- Lock detection: backend returns HTTP 429; frontend checks `message.includes("locked")`

---

## API Proxy

Frontend `/api/*` → proxied by Next.js to `${NEXT_PUBLIC_API_URL}/api/*`

Default: `NEXT_PUBLIC_API_URL=http://localhost:8080`

This means frontend code always uses paths like `/accounts`, `/transactions`, etc. (without `/api` prefix — that is prepended by `http.ts`'s `BASE_URL = "/api"`).

---

## Local run & seed credentials

**Commands (PowerShell and macOS/Linux):** [`AGENTS.md`](AGENTS.md) § *Quick start*. **Seed user / env vars:** [`ai-context/current-state.md`](ai-context/current-state.md) § *Dev Seed Credentials* and *Environment Variables*.

---

## CI/CD Rules

CI is the source of truth for dependency resolution. No "works on my machine" assumptions.

### Backend CI

Windows:

```text
cd backend
.\gradlew.bat clean build
```

macOS/Linux:

```text
cd backend
./gradlew clean build
```

- Default `skipIT` is **false**: `build` runs **unit tests** and **integration tests** (Testcontainers — **Docker must be running**).
- Use `-PskipIT=true` on agents or laptops **without** Docker when only unit tests should run.

### Frontend CI (GitHub Actions — reproducible install)

**Package manager:** **npm only** — do **not** use Yarn or pnpm. In **CI/CD**, use **`npm ci` only** (never `npm install`). On **developer machines**, normal workflow is **`npm install`** in `frontend/`; see [`AGENTS.md`](AGENTS.md).

```text
cd frontend
npm ci
npm run lint
npm run build
```

No implicit installs in CI. No environment-specific workarounds in application code.

---

## Testing

- **Gradle and npm scripts (PowerShell and macOS/Linux):** [`AGENTS.md`](AGENTS.md).
- **What exists today (suites, E2E gaps):** [`ai-context/current-state.md`](ai-context/current-state.md).
- **Mock patterns, SWR guard, JWT in tests, file layout:** [`ai-context/conventions.md`](ai-context/conventions.md) § *Testing Conventions*.

**What to unit test (summary):** `src/features/**/api/`, `src/features/**/hooks/` with real logic, `src/lib/http.ts` and `format.ts` (not static data-only modules).

**What not to unit test:** `src/app/` pages, `src/shared/components/`, `src/shared/hooks/` — prefer Playwright per `conventions.md`.

**Product gaps and backlog:** [`ai-context/current-state.md`](ai-context/current-state.md) — do not duplicate here.

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
9. **Update the owning doc** — see *Documentation maintenance* above and `ai-context/README.md`