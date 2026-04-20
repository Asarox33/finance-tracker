package com.finance.auth.infrastructure

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

interface JpaPasswordResetTokenSpringRepository : JpaRepository<JpaPasswordResetTokenEntity, UUID> {
    fun findByUserId(userId: UUID): List<JpaPasswordResetTokenEntity>

    @Modifying
    @Transactional
    @Query("UPDATE JpaPasswordResetTokenEntity t SET t.used = true WHERE t.userId = :userId AND t.used = false")
    fun invalidateAllForUser(userId: UUID)
}