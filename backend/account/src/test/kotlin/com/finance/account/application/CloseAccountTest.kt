package com.finance.account.application

import com.finance.account.InMemoryAccountRepository
import com.finance.account.domain.AccountStatus
import com.finance.account.testAccount
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class CloseAccountTest {

    private val repository = InMemoryAccountRepository()
    private val useCase = CloseAccount(repository)

    @Test
    fun closesAccountSuccessfully() {
        val userId = UUID.randomUUID()
        val id = UUID.randomUUID()
        repository.save(testAccount(id = id, userId = userId))
        useCase.execute(CloseAccount.Command(id, userId))
        assertEquals(AccountStatus.CLOSED, repository.findById(id)!!.status)
    }

    @Test
    fun throwsNotFoundForUnknownAccount() {
        assertThrows(NotFoundException::class.java) {
            useCase.execute(CloseAccount.Command(UUID.randomUUID(), UUID.randomUUID()))
        }
    }

    @Test
    fun rejectsClosingAccountOfAnotherUser() {
        val id = UUID.randomUUID()
        repository.save(testAccount(id = id, userId = UUID.randomUUID()))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(CloseAccount.Command(id, UUID.randomUUID()))
        }
    }
}