package com.finance.price.infrastructure

import com.finance.price.domain.ports.AssetEndOfDayQuote
import com.finance.price.domain.ports.AssetQuotePort
import com.finance.price.domain.ports.QuotableAsset
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.time.LocalDate

/**
 * Placeholder until an EOD market-data provider is selected.
 * Returns no quotes; the EOD import use case will record zero items until replaced.
 */
@Component
class StubAssetQuoteAdapter : AssetQuotePort {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun fetchEndOfDayQuotes(date: LocalDate, assets: List<QuotableAsset>): List<AssetEndOfDayQuote> {
        if (assets.isNotEmpty()) {
            log.info(
                "EOD price provider not configured; skipped {} assets for {}",
                assets.size,
                date
            )
        }
        return emptyList()
    }
}
