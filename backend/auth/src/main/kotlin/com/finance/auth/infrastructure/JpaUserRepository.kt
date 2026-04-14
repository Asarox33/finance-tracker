package com.finance.auth.infrastructure

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface JpaUserRepository : JpaRepository<JpaUserEntity, UUID> {
    fun findByEmail(email: String): JpaUserEntity?
    fun existsByEmail(email: String): Boolean
}