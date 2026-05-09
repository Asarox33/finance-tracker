# Current State

Last analysed: 2026-05-09

---

## What Is Built and Working

### Backend — Fully Implemented

All 13 modules are implemented end-to-end (domain → application → infrastructure → tests):

| Module | Domain | Use Cases | REST API | Unit Tests | Integration Tests |
|---|---|---|---|---|---|
| shared | ✅ | — | — | ✅ | — |
| auth | ✅ | ✅ | ✅ | ✅ | ✅ |
| user-profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| institution | ✅ | ✅ | ✅ | ✅ | ✅ |
| asset | ✅ | ✅ | ✅ | ✅ | ✅ |
| account | ✅ | ✅ | ✅ | ✅ | ✅ |
| transaction | ✅ | ✅ | ✅ | ✅ | ✅ |
| fees | ✅ | ✅ | ✅ | ✅ | ✅ |
| price | ✅ | ✅ | ✅ | ✅ | ✅ |
| fx | ✅ | ✅ | ✅ | ✅ | ✅ |
| inflation | ✅ | ✅ | ✅ | ✅ | ✅ |
| analytics | ✅ | ✅ | ✅ | ✅ | — |
| app (entry point) | — | — | ✅ | — | — |

### Cross-Cutting Infrastructure (app module)
- ✅ JWT authentication (`JwtAuthenticationFilter`)
- ✅ Global exception handler (`GlobalExceptionHandler`) with correlation ID
- ✅ Correlation ID filter (`CorrelationIdFilter`, MDC-based)
- ✅ Rate limiting on auth endpoints (`RateLimitingFilter`, Bucket4j)
- ✅ Spring Security configuration (stateless, JWT)
- ✅ OpenAPI / Swagger UI (dev only)
- ✅ Spring Actuator (`/actuator/health`, `/actuator/info`)
- ✅ Multi-profile config (`dev`, `prod`, `test`)
- ✅ Dev seed data (`V0_1__seed_dev_user.sql` with known credentials)

---

### Frontend — Fully Implemented

All primary user-facing features are implemented end-to-end (UI → feature hook → API module → backend):

| Feature | Pages | API Module | Hook | Unit Tests | E2E Tests |
|---|---|---|---|---|---|
| Auth (login/register/reset) | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Accounts | ✅ | ✅ | ✅ | ✅ | — |
| Transactions | ✅ | ✅ | ✅ | — | — |
| Analytics | ✅ | ✅ | ✅ | ✅ | — |
| Dashboard | ✅ | (reuses analytics + accounts) | — | — | — |

#### Frontend Pages Implemented

| Route | Description |
|---|---|
| `/` | Redirects to `/dashboard` |
| `/login` | Email/password sign-in with locked-account detection |
| `/login/register` | Registration with password strength hint |
| `/login/reset` | 3-step password reset: request OTP → enter OTP + new password → success |
| `/dashboard` | Portfolio value KPI, 12-month performance KPI, active account count KPI, account breakdown table |
| `/accounts` | Paginated account list (card grid), create account form (inline), close account (with confirmation) |
| `/transactions` | Account selector, paginated transaction table, create transaction form (inline) |
| `/analytics` | Period selector (3M/6M/1Y/3Y), current portfolio value, gross/after-fees/after-inflation performance cards, detailed comparison table |
| `/profile` | Edit first name, last name, display name, date of birth, preferred currency |

#### Shared Infrastructure Implemented

- ✅ `AppShell` — sidebar navigation with active-link highlighting, display name from profile, sign-out button, responsive (collapses to top bar on mobile)
- ✅ `ThemeToggle` — dark/light mode with `localStorage` persistence, fixed top-right
- ✅ Shared UI primitives: `Card`, `Skeleton`, `Badge`, `Button`, `PageHeader`, `EmptyState`, `ErrorState`
- ✅ `useAuthGuard` — client-side auth guard, redirects unauthenticated users to `/login`
- ✅ `useSessionTimeout` — 5-minute inactivity auto-logout, resets on any user interaction event
- ✅ `useTheme` — theme state management with `data-theme` attribute on `<html>`
- ✅ HTTP client with JWT injection, expiry check, 401 auto-redirect
- ✅ Full ISO 4217 currency list (`src/lib/currencies.ts`) — used in account creation and profile preferences
- ✅ `fr-FR` locale formatting for money and dates throughout the UI

#### Frontend Test Coverage

| Test Suite | File | What Is Tested |
|---|---|---|
| `authApi` | — | (tested indirectly via `useAuth.test.ts`) |
| `useAuth` | `features/auth/__tests__/useAuth.test.ts` | `useLogin` (credentials, loading, error, locked, token storage), `useRegister` (success redirect, error), `usePasswordReset` (step transitions, backToRequest), `useLogout` (token removal) |
| `format` | `features/auth/__tests__/format.test.ts` | `formatMoney`, `formatBasisPoints`, `formatDate`, `today`, `monthsAgo` |
| `accountsApi` | `features/accounts/__tests__/accountsApi.test.ts` | `list` (auth header), `get`, `close` (DELETE), `create` (POST) |
| `analyticsApi` | `features/analytics/__tests__/analyticsApi.test.ts` | `portfolioValue` (query params), `performance`, `performanceAfterFees`, `performanceAfterInflation` |
| `userProfileApi` | `features/user-profile/__tests__/userProfileApi.test.ts` | `getMe` (auth header), `updatePreferences` (PUT, body content) |
| `useUserProfile` | `features/user-profile/__tests__/useUserProfile.test.ts` | `useUpdatePreferences` (success, error, loading, callback) |
| E2E: login | `e2e/login.spec.ts` | Page render, keyboard nav, bad credentials error, locked account, register flow, register redirect, reset request, reset confirm step, reset success |
| E2E: profile | `e2e/profile.spec.ts` | Profile form render with data, preferences submission, success message, keyboard nav, sidebar active link |
| E2E: accessibility | `e2e/accessibility.spec.ts` | Landmark roles, ARIA attributes on inputs, skip-to-content, reset email confirmation |

---

## Known Limitations / Technical Debt

### Backend

#### Analytics Scalability
- `AccountPortAdapter` hard-caps at **1,000 accounts** per user query
- `TransactionPortAdapter` and `FeePortAdapter` hard-cap at **10,000 items** per account
- These are in-process calls through use case layers — no dedicated read model or caching

#### Analytics Port Adapters — In-Memory Date Filtering
- `FeePortAdapter` fetches all fees for an account (up to 10,000) then **filters in memory** — not pushed to the DB query
- `TransactionPortAdapter` relies on `ListAccountTransactions` which does push date filters to the DB, but only when `from` is not `LocalDate.MIN` (converted to `null`)

#### `AssetPriceRepositoryAdapter` — Redundant Query
In `findLatestByAssetIdOnOrBefore`, the JPA query is executed **twice** to compute `appliedPriceDate`. This is a bug / inefficiency.

#### Password Reset — Security Note
- `findByUserIdAndOtpHash` fetches **all tokens for the user** and checks the OTP via `passwordEncoder.matches()` in a loop. Intentional (OTP is hashed) but O(n) on token count.

#### Account Ownership Check
- In `AccountController.get()`, ownership is checked manually after fetching. There is no ownership check in the `GetAccount` use case itself.

#### No Pagination on Analytics Accounts
- `AccountPortAdapter` uses `pageSize=1000` with no loop; users with more than 1,000 accounts will have silently incomplete analytics.

#### No `DELETE` / Update for Most Entities
- Only `account` has a close (soft delete) operation
- No update endpoints for `institution`, `asset`, `transaction`, `fees`, `price`, `fx`, `inflation`

#### `RegisterUser` — Default Profile Values
On registration, the user profile is created with hardcoded placeholder values (`firstName = "Unknown"`, etc.). The user must update via `PUT /api/users/me/preferences`.

### Frontend

#### No Transactions or Fees E2E Tests
- `e2e/` only covers auth flows and profile. Accounts, transactions, and analytics pages have no E2E tests.

#### No Dedicated Transaction or Account Unit Tests for Hooks
- `useTransactions` and `useAccounts` hooks have no dedicated unit tests; `accountsApi` is tested at the API module level only.

#### Hardcoded `fr-FR` Locale
- `formatMoney` and `formatDate` use `fr-FR` locale unconditionally. This does not adapt to the user's browser locale or preferred currency locale.

#### No Error Boundary
- There is no React error boundary. Unexpected runtime errors in a page will propagate uncaught.

#### `useSessionTimeout` — Always Active
- The session timeout (5 minutes) is active even on public pages (e.g. `/login`) if a token exists. This is benign but may be surprising.

#### `useAuthGuard` — Flash of Unauthenticated Content
- `useAuthGuard` runs in a `useEffect` (client-side only), so there is a brief flash where the protected page renders before the redirect fires if the token is absent. There is no server-side auth check.

#### No Optimistic Updates
- All mutations (create account, create transaction, close account, update profile) wait for the server response before updating the UI. No optimistic UI patterns are used.

#### Institution ID Must Be Known
- The "Create Account" form requires the user to manually enter an `institutionId` UUID. There is no institution search/picker UI. This is a friction point.

---

## Dependency Versions (Notable)

| Library | Version | Notes |
|---|---|---|
| Kotlin | 2.3.20 | Very recent |
| Spring Boot | 4.0.5 | Very recent (Spring Framework 7.x) |
| JVM toolchain | 25 | Recent LTS |
| Testcontainers | 2.0.4 | New major version |
| JUnit Jupiter | 6.0.3 | New major version |
| Gradle | 9.4.1 | Recent |
| Next.js | 16.2.4 | Very recent |
| TypeScript | 6.0.3 | Very recent |
| React | 19.2.5 | Very recent |
| SWR | 2.4.1 | Stable |
| Jest | 30.3.0 | Very recent |
| Playwright | 1.59.1 | Recent |

These are all very recent versions — confirm compatibility before upgrading any transitive dependencies.

---

## Dev Seed Credentials

File: `backend/auth/src/main/resources/db/seed/V0_1__seed_dev_user.sql`

- **Email:** `github@meraville.fr`
- **Password:** `MyStrongPassword123!`
- **User ID:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

> This seed runs via Flyway. Ensure the `db/seed` location is NOT included in the production Flyway config (it is not — only `db/migration/*` paths are listed in `application.yml`).

---

## Environment Variables

### Backend
Configured via Spring profiles (`dev`, `prod`, `test`) — see application.yml.

### Frontend

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend API base URL (used in Next.js rewrite proxy) |

The frontend proxies all `/api/*` calls to `${NEXT_PUBLIC_API_URL}/api/*` via `next.config.ts` rewrites, so the browser never talks directly to the backend domain.

---

## What Is Not Yet Built

### Backend
- Portfolio rebalancing / allocation targets
- Budget / spending tracking
- Notifications / alerts
- Multi-currency portfolio net worth over time (time-series)
- Asset holdings tracking (position management)
- Import from bank CSV / OFX / QIF
- Audit log / change history
- Multi-tenancy / team accounts
- Refresh token / token revocation
- Email verification on registration
- Admin endpoints

### Frontend
- Institution search / picker (currently requires manual UUID entry)
- Asset selector for BUY/SELL transactions
- Fee recording UI (backend exists, no frontend)
- Price recording UI (backend exists, no frontend)
- FX rate recording UI (backend exists, no frontend)
- Inflation index recording UI (backend exists, no frontend)
- Pagination on account list (currently `pageSize=20`, no page navigation)
- Date range filter on transactions (API supports it, UI does not expose it)
- Mobile-optimised transaction and analytics views
- Internationalised number/date formatting (currently hardcoded `fr-FR`)
- Institution management UI
- Asset management UI
- E2E tests for accounts, transactions, analytics pages
