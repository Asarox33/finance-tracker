package com.finance.fees.application

import com.finance.fees.InMemoryFeeRepository
import com.finance.fees.testFee
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class ListFeesTest {

    private val repository = InMemoryFeeRepository()
    private val useCase = ListFees(repository)

    @Test
    fun returnsEmptyPageWhenNoFees() {
        val result = useCase.execute(ListFees.Query(UUID.randomUUID()))
        assertTrue(result.isEmpty)
    }

    @Test
    fun returnsOnlyFeesForAccount() {
        val accountId = UUID.randomUUID()
        repeat(3) { repository.save(testFee(accountId = accountId)) }
        repository.save(testFee(accountId = UUID.randomUUID()))
        val result = useCase.execute(ListFees.Query(accountId))
        assertEquals(3L, result.totalItems)
    }

    @Test
    fun returnsPagedResults() {
        val accountId = UUID.randomUUID()
        repeat(5) { repository.save(testFee(accountId = accountId)) }
        val result = useCase.execute(ListFees.Query(accountId, page = 0, pageSize = 3))
        assertEquals(3, result.items.size)
        assertEquals(5L, result.totalItems)
    }
}