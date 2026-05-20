import type { AccountType, TransactionType } from "@/shared/types";

/**
 * Must stay aligned with backend AccountTransactionCompatibility.kt
 */
const CASH_ACCOUNT_TYPES: TransactionType[] = ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "FEE", "TAX", "OTHER"];

const SAVINGS_ACCOUNT_TYPES: TransactionType[] = [...CASH_ACCOUNT_TYPES, "DIVIDEND"];

const INVESTMENT_ACCOUNT_TYPES: TransactionType[] = [
    "DEPOSIT",
    "WITHDRAWAL",
    "TRANSFER",
    "BUY",
    "SELL",
    "DIVIDEND",
    "FEE",
    "TAX",
    "OTHER",
];

const ALL_TRANSACTION_TYPES: TransactionType[] = [
    "DEPOSIT",
    "WITHDRAWAL",
    "TRANSFER",
    "BUY",
    "SELL",
    "DIVIDEND",
    "FEE",
    "TAX",
    "OTHER",
];

export function allowedTransactionTypesForAccount(accountType: AccountType): TransactionType[] {
    switch (accountType) {
        case "CHECKING":
            return CASH_ACCOUNT_TYPES;
        case "SAVINGS":
            return SAVINGS_ACCOUNT_TYPES;
        case "BROKERAGE":
        case "CRYPTO":
        case "REAL_ESTATE":
        case "RETIREMENT":
            return INVESTMENT_ACCOUNT_TYPES;
        case "OTHER":
            return ALL_TRANSACTION_TYPES;
        default:
            return ALL_TRANSACTION_TYPES;
    }
}

export function isTransactionTypeAllowed(accountType: AccountType, transactionType: TransactionType): boolean {
    return allowedTransactionTypesForAccount(accountType).includes(transactionType);
}

export function transactionTypeRequiresAsset(transactionType: TransactionType): boolean {
    return transactionType === "BUY" || transactionType === "SELL";
}

export function pickDefaultTransactionType(accountType: AccountType): TransactionType {
    const allowed = allowedTransactionTypesForAccount(accountType);
    return allowed.includes("DEPOSIT") ? "DEPOSIT" : allowed[0];
}
