package com.finance.transaction.application

import com.finance.account.domain.AccountType
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import com.finance.transaction.InMemoryTransactionRepository
import com.finance.transaction.StubAccountAccessPort
import com.finance.transaction.accountAccessSummary
import com.finance.transaction.domain.TransactionType
import com.finance.transaction.domain.ports.AssetTradePricingPort
import com.finance.transaction.domain.ports.UnitPriceInCurrency
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

private class StubAssetTradePricingPort(
    private val priceMinorPerUnit: Long = 100L
) : AssetTradePricingPort {
    override fun findUnitPriceMinorInCurrency(
        assetId: UUID,
        currency: Currency,
        date: LocalDate
    ): UnitPriceInCurrency = UnitPriceInCurrency(priceMinorPerUnit, date)
}

class RecordTransactionTest {

    private val repository = InMemoryTransactionRepository()
    private val userId = UUID.randomUUID()
    private val accountId = UUID.randomUUID()
    private val pricing = StubAssetTradePricingPort()
    private val useCase = RecordTransaction(
        repository,
        StubAccountAccessPort(listOf(accountAccessSummary(accountId, userId))),
        pricing
    )

    @Test
    fun recordsTransactionSuccessfully() {
        val result = useCase.execute(command())
        assertNotNull(result.transactionId)
    }

    @Test
    fun recordsTransactionWithFxRate() {
        val result = useCase.execute(
            command(
                appliedFxRate = 91500L,
                appliedFxRateScale = 5,
                appliedFxRateDate = LocalDate.of(2024, 1, 15),
                appliedFxSourceCurrency = Currency.USD,
                appliedFxTargetCurrency = Currency.EUR
            )
        )
        val saved = repository.findById(result.transactionId)!!
        assertTrue(saved.hasFxRate())
    }

    @Test
    fun rejectsPartialFxRateFields() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(appliedFxRate = 91500L))
        }
    }

    @Test
    fun rejectsBlankLabel() {
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(label = " ")) }
    }

    @Test
    fun rejectsZeroAmount() {
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(amount = 0L)) }
    }

    @Test
    fun acceptsNegativeTransferAmount() {
        val result = useCase.execute(command(type = TransactionType.TRANSFER, amount = -5000L))
        assertNotNull(result.transactionId)
    }

    @Test
    fun rejectsNegativeAmountForDirectionalType() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(type = TransactionType.WITHDRAWAL, amount = -5000L))
        }
    }

    @Test
    fun normalizesWithdrawalAmountAsNegative() {
        val result = useCase.execute(command(type = TransactionType.WITHDRAWAL, amount = 5000L))
        val saved = repository.findById(result.transactionId)!!
        assertEquals(-5000L, saved.amount)
    }

    @Test
    fun preservesTransferAmountSign() {
        val result = useCase.execute(command(type = TransactionType.TRANSFER, amount = -5000L))
        val saved = repository.findById(result.transactionId)!!
        assertEquals(-5000L, saved.amount)
    }

    @Test
    fun rejectsAccountOwnedByAnotherUser() {
        val otherAccountId = UUID.randomUUID()
        val useCaseNoPricing = RecordTransaction(
            repository,
            StubAccountAccessPort(listOf(accountAccessSummary(otherAccountId, UUID.randomUUID()))),
            null
        )
        assertThrows(NotFoundException::class.java) {
            useCaseNoPricing.execute(command(accountId = otherAccountId))
        }
    }

    @Test
    fun rejectsTransactionTypeNotAllowedForAccountType() {
        val savingsAccountId = UUID.randomUUID()
        val useCaseSavings = RecordTransaction(
            repository,
            StubAccountAccessPort(listOf(accountAccessSummary(savingsAccountId, userId, type = AccountType.SAVINGS))),
            pricing
        )
        assertThrows(InvalidRequestException::class.java) {
            useCaseSavings.execute(command(accountId = savingsAccountId, type = TransactionType.BUY))
        }
    }

    @Test
    fun rejectsBuyWithoutAsset() {
        val brokerageAccountId = UUID.randomUUID()
        val useCaseBr = RecordTransaction(
            repository,
            StubAccountAccessPort(listOf(accountAccessSummary(brokerageAccountId, userId, type = AccountType.BROKERAGE))),
            pricing
        )
        assertThrows(InvalidRequestException::class.java) {
            useCaseBr.execute(command(accountId = brokerageAccountId, type = TransactionType.BUY))
        }
    }

    @Test
    fun rejectsAssetOnNonTradeTransaction() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(type = TransactionType.DEPOSIT, assetId = UUID.randomUUID()))
        }
    }

    @Test
    fun recordsBuyWithAssetOnBrokerageAccountDerivesQuantity() {
        val brokerageAccountId = UUID.randomUUID()
        val assetId = UUID.randomUUID()
        val useCaseBr = RecordTransaction(
            repository,
            StubAccountAccessPort(listOf(accountAccessSummary(brokerageAccountId, userId, type = AccountType.BROKERAGE))),
            StubAssetTradePricingPort(100L)
        )
        val result = useCaseBr.execute(
            command(accountId = brokerageAccountId, type = TransactionType.BUY, amount = 5000L, assetId = assetId)
        )
        assertNotNull(result.transactionId)
        val saved = repository.findById(result.transactionId)!!
        assertEquals(assetId, saved.assetId)
        assertEquals(5_000_000_000L, saved.assetQuantityMinor)
        assertEquals(8, saved.assetQuantityScale)
    }

    @Test
    fun recordsBuyWithQuantityOnlyDerivesCash() {
        val brokerageAccountId = UUID.randomUUID()
        val assetId = UUID.randomUUID()
        val useCaseBr = RecordTransaction(
            repository,
            StubAccountAccessPort(listOf(accountAccessSummary(brokerageAccountId, userId, type = AccountType.BROKERAGE))),
            StubAssetTradePricingPort(100L)
        )
        val result = useCaseBr.execute(
            command(
                accountId = brokerageAccountId,
                type = TransactionType.BUY,
                amount = 0L,
                assetId = assetId,
                assetQuantityMinor = 5_000_000_000L,
                assetQuantityScale = 8
            )
        )
        val saved = repository.findById(result.transactionId)!!
        assertEquals(-5000L, saved.amount)
        assertEquals(5_000_000_000L, saved.assetQuantityMinor)
    }

    @Test
    fun rejectsBuyWhenCashAndQuantityMismatch() {
        val brokerageAccountId = UUID.randomUUID()
        val assetId = UUID.randomUUID()
        val useCaseBr = RecordTransaction(
            repository,
            StubAccountAccessPort(listOf(accountAccessSummary(brokerageAccountId, userId, type = AccountType.BROKERAGE))),
            StubAssetTradePricingPort(100L)
        )
        assertThrows(InvalidRequestException::class.java) {
            useCaseBr.execute(
                command(
                    accountId = brokerageAccountId,
                    type = TransactionType.BUY,
                    amount = 9999L,
                    assetId = assetId,
                    assetQuantityMinor = 5_000_000_000L,
                    assetQuantityScale = 8
                )
            )
        }
    }

    @Test
    fun rejectsClosedAccount() {
        val closedAccountId = UUID.randomUUID()
        val useCaseClosed = RecordTransaction(
            repository,
            StubAccountAccessPort(listOf(accountAccessSummary(closedAccountId, userId, active = false))),
            pricing
        )
        assertThrows(InvalidRequestException::class.java) {
            useCaseClosed.execute(command(accountId = closedAccountId))
        }
    }

    private fun command(
        accountId: UUID = this.accountId,
        assetId: UUID? = null,
        label: String = "Monthly salary",
        type: TransactionType = TransactionType.DEPOSIT,
        amount: Long = 10000L,
        appliedFxRate: Long? = null,
        appliedFxRateScale: Int? = null,
        appliedFxRateDate: LocalDate? = null,
        appliedFxSourceCurrency: Currency? = null,
        appliedFxTargetCurrency: Currency? = null,
        assetQuantityMinor: Long? = null,
        assetQuantityScale: Int? = null
    ) = RecordTransaction.Command(
        requestingUserId = userId,
        accountId = accountId,
        assetId = assetId,
        type = type,
        amount = amount,
        currency = Currency.EUR,
        date = LocalDate.of(2024, 1, 15),
        label = label,
        notes = null,
        appliedFxRate = appliedFxRate,
        appliedFxRateScale = appliedFxRateScale,
        appliedFxRateDate = appliedFxRateDate,
        appliedFxSourceCurrency = appliedFxSourceCurrency,
        appliedFxTargetCurrency = appliedFxTargetCurrency,
        assetQuantityMinor = assetQuantityMinor,
        assetQuantityScale = assetQuantityScale
    )
}
