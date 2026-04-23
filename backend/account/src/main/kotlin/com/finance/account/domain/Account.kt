package com.finance.account.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import java.util.UUID

data class Account(
    val id: UUID,
    val userId: UUID,
    val institutionId: UUID,
    val name: String,
    val type: AccountType,
    val currency: Currency,
    val status: AccountStatus
) {
    init {
        if (name.isBlank()) throw BusinessRuleViolationException("Account name must not be blank")
    }

    fun close(): Account {
        if (status == AccountStatus.CLOSED) throw BusinessRuleViolationException("Account is already closed")
        return copy(status = AccountStatus.CLOSED)
    }
}