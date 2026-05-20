package com.finance.analytics.application

import com.finance.analytics.domain.AccountSnapshot
import com.finance.analytics.domain.PortfolioValue
import com.finance.analytics.domain.ports.AccountPort
import com.finance.analytics.domain.ports.AssetLabelPort
import com.finance.analytics.domain.ports.AssetMarkPricePort
import com.finance.analytics.domain.ports.FxRatePort
import com.finance.analytics.domain.ports.InstitutionPort
import com.finance.analytics.domain.ports.TransactionPort
import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

class ComputePortfolioValue(
    private val accountPort: AccountPort,
    private val institutionPort: InstitutionPort,
    private val transactionPort: TransactionPort,
    private val fxRatePort: FxRatePort,
    private val assetMarkPricePort: AssetMarkPricePort,
    private val assetLabelPort: AssetLabelPort
) {
    data class Query(
        val userId: UUID,
        val asOf: LocalDate,
        val referenceCurrency: Currency
    )

    fun execute(query: Query): PortfolioValue {
        val accounts = accountPort.findActiveByUserId(query.userId)
        val institutionsById = institutionPort.findAll().associateBy { it.id }

        val snapshots = accounts.map { account ->
            val transactions = transactionPort.findByAccountId(query.userId, account.id, LocalDate.MIN, query.asOf)
            val cashBalance = transactions.sumOf { it.signedAmount() }
            val (holdingsValue, holdingLinesRaw) = aggregateHoldingsInAccountCurrency(
                transactions,
                account.currency,
                query.asOf,
                assetMarkPricePort
            )
            val labels = assetLabelPort.labelsFor(holdingLinesRaw.map { it.assetId }.toSet())
            val holdingLines = holdingLinesRaw.map { line ->
                val label = labels[line.assetId]
                if (label != null) {
                    line.copy(assetName = label.name, assetTicker = label.ticker)
                } else {
                    line
                }
            }
            val valueInAccountCurrency = cashBalance + holdingsValue

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

            val institution = institutionsById[account.institutionId]

            AccountSnapshot(
                accountId = account.id,
                accountName = account.name,
                accountType = account.type,
                institutionId = account.institutionId,
                institutionName = institution?.name ?: UNKNOWN_INSTITUTION_NAME,
                institutionType = institution?.type ?: UNKNOWN_INSTITUTION_TYPE,
                currency = account.currency,
                cashBalanceInAccountCurrency = cashBalance,
                holdingsValueInAccountCurrency = holdingsValue,
                holdings = holdingLines,
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

    companion object {
        private const val UNKNOWN_INSTITUTION_NAME = "Unknown"
        private const val UNKNOWN_INSTITUTION_TYPE = "OTHER"
    }
}
