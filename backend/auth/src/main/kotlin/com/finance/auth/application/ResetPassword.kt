package com.finance.auth.application

import com.finance.auth.domain.PasswordResetTokenRepository
import com.finance.auth.domain.UserRepository
import com.finance.shared.error.BusinessRuleViolationException
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import com.finance.shared.validation.PasswordPolicy
import java.time.Instant
import java.util.UUID

class ResetPassword(
    private val userRepository: UserRepository,
    private val passwordResetTokenRepository: PasswordResetTokenRepository,
    private val passwordEncoder: PasswordEncoder
) {
    data class Command(val userId: UUID, val rawOtp: String, val newPassword: String)

    fun execute(command: Command) {
        if (command.newPassword.isBlank()) throw InvalidRequestException("New password must not be blank")

        val passwordErrors = PasswordPolicy.validate(command.newPassword)
        if (passwordErrors.isNotEmpty()) throw InvalidRequestException(passwordErrors.joinToString(", "))

        val user = userRepository.findById(command.userId)
            ?: throw NotFoundException("No account found for id: ${command.userId}")

        val token = passwordResetTokenRepository.findByUserIdAndOtpHash(command.userId, command.rawOtp)
            ?: throw InvalidRequestException("Invalid or expired OTP")

        if (token.used) throw BusinessRuleViolationException("OTP has already been used")
        if (token.isExpired(Instant.now())) throw BusinessRuleViolationException("OTP has expired")

        passwordResetTokenRepository.save(token.markUsed())

        userRepository.save(
            user.copy(
                passwordHash = passwordEncoder.encode(command.newPassword),
                failedLoginAttempts = 0,
                active = true,
                lastFailedLoginAt = null
            )
        )
    }
}