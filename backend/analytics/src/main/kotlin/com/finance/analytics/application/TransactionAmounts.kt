package com.finance.analytics.application

import com.finance.analytics.domain.ports.TransactionSummary
import kotlin.math.abs

internal fun TransactionSummary.signedAmount(): Long = when (type) {
    "DEPOSIT", "SELL", "DIVIDEND" -> abs(amount)
    "WITHDRAWAL", "BUY", "FEE", "TAX" -> -abs(amount)
    "TRANSFER", "OTHER" -> amount
    else -> amount
}
