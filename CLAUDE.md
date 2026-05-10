# Finance Tracker — AI Development Guide

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
STEP 1  → Architecture design (NO CODE)
STEP 2  → Backend bootstrap only
STEP 3  → Shared module
STEP 4  → Business modules (one by one)
STEP 5  → FX module
STEP 6  → Inflation module
STEP 7  → Analytics module
STEP 8  → Frontend skeleton
STEP 9  → Frontend integration
STEP 10 → Test completion (missing coverage only)
STEP 11 → Docker setup
STEP 12 → CI/CD pipeline
```

Each step must end completely before the next begins. No forward implementation.

---

## Language Rule

All code, comments, logs, error messages, variable names, and test method names must be in **English only**. No French anywhere in the codebase.

---

## Repository Shape

Monorepo with two top-level directories:

```
finance-tracker/
├── backend/      # Kotlin 2.3.20 + Spring Boot 4.0.5, Gradle 9.4.1, JVM 25
├── frontend/     # Next.js 16, TypeScript 6, React 19, SWR 2.4
└── ai-context/   # Architecture docs (read these for deep dives)
```

**Deep-reference docs** (read when the task needs it):
- `/ai-context/architecture.md` — full stack overview, directory trees, auth flow, API mapping
- `/ai-context/conventions.md` — naming rules, testing patterns, formatting, accessibility
- `/ai-context/module-rules.md` — per-module responsibilities + frontend integration notes
- `/ai-context/current-state.md` — what is built, known limitations, what is missing

---

## Docker Structure

```
docker/
├── docker-compose.yml           # Production baseline
├── docker-compose.override.yml  # Dev overrides (dev seeds, ports, hot reload)
├── backend.Dockerfile
└── frontend.Dockerfile
```

**Run production:** `docker compose up -d`
**Run development:** `docker compose -f docker-compose.yml up -d` (override applied automatically)

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
| Environment switching | Docker Compose only (override file for dev) |
| Seeds | DEV only, injected via `docker-compose.override.yml` — never in PROD |
| Spring config | `application.yml` (shared) · `application-dev.yml` · `application-prod.yml` · `application-test.yml` (CI only) |

No `if (env == "dev")` logic in application code. Ever.

---

## Version Locking (Critical)

- **No version ranges** — `^`, `~`, `latest` are forbidden everywhere
- All versions must be explicit and pinned
- Backend: Gradle dependency locking enabled (`./gradlew dependencies --write-locks`)
- Frontend: `package-lock.json` is mandatory; CI uses `npm ci` only (never `npm install`)

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

### Backend CI
```bash
./gradlew clean build    # runs unit + integration tests (skipIT defaults to false)
```

### Frontend CI
```bash
npm ci          # never npm install
npm run lint
npm run build
```

No implicit installs. No environment-specific workarounds.

---

## Testing

### Backend
```bash
./gradlew build                          # unit + integration tests (default, needs Docker)
./gradlew build -PskipIT=true            # unit tests only (local dev, no Docker)
./gradlew testAggregateReport            # unit + integration + coverage report (needs Docker)

./gradlew.bat build -PskipIT=true        # Windows equivalent, unit tests only
./gradlew.bat testAggregateReport        # Windows equivalent, full report
```

### Frontend
```bash
npm test              # Jest unit + integration tests
npm run test:watch    # watch mode
npm run test:e2e      # Playwright E2E (requires dev server running)
npm run lint          # ESLint
```

**Frontend test patterns:**
- Mock `global.fetch` for API module tests
- Mock `jest.mock("next/navigation", ...)` for hooks that use `useRouter`
- Mock `jest.mock("swr", ...)` for hooks tests that don't need real SWR
- Seed `localStorage` via `jest.spyOn(Storage.prototype, "getItem")`
- Build test JWTs inline: `btoa(JSON.stringify({ sub, exp }))` as the payload segment

---

## Known Gaps (Things Not Yet Built)

**Backend:** refresh tokens, email verification, admin endpoints, asset holdings, budget tracking, notifications, import (CSV/OFX), audit log.

**Frontend:** institution picker UI (currently manual UUID entry), asset selector in transaction form, fee/price/FX/inflation management UIs, date range filter on transactions page, E2E tests for accounts/transactions/analytics, user-preferred currency applied to analytics (currently hardcoded `EUR`), internationalised formatting (currently hardcoded `fr-FR`).

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