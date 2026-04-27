package com.finance.price.infrastructure

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate
import java.util.UUID

interface JpaAssetPriceSpringRepository : JpaRepository<JpaAssetPriceEntity, UUID> {
    fun findByAssetIdAndDate(assetId: UUID, date: LocalDate): JpaAssetPriceEntity?
    fun findByAssetId(assetId: UUID, pageable: Pageable): Page<JpaAssetPriceEntity>
    fun countByAssetId(assetId: UUID): Long

    @Query("""
        SELECT p FROM JpaAssetPriceEntity p
        WHERE p.assetId = :assetId
        AND p.date <= :date
        AND p.date >= :lookbackDate
        ORDER BY p.date DESC
    """)
    fun findLatestOnOrBefore(
        assetId: UUID,
        date: LocalDate,
        lookbackDate: LocalDate,
        pageable: Pageable
    ): Page<JpaAssetPriceEntity>
}