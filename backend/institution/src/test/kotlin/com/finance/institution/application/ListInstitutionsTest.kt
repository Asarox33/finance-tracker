package com.finance.institution.application

import com.finance.institution.InMemoryInstitutionRepository
import com.finance.institution.testInstitution
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class ListInstitutionsTest {

    private val repository = InMemoryInstitutionRepository()
    private val useCase = ListInstitutions(repository)

    @Test
    fun returnsEmptyPageWhenNoInstitutions() {
        val result = useCase.execute(ListInstitutions.Query())
        assertEquals(0L, result.totalItems)
        assertTrue(result.isEmpty)
    }

    @Test
    fun returnsPagedInstitutions() {
        repeat(5) { repository.save(testInstitution(id = UUID.randomUUID(), name = "Institution $it")) }
        val result = useCase.execute(ListInstitutions.Query(page = 0, pageSize = 3))
        assertEquals(5L, result.totalItems)
        assertEquals(3, result.items.size)
    }

    @Test
    fun returnsSecondPage() {
        repeat(5) { repository.save(testInstitution(id = UUID.randomUUID(), name = "Institution $it")) }
        val result = useCase.execute(ListInstitutions.Query(page = 1, pageSize = 3))
        assertEquals(2, result.items.size)
    }

    @Test
    fun returnsCorrectTotalPages() {
        repeat(5) { repository.save(testInstitution(id = UUID.randomUUID(), name = "Institution $it")) }
        val result = useCase.execute(ListInstitutions.Query(page = 0, pageSize = 3))
        assertEquals(2, result.totalPages)
    }
}