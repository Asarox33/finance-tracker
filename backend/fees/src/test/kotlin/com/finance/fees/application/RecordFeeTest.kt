package com.finance.fees.application

import com.finance.fees.InMemoryFeeRepository
import com.finance.fees.domain.FeeType
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class RecordFeeTest {

    private val repository = InMemoryFeeRepository()
    private val useCase = RecordFee(repository)

    @Test
    fun recordsFeeSuccessfully() {
        val result = useCase.execute(command())
        assertNotNull(result.feeId)
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
    fun rejectsNegativeAmount() {
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(amount = -1L)) }
    }

    private fun command(
        label: String = "Brokerage fee",
        amount: Long = 199L
    ) = RecordFee.Command(
        accountId = UUID.randomUUID(),
        transactionId = null,
        type = FeeType.BROKERAGE,
        amount = amount,
        currency = Currency.EUR,
        date = LocalDate.of(2024, 1, 15),
        label = label
    )
}