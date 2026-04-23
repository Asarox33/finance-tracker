package com.finance.shared

public fun Money.fractionDigits(): Int = currency.metadata.fractionDigits

public fun Money.toDisplayString(): String {
    val digits = fractionDigits()
    val factor = pow10(digits)
    val whole = amount / factor
    val fraction = kotlin.math.abs(amount % factor)
    return if (digits == 0) "$whole ${currency.metadata.code}"
    else "$whole.${fraction.toString().padStart(digits, '0')} ${currency.metadata.code}"
}

public fun Money.multiply(factor: Double): Money {
    val result = (amount * factor).toLong()
    return copy(amount = result)
}

private fun pow10(exp: Int): Long {
    var result = 1L
    repeat(exp) { result *= 10L }
    return result
}