package com.finance.inflation.application

import com.finance.inflation.InMemoryInflationIndexRepository
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.YearMonth

class RecordInflationIndexTest {

    private val repository = InMemoryInflationIndexRepository()
    private val useCase = RecordInflationIndex(repository)

    @Test
    fun recordsIndexSuccessfully() {
        val result = useCase.execute(command())
        assertNotNull(result.indexId)
    }

    @Test
    fun rejectsZeroValue() {
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(indexValue = 0L)) }
    }

    @Test
    fun rejectsNegativeValue() {
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(indexValue = -1L)) }
    }

    @Test
    fun rejectsNegativeScale() {
        assertThrows(InvalidRequestException::class.java) { useCase.execute(command(indexScale = -1)) }
    }

    private fun command(indexValue: Long = 11523L, indexScale: Int = 2) =
        RecordInflationIndex.Command(Currency.EUR, YearMonth.of(2024, 1), indexValue, indexScale)
}