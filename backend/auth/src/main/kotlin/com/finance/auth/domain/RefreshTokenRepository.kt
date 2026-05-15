package com.finance.auth.domain

import java.util.UUID

interface RefreshTokenRepository {
    fun save(token: RefreshToken): RefreshToken
    fun findActiveByTokenHash(tokenHash: String): RefreshToken?
    fun revoke(id: UUID, revokedAt: java.time.Instant)
}
