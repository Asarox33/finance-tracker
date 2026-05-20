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
    val appliedFxTargetCurrency: Currency? = null,
    /** Units acquired (BUY) or sold (SELL) in [assetQuantityScale] decimal places. Null for legacy rows. */
    val assetQuantityMinor: Long? = null,
    val assetQuantityScale: Int? = null
) {
    init {
        if (label.isBlank()) throw BusinessRuleViolationException("Transaction label must not be blank")
        if (amount == 0L) throw BusinessRuleViolationException("Transaction amount must not be zero")
        val fxFields = listOf(appliedFxRate, appliedFxRateScale, appliedFxRateDate, appliedFxSourceCurrency, appliedFxTargetCurrency)
        val fxProvided = fxFields.count { it != null }
        if (fxProvided > 0 && fxProvided != fxFields.size) {
            throw BusinessRuleViolationException("All FX rate fields must be provided together or not at all")
        }
        val qtyFields = listOf(assetQuantityMinor, assetQuantityScale)
        val qtyProvided = qtyFields.count { it != null }
        if (qtyProvided == 1) {
            throw BusinessRuleViolationException("Asset quantity minor and scale must both be set or both null")
        }
        if (qtyProvided == 2) {
            if (!type.requiresAsset()) {
                throw BusinessRuleViolationException("Asset quantity is only allowed for BUY or SELL transactions")
            }
            if (assetQuantityMinor != null && assetQuantityMinor <= 0L) {
                throw BusinessRuleViolationException("Asset quantity must be positive")
            }
            if (assetQuantityScale != null && (assetQuantityScale < 0 || assetQuantityScale > 18)) {
                throw BusinessRuleViolationException("Asset quantity scale must be between 0 and 18")
            }
        }
    }

    fun hasFxRate(): Boolean = appliedFxRate != null

    fun delete(): Transaction {
        if (status == TransactionStatus.DELETED) throw BusinessRuleViolationException("Transaction is already deleted")
        return copy(status = TransactionStatus.DELETED)
    }
}