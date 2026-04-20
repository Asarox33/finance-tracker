package com.finance.auth.application

import com.finance.auth.domain.PasswordResetToken
import com.finance.auth.domain.PasswordResetTokenRepository
import com.finance.auth.domain.UserRepository
import com.finance.shared.error.NotFoundException
import java.time.Instant
import java.util.UUID

class RequestPasswordReset(
    private val userRepository: UserRepository,
    private val passwordResetTokenRepository: PasswordResetTokenRepository,
    private val otpGenerator: OtpGenerator,
    private val passwordEncoder: PasswordEncoder,
    private val emailSender: EmailSender
) {
    data class Command(val email: String)

    fun execute(command: Command) {
        val user = userRepository.findByEmail(command.email)
            ?: throw NotFoundException("No account found for email: ${command.email}")

        passwordResetTokenRepository.invalidateAllForUser(user.id)

        val rawOtp = otpGenerator.generate()
        val token = PasswordResetToken(
            id = UUID.randomUUID(),
            userId = user.id,
            otpHash = passwordEncoder.encode(rawOtp),
            expiresAt = Instant.now().plusSeconds(600),
            used = false
        )
        passwordResetTokenRepository.save(token)

        emailSender.send(
            to = command.email,
            subject = "Password reset code",
            body = "Your password reset code is: $rawOtp. It expires in 10 minutes."
        )
    }
}