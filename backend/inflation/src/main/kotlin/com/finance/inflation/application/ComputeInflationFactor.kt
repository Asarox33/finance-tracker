package com.finance.inflation.application

import com.finance.inflation.domain.InflationIndex
import com.finance.inflation.domain.InflationIndexRepository
import com.finance.shared.Currency
import com.finance.shared.error.NotFoundException
import java.time.YearMonth

class ComputeInflationFactor(
    private val inflationIndexRepository: InflationIndexRepository
) {
    data class Query(
        val currency: Currency,
        val fromYearMonth: YearMonth,
        val toYearMonth: YearMonth
    )

    data class Result(
        val factor: Long,
        val factorScale: Int,
        val fromIndex: Long,
        val fromIndexScale: Int,
        val fromYearMonth: YearMonth,
        val toIndex: Long,
        val toIndexScale: Int,
        val toYearMonth: YearMonth
    )

    fun execute(query: Query): Result {
        val fromIndex = resolveIndex(query.currency, query.fromYearMonth)
            ?: throw NotFoundException(
                "No inflation index found for ${query.currency} around ${query.fromYearMonth}"
            )
        val toIndex = resolveIndexPreferringAfter(query.currency, query.toYearMonth)
            ?: throw NotFoundException(
                "No inflation index found for ${query.currency} around ${query.toYearMonth}"
            )

        val scale = maxOf(fromIndex.indexScale, toIndex.indexScale)
        val fromScaled = scale(fromIndex.indexValue, fromIndex.indexScale, scale)
        val toScaled = scale(toIndex.indexValue, toIndex.indexScale, scale)

        val factorScale = 6
        val factor = toScaled * pow10(factorScale) / fromScaled

        return Result(
            factor = factor,
            factorScale = factorScale,
            fromIndex = fromIndex.indexValue,
            fromIndexScale = fromIndex.indexScale,
            fromYearMonth = fromIndex.yearMonth,
            toIndex = toIndex.indexValue,
            toIndexScale = toIndex.indexScale,
            toYearMonth = toIndex.yearMonth
        )
    }

    private fun resolveIndex(currency: Currency, yearMonth: YearMonth): InflationIndex? =
        inflationIndexRepository.findByCurrencyAndYearMonth(currency, yearMonth)
            ?: inflationIndexRepository.findLatestByCurrencyOnOrBefore(currency, yearMonth)
            ?: inflationIndexRepository.findEarliestByCurrencyOnOrAfter(currency, yearMonth)

    private fun resolveIndexPreferringAfter(currency: Currency, yearMonth: YearMonth): InflationIndex? =
        inflationIndexRepository.findByCurrencyAndYearMonth(currency, yearMonth)
            ?: inflationIndexRepository.findEarliestByCurrencyOnOrAfter(currency, yearMonth)
            ?: inflationIndexRepository.findLatestByCurrencyOnOrBefore(currency, yearMonth)

    private fun scale(value: Long, fromScale: Int, toScale: Int): Long =
        if (toScale >= fromScale) value * pow10(toScale - fromScale)
        else value / pow10(fromScale - toScale)

    private fun pow10(exp: Int): Long {
        var result = 1L
        repeat(exp) { result *= 10L }
        return result
    }
}