package com.finance.asset

import com.finance.asset.domain.Asset
import com.finance.asset.domain.AssetRepository
import com.finance.asset.domain.AssetType
import com.finance.shared.Currency
import java.util.UUID

class InMemoryAssetRepository : AssetRepository {
    private val store = mutableMapOf<UUID, Asset>()
    override fun save(asset: Asset): Asset { store[asset.id] = asset; return asset }
    override fun findById(id: UUID): Asset? = store[id]
    override fun findAll(page: Int, pageSize: Int, name: String?): List<Asset> {
        val filtered = name?.let { term ->
            val lower = term.lowercase()
            store.values.filter { asset ->
                asset.name.lowercase().contains(lower) ||
                    asset.ticker?.lowercase()?.contains(lower) == true ||
                    asset.isin?.lowercase()?.contains(lower) == true
            }
        } ?: store.values
        return filtered.sortedBy { it.name.lowercase() }.drop(page * pageSize).take(pageSize)
    }

    override fun count(name: String?): Long {
        if (name == null) return store.size.toLong()
        val lower = name.lowercase()
        return store.values.count { asset ->
            asset.name.lowercase().contains(lower) ||
                asset.ticker?.lowercase()?.contains(lower) == true ||
                asset.isin?.lowercase()?.contains(lower) == true
        }.toLong()
    }
    override fun existsByIsin(isin: String): Boolean = store.values.any { it.isin == isin }
}

fun testAsset(
    id: UUID = UUID.randomUUID(),
    name: String = "Apple Inc.",
    type: AssetType = AssetType.STOCK,
    currency: Currency = Currency.USD,
    isin: String? = "US0378331005",
    ticker: String? = "AAPL",
    createdByUserId: UUID = UUID.randomUUID()
) = Asset(id, name, type, currency, isin, ticker, createdByUserId)