package com.finance.asset.infrastructure

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface JpaAssetSpringRepository : JpaRepository<JpaAssetEntity, UUID> {
    fun existsByIsin(isin: String): Boolean
    fun findAllBy(pageable: Pageable): Page<JpaAssetEntity>

    @Query(
        """
        SELECT a FROM JpaAssetEntity a
        WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :term, '%'))
           OR LOWER(a.ticker) LIKE LOWER(CONCAT('%', :term, '%'))
           OR LOWER(a.isin) LIKE LOWER(CONCAT('%', :term, '%'))
        """
    )
    fun searchByTerm(@Param("term") term: String, pageable: Pageable): Page<JpaAssetEntity>

    @Query(
        """
        SELECT COUNT(a) FROM JpaAssetEntity a
        WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :term, '%'))
           OR LOWER(a.ticker) LIKE LOWER(CONCAT('%', :term, '%'))
           OR LOWER(a.isin) LIKE LOWER(CONCAT('%', :term, '%'))
        """
    )
    fun countByTerm(@Param("term") term: String): Long
}