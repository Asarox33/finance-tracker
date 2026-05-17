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
- ✅ Dev seed data (`V0_1__seed_dev_user.sql` with known credentials)

**Build tooling:** Gradle wrapper **9.5.0** (`backend/gradle/wrapper/gradle-wrapper.properties`). Version catalog: Kotlin **2.3.20**, Spring Boot **4.0.6** (verify `gradle/libs.versions.toml` — root docs such as `CLAUDE.md` may lag by a patch).

---

### Frontend — Implementation Status

Features are integrated as vertical slices. Status is **functional** where marked ✅; gaps are called out in the next column.

| Feature | Route(s) | API | Hooks | Unit tests | E2E |
|---|---|---|---|---|---|
| Auth (login / register / reset) | `/login`, `/login/register`, `/login/reset` | ✅ | ✅ | ✅ (`useAuth`, `authApi`, `format`) | ✅ `login.spec.ts` |
| User profile | `/profile` | ✅ | ✅ | ✅ (`userProfileApi`, `useUserProfile`) | ✅ `profile.spec.ts` |
| Institutions | `/institutions` | ✅ | ✅ | ✅ (`institutionsApi`, `useInstitutions`) | ✅ `institutions.spec.ts` |
| Accounts | `/accounts` | ✅ | ✅ | ✅ (`accountsApi`, `useAccounts`) | ✅ `accounts.spec.ts` |
| Transactions | `/transactions` | ✅ | ✅ | ✅ (`transactionsApi`, `useTransactions`) | ✅ `transactions.spec.ts` |
| Analytics | `/analytics` | ✅ | ✅ | ✅ (`analyticsApi`, `useAnalytics`) | ✅ `analytics.spec.ts` |
| Dashboard | `/dashboard` | — (composes hooks) | — | — | ✅ `dashboard.spec.ts` |

**Shared / lib**

- ✅ `AppShell` — nav includes Dashboard, Accounts, **Institutions**, Transactions, Analytics; auth guard; **loading shell** while auth is resolving; profile-driven `ENG` / `FRA` / `ESP` / `ITA` i18n provider; **session timeout modal** (idle + access expiry, 15s grace, refresh on “Stay signed in”); responsive sidebar
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
| `/dashboard` | Portfolio KPIs, 12-month performance, account breakdown with account/institution type badges and formatted currency values, and contextual getting-started checklist while setup is incomplete (reference currency from profile `preferredCurrency`) |
| `/accounts` | Account cards with colored type labels, type filter, create form with institution picker, close/reactivate account, show-closed toggle, pagination |
| `/institutions` | Debounced list filters, type filter, localized country-name sorted dropdowns, clear filters, pagination, shared-repository notice, create institution with client validation, colored type/country cards (`flag-icons` for country flags) |
| `/transactions` | Account selector, date-range filters, paginated table, create form, detail view, soft-delete action; transaction signs follow operation type for deposits/withdrawals/buys/sells/fees/taxes; **no asset selector** |
| `/analytics` | Period presets, performance variants; reference currency from profile `preferredCurrency` |
| `/profile` | Profile and preferences, including preferred currency and display language |

#### Frontend Test Coverage (Jest)

| Area | File(s) |
|---|---|
| Auth | `features/auth/__tests__/useAuth.test.ts`, `authApi.test.ts`, `format.test.ts` |
| User profile | `features/user-profile/__tests__/userProfileApi.test.ts`, `useUserProfile.test.ts` |
| Institutions | `features/institutions/__tests__/institutionsApi.test.ts`, `useInstitutions.test.ts` |
| Accounts | `features/accounts/__tests__/accountsApi.test.ts`, `useAccounts.test.ts` |
| Transactions | `features/transactions/__tests__/transactionsApi.test.ts`, `useTransactions.test.ts` |
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

- **No `assetId`** in create form for BUY/SELL.

#### Institution repository quality

- Institutions are shared reference data across users and the UI now explains why the list may already be partially filled.
- Future guardrail: prevent shared institution pollution with per-user creation rate limits, stronger duplicate normalization, audit/moderation tooling, or a “suggested institution” review state before global visibility.

#### Product polish

- No React **error boundary**.
- `useSessionTimeout` runs whenever `AppShell` mounts (including rare cases with token on public routes).
- **Per-user access session length (2–10 min)** in `user-profile` not implemented; global default/max **10 min** via `auth.jwt.access-expiration-ms` / `TokenService.MAX_ACCESS_EXPIRATION_MS`.
- No optimistic mutations for creates/closes/updates.
- Root metadata remains static English (`Finance Tracker` title/description); page UI copy is dictionary-driven.

#### E2E gaps

- Playwright specs exist for auth, profile, institutions, accounts, transactions, analytics, dashboard, and accessibility. Coverage remains mocked and smoke-level for the later STEP 9 slices.

---

## Repository / Documentation Hygiene (audit notes)

| Item | State |
|---|---|
| **`AGENTS.md`** (repo root) | Present — Windows PowerShell, `npm install` (local) vs `npm ci` (CI), Gradle hints |
| **`.cursor/rules/agents-context.mdc`** | Present — `alwaysApply: true`, points to `AGENTS.md` + `CLAUDE.md` |
| **`.github/workflows`** | **Not present** in repo — CI/CD described in `CLAUDE.md` but **no GitHub Actions YAML** yet |
| **`docker/`** directory | **Not present** — optional full-stack compose referenced in `CLAUDE.md` only when added |
| **`.gitignore`** | Allows shared `.vscode/` files and selective `.idea/` (`codeStyles`, `inspectionProfiles`, `runConfigurations`) |
| **`frontend/next-env.d.ts`** | Listed in `.gitignore` — intentional for generated types; do not commit |

---

## Things to Do or Fix (prioritised backlog)

High value for the current **STEP 9** programme (`CLAUDE.md`):

1. **Accounts picker scale** — Replace the first-page institution dropdown with search/pagination if institution volume grows beyond the current picker cap.
2. **Institutions quality guardrails** — Add rate limits, normalization/duplicate detection, and moderation/review before a user-created institution becomes globally visible.
3. **Transactions** — Add optional asset selector when backend expects `assetId` for BUY/SELL.

Quality / engineering:

4. **E2E depth** — Broaden mocked smoke specs into interaction/error coverage for accounts, transactions, analytics, and dashboard.
5. **Backend** — Fix double-query in `AssetPriceRepositoryAdapter`; consider pushing fee date filters to SQL; revisit analytics caps or document limits in product copy.
6. **CI/CD** — Add `.github/workflows` using `npm ci` + `npm run lint` + `npm run build` for frontend; `cd backend && .\gradlew.bat clean build` (with Docker service for IT, or `-PskipIT=true` split jobs per team policy).
7. **Versions** — After bumping dependencies, update **`current-state.md` § *Dependency Versions*** only (do not reintroduce pin matrices into `CLAUDE.md` or `architecture.md`).

Not built (unchanged product backlog):

- Backend: refresh tokens, email verification, admin, import (CSV/OFX), audit, notifications, holdings, budget, etc.
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
| TypeScript | 6.0.3 | `frontend/package.json` |
| Playwright | 1.60.0 | `frontend/package.json` |
| Jest | 30.4.2 | `frontend/package.json` |

Pin versions remain policy; confirm compatibility before upgrading transitives.

---

## Dev Seed Credentials

File: `backend/auth/src/main/resources/db/seed/V0_1__seed_dev_user.sql`

- **Email:** `github@meraville.fr`
- **Password:** `MyStrongPassword123!`
- **User ID:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

> Seed runs via Flyway dev configuration. Production Flyway must not include ad-hoc seed locations — verify `application.yml` migration paths for prod.

---

## Environment Variables

### Backend

Configured via Spring profiles (`dev`, `prod`, `test`) — see `application*.yml` under `backend/app` (and modules).

| Variable | Role |
|---|---|
| `AUTH_JWT_SECRET` | HMAC secret for access JWT |
| `AUTH_JWT_ACCESS_EXPIRATION_MS` | Access JWT lifetime (ms); default **600000** (10 min); values above **600000** are clamped in `TokenService` |
| `AUTH_REFRESH_EXPIRATION_MS` | Refresh token row + cookie max-age (ms) |
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

- **Asset** vertical (`features/assets/`, management UI) — not started.
- **Fees / price / fx / inflation** management pages — not started (REST exists).
- **Internationalised** formatting (replace hardcoded `fr-FR`).
- **Error boundary** and optional optimistic UI patterns.
- Broader **E2E** as listed above.
