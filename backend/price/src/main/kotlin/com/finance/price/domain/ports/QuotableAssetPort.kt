package com.finance.price.domain.ports

interface QuotableAssetPort {
    fun findQuotableAssets(maxItems: Int = 500): List<QuotableAsset>
}
