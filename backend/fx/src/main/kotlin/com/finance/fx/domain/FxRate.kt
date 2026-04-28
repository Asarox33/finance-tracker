package com.finance.fx.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import java.time.LocalDate
import java.util.UUID

data class FxRate(
    val id: UUID,
    val sourceCurrency: Currency,
    val targetCurrency: Currency,
    val rate: Long,
    val rateScale: Int,
    val date: LocalDate,
    val appliedRateDate: LocalDate = date
) {
    init {
        if (sourceCurrency == targetCurrency) throw BusinessRuleViolationException(
            "Source and target currency must differ"
        )
        if (rate <= 0) throw BusinessRuleViolationException("FX rate must be positive")
        if (rateScale < 0) throw BusinessRuleViolationException("Rate scale must be non-negative")
    }
}