package com.finance.analytics.domain.ports

import com.finance.shared.Currency
import java.time.LocalDate

data class FxRateSummary(
    val rate: Long,
    val rateScale: Int,
    val appliedRateDate: LocalDate
)

interface FxRatePort {
    fun getRate(source: Currency, target: Currency, date: LocalDate): FxRateSummary?
}