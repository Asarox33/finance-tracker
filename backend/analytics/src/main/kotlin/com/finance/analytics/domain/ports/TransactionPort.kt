package com.finance.analytics.domain.ports

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

data class TransactionSummary(
    val accountId: UUID,
    val amount: Long,
    val currency: Currency,
    val date: LocalDate,
    val type: String,
    val assetId: UUID? = null,
    val assetQuantityMinor: Long? = null,
    val assetQuantityScale: Int? = null
)

interface TransactionPort {
    fun findByAccountId(userId: UUID, accountId: UUID, from: LocalDate, to: LocalDate): List<TransactionSummary>
}
