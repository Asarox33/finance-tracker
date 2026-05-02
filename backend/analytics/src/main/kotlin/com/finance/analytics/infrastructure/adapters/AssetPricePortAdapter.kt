package com.finance.analytics.infrastructure.adapters

import com.finance.analytics.domain.ports.AssetPricePort
import com.finance.analytics.domain.ports.AssetPriceSummary
import com.finance.price.application.GetAssetPrice
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

@Component
class AssetPricePortAdapter(
    private val getAssetPrice: GetAssetPrice
) : AssetPricePort {
    override fun getPrice(assetId: UUID, date: LocalDate): AssetPriceSummary? {
        return try {
            val price = getAssetPrice.execute(GetAssetPrice.Query(assetId, date))
            AssetPriceSummary(price.assetId, price.price, price.currency, price.appliedPriceDate)
        } catch (_: Exception) {
            null
        }
    }
}