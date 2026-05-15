package com.finance.auth.infrastructure

import com.finance.auth.application.TokenIssuer
import com.finance.auth.domain.AuthToken
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*

@Component
class TokenService(
    @param:Value($$"${auth.jwt.secret}")
    private val secret: String,

    @Value($$"${auth.jwt.access-expiration-ms}")
    accessExpirationMs: Long
) : TokenIssuer {

    private val logger = LoggerFactory.getLogger(TokenService::class.java)

    private val effectiveAccessExpirationMs: Long =
        accessExpirationMs.coerceAtMost(MAX_ACCESS_EXPIRATION_MS).also { effective ->
            if (accessExpirationMs > MAX_ACCESS_EXPIRATION_MS) {
                logger.warn(
                    "auth.jwt.access-expiration-ms ({}) exceeds maximum ({}); using {}",
                    accessExpirationMs,
                    MAX_ACCESS_EXPIRATION_MS,
                    effective
                )
            }
        }

    private val key by lazy { Keys.hmacShaKeyFor(secret.toByteArray()) }

    override fun issue(userId: UUID): AuthToken {
        val token = Jwts.builder()
            .subject(userId.toString())
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + effectiveAccessExpirationMs))
            .signWith(key)
            .compact()
        return AuthToken(value = token, userId = userId)
    }

    companion object {
        const val MAX_ACCESS_EXPIRATION_MS: Long = 600_000L
    }
}
