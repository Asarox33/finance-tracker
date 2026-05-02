package com.finance.analytics.application

import com.finance.analytics.domain.PortfolioPerformance
import com.finance.analytics.domain.ports.AccountPort
import com.finance.analytics.domain.ports.FeePort
import com.finance.analytics.domain.ports.FxRatePort
import com.finance.analytics.domain.ports.InflationPort
import com.finance.analytics.domain.ports.TransactionPort
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

class ComputePerformanceAfterInflation(
    private val accountPort: AccountPort,
    private val transactionPort: TransactionPort,
    private val feePort: FeePort,
    private val fxRatePort: FxRatePort,
    private val inflationPort: InflationPort
) {
    data class Query(
        val userId: UUID,
        val from: LocalDate,
        val to: LocalDate,
        val referenceCurrency: Currency
    )

    fun execute(query: Query): PortfolioPerformance {
        if (query.from.isAfter(query.to)) throw InvalidRequestException("from must be before to")

        val accounts = accountPort.findActiveByUserId(query.userId)

        val startValue = accounts.sumOf { account ->
            val txs = transactionPort.findByAccountId(account.id, LocalDate.MIN, query.from)
            convertToRef(txs.sumOf { it.amount }, account.currency, query.referenceCurrency, query.from)
        }

        val endValue = accounts.sumOf { account ->
            val txs = transactionPort.findByAccountId(account.id, LocalDate.MIN, query.to)
            convertToRef(txs.sumOf { it.amount }, account.currency, query.referenceCurrency, query.to)
        }

        val totalFees = accounts.sumOf { account ->
            val fees = feePort.findByAccountId(account.id, query.from, query.to)
            fees.sumOf { fee ->
                convertToRef(fee.amount, fee.currency, query.referenceCurrency, fee.date)
            }
        }

        val inflationFactor = inflationPort.getFactor(
            query.referenceCurrency,
            YearMonth.from(query.from),
            YearMonth.from(query.to)
        )

        val inflationAdjustedEnd = if (inflationFactor != null) {
            val scale = pow10(inflationFactor.factorScale)
            endValue * scale / inflationFactor.factor
        } else {
            endValue
        }

        val gainLoss = inflationAdjustedEnd - startValue - totalFees
        val gainLossBasisPoints = if (startValue != 0L) gainLoss * 10000L / startValue else 0L

        return PortfolioPerformance(
            startValue = startValue,
            endValue = inflationAdjustedEnd,
            currency = query.referenceCurrency,
            gainLoss = gainLoss,
            gainLossBasisPoints = gainLossBasisPoints,
            from = query.from,
            to = query.to
        )
    }

    private fun convertToRef(amount: Long, from: Currency, to: Currency, date: LocalDate): Long {
        if (from == to) return amount
        val rate = fxRatePort.getRate(from, to, date) ?: return 0L
        val scale = pow10(rate.rateScale)
        return amount * rate.rate / scale
    }

    private fun pow10(exp: Int): Long {
        var result = 1L
        repeat(exp) { result *= 10L }
        return result
    }
}