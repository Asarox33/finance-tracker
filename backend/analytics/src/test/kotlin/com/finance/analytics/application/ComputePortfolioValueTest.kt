package com.finance.analytics.application

import com.finance.analytics.StubAccountPort
import com.finance.analytics.StubFxRatePort
import com.finance.analytics.StubTransactionPort
import com.finance.analytics.account
import com.finance.analytics.transaction
import com.finance.analytics.domain.ports.FxRateSummary
import com.finance.shared.Currency
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.LocalDate

class ComputePortfolioValueTest {

    private val asOf = LocalDate.of(2024, 6, 30)

    @Test
    fun returnsZeroForUserWithNoAccounts() {
        val useCase = ComputePortfolioValue(
            StubAccountPort(),
            StubTransactionPort(),
            StubFxRatePort()
        )
        val result = useCase.execute(ComputePortfolioValue.Query(
            java.util.UUID.randomUUID(), asOf, Currency.EUR
        ))
        assertEquals(0L, result.totalValue)
        assertEquals(0, result.snapshots.size)
    }

    @Test
    fun computesTotalValueInReferenceCurrency() {
        val account = account(currency = Currency.EUR)
        val useCase = ComputePortfolioValue(
            StubAccountPort(listOf(account)),
            StubTransactionPort(listOf(
                transaction(account.id, 100000L),
                transaction(account.id, 50000L)
            )),
            StubFxRatePort()
        )
        val result = useCase.execute(ComputePortfolioValue.Query(
            java.util.UUID.randomUUID(), asOf, Currency.EUR
        ))
        assertEquals(150000L, result.totalValue)
    }

    @Test
    fun convertsForeignCurrencyAccountUsingFxRate() {
        val account = account(currency = Currency.USD)
        val useCase = ComputePortfolioValue(
            StubAccountPort(listOf(account)),
            StubTransactionPort(listOf(transaction(account.id, 100000L, Currency.USD))),
            StubFxRatePort(FxRateSummary(91500L, 5, asOf))
        )
        val result = useCase.execute(ComputePortfolioValue.Query(
            java.util.UUID.randomUUID(), asOf, Currency.EUR
        ))
        val expected = 100000L * 91500L / 100000L
        assertEquals(expected, result.totalValue)
    }

    @Test
    fun returnsZeroForForeignAccountWithNoFxRate() {
        val account = account(currency = Currency.USD)
        val useCase = ComputePortfolioValue(
            StubAccountPort(listOf(account)),
            StubTransactionPort(listOf(transaction(account.id, 100000L, Currency.USD))),
            StubFxRatePort(null)
        )
        val result = useCase.execute(ComputePortfolioValue.Query(
            java.util.UUID.randomUUID(), asOf, Currency.EUR
        ))
        assertEquals(0L, result.totalValue)
    }
}