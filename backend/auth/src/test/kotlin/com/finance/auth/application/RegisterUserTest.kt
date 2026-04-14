package com.finance.auth.application

import com.finance.auth.InMemoryUserRepository
import com.finance.auth.PlainPasswordEncoder
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class RegisterUserTest {

    private val repository = InMemoryUserRepository()
    private val encoder = PlainPasswordEncoder()
    private val useCase = RegisterUser(repository, encoder)

    @Test
    fun registersNewUserSuccessfully() {
        val result = useCase.execute(RegisterUser.Command("user@example.com", "password123"))
        assertNotNull(result.userId)
    }

    @Test
    fun rejectsDuplicateEmail() {
        useCase.execute(RegisterUser.Command("user@example.com", "password123"))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(RegisterUser.Command("user@example.com", "other"))
        }
    }

    @Test
    fun rejectsBlankEmail() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(RegisterUser.Command(" ", "password123"))
        }
    }

    @Test
    fun rejectsBlankPassword() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(RegisterUser.Command("user@example.com", " "))
        }
    }
}