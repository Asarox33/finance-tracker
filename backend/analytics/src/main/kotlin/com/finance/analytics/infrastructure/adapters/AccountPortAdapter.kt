package com.finance.analytics.infrastructure.adapters

import com.finance.account.application.ListUserAccounts
import com.finance.analytics.domain.ports.AccountPort
import com.finance.analytics.domain.ports.AccountSummary
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class AccountPortAdapter(
    private val listUserAccounts: ListUserAccounts
) : AccountPort {
    override fun findActiveByUserId(userId: UUID): List<AccountSummary> {
        val result = listUserAccounts.execute(ListUserAccounts.Query(userId = userId, page = 0, pageSize = 1000))
        return result.items
            .filter { it.status.name == "ACTIVE" }
            .map { AccountSummary(it.id, it.currency, it.status.name) }
    }
}