package com.finance.analytics.infrastructure.adapters

import com.finance.analytics.domain.ports.FeePort
import com.finance.analytics.domain.ports.FeeSummary
import com.finance.fees.application.ListFees
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

@Component
class FeePortAdapter(
    private val listFees: ListFees
) : FeePort {
    override fun findByAccountId(accountId: UUID, from: LocalDate, to: LocalDate): List<FeeSummary> {
        val result = listFees.execute(ListFees.Query(accountId, page = 0, pageSize = 10000))
        return result.items
            .filter { !it.date.isBefore(from) && !it.date.isAfter(to) }
            .map { FeeSummary(it.accountId, it.amount, it.currency, it.date) }
    }
}