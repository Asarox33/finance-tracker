package com.finance.inflation.infrastructure

import com.finance.shared.Currency
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface JpaInflationIndexSpringRepository : JpaRepository<JpaInflationIndexEntity, UUID> {

    fun findByCurrencyAndYearMonth(currency: Currency, yearMonth: String): JpaInflationIndexEntity?

    fun countByCurrency(currency: Currency): Long

    @Query("SELECT e FROM JpaInflationIndexEntity e WHERE e.currency = :currency ORDER BY e.yearMonth ASC")
    fun findByCurrencyOrderByYearMonthAsc(currency: Currency, pageable: Pageable): Page<JpaInflationIndexEntity>

    @Query("SELECT e FROM JpaInflationIndexEntity e WHERE e.currency = :currency AND e.yearMonth <= :yearMonth ORDER BY e.yearMonth DESC")
    fun findLatestOnOrBefore(currency: Currency, yearMonth: String, pageable: Pageable): Page<JpaInflationIndexEntity>

    @Query("SELECT e FROM JpaInflationIndexEntity e WHERE e.currency = :currency AND e.yearMonth >= :yearMonth ORDER BY e.yearMonth ASC")
    fun findEarliestOnOrAfter(currency: Currency, yearMonth: String, pageable: Pageable): Page<JpaInflationIndexEntity>
}