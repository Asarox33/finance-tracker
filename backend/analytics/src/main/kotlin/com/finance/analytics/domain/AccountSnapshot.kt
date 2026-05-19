package com.finance.analytics.domain

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

data class AccountSnapshot(
    val accountId: UUID,
    val accountName: String,
    val accountType: String,
    val institutionId: UUID,
    val institutionName: String,
    val institutionType: String,
    val currency: Currency,
    val valueInAccountCurrency: Long,
    val valueInReferenceCurrency: Long,
    val referenceCurrency: Currency,
    val asOf: LocalDate
)