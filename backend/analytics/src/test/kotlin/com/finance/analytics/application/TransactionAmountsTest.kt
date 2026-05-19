package com.finance.analytics.application

import com.finance.analytics.domain.ports.TransactionSummary
import com.finance.shared.Currency
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class TransactionAmountsTest {

    @Test
    fun positiveTypesUseAbsoluteAmount() {
        listOf("DEPOSIT", "SELL", "DIVIDEND").forEach { type ->
            assertEquals(1_000, summary(type, -1_000).signedAmount())
            assertEquals(1_000, summary(type, 1_000).signedAmount())
        }
    }

    @Test
    fun negativeTypesUseNegatedAbsoluteAmount() {
        listOf("WITHDRAWAL", "BUY", "FEE", "TAX").forEach { type ->
            assertEquals(-1_000, summary(type, -1_000).signedAmount())
            assertEquals(-1_000, summary(type, 1_000).signedAmount())
        }
    }

    @Test
    fun transferAndOtherPreserveSubmittedSign() {
        assertEquals(500, summary("TRANSFER", 500).signedAmount())
        assertEquals(-500, summary("TRANSFER", -500).signedAmount())
        assertEquals(250, summary("OTHER", 250).signedAmount())
        assertEquals(-250, summary("OTHER", -250).signedAmount())
    }

    @Test
    fun unknownTypePreservesAmount() {
        assertEquals(99, summary("LEGACY", 99).signedAmount())
        assertEquals(-99, summary("LEGACY", -99).signedAmount())
    }

    private fun summary(type: String, amount: Long) = TransactionSummary(
        accountId = UUID.randomUUID(),
        amount = amount,
        currency = Currency.EUR,
        date = LocalDate.of(2024, 6, 1),
        type = type
    )
}
