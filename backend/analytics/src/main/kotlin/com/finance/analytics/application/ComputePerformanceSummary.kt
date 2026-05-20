package com.finance.analytics.application

import com.finance.analytics.domain.PortfolioPerformance
import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

class ComputePerformanceSummary(
    private val computePerformance: ComputePerformance,
    private val computePerformanceAfterFees: ComputePerformanceAfterFees,
    private val computePerformanceAfterInflation: ComputePerformanceAfterInflation
) {
    data class Query(
        val userId: UUID,
        val from: LocalDate,
        val to: LocalDate,
        val referenceCurrency: Currency
    )

    data class Result(
        val gross: PortfolioPerformance,
        val afterFees: PortfolioPerformance,
        val afterInflation: PortfolioPerformance,
        val inflationApplied: Boolean
    )

    fun execute(query: Query): Result {
        val gross = computePerformance.execute(
            ComputePerformance.Query(query.userId, query.from, query.to, query.referenceCurrency)
        )
        val afterFees = computePerformanceAfterFees.execute(
            ComputePerformanceAfterFees.Query(query.userId, query.from, query.to, query.referenceCurrency)
        )
        val afterInflation = computePerformanceAfterInflation.execute(
            ComputePerformanceAfterInflation.Query(query.userId, query.from, query.to, query.referenceCurrency)
        )
        return Result(
            gross = gross,
            afterFees = afterFees,
            afterInflation = afterInflation,
            inflationApplied = gross.endValue != afterInflation.endValue
        )
    }
}
