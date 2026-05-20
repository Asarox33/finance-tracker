package com.finance.analytics.domain

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

data class HoldingLine(
    val assetId: UUID,
    /** Display names from asset repository when available. */
    val assetName: String?,
    val assetTicker: String?,
    val quantityMinor: Long,
    val quantityScale: Int,
    val valueInAccountCurrency: Long
)

data class AccountSnapshot(
    val accountId: UUID,
    val accountName: String,
    val accountType: String,
    val institutionId: UUID,
    val institutionName: String,
    val institutionType: String,
    val currency: Currency,
    /** Cash balance from summed transaction amounts (includes trade cash legs). */
    val cashBalanceInAccountCurrency: Long,
    /** Mark-to-market value of long asset positions in account currency (zero without prices or quantities). */
    val holdingsValueInAccountCurrency: Long,
    val holdings: List<HoldingLine>,
    val valueInAccountCurrency: Long,
    val valueInReferenceCurrency: Long,
    val referenceCurrency: Currency,
    val asOf: LocalDate
)
