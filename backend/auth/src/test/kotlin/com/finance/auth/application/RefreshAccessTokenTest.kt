package com.finance.auth.application

import com.finance.auth.FixedTokenIssuer
import com.finance.auth.InMemoryRefreshTokenRepository
import com.finance.auth.InMemoryUserRepository
import com.finance.auth.TestRefreshTokenFactory
import com.finance.auth.domain.RefreshToken
import com.finance.auth.domain.User
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.Duration
import java.time.Instant
import java.util.UUID

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
        Duration.ofDays(7)
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
}
