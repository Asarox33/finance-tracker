package com.finance.transaction.application

import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import com.finance.transaction.InMemoryTransactionRepository
import com.finance.transaction.domain.TransactionType
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class RecordTransactionTest {

    private val repository = InMemoryTransactionRepository()
    private val useCase = RecordTransaction(repository)

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
    fun acceptsNegativeAmount() {
        val result = useCase.execute(command(amount = -5000L))
        assertNotNull(result.transactionId)
    }

    private fun command(
        label: String = "Monthly salary",
        amount: Long = 10000L,
        appliedFxRate: Long? = null,
        appliedFxRateScale: Int? = null,
        appliedFxRateDate: LocalDate? = null,
        appliedFxSourceCurrency: Currency? = null,
        appliedFxTargetCurrency: Currency? = null
    ) = RecordTransaction.Command(
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