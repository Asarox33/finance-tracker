package com.finance.account.application

import com.finance.account.InMemoryAccountRepository
import com.finance.account.domain.AccountType
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class CreateAccountTest {

    private val repository = InMemoryAccountRepository()
    private val useCase = CreateAccount(repository)

    @Test
    fun createsAccountSuccessfully() {
        val result = useCase.execute(command())
        assertNotNull(result.accountId)
    }

    @Test
    fun rejectsBlankName() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(name = " "))
        }
    }

    private fun command(name: String = "My Account") = CreateAccount.Command(
        userId = UUID.randomUUID(),
        institutionId = UUID.randomUUID(),
        name = name,
        type = AccountType.CHECKING,
        currency = Currency.EUR
    )
}