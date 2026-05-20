package com.finance.price.domain.ports

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

data class AssetEndOfDayQuote(
    val assetId: UUID,
    val priceMinor: Long,
    val currency: Currency,
    val date: LocalDate
)

data class QuotableAsset(
    val id: UUID,
    val ticker: String?,
    val isin: String?,
    val currency: Currency
)

interface AssetQuotePort {
    fun fetchEndOfDayQuotes(date: LocalDate, assets: List<QuotableAsset>): List<AssetEndOfDayQuote>
}
