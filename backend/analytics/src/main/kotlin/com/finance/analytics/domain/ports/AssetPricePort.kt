package com.finance.analytics.domain.ports

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

data class AssetPriceSummary(
    val assetId: UUID,
    val price: Long,
    val currency: Currency,
    val appliedPriceDate: LocalDate
)

interface AssetPricePort {
    fun getPrice(assetId: UUID, date: LocalDate): AssetPriceSummary?
}