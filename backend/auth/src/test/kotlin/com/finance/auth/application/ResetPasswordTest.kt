package com.finance.auth.application

import com.finance.auth.InMemoryPasswordResetTokenRepository
import com.finance.auth.InMemoryUserRepository
import com.finance.auth.PlainPasswordEncoder
import com.finance.auth.VALID_PASSWORD
import com.finance.auth.domain.PasswordResetToken
import com.finance.auth.domain.User
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class ResetPasswordTest {

    private val userRepository = InMemoryUserRepository()
    private val tokenRepository = InMemoryPasswordResetTokenRepository()
    private val passwordEncoder = PlainPasswordEncoder()
    private val useCase = ResetPassword(userRepository, tokenRepository, passwordEncoder)

    private val userId = UUID.randomUUID()
    private val email = "test@example.com"
    private val rawOtp = "123456"

    @BeforeEach
    fun setup() {
        userRepository.save(User(userId, email, "oldhash", true))
        tokenRepository.save(
            PasswordResetToken(
                id = UUID.randomUUID(),
                userId = userId,
                otpHash = rawOtp,
                expiresAt = Instant.now().plusSeconds(600),
                used = false
            )
        )
    }

    @Test
    fun resetsPasswordSuccessfully() {
        useCase.execute(ResetPassword.Command(email, rawOtp, VALID_PASSWORD))
        val user = userRepository.findByEmail(email)!!
        assertEquals(VALID_PASSWORD, user.passwordHash)
    }

    @Test
    fun marksTokenAsUsed() {
        useCase.execute(ResetPassword.Command(email, rawOtp, VALID_PASSWORD))
        val token = tokenRepository.store.values.first()
        assertTrue(token.used)
    }

    @Test
    fun rejectsUnknownEmail() {
        assertThrows(NotFoundException::class.java) {
            useCase.execute(ResetPassword.Command("unknown@example.com", rawOtp, VALID_PASSWORD))
        }
    }

    @Test
    fun rejectsInvalidOtp() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ResetPassword.Command(email, "wrong", VALID_PASSWORD))
        }
    }

    @Test
    fun rejectsExpiredToken() {
        tokenRepository.store.clear()
        tokenRepository.save(
            PasswordResetToken(
                id = UUID.randomUUID(),
                userId = userId,
                otpHash = rawOtp,
                expiresAt = Instant.now().minusSeconds(1),
                used = false
            )
        )
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ResetPassword.Command(email, rawOtp, VALID_PASSWORD))
        }
    }

    @Test
    fun rejectsUsedToken() {
        tokenRepository.store.clear()
        tokenRepository.save(
            PasswordResetToken(
                id = UUID.randomUUID(),
                userId = userId,
                otpHash = rawOtp,
                expiresAt = Instant.now().plusSeconds(600),
                used = true
            )
        )
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ResetPassword.Command(email, rawOtp, VALID_PASSWORD))
        }
    }

    @Test
    fun rejectsWeakPassword() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ResetPassword.Command(email, rawOtp, "weak"))
        }
    }
}