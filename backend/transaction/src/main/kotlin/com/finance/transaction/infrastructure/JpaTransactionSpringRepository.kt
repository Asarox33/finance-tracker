package com.finance.transaction.infrastructure

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate
import java.util.UUID

interface JpaTransactionSpringRepository : JpaRepository<JpaTransactionEntity, UUID> {
    fun findByAccountId(accountId: UUID, pageable: Pageable): Page<JpaTransactionEntity>
    fun countByAccountId(accountId: UUID): Long
    fun findByAccountIdAndDateBetween(
        accountId: UUID,
        dateStart: LocalDate,
        dateEnd: LocalDate,
        pageable: Pageable
    ): Page<JpaTransactionEntity>
    fun countByAccountIdAndDateBetween(
        accountId: UUID,
        dateStart: LocalDate,
        dateEnd: LocalDate
    ): Long
}