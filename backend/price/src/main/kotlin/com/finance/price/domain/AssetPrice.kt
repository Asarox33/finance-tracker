package com.finance.price.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import java.time.LocalDate
import java.util.UUID

data class AssetPrice(
    val id: UUID,
    val assetId: UUID,
    val price: Long,
    val currency: Currency,
    val date: LocalDate,
    val appliedPriceDate: LocalDate = date
) {
    init {
        if (price <= 0) throw BusinessRuleViolationException("Asset price must be positive")
    }
}