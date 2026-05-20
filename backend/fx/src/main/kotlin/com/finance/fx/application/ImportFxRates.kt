package com.finance.fx.application

import com.finance.fx.domain.ports.FxQuotePort
import com.finance.shared.Currency
import java.time.LocalDate

class ImportFxRates(
    private val fxQuotePort: FxQuotePort,
    private val recordFxRate: RecordFxRate
) {
    data class Command(
        val date: LocalDate,
        val pairs: List<Pair<Currency, Currency>> = DEFAULT_PAIRS
    )

    data class Result(val importedCount: Int, val date: LocalDate)

    fun execute(command: Command): Result {
        val quotes = fxQuotePort.fetchRatesForDate(command.date, command.pairs)
        quotes.forEach { quote ->
            recordFxRate.execute(
                RecordFxRate.Command(
                    sourceCurrency = quote.sourceCurrency,
                    targetCurrency = quote.targetCurrency,
                    rate = quote.rate,
                    rateScale = quote.rateScale,
                    date = quote.date
                )
            )
        }
        return Result(importedCount = quotes.size, date = command.date)
    }

    companion object {
        val DEFAULT_PAIRS: List<Pair<Currency, Currency>> = listOf(
            Currency.USD to Currency.EUR,
            Currency.GBP to Currency.EUR,
            Currency.CHF to Currency.EUR,
            Currency.EUR to Currency.USD,
            Currency.EUR to Currency.GBP,
            Currency.EUR to Currency.CHF
        )
    }
}
