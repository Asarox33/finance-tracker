package com.finance.transaction.infrastructure.adapters

import com.finance.account.application.GetAccount
import com.finance.account.domain.AccountStatus
import com.finance.shared.error.NotFoundException
import com.finance.transaction.domain.ports.AccountAccessPort
import com.finance.transaction.domain.ports.AccountAccessSummary
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class AccountAccessPortAdapter(
    private val getAccount: GetAccount
) : AccountAccessPort {
    override fun findAccountForUser(accountId: UUID, userId: UUID): AccountAccessSummary? {
        val account = try {
            getAccount.execute(accountId)
        } catch (_: NotFoundException) {
            return null
        }
        if (account.userId != userId) return null
        return AccountAccessSummary(
            id = account.id,
            userId = account.userId,
            type = account.type,
            currency = account.currency,
            active = account.status == AccountStatus.ACTIVE
        )
    }
}
