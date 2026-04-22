package com.finance.institution.application

import com.finance.institution.InMemoryInstitutionRepository
import com.finance.institution.testInstitution
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class GetInstitutionTest {

    private val repository = InMemoryInstitutionRepository()
    private val useCase = GetInstitution(repository)

    @Test
    fun returnsExistingInstitution() {
        val id = UUID.randomUUID()
        repository.save(testInstitution(id = id))
        assertEquals(id, useCase.execute(id).id)
    }

    @Test
    fun throwsNotFoundForUnknownInstitution() {
        assertThrows(NotFoundException::class.java) { useCase.execute(UUID.randomUUID()) }
    }
}