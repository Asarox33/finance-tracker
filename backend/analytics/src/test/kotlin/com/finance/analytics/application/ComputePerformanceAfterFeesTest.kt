package com.finance.analytics.application

import com.finance.analytics.StubAccountPort
import com.finance.analytics.StubAssetMarkPricePort
import com.finance.analytics.StubFeePort
import com.finance.analytics.StubFxRatePort
import com.finance.analytics.StubTransactionPort
import com.finance.analytics.account
import com.finance.analytics.fee
import com.finance.analytics.transaction
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class ComputePerformanceAfterFeesTest {

    private val from = LocalDate.of(2024, 1, 1)
    private val to = LocalDate.of(2024, 6, 30)
    private val userId = UUID.randomUUID()

    @Test
    fun deductsFeeFromGainLoss() {
        val account = account(currency = Currency.EUR)
        val useCase = ComputePerformanceAfterFees(
            StubAccountPort(listOf(account)),
            StubTransactionPort(listOf(
                transaction(account.id, 100000L, date = LocalDate.of(2023, 12, 1)),
                transaction(account.id, 20000L, date = LocalDate.of(2024, 3, 1))
            )),
            StubFeePort(listOf(fee(account.id, 500L))),
            StubFxRatePort(),
            StubAssetMarkPricePort()
        )
        val result = useCase.execute(ComputePerformanceAfterFees.Query(userId, from, to, Currency.EUR))
        assertEquals(19500L, result.gainLoss)
    }

    @Test
    fun returnsZeroFeesWhenNoFees() {
        val account = account(currency = Currency.EUR)
        val useCase = ComputePerformanceAfterFees(
            StubAccountPort(listOf(account)),
            StubTransactionPort(listOf(
                transaction(account.id, 100000L, date = LocalDate.of(2023, 12, 1)),
                transaction(account.id, 20000L, date = LocalDate.of(2024, 3, 1))
            )),
            StubFeePort(),
            StubFxRatePort(),
            StubAssetMarkPricePort()
        )
        val result = useCase.execute(ComputePerformanceAfterFees.Query(userId, from, to, Currency.EUR))
        assertEquals(20000L, result.gainLoss)
    }

    @Test
    fun rejectsFromAfterTo() {
        val useCase = ComputePerformanceAfterFees(
            StubAccountPort(),
            StubTransactionPort(),
            StubFeePort(),
            StubFxRatePort(),
            StubAssetMarkPricePort()
        )
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ComputePerformanceAfterFees.Query(userId, to, from, Currency.EUR))
        }
    }
}