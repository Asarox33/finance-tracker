# Conventions

## Naming

### Kotlin Classes

| Type | Convention | Example |
|---|---|---|
| Domain entity | `<Entity>` | `Account`, `FxRate` |
| Domain repository interface | `<Entity>Repository` | `AccountRepository` |
| Use case | `<Verb><Noun>` | `CreateAccount`, `ListUserAccounts`, `ComputePortfolioValue` |
| Spring config | `<Module>Config` | `AccountConfig` |
| REST controller | `<Entity>Controller` | `AccountController` |
| Repository adapter | `<Entity>RepositoryAdapter` | `AccountRepositoryAdapter` |
| JPA entity | `Jpa<Entity>Entity` | `JpaAccountEntity` |
| Spring Data repo | `Jpa<Entity>SpringRepository` | `JpaAccountSpringRepository` |
| Analytics port interface | `<Concept>Port` | `AccountPort`, `FxRatePort` |
| Analytics port adapter | `<Concept>PortAdapter` | `AccountPortAdapter`, `FxRatePortAdapter` |
| In-memory test repo | `InMemory<Entity>Repository` | `InMemoryAccountRepository` |
| Integration test app | `<Module>TestApplication` | `AccountTestApplication` |
| Integration test | `<Entity>RepositoryAdapterIT` | `AccountRepositoryAdapterIT` |

### Packages

All code lives under `com.finance.<module>`. Sub-packages are always exactly `domain`, `application`, or `infrastructure`.

### Methods / Functions

- Use case entry point is always named `execute(command)` or `execute(query)`
- Commands are nested `data class Command(...)` inside the use case class
- Queries are nested `data class Query(...)` inside the use case class
- Results are nested `data class Result(...)` inside the use case class when a structured return is needed

### Database

- Tables are snake_case, plural: `accounts`, `fx_rates`, `inflation_indices`
- Foreign key columns: `<referenced_table_singular>_id`, e.g. `user_id`, `account_id`
- Timestamps: `created_at TIMESTAMP NOT NULL DEFAULT NOW()`
- Enum columns: `VARCHAR(N)` with `EnumType.STRING`
- UUID primary keys everywhere
- Unique constraints: `uq_<table>_<columns>`, e.g. `uq_fx_rate_pair_date`
- Indexes: `idx_<table>_<columns>`, e.g. `idx_transactions_account_id`
- Migration files: `V<version>_<minor>__<description>.sql`

## Domain Layer Rules

- Domain classes are **immutable `data class`** objects
- All invariants enforced in `init {}` blocks by throwing `BusinessRuleViolationException`
- No Spring, JPA, or any framework annotations in domain classes
- Repository interfaces in the domain package depend only on domain types
- Enum types live in the domain package alongside the entity

## Application Layer Rules

- Use cases are **plain Kotlin classes** — no Spring annotations, no JPA
- Each use case has exactly **one `execute` method**
- Use cases depend only on domain repository interfaces (injected via constructor)
- Validation of application-level rules throws `InvalidRequestException`
- Domain rule violations throw `BusinessRuleViolationException`
- Not-found cases throw `NotFoundException`

## Infrastructure Layer Rules

- `*Config.kt` classes use `@Configuration` + `@Bean` to manually wire use cases
- Use cases are **not** `@Component` — they are instantiated in `*Config`
- Repository adapters are `@Component` and implement the domain repository interface
- JPA entities are mutable classes (no `data class`) to satisfy Hibernate requirements
- Controllers use `@AuthenticationPrincipal userId: String` and convert with `UUID.fromString(userId)`
- Request/response DTOs are nested `data class` inside the controller
- `@JsonCreator` / `@JsonProperty` on all request constructors

## Monetary / Numeric Conventions

- All monetary amounts are stored as `Long` in **minor units** (cents, pence, etc.) — never `Double` or `BigDecimal`
- FX rates and inflation factors are stored as `Long` with an explicit `scale: Int` (e.g. `rate=91500, scale=5` → `0.91500`)
- Division always happens last to minimize precision loss: `amount * rate / scale`
- `pow10(n)` helper function is used (not `Math.pow`) for integer exponentiation

## Testing Conventions

### Unit Tests (`*Test.kt`)

- Reside in `src/test/kotlin/`
- Use `InMemory<Entity>Repository` stubs defined in `TestFixtures.kt`
- Helper `test<Entity>(...)` factory functions with all-defaulted parameters
- No Spring context, no mocks — plain Kotlin instantiation
- Naming: `<className>Test`, test methods describe behavior (`closesAccountSuccessfully`, `rejectsBlankName`)

### Integration Tests (`*IT.kt`)

- Reside in `src/integrationTest/kotlin/`
- Use Testcontainers (`PostgreSQLContainer`) with `@DynamicPropertySource`
- Each module has a minimal `<Module>TestApplication` `@Configuration` class
- Only the repository adapter under test is wired (security excluded)
- Flyway runs migrations against the container

### Gradle Test Split

- `test` task: includes `**/*Test.class`, excludes `**/*IT.class`
- `integrationTest` task: includes `**/*IT.class`, skippable via `-PskipIT=true`

## Error Handling

Exceptions map to HTTP status codes in `GlobalExceptionHandler`:

| Exception | HTTP Status |
|---|---|
| `NotFoundException` | 404 |
| `InvalidRequestException` | 400 |
| `BusinessRuleViolationException` | 422 |
| `AuthenticationFailedException` | 401 |
| `AccountLockedException` | 429 |
| `DataIntegrityViolationException` | 409 |
| `MethodArgumentNotValidException` | 400 |
| Unhandled `Exception` | 500 |

All error responses include a `correlationId` field from MDC.

## HTTP API Conventions

- REST with JSON
- `POST` creates resources → `201 Created`
- `DELETE` soft-deletes → `204 No Content`
- Paginated list responses return `PageResult<T>` with `items`, `page`, `pageSize`, `totalItems`, `totalPages`
- Date params: `yyyy-MM-dd` with `@DateTimeFormat`
- All endpoints require Bearer JWT except `/api/auth/**` and actuator/swagger
