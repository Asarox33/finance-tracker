package com.finance.account.infrastructure

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface JpaAccountSpringRepository : JpaRepository<JpaAccountEntity, UUID> {
    fun findByUserId(userId: UUID, pageable: Pageable): Page<JpaAccountEntity>
    fun countByUserId(userId: UUID): Long
}