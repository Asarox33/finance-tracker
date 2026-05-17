package com.finance.transaction.domain

import com.finance.shared.Currency
import com.finance.shared.error.BusinessRuleViolationException
import java.time.LocalDate
import java.util.UUID

data class Transaction(
    val id: UUID,
    val accountId: UUID,
    val assetId: UUID?,
    val type: TransactionType,
    val amount: Long,
    val currency: Currency,
    val date: LocalDate,
    val label: String,
    val notes: String?,
    val status: TransactionStatus = TransactionStatus.ACTIVE,
    val appliedFxRate: Long? = null,
    val appliedFxRateScale: Int? = null,
    val appliedFxRateDate: LocalDate? = null,
    val appliedFxSourceCurrency: Currency? = null,
    val appliedFxTargetCurrency: Currency? = null
) {
    init {
        if (label.isBlank()) throw BusinessRuleViolationException("Transaction label must not be blank")
        if (amount == 0L) throw BusinessRuleViolationException("Transaction amount must not be zero")
        val fxFields = listOf(appliedFxRate, appliedFxRateScale, appliedFxRateDate, appliedFxSourceCurrency, appliedFxTargetCurrency)
        val fxProvided = fxFields.count { it != null }
        if (fxProvided > 0 && fxProvided != fxFields.size) {
            throw BusinessRuleViolationException("All FX rate fields must be provided together or not at all")
        }
    }

    fun hasFxRate(): Boolean = appliedFxRate != null

    fun delete(): Transaction {
        if (status == TransactionStatus.DELETED) throw BusinessRuleViolationException("Transaction is already deleted")
        return copy(status = TransactionStatus.DELETED)
    }
}