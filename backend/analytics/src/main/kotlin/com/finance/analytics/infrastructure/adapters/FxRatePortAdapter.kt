package com.finance.analytics.infrastructure.adapters

import com.finance.analytics.domain.ports.FxRatePort
import com.finance.analytics.domain.ports.FxRateSummary
import com.finance.fx.application.GetFxRate
import com.finance.shared.Currency
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
class FxRatePortAdapter(
    private val getFxRate: GetFxRate
) : FxRatePort {
    override fun getRate(source: Currency, target: Currency, date: LocalDate): FxRateSummary? {
        return try {
            val rate = getFxRate.execute(GetFxRate.Query(source, target, date))
            FxRateSummary(rate.rate, rate.rateScale, rate.appliedRateDate)
        } catch (_: Exception) {
            null
        }
    }
}