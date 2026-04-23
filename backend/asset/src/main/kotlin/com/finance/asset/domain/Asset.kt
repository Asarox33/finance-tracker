package com.finance.asset.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import java.util.UUID

data class Asset(
    val id: UUID,
    val name: String,
    val type: AssetType,
    val currency: Currency,
    val isin: String?,
    val ticker: String?,
    val createdByUserId: UUID
) {
    init {
        if (name.isBlank()) throw BusinessRuleViolationException("Asset name must not be blank")
        if (isin != null && isin.length != 12) throw BusinessRuleViolationException("ISIN must be exactly 12 characters")
        if (ticker != null && ticker.isBlank()) throw BusinessRuleViolationException("Ticker must not be blank")
    }
}