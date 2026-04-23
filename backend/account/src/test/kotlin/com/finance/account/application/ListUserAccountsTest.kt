package com.finance.account.application

import com.finance.account.InMemoryAccountRepository
import com.finance.account.testAccount
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class ListUserAccountsTest {

    private val repository = InMemoryAccountRepository()
    private val useCase = ListUserAccounts(repository)

    @Test
    fun returnsEmptyPageForUserWithNoAccounts() {
        val result = useCase.execute(ListUserAccounts.Query(userId = UUID.randomUUID()))
        assertTrue(result.isEmpty)
    }

    @Test
    fun returnsOnlyAccountsBelongingToUser() {
        val userId = UUID.randomUUID()
        repeat(3) { repository.save(testAccount(userId = userId)) }
        repository.save(testAccount(userId = UUID.randomUUID()))
        val result = useCase.execute(ListUserAccounts.Query(userId = userId))
        assertEquals(3L, result.totalItems)
    }

    @Test
    fun returnsPagedResults() {
        val userId = UUID.randomUUID()
        repeat(5) { repository.save(testAccount(userId = userId)) }
        val result = useCase.execute(ListUserAccounts.Query(userId = userId, page = 0, pageSize = 3))
        assertEquals(3, result.items.size)
        assertEquals(5L, result.totalItems)
    }
}