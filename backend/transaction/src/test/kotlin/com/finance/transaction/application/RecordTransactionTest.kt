package com.finance.transaction.application

import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import com.finance.transaction.InMemoryTransactionRepository
import com.finance.transaction.StubAccountAccessPort
import com.finance.transaction.accountAccessSummary
import com.finance.transaction.domain.TransactionType
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class RecordTransactionTest {

    private val repository = InMemoryTransactionRepository()
    private val userId = UUID.randomUUID()
    private val accountId = UUID.randomUUID()
    private val useCase = RecordTransaction(repository, StubAccountAccessPort(listOf(accountAccessSummary(accountId, userId))))

    @Test
    fun recordsTransactionSuccessfully() {
        val result = useCase.execute(command())
        assertNotNull(result.transactionId)
    }

    @Test
    fun recordsTransactionWithFxRate() {
        val result = useCase.execute(command(
            appliedFxRate = 91500L,
            appliedFxRateScale = 5,
            appliedFxRateDate = LocalDate.of(2024, 1, 15),
            appliedFxSourceCurrency = Currency.USD,
            appliedFxTargetCurrency = Currency.EUR
        ))
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
        val useCase = RecordTransaction(
            repository,
            StubAccountAccessPort(listOf(accountAccessSummary(otherAccountId, UUID.randomUUID())))
        )
        assertThrows(NotFoundException::class.java) {
            useCase.execute(command(accountId = otherAccountId))
        }
    }

    @Test
    fun rejectsClosedAccount() {
        val closedAccountId = UUID.randomUUID()
        val useCase = RecordTransaction(
            repository,
            StubAccountAccessPort(listOf(accountAccessSummary(closedAccountId, userId, active = false)))
        )
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(accountId = closedAccountId))
        }
    }

    private fun command(
        accountId: UUID = this.accountId,
        label: String = "Monthly salary",
        type: TransactionType = TransactionType.DEPOSIT,
        amount: Long = 10000L,
        appliedFxRate: Long? = null,
        appliedFxRateScale: Int? = null,
        appliedFxRateDate: LocalDate? = null,
        appliedFxSourceCurrency: Currency? = null,
        appliedFxTargetCurrency: Currency? = null
    ) = RecordTransaction.Command(
        requestingUserId = userId,
        accountId = accountId,
        assetId = null,
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
        appliedFxTargetCurrency = appliedFxTargetCurrency
    )
}