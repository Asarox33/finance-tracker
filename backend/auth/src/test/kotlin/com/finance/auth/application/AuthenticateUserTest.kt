package com.finance.auth.application

import com.finance.auth.FixedTokenIssuer
import com.finance.auth.InMemoryUserRepository
import com.finance.auth.PlainPasswordEncoder
import com.finance.auth.VALID_PASSWORD
import com.finance.auth.domain.User
import com.finance.shared.error.AuthenticationFailedException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class AuthenticateUserTest {

    private val repository = InMemoryUserRepository()
    private val encoder = PlainPasswordEncoder()
    private val tokenIssuer = FixedTokenIssuer()
    private val useCase = AuthenticateUser(repository, encoder, tokenIssuer)

    @Test
    fun authenticatesValidCredentials() {
        repository.save(User(UUID.randomUUID(), "user@example.com", VALID_PASSWORD, true))
        assertNotNull(useCase.execute(AuthenticateUser.Command("user@example.com", VALID_PASSWORD)))
    }

    @Test
    fun rejectsUnknownEmail() {
        assertThrows(AuthenticationFailedException::class.java) {
            useCase.execute(AuthenticateUser.Command("ghost@example.com", VALID_PASSWORD))
        }
    }

    @Test
    fun rejectsWrongPassword() {
        repository.save(User(UUID.randomUUID(), "user@example.com", VALID_PASSWORD, true))
        assertThrows(AuthenticationFailedException::class.java) {
            useCase.execute(AuthenticateUser.Command("user@example.com", "wrong"))
        }
    }

    @Test
    fun incrementsFailedAttemptsOnWrongPassword() {
        val id = UUID.randomUUID()
        repository.save(User(id, "user@example.com", VALID_PASSWORD, true))
        runCatching { useCase.execute(AuthenticateUser.Command("user@example.com", "wrong")) }
        assertEquals(1, repository.findById(id)!!.failedLoginAttempts)
    }

    @Test
    fun locksAccountAfterThreeFailedAttempts() {
        val id = UUID.randomUUID()
        repository.save(User(id, "user@example.com", VALID_PASSWORD, true))
        repeat(3) { runCatching { useCase.execute(AuthenticateUser.Command("user@example.com", "wrong")) } }
        assert(!repository.findById(id)!!.active)
    }

    @Test
    fun throwsAccountLockedWhenCooldownNotPassed() {
        val now = Instant.now()
        repository.save(User(UUID.randomUUID(), "user@example.com", VALID_PASSWORD, false, 3, now))
        assertThrows(AccountLockedException::class.java) {
            useCase.execute(AuthenticateUser.Command("user@example.com", VALID_PASSWORD))
        }
    }
}