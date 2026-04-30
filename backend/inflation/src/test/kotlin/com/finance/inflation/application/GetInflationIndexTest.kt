package com.finance.inflation.application

import com.finance.inflation.InMemoryInflationIndexRepository
import com.finance.inflation.testInflationIndex
import com.finance.shared.Currency
import com.finance.shared.error.NotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.YearMonth

class GetInflationIndexTest {

    private val repository = InMemoryInflationIndexRepository()
    private val useCase = GetInflationIndex(repository)

    @Test
    fun returnsExactIndexForYearMonth() {
        val ym = YearMonth.of(2024, 1)
        repository.save(testInflationIndex(yearMonth = ym))
        val result = useCase.execute(GetInflationIndex.Query(Currency.EUR, ym))
        assertEquals(ym, result.yearMonth)
    }

    @Test
    fun returnsFallbackFromPreviousMonth() {
        val recorded = YearMonth.of(2024, 1)
        val queried = YearMonth.of(2024, 3)
        repository.save(testInflationIndex(yearMonth = recorded))
        val result = useCase.execute(GetInflationIndex.Query(Currency.EUR, queried))
        assertEquals(recorded, result.yearMonth)
    }

    @Test
    fun throwsNotFoundWhenNoIndexExists() {
        assertThrows(NotFoundException::class.java) {
            useCase.execute(GetInflationIndex.Query(Currency.EUR, YearMonth.of(2024, 1)))
        }
    }
}