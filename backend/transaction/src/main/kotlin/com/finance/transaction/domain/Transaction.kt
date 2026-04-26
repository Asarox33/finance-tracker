package com.finance.transaction.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import java.time.LocalDate
import java.util.UUID

data class Transaction(
    val id: UUID,
    val accountId: UUID,
    val assetId: UUID?,
    val type: TransactionType,
    val amount: Long,
    val currency: Currency,
    val date: LocalDate,
    val label: String,
    val notes: String?
) {
    init {
        if (label.isBlank()) throw BusinessRuleViolationException("Transaction label must not be blank")
        if (amount == 0L) throw BusinessRuleViolationException("Transaction amount must not be zero")
    }
}