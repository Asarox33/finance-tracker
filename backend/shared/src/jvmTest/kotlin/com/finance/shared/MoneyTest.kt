package com.finance.shared

import com.finance.shared.error.BusinessRuleViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class MoneyTest {

    @Test
    fun constructsValidMoney() {
        val money = Money.of(1000L, Currency.EUR)
        assertEquals(1000L, money.amount)
        assertEquals(Currency.EUR, money.currency)
    }

    @Test
    fun addsMoneyWithSameCurrency() {
        val a = Money.of(1000L, Currency.EUR)
        val b = Money.of(500L, Currency.EUR)
        assertEquals(Money.of(1500L, Currency.EUR), a.add(b))
    }

    @Test
    fun subtractsMoneyWithSameCurrency() {
        val a = Money.of(1000L, Currency.EUR)
        val b = Money.of(300L, Currency.EUR)
        assertEquals(Money.of(700L, Currency.EUR), a.subtract(b))
    }

    @Test
    fun multipliesByLongFactor() {
        val money = Money.of(100L, Currency.EUR)
        assertEquals(Money.of(300L, Currency.EUR), money.multiply(3L))
    }

    @Test
    fun negatesMoney() {
        assertEquals(Money.of(-100L, Currency.EUR), Money.of(100L, Currency.EUR).negate())
    }

    @Test
    fun rejectsAdditionOfDifferentCurrencies() {
        val eur = Money.of(100L, Currency.EUR)
        val usd = Money.of(100L, Currency.USD)
        assertThrows(BusinessRuleViolationException::class.java) { eur.add(usd) }
    }

    @Test
    fun rejectsSubtractionOfDifferentCurrencies() {
        assertThrows(BusinessRuleViolationException::class.java) {
            Money.of(100L, Currency.EUR).subtract(Money.of(100L, Currency.USD))
        }
    }

    @Test
    fun isZeroWhenAmountIsZero() {
        assertTrue(Money.zero(Currency.EUR).isZero())
    }

    @Test
    fun isPositiveWhenAmountIsPositive() {
        assertTrue(Money.of(1L, Currency.EUR).isPositive())
    }

    @Test
    fun isNegativeWhenAmountIsNegative() {
        assertTrue(Money.of(-1L, Currency.EUR).isNegative())
    }

    @Test
    fun displayStringForEur() {
        assertEquals("10.50 EUR", Money.of(1050L, Currency.EUR).toDisplayString())
    }

    @Test
    fun displayStringForJpy() {
        assertEquals("1050 JPY", Money.of(1050L, Currency.JPY).toDisplayString())
    }

    @Test
    fun displayStringForKwd() {
        assertEquals("1.050 KWD", Money.of(1050L, Currency.KWD).toDisplayString())
    }

    @Test
    fun fractionDigitsForUsd() {
        assertEquals(2, Money.of(0L, Currency.USD).fractionDigits())
    }

    @Test
    fun fractionDigitsForJpy() {
        assertEquals(0, Money.of(0L, Currency.JPY).fractionDigits())
    }

    @Test
    fun twoMoneyObjectsWithSameValuesAreEqual() {
        assertEquals(Money.of(500L, Currency.USD), Money.of(500L, Currency.USD))
    }

    @Test
    fun twoMoneyObjectsWithDifferentCurrenciesAreNotEqual() {
        assertFalse(Money.of(500L, Currency.USD) == Money.of(500L, Currency.EUR))
    }
}