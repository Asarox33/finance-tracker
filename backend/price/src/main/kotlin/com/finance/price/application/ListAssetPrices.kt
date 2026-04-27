package com.finance.price.application

import com.finance.price.domain.AssetPrice
import com.finance.price.domain.AssetPriceRepository
import com.finance.shared.PageResult
import java.util.UUID

class ListAssetPrices(
    private val assetPriceRepository: AssetPriceRepository
) {
    data class Query(
        val assetId: UUID,
        val page: Int = 0,
        val pageSize: Int = 20
    )

    fun execute(query: Query): PageResult<AssetPrice> {
        val items = assetPriceRepository.findByAssetId(query.assetId, query.page, query.pageSize)
        val total = assetPriceRepository.countByAssetId(query.assetId)
        return PageResult.of(items, query.page, query.pageSize, total)
    }
}