# Conventions

---

## Backend Naming

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

---

## Frontend Naming

### Files & Directories

| Type | Convention | Example |
|---|---|---|
| Page component | `page.tsx` | `src/app/accounts/page.tsx` |
| Layout component | `layout.tsx` | `src/app/accounts/layout.tsx` |
| Page CSS Module | `page.module.css` | `src/app/accounts/page.module.css` |
| Feature API module | `<feature>Api.ts` (camelCase) | `accountsApi.ts`, `analyticsApi.ts` |
| Feature hook module | `use<Feature>.ts` | `useAccounts.ts`, `useAnalytics.ts` |
| Shared component | `PascalCase.tsx` | `AppShell.tsx`, `ThemeToggle.tsx` |
| Shared component CSS | `<Component>.module.css` | `AppShell.module.css` |
| Test files | `__tests__/<subject>.test.ts` | `__tests__/accountsApi.test.ts` |
| Shared types | `src/shared/types/index.ts` | (single barrel file) |

### TypeScript Identifiers

| Type | Convention | Example |
|---|---|---|
| React component | PascalCase function | `function AccountCard(...)` |
| Hook | `use<Name>` | `useAccounts`, `usePortfolioValue` |
| API object | `<feature>Api` (const) | `accountsApi`, `analyticsApi` |
| Interface | PascalCase | `Account`, `PageResult<T>`, `ApiError` |
| Type alias | PascalCase | `AccountType`, `TransactionType`, `CurrencyCode` |
| CSS module class | camelCase | `styles.pageHeader`, `styles.formGrid` |
| Enum-like const arrays | SCREAMING_SNAKE per item | `"CHECKING"`, `"SAVINGS"` (string literal unions) |

---

## Backend Domain Layer Rules

- Domain classes are **immutable `data class`** objects
- All invariants enforced in `init {}` blocks by throwing `BusinessRuleViolationException`
- No Spring, JPA, or any framework annotations in domain classes
- Repository interfaces in the domain package depend only on domain types
- Enum types live in the domain package alongside the entity

## Backend Application Layer Rules

- Use cases are **plain Kotlin classes** — no Spring annotations, no JPA
- Each use case has exactly **one `execute` method**
- Use cases depend only on domain repository interfaces (injected via constructor)
- Validation of application-level rules throws `InvalidRequestException`
- Domain rule violations throw `BusinessRuleViolationException`
- Not-found cases throw `NotFoundException`

## Backend Infrastructure Layer Rules

- `*Config.kt` classes use `@Configuration` + `@Bean` to manually wire use cases
- Use cases are **not** `@Component` — they are instantiated in `*Config`
- Repository adapters are `@Component` and implement the domain repository interface
- JPA entities are mutable classes (no `data class`) to satisfy Hibernate requirements
- Controllers use `@AuthenticationPrincipal userId: String` and convert with `UUID.fromString(userId)`
- Request/response DTOs are nested `data class` inside the controller
- `@JsonCreator` / `@JsonProperty` on all request constructors

---

## Frontend Component Rules

- **Pages** are `"use client"` components (they use hooks, event handlers, SWR).
- **Layouts** are minimal server components that wrap pages in `<AppShell>` or a plain fragment.
- Each authenticated section (`accounts/`, `transactions/`, `analytics/`, `dashboard/`, `profile/`) has its own `layout.tsx` that wraps `<AppShell>`.
- Auth pages (`login/`, `login/register/`, `login/reset/`) do **not** use `<AppShell>`.
- **Shared UI primitives** live in `src/shared/components/ui.tsx` and are exported from that single file: `Card`, `Skeleton`, `Badge`, `Button`, `PageHeader`, `EmptyState`, `ErrorState`.
- CSS Modules are co-located with their component (`page.module.css` beside `page.tsx`).
- No Tailwind, no external component libraries. All styling via CSS custom properties.

## Frontend Feature Module Rules

- Each feature has: `api/<feature>Api.ts`, `hooks/use<Feature>.ts`, optionally `__tests__/`.
- API modules export a plain object (`const <feature>Api = { ... }`) with typed methods — no classes.
- All API methods delegate to `http.get/post/put/delete` from `src/lib/http.ts`.
- Hooks use **SWR** for GET requests; mutations call API directly then call `mutate()`.
- Hooks do **not** contain JSX — they are pure logic.
- No cross-feature imports (e.g. `analytics` does not import from `accounts`).

## Frontend Shared Types Rules

- All shared TypeScript interfaces live in `src/shared/types/index.ts`.
- Do **not** duplicate type definitions in feature modules — import from `@/shared/types`.
- API response shapes must match backend DTOs exactly (snake_case → camelCase mapping is handled by the backend's Jackson config, frontend uses camelCase).
- Monetary amounts are `number` (minor units, e.g. cents) throughout. Formatting is done by `formatMoney` in `src/lib/format.ts`.

---

## Monetary / Numeric Conventions

### Backend
- All monetary amounts are stored as `Long` in **minor units** (cents, pence, etc.) — never `Double` or `BigDecimal`
- FX rates and inflation factors are stored as `Long` with an explicit `scale: Int` (e.g. `rate=91500, scale=5` → `0.91500`)
- Division always happens last to minimize precision loss: `amount * rate / scale`
- `pow10(n)` helper function is used (not `Math.pow`) for integer exponentiation

### Frontend
- Amounts received from the API are integers in minor units (e.g. `10050` = €100.50)
- `formatMoney(amount, currency, fractionDigits = 2)` in `src/lib/format.ts` divides by `10^fractionDigits` and formats using `Intl.NumberFormat("fr-FR", { style: "currency" })`
- When creating transactions, the UI collects a decimal string from the user (e.g. `"100.50"`) and converts to minor units: `Math.round(parseFloat(amount) * 10^fractionDigits)`
- Basis points for performance: `formatBasisPoints(bp)` → divides by 100 for percentage, prefixes `+` for non-negative values

---

## Frontend Formatting Conventions (`src/lib/format.ts`)

| Function | Description |
|---|---|
| `formatMoney(amount, currency, fractionDigits?)` | Formats minor-unit integer as currency string using `fr-FR` locale |
| `formatDate(dateString)` | Formats ISO date to `dd MMM yyyy` using `fr-FR` locale |
| `formatBasisPoints(bp)` | Converts basis points to percentage string with sign (e.g. `+15.00%`) |
| `today()` | Returns today's date as `YYYY-MM-DD` |
| `monthsAgo(n)` | Returns date `n` months ago as `YYYY-MM-DD` |

---

## Testing Conventions

### Backend Unit Tests (`*Test.kt`)

- Reside in `src/test/kotlin/`
- Use `InMemory<Entity>Repository` stubs defined in `TestFixtures.kt`
- Helper `test<Entity>(...)` factory functions with all-defaulted parameters
- No Spring context, no mocks — plain Kotlin instantiation
- Naming: `<className>Test`, test methods describe behavior (`closesAccountSuccessfully`, `rejectsBlankName`)

### Backend Integration Tests (`*IT.kt`)

- Reside in `src/integrationTest/kotlin/`
- Use Testcontainers (`PostgreSQLContainer`) with `@DynamicPropertySource`
- Each module has a minimal `<Module>TestApplication` `@Configuration` class
- Only the repository adapter under test is wired (security excluded)
- Flyway runs migrations against the container

### Backend Gradle Test Split

- `test` task: includes `**/*Test.class`, excludes `**/*IT.class`
- `integrationTest` task: includes `**/*IT.class`, skippable via `-PskipIT=true`

### Frontend Unit/Integration Tests

- Located in `src/features/<feature>/__tests__/` as `<subject>.test.ts` or `<subject>.test.tsx`
- Run with `jest --passWithNoTests` via `npm test`
- Test environment: `jest-environment-jsdom`
- API modules are tested by mocking `global.fetch` directly
- Hooks are tested with `renderHook` + `act` from `@testing-library/react`
- External modules (Next.js router, SWR, sibling API modules) are mocked with `jest.mock(...)`
- A valid JWT is constructed inline in tests: `btoa(JSON.stringify({ sub, exp }))` as the payload part
- `localStorage` is mocked via `jest.spyOn(Storage.prototype, "getItem")`
- Config: `jest.config.js` uses `nextJest({ dir: "./" })`, `moduleNameMapper: { "^@/(.*)$": "./src/$1" }`, `testMatch: ["**/__tests__/**/*.test.{ts,tsx}"]`

### Frontend E2E Tests (Playwright)

- Located in `frontend/e2e/` as `<subject>.spec.ts`
- Run with `npm run test:e2e`; dev server auto-started at `http://localhost:3000`
- Uses `page.route(...)` to intercept and mock API calls
- Uses `page.addInitScript(...)` to seed `localStorage` (auth tokens) before navigation
- Config: `playwright.config.ts`, single project (`chromium`), `baseURL: "http://localhost:3000"`
- Covered flows: login, register, password reset (all steps), profile view/edit, accessibility/ARIA

---

## Error Handling

### Backend — HTTP Status Codes

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

### Frontend — Error Handling

- `http.ts` throws the raw JSON error body on non-OK responses, so callers receive the backend's error object (`{ message, correlationId, ... }`).
- Feature hooks catch errors and expose them as typed state: `error: string | null` or `error: LoginError | null`.
- The `useLogin` hook specially detects "locked" in the error message to set `LoginError.locked = true`, which disables the submit button and shows a warning-styled alert.
- UI components render error states via `<ErrorState>` (shared) or inline `role="alert"` divs.
- On 401, `http.ts` auto-redirects to `/login` via `window.location.href`.

---

## HTTP API Conventions

### Backend
- REST with JSON
- `POST` creates resources → `201 Created`
- `DELETE` soft-deletes → `204 No Content`
- Paginated list responses return `PageResult<T>` with `items`, `page`, `pageSize`, `totalItems`, `totalPages`
- Date params: `yyyy-MM-dd` with `@DateTimeFormat`
- All endpoints require Bearer JWT except `/api/auth/**` and actuator/swagger

### Frontend
- All API calls go through `/api/...` (proxied by Next.js to `NEXT_PUBLIC_API_URL`)
- Pagination: `page` (0-indexed) and `pageSize` query params; response is `PageResult<T>`
- Date strings passed as `YYYY-MM-DD`; received dates formatted with `formatDate()` for display
- Transactions: amounts sent as minor-unit integers

---

## Accessibility Conventions (Frontend)

- All form inputs have associated `<label>` with matching `htmlFor`/`id`
- Required fields have `aria-required="true"`
- Error messages use `role="alert"` with `aria-live="assertive"`
- Success/status messages use `role="status"`
- Loading states use `aria-busy={true}` on buttons
- Navigation uses semantic `<nav>` with `aria-label`; active links have `aria-current="page"`
- Tables have `aria-label` and `scope="col"` on headers
- Icon-only buttons have `aria-label`
- Decorative icons have `aria-hidden="true"`
- Full keyboard navigation verified by E2E tests
- WCAG AA compliance target
