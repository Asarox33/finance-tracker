package com.finance.fx.application

import com.finance.fx.InMemoryFxRateRepository
import com.finance.fx.testFxRate
import com.finance.shared.Currency
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate

class GetFxRateTest {

    private val repository = InMemoryFxRateRepository()
    private val useCase = GetFxRate(repository, lookbackDays = 30)

    @Test
    fun returnsExactRateForDate() {
        val date = LocalDate.of(2024, 1, 15)
        repository.save(testFxRate(date = date))
        val result = useCase.execute(GetFxRate.Query(Currency.USD, Currency.EUR, date))
        assertEquals(date, result.date)
    }

    @Test
    fun returnsFallbackRateWithinLookback() {
        val rateDate = LocalDate.of(2024, 1, 10)
        val queryDate = LocalDate.of(2024, 1, 15)
        repository.save(testFxRate(date = rateDate))
        val result = useCase.execute(GetFxRate.Query(Currency.USD, Currency.EUR, queryDate))
        assertEquals(rateDate, result.date)
    }

    @Test
    fun throwsNotFoundWhenNoPairExists() {
        assertThrows(NotFoundException::class.java) {
            useCase.execute(GetFxRate.Query(Currency.USD, Currency.EUR, LocalDate.of(2024, 1, 15)))
        }
    }

    @Test
    fun throwsNotFoundWhenOutsideLookback() {
        repository.save(testFxRate(date = LocalDate.of(2024, 1, 1)))
        assertThrows(NotFoundException::class.java) {
            useCase.execute(GetFxRate.Query(Currency.USD, Currency.EUR, LocalDate.of(2024, 3, 1)))
        }
    }
}