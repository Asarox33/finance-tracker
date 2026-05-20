package com.finance.app

import com.finance.fx.application.GetFxRate
import com.finance.price.application.GetAssetPrice
import com.finance.shared.Currency
import com.finance.shared.error.NotFoundException
import com.finance.analytics.domain.ports.AssetMarkPricePort
import com.finance.transaction.domain.ports.AssetTradePricingPort
import com.finance.transaction.domain.ports.UnitPriceInCurrency
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

@Component
class AssetPricingBridge(
    private val getAssetPrice: GetAssetPrice,
    private val getFxRate: GetFxRate
) : AssetTradePricingPort, AssetMarkPricePort {

    override fun findUnitPriceMinorInCurrency(
        assetId: UUID,
        currency: Currency,
        date: LocalDate
    ): UnitPriceInCurrency? {
        val row = try {
            getAssetPrice.execute(GetAssetPrice.Query(assetId, date))
        } catch (_: NotFoundException) {
            return null
        }
        if (row.currency == currency) {
            return UnitPriceInCurrency(priceMinorPerUnit = row.price, pricedOn = row.appliedPriceDate)
        }
        val rate = try {
            getFxRate.execute(
                GetFxRate.Query(
                    sourceCurrency = row.currency,
                    targetCurrency = currency,
                    date = date
                )
            )
        } catch (_: NotFoundException) {
            return null
        }
        val divisor = pow10(rate.rateScale)
        val converted = row.price * rate.rate / divisor
        return UnitPriceInCurrency(priceMinorPerUnit = converted, pricedOn = row.appliedPriceDate)
    }

    private fun pow10(exp: Int): Long {
        var result = 1L
        repeat(exp) { result *= 10L }
        return result
    }
}
