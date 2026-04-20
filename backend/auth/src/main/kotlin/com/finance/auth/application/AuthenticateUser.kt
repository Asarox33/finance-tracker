package com.finance.auth.application

import com.finance.auth.domain.AuthToken
import com.finance.auth.domain.UserRepository
import com.finance.shared.error.AuthenticationFailedException
import java.time.Instant

class AuthenticateUser(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val tokenIssuer: TokenIssuer
) {
    data class Command(val email: String, val rawPassword: String)

    fun execute(command: Command): AuthToken {
        val now = Instant.now()
        val user = userRepository.findByEmail(command.email)
            ?: throw AuthenticationFailedException("Invalid credentials")

        if (!user.canAttemptLogin(now)) throw AccountLockedException("Account is locked. Try again later.")

        if (!passwordEncoder.matches(command.rawPassword, user.passwordHash)) {
            userRepository.save(user.recordFailedLogin(now))
            throw AuthenticationFailedException("Invalid credentials")
        }

        userRepository.save(user.recordSuccessfulLogin())
        return tokenIssuer.issue(user.id)
    }
}