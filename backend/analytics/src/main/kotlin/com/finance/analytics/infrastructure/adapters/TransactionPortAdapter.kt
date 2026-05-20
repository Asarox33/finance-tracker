package com.finance.analytics.infrastructure.adapters

import com.finance.analytics.domain.ports.TransactionPort
import com.finance.analytics.domain.ports.TransactionSummary
import com.finance.transaction.application.ListAccountTransactions
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

@Component
class TransactionPortAdapter(
    private val listAccountTransactions: ListAccountTransactions
) : TransactionPort {
    override fun findByAccountId(userId: UUID, accountId: UUID, from: LocalDate, to: LocalDate): List<TransactionSummary> {
        val result = listAccountTransactions.execute(
            ListAccountTransactions.Query(
                requestingUserId = userId,
                accountId = accountId,
                from = if (from == LocalDate.MIN) null else from,
                to = to,
                page = 0,
                pageSize = 10000
            )
        )
        return result.items.map {
            TransactionSummary(
                accountId = it.accountId,
                amount = it.amount,
                currency = it.currency,
                date = it.date,
                type = it.type.name,
                assetId = it.assetId,
                assetQuantityMinor = it.assetQuantityMinor,
                assetQuantityScale = it.assetQuantityScale
            )
        }
    }
}