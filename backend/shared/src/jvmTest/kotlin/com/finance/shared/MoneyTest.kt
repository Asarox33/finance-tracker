package com.finance.shared

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class MoneyTest {

    @Test
    fun constructsValidMoney() {
        val money = Money.of(1000L, Currency.EUR)
        assertEquals(1000L, money.amount)
        assertEquals(Currency.EUR, money.currency)
    }

    @Test
    fun twoMoneyObjectsWithSameValuesAreEqual() {
        assertEquals(Money.of(500L, Currency.USD), Money.of(500L, Currency.USD))
    }

    @Test
    fun twoMoneyObjectsWithDifferentCurrenciesAreNotEqual() {
        assert(Money.of(500L, Currency.USD) != Money.of(500L, Currency.EUR))
    }

    @Test
    fun twoMoneyObjectsWithDifferentAmountsAreNotEqual() {
        assert(Money.of(100L, Currency.EUR) != Money.of(200L, Currency.EUR))
    }
}