package com.finance.account.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.UUID

class AccountTest {

    @Test
    fun constructsValidAccount() {
        val account = account()
        assertEquals("My Account", account.name)
        assertEquals(AccountStatus.ACTIVE, account.status)
    }

    @Test
    fun rejectsBlankName() {
        assertThrows(BusinessRuleViolationException::class.java) { account(name = " ") }
    }

    @Test
    fun closesActiveAccount() {
        val closed = account().close()
        assertEquals(AccountStatus.CLOSED, closed.status)
    }

    @Test
    fun rejectsClosingAlreadyClosedAccount() {
        assertThrows(BusinessRuleViolationException::class.java) {
            account(status = AccountStatus.CLOSED).close()
        }
    }

    private fun account(
        name: String = "My Account",
        status: AccountStatus = AccountStatus.ACTIVE
    ) = Account(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), name, AccountType.CHECKING, Currency.EUR, status)
}