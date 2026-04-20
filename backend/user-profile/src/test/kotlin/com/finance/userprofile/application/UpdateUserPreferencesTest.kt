package com.finance.userprofile.application

import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import com.finance.userprofile.InMemoryUserProfileRepository
import com.finance.userprofile.testProfile
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class UpdateUserPreferencesTest {

    private val repository = InMemoryUserProfileRepository()
    private val useCase = UpdateUserPreferences(repository)

    @Test
    fun updatesPreferencesSuccessfully() {
        val id = UUID.randomUUID()
        repository.save(testProfile(id = id))
        val result = useCase.execute(command(userId = id, firstName = "Jane", lastName = "Smith", displayName = "janesmith", preferredCurrency = "USD"))
        assertEquals("Jane", result.firstName)
        assertEquals("Smith", result.lastName)
        assertEquals("janesmith", result.displayName)
        assertEquals("USD", result.preferredCurrency)
    }

    @Test
    fun throwsNotFoundForUnknownProfile() {
        assertThrows(NotFoundException::class.java) {
            useCase.execute(command(userId = UUID.randomUUID()))
        }
    }

    @Test
    fun rejectsBlankFirstName() {
        val id = UUID.randomUUID()
        repository.save(testProfile(id = id))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(userId = id, firstName = " "))
        }
    }

    @Test
    fun rejectsBlankLastName() {
        val id = UUID.randomUUID()
        repository.save(testProfile(id = id))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(userId = id, lastName = " "))
        }
    }

    @Test
    fun rejectsBlankDisplayName() {
        val id = UUID.randomUUID()
        repository.save(testProfile(id = id))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(userId = id, displayName = " "))
        }
    }

    @Test
    fun rejectsInvalidCurrencyCode() {
        val id = UUID.randomUUID()
        repository.save(testProfile(id = id))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(userId = id, preferredCurrency = "EU"))
        }
    }

    private fun command(
        userId: UUID = UUID.randomUUID(),
        firstName: String = "John",
        lastName: String = "Doe",
        displayName: String = "johndoe",
        preferredCurrency: String = "EUR"
    ) = UpdateUserPreferences.Command(
        userId = userId,
        firstName = firstName,
        lastName = lastName,
        displayName = displayName,
        preferredCurrency = preferredCurrency,
        birthDate = null
    )
}