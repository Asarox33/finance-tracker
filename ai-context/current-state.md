# Current State

**Scope:** Factual **inventory** of the repo: what is built, **pinned dependency versions**, test/E2E coverage, known limitations, backlog, and repo hygiene (CI files, docker folder). Do not copy long **how-to patterns** here — use `conventions.md` and `CLAUDE.md`.

Last analysed: 2026-05-13 (repo scan + doc cross-check). **Update this file** when features or versions change (see `ai-context/README.md`).

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
- ✅ Rate limiting on auth endpoints (`RateLimitingFilter`, Bucket4j) — includes `/api/auth/refresh`
- ✅ Spring Security configuration (stateless, JWT)
- ✅ OpenAPI / Swagger UI (dev only)
- ✅ Spring Actuator (`/actuator/health`, `/actuator/info`)
- ✅ Multi-profile config (`dev`, `prod`, `test`)
- ✅ Dev seed data (`V11_1__seed_dev_demo_data.sql` with known credentials and demo portfolio)

**Build tooling:** Gradle wrapper **9.5.0** (`backend/gradle/wrapper/gradle-wrapper.properties`). Version catalog: Kotlin **2.3.20**, Spring Boot **4.0.6** (verify `gradle/libs.versions.toml` — root docs such as `CLAUDE.md` may lag by a patch).

---

### Frontend — Implementation Status

Features are integrated as vertical slices. Status is **functional** where marked ✅; gaps are called out in the next column.

| Feature | Route(s) | API | Hooks | Unit tests | E2E |
|---|---|---|---|---|---|
| Auth (login / register / reset) | `/login`, `/login/register`, `/login/reset` | ✅ | ✅ | ✅ (`useAuth`, `authApi`, `format`) | ✅ `login.spec.ts` |
| User profile | `/profile` | ✅ | ✅ | ✅ (`userProfileApi`, `useUserProfile`) | ✅ `profile.spec.ts` |
| Institutions | `/institutions` | ✅ | ✅ | ✅ (`institutionsApi`, `useInstitutions`) | ✅ `institutions.spec.ts` |
| Assets | `/assets` | ✅ | ✅ | ✅ (`assetsApi`, `useAssets`) | — |
| Accounts | `/accounts` | ✅ | ✅ | ✅ (`accountsApi`, `useAccounts`) | ✅ `accounts.spec.ts` |
| Transactions | `/transactions` | ✅ | ✅ | ✅ (`transactionsApi`, `useTransactions`) | ✅ `transactions.spec.ts` |
| Prices | `/prices` | ✅ | ✅ | ✅ (`pricesApi`) | — |
| Analytics | `/analytics` | ✅ | ✅ | ✅ (`analyticsApi`, `useAnalytics`) | ✅ `analytics.spec.ts` |
| Dashboard | `/dashboard` | — (composes hooks) | — | — | ✅ `dashboard.spec.ts` |

**Shared / lib**

- ✅ `AppShell` — nav includes Dashboard, Institutions, **Assets**, Accounts, Transactions, **Prices**, Analytics; auth guard; **loading shell** while auth is resolving; profile-driven `ENG` / `FRA` / `ESP` / `ITA` i18n provider; **strict 10-minute inactivity timeout** with final 15-second warning, wake/focus deadline checks, and refresh-token revocation on logout; access-expiry modal fallback; responsive sidebar
- ✅ `ThemeToggle`, shared UI primitives (`ui.tsx`)
- ✅ `http.ts` — access JWT in `localStorage`, `credentials: "include"`, **refresh on 401** via cookie, `ensureSession()` for auth guard; **unit tests:** `src/lib/__tests__/http.test.ts`
- ✅ `format.ts`, `currencies.ts`, `countries.ts` (used by accounts / profile / institutions); money/date formatters accept locale overrides
- ✅ `shared/i18n` — typed dictionaries for `ENG`, `FRA`, `ESP`, `ITA`; UI copy, accessibility labels, placeholders, modals, enum labels, and money/date formatting are dictionary/locale driven. Public language selection is stored in a `preferred_language` cookie; authenticated pages sync it from `UserProfile.preferredLanguage`.

#### Routes (App Router)

| Route | Description |
|---|---|
| `/` | Redirects to `/dashboard` |
| `/login` | Sign-in, locked-account handling |
| `/login/register` | Registration |
| `/login/reset` | Password reset (request → OTP + new password → success) |
| `/dashboard` | **North-star home:** total portfolio value, **change vs yesterday**, **12-month real return** (after inflation when CPI data exists; fallback after-fees/gross), 30-day sparkline, account breakdown (**cash**, **holdings**, values); reference currency from profile |
| `/accounts` | Account cards with colored type labels, type filter, create form with institution picker, close/reactivate account, show-closed toggle, pagination, and dedicated links to filtered transaction history |
| `/institutions` | Debounced list filters, type filter, localized country-name sorted dropdowns, clear filters, pagination, shared-repository notice, create institution with client validation, colored type/country cards (`flag-icons` for country flags) |
| `/assets` | Paginated asset cards with type pills (ticker/ISIN when present), create form (name, type, currency, optional ISIN/ticker with client validation) |
| `/transactions` | Deep-linkable account selector (`accountId` query), optional closed-account history toggle, date-range filters, paginated table (**asset / quantity** column when recorded), create form with **AssetPicker** for `BUY`/`SELL`, **cash vs. asset-quantity** trade input (quantity mode requires a **price** for the trade date), soft-delete for active accounts, read-only history for closed accounts; transaction signs follow operation type |
| `/prices` | Manual asset prices + **`POST /api/prices/import`** (scheduled EOD job; equity quote provider still stub) |
| `/fees` | Optional **management fees** (rate calculator); nav via **profile** only |
| `/fx` | **`POST /api/fx/import`** + Frankfurter scheduled job; admin page `/fx` |
| `/inflation` | List CPI indices (`/inflation`); seeds in dev |
| `/analytics` | Period presets incl. **YTD**; gross / after-fees / after-inflation comparison |
| `/profile` | Preferences + links to fees, FX, inflation, prices |

#### Frontend Test Coverage (Jest)

| Area | File(s) |
|---|---|
| Auth | `features/auth/__tests__/useAuth.test.ts`, `authApi.test.ts`, `format.test.ts` |
| User profile | `features/user-profile/__tests__/userProfileApi.test.ts`, `useUserProfile.test.ts` |
| Institutions | `features/institutions/__tests__/institutionsApi.test.ts`, `useInstitutions.test.ts` |
| Assets | `features/assets/__tests__/assetsApi.test.ts`, `useAssets.test.ts` |
| Accounts | `features/accounts/__tests__/accountsApi.test.ts`, `useAccounts.test.ts` |
| Transactions | `features/transactions/__tests__/transactionsApi.test.ts`, `useTransactions.test.ts` |
| Prices | `features/price/__tests__/priceApi.test.ts` |
| Analytics | `features/analytics/__tests__/analyticsApi.test.ts`, `useAnalytics.test.ts` |
| HTTP client | `src/lib/__tests__/http.test.ts` |

#### E2E (Playwright)

| Spec | Coverage (summary) |
|---|---|
| `e2e/login.spec.ts` | Login, register, reset flows, keyboard nav, errors |
| `e2e/profile.spec.ts` | Profile form, preferences, sidebar |
| `e2e/institutions.spec.ts` | Institutions list (mocked API), navigation |
| `e2e/accounts.spec.ts` | Account list/create/close flows with mocked institutions |
| `e2e/transactions.spec.ts` | Transaction account selector, list/create flows |
| `e2e/analytics.spec.ts` | Analytics translated labels with mocked API |
| `e2e/dashboard.spec.ts` | Dashboard translated labels and empty state with mocked API |
| `e2e/accessibility.spec.ts` | Landmarks, ARIA, skip link, reset step |

`npm run test:e2e` uses **`--trace on`** (see `frontend/package.json`).

---

## Known Limitations / Technical Debt

### Backend

#### Analytics scalability

- `AccountPortAdapter` hard-caps at **1,000 accounts** per user query.
- `TransactionPortAdapter` and `FeePortAdapter` hard-cap at **10,000 items** per account.
- In-process use-case calls — no dedicated read model or caching.

#### Analytics port adapters

- `FeePortAdapter` may load up to 10,000 fees then **filter in memory** for date range.
- `TransactionPortAdapter` uses `ListAccountTransactions`; DB date filters depend on non-sentinel `from` / `to`.

#### `AssetPriceRepositoryAdapter`

- `findLatestByAssetIdOnOrBefore` runs a JPA query **twice** to resolve `appliedPriceDate` — redundant / fix candidate.

#### Password reset

- OTP verification may scan multiple stored tokens per user (hashed compare loop) — intentional but O(n).

#### Account ownership

- `AccountController.get()` enforces ownership in the controller layer; not duplicated inside the `GetAccount` use case.

#### CRUD surface

- **Account** has user-facing close/reactivate lifecycle actions. Close is a soft archive, not a permanent delete.
- **Transaction** has user-facing soft delete; normal list/detail/analytics ignore deleted transactions.
- Most other entities still have no general update/delete UI.

#### Registration profile

- `RegisterUser` creates profile with placeholder names (`Unknown`, etc.) until `PUT /api/users/me/preferences`.

### Frontend

#### Account creation UX

- Create-account form now uses an institution picker backed by `useInstitutions(0, undefined, undefined, 200)`. It is still a first-page dropdown, not a paginated/searchable picker for very large institution lists.

#### Transactions

- Transaction create form **filters types by account type** and shows **`AssetPicker`** (3+ character search) for BUY/SELL; backend enforces type matrix and `assetId` on trades in `RecordTransaction`.

#### Institution repository quality

- Institutions are shared reference data across users and the UI now explains why the list may already be partially filled.
- Future guardrail: prevent shared institution pollution with per-user creation rate limits, stronger duplicate normalization, audit/moderation tooling, or a “suggested institution” review state before global visibility.

#### Product polish

- No React **error boundary**.
- `useSessionTimeout` runs whenever `AppShell` mounts (including rare cases with token on public routes).
- **Per-user session length** in `user-profile`: `sessionTimeoutMinutes` (**5–15**, default **10**) drives idle timeout, access JWT, and refresh TTL on login/refresh. Env default remains **10 min**; hard cap **15 min** (`TokenService` / `RefreshSessionPolicy`).
- **`tablePageSize`** on profile (**10 / 20 / 50 / 100**, default **20**) drives list pagination and dashboard breakdown client slice.
- No optimistic mutations for creates/closes/updates.
- Root metadata remains static English (`Finance Tracker` title/description); page UI copy is dictionary-driven.

#### E2E gaps

- Playwright specs exist for auth, profile, institutions, accounts, transactions, analytics, dashboard, and accessibility. Coverage remains mocked and smoke-level for the later STEP 9 slices.

---

## Repository / Documentation Hygiene (audit notes)

| Item | State |
|---|---|
| **`AGENTS.md`** (repo root) | Present — Windows PowerShell and macOS/Linux commands, `npm install` (local) vs `npm ci` (CI), Gradle hints |
| **`.cursor/rules/agents-context.mdc`** | Present — `alwaysApply: true`, points to `AGENTS.md` + `CLAUDE.md` |
| **`.github/workflows`** | **Not present** in repo — CI/CD described in `CLAUDE.md` but **no GitHub Actions YAML** yet |
| **`docker/`** directory | **Not present** — optional full-stack compose referenced in `CLAUDE.md` only when added |
| **`.gitignore`** | Allows shared `.vscode/` files and selective `.idea/` (`codeStyles`, `inspectionProfiles`, `runConfigurations`) |
| **`frontend/next-env.d.ts`** | Listed in `.gitignore` — intentional for generated types; do not commit |

---

## Things to Do or Fix (prioritised backlog)

High value for the current **STEP 9** programme (`CLAUDE.md`):

1. ~~**Accounts picker scale**~~ — Searchable institution picker (min 3 characters, server-side name filter) on account create form.
2. **Institutions quality guardrails** — Add rate limits, normalization/duplicate detection, and moderation/review before a user-created institution becomes globally visible.
3. **Transactions** — Add optional asset selector when backend expects `assetId` for BUY/SELL.
4. **Analytics periods** — Add a YTD period choice alongside 3M/6M/1Y/3Y.
5. **Account-scoped analytics** — Once analytics supports account filters, add account-level analytics links from Dashboard Account Breakdown rows.
6. **FX imports** — Add a backend FX import path/job for latest external rates (candidate source: `taux.live`) and store them in `fx.fx_rates`; keep dashboard/analytics conversions routed through the `fx` module and historical lookup.
7. **Dashboard as-of date UX** — Decide whether Dashboard should expose an `asOf` date picker for historical global state or keep date exploration in Analytics.

Quality / engineering:

8. **E2E depth** — Broaden mocked smoke specs into interaction/error coverage for accounts, transactions, analytics, and dashboard.
9. **Backend** — Fix double-query in `AssetPriceRepositoryAdapter`; consider pushing fee date filters to SQL; revisit analytics caps or document limits in product copy.
10. **CI/CD** — Add `.github/workflows` using `npm ci` + `npm run lint` + `npm run build` for frontend; `cd backend && .\gradlew.bat clean build` on Windows or `cd backend && ./gradlew clean build` on macOS/Linux (with Docker service for IT, or `-PskipIT=true` split jobs per team policy).
11. **Versions** — After bumping dependencies, update **`current-state.md` § *Dependency Versions*** only (do not reintroduce pin matrices into `CLAUDE.md` or `architecture.md`).

Not built (unchanged product backlog):

- Backend: email verification, admin, import (CSV/OFX), audit, notifications, holdings, budget, etc.
- Frontend: fee / price / fx / inflation admin UIs (APIs exist), i18n beyond `fr-FR`, mobile-specific polish.

---

## Dependency Versions (Notable — from repo files)

| Component | Version | Source |
|---|---|---|
| Kotlin | 2.3.20 | `backend/gradle/libs.versions.toml` |
| Spring Boot | 4.0.6 | `backend/gradle/libs.versions.toml` |
| Gradle (wrapper) | 9.5.0 | `backend/gradle/wrapper/gradle-wrapper.properties` |
| JVM toolchain | 25 | `backend/build.gradle.kts` |
| Testcontainers | 2.0.4 | `libs.versions.toml` |
| JUnit Jupiter | 6.0.3 | `libs.versions.toml` |
| Next.js | 16.2.6 | `frontend/package.json` |
| React / React DOM | 19.2.6 | `frontend/package.json` |
| Recharts | 3.8.1 | `frontend/package.json` — dashboard 30-day portfolio chart |
| TypeScript | 6.0.3 | `frontend/package.json` |
| Playwright | 1.60.0 | `frontend/package.json` |
| Jest | 30.4.2 | `frontend/package.json` |

Pin versions remain policy; confirm compatibility before upgrading transitives.

---

## Dev Seed Credentials

Files: `backend/auth/src/main/resources/db/seed/V11_1__seed_dev_demo_data.sql`, `backend/auth/src/main/resources/db/seed/V11_2__fix_dev_demo_account_institutions.sql`

- **Primary email:** `github@meraville.fr`
- **Demo email:** `demo@meraville.fr`
- **Password:** `MyStrongPassword123!` for both seeded users
- **Primary user ID:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- **Demo user ID:** `b2c3d4e5-f6a7-4901-8cde-f23456789012`

The dev seed keeps the primary user account, resets seeded business data for the primary/demo users, and recreates a broad demo portfolio:

- Shared institutions across all institution types (`BANK`, `BROKER`, `INSURANCE`, `CRYPTO_EXCHANGE`, `OTHER`) so the second user demonstrates shared institution visibility.
- Primary user accounts across all account types (`CHECKING`, `SAVINGS`, `BROKERAGE`, `CRYPTO`, `REAL_ESTATE`, `RETIREMENT`, `OTHER`) with multi-currency balances.
- Assets, prices, transactions, fees, FX rates, and inflation indices covering implemented backend modules and future frontend slices.

> Seed runs via Flyway dev configuration. Production Flyway must not include ad-hoc seed locations — verify `application.yml` migration paths for prod.

---

## Environment Variables

### Backend

Configured via Spring profiles (`dev`, `prod`, `test`) — see `application*.yml` under `backend/app` (and modules).

| Variable | Role |
|---|---|
| `AUTH_JWT_SECRET` | HMAC secret for access JWT |
| `AUTH_JWT_ACCESS_EXPIRATION_MS` | Access JWT lifetime (ms); default **600000** (10 min); values above **600000** are clamped in `TokenService` |
| `AUTH_REFRESH_EXPIRATION_MS` | Refresh token row + cookie max-age (ms); default **600000** (10 min); values above **600000** are clamped in `RefreshSessionPolicy` |
| `AUTH_REFRESH_COOKIE_SECURE` | `true` / `false` — `Secure` flag on refresh cookie (`false` typical for local HTTP) |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend base URL for Next.js rewrites (`/api/*`) |

---

## What Is Not Yet Built

### Backend

Portfolio rebalancing, budget tracking, notifications, multi-currency time-series net worth, asset holdings, CSV/OFX import, audit log, multi-tenancy, email verification, admin APIs — see `module-rules.md` for module-specific gaps.

### Frontend

- **EOD equity price provider** not chosen — `StubAssetQuoteAdapter` returns no quotes until replaced.
- **Account-scoped analytics** links from dashboard deferred.
- Asset management UI at `/assets`.
- **Internationalised** formatting (replace hardcoded `fr-FR`).
- **Error boundary** and optional optimistic UI patterns.
- Broader **E2E** as listed above.
