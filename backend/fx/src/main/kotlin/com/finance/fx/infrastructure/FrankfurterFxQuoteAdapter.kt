package com.finance.fx.infrastructure

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.finance.fx.domain.ports.FxQuote
import com.finance.fx.domain.ports.FxQuotePort
import com.finance.shared.Currency
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate

@Component
class FrankfurterFxQuoteAdapter(
    private val restClient: RestClient = RestClient.builder().baseUrl("https://api.frankfurter.app").build()
) : FxQuotePort {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun fetchRatesForDate(date: LocalDate, pairs: List<Pair<Currency, Currency>>): List<FxQuote> {
        val results = mutableListOf<FxQuote>()
        for ((source, target) in pairs) {
            runCatching {
                val response = restClient.get()
                    .uri("/{date}?from={from}&to={to}", date, source.name, target.name)
                    .retrieve()
                    .body(FrankfurterResponse::class.java)
                val rateDecimal = response?.rates?.get(target.name) ?: return@runCatching
                val (rate, scale) = decimalToScaledRate(rateDecimal)
                results.add(
                    FxQuote(
                        sourceCurrency = source,
                        targetCurrency = target,
                        rate = rate,
                        rateScale = scale,
                        date = date
                    )
                )
            }.onFailure { ex ->
                log.warn("Failed to fetch FX rate {}→{} for {}: {}", source, target, date, ex.message)
            }
        }
        return results
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private data class FrankfurterResponse(val rates: Map<String, BigDecimal>?)

    companion object {
        const val RATE_SCALE = 6

        fun decimalToScaledRate(value: BigDecimal): Pair<Long, Int> {
            val scaled = value.setScale(RATE_SCALE, RoundingMode.HALF_UP)
            val unscaled = scaled.movePointRight(RATE_SCALE).longValueExact()
            return unscaled to RATE_SCALE
        }
    }
}
