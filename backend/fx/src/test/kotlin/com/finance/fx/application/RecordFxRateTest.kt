package com.finance.fx.application

import com.finance.fx.InMemoryFxRateRepository
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate

class RecordFxRateTest {

    private val repository = InMemoryFxRateRepository()
    private val useCase = RecordFxRate(repository)

    @Test
    fun recordsRateSuccessfully() {
        val result = useCase.execute(command())
        assertNotNull(result.rateId)
    }

    @Test
    fun rejectsSameCurrency() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(command(source = Currency.EUR, target = Currency.EUR))
        }
    }

    @Test
    fun rejectsZeroRate() {
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(rate = 0L)) }
    }

    @Test
    fun rejectsNegativeRate() {
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(rate = -1L)) }
    }

    @Test
    fun rejectsNegativeScale() {
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(scale = -1)) }
    }

    private fun command(
        source: Currency = Currency.USD,
        target: Currency = Currency.EUR,
        rate: Long = 91500L,
        scale: Int = 5
    ) = RecordFxRate.Command(source, target, rate, scale, LocalDate.of(2024, 1, 15))
}