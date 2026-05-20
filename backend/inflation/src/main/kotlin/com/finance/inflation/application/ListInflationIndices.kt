package com.finance.inflation.application

import com.finance.inflation.domain.InflationIndex
import com.finance.inflation.domain.InflationIndexRepository
import com.finance.shared.Currency

class ListInflationIndices(
    private val inflationIndexRepository: InflationIndexRepository
) {
    data class Query(val currency: Currency, val page: Int = 0, val pageSize: Int = 24)

    data class Result(val items: List<InflationIndex>, val totalItems: Long)

    fun execute(query: Query): Result {
        val items = inflationIndexRepository.findByCurrencyOrderByYearMonth(
            query.currency,
            query.page,
            query.pageSize
        )
        val totalItems = inflationIndexRepository.countByCurrency(query.currency)
        return Result(items = items, totalItems = totalItems)
    }
}
