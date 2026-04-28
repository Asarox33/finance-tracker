package com.finance.fx.domain

import com.finance.shared.Currency
import java.time.LocalDate

data class FxConversion(
    val sourceAmount: Long,
    val sourceCurrency: Currency,
    val targetAmount: Long,
    val targetCurrency: Currency,
    val appliedRate: Long,
    val appliedRateScale: Int,
    val appliedRateDate: LocalDate
)