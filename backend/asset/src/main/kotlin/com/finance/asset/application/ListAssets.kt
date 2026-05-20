package com.finance.asset.application

import com.finance.asset.domain.Asset
import com.finance.asset.domain.AssetRepository
import com.finance.shared.PageResult

class ListAssets(
    private val assetRepository: AssetRepository
) {
    data class Query(val page: Int = 0, val pageSize: Int = 20, val name: String? = null)

    fun execute(query: Query): PageResult<Asset> {
        val name = query.name?.trim()?.takeIf { it.isNotBlank() }
        val items = assetRepository.findAll(query.page, query.pageSize, name)
        val total = assetRepository.count(name)
        return PageResult.of(items, query.page, query.pageSize, total)
    }
}