# Current State

Last analysed: 2026-05-08

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

### Frontend
- ⚠️ Frontend directory exists (Next.js / TypeScript, `.gitignore` and `.gitattributes` reference it) but **no frontend source files were provided** for analysis.

## Known Limitations / Technical Debt

### Analytics Scalability
- `AccountPortAdapter` hard-caps at **1,000 accounts** per user query
- `TransactionPortAdapter` and `FeePortAdapter` hard-cap at **10,000 items** per account
- These are in-process calls through use case layers — no dedicated read model or caching

### Analytics Port Adapters — In-Memory Date Filtering
- `FeePortAdapter` fetches all fees for an account (up to 10,000) then **filters in memory** — not pushed to the DB query
- `TransactionPortAdapter` relies on `ListAccountTransactions` which does push date filters to the DB, but only when `from` is not `LocalDate.MIN` (converted to `null`)

### `AssetPriceRepositoryAdapter` — Redundant Query
In `findLatestByAssetIdOnOrBefore`, the JPA query is executed **twice** to compute `appliedPriceDate`. This is a bug / inefficiency:
```kotlin
// The same query is called twice — the second call is redundant
?.copy(appliedPriceDate = jpaRepo.findLatestOnOrBefore(...).content.firstOrNull()?.date ?: date)
```

### Password Reset — Security Note
- `findByUserIdAndOtpHash` in `PasswordResetTokenRepositoryAdapter` fetches **all tokens for the user** and checks the OTP via `passwordEncoder.matches()` in a loop. This is intentional (OTP is hashed) but means comparison is O(n) on token count. Invalidation on new request keeps this to 1 active token.

### Account Ownership Check
- In `AccountController.get()`, ownership is checked manually after fetching (`if account.userId != userId throw NotFoundException`). There is no ownership check in the `GetAccount` use case itself — the controller is the only enforcement point.

### No Pagination on Analytics Accounts
- `AccountPortAdapter` uses `pageSize=1000` with no loop, meaning users with more than 1,000 accounts will have silently incomplete analytics.

### No `DELETE` / Update for Most Entities
- Only `account` has a close (soft delete) operation
- No update endpoints for `institution`, `asset`, `transaction`, `fees`, `price`, `fx`, `inflation`
- No delete for any entity (referential integrity is one-way; no cascade needed yet)

### `RegisterUser` — Default Profile Values
On registration, the user profile is created with hardcoded placeholder values:
```kotlin
firstName = "Unknown", lastName = "Unknown", displayName = "New user", preferredCurrency = Currency.USD
```
The user must call `PUT /api/users/me/preferences` to personalize their profile.

## Dependency Versions (Notable)

| Library | Version | Notes |
|---|---|---|
| Kotlin | 2.3.20 | Very recent |
| Spring Boot | 4.0.5 | Very recent (Spring Framework 7.x) |
| JVM toolchain | 25 | Recent LTS |
| Testcontainers | 2.0.4 | New major version |
| JUnit Jupiter | 6.0.3 | New major version |
| Gradle | 9.4.1 | Recent |

These are all very recent versions — confirm compatibility before upgrading any transitive dependencies.

## Dev Seed Credentials

File: `backend/auth/src/main/resources/db/seed/V0_1__seed_dev_user.sql`

- **Email:** `github@meraville.fr`
- **Password:** `MyStrongPassword123!`
- **User ID:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

> This seed runs via Flyway. Ensure the `db/seed` location is NOT included in the production Flyway config (it is not — only `db/migration/*` paths are listed in `application.yml`).

## What Is Not Yet Built

Based on the codebase, the following features are **absent** and likely candidates for future development:

- Frontend implementation (UI)
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
