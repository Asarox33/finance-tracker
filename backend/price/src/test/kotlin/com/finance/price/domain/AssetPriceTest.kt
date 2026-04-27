package com.finance.price.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class AssetPriceTest {

    @Test
    fun constructsValidPrice() {
        val price = price()
        assertEquals(15000L, price.price)
    }

    @Test
    fun rejectsZeroPrice() {
        assertThrows(BusinessRuleViolationException::class.java) { price(price = 0L) }
    }

    @Test
    fun rejectsNegativePrice() {
        assertThrows(BusinessRuleViolationException::class.java) { price(price = -1L) }
    }

    @Test
    fun appliedPriceDateDefaultsToDate() {
        val p = price()
        assertEquals(p.date, p.appliedPriceDate)
    }

    private fun price(price: Long = 15000L) = AssetPrice(
        UUID.randomUUID(), UUID.randomUUID(), price,
        Currency.USD, LocalDate.of(2024, 1, 15)
    )
}