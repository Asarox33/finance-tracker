package com.finance.analytics.infrastructure

import com.finance.analytics.application.ComputePerformance
import com.finance.analytics.application.ComputePerformanceAfterFees
import com.finance.analytics.application.ComputePerformanceAfterInflation
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
    private val computePerformance: ComputePerformance,
    private val computePerformanceAfterFees: ComputePerformanceAfterFees,
    private val computePerformanceAfterInflation: ComputePerformanceAfterInflation
) {
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