package com.finance.fx.application

import com.finance.fx.InMemoryFxRateRepository
import com.finance.fx.domain.ports.FxQuote
import com.finance.fx.domain.ports.FxQuotePort
import com.finance.shared.Currency
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.LocalDate

class ImportFxRatesTest {

    private val repository = InMemoryFxRateRepository()

    @Test
    fun `imports all quotes returned by port`() {
        val port = object : FxQuotePort {
            override fun fetchRatesForDate(date: LocalDate, pairs: List<Pair<Currency, Currency>>): List<FxQuote> =
                listOf(
                    FxQuote(Currency.USD, Currency.EUR, 920_000, 6, date),
                    FxQuote(Currency.GBP, Currency.EUR, 1_160_000, 6, date)
                )
        }
        val importFxRates = ImportFxRates(port, RecordFxRate(repository))
        val result = importFxRates.execute(ImportFxRates.Command(LocalDate.of(2024, 6, 1)))
        assertEquals(2, result.importedCount)
        assertEquals(2, result.importedCount)
    }
}
