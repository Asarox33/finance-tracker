package com.finance.transaction.domain.ports

import com.finance.account.domain.AccountType
import com.finance.shared.Currency
import java.util.UUID

data class AccountAccessSummary(
    val id: UUID,
    val userId: UUID,
    val type: AccountType,
    val currency: Currency,
    val active: Boolean
)

interface AccountAccessPort {
    fun findAccountForUser(accountId: UUID, userId: UUID): AccountAccessSummary?
}
