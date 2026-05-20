package com.finance.asset.domain

import java.util.UUID

interface AssetRepository {
    fun save(asset: Asset): Asset
    fun findById(id: UUID): Asset?
    fun findAll(page: Int, pageSize: Int, name: String? = null): List<Asset>
    fun count(name: String? = null): Long
    fun existsByIsin(isin: String): Boolean
}