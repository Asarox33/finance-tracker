package com.finance.transaction.domain.ports

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

/**
 * Resolves a **unit price** for an asset in the requested currency (minor units per one full asset unit),
 * using recorded prices and explicit FX rates when the quote currency differs.
 */
fun interface AssetTradePricingPort {
    fun findUnitPriceMinorInCurrency(assetId: UUID, currency: Currency, date: LocalDate): UnitPriceInCurrency?
}

data class UnitPriceInCurrency(val priceMinorPerUnit: Long, val pricedOn: LocalDate)
