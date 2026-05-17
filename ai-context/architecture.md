# Architecture

**Scope:** **Structure** — monorepo layout, module trees, hexagonal pattern, routing/source trees, auth flow, API mapping, database schemas, security overview. **Not** pinned patch versions (see `current-state.md` § *Dependency Versions*). **Not** execution modes or STEP pipeline (see `CLAUDE.md`). See `ai-context/README.md` for the documentation map.

## Overview

Finance Tracker is a **monorepo** with a Kotlin/Spring Boot backend and a Next.js frontend. The backend follows **Hexagonal Architecture (Ports & Adapters)** strictly, organized as a **multi-module Gradle project**. The frontend follows a **feature-oriented architecture** using Next.js App Router with CSS Modules.

---

## Technology Stack

High level only — **exact versions** live in **`current-state.md`** (from `backend/gradle/libs.versions.toml`, `gradle-wrapper.properties`, and `frontend/package.json`).

### Backend

| Layer | Technology |
|---|---|
| Language | Kotlin (JVM toolchain 25) |
| Framework | Spring Boot 4.x (WebMVC, Data JPA, Security) |
| Database | PostgreSQL, Flyway (per-module schema migrations) |
| Auth | JWT (JJWT), BCrypt |
| API Docs | SpringDoc OpenAPI |
| Email | Resend (prod), Console logger (dev) |
| Rate Limiting | Bucket4j |
| Build | Gradle wrapper + version catalog (`libs.versions.toml`) |
| Testing | JUnit Jupiter, Testcontainers |
| Coverage | Kover |

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 6 (strict mode) |
| Data Fetching | SWR |
| Styling | CSS Modules (no external UI library) |
| Unit/Integration Tests | Jest + React Testing Library |
| E2E Tests | Playwright |
| Utilities | clsx |
| Node Requirement | >=20.9.0 |

---

## Backend Module Structure

```
backend/
├── app/                  # Spring Boot entry point, security, global filters
├── shared/               # Kotlin Multiplatform: domain primitives (no framework deps)
├── auth/                 # Authentication: register, login, password reset, JWT
├── user-profile/         # User profile CRUD
├── institution/          # Financial institutions (banks, brokers…)
├── asset/                # Financial assets (stocks, ETFs, crypto…)
├── account/              # User accounts (checking, savings, brokerage…)
├── transaction/          # Transaction recording & listing
├── fees/                 # Fee recording per account/transaction
├── price/                # Asset price history
├── fx/                   # FX rate storage & currency conversion
├── inflation/            # Inflation index storage & factor computation
└── analytics/            # Portfolio value & performance computation (read-only, no DB)
```

## Frontend Source Structure

```
frontend/src/
├── app/                          # Next.js App Router pages & layouts
│   ├── layout.tsx                # Root layout (metadata, globals.css, ThemeToggle)
│   ├── page.tsx                  # Root redirect → /dashboard
│   ├── globals.css               # Global CSS variables, resets, base styles
│   ├── login/                    # Auth pages (no AppShell)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Login form
│   │   ├── register/page.tsx     # Registration form
│   │   └── reset/page.tsx        # Password reset (3-step: request→confirm→done)
│   ├── dashboard/                # Portfolio KPIs + quick links + account breakdown / empty state
│   ├── accounts/                 # Account list + create + close/reactivate
│   ├── institutions/             # Shared institution list, debounced filters, create, type/country cards
│   ├── transactions/             # Transaction list + create + detail + soft delete
│   ├── analytics/                # Performance comparison + period details
│   └── profile/                  # User profile edit form
├── features/                     # Business feature modules
│   ├── auth/
│   │   ├── api/authApi.ts        # login, register, requestPasswordReset, confirmPasswordReset
│   │   ├── hooks/useAuth.ts      # useLogin, useRegister, usePasswordReset, useLogout
│   │   └── __tests__/
│   ├── accounts/
│   │   ├── api/accountsApi.ts    # list, get, create, close, reactivate
│   │   ├── hooks/useAccounts.ts  # useAccounts, useAccount
│   │   └── __tests__/
│   ├── institutions/
│   │   ├── api/institutionsApi.ts
│   │   ├── hooks/useInstitutions.ts
│   │   └── __tests__/
│   ├── analytics/
│   │   ├── api/analyticsApi.ts   # portfolioValue, performance, performanceAfterFees, performanceAfterInflation
│   │   ├── hooks/useAnalytics.ts # usePortfolioValue, usePerformance, usePerformanceAfterFees, usePerformanceAfterInflation
│   │   └── __tests__/
│   ├── transactions/
│   │   ├── api/transactionsApi.ts # list, get, create, delete
│   │   ├── hooks/useTransactions.ts
│   │   └── __tests__/
│   └── user-profile/
│       ├── api/userProfileApi.ts  # getMe, updatePreferences
│       ├── hooks/useUserProfile.ts # useUserProfile, useUpdatePreferences
│       └── __tests__/
├── shared/
│   ├── components/
│   │   ├── AppShell.tsx          # Sidebar nav + auth guard + loading shell
│   │   ├── ThemeToggle.tsx       # Dark/light toggle (fixed position)
│   │   └── ui.tsx                # Card, Skeleton, Badge, Button, PageHeader, EmptyState, ErrorState
│   ├── hooks/
│   │   ├── useAuthGuard.ts       # Redirects to /login if unauthenticated
│   │   ├── useSessionTimeout.ts  # Idle warning (5 min); proactive refresh near JWT exp; modal fallback
│   │   └── useTheme.ts           # Dark/light theme with localStorage persistence
│   ├── i18n/                     # Profile-driven dictionaries, locale mapping, and format hooks
│   └── types/index.ts            # All shared TypeScript interfaces & types
└── lib/
    ├── http.ts                   # Fetch wrapper, JWT token management, auth helpers
    ├── format.ts                 # formatMoney, formatDate, formatBasisPoints, today, monthsAgo
    ├── currencies.ts             # Full ISO 4217 currency list (const array + CurrencyCode type)
    └── countries.ts              # Country metadata (used by institutions UI)
```

---

## Backend Hexagonal Architecture Pattern

Every domain module (except `shared` and `analytics`) follows the same three-layer layout:

```
<module>/src/main/kotlin/com/finance/<module>/
├── domain/
│   ├── <Entity>.kt              # Pure data class with init-time invariants
│   ├── <Entity>Repository.kt    # Repository interface (port)
│   └── <EnumType>.kt
├── application/
│   └── <UseCase>.kt             # One class per use case, depends only on domain interfaces
└── infrastructure/
    ├── <Entity>Config.kt        # Spring @Configuration: wires use cases with repository beans
    ├── <Entity>Controller.kt    # @RestController: HTTP adapter
    ├── <Entity>RepositoryAdapter.kt  # Implements domain repository using JPA
    ├── Jpa<Entity>Entity.kt     # JPA entity (mutable)
    └── Jpa<Entity>SpringRepository.kt  # Spring Data JPA interface
```

The `analytics` module differs: it has **no DB of its own** and depends on other modules through **port interfaces** (`AccountPort`, `TransactionPort`, `FxRatePort`, etc.), with adapters in `infrastructure/adapters/` that delegate to the appropriate use cases.

---

## Frontend Architecture Patterns

### Routing & Layout

- **App Router** with nested layouts. All authenticated pages wrap their content in `<AppShell>`.
- Auth pages (`/login/**`) use a minimal layout with no sidebar.
- Root page (`/`) redirects to `/dashboard`.
- API routes are proxied: Next.js rewrites `/api/:path*` → `${NEXT_PUBLIC_API_URL}/api/:path*` via `next.config.ts`.

### Data Fetching

- All server data fetching uses **SWR** with feature-local hooks (e.g. `useAccounts`, `usePortfolioValue`).
- SWR keys are arrays: `["accounts", page]`, `["portfolio-value", asOf, currency]`, etc.
- Mutations call the API directly then invoke `mutate()` to revalidate.
- No global state store — all state is local to components or SWR cache.

### HTTP Client (`src/lib/http.ts`)

- Thin wrapper around `fetch` with automatic JWT injection.
- Token stored in `localStorage` under key `auth_token`; user ID under `user_id`.
- On 401 response: clears token + user ID, redirects to `/login`.
- Token expiry is checked client-side before each request; expired tokens are cleared immediately.
- Exports: `http.get`, `http.post`, `http.put`, `http.delete`, plus `getToken`, `setToken`, `removeToken`, `getUserId`, `setUserId`, `removeUserId`, `isAuthenticated`.

### Authentication Flow

1. `useLogin` → calls `authApi.login` → stores token + extracts `sub` claim as `user_id` → pushes to `/dashboard`.
2. `useAuthGuard` (in `AppShell`) → checks `isAuthenticated()` on mount → redirects to `/login` if false.
3. `useSessionTimeout` (in `AppShell`) → resets a 5-minute inactivity timer on user events → calls `logout()` on expiry.
4. `useLogout` → removes token + userId → pushes to `/login`.

### Theming

- Dark/light theme toggled via `data-theme` attribute on `<html>`.
- CSS custom properties (e.g. `--bg`, `--surface`, `--accent`) defined in `globals.css` for both themes.
- Theme preference persisted in `localStorage` under key `theme`. Default is `dark`.
- `ThemeToggle` is rendered in the root layout (fixed top-right), visible on all pages.

### Internationalization

- `UserProfile.preferredLanguage` stores the user display language as `ENG`, `FRA`, `ESP`, or `ITA`.
- The root layout mounts the shared i18n provider. Public selection is stored in a `preferred_language` cookie; authenticated pages sync the root provider from the profile language.
- `src/shared/i18n` owns typed dictionaries, language-to-locale mapping, placeholder interpolation, and `useFormatters()` for locale-aware money/date formatting.
- UI copy, accessibility labels, placeholders, modals, and enum display labels are dictionary-driven. Registration sends the selected public language so new profiles inherit it.

---

## Backend Dependency Flow

```
app  →  [all modules]
analytics  →  account, transaction, fees, fx, inflation (via ports)
auth  →  user-profile (via CreateUserProfilePort)
<all modules>  →  shared
```

Modules never depend on each other's infrastructure layer — only on application-layer use cases or through defined ports.

---

## Frontend ↔ Backend API Mapping

| Frontend Feature | API Endpoints Used |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh` (internal session refresh), `POST /api/auth/logout`, `POST /api/auth/password-reset/request`, `POST /api/auth/password-reset/confirm` |
| User Profile | `GET /api/users/me`, `PUT /api/users/me/preferences` (includes preferred currency and display language) |
| Institutions | `GET /api/institutions?page&pageSize&name&country`, `GET /api/institutions/:id`, `POST /api/institutions` |
| Accounts | `GET /api/accounts?includeClosed=...`, `GET /api/accounts/:id`, `POST /api/accounts`, `DELETE /api/accounts/:id`, `POST /api/accounts/:id/reactivate` |
| Transactions | `GET /api/transactions?accountId=...&from=...&to=...`, `GET /api/transactions/:id`, `POST /api/transactions`, `DELETE /api/transactions/:id` (soft delete) |
| Analytics | `GET /api/analytics/portfolio-value`, `GET /api/analytics/performance`, `GET /api/analytics/performance-after-fees`, `GET /api/analytics/performance-after-inflation` |

---

## Database Schema Layout

Each module owns a dedicated PostgreSQL schema, managed independently via Flyway:

| Module | Schema | Migration path |
|---|---|---|
| auth | `auth` | `classpath:db/migration/auth` |
| user-profile | `user_profile` | `classpath:db/migration/user_profile` |
| institution | `institution` | `classpath:db/migration/institution` |
| asset | `asset` | `classpath:db/migration/asset` |
| account | `account` | `classpath:db/migration/account` |
| transaction | `transaction` | `classpath:db/migration/transaction` |
| fees | `fees` | `classpath:db/migration/fees` |
| price | `price` | `classpath:db/migration/price` |
| fx | `fx` | `classpath:db/migration/fx` |
| inflation | `inflation` | `classpath:db/migration/inflation` |

Migration filenames follow the pattern `V<major>_<minor>__<description>.sql`. Schema versions are numbered 1–10 in module order.

---

## Security Architecture

- Stateless JWT authentication via `JwtAuthenticationFilter` (placed before `UsernamePasswordAuthenticationFilter`)
- `@AuthenticationPrincipal` injects the user UUID (as `String`) into controllers
- Public endpoints: `/api/auth/**`, `/actuator/health`, `/actuator/info`, Swagger UI
- Rate limiting on auth endpoints via `RateLimitingFilter` (Bucket4j, 10 req/min per IP)
- `X-Correlation-Id` header propagated through MDC via `CorrelationIdFilter`
- Frontend: short-lived **access JWT** (default **10 min**, max cap on backend) in `localStorage`; **refresh** in httpOnly cookie (default **7 days**); `fetch` with credentials; refresh on 401; **proactive refresh** while active near expiry; session timeout modal (idle + failed refresh) with 15s grace

---

## Profiles

| Profile | Purpose |
|---|---|
| `dev` | Console email sender, SQL logging, Swagger enabled |
| `prod` | Resend email sender, Swagger disabled, WARN log level |
| `test` | Testcontainers PostgreSQL, no security auto-config |
