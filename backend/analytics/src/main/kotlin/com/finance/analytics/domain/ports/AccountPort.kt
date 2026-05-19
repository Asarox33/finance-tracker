package com.finance.analytics.domain.ports

import com.finance.shared.Currency
import java.util.UUID

data class AccountSummary(
    val id: UUID,
    val name: String,
    val type: String,
    val institutionId: UUID,
    val currency: Currency,
    val status: String
)

interface AccountPort {
    fun findActiveByUserId(userId: UUID): List<AccountSummary>
}