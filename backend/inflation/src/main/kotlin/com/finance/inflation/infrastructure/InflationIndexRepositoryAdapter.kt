package com.finance.inflation.infrastructure

import com.finance.inflation.domain.InflationIndex
import com.finance.inflation.domain.InflationIndexRepository
import com.finance.shared.Currency
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import java.time.YearMonth
import java.util.UUID

@Component
class InflationIndexRepositoryAdapter(
    private val jpaRepo: JpaInflationIndexSpringRepository
) : InflationIndexRepository {

    override fun save(index: InflationIndex): InflationIndex {
        val entity = JpaInflationIndexEntity(
            id = index.id,
            currency = index.currency,
            yearMonth = index.yearMonth.toString(),
            indexValue = index.indexValue,
            indexScale = index.indexScale
        )
        return jpaRepo.save(entity).toDomain()
    }

    override fun findById(id: UUID): InflationIndex? =
        jpaRepo.findById(id).orElse(null)?.toDomain()

    override fun findByCurrencyAndYearMonth(currency: Currency, yearMonth: YearMonth): InflationIndex? =
        jpaRepo.findByCurrencyAndYearMonth(currency, yearMonth.toString())?.toDomain()

    override fun findByCurrencyOrderByYearMonth(currency: Currency, page: Int, pageSize: Int): List<InflationIndex> =
        jpaRepo.findByCurrencyOrderByYearMonthAsc(currency, PageRequest.of(page, pageSize))
            .content.map { it.toDomain() }

    override fun findLatestByCurrencyOnOrBefore(currency: Currency, yearMonth: YearMonth): InflationIndex? =
        jpaRepo.findLatestOnOrBefore(currency, yearMonth.toString(), PageRequest.of(0, 1))
            .content.firstOrNull()?.toDomain()

    override fun findEarliestByCurrencyOnOrAfter(currency: Currency, yearMonth: YearMonth): InflationIndex? =
        jpaRepo.findEarliestOnOrAfter(currency, yearMonth.toString(), PageRequest.of(0, 1))
            .content.firstOrNull()?.toDomain()

    override fun countByCurrency(currency: Currency): Long =
        jpaRepo.countByCurrency(currency)
}

private fun JpaInflationIndexEntity.toDomain() = InflationIndex(
    id = id,
    currency = currency,
    yearMonth = YearMonth.parse(yearMonth),
    indexValue = indexValue,
    indexScale = indexScale
)