package com.finance.userprofile.application

import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import com.finance.userprofile.InMemoryUserProfileRepository
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class CreateUserProfileTest {

    private val repository = InMemoryUserProfileRepository()
    private val useCase = CreateUserProfile(repository)

    @Test
    fun createsProfileSuccessfully() {
        val result = useCase.execute(command())
        assertNotNull(result.userId)
    }

    @Test
    fun rejectsDuplicateId() {
        val id = UUID.randomUUID()
        useCase.execute(command(id = id))
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(id = id)) }
    }

    private fun command(id: UUID = UUID.randomUUID()) = CreateUserProfile.Command(
        id = id,
        firstName = "John",
        lastName = "Doe",
        displayName = "johndoe",
        preferredCurrency = Currency.EUR,
        birthDate = null
    )
}