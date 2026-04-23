package com.finance.asset.infrastructure

import com.finance.asset.domain.Asset
import com.finance.asset.domain.AssetRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class AssetRepositoryAdapter(
    private val jpaRepo: JpaAssetSpringRepository
) : AssetRepository {

    override fun save(asset: Asset): Asset {
        val entity = jpaRepo.findById(asset.id).orElse(null)
            ?.also {
                it.name = asset.name
                it.type = asset.type
                it.currency = asset.currency
                it.isin = asset.isin
                it.ticker = asset.ticker
            }
            ?: JpaAssetEntity(
                id = asset.id,
                name = asset.name,
                type = asset.type,
                currency = asset.currency,
                isin = asset.isin,
                ticker = asset.ticker,
                createdByUserId = asset.createdByUserId
            )
        return jpaRepo.save(entity).toDomain()
    }

    override fun findById(id: UUID): Asset? =
        jpaRepo.findById(id).orElse(null)?.toDomain()

    override fun findAll(page: Int, pageSize: Int): List<Asset> =
        jpaRepo.findAllBy(PageRequest.of(page, pageSize)).content.map { it.toDomain() }

    override fun count(): Long = jpaRepo.count()

    override fun existsByIsin(isin: String): Boolean =
        jpaRepo.existsByIsin(isin)
}

private fun JpaAssetEntity.toDomain() = Asset(
    id = id,
    name = name,
    type = type,
    currency = currency,
    isin = isin,
    ticker = ticker,
    createdByUserId = createdByUserId
)