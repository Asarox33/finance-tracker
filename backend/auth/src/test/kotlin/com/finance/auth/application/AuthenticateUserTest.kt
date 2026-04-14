package com.finance.auth.application

import com.finance.auth.FixedTokenIssuer
import com.finance.auth.InMemoryUserRepository
import com.finance.auth.PlainPasswordEncoder
import com.finance.auth.domain.User
import com.finance.shared.error.AuthenticationFailedException
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class AuthenticateUserTest {

    private val repository = InMemoryUserRepository()
    private val encoder = PlainPasswordEncoder()
    private val tokenIssuer = FixedTokenIssuer()
    private val useCase = AuthenticateUser(repository, encoder, tokenIssuer)

    @Test
    fun authenticatesValidCredentials() {
        repository.save(User(UUID.randomUUID(), "user@example.com", "secret", true))
        val token = useCase.execute(AuthenticateUser.Command("user@example.com", "secret"))
        assertNotNull(token)
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
    fun rejectsInactiveUser() {
        repository.save(User(UUID.randomUUID(), "user@example.com", "secret", false))
        assertThrows(AuthenticationFailedException::class.java) {
            useCase.execute(AuthenticateUser.Command("user@example.com", "secret"))
        }
    }
}