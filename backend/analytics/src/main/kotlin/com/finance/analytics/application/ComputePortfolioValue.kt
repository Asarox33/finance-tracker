package com.finance.analytics.application

import com.finance.analytics.domain.AccountSnapshot
import com.finance.analytics.domain.PortfolioValue
import com.finance.analytics.domain.ports.AccountPort
import com.finance.analytics.domain.ports.FxRatePort
import com.finance.analytics.domain.ports.TransactionPort
import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

class ComputePortfolioValue(
    private val accountPort: AccountPort,
    private val transactionPort: TransactionPort,
    private val fxRatePort: FxRatePort
) {
    data class Query(
        val userId: UUID,
        val asOf: LocalDate,
        val referenceCurrency: Currency
    )

    fun execute(query: Query): PortfolioValue {
        val accounts = accountPort.findActiveByUserId(query.userId)

        val snapshots = accounts.map { account ->
            val transactions = transactionPort.findByAccountId(query.userId, account.id, LocalDate.MIN, query.asOf)
            val valueInAccountCurrency = transactions.sumOf { it.amount }

            val valueInRef = if (account.currency == query.referenceCurrency) {
                valueInAccountCurrency
            } else {
                val rate = fxRatePort.getRate(account.currency, query.referenceCurrency, query.asOf)
                if (rate != null) {
                    val scale = pow10(rate.rateScale)
                    valueInAccountCurrency * rate.rate / scale
                } else {
                    0L
                }
            }

            AccountSnapshot(
                accountId = account.id,
                currency = account.currency,
                valueInAccountCurrency = valueInAccountCurrency,
                valueInReferenceCurrency = valueInRef,
                referenceCurrency = query.referenceCurrency,
                asOf = query.asOf
            )
        }

        return PortfolioValue(
            totalValue = snapshots.sumOf { it.valueInReferenceCurrency },
            currency = query.referenceCurrency,
            asOf = query.asOf,
            snapshots = snapshots
        )
    }

    private fun pow10(exp: Int): Long {
        var result = 1L
        repeat(exp) { result *= 10L }
        return result
    }
}