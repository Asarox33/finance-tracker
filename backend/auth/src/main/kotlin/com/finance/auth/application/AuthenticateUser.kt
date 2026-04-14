package com.finance.auth.application

import com.finance.auth.domain.AuthToken
import com.finance.auth.domain.UserRepository
import com.finance.shared.error.AuthenticationFailedException

class AuthenticateUser(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val tokenIssuer: TokenIssuer
) {
    data class Command(val email: String, val rawPassword: String)

    fun execute(command: Command): AuthToken {
        val user = userRepository.findByEmail(command.email)
            ?: throw AuthenticationFailedException("Invalid credentials")
        if (!user.active) throw AuthenticationFailedException("Account is inactive")
        if (!passwordEncoder.matches(command.rawPassword, user.passwordHash)) {
            throw AuthenticationFailedException("Invalid credentials")
        }
        return tokenIssuer.issue(user.id)
    }
}