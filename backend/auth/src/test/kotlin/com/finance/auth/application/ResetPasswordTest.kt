package com.finance.auth.application

import com.finance.auth.InMemoryPasswordResetTokenRepository
import com.finance.auth.InMemoryUserRepository
import com.finance.auth.PlainPasswordEncoder
import com.finance.auth.VALID_PASSWORD
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

    private val testOtp = "123456"

    @Test
    fun resetsPasswordWithValidOtp() {
        val userId = UUID.randomUUID()
        userRepository.save(User(userId, "user@example.com", "oldhash", true))
        tokenRepository.save(validToken(userId))
        useCase.execute(ResetPassword.Command(userId, testOtp, VALID_PASSWORD))
        assertEquals(VALID_PASSWORD, userRepository.findById(userId)!!.passwordHash)
    }

    @Test
    fun reactivatesLockedAccountOnReset() {
        val userId = UUID.randomUUID()
        userRepository.save(User(userId, "user@example.com", "oldhash", false, 3))
        tokenRepository.save(validToken(userId))
        useCase.execute(ResetPassword.Command(userId, testOtp, VALID_PASSWORD))
        val user = userRepository.findById(userId)!!
        assertTrue(user.active)
        assertEquals(0, user.failedLoginAttempts)
    }

    @Test
    fun rejectsExpiredOtp() {
        val userId = UUID.randomUUID()
        userRepository.save(User(userId, "user@example.com", "oldhash", true))
        tokenRepository.save(expiredToken(userId))
        assertThrows(BusinessRuleViolationException::class.java) {
            useCase.execute(ResetPassword.Command(userId, testOtp, VALID_PASSWORD))
        }
    }

    @Test
    fun rejectsUsedOtp() {
        val userId = UUID.randomUUID()
        userRepository.save(User(userId, "user@example.com", "oldhash", true))
        tokenRepository.save(usedToken(userId))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ResetPassword.Command(userId, testOtp, VALID_PASSWORD))
        }
    }

    @Test
    fun rejectsInvalidOtp() {
        val userId = UUID.randomUUID()
        userRepository.save(User(userId, "user@example.com", "oldhash", true))
        tokenRepository.save(validToken(userId))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ResetPassword.Command(userId, "wrong", VALID_PASSWORD))
        }
    }

    @Test
    fun rejectsWeakNewPassword() {
        val userId = UUID.randomUUID()
        userRepository.save(User(userId, "user@example.com", "oldhash", true))
        tokenRepository.save(validToken(userId))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ResetPassword.Command(userId, testOtp, "weak"))
        }
    }

    private fun validToken(userId: UUID) = PasswordResetToken(
        UUID.randomUUID(), userId, testOtp, Instant.now().plusSeconds(600), false
    )

    private fun expiredToken(userId: UUID) = PasswordResetToken(
        UUID.randomUUID(), userId, testOtp, Instant.now().minusSeconds(1), false
    )

    private fun usedToken(userId: UUID) = PasswordResetToken(
        UUID.randomUUID(), userId, testOtp, Instant.now().plusSeconds(600), true
    )
}