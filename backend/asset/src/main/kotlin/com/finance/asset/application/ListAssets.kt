package com.finance.asset.application

import com.finance.asset.domain.Asset
import com.finance.asset.domain.AssetRepository
import com.finance.shared.PageResult

class ListAssets(
    private val assetRepository: AssetRepository
) {
    data class Query(val page: Int = 0, val pageSize: Int = 20)

    fun execute(query: Query): PageResult<Asset> {
        val items = assetRepository.findAll(query.page, query.pageSize)
        val total = assetRepository.count()
        return PageResult.of(items, query.page, query.pageSize, total)
    }
}