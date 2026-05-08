# Architecture

## Overview

Finance Tracker is a **monorepo** with a Kotlin/Spring Boot backend and a Next.js frontend (frontend code not provided). The backend follows **Hexagonal Architecture (Ports & Adapters)** strictly, organized as a **multi-module Gradle project**.

## Technology Stack

| Layer | Technology |
|---|---|
| Language | Kotlin 2.3.20, JVM 25 |
| Framework | Spring Boot 4.0.5 (WebMVC, Data JPA, Security) |
| Database | PostgreSQL 16, Flyway 12 (schema migrations) |
| Auth | JWT (JJWT 0.13), BCrypt |
| API Docs | SpringDoc OpenAPI 3 |
| Email | Resend (prod), Console logger (dev) |
| Rate Limiting | Bucket4j |
| Frontend | Next.js (TypeScript) |
| Build | Gradle 9.4.1 with version catalog (`libs.versions.toml`) |
| Testing | JUnit 5 (Jupiter 6), Testcontainers 2 |
| Coverage | Kover 0.9.8 |

## Module Structure

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

## Hexagonal Architecture Pattern

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

## Dependency Flow

```
app  →  [all modules]
analytics  →  account, transaction, fees, fx, inflation (via ports)
auth  →  user-profile (via CreateUserProfilePort)
<all modules>  →  shared
```

Modules never depend on each other's infrastructure layer — only on application-layer use cases or through defined ports.

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

## Security Architecture

- Stateless JWT authentication via `JwtAuthenticationFilter` (placed before `UsernamePasswordAuthenticationFilter`)
- `@AuthenticationPrincipal` injects the user UUID (as `String`) into controllers
- Public endpoints: `/api/auth/**`, `/actuator/health`, `/actuator/info`, Swagger UI
- Rate limiting on auth endpoints via `RateLimitingFilter` (Bucket4j, 10 req/min per IP)
- `X-Correlation-Id` header propagated through MDC via `CorrelationIdFilter`

## Profiles

| Profile | Purpose |
|---|---|
| `dev` | Console email sender, SQL logging, Swagger enabled |
| `prod` | Resend email sender, Swagger disabled, WARN log level |
| `test` | Testcontainers PostgreSQL, no security auto-config |
