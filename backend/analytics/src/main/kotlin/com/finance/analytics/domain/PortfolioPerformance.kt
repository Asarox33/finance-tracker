package com.finance.analytics.domain

import com.finance.shared.Currency
import java.time.LocalDate

data class PortfolioPerformance(
    val startValue: Long,
    val endValue: Long,
    val currency: Currency,
    val gainLoss: Long,
    val gainLossBasisPoints: Long,
    val from: LocalDate,
    val to: LocalDate
)