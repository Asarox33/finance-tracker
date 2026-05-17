package com.finance.account.infrastructure

import com.finance.account.domain.AccountStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface JpaAccountSpringRepository : JpaRepository<JpaAccountEntity, UUID> {
    fun findByUserId(userId: UUID, pageable: Pageable): Page<JpaAccountEntity>
    fun countByUserId(userId: UUID): Long
    fun findByUserIdAndStatus(userId: UUID, status: AccountStatus, pageable: Pageable): Page<JpaAccountEntity>
    fun countByUserIdAndStatus(userId: UUID, status: AccountStatus): Long
}