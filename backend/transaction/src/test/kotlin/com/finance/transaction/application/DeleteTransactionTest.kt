package com.finance.transaction.application

import com.finance.shared.error.NotFoundException
import com.finance.transaction.InMemoryTransactionRepository
import com.finance.transaction.StubAccountAccessPort
import com.finance.transaction.accountAccessSummary
import com.finance.transaction.domain.TransactionStatus
import com.finance.transaction.testTransaction
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class DeleteTransactionTest {

    private val repository = InMemoryTransactionRepository()
    private val userId = UUID.randomUUID()
    private val accountId = UUID.randomUUID()
    private val useCase = DeleteTransaction(
        repository,
        StubAccountAccessPort(listOf(accountAccessSummary(accountId, userId)))
    )

    @Test
    fun softDeletesTransactionSuccessfully() {
        val id = UUID.randomUUID()
        repository.save(testTransaction(id = id, accountId = accountId))
        useCase.execute(DeleteTransaction.Command(id, userId))
        assertEquals(TransactionStatus.DELETED, repository.findById(id)!!.status)
    }

    @Test
    fun throwsNotFoundForUnknownTransaction() {
        assertThrows(NotFoundException::class.java) {
            useCase.execute(DeleteTransaction.Command(UUID.randomUUID(), userId))
        }
    }

    @Test
    fun throwsNotFoundForTransactionOwnedByAnotherUser() {
        val id = UUID.randomUUID()
        repository.save(testTransaction(id = id, accountId = UUID.randomUUID()))
        assertThrows(NotFoundException::class.java) {
            useCase.execute(DeleteTransaction.Command(id, userId))
        }
    }
}
