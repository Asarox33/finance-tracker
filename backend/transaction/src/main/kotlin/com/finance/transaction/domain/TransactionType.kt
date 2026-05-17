package com.finance.transaction.domain

@Suppress("unused")
enum class TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    TRANSFER,
    BUY,
    SELL,
    DIVIDEND,
    FEE,
    TAX,
    OTHER
}

fun TransactionType.signedAmount(amount: Long): Long = when (this) {
    TransactionType.DEPOSIT,
    TransactionType.SELL,
    TransactionType.DIVIDEND -> kotlin.math.abs(amount)
    TransactionType.WITHDRAWAL,
    TransactionType.BUY,
    TransactionType.FEE,
    TransactionType.TAX -> -kotlin.math.abs(amount)
    TransactionType.TRANSFER,
    TransactionType.OTHER -> amount
}

fun TransactionType.allowsExplicitNegativeAmount(): Boolean = when (this) {
    TransactionType.TRANSFER,
    TransactionType.OTHER -> true
    else -> false
}