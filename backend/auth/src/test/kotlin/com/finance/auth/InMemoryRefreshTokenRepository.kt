package com.finance.auth

import com.finance.auth.application.OpaqueRefreshTokenCreated
import com.finance.auth.application.RefreshTokenFactory
import com.finance.auth.domain.RefreshToken
import com.finance.auth.domain.RefreshTokenRepository
import java.time.Instant
import java.util.UUID

class InMemoryRefreshTokenRepository : RefreshTokenRepository {
    private val byId = mutableMapOf<UUID, RefreshToken>()
    private val activeByHash = mutableMapOf<String, UUID>()

    override fun save(token: RefreshToken): RefreshToken {
        byId[token.id] = token
        if (token.revokedAt == null) {
            activeByHash[token.tokenHash] = token.id
        }
        return token
    }

    override fun findActiveByTokenHash(tokenHash: String): RefreshToken? {
        val id = activeByHash[tokenHash] ?: return null
        return byId[id]
    }

    override fun revoke(id: UUID, revokedAt: Instant) {
        val existing = byId[id] ?: return
        if (existing.revokedAt != null) return
        val updated = existing.copy(revokedAt = revokedAt)
        byId[id] = updated
        activeByHash.remove(existing.tokenHash)
    }
}

class TestRefreshTokenFactory : RefreshTokenFactory {
    private var counter = 0

    override fun create(): OpaqueRefreshTokenCreated {
        val plain = "refresh-plain-${counter++}"
        return OpaqueRefreshTokenCreated(plainText = plain, tokenHash = hash(plain))
    }

    override fun hash(plainText: String): String = plainText.reversed()
}
