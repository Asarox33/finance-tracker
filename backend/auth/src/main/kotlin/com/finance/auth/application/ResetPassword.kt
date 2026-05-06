package com.finance.auth.application

import com.finance.auth.domain.PasswordResetTokenRepository
import com.finance.auth.domain.UserRepository
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import com.finance.shared.validation.PasswordPolicy
import java.time.Instant

class ResetPassword(
    private val userRepository: UserRepository,
    private val passwordResetTokenRepository: PasswordResetTokenRepository,
    private val passwordEncoder: PasswordEncoder
) {
    data class Command(
        val email: String,
        val rawOtp: String,
        val newPassword: String
    )

    fun execute(command: Command) {
        val errors = PasswordPolicy.validate(command.newPassword)
        if (errors.isNotEmpty()) throw InvalidRequestException(errors.first())

        val user = userRepository.findByEmail(command.email)
            ?: throw NotFoundException("No account found for email: ${command.email}")

        val token = passwordResetTokenRepository.findByUserIdAndOtpHash(user.id, command.rawOtp)
            ?: throw InvalidRequestException("Invalid or expired reset code")

        if (token.isExpired(Instant.now())) throw InvalidRequestException("Reset code has expired")

        userRepository.save(
            user.copy(
                passwordHash = passwordEncoder.encode(command.newPassword),
                failedLoginAttempts = 0,
                active = true
            )
        )
        passwordResetTokenRepository.save(token.markUsed())
    }
}