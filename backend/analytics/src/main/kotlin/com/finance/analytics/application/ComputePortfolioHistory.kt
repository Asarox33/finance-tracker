package com.finance.analytics.application

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

class ComputePortfolioHistory(
    private val computePortfolioValue: ComputePortfolioValue
) {
    data class Query(
        val userId: UUID,
        val days: Int,
        val referenceCurrency: Currency
    )

    data class HistoryPoint(
        val date: LocalDate,
        val totalValue: Long,
        val currency: Currency
    )

    data class Result(
        val points: List<HistoryPoint>,
        val referenceCurrency: Currency
    )

    fun execute(query: Query): Result {
        require(query.days in 1..MAX_DAYS) { "days must be between 1 and $MAX_DAYS" }
        val today = LocalDate.now()
        val points = (query.days - 1 downTo 0).map { offset ->
            val asOf = today.minusDays(offset.toLong())
            val portfolio = computePortfolioValue.execute(
                ComputePortfolioValue.Query(query.userId, asOf, query.referenceCurrency)
            )
            HistoryPoint(asOf, portfolio.totalValue, portfolio.currency)
        }
        return Result(points, query.referenceCurrency)
    }

    companion object {
        const val MAX_DAYS = 90
    }
}
