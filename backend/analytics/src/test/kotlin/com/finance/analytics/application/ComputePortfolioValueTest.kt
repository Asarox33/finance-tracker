package com.finance.analytics.application

import com.finance.analytics.StubAccountPort
import com.finance.analytics.StubAssetLabelPort
import com.finance.analytics.StubAssetMarkPricePort
import com.finance.analytics.StubFxRatePort
import com.finance.analytics.StubInstitutionPort
import com.finance.analytics.StubTransactionPort
import com.finance.analytics.account
import com.finance.analytics.institution
import com.finance.analytics.transaction
import com.finance.analytics.domain.ports.AssetLabel
import com.finance.analytics.domain.ports.FxRateSummary
import com.finance.shared.Currency
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class ComputePortfolioValueTest {

    private val asOf = LocalDate.of(2024, 6, 30)

    @Test
    fun returnsZeroForUserWithNoAccounts() {
        val useCase = portfolioUseCase()
        val result = useCase.execute(ComputePortfolioValue.Query(UUID.randomUUID(), asOf, Currency.EUR))
        assertEquals(0L, result.totalValue)
        assertEquals(0, result.snapshots.size)
    }

    @Test
    fun computesTotalValueInReferenceCurrency() {
        val instId = UUID.randomUUID()
        val acc = account(currency = Currency.EUR, institutionId = instId, name = "Livret A")
        val useCase = portfolioUseCase(
            accounts = listOf(acc),
            institutions = listOf(institution(id = instId, name = "BNP Paribas")),
            transactions = listOf(
                transaction(acc.id, 100000L),
                transaction(acc.id, 50000L)
            )
        )
        val result = useCase.execute(ComputePortfolioValue.Query(UUID.randomUUID(), asOf, Currency.EUR))
        assertEquals(150000L, result.totalValue)
        assertEquals("Livret A", result.snapshots.single().accountName)
        assertEquals("BNP Paribas", result.snapshots.single().institutionName)
    }

    @Test
    fun appliesTransactionTypeDirectionToPortfolioValue() {
        val acc = account(currency = Currency.EUR)
        val useCase = portfolioUseCase(
            accounts = listOf(acc),
            transactions = listOf(
                transaction(acc.id, 100000L, type = "DEPOSIT"),
                transaction(acc.id, 20000L, type = "WITHDRAWAL"),
                transaction(acc.id, -5000L, type = "FEE")
            )
        )
        val result = useCase.execute(ComputePortfolioValue.Query(UUID.randomUUID(), asOf, Currency.EUR))
        assertEquals(75000L, result.totalValue)
    }

    @Test
    fun convertsForeignCurrencyAccountUsingFxRate() {
        val acc = account(currency = Currency.USD)
        val useCase = portfolioUseCase(
            accounts = listOf(acc),
            transactions = listOf(transaction(acc.id, 100000L, Currency.USD)),
            fxRate = FxRateSummary(91500L, 5, asOf)
        )
        val result = useCase.execute(ComputePortfolioValue.Query(UUID.randomUUID(), asOf, Currency.EUR))
        val expected = 100000L * 91500L / 100000L
        assertEquals(expected, result.totalValue)
    }

    @Test
    fun returnsZeroForForeignAccountWithNoFxRate() {
        val acc = account(currency = Currency.USD)
        val useCase = portfolioUseCase(
            accounts = listOf(acc),
            transactions = listOf(transaction(acc.id, 100000L, Currency.USD)),
            fxRate = null
        )
        val result = useCase.execute(ComputePortfolioValue.Query(UUID.randomUUID(), asOf, Currency.EUR))
        assertEquals(0L, result.totalValue)
    }

    @Test
    fun usesUnknownInstitutionWhenInstitutionMissing() {
        val acc = account(name = "Orphan Account")
        val useCase = portfolioUseCase(accounts = listOf(acc), institutions = emptyList())
        val result = useCase.execute(ComputePortfolioValue.Query(UUID.randomUUID(), asOf, Currency.EUR))
        assertEquals("Unknown", result.snapshots.single().institutionName)
        assertEquals("OTHER", result.snapshots.single().institutionType)
    }

    private fun portfolioUseCase(
        accounts: List<com.finance.analytics.domain.ports.AccountSummary> = emptyList(),
        institutions: List<com.finance.analytics.domain.ports.InstitutionSummary> = emptyList(),
        transactions: List<com.finance.analytics.domain.ports.TransactionSummary> = emptyList(),
        fxRate: FxRateSummary? = null,
        assetMarkPrice: StubAssetMarkPricePort = StubAssetMarkPricePort(),
        assetLabels: StubAssetLabelPort = StubAssetLabelPort()
    ) = ComputePortfolioValue(
        StubAccountPort(accounts),
        StubInstitutionPort(institutions),
        StubTransactionPort(transactions),
        StubFxRatePort(fxRate),
        assetMarkPrice,
        assetLabels
    )

    @Test
    fun includesMarkToMarketHoldingsFromBuyQuantityAndPrice() {
        val assetId = UUID.randomUUID()
        val acc = account(currency = Currency.EUR)
        val useCase = portfolioUseCase(
            accounts = listOf(acc),
            transactions = listOf(
                transaction(acc.id, 4_000_000L, type = "DEPOSIT", date = LocalDate.of(2024, 6, 1)),
                transaction(
                    acc.id,
                    -4_000_000L,
                    type = "BUY",
                    date = LocalDate.of(2024, 6, 2),
                    assetId = assetId,
                    assetQuantityMinor = 100_000_000L,
                    assetQuantityScale = 8
                )
            ),
            assetMarkPrice = StubAssetMarkPricePort(mapOf(assetId to 4_000_000L)),
            assetLabels = StubAssetLabelPort(mapOf(assetId to AssetLabel("Bitcoin", "BTC")))
        )
        val result = useCase.execute(ComputePortfolioValue.Query(UUID.randomUUID(), asOf, Currency.EUR))
        assertEquals(0L, result.snapshots.single().cashBalanceInAccountCurrency)
        assertEquals(4_000_000L, result.snapshots.single().holdingsValueInAccountCurrency)
        assertEquals(4_000_000L, result.snapshots.single().valueInAccountCurrency)
        assertEquals(4_000_000L, result.totalValue)
        val holding = result.snapshots.single().holdings.single()
        assertEquals("Bitcoin", holding.assetName)
        assertEquals("BTC", holding.assetTicker)
    }
}
