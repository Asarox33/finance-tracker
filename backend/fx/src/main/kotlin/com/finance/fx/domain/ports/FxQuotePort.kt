package com.finance.fx.domain.ports

import com.finance.shared.Currency
import java.time.LocalDate

data class FxQuote(
    val sourceCurrency: Currency,
    val targetCurrency: Currency,
    val rate: Long,
    val rateScale: Int,
    val date: LocalDate
)

interface FxQuotePort {
    fun fetchRatesForDate(date: LocalDate, pairs: List<Pair<Currency, Currency>>): List<FxQuote>
}
