package com.finance.price

import com.finance.price.domain.AssetPrice
import com.finance.price.domain.AssetPriceRepository
import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

class InMemoryAssetPriceRepository : AssetPriceRepository {
    private val store = mutableMapOf<UUID, AssetPrice>()

    override fun save(assetPrice: AssetPrice): AssetPrice { store[assetPrice.id] = assetPrice; return assetPrice }
    override fun findById(id: UUID): AssetPrice? = store[id]

    override fun findByAssetIdAndDate(assetId: UUID, date: LocalDate): AssetPrice? =
        store.values.firstOrNull { it.assetId == assetId && it.date == date }

    override fun findLatestByAssetIdOnOrBefore(assetId: UUID, date: LocalDate, lookbackDays: Int): AssetPrice? =
        store.values
            .filter { it.assetId == assetId && !it.date.isAfter(date) && !it.date.isBefore(date.minusDays(lookbackDays.toLong())) }
            .maxByOrNull { it.date }
            ?.copy(appliedPriceDate = store.values
                .filter { it.assetId == assetId && !it.date.isAfter(date) }
                .maxByOrNull { it.date }?.date ?: date)

    override fun findByAssetId(assetId: UUID, page: Int, pageSize: Int): List<AssetPrice> =
        store.values.filter { it.assetId == assetId }
            .sortedByDescending { it.date }
            .drop(page * pageSize).take(pageSize)

    override fun countByAssetId(assetId: UUID): Long =
        store.values.count { it.assetId == assetId }.toLong()
}

fun testAssetPrice(
    id: UUID = UUID.randomUUID(),
    assetId: UUID = UUID.randomUUID(),
    price: Long = 15000L,
    currency: Currency = Currency.USD,
    date: LocalDate = LocalDate.of(2024, 1, 15)
) = AssetPrice(id, assetId, price, currency, date)