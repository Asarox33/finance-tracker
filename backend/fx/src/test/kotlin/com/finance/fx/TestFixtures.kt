package com.finance.fx

import com.finance.fx.domain.FxRate
import com.finance.fx.domain.FxRateRepository
import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

class InMemoryFxRateRepository : FxRateRepository {
    private val store = mutableMapOf<UUID, FxRate>()

    override fun save(fxRate: FxRate): FxRate { store[fxRate.id] = fxRate; return fxRate }
    override fun findById(id: UUID): FxRate? = store[id]

    override fun findByPairAndDate(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        date: LocalDate
    ): FxRate? = store.values.firstOrNull {
        it.sourceCurrency == sourceCurrency && it.targetCurrency == targetCurrency && it.date == date
    }

    override fun findLatestByPairOnOrBefore(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        date: LocalDate,
        lookbackDays: Int
    ): FxRate? = store.values
        .filter {
            it.sourceCurrency == sourceCurrency &&
                    it.targetCurrency == targetCurrency &&
                    !it.date.isAfter(date) &&
                    !it.date.isBefore(date.minusDays(lookbackDays.toLong()))
        }
        .maxByOrNull { it.date }

    override fun findByPair(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        page: Int,
        pageSize: Int
    ): List<FxRate> = store.values
        .filter { it.sourceCurrency == sourceCurrency && it.targetCurrency == targetCurrency }
        .drop(page * pageSize).take(pageSize)

    override fun countByPair(sourceCurrency: Currency, targetCurrency: Currency): Long =
        store.values.count { it.sourceCurrency == sourceCurrency && it.targetCurrency == targetCurrency }.toLong()
}

fun testFxRate(
    id: UUID = UUID.randomUUID(),
    sourceCurrency: Currency = Currency.USD,
    targetCurrency: Currency = Currency.EUR,
    rate: Long = 91500L,
    rateScale: Int = 5,
    date: LocalDate = LocalDate.of(2024, 1, 15)
) = FxRate(id, sourceCurrency, targetCurrency, rate, rateScale, date)