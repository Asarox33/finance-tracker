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