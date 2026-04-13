package com.finance.shared

public data class Money(
    val amount: Long,
    val currency: Currency
) {
    public companion object {
        public fun of(amount: Long, currency: Currency): Money =
            Money(amount, currency)
    }
}