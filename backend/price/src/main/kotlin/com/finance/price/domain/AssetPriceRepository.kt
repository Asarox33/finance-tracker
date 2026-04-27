package com.finance.price.domain

import java.time.LocalDate
import java.util.UUID

interface AssetPriceRepository {
    fun save(assetPrice: AssetPrice): AssetPrice
    fun findById(id: UUID): AssetPrice?
    fun findByAssetIdAndDate(assetId: UUID, date: LocalDate): AssetPrice?
    fun findLatestByAssetIdOnOrBefore(assetId: UUID, date: LocalDate, lookbackDays: Int): AssetPrice?
    fun findByAssetId(assetId: UUID, page: Int, pageSize: Int): List<AssetPrice>
    fun countByAssetId(assetId: UUID): Long
}