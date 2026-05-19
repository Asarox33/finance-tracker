package com.finance.auth.application

import com.finance.auth.*
import com.finance.auth.domain.RefreshToken
import com.finance.auth.domain.User
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.*

class RefreshAccessTokenTest {

    private val users = InMemoryUserRepository()
    private val refreshRepo = InMemoryRefreshTokenRepository()
    private val factory = TestRefreshTokenFactory()
    private val issuer = FixedTokenIssuer()

    private val useCase = RefreshAccessToken(
        users,
        refreshRepo,
        issuer,
        factory,
        FixedSessionTimeoutPort(10)
    )

    @Test
    fun rotatesAndReturnsNewPair() {
        val userId = UUID.randomUUID()
        users.save(User(userId, "a@b.com", "hash", true))
        val opaque = factory.create()
        val now = Instant.now()
        refreshRepo.save(
            RefreshToken(
                id = UUID.randomUUID(),
                userId = userId,
                tokenHash = opaque.tokenHash,
                expiresAt = now.plusSeconds(3600),
                revokedAt = null,
                createdAt = now
            )
        )

        val session = useCase.execute(opaque.plainText)

        assertNotNull(session.accessToken)
        assertNotNull(session.refreshTokenPlain)
        assertEquals(null, refreshRepo.findActiveByTokenHash(opaque.tokenHash))
    }

    @Test
    fun rejectsUnknownRefresh() {
        assertThrows(RefreshTokenInvalidException::class.java) {
            useCase.execute("nope")
        }
    }

    @Test
    fun rejectsRefreshTokenAtExpirationInstant() {
        val now = Instant.parse("2026-05-18T19:00:00Z")
        val userId = UUID.randomUUID()
        users.save(User(userId, "expires@b.com", "hash", true))
        val opaque = factory.create()
        refreshRepo.save(
            RefreshToken(
                id = UUID.randomUUID(),
                userId = userId,
                tokenHash = opaque.tokenHash,
                expiresAt = now,
                revokedAt = null,
                createdAt = now.minusSeconds(600)
            )
        )
        val expiringUseCase = RefreshAccessToken(
            users,
            refreshRepo,
            issuer,
            factory,
            FixedSessionTimeoutPort(10),
            Clock.fixed(now, ZoneOffset.UTC)
        )

        assertThrows(RefreshTokenInvalidException::class.java) {
            expiringUseCase.execute(opaque.plainText)
        }
    }
}
