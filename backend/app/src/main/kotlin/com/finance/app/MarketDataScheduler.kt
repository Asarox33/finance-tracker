package com.finance.app

import com.finance.fx.application.ImportFxRates
import com.finance.price.application.ImportEndOfDayPrices
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
class MarketDataScheduler(
    private val importFxRates: ImportFxRates,
    private val importEndOfDayPrices: ImportEndOfDayPrices,
    @param:Value($$"${market-data.import-enabled:true}") private val importEnabled: Boolean
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(cron = $$"${market-data.eod-cron:0 0 19 * * *}", zone = $$"${market-data.timezone:Europe/Paris}")
    fun importEndOfDayMarketData() {
        if (!importEnabled) {
            return
        }
        val date = LocalDate.now().minusDays(1)
        runCatching {
            val fx = importFxRates.execute(ImportFxRates.Command(date))
            log.info("Scheduled FX import for {}: {} rates", date, fx.importedCount)
        }.onFailure { ex ->
            log.warn("Scheduled FX import failed for {}: {}", date, ex.message)
        }
        runCatching {
            val prices = importEndOfDayPrices.execute(ImportEndOfDayPrices.Command(date))
            log.info(
                "Scheduled price import for {}: {} of {} assets",
                date,
                prices.importedCount,
                prices.candidates
            )
        }.onFailure { ex ->
            log.warn("Scheduled price import failed for {}: {}", date, ex.message)
        }
    }
}
