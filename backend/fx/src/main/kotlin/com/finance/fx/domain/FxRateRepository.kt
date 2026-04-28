package com.finance.fx.domain

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

interface FxRateRepository {
    fun save(fxRate: FxRate): FxRate
    fun findById(id: UUID): FxRate?
    fun findByPairAndDate(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        date: LocalDate
    ): FxRate?
    fun findLatestByPairOnOrBefore(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        date: LocalDate,
        lookbackDays: Int
    ): FxRate?
    fun findByPair(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        page: Int,
        pageSize: Int
    ): List<FxRate>
    fun countByPair(sourceCurrency: Currency, targetCurrency: Currency): Long
}