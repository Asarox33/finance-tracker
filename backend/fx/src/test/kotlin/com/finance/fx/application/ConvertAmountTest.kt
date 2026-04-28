package com.finance.fx.application

import com.finance.fx.InMemoryFxRateRepository
import com.finance.fx.testFxRate
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate

class ConvertAmountTest {

    private val repository = InMemoryFxRateRepository()
    private val useCase = ConvertAmount(repository, lookbackDays = 30)
    private val date = LocalDate.of(2024, 1, 15)

    @Test
    fun convertsAmountCorrectly() {
        repository.save(testFxRate(
            sourceCurrency = Currency.USD,
            targetCurrency = Currency.EUR,
            rate = 91500L,
            rateScale = 5,
            date = date
        ))
        val result = useCase.execute(
            ConvertAmount.Command(10000L, Currency.USD, Currency.EUR, date)
        )
        assertEquals(10000L * 91500L / 100000L, result.targetAmount)
        assertEquals(Currency.USD, result.sourceCurrency)
        assertEquals(Currency.EUR, result.targetCurrency)
        assertEquals(date, result.appliedRateDate)
    }

    @Test
    fun rejectsSameCurrency() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ConvertAmount.Command(10000L, Currency.EUR, Currency.EUR, date))
        }
    }

    @Test
    fun rejectsZeroAmount() {
        assertThrows(InvalidRequestException::class.java) {
            useCase.execute(ConvertAmount.Command(0L, Currency.USD, Currency.EUR, date))
        }
    }

    @Test
    fun throwsNotFoundWhenNoRateExists() {
        assertThrows(NotFoundException::class.java) {
            useCase.execute(ConvertAmount.Command(10000L, Currency.USD, Currency.EUR, date))
        }
    }

    @Test
    fun usesFallbackRateWithinLookback() {
        val rateDate = LocalDate.of(2024, 1, 10)
        repository.save(testFxRate(date = rateDate, rate = 91500L, rateScale = 5))
        val result = useCase.execute(ConvertAmount.Command(10000L, Currency.USD, Currency.EUR, date))
        assertEquals(rateDate, result.appliedRateDate)
    }
}