package com.finance.price.infrastructure

import com.finance.price.domain.AssetPrice
import com.finance.price.domain.AssetPriceRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

@Component
class AssetPriceRepositoryAdapter(
    private val jpaRepo: JpaAssetPriceSpringRepository
) : AssetPriceRepository {

    override fun save(assetPrice: AssetPrice): AssetPrice {
        val entity = JpaAssetPriceEntity(
            id = assetPrice.id,
            assetId = assetPrice.assetId,
            price = assetPrice.price,
            currency = assetPrice.currency,
            date = assetPrice.date,
            appliedPriceDate = assetPrice.appliedPriceDate
        )
        return jpaRepo.save(entity).toDomain()
    }

    override fun findById(id: UUID): AssetPrice? =
        jpaRepo.findById(id).orElse(null)?.toDomain()

    override fun findByAssetIdAndDate(assetId: UUID, date: LocalDate): AssetPrice? =
        jpaRepo.findByAssetIdAndDate(assetId, date)?.toDomain()

    override fun findLatestByAssetIdOnOrBefore(
        assetId: UUID,
        date: LocalDate,
        lookbackDays: Int
    ): AssetPrice? {
        val lookbackDate = date.minusDays(lookbackDays.toLong())
        return jpaRepo.findLatestOnOrBefore(assetId, date, lookbackDate, PageRequest.of(0, 1))
            .content.firstOrNull()
            ?.toDomain()
            ?.copy(appliedPriceDate = jpaRepo.findLatestOnOrBefore(
                assetId, date, lookbackDate, PageRequest.of(0, 1)
            ).content.firstOrNull()?.date ?: date)
    }

    override fun findByAssetId(assetId: UUID, page: Int, pageSize: Int): List<AssetPrice> =
        jpaRepo.findByAssetId(assetId, PageRequest.of(page, pageSize)).content.map { it.toDomain() }

    override fun countByAssetId(assetId: UUID): Long =
        jpaRepo.countByAssetId(assetId)
}

private fun JpaAssetPriceEntity.toDomain() = AssetPrice(
    id = id,
    assetId = assetId,
    price = price,
    currency = currency,
    date = date,
    appliedPriceDate = appliedPriceDate
)