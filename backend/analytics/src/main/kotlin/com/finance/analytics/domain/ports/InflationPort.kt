package com.finance.analytics.domain.ports

import com.finance.shared.Currency
import java.time.YearMonth

data class InflationFactorSummary(
    val factor: Long,
    val factorScale: Int
)

interface InflationPort {
    fun getFactor(currency: Currency, from: YearMonth, to: YearMonth): InflationFactorSummary?
}