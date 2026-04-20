package com.finance.userprofile.application

import com.finance.shared.error.NotFoundException
import com.finance.userprofile.InMemoryUserProfileRepository
import com.finance.userprofile.testProfile
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class GetUserProfileTest {

    private val repository = InMemoryUserProfileRepository()
    private val useCase = GetUserProfile(repository)

    @Test
    fun returnsExistingProfile() {
        val id = UUID.randomUUID()
        repository.save(testProfile(id = id))
        assertEquals(id, useCase.execute(id).id)
    }

    @Test
    fun throwsNotFoundForUnknownProfile() {
        assertThrows(NotFoundException::class.java) { useCase.execute(UUID.randomUUID()) }
    }
}