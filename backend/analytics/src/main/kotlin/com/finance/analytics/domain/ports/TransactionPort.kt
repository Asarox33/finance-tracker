package com.finance.analytics.domain.ports

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

data class TransactionSummary(
    val accountId: UUID,
    val amount: Long,
    val currency: Currency,
    val date: LocalDate,
    val type: String
)

interface TransactionPort {
    fun findByAccountId(accountId: UUID, from: LocalDate, to: LocalDate): List<TransactionSummary>
}