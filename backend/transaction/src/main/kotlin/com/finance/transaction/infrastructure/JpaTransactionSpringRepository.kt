package com.finance.transaction.infrastructure

import com.finance.transaction.domain.TransactionStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate
import java.util.UUID

interface JpaTransactionSpringRepository : JpaRepository<JpaTransactionEntity, UUID> {
    fun findByAccountIdAndStatus(accountId: UUID, status: TransactionStatus, pageable: Pageable): Page<JpaTransactionEntity>
    fun countByAccountIdAndStatus(accountId: UUID, status: TransactionStatus): Long
    fun findByAccountIdAndStatusAndDateBetween(
        accountId: UUID,
        status: TransactionStatus,
        dateStart: LocalDate,
        dateEnd: LocalDate,
        pageable: Pageable
    ): Page<JpaTransactionEntity>
    fun countByAccountIdAndStatusAndDateBetween(
        accountId: UUID,
        status: TransactionStatus,
        dateStart: LocalDate,
        dateEnd: LocalDate
    ): Long
}