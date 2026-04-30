package com.finance.inflation.domain

import com.finance.shared.Currency
import java.time.YearMonth
import java.util.UUID

interface InflationIndexRepository {
    fun save(index: InflationIndex): InflationIndex
    fun findById(id: UUID): InflationIndex?
    fun findByCurrencyAndYearMonth(currency: Currency, yearMonth: YearMonth): InflationIndex?
    fun findByCurrencyOrderByYearMonth(currency: Currency, page: Int, pageSize: Int): List<InflationIndex>
    fun findLatestByCurrencyOnOrBefore(currency: Currency, yearMonth: YearMonth): InflationIndex?
    fun findEarliestByCurrencyOnOrAfter(currency: Currency, yearMonth: YearMonth): InflationIndex?
    fun countByCurrency(currency: Currency): Long
}