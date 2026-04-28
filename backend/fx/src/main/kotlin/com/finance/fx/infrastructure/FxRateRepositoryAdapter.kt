package com.finance.fx.infrastructure

import com.finance.fx.domain.FxRate
import com.finance.fx.domain.FxRateRepository
import com.finance.shared.Currency
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

@Component
class FxRateRepositoryAdapter(
    private val jpaRepo: JpaFxRateSpringRepository
) : FxRateRepository {

    override fun save(fxRate: FxRate): FxRate {
        val entity = JpaFxRateEntity(
            id = fxRate.id,
            sourceCurrency = fxRate.sourceCurrency,
            targetCurrency = fxRate.targetCurrency,
            rate = fxRate.rate,
            rateScale = fxRate.rateScale,
            date = fxRate.date,
            appliedRateDate = fxRate.appliedRateDate
        )
        return jpaRepo.save(entity).toDomain()
    }

    override fun findById(id: UUID): FxRate? =
        jpaRepo.findById(id).orElse(null)?.toDomain()

    override fun findByPairAndDate(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        date: LocalDate
    ): FxRate? = jpaRepo.findBySourceCurrencyAndTargetCurrencyAndDate(
        sourceCurrency, targetCurrency, date
    )?.toDomain()

    override fun findLatestByPairOnOrBefore(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        date: LocalDate,
        lookbackDays: Int
    ): FxRate? {
        val lookbackDate = date.minusDays(lookbackDays.toLong())
        return jpaRepo.findLatestOnOrBefore(
            sourceCurrency, targetCurrency, date, lookbackDate, PageRequest.of(0, 1)
        ).content.firstOrNull()?.toDomain()
    }

    override fun findByPair(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        page: Int,
        pageSize: Int
    ): List<FxRate> = jpaRepo.findBySourceCurrencyAndTargetCurrency(
        sourceCurrency, targetCurrency, PageRequest.of(page, pageSize)
    ).content.map { it.toDomain() }

    override fun countByPair(sourceCurrency: Currency, targetCurrency: Currency): Long =
        jpaRepo.countBySourceCurrencyAndTargetCurrency(sourceCurrency, targetCurrency)
}

private fun JpaFxRateEntity.toDomain() = FxRate(
    id = id,
    sourceCurrency = sourceCurrency,
    targetCurrency = targetCurrency,
    rate = rate,
    rateScale = rateScale,
    date = date,
    appliedRateDate = appliedRateDate
)