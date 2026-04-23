package com.finance.account.application

import com.finance.account.InMemoryAccountRepository
import com.finance.account.testAccount
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class GetAccountTest {

    private val repository = InMemoryAccountRepository()
    private val useCase = GetAccount(repository)

    @Test
    fun returnsExistingAccount() {
        val id = UUID.randomUUID()
        repository.save(testAccount(id = id))
        assertEquals(id, useCase.execute(id).id)
    }

    @Test
    fun throwsNotFoundForUnknownAccount() {
        assertThrows(NotFoundException::class.java) { useCase.execute(UUID.randomUUID()) }
    }
}