package com.finance.analytics.infrastructure.adapters

import com.finance.analytics.domain.ports.InflationFactorSummary
import com.finance.analytics.domain.ports.InflationPort
import com.finance.inflation.application.ComputeInflationFactor
import com.finance.shared.Currency
import org.springframework.stereotype.Component
import java.time.YearMonth

@Component
class InflationPortAdapter(
    private val computeInflationFactor: ComputeInflationFactor
) : InflationPort {
    override fun getFactor(currency: Currency, from: YearMonth, to: YearMonth): InflationFactorSummary? {
        return try {
            val result = computeInflationFactor.execute(
                ComputeInflationFactor.Query(currency, from, to)
            )
            InflationFactorSummary(result.factor, result.factorScale)
        } catch (_: Exception) {
            null
        }
    }
}