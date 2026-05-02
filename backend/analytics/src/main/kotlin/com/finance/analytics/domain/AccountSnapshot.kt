package com.finance.analytics.domain

import com.finance.shared.Currency
import java.time.LocalDate
import java.util.UUID

data class AccountSnapshot(
    val accountId: UUID,
    val currency: Currency,
    val valueInAccountCurrency: Long,
    val valueInReferenceCurrency: Long,
    val referenceCurrency: Currency,
    val asOf: LocalDate
)