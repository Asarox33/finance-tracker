package com.finance.inflation.application

import com.finance.inflation.domain.InflationIndex
import com.finance.inflation.domain.InflationIndexRepository
import com.finance.shared.Currency
import com.finance.shared.error.NotFoundException
import java.time.YearMonth

class GetInflationIndex(
    private val inflationIndexRepository: InflationIndexRepository
) {
    data class Query(val currency: Currency, val yearMonth: YearMonth)

    fun execute(query: Query): InflationIndex {
        return inflationIndexRepository.findByCurrencyAndYearMonth(query.currency, query.yearMonth)
            ?: inflationIndexRepository.findLatestByCurrencyOnOrBefore(query.currency, query.yearMonth)
            ?: throw NotFoundException(
                "No inflation index found for ${query.currency} on or before ${query.yearMonth}"
            )
    }
}