package com.finance.fees.infrastructure

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface JpaFeeSpringRepository : JpaRepository<JpaFeeEntity, UUID> {
    fun findByAccountId(accountId: UUID, pageable: Pageable): Page<JpaFeeEntity>
    fun countByAccountId(accountId: UUID): Long
    fun findByTransactionId(transactionId: UUID): List<JpaFeeEntity>
}