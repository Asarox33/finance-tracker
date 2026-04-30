package com.finance.inflation.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import java.time.YearMonth
import java.util.UUID

data class InflationIndex(
    val id: UUID,
    val currency: Currency,
    val yearMonth: YearMonth,
    val indexValue: Long,
    val indexScale: Int
) {
    init {
        if (indexValue <= 0) throw BusinessRuleViolationException("Inflation index value must be positive")
        if (indexScale < 0) throw BusinessRuleViolationException("Inflation index scale must be non-negative")
    }
}