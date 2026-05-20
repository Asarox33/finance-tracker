export interface ApiError {
    message: string;
    errors?: string[];
    correlationId?: string;
}

export interface PageResult<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    page: number;
    pageSize: number;
    isEmpty: boolean;
    isFirst: boolean;
    isLast: boolean;
}

export interface User {
    id: string;
    email: string;
}

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    preferredCurrency: string;
    preferredLanguage: DisplayLanguage;
    birthDate: string | null;
    tablePageSize: number;
    sessionTimeoutMinutes: number;
}

export type DisplayLanguage = "ENG" | "FRA" | "ESP" | "ITA";

export interface Account {
    id: string;
    userId: string;
    institutionId: string;
    name: string;
    type: AccountType;
    currency: string;
    status: "ACTIVE" | "CLOSED";
}

export type AccountType = "CHECKING" | "SAVINGS" | "BROKERAGE" | "CRYPTO" | "REAL_ESTATE" | "RETIREMENT" | "OTHER";

export interface Transaction {
    id: string;
    accountId: string;
    assetId: string | null;
    type: TransactionType;
    amount: number;
    currency: string;
    date: string;
    label: string;
    notes: string | null;
    appliedFxRate: number | null;
    appliedFxRateScale: number | null;
    appliedFxRateDate: string | null;
    appliedFxSourceCurrency: string | null;
    appliedFxTargetCurrency: string | null;
    assetQuantityMinor: number | null;
    assetQuantityScale: number | null;
}

export type TransactionType =
    | "DEPOSIT"
    | "WITHDRAWAL"
    | "TRANSFER"
    | "BUY"
    | "SELL"
    | "DIVIDEND"
    | "FEE"
    | "TAX"
    | "OTHER";

export interface PortfolioValue {
    totalValue: number;
    currency: string;
    asOf: string;
    snapshots: AccountSnapshot[];
}

export interface HoldingLine {
    assetId: string;
    /** From asset registry when available */
    assetName?: string | null;
    assetTicker?: string | null;
    quantityMinor: number;
    quantityScale: number;
    valueInAccountCurrency: number;
}

export interface AccountSnapshot {
    accountId: string;
    accountName: string;
    accountType: AccountType;
    institutionId: string;
    institutionName: string;
    institutionType: string;
    currency: string;
    cashBalanceInAccountCurrency: number;
    holdingsValueInAccountCurrency: number;
    holdings: HoldingLine[];
    valueInAccountCurrency: number;
    valueInReferenceCurrency: number;
    referenceCurrency: string;
    asOf: string;
}

export interface PortfolioPerformance {
    startValue: number;
    endValue: number;
    currency: string;
    gainLoss: number;
    gainLossBasisPoints: number;
    from: string;
    to: string;
}

export interface Institution {
    id: string;
    name: string;
    country: string;
    type: string;
    bic: string | null;
}

export type AssetType =
    | "CASH"
    | "STOCK"
    | "BOND"
    | "ETF"
    | "MUTUAL_FUND"
    | "REAL_ESTATE"
    | "CRYPTO"
    | "COMMODITY"
    | "OTHER";

export interface Asset {
    id: string;
    name: string;
    type: AssetType;
    currency: string;
    isin: string | null;
    ticker: string | null;
    createdByUserId: string;
}
