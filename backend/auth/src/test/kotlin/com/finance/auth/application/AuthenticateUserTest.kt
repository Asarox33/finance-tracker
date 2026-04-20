package com.finance.auth.application

import com.finance.auth.FixedTokenIssuer
import com.finance.auth.InMemoryUserRepository
import com.finance.auth.PlainPasswordEncoder
import com.finance.auth.domain.User
import com.finance.shared.error.AuthenticationFailedException
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
        repository.save(User(UUID.randomUUID(), "user@example.com", "secret", true))
        assertNotNull(useCase.execute(AuthenticateUser.Command("user@example.com", "secret")))
    }

    @Test
    fun rejectsUnknownEmail() {
        assertThrows(AuthenticationFailedException::class.java) {
            useCase.execute(AuthenticateUser.Command("ghost@example.com", "secret"))
        }
    }

    @Test
    fun rejectsWrongPassword() {
        repository.save(User(UUID.randomUUID(), "user@example.com", "secret", true))
        assertThrows(AuthenticationFailedException::class.java) {
            useCase.execute(AuthenticateUser.Command("user@example.com", "wrong"))
        }
    }

    @Test
    fun incrementsFailedAttemptsOnWrongPassword() {
        val id = UUID.randomUUID()
        repository.save(User(id, "user@example.com", "secret", true))
        runCatching { useCase.execute(AuthenticateUser.Command("user@example.com", "wrong")) }
        val updated = repository.findById(id)!!
        assert(updated.failedLoginAttempts == 1)
    }

    @Test
    fun locksAccountAfterThreeFailedAttempts() {
        val id = UUID.randomUUID()
        repository.save(User(id, "user@example.com", "secret", true))
        repeat(3) { runCatching { useCase.execute(AuthenticateUser.Command("user@example.com", "wrong")) } }
        val locked = repository.findById(id)!!
        assert(!locked.active)
    }

    @Test
    fun throwsAccountLockedWhenCooldownNotPassed() {
        val now = Instant.now()
        val locked = User(UUID.randomUUID(), "user@example.com", "secret", false, 3, now)
        repository.save(locked)
        assertThrows(AccountLockedException::class.java) {
            useCase.execute(AuthenticateUser.Command("user@example.com", "secret"))
        }
    }
}