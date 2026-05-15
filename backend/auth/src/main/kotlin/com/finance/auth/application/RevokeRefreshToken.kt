package com.finance.auth.application

import com.finance.auth.domain.RefreshTokenRepository
import java.time.Clock

class RevokeRefreshToken(
    private val refreshTokenRepository: RefreshTokenRepository,
    private val refreshTokenFactory: RefreshTokenFactory,
    private val clock: Clock = Clock.systemUTC()
) {
    fun execute(refreshTokenPlain: String?) {
        if (refreshTokenPlain.isNullOrBlank()) return
        val hash = refreshTokenFactory.hash(refreshTokenPlain)
        val existing = refreshTokenRepository.findActiveByTokenHash(hash) ?: return
        refreshTokenRepository.revoke(existing.id, clock.instant())
    }
}
