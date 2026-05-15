package com.finance.auth.application

import com.finance.auth.domain.RefreshToken
import com.finance.auth.domain.RefreshTokenRepository
import com.finance.auth.domain.UserRepository
import com.finance.shared.error.AuthenticationFailedException

class AuthenticateUser(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val tokenIssuer: TokenIssuer,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val refreshTokenFactory: RefreshTokenFactory,
    private val refreshTtl: java.time.Duration,
    private val clock: java.time.Clock = java.time.Clock.systemUTC()
) {
    data class Command(val email: String, val rawPassword: String)

    fun execute(command: Command): IssuedAuthSession {
        val now = clock.instant()
        val user = userRepository.findByEmail(command.email)
            ?: throw AuthenticationFailedException("Invalid credentials")

        if (!user.canAttemptLogin(now)) throw AccountLockedException("Account is locked. Try again later.")

        if (!passwordEncoder.matches(command.rawPassword, user.passwordHash)) {
            userRepository.save(user.recordFailedLogin(now))
            throw AuthenticationFailedException("Invalid credentials")
        }

        userRepository.save(user.recordSuccessfulLogin())

        val access = tokenIssuer.issue(user.id)
        val opaque = refreshTokenFactory.create()
        val expiresAt = now.plus(refreshTtl)
        refreshTokenRepository.save(
            RefreshToken(
                id = java.util.UUID.randomUUID(),
                userId = user.id,
                tokenHash = opaque.tokenHash,
                expiresAt = expiresAt,
                revokedAt = null,
                createdAt = now
            )
        )
        return IssuedAuthSession(accessToken = access.value, refreshTokenPlain = opaque.plainText)
    }
}