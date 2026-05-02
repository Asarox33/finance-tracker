package com.finance.analytics.domain

import com.finance.shared.Currency
import java.time.LocalDate

data class PortfolioValue(
    val totalValue: Long,
    val currency: Currency,
    val asOf: LocalDate,
    val snapshots: List<AccountSnapshot>
)