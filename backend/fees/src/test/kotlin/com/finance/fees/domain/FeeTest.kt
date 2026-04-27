package com.finance.fees.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class FeeTest {

    @Test
    fun constructsValidFeeWithAccountId() {
        val fee = fee(accountId = UUID.randomUUID(), transactionId = null)
        assertEquals("Brokerage fee", fee.label)
    }

    @Test
    fun constructsValidFeeWithTransactionId() {
        val fee = fee(accountId = null, transactionId = UUID.randomUUID())
        assertEquals(199L, fee.amount)
    }

    @Test
    fun constructsValidFeeWithBothIds() {
        val fee = fee(accountId = UUID.randomUUID(), transactionId = UUID.randomUUID())
        assertEquals("Brokerage fee", fee.label)
    }

    @Test
    fun rejectsWhenBothIdsAreNull() {
        assertThrows(BusinessRuleViolationException::class.java) {
            fee(accountId = null, transactionId = null)
        }
    }

    @Test
    fun rejectsBlankLabel() {
        assertThrows(BusinessRuleViolationException::class.java) {
            fee(accountId = UUID.randomUUID(), label = " ")
        }
    }

    @Test
    fun rejectsZeroAmount() {
        assertThrows(BusinessRuleViolationException::class.java) {
            fee(accountId = UUID.randomUUID(), amount = 0L)
        }
    }

    @Test
    fun rejectsNegativeAmount() {
        assertThrows(BusinessRuleViolationException::class.java) {
            fee(accountId = UUID.randomUUID(), amount = -1L)
        }
    }

    private fun fee(
        accountId: UUID? = UUID.randomUUID(),
        transactionId: UUID? = null,
        label: String = "Brokerage fee",
        amount: Long = 199L
    ) = Fee(
        UUID.randomUUID(), accountId, transactionId,
        FeeType.BROKERAGE, amount, Currency.EUR,
        LocalDate.of(2024, 1, 15), label
    )
}