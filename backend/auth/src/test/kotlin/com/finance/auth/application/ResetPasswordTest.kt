package com.finance.auth.application

import com.finance.auth.InMemoryPasswordResetTokenRepository
import com.finance.auth.InMemoryUserRepository
import com.finance.auth.PlainPasswordEncoder
import com.finance.auth.domain.PasswordResetToken
import com.finance.auth.domain.User
import com.finance.shared.error.BusinessRuleViolationException
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class ResetPasswordTest {

    private val userRepository = InMemoryUserRepository()
    private val tokenRepository = InMemoryPasswordResetTokenRepository()
    private val encoder = PlainPasswordEncoder()
    private val useCase = ResetPassword(userRepository, tokenRepository, encoder)

    @Test
    fun resetsPasswordWithValidOtp() {
        val userId = UUID.randomUUID()
        userRepository.save(User(userId, "user@example.com", "old", true))
        tokenRepository.save(validToken(userId, "123456"))
        useCase.execute(ResetPassword.Command(userId, "123456", "newpass"))
        assertEquals("newpass", userRepository.findById(userId)!!.passwordHash)
    }

    @Test
    fun reactivatesLockedAccountOnReset() {
        val userId = UUID.randomUUID()
        userRepository.save(User(userId, "user@example.com", "old", false, 3))
        tokenRepository.save(validToken(userId, "123456"))
        useCase.execute(ResetPassword.Command(userId, "123456", "newpass"))
        val user = userRepository.findById(userId)!!
        assertTrue(user.active)
        assertEquals(0, user.failedLoginAttempts)
    }

    @Test
    fun rejectsExpiredOtp() {
        val userId = UUID.randomUUID()
        userRepository.save(User(userId, "user@example.com", "old", true))
        tokenRepository.save(expiredToken(userId, "123456"))
        assertThrows(BusinessRuleViolationException::class.java) {
            useCase.execute(ResetPassword.Command(userId, "123456", "newpass"))
        }
    }

    @Test
    fun rejectsUsedOtp() {
        val userId = UUID.randomUUID()
        userRepository.save(User(userId, "user@example.com", "old", true))
        tokenRepository.save(usedToken(userId, "123456"))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ResetPassword.Command(userId, "123456", "newpass"))
        }
    }

    @Test
    fun rejectsInvalidOtp() {
        val userId = UUID.randomUUID()
        userRepository.save(User(userId, "user@example.com", "old", true))
        tokenRepository.save(validToken(userId, "123456"))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ResetPassword.Command(userId, "wrong", "newpass"))
        }
    }

    private fun validToken(userId: UUID, otp: String) = PasswordResetToken(
        UUID.randomUUID(), userId, otp, Instant.now().plusSeconds(600), false
    )

    private fun expiredToken(userId: UUID, otp: String) = PasswordResetToken(
        UUID.randomUUID(), userId, otp, Instant.now().minusSeconds(1), false
    )

    private fun usedToken(userId: UUID, otp: String) = PasswordResetToken(
        UUID.randomUUID(), userId, otp, Instant.now().plusSeconds(600), true
    )
}