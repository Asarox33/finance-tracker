package com.finance.app

import com.finance.asset.domain.AssetRepository
import com.finance.price.domain.ports.QuotableAsset
import com.finance.price.domain.ports.QuotableAssetPort
import org.springframework.stereotype.Component

@Component
class QuotableAssetPortAdapter(
    private val assetRepository: AssetRepository
) : QuotableAssetPort {

    override fun findQuotableAssets(maxItems: Int): List<QuotableAsset> {
        val total = assetRepository.count().toInt()
        if (total == 0) return emptyList()
        val pageSize = minOf(maxItems, total)
        return assetRepository.findAll(page = 0, pageSize = pageSize)
            .filter { !it.ticker.isNullOrBlank() || !it.isin.isNullOrBlank() }
            .map { asset ->
                QuotableAsset(
                    id = asset.id,
                    ticker = asset.ticker,
                    isin = asset.isin,
                    currency = asset.currency
                )
            }
    }
}
