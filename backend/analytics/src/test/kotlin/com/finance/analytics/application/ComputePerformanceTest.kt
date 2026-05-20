package com.finance.analytics.application

import com.finance.analytics.StubAccountPort
import com.finance.analytics.StubAssetMarkPricePort
import com.finance.analytics.StubFxRatePort
import com.finance.analytics.StubTransactionPort
import com.finance.analytics.account
import com.finance.analytics.transaction
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class ComputePerformanceTest {

    private val from = LocalDate.of(2024, 1, 1)
    private val to = LocalDate.of(2024, 6, 30)
    private val userId = UUID.randomUUID()

    @Test
    fun computesGainCorrectly() {
        val account = account(currency = Currency.EUR)
        val useCase = ComputePerformance(
            StubAccountPort(listOf(account)),
            StubTransactionPort(listOf(
                transaction(account.id, 100000L, date = LocalDate.of(2023, 12, 1)),
                transaction(account.id, 20000L, date = LocalDate.of(2024, 3, 1))
            )),
            StubFxRatePort(),
            StubAssetMarkPricePort()
        )
        val result = useCase.execute(ComputePerformance.Query(userId, from, to, Currency.EUR))
        assertEquals(100000L, result.startValue)
        assertEquals(120000L, result.endValue)
        assertEquals(20000L, result.gainLoss)
        assertEquals(2000L, result.gainLossBasisPoints)
    }

    @Test
    fun appliesTransactionTypeDirectionToPerformance() {
        val account = account(currency = Currency.EUR)
        val useCase = ComputePerformance(
            StubAccountPort(listOf(account)),
            StubTransactionPort(listOf(
                transaction(account.id, 100000L, date = LocalDate.of(2023, 12, 1), type = "DEPOSIT"),
                transaction(account.id, 20000L, date = LocalDate.of(2024, 3, 1), type = "WITHDRAWAL")
            )),
            StubFxRatePort(),
            StubAssetMarkPricePort()
        )
        val result = useCase.execute(ComputePerformance.Query(userId, from, to, Currency.EUR))
        assertEquals(80000L, result.endValue)
        assertEquals(-20000L, result.gainLoss)
    }

    @Test
    fun returnsZeroGainLossWhenNoMovement() {
        val account = account(currency = Currency.EUR)
        val useCase = ComputePerformance(
            StubAccountPort(listOf(account)),
            StubTransactionPort(listOf(transaction(account.id, 100000L, date = LocalDate.of(2023, 12, 1)))),
            StubFxRatePort(),
            StubAssetMarkPricePort()
        )
        val result = useCase.execute(ComputePerformance.Query(userId, from, to, Currency.EUR))
        assertEquals(0L, result.gainLoss)
    }

    @Test
    fun rejectsFromAfterTo() {
        val useCase = ComputePerformance(
            StubAccountPort(),
            StubTransactionPort(),
            StubFxRatePort(),
            StubAssetMarkPricePort()
        )
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ComputePerformance.Query(userId, to, from, Currency.EUR))
        }
    }
}