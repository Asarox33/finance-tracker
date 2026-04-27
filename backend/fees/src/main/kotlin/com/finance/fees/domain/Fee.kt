package com.finance.fees.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import java.time.LocalDate
import java.util.UUID

data class Fee(
    val id: UUID,
    val accountId: UUID?,
    val transactionId: UUID?,
    val type: FeeType,
    val amount: Long,
    val currency: Currency,
    val date: LocalDate,
    val label: String
) {
    init {
        if (label.isBlank()) throw BusinessRuleViolationException("Fee label must not be blank")
        if (amount <= 0) throw BusinessRuleViolationException("Fee amount must be positive")
        if (accountId == null && transactionId == null) throw BusinessRuleViolationException(
            "Fee must be linked to an account or a transaction"
        )
    }
}