package com.finance.account.application

import com.finance.account.InMemoryAccountRepository
import com.finance.account.domain.AccountStatus
import com.finance.account.testAccount
import com.finance.shared.error.BusinessRuleViolationException
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class ReactivateAccountTest {

    private val repository = InMemoryAccountRepository()
    private val useCase = ReactivateAccount(repository)

    @Test
    fun reactivatesClosedAccountSuccessfully() {
        val userId = UUID.randomUUID()
        val id = UUID.randomUUID()
        repository.save(testAccount(id = id, userId = userId, status = AccountStatus.CLOSED))
        useCase.execute(ReactivateAccount.Command(id, userId))
        assertEquals(AccountStatus.ACTIVE, repository.findById(id)!!.status)
    }

    @Test
    fun throwsNotFoundForUnknownAccount() {
        assertThrows(NotFoundException::class.java) {
            useCase.execute(ReactivateAccount.Command(UUID.randomUUID(), UUID.randomUUID()))
        }
    }

    @Test
    fun rejectsReactivatingAccountOfAnotherUser() {
        val id = UUID.randomUUID()
        repository.save(testAccount(id = id, userId = UUID.randomUUID(), status = AccountStatus.CLOSED))
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ReactivateAccount.Command(id, UUID.randomUUID()))
        }
    }

    @Test
    fun rejectsAlreadyActiveAccount() {
        val userId = UUID.randomUUID()
        val id = UUID.randomUUID()
        repository.save(testAccount(id = id, userId = userId, status = AccountStatus.ACTIVE))
        assertThrows(BusinessRuleViolationException::class.java) {
            useCase.execute(ReactivateAccount.Command(id, userId))
        }
    }
}
