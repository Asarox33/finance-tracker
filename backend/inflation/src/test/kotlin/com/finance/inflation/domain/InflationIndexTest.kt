package com.finance.inflation.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.YearMonth
import java.util.UUID

class InflationIndexTest {

    @Test
    fun constructsValidIndex() {
        val index = index()
        assertEquals(11523L, index.indexValue)
        assertEquals(2, index.indexScale)
    }

    @Test
    fun rejectsZeroValue() {
        assertThrows(BusinessRuleViolationException::class.java) { index(indexValue = 0L) }
    }

    @Test
    fun rejectsNegativeValue() {
        assertThrows(BusinessRuleViolationException::class.java) { index(indexValue = -1L) }
    }

    @Test
    fun rejectsNegativeScale() {
        assertThrows(BusinessRuleViolationException::class.java) { index(indexScale = -1) }
    }

    private fun index(indexValue: Long = 11523L, indexScale: Int = 2) =
        InflationIndex(UUID.randomUUID(), Currency.EUR, YearMonth.of(2024, 1), indexValue, indexScale)
}