package com.finance.inflation.application

import com.finance.inflation.InMemoryInflationIndexRepository
import com.finance.inflation.testInflationIndex
import com.finance.shared.Currency
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.YearMonth

class ComputeInflationFactorTest {

    private val repository = InMemoryInflationIndexRepository()
    private val useCase = ComputeInflationFactor(repository)

    @Test
    fun computesFactorBetweenTwoMonths() {
        repository.save(testInflationIndex(yearMonth = YearMonth.of(2020, 1), indexValue = 10000L, indexScale = 2))
        repository.save(testInflationIndex(yearMonth = YearMonth.of(2024, 1), indexValue = 11523L, indexScale = 2))
        val result = useCase.execute(
            ComputeInflationFactor.Query(Currency.EUR, YearMonth.of(2020, 1), YearMonth.of(2024, 1))
        )
        assertEquals(6, result.factorScale)
        val expected = 11523L * 1_000_000L / 10000L
        assertEquals(expected, result.factor)
    }

    @Test
    fun usesInterpolationForMissingToMonth() {
        repository.save(testInflationIndex(yearMonth = YearMonth.of(2020, 1), indexValue = 10000L, indexScale = 2))
        repository.save(testInflationIndex(yearMonth = YearMonth.of(2024, 6), indexValue = 11523L, indexScale = 2))
        val result = useCase.execute(
            ComputeInflationFactor.Query(Currency.EUR, YearMonth.of(2020, 1), YearMonth.of(2024, 1))
        )
        assertEquals(YearMonth.of(2020, 1), result.fromYearMonth)
        assertEquals(YearMonth.of(2024, 6), result.toYearMonth)
    }

    @Test
    fun usesInterpolationForMissingFromMonth() {
        repository.save(testInflationIndex(yearMonth = YearMonth.of(2019, 6), indexValue = 9800L, indexScale = 2))
        repository.save(testInflationIndex(yearMonth = YearMonth.of(2024, 1), indexValue = 11523L, indexScale = 2))
        val result = useCase.execute(
            ComputeInflationFactor.Query(Currency.EUR, YearMonth.of(2020, 1), YearMonth.of(2024, 1))
        )
        assertEquals(YearMonth.of(2019, 6), result.fromYearMonth)
        assertEquals(YearMonth.of(2024, 1), result.toYearMonth)
    }

    @Test
    fun throwsNotFoundWhenNoDataExists() {
        assertThrows(NotFoundException::class.java) {
            useCase.execute(
                ComputeInflationFactor.Query(Currency.EUR, YearMonth.of(2020, 1), YearMonth.of(2024, 1))
            )
        }
    }

    @Test
    fun handlesIdenticalMonths() {
        repository.save(testInflationIndex(yearMonth = YearMonth.of(2024, 1), indexValue = 11523L, indexScale = 2))
        val result = useCase.execute(
            ComputeInflationFactor.Query(Currency.EUR, YearMonth.of(2024, 1), YearMonth.of(2024, 1))
        )
        assertEquals(1_000_000L, result.factor)
    }
}