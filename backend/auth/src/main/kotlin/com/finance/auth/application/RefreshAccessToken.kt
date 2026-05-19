package com.finance.auth.application

import com.finance.auth.domain.RefreshToken
import com.finance.auth.domain.RefreshTokenRepository
import com.finance.auth.domain.UserRepository
import java.time.Clock
import java.util.UUID

class RefreshAccessToken(
    private val userRepository: UserRepository,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val tokenIssuer: TokenIssuer,
    private val refreshTokenFactory: RefreshTokenFactory,
    private val sessionTimeoutPort: SessionTimeoutPort,
    private val clock: Clock = Clock.systemUTC()
) {
    fun execute(refreshTokenPlain: String?): IssuedAuthSession {
        if (refreshTokenPlain.isNullOrBlank()) throw RefreshTokenInvalidException()

        val now = clock.instant()
        val hash = refreshTokenFactory.hash(refreshTokenPlain)
        val existing = refreshTokenRepository.findActiveByTokenHash(hash)
            ?: throw RefreshTokenInvalidException()

        if (!existing.expiresAt.isAfter(now)) throw RefreshTokenInvalidException()

        val user = userRepository.findById(existing.userId) ?: throw RefreshTokenInvalidException()
        if (!user.active) throw RefreshTokenInvalidException()

        refreshTokenRepository.revoke(existing.id, now)

        val sessionTtl = SessionTtl.fromMinutes(sessionTimeoutPort.getSessionTimeoutMinutes(user.id))
        val access = tokenIssuer.issue(user.id, sessionTtl)
        val opaque = refreshTokenFactory.create()
        val newExpiresAt = now.plus(sessionTtl)
        refreshTokenRepository.save(
            RefreshToken(
                id = UUID.randomUUID(),
                userId = user.id,
                tokenHash = opaque.tokenHash,
                expiresAt = newExpiresAt,
                revokedAt = null,
                createdAt = now
            )
        )
        return IssuedAuthSession(
            accessToken = access.value,
            refreshTokenPlain = opaque.plainText,
            refreshMaxAge = sessionTtl
        )
    }
}
