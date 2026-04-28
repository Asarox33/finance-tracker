package com.finance.fx.application

import com.finance.fx.domain.FxRate
import com.finance.fx.domain.FxRateRepository
import com.finance.shared.Currency
import com.finance.shared.error.NotFoundException
import java.time.LocalDate

class GetFxRate(
    private val fxRateRepository: FxRateRepository,
    private val lookbackDays: Int
) {
    data class Query(
        val sourceCurrency: Currency,
        val targetCurrency: Currency,
        val date: LocalDate
    )

    fun execute(query: Query): FxRate {
        return fxRateRepository.findByPairAndDate(
            query.sourceCurrency, query.targetCurrency, query.date
        ) ?: fxRateRepository.findLatestByPairOnOrBefore(
            query.sourceCurrency, query.targetCurrency, query.date, lookbackDays
        ) ?: throw NotFoundException(
            "No FX rate found for ${query.sourceCurrency}/${query.targetCurrency} " +
                    "on or before ${query.date} within $lookbackDays days lookback"
        )
    }
}