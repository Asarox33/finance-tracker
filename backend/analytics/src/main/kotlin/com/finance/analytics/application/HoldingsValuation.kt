package com.finance.analytics.application

import com.finance.analytics.domain.HoldingLine
import com.finance.analytics.domain.ports.AssetMarkPricePort
import com.finance.analytics.domain.ports.TransactionSummary
import com.finance.shared.Currency
import com.finance.transaction.domain.TradeLegMath
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.util.UUID

internal fun economicValueInAccountCurrency(
    transactions: List<TransactionSummary>,
    accountCurrency: Currency,
    asOf: LocalDate,
    markPrice: AssetMarkPricePort
): Long {
    val cash = transactions.sumOf { it.signedAmount() }
    val (holdingsTotal, _) = aggregateHoldingsInAccountCurrency(transactions, accountCurrency, asOf, markPrice)
    return cash + holdingsTotal
}

internal fun aggregateHoldingsInAccountCurrency(
    transactions: List<TransactionSummary>,
    accountCurrency: Currency,
    asOf: LocalDate,
    markPrice: AssetMarkPricePort
): Pair<Long, List<HoldingLine>> {
    val netByAsset = mutableMapOf<UUID, BigDecimal>()
    for (tx in transactions) {
        val aid = tx.assetId ?: continue
        val qm = tx.assetQuantityMinor ?: continue
        val sc = tx.assetQuantityScale ?: continue
        val delta = when (tx.type) {
            "BUY" -> BigDecimal.valueOf(qm, sc)
            "SELL" -> BigDecimal.valueOf(qm, sc).negate()
            else -> null
        } ?: continue
        netByAsset.merge(aid, delta, BigDecimal::add)
    }

    var holdingsTotalMinor = 0L
    val lines = mutableListOf<HoldingLine>()
    for ((assetId, qty) in netByAsset) {
        if (qty.compareTo(BigDecimal.ZERO) <= 0) continue
        val quote = markPrice.findUnitPriceMinorInCurrency(assetId, accountCurrency, asOf) ?: continue
        val valueBd = qty.multiply(BigDecimal.valueOf(quote.priceMinorPerUnit)).setScale(0, RoundingMode.HALF_UP)
        val valueMinor = try {
            valueBd.longValueExact()
        } catch (_: ArithmeticException) {
            valueBd.toLong()
        }

        val qtyMinor = qty.movePointRight(TradeLegMath.DEFAULT_QUANTITY_SCALE).setScale(0, RoundingMode.HALF_UP)
        val quantityMinorLong = try {
            qtyMinor.longValueExact()
        } catch (_: ArithmeticException) {
            qtyMinor.toLong()
        }

        lines.add(
            HoldingLine(
                assetId = assetId,
                assetName = null,
                assetTicker = null,
                quantityMinor = quantityMinorLong,
                quantityScale = TradeLegMath.DEFAULT_QUANTITY_SCALE,
                valueInAccountCurrency = valueMinor
            )
        )
        holdingsTotalMinor += valueMinor
    }
    return Pair(holdingsTotalMinor, lines.sortedBy { it.assetId.toString() })
}
