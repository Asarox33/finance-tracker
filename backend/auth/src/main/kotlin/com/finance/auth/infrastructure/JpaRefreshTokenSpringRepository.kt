package com.finance.auth.infrastructure

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface JpaRefreshTokenSpringRepository : JpaRepository<JpaRefreshTokenEntity, UUID> {
    fun findByTokenHashAndRevokedAtIsNull(tokenHash: String): JpaRefreshTokenEntity?
}
