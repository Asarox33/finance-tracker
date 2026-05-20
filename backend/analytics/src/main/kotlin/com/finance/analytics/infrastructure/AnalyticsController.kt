package com.finance.analytics.infrastructure

import com.finance.analytics.application.ComputePerformance
import com.finance.analytics.application.ComputePerformanceAfterFees
import com.finance.analytics.application.ComputePerformanceAfterInflation
import com.finance.analytics.application.ComputePerformanceSummary
import com.finance.analytics.application.ComputePortfolioHistory
import com.finance.analytics.application.ComputePortfolioValue
import com.finance.analytics.domain.PortfolioPerformance
import com.finance.analytics.domain.PortfolioValue
import com.finance.shared.Currency
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/analytics")
class AnalyticsController(
    private val computePortfolioValue: ComputePortfolioValue,
    private val computePortfolioHistory: ComputePortfolioHistory,
    private val computePerformance: ComputePerformance,
    private val computePerformanceAfterFees: ComputePerformanceAfterFees,
    private val computePerformanceAfterInflation: ComputePerformanceAfterInflation,
    private val computePerformanceSummary: ComputePerformanceSummary
) {
    data class PerformanceSummaryResponse(
        val gross: PortfolioPerformance,
        val afterFees: PortfolioPerformance,
        val afterInflation: PortfolioPerformance,
        val inflationApplied: Boolean
    )
    data class PortfolioHistoryPointResponse(
        val date: LocalDate,
        val totalValue: Long,
        val currency: Currency
    )

    data class PortfolioHistoryResponse(
        val points: List<PortfolioHistoryPointResponse>,
        val referenceCurrency: Currency
    )

    @GetMapping("/portfolio-history")
    fun portfolioHistory(
        @AuthenticationPrincipal userId: String,
        @RequestParam(defaultValue = "30") days: Int,
        @RequestParam referenceCurrency: Currency
    ): PortfolioHistoryResponse {
        val result = computePortfolioHistory.execute(
            ComputePortfolioHistory.Query(UUID.fromString(userId), days, referenceCurrency)
        )
        return PortfolioHistoryResponse(
            points = result.points.map {
                PortfolioHistoryPointResponse(it.date, it.totalValue, it.currency)
            },
            referenceCurrency = result.referenceCurrency
        )
    }

    @GetMapping("/portfolio-value")
    fun portfolioValue(
        @AuthenticationPrincipal userId: String,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") asOf: LocalDate,
        @RequestParam referenceCurrency: Currency
    ): PortfolioValue =
        computePortfolioValue.execute(
            ComputePortfolioValue.Query(UUID.fromString(userId), asOf, referenceCurrency)
        )

    @GetMapping("/performance")
    fun performance(
        @AuthenticationPrincipal userId: String,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") from: LocalDate,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") to: LocalDate,
        @RequestParam referenceCurrency: Currency
    ): PortfolioPerformance =
        computePerformance.execute(
            ComputePerformance.Query(UUID.fromString(userId), from, to, referenceCurrency)
        )

    @GetMapping("/performance-after-fees")
    fun performanceAfterFees(
        @AuthenticationPrincipal userId: String,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") from: LocalDate,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") to: LocalDate,
        @RequestParam referenceCurrency: Currency
    ): PortfolioPerformance =
        computePerformanceAfterFees.execute(
            ComputePerformanceAfterFees.Query(UUID.fromString(userId), from, to, referenceCurrency)
        )

    @GetMapping("/performance-summary")
    fun performanceSummary(
        @AuthenticationPrincipal userId: String,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") from: LocalDate,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") to: LocalDate,
        @RequestParam referenceCurrency: Currency
    ): PerformanceSummaryResponse {
        val result = computePerformanceSummary.execute(
            ComputePerformanceSummary.Query(UUID.fromString(userId), from, to, referenceCurrency)
        )
        return PerformanceSummaryResponse(
            gross = result.gross,
            afterFees = result.afterFees,
            afterInflation = result.afterInflation,
            inflationApplied = result.inflationApplied
        )
    }

    @GetMapping("/performance-after-inflation")
    fun performanceAfterInflation(
        @AuthenticationPrincipal userId: String,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") from: LocalDate,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") to: LocalDate,
        @RequestParam referenceCurrency: Currency
    ): PortfolioPerformance =
        computePerformanceAfterInflation.execute(
            ComputePerformanceAfterInflation.Query(UUID.fromString(userId), from, to, referenceCurrency)
        )
}