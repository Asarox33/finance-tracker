package com.finance.price.application

import com.finance.price.domain.AssetPrice
import com.finance.price.domain.AssetPriceRepository
import com.finance.shared.error.NotFoundException
import java.time.LocalDate
import java.util.UUID

class GetAssetPrice(
    private val assetPriceRepository: AssetPriceRepository,
    private val lookbackDays: Int
) {
    data class Query(val assetId: UUID, val date: LocalDate)

    fun execute(query: Query): AssetPrice {
        return assetPriceRepository.findByAssetIdAndDate(query.assetId, query.date)
            ?: assetPriceRepository.findLatestByAssetIdOnOrBefore(query.assetId, query.date, lookbackDays)
            ?: throw NotFoundException(
                "No price found for asset ${query.assetId} on or before ${query.date} within $lookbackDays days lookback"
            )
    }
}