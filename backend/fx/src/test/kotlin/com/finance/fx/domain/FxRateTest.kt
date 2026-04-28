package com.finance.fx.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class FxRateTest {

    @Test
    fun constructsValidFxRate() {
        val rate = rate()
        assertEquals(91500L, rate.rate)
        assertEquals(5, rate.rateScale)
    }

    @Test
    fun rejectsSameCurrency() {
        assertThrows(BusinessRuleViolationException::class.java) {
            rate(sourceCurrency = Currency.EUR, targetCurrency = Currency.EUR)
        }
    }

    @Test
    fun rejectsZeroRate() {
        assertThrows(BusinessRuleViolationException::class.java) { rate(rate = 0L) }
    }

    @Test
    fun rejectsNegativeRate() {
        assertThrows(BusinessRuleViolationException::class.java) { rate(rate = -1L) }
    }

    @Test
    fun rejectsNegativeScale() {
        assertThrows(BusinessRuleViolationException::class.java) { rate(rateScale = -1) }
    }

    @Test
    fun appliedRateDateDefaultsToDate() {
        val r = rate()
        assertEquals(r.date, r.appliedRateDate)
    }

    private fun rate(
        sourceCurrency: Currency = Currency.USD,
        targetCurrency: Currency = Currency.EUR,
        rate: Long = 91500L,
        rateScale: Int = 5
    ) = FxRate(
        UUID.randomUUID(), sourceCurrency, targetCurrency,
        rate, rateScale, LocalDate.of(2024, 1, 15)
    )
}