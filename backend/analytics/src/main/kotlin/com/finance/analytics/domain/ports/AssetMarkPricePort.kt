package com.finance.analytics.domain.ports

import com.finance.shared.Currency
import com.finance.transaction.domain.ports.UnitPriceInCurrency
import java.time.LocalDate
import java.util.UUID

fun interface AssetMarkPricePort {
    fun findUnitPriceMinorInCurrency(assetId: UUID, currency: Currency, date: LocalDate): UnitPriceInCurrency?
}
