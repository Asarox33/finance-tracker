package com.finance.fees.application

import com.finance.fees.domain.Fee
import com.finance.fees.domain.FeeRepository
import com.finance.shared.PageResult
import java.util.UUID

class ListFees(
    private val feeRepository: FeeRepository
) {
    data class Query(
        val accountId: UUID,
        val page: Int = 0,
        val pageSize: Int = 20
    )

    fun execute(query: Query): PageResult<Fee> {
        val items = feeRepository.findByAccountId(query.accountId, query.page, query.pageSize)
        val total = feeRepository.countByAccountId(query.accountId)
        return PageResult.of(items, query.page, query.pageSize, total)
    }
}