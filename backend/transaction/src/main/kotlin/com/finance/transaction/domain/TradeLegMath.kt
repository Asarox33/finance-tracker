package com.finance.transaction.domain

import kotlin.math.abs

object TradeLegMath {

    const val DEFAULT_QUANTITY_SCALE: Int = 8

    /** Allowed difference in cash minor units when both cash and quantity are supplied. */
    const val CASH_QUANTITY_MATCH_TOLERANCE_MINOR: Long = 1L

    fun deriveQuantityFromCash(cashMinorMagnitude: Long, priceMinorPerUnit: Long, quantityScale: Int): Long {
        require(priceMinorPerUnit > 0) { "Price must be positive" }
        require(cashMinorMagnitude > 0) { "Cash magnitude must be positive" }
        val scaleFactor = pow10(quantityScale)
        return (cashMinorMagnitude * scaleFactor + priceMinorPerUnit / 2) / priceMinorPerUnit
    }

    fun deriveCashMinorFromQuantity(quantityMinor: Long, priceMinorPerUnit: Long, quantityScale: Int): Long {
        require(priceMinorPerUnit > 0) { "Price must be positive" }
        require(quantityMinor > 0) { "Quantity must be positive" }
        val scaleFactor = pow10(quantityScale)
        return (quantityMinor * priceMinorPerUnit + scaleFactor / 2) / scaleFactor
    }

    fun cashMatchesQuantity(
        cashMinorMagnitude: Long,
        quantityMinor: Long,
        priceMinorPerUnit: Long,
        quantityScale: Int
    ): Boolean {
        val expected = deriveCashMinorFromQuantity(quantityMinor, priceMinorPerUnit, quantityScale)
        return abs(expected - cashMinorMagnitude) <= CASH_QUANTITY_MATCH_TOLERANCE_MINOR
    }

    private fun pow10(exp: Int): Long {
        var result = 1L
        repeat(exp) { result *= 10L }
        return result
    }
}
