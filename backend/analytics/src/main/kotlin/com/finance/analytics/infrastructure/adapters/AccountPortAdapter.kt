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
        val result = listUserAccounts.execute(
            ListUserAccounts.Query(userId = userId, page = 0, pageSize = 1000, includeClosed = false)
        )
        return result.items.map {
            AccountSummary(
                id = it.id,
                name = it.name,
                type = it.type.name,
                institutionId = it.institutionId,
                currency = it.currency,
                status = it.status.name
            )
        }
    }
}