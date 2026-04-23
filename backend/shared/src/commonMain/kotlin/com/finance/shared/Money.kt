package com.finance.shared

import com.finance.shared.error.BusinessRuleViolationException

public data class Money(
    val amount: Long,
    val currency: Currency
) {
    public companion object {
        public fun of(amount: Long, currency: Currency): Money = Money(amount, currency)

        public fun zero(currency: Currency): Money = Money(0L, currency)
    }

    public fun add(other: Money): Money {
        requireSameCurrency(other)
        return copy(amount = amount + other.amount)
    }

    public fun subtract(other: Money): Money {
        requireSameCurrency(other)
        return copy(amount = amount - other.amount)
    }

    public fun multiply(factor: Long): Money =
        copy(amount = amount * factor)

    public fun negate(): Money = copy(amount = -amount)

    public fun isPositive(): Boolean = amount > 0
    public fun isNegative(): Boolean = amount < 0
    public fun isZero(): Boolean = amount == 0L

    private fun requireSameCurrency(other: Money) {
        if (currency != other.currency) throw BusinessRuleViolationException(
            "Cannot operate on different currencies: ${currency.name} and ${other.currency.name}"
        )
    }
}