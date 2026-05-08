# Module Rules

Per-module reference: responsibilities, key domain rules, and important behaviors.

---

## shared

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

## auth

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
- `TokenService` issues JWT with configurable expiration (`auth.jwt.expiration-ms`)

**Dependencies:** `user-profile` (via `CreateUserProfilePort` — creates a profile on registration)

---

## user-profile

**Purpose:** Stores display name, first/last name, preferred currency, birth date.

**Domain rules:**
- `firstName`, `lastName`, `displayName` must not be blank
- Profile ID equals the auth user ID (same UUID, no auto-increment)
- Profile is created during registration with placeholder values (`"Unknown"` names, `USD` currency)

**Key use cases:** `CreateUserProfile`, `GetUserProfile`, `UpdateUserPreferences`

---

## institution

**Purpose:** Reference data for financial institutions (banks, brokers, etc.).

**Domain rules:**
- `name` must not be blank
- `(name, country)` must be unique
- `bic` is optional; if provided, must match `^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$` (8 or 11 chars, uppercase)

**Key use cases:** `CreateInstitution`, `GetInstitution`, `ListInstitutions`

---

## asset

**Purpose:** Reference data for financial assets (stocks, ETFs, crypto, real estate, etc.).

**Domain rules:**
- `name` must not be blank
- `isin` is optional; if provided, must be exactly 12 characters
- `ticker` is optional; if provided, must not be blank
- `isin` is unique across all assets
- `isin` and `ticker` are stored uppercase

**Key use cases:** `CreateAsset`, `GetAsset`, `ListAssets`

---

## account

**Purpose:** User-owned financial accounts (checking, savings, brokerage, etc.).

**Domain rules:**
- `name` must not be blank
- `status` is either `ACTIVE` or `CLOSED`
- Closing an already-closed account throws `BusinessRuleViolationException`
- Account access in the controller is restricted to the owning user (throws `NotFoundException` for unauthorized access)

**Key use cases:** `CreateAccount`, `GetAccount`, `ListUserAccounts`, `CloseAccount`

---

## transaction

**Purpose:** Records financial movements on accounts (deposits, withdrawals, buys, sells, etc.).

**Domain rules:**
- `label` must not be blank
- `amount` must not be zero (negative amounts are allowed for withdrawals/sells)
- FX rate fields (`appliedFxRate`, `appliedFxRateScale`, `appliedFxRateDate`, `appliedFxSourceCurrency`, `appliedFxTargetCurrency`) must be **all provided or all absent** — partial set is rejected
- `assetId` is optional (required for BUY/SELL, optional otherwise — not enforced at domain level)

**Key use cases:** `RecordTransaction`, `GetTransaction`, `ListAccountTransactions`

**Querying:** `ListAccountTransactions` supports optional `from`/`to` date range filtering.

---

## fees

**Purpose:** Records fees associated with accounts or transactions (brokerage, management, custody, etc.).

**Domain rules:**
- `label` must not be blank
- `amount` must be **strictly positive** (fees are always costs)
- A fee must be linked to at least one of `accountId` or `transactionId` (both can be set)

**Key use cases:** `RecordFee`, `GetFee`, `ListFees`

---

## price

**Purpose:** Historical asset price storage with fallback lookup.

**Domain rules:**
- `price` must be strictly positive
- `appliedPriceDate` defaults to `date` (set when a fallback price from a prior day is used)
- Unique constraint: one price per `(asset_id, date)`

**Lookup strategy:** Exact date first, then latest on-or-before within `price.lookback-days` (default 30). Throws `NotFoundException` if none found.

**Key use cases:** `RecordAssetPrice`, `GetAssetPrice`, `ListAssetPrices`

---

## fx

**Purpose:** FX rate storage and currency conversion.

**Domain rules:**
- Source and target currency must differ
- `rate` must be strictly positive
- `rateScale` must be non-negative
- Unique constraint: one rate per `(source_currency, target_currency, date)`

**Lookup strategy:** Exact date first, then latest on-or-before within `fx.lookback-days` (default 30). Throws `NotFoundException` if none found.

**Key use cases:** `RecordFxRate`, `GetFxRate`, `ConvertAmount`

**Conversion formula:** `targetAmount = sourceAmount * rate / 10^rateScale`

---

## inflation

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

---

## analytics

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
