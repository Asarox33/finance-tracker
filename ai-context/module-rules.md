# Module Rules

**Scope:** Per bounded context — **responsibilities, domain rules, REST behaviour, frontend integration notes** for that module only. For global trees and stack, see `architecture.md`. For “what is implemented today”, see `current-state.md`.

---

## Backend Modules

---

### shared

**Purpose:** Framework-free primitives shared across all modules. Kotlin Multiplatform (JVM + common).

**Contains:**
- `Currency` enum — full ISO 4217 list
- `Country` enum — full ISO 3166-1 list
- `Money` — immutable value object with minor-unit `Long` amount; arithmetic enforces same-currency
- `PageResult<T>` — generic pagination wrapper
- `PasswordPolicy` — validation rules (min 12 chars, upper, lower, digit, special)
- `CurrencyMetadata` / `CountryMetadata` — display names, fraction digits, default currencies
- Exception hierarchy: `ApplicationException`, `InvalidRequestException`, `AuthenticationFailedException`, `NotFoundException`, `BusinessRuleViolationException`

**Rules:**
- Zero framework dependencies — no Spring, no JPA
- `explicitApi()` enforced (all public declarations must have explicit visibility)

---

### auth

**Purpose:** User registration, login (JWT), password reset via OTP email.

**Domain rules:**
- Account locks after **3 failed login attempts** (`active = false`)
- Locked accounts can retry after **900-second cooldown** (`canAttemptLogin`)
- OTP is a 6-digit code, hashed before storage, expires after **10 minutes**
- Previous OTPs are invalidated on new reset request
- Password must satisfy `PasswordPolicy` (12+ chars, upper, lower, digit, special)

**Infrastructure notes:**
- `ConsoleEmailSender` active on `dev` profile; `ResendEmailSender` on `prod`
- `SecureOtpGenerator` uses `SecureRandom`
- `SpringPasswordEncoder` wraps BCrypt
- `JwtAuthenticationFilter` validates Bearer token; sets `SecurityContextHolder` principal = user UUID string
- `TokenService` issues **short-lived access JWT** (`auth.jwt.access-expiration-ms`); opaque **refresh tokens** stored hashed in `auth.refresh_tokens` with TTL `auth.refresh.expiration-ms`
- `POST /api/auth/refresh` and `POST /api/auth/logout` skip Bearer validation in `JwtAuthenticationFilter` so an expired access token does not block rotation or sign-out

**Dependencies:** `user-profile` (via `CreateUserProfilePort` — creates a profile on registration)

**Frontend integration:**
- `POST /api/auth/login` → JSON `{ accessToken }` (JWT) + **httpOnly** refresh cookie `ft_refresh` (path `/api`); frontend stores access token in `localStorage` and sends `credentials: "include"` on API calls
- `POST /api/auth/refresh` → JSON `{ accessToken }` + new refresh cookie (rotation)
- `POST /api/auth/logout` → 204 + clears refresh cookie; frontend clears access token from `localStorage`
- `POST /api/auth/register` → returns `{ userId }`; frontend redirects to `/login?registered=1`
- `POST /api/auth/password-reset/request` → 204; frontend advances to OTP entry step
- `POST /api/auth/password-reset/confirm` → 204; frontend shows success screen
- Locked account returns HTTP 429; frontend detects this by checking `error.message.includes("locked")`

---

### user-profile

**Purpose:** Stores display name, first/last name, preferred currency, preferred display language, birth date.

**Domain rules:**
- `firstName`, `lastName`, `displayName` must not be blank
- Profile ID equals the auth user ID (same UUID, no auto-increment)
- Profile is created during registration with placeholder values (`"Unknown"` names, `USD` currency, `ENG` language)

**Key use cases:** `CreateUserProfile`, `GetUserProfile`, `UpdateUserPreferences`

**Frontend integration:**
- `GET /api/users/me` → returns `UserProfile`; used in `AppShell` to show `displayName`, select the i18n dictionary, and in `/profile` page to pre-fill the form
- `PUT /api/users/me/preferences` → updates name, display name, preferred currency, preferred language, birth date
- The profile form is pre-populated via `useEffect` watching the SWR data; updates trigger `mutate()` to refresh
- Preferred language values are `ENG`, `FRA`, `ESP`, and `ITA`; frontend maps them to locale tags for dictionaries and formatting

---

### institution

**Purpose:** Reference data for financial institutions (banks, brokers, etc.).

**Domain rules:**
- `name` must not be blank
- `(name, country)` must be unique
- `bic` is optional; if provided, must match `^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$` (8 or 11 chars, uppercase)

**Key use cases:** `CreateInstitution`, `GetInstitution`, `ListInstitutions`

**Frontend integration:**
- **`/institutions`** — list with name/country filters, pagination, create form; feature code in `src/features/institutions/` (API + hooks + tests); E2E in `e2e/institutions.spec.ts`
- **Account creation (`/accounts`)** still uses a **manual `institutionId` UUID text field** — integrate a picker or deep-link from the institutions list (primary STEP 9 UX gap)

---

### asset

**Purpose:** Reference data for financial assets (stocks, ETFs, crypto, real estate, etc.).

**Domain rules:**
- `name` must not be blank
- `isin` is optional; if provided, must be exactly 12 characters
- `ticker` is optional; if provided, must not be blank
- `isin` is unique across all assets
- `isin` and `ticker` are stored uppercase

**Key use cases:** `CreateAsset`, `GetAsset`, `ListAssets`

**Frontend integration:**
- No asset management UI exists yet
- The transaction form does not expose an asset selector; `assetId` is not sent even for BUY/SELL transactions
- Assets must be created via the API directly

---

### account

**Purpose:** User-owned financial accounts (checking, savings, brokerage, etc.).

**Domain rules:**
- `name` must not be blank
- `status` is either `ACTIVE` or `CLOSED`
- Closing an already-closed account throws `BusinessRuleViolationException`
- Account access in the controller is restricted to the owning user (throws `NotFoundException` for unauthorized access)

**Key use cases:** `CreateAccount`, `GetAccount`, `ListUserAccounts`, `CloseAccount`

**Frontend integration:**
- `GET /api/accounts?page=0&pageSize=20` → `PageResult<Account>`; displayed as a card grid on `/accounts`
- **`useAccounts(page)`** exists, but the **page UI always uses page 0** — no list pagination controls on `/accounts` yet
- `POST /api/accounts` → creates account; requires `institutionId`, `name`, `type`, `currency` — **`institutionId` is still typed as a raw UUID** in the form (see institution module above)
- `DELETE /api/accounts/:id` → closes account (204); requires browser `confirm()` dialog
- Account types shown: `CHECKING`, `SAVINGS`, `BROKERAGE`, `CRYPTO`, `REAL_ESTATE`, `RETIREMENT`, `OTHER`
- Currency picker uses full ISO 4217 list from `src/lib/currencies.ts`
- `ACTIVE` accounts are filterable in the transaction page's account selector
- Dashboard shows a count of active accounts and their breakdown table (via `portfolioValue.snapshots`)

---

### transaction

**Purpose:** Records financial movements on accounts (deposits, withdrawals, buys, sells, etc.).

**Domain rules:**
- `label` must not be blank
- `amount` must not be zero (negative amounts are allowed for withdrawals/sells)
- FX rate fields (`appliedFxRate`, `appliedFxRateScale`, `appliedFxRateDate`, `appliedFxSourceCurrency`, `appliedFxTargetCurrency`) must be **all provided or all absent** — partial set is rejected
- `assetId` is optional (required for BUY/SELL, optional otherwise — not enforced at domain level)

**Key use cases:** `RecordTransaction`, `GetTransaction`, `ListAccountTransactions`

**Querying:** `ListAccountTransactions` supports optional `from`/`to` date range filtering.

**Frontend integration:**
- `GET /api/transactions?accountId=...&page=0&pageSize=20` → `PageResult<Transaction>`; displayed as a table on `/transactions`
- Account must be selected from a dropdown; only `ACTIVE` accounts are listed
- `POST /api/transactions` → body includes `accountId`, `type`, `amount` (minor units), `currency`, `date`, `label`, `notes?`
- Amount input accepts decimal (e.g. `100.50`); converted to minor units before sending: `Math.round(float * 10^2)`
- Negative amounts (for WITHDRAWAL etc.) are allowed — the input's placeholder says "use − for withdrawals"
- Transaction type badge colors: `DEPOSIT`/`DIVIDEND` → success (green), `WITHDRAWAL`/`FEE`/`TAX` → danger (red), `BUY`/`SELL` → warning (yellow), `TRANSFER`/`OTHER` → default (grey)
- Date range filter (`from`/`to`) is supported by the API and hook but **not yet exposed in the UI**
- Pagination is implemented (previous/next buttons, page X of Y display)

---

### fees

**Purpose:** Records fees associated with accounts or transactions.

**Domain rules:**
- `label` must not be blank
- `amount` must be **strictly positive** (fees are always costs)
- A fee must be linked to at least one of `accountId` or `transactionId` (both can be set)

**Key use cases:** `RecordFee`, `GetFee`, `ListFees`

**Frontend integration:**
- No fee recording or viewing UI exists yet
- Fees are included in analytics calculations (via `FeePortAdapter`) but not directly visible to the user in the UI

---

### price

**Purpose:** Historical asset price storage with fallback lookup.

**Domain rules:**
- `price` must be strictly positive
- `appliedPriceDate` defaults to `date` (set when a fallback price from a prior day is used)
- Unique constraint: one price per `(asset_id, date)`

**Lookup strategy:** Exact date first, then latest on-or-before within `price.lookback-days` (default 30). Throws `NotFoundException` if none found.

**Key use cases:** `RecordAssetPrice`, `GetAssetPrice`, `ListAssetPrices`

**Frontend integration:** No UI. Prices must be managed via the API directly.

---

### fx

**Purpose:** FX rate storage and currency conversion.

**Domain rules:**
- Source and target currency must differ
- `rate` must be strictly positive
- `rateScale` must be non-negative
- Unique constraint: one rate per `(source_currency, target_currency, date)`

**Lookup strategy:** Exact date first, then latest on-or-before within `fx.lookback-days` (default 30). Throws `NotFoundException` if none found.

**Key use cases:** `RecordFxRate`, `GetFxRate`, `ConvertAmount`

**Conversion formula:** `targetAmount = sourceAmount * rate / 10^rateScale`

**Frontend integration:**
- No FX rate management UI exists yet
- FX rates are used transparently by analytics to convert account balances to the reference currency
- The `Transaction` type includes FX rate fields (`appliedFxRate`, etc.) which are displayed in the transaction table as an "FX" badge when present

---

### inflation

**Purpose:** Consumer price index storage and inflation factor computation.

**Domain rules:**
- `indexValue` must be strictly positive
- `indexScale` must be non-negative
- `yearMonth` stored as `VARCHAR(7)` in `YYYY-MM` format
- Unique constraint: one index per `(currency, year_month)`

**Factor computation (`ComputeInflationFactor`):**
- Resolves `from` index: exact match → latest on-or-before → earliest on-or-after
- Resolves `to` index: exact match → earliest on-or-after → latest on-or-before (prefers future data for `to`)
- Factor = `toIndex * 10^6 / fromIndex` (factorScale = 6)
- Scales are harmonized before division when indices use different scales

**Key use cases:** `RecordInflationIndex`, `GetInflationIndex`, `ComputeInflationFactor`

**Frontend integration:** No UI. Inflation indices must be managed via the API directly.

---

### analytics

**Purpose:** Read-only cross-module computations. No database. No persistence.

**Port interfaces (in `domain/ports/`):**

| Port | Backed by |
|---|---|
| `AccountPort` | `ListUserAccounts` use case |
| `TransactionPort` | `ListAccountTransactions` use case |
| `FeePort` | `ListFees` use case |
| `FxRatePort` | `GetFxRate` use case |
| `InflationPort` | `ComputeInflationFactor` use case |

**Key computations:**

| Use Case | Description |
|---|---|
| `ComputePortfolioValue` | Sum of account balances in a reference currency at a given date |
| `ComputePerformance` | Gain/loss and basis points between two dates |
| `ComputePerformanceAfterFees` | Performance minus total fees in the period |
| `ComputePerformanceAfterInflation` | Performance adjusted for inflation (real return) |

**Account filtering:** Only `ACTIVE` accounts are included in analytics.

**FX conversion formula used throughout:**
`convertedAmount = amount * rate / 10^rateScale` (returns 0 if no rate available — silent degradation)

**Important limitation:** `AccountPortAdapter` fetches up to 1000 accounts (`pageSize=1000`); `TransactionPortAdapter` and `FeePortAdapter` fetch up to 10,000 items. Not suitable for users with very large datasets.

**Frontend integration:**
- `GET /api/analytics/portfolio-value?asOf=YYYY-MM-DD&referenceCurrency=EUR` → `PortfolioValue` with `totalValue`, `currency`, `asOf`, `snapshots[]`
- `GET /api/analytics/performance?from=...&to=...&referenceCurrency=EUR` → `PortfolioPerformance` with `startValue`, `endValue`, `gainLoss`, `gainLossBasisPoints`, `currency`, `from`, `to`
- Same shape for `performance-after-fees` and `performance-after-inflation`
- Dashboard uses `usePortfolioValue("EUR")` and `usePerformance("EUR", 12)` for its KPI cards
- Analytics page adds period selector (3M/6M/1Y/3Y) that changes the `months` parameter; `monthsAgo(n)` and `today()` compute the date range
- All three performance variants are shown side-by-side in a comparison grid and detail table
- Reference currency is hardcoded to `"EUR"` in all analytics pages; it does not yet read from user profile preferences

---

## Frontend Modules

---

### `src/lib/http.ts`

**Purpose:** Central HTTP client. All API calls go through this module.

**Key exports:**
- `http.get<T>(path)`, `http.post<T>(path, body)`, `http.put<T>(path, body)`, `http.delete<T>(path)`
- `getToken()`, `setToken(token)`, `removeToken()`
- `getUserId()`, `setUserId(id)`, `removeUserId()`
- `isAuthenticated()` — checks token existence and expiry

**Rules:**
- All requests prepend `BASE_URL = "/api"` to the path
- JWT is automatically injected as `Authorization: Bearer <token>` if present
- Token expiry is checked before every request; expired tokens are cleared silently
- On HTTP 401: clears token + userId + redirects to `/login` via `window.location.href`
- On HTTP 204 or zero `content-length`: returns `undefined` without calling `.json()`
- Throws the raw JSON error body for non-OK responses (for consistent error handling in hooks)

---

### `src/lib/format.ts`

**Purpose:** Formatting utilities for display values.

**Rules:**
- `formatMoney` accepts a locale override; `useFormatters()` applies the current profile language locale
- `formatDate` accepts a locale override; `useFormatters()` applies the current profile language locale
- `formatBasisPoints` always prefixes `+` for non-negative values; divides by 100 to get percentage
- `today()` and `monthsAgo(n)` always return `YYYY-MM-DD` strings (ISO 8601 date-only)

### `src/shared/i18n`

**Purpose:** Profile-driven dictionaries and formatting helpers for frontend internationalization.

**Rules:**
- Supported display languages are `ENG`, `FRA`, `ESP`, and `ITA`; backend stores the code on `UserProfile.preferredLanguage`.
- All authenticated UI user-facing copy must go through `useI18n().t(...)`: visible labels, headings, buttons, placeholders, hints, errors, empty states, table headers, modals, and accessibility text.
- Dynamic copy must use named placeholders such as `{date}`, `{currency}`, `{page}`, `{total}`, `{accountName}`, and `{institutionName}` instead of manual string concatenation.
- Display labels for known enums (account type/status, institution type, transaction type) live in dictionaries; persisted enum values remain untranslated in API payloads.
- Technical/user data remains raw: currency codes, BIC/SWIFT values, IDs, and user-entered names.

---

### `src/lib/currencies.ts`

**Purpose:** Full ISO 4217 currency list as a readonly const array with a derived `CurrencyCode` type.

**Rules:**
- Do not add currencies not in ISO 4217
- The array drives both the account creation currency picker and the profile preferred currency picker

---

### `src/shared/types/index.ts`

**Purpose:** Single source of truth for all TypeScript types shared between features.

**Key types:**

| Type | Description |
|---|---|
| `ApiError` | `{ message, errors?, correlationId? }` — shape of backend error responses |
| `PageResult<T>` | `{ items, totalItems, totalPages, page, pageSize, isEmpty, isFirst, isLast }` |
| `UserProfile` | `{ id, firstName, lastName, displayName, preferredCurrency, birthDate }` |
| `Account` | `{ id, userId, institutionId, name, type, currency, status }` |
| `AccountType` | Union: `"CHECKING" \| "SAVINGS" \| "BROKERAGE" \| "CRYPTO" \| "REAL_ESTATE" \| "RETIREMENT" \| "OTHER"` |
| `Transaction` | Full transaction with FX rate fields |
| `TransactionType` | Union: `"DEPOSIT" \| "WITHDRAWAL" \| "TRANSFER" \| "BUY" \| "SELL" \| "DIVIDEND" \| "FEE" \| "TAX" \| "OTHER"` |
| `PortfolioValue` | `{ totalValue, currency, asOf, snapshots: AccountSnapshot[] }` |
| `AccountSnapshot` | Per-account value in account currency and reference currency |
| `PortfolioPerformance` | `{ startValue, endValue, currency, gainLoss, gainLossBasisPoints, from, to }` |

**Rules:**
- Never duplicate these types in feature modules — always import from `@/shared/types`
- Amounts in all types are minor-unit integers matching backend representation
- Add new types here when a new backend DTO is introduced

---

### `src/shared/components/ui.tsx`

**Purpose:** Reusable UI primitives. No business logic.

| Component | Props | Notes |
|---|---|---|
| `Card` | `children`, `className?` | White-surface container with border and padding |
| `Skeleton` | `className?` | Animated shimmer placeholder |
| `Badge` | `children`, `variant?` (`default`/`success`/`danger`/`warning`) | Pill-shaped label |
| `Button` | All `<button>` attrs + `variant?`, `size?`, `loading?` | Shows spinner when `loading=true`; disables when loading or `disabled` |
| `PageHeader` | `title`, `description?`, `action?` | Page title area with optional right-side action slot |
| `EmptyState` | `title`, `description?` | Centered empty content indicator |
| `ErrorState` | `message?` | Red alert box for error states |

**Rules:**
- These components have no feature-specific logic
- Do not add business logic or API calls here
- Use `clsx` for conditional class merging
- All styling via `ui.module.css` using CSS custom properties

---

### `src/shared/components/AppShell.tsx`

**Purpose:** Authenticated page wrapper. Provides sidebar navigation, auth guard, session timeout.

**Behavior:**
- Renders `null` if `isAuthenticated()` is false (while redirect is in flight)
- Sidebar links: Dashboard (`⬡`), Accounts (`◫`), Transactions (`⇌`), Analytics (`◈`)
- Bottom section: display name from profile, Profile link (`◉`), Sign out button (`⊗`)
- Active link detected via `usePathname().startsWith(href)` — `aria-current="page"` is set
- Responsive: sidebar collapses to a horizontal top bar on screens ≤768px; labels hidden, only icons shown

**Rules:**
- Every authenticated layout (`dashboard/layout.tsx`, `accounts/layout.tsx`, etc.) must wrap children in `<AppShell>`
- Do not add page-specific content to `AppShell`
- `useSessionTimeout` must remain called inside `AppShell` (it attaches global event listeners)
