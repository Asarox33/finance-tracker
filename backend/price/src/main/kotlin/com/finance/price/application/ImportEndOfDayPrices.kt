package com.finance.price.application

import com.finance.price.domain.ports.AssetQuotePort
import com.finance.price.domain.ports.QuotableAssetPort
import java.time.LocalDate

class ImportEndOfDayPrices(
    private val quotableAssetPort: QuotableAssetPort,
    private val assetQuotePort: AssetQuotePort,
    private val recordAssetPrice: RecordAssetPrice
) {
    data class Command(val date: LocalDate, val maxAssets: Int = 500)

    data class Result(val importedCount: Int, val date: LocalDate, val candidates: Int)

    fun execute(command: Command): Result {
        val assets = quotableAssetPort.findQuotableAssets(command.maxAssets)
        val quotes = assetQuotePort.fetchEndOfDayQuotes(command.date, assets)
        quotes.forEach { quote ->
            recordAssetPrice.execute(
                RecordAssetPrice.Command(
                    assetId = quote.assetId,
                    price = quote.priceMinor,
                    currency = quote.currency,
                    date = quote.date
                )
            )
        }
        return Result(importedCount = quotes.size, date = command.date, candidates = assets.size)
    }
}
