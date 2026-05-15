package com.finance.institution.application

import com.finance.institution.InMemoryInstitutionRepository
import com.finance.institution.testInstitution
import com.finance.shared.Country
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

    @Test
    fun filtersByNameCaseInsensitive() {
        repository.save(testInstitution(id = UUID.randomUUID(), name = "BNP Paribas"))
        repository.save(testInstitution(id = UUID.randomUUID(), name = "Deutsche Bank", country = Country.DE))
        val result = useCase.execute(ListInstitutions.Query(name = "bnp"))
        assertEquals(1, result.items.size)
        assertEquals("BNP Paribas", result.items[0].name)
    }

    @Test
    fun filtersByCountry() {
        repository.save(testInstitution(id = UUID.randomUUID(), name = "BNP Paribas", country = Country.FR))
        repository.save(testInstitution(id = UUID.randomUUID(), name = "Deutsche Bank", country = Country.DE))
        val result = useCase.execute(ListInstitutions.Query(country = Country.DE))
        assertEquals(1, result.items.size)
        assertEquals("Deutsche Bank", result.items[0].name)
    }

    @Test
    fun filtersByNameAndCountry() {
        repository.save(testInstitution(id = UUID.randomUUID(), name = "BNP Paribas", country = Country.FR))
        repository.save(testInstitution(id = UUID.randomUUID(), name = "BNP USA", country = Country.US))
        val result = useCase.execute(ListInstitutions.Query(name = "BNP", country = Country.FR))
        assertEquals(1, result.items.size)
        assertEquals("BNP Paribas", result.items[0].name)
    }

    @Test
    fun returnsEmptyWhenNoMatch() {
        repository.save(testInstitution(id = UUID.randomUUID(), name = "BNP Paribas"))
        val result = useCase.execute(ListInstitutions.Query(name = "Credit"))
        assertTrue(result.isEmpty)
        assertEquals(0L, result.totalItems)
    }

    @Test
    fun paginatesFilteredResults() {
        repeat(3) {
            repository.save(testInstitution(id = UUID.randomUUID(), name = "Bank $it", country = Country.FR))
        }
        repository.save(testInstitution(id = UUID.randomUUID(), name = "Deutsche Bank", country = Country.DE))
        val result = useCase.execute(ListInstitutions.Query(page = 0, pageSize = 2, country = Country.FR))
        assertEquals(2, result.items.size)
        assertEquals(3L, result.totalItems)
        assertEquals(2, result.totalPages)
    }

    @Test
    fun treatsBlankNameAsNoFilter() {
        repository.save(testInstitution(id = UUID.randomUUID(), name = "BNP Paribas"))
        repository.save(testInstitution(id = UUID.randomUUID(), name = "Deutsche Bank", country = Country.DE))
        val result = useCase.execute(ListInstitutions.Query(name = "   "))
        assertEquals(2, result.items.size)
    }
}