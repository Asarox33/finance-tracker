package com.finance.asset.infrastructure

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface JpaAssetSpringRepository : JpaRepository<JpaAssetEntity, UUID> {
    fun existsByIsin(isin: String): Boolean
    fun findAllBy(pageable: Pageable): Page<JpaAssetEntity>
}