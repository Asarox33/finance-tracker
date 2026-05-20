package com.finance.analytics.application

import com.finance.analytics.StubAccountPort
import com.finance.analytics.StubAssetMarkPricePort
import com.finance.analytics.StubFeePort
import com.finance.analytics.StubFxRatePort
import com.finance.analytics.StubInflationPort
import com.finance.analytics.StubTransactionPort
import com.finance.analytics.account
import com.finance.analytics.transaction
import com.finance.analytics.domain.ports.InflationFactorSummary
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class ComputePerformanceAfterInflationTest {

    private val from = LocalDate.of(2024, 1, 1)
    private val to = LocalDate.of(2024, 6, 30)
    private val userId = UUID.randomUUID()

    @Test
    fun adjustsEndValueForInflation() {
        val account = account(currency = Currency.EUR)
        val useCase = ComputePerformanceAfterInflation(
            StubAccountPort(listOf(account)),
            StubTransactionPort(listOf(
                transaction(account.id, 100000L, date = LocalDate.of(2023, 12, 1)),
                transaction(account.id, 20000L, date = LocalDate.of(2024, 3, 1))
            )),
            StubFeePort(),
            StubFxRatePort(),
            StubInflationPort(InflationFactorSummary(factor = 1020000L, factorScale = 6)),
            StubAssetMarkPricePort()
        )
        val result = useCase.execute(
            ComputePerformanceAfterInflation.Query(userId, from, to, Currency.EUR)
        )
        val expectedEnd = 120000L * 1_000_000L / 1_020_000L
        assertEquals(expectedEnd, result.endValue)
    }

    @Test
    fun usesRawEndValueWhenInflationUnavailable() {
        val account = account(currency = Currency.EUR)
        val useCase = ComputePerformanceAfterInflation(
            StubAccountPort(listOf(account)),
            StubTransactionPort(listOf(
                transaction(account.id, 100000L, date = LocalDate.of(2023, 12, 1)),
                transaction(account.id, 20000L, date = LocalDate.of(2024, 3, 1))
            )),
            StubFeePort(),
            StubFxRatePort(),
            StubInflationPort(null),
            StubAssetMarkPricePort()
        )
        val result = useCase.execute(
            ComputePerformanceAfterInflation.Query(userId, from, to, Currency.EUR)
        )
        assertEquals(120000L, result.endValue)
    }

    @Test
    fun rejectsFromAfterTo() {
        val useCase = ComputePerformanceAfterInflation(
            StubAccountPort(),
            StubTransactionPort(),
            StubFeePort(),
            StubFxRatePort(),
            StubInflationPort(),
            StubAssetMarkPricePort()
        )
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ComputePerformanceAfterInflation.Query(userId, to, from, Currency.EUR))
        }
    }
}