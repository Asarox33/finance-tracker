package com.finance.fx.infrastructure

import com.finance.shared.Currency
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate
import java.util.UUID

interface JpaFxRateSpringRepository : JpaRepository<JpaFxRateEntity, UUID> {

    fun findBySourceCurrencyAndTargetCurrencyAndDate(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        date: LocalDate
    ): JpaFxRateEntity?

    fun findBySourceCurrencyAndTargetCurrency(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        pageable: Pageable
    ): Page<JpaFxRateEntity>

    fun countBySourceCurrencyAndTargetCurrency(
        sourceCurrency: Currency,
        targetCurrency: Currency
    ): Long

    @Query("""
        SELECT r FROM JpaFxRateEntity r
        WHERE r.sourceCurrency = :sourceCurrency
        AND r.targetCurrency = :targetCurrency
        AND r.date <= :date
        AND r.date >= :lookbackDate
        ORDER BY r.date DESC
    """)
    fun findLatestOnOrBefore(
        sourceCurrency: Currency,
        targetCurrency: Currency,
        date: LocalDate,
        lookbackDate: LocalDate,
        pageable: Pageable
    ): Page<JpaFxRateEntity>
}