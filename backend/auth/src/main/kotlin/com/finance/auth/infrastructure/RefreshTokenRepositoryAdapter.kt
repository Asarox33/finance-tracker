package com.finance.auth.infrastructure

import com.finance.auth.domain.RefreshToken
import com.finance.auth.domain.RefreshTokenRepository
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.UUID

@Component
class RefreshTokenRepositoryAdapter(
    private val jpa: JpaRefreshTokenSpringRepository
) : RefreshTokenRepository {

    override fun save(token: RefreshToken): RefreshToken {
        jpa.save(
            JpaRefreshTokenEntity(
                id = token.id,
                userId = token.userId,
                tokenHash = token.tokenHash,
                expiresAt = token.expiresAt,
                revokedAt = token.revokedAt,
                createdAt = token.createdAt
            )
        )
        return token
    }

    override fun findActiveByTokenHash(tokenHash: String): RefreshToken? =
        jpa.findByTokenHashAndRevokedAtIsNull(tokenHash)?.toDomain()

    override fun revoke(id: UUID, revokedAt: Instant) {
        val entity = jpa.findById(id).orElse(null) ?: return
        if (entity.revokedAt != null) return
        entity.revokedAt = revokedAt
        jpa.save(entity)
    }

    private fun JpaRefreshTokenEntity.toDomain(): RefreshToken =
        RefreshToken(
            id = id,
            userId = userId,
            tokenHash = tokenHash,
            expiresAt = expiresAt,
            revokedAt = revokedAt,
            createdAt = createdAt
        )
}
