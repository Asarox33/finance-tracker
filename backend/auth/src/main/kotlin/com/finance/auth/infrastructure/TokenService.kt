package com.finance.auth.infrastructure

import com.finance.auth.application.TokenIssuer
import com.finance.auth.domain.AuthToken
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.Date
import java.util.UUID

@Component
class TokenService(
    @param:Value($$"${auth.jwt.secret}")
    private val secret: String,

    @param:Value($$"${auth.jwt.access-expiration-ms}")
    private val accessExpirationMs: Long
) : TokenIssuer {

    private val key by lazy { Keys.hmacShaKeyFor(secret.toByteArray()) }

    override fun issue(userId: UUID): AuthToken {
        val token = Jwts.builder()
            .subject(userId.toString())
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + accessExpirationMs))
            .signWith(key)
            .compact()
        return AuthToken(value = token, userId = userId)
    }
}