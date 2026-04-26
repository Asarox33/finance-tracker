package com.finance.transaction.application

import com.finance.shared.error.NotFoundException
import com.finance.transaction.InMemoryTransactionRepository
import com.finance.transaction.testTransaction
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class GetTransactionTest {

    private val repository = InMemoryTransactionRepository()
    private val useCase = GetTransaction(repository)

    @Test
    fun returnsExistingTransaction() {
        val id = UUID.randomUUID()
        repository.save(testTransaction(id = id))
        assertEquals(id, useCase.execute(id).id)
    }

    @Test
    fun throwsNotFoundForUnknownTransaction() {
        assertThrows(NotFoundException::class.java) { useCase.execute(UUID.randomUUID()) }
    }
}