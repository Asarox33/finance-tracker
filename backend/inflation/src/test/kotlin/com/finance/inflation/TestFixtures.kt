package com.finance.inflation

import com.finance.inflation.domain.InflationIndex
import com.finance.inflation.domain.InflationIndexRepository
import com.finance.shared.Currency
import java.time.YearMonth
import java.util.UUID

class InMemoryInflationIndexRepository : InflationIndexRepository {
    private val store = mutableMapOf<UUID, InflationIndex>()

    override fun save(index: InflationIndex): InflationIndex { store[index.id] = index; return index }
    override fun findById(id: UUID): InflationIndex? = store[id]

    override fun findByCurrencyAndYearMonth(currency: Currency, yearMonth: YearMonth): InflationIndex? =
        store.values.firstOrNull { it.currency == currency && it.yearMonth == yearMonth }

    override fun findByCurrencyOrderByYearMonth(currency: Currency, page: Int, pageSize: Int): List<InflationIndex> =
        store.values.filter { it.currency == currency }
            .sortedBy { it.yearMonth }
            .drop(page * pageSize).take(pageSize)

    override fun findLatestByCurrencyOnOrBefore(currency: Currency, yearMonth: YearMonth): InflationIndex? =
        store.values.filter { it.currency == currency && !it.yearMonth.isAfter(yearMonth) }
            .maxByOrNull { it.yearMonth }

    override fun findEarliestByCurrencyOnOrAfter(currency: Currency, yearMonth: YearMonth): InflationIndex? =
        store.values.filter { it.currency == currency && !it.yearMonth.isBefore(yearMonth) }
            .minByOrNull { it.yearMonth }

    override fun countByCurrency(currency: Currency): Long =
        store.values.count { it.currency == currency }.toLong()
}

fun testInflationIndex(
    id: UUID = UUID.randomUUID(),
    currency: Currency = Currency.EUR,
    yearMonth: YearMonth = YearMonth.of(2024, 1),
    indexValue: Long = 11523L,
    indexScale: Int = 2
) = InflationIndex(id, currency, yearMonth, indexValue, indexScale)