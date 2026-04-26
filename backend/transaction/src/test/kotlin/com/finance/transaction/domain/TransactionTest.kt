package com.finance.transaction.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class TransactionTest {

    @Test
    fun constructsValidTransaction() {
        val tx = transaction()
        assertEquals("Monthly salary", tx.label)
        assertEquals(10000L, tx.amount)
    }

    @Test
    fun rejectsBlankLabel() {
        assertThrows(BusinessRuleViolationException::class.java) { transaction(label = " ") }
    }

    @Test
    fun rejectsZeroAmount() {
        assertThrows(BusinessRuleViolationException::class.java) { transaction(amount = 0L) }
    }

    @Test
    fun acceptsNegativeAmount() {
        val tx = transaction(amount = -5000L)
        assertEquals(-5000L, tx.amount)
    }

    private fun transaction(
        label: String = "Monthly salary",
        amount: Long = 10000L
    ) = Transaction(
        UUID.randomUUID(), UUID.randomUUID(), null,
        TransactionType.DEPOSIT, amount, Currency.EUR,
        LocalDate.of(2024, 1, 15), label, null
    )
}