package com.finance.asset.domain

import java.util.UUID

interface AssetRepository {
    fun save(asset: Asset): Asset
    fun findById(id: UUID): Asset?
    fun findAll(page: Int, pageSize: Int): List<Asset>
    fun count(): Long
    fun existsByIsin(isin: String): Boolean
}