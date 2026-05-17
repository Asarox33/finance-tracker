package com.finance.transaction.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
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

    @Test
    fun acceptsTransactionWithFxRate() {
        val tx = transaction(
            appliedFxRate = 91500L,
            appliedFxRateScale = 5,
            appliedFxRateDate = LocalDate.of(2024, 1, 15),
            appliedFxSourceCurrency = Currency.USD,
            appliedFxTargetCurrency = Currency.EUR
        )
        assertTrue(tx.hasFxRate())
    }

    @Test
    fun acceptsTransactionWithoutFxRate() {
        val tx = transaction()
        assertFalse(tx.hasFxRate())
    }

    @Test
    fun rejectsPartialFxRateFields() {
        assertThrows(BusinessRuleViolationException::class.java) {
            transaction(appliedFxRate = 91500L)
        }
    }

    @Test
    fun marksTransactionAsDeleted() {
        val tx = transaction().delete()
        assertEquals(TransactionStatus.DELETED, tx.status)
    }

    private fun transaction(
        label: String = "Monthly salary",
        amount: Long = 10000L,
        appliedFxRate: Long? = null,
        appliedFxRateScale: Int? = null,
        appliedFxRateDate: LocalDate? = null,
        appliedFxSourceCurrency: Currency? = null,
        appliedFxTargetCurrency: Currency? = null
    ) = Transaction(
        id = UUID.randomUUID(),
        accountId = UUID.randomUUID(),
        assetId = null,
        type = TransactionType.DEPOSIT,
        amount = amount,
        currency = Currency.EUR,
        date = LocalDate.of(2024, 1, 15),
        label = label,
        notes = null,
        appliedFxRate = appliedFxRate,
        appliedFxRateScale = appliedFxRateScale,
        appliedFxRateDate = appliedFxRateDate,
        appliedFxSourceCurrency = appliedFxSourceCurrency,
        appliedFxTargetCurrency = appliedFxTargetCurrency
    )
}