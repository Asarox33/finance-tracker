package com.finance.transaction.domain

import com.finance.account.domain.AccountType

private val CASH_ACCOUNT_TYPES: Set<TransactionType> = setOf(
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAWAL,
    TransactionType.TRANSFER,
    TransactionType.FEE,
    TransactionType.TAX,
    TransactionType.OTHER
)

private val SAVINGS_ACCOUNT_TYPES: Set<TransactionType> = CASH_ACCOUNT_TYPES + TransactionType.DIVIDEND

private val INVESTMENT_ACCOUNT_TYPES: Set<TransactionType> = setOf(
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAWAL,
    TransactionType.TRANSFER,
    TransactionType.BUY,
    TransactionType.SELL,
    TransactionType.DIVIDEND,
    TransactionType.FEE,
    TransactionType.TAX,
    TransactionType.OTHER
)

fun AccountType.allowedTransactionTypes(): Set<TransactionType> = when (this) {
    AccountType.CHECKING -> CASH_ACCOUNT_TYPES
    AccountType.SAVINGS -> SAVINGS_ACCOUNT_TYPES
    AccountType.BROKERAGE,
    AccountType.CRYPTO,
    AccountType.REAL_ESTATE,
    AccountType.RETIREMENT -> INVESTMENT_ACCOUNT_TYPES
    AccountType.OTHER -> TransactionType.entries.toSet()
}

fun TransactionType.isAllowedFor(accountType: AccountType): Boolean =
    this in accountType.allowedTransactionTypes()

fun TransactionType.requiresAsset(): Boolean = when (this) {
    TransactionType.BUY,
    TransactionType.SELL -> true
    else -> false
}
