package com.finance.auth.application

import com.finance.auth.InMemoryUserRepository
import com.finance.auth.NoOpCreateUserProfilePort
import com.finance.auth.PlainPasswordEncoder
import com.finance.auth.VALID_PASSWORD
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class RegisterUserTest {

    private val repository = InMemoryUserRepository()
    private val encoder = PlainPasswordEncoder()
    private val createUserProfilePort = NoOpCreateUserProfilePort()
    private val useCase = RegisterUser(repository, encoder, createUserProfilePort)

    @Test
    fun registersNewUserSuccessfully() {
        val result = useCase.execute(RegisterUser.Command("user@example.com", VALID_PASSWORD))
        assertNotNull(result.userId)
    }

    @Test
    fun createsUserProfileAfterRegistration() {
        useCase.execute(RegisterUser.Command("user@example.com", VALID_PASSWORD))
        assertEquals(1, createUserProfilePort.created.size)
    }

    @Test
    fun rejectsDuplicateEmail() {
        useCase.execute(RegisterUser.Command("user@example.com", VALID_PASSWORD))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(RegisterUser.Command("user@example.com", VALID_PASSWORD))
        }
    }

    @Test
    fun rejectsBlankEmail() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(RegisterUser.Command(" ", VALID_PASSWORD))
        }
    }

    @Test
    fun rejectsBlankPassword() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(RegisterUser.Command("user@example.com", " "))
        }
    }

    @Test
    fun rejectsPasswordTooShort() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(RegisterUser.Command("user@example.com", "Short1!"))
        }
    }

    @Test
    fun rejectsPasswordWithoutUppercase() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(RegisterUser.Command("user@example.com", "password1!securepass"))
        }
    }

    @Test
    fun rejectsPasswordWithoutDigit() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(RegisterUser.Command("user@example.com", "Password!securepass"))
        }
    }

    @Test
    fun rejectsPasswordWithoutSpecialChar() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(RegisterUser.Command("user@example.com", "Password1securepass"))
        }
    }
}