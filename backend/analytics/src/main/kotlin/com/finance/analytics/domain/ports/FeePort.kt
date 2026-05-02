package com.finance.analytics.domain.ports

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

data class FeeSummary(
    val accountId: UUID?,
    val amount: Long,
    val currency: Currency,
    val date: LocalDate
)

interface FeePort {
    fun findByAccountId(accountId: UUID, from: LocalDate, to: LocalDate): List<FeeSummary>
}