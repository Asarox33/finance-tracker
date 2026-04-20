package com.finance.auth.application

import com.finance.auth.FixedOtpGenerator
import com.finance.auth.InMemoryPasswordResetTokenRepository
import com.finance.auth.InMemoryUserRepository
import com.finance.auth.NoOpEmailSender
import com.finance.auth.PlainPasswordEncoder
import com.finance.auth.domain.User
import com.finance.auth.VALID_PASSWORD
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class RequestPasswordResetTest {

    private val userRepository = InMemoryUserRepository()
    private val tokenRepository = InMemoryPasswordResetTokenRepository()
    private val otpGenerator = FixedOtpGenerator("123456")
    private val encoder = PlainPasswordEncoder()
    private val emailSender = NoOpEmailSender()
    private val useCase = RequestPasswordReset(userRepository, tokenRepository, otpGenerator, encoder, emailSender)

    @Test
    fun createsHashedTokenAndSendsEmail() {
        val id = UUID.randomUUID()
        userRepository.save(User(id, "user@example.com", VALID_PASSWORD, true))
        useCase.execute(RequestPasswordReset.Command("user@example.com"))
        val token = tokenRepository.store.values.first()
        assertEquals("123456", token.otpHash)
        assertEquals(1, emailSender.sent.size)
    }

    @Test
    fun otpHashDiffersFromRawWhenEncoderHashesValues() {
        val id = UUID.randomUUID()
        userRepository.save(User(id, "user@example.com", VALID_PASSWORD, true))
        val hashingEncoder = object : PasswordEncoder {
            override fun encode(raw: String) = "HASHED:$raw"
            override fun matches(raw: String, encoded: String) = encoded == "HASHED:$raw"
        }
        val useCaseWithHashing = RequestPasswordReset(userRepository, tokenRepository, otpGenerator, hashingEncoder, emailSender)
        useCaseWithHashing.execute(RequestPasswordReset.Command("user@example.com"))
        val token = tokenRepository.store.values.first()
        assertFalse(token.otpHash == "123456")
        assertEquals("HASHED:123456", token.otpHash)
    }

    @Test
    fun throwsNotFoundForUnknownEmail() {
        assertThrows(NotFoundException::class.java) {
            useCase.execute(RequestPasswordReset.Command("ghost@example.com"))
        }
    }

    @Test
    fun invalidatesPreviousTokensOnNewRequest() {
        val id = UUID.randomUUID()
        userRepository.save(User(id, "user@example.com", VALID_PASSWORD, true))
        useCase.execute(RequestPasswordReset.Command("user@example.com"))
        useCase.execute(RequestPasswordReset.Command("user@example.com"))
        val activeTokens = tokenRepository.store.values.filter { !it.used }
        assertEquals(1, activeTokens.size)
    }
}