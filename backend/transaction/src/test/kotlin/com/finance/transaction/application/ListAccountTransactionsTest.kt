package com.finance.transaction.application

import com.finance.shared.error.NotFoundException
import com.finance.transaction.InMemoryTransactionRepository
import com.finance.transaction.StubAccountAccessPort
import com.finance.transaction.accountAccessSummary
import com.finance.transaction.domain.TransactionStatus
import com.finance.transaction.testTransaction
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class ListAccountTransactionsTest {

    private val repository = InMemoryTransactionRepository()
    private val userId = UUID.randomUUID()
    private val accountId = UUID.randomUUID()
    private val useCase = ListAccountTransactions(
        repository,
        StubAccountAccessPort(listOf(accountAccessSummary(accountId, userId)))
    )

    @Test
    fun returnsEmptyPageWhenNoTransactions() {
        val result = useCase.execute(ListAccountTransactions.Query(userId, accountId))
        assertTrue(result.isEmpty)
    }

    @Test
    fun returnsOnlyTransactionsForAccount() {
        repeat(3) { repository.save(testTransaction(accountId = accountId)) }
        repository.save(testTransaction(accountId = UUID.randomUUID()))
        val result = useCase.execute(ListAccountTransactions.Query(userId, accountId))
        assertEquals(3L, result.totalItems)
    }

    @Test
    fun filtersTransactionsByDateRange() {
        repository.save(testTransaction(accountId = accountId, date = LocalDate.of(2024, 1, 10)))
        repository.save(testTransaction(accountId = accountId, date = LocalDate.of(2024, 2, 15)))
        repository.save(testTransaction(accountId = accountId, date = LocalDate.of(2024, 3, 20)))
        val result = useCase.execute(
            ListAccountTransactions.Query(
                requestingUserId = userId,
                accountId = accountId,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 2, 28)
            )
        )
        assertEquals(2L, result.totalItems)
    }

    @Test
    fun returnsPagedResults() {
        repeat(5) { repository.save(testTransaction(accountId = accountId)) }
        val result = useCase.execute(
            ListAccountTransactions.Query(userId, accountId, page = 0, pageSize = 3)
        )
        assertEquals(3, result.items.size)
        assertEquals(5L, result.totalItems)
    }

    @Test
    fun excludesDeletedTransactions() {
        repository.save(testTransaction(accountId = accountId, status = TransactionStatus.ACTIVE))
        repository.save(testTransaction(accountId = accountId, status = TransactionStatus.DELETED))
        val result = useCase.execute(ListAccountTransactions.Query(userId, accountId))
        assertEquals(1L, result.totalItems)
        assertEquals(TransactionStatus.ACTIVE, result.items.single().status)
    }

    @Test
    fun rejectsAccountOwnedByAnotherUser() {
        val otherAccountId = UUID.randomUUID()
        assertThrows(NotFoundException::class.java) {
            useCase.execute(ListAccountTransactions.Query(userId, otherAccountId))
        }
    }
}