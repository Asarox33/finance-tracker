package com.finance.transaction.application

import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionRepository
import com.finance.transaction.domain.TransactionType
import com.finance.transaction.domain.TradeLegMath
import com.finance.transaction.domain.allowsExplicitNegativeAmount
import com.finance.transaction.domain.isAllowedFor
import com.finance.transaction.domain.requiresAsset
import com.finance.transaction.domain.signedAmount
import com.finance.transaction.domain.ports.AccountAccessPort
import com.finance.transaction.domain.ports.AssetTradePricingPort
import java.time.LocalDate
import java.util.UUID

class RecordTransaction(
    private val transactionRepository: TransactionRepository,
    private val accountAccessPort: AccountAccessPort,
    private val assetTradePricingPort: AssetTradePricingPort? = null
) {
    data class Command(
        val requestingUserId: UUID,
        val accountId: UUID,
        val assetId: UUID?,
        val type: TransactionType,
        val amount: Long,
        val currency: Currency,
        val date: LocalDate,
        val label: String,
        val notes: String?,
        val appliedFxRate: Long? = null,
        val appliedFxRateScale: Int? = null,
        val appliedFxRateDate: LocalDate? = null,
        val appliedFxSourceCurrency: Currency? = null,
        val appliedFxTargetCurrency: Currency? = null,
        val assetQuantityMinor: Long? = null,
        val assetQuantityScale: Int? = null
    )

    data class Result(val transactionId: UUID)

    fun execute(command: Command): Result {
        if (command.label.isBlank()) throw InvalidRequestException("Transaction label must not be blank")
        if (command.amount < 0L && !command.type.allowsExplicitNegativeAmount()) {
            throw InvalidRequestException("Negative amount is only allowed for TRANSFER or OTHER transactions")
        }
        val account = accountAccessPort.findAccountForUser(command.accountId, command.requestingUserId)
            ?: throw NotFoundException("Account not found: ${command.accountId}")
        if (!account.active) throw InvalidRequestException("Cannot record transactions for a closed account")
        if (!command.type.isAllowedFor(account.type)) {
            throw InvalidRequestException(
                "Transaction type ${command.type} is not allowed for ${account.type} accounts"
            )
        }
        if (command.type.requiresAsset() && command.assetId == null) {
            throw InvalidRequestException("Asset is required for ${command.type} transactions")
        }
        if (!command.type.requiresAsset() && command.assetId != null) {
            throw InvalidRequestException("Asset can only be set for BUY or SELL transactions")
        }
        if (command.currency != account.currency) {
            throw InvalidRequestException("Transaction currency must match the account currency (${account.currency})")
        }
        val qtyFieldPartial =
            (command.assetQuantityMinor != null) xor (command.assetQuantityScale != null)
        if (qtyFieldPartial) {
            throw InvalidRequestException("assetQuantityMinor and assetQuantityScale must be provided together")
        }
        if (!command.type.requiresAsset() &&
            (command.assetQuantityMinor != null || command.assetQuantityScale != null)
        ) {
            throw InvalidRequestException("Asset quantity is only allowed for BUY or SELL transactions")
        }

        val fxFields = listOf(
            command.appliedFxRate,
            command.appliedFxRateScale,
            command.appliedFxRateDate,
            command.appliedFxSourceCurrency,
            command.appliedFxTargetCurrency
        )
        val fxProvided = fxFields.count { it != null }
        if (fxProvided > 0 && fxProvided != fxFields.size) {
            throw InvalidRequestException("All FX rate fields must be provided together or not at all")
        }

        val (resolvedAmountMag, resolvedQtyMinor, resolvedQtyScale) =
            resolveAmountAndQuantity(command, account.currency)

        if (resolvedAmountMag == 0L) {
            throw InvalidRequestException("Transaction amount must not be zero")
        }

        val transaction = Transaction(
            id = UUID.randomUUID(),
            accountId = command.accountId,
            assetId = command.assetId,
            type = command.type,
            amount = command.type.signedAmount(resolvedAmountMag),
            currency = command.currency,
            date = command.date,
            label = command.label,
            notes = command.notes,
            appliedFxRate = command.appliedFxRate,
            appliedFxRateScale = command.appliedFxRateScale,
            appliedFxRateDate = command.appliedFxRateDate,
            appliedFxSourceCurrency = command.appliedFxSourceCurrency,
            appliedFxTargetCurrency = command.appliedFxTargetCurrency,
            assetQuantityMinor = resolvedQtyMinor,
            assetQuantityScale = resolvedQtyScale
        )
        return Result(transactionId = transactionRepository.save(transaction).id)
    }

    private fun resolveAmountAndQuantity(command: Command, accountCurrency: Currency): ResolvedTradeLegs {
        if (command.type != TransactionType.BUY && command.type != TransactionType.SELL) {
            if (command.amount == 0L) throw InvalidRequestException("Transaction amount must not be zero")
            if (command.assetQuantityMinor != null) {
                throw InvalidRequestException("Asset quantity is only allowed for BUY or SELL transactions")
            }
            return ResolvedTradeLegs(cashMinorMagnitude = command.amount, qtyMinor = null, qtyScale = null)
        }

        val hasCash = command.amount != 0L
        val qtyMinorIn = command.assetQuantityMinor
        val qtyScaleUser = command.assetQuantityScale

        if (!hasCash && qtyMinorIn == null) {
            throw InvalidRequestException(
                "BUY and SELL require a non-zero cash amount and/or asset quantity " +
                    "(and a recorded price to derive a missing leg)"
            )
        }

        if (qtyMinorIn != null && qtyMinorIn <= 0L) {
            throw InvalidRequestException("Asset quantity must be positive")
        }

        val assetId = command.assetId!!

        if (hasCash && qtyMinorIn != null) {
            val scale = qtyScaleUser ?: TradeLegMath.DEFAULT_QUANTITY_SCALE
            val port = assetTradePricingPort
            if (port != null) {
                val unitPrice = port.findUnitPriceMinorInCurrency(assetId, accountCurrency, command.date)
                    ?: throw InvalidRequestException(
                        "No asset price in $accountCurrency for the selected asset and date " +
                            "(record a price or pick another date)"
                    )
                if (!TradeLegMath.cashMatchesQuantity(
                        cashMinorMagnitude = command.amount,
                        quantityMinor = qtyMinorIn,
                        priceMinorPerUnit = unitPrice.priceMinorPerUnit,
                        quantityScale = scale
                    )
                ) {
                    throw InvalidRequestException(
                        "Cash amount does not match quantity at the recorded unit price (within tolerance)"
                    )
                }
            }
            return ResolvedTradeLegs(command.amount, qtyMinorIn, scale)
        }

        if (hasCash) {
            val port = assetTradePricingPort
                ?: throw InvalidRequestException(
                    "Trade pricing is not configured; provide asset quantity or enable pricing integration"
                )
            val unitPrice = port.findUnitPriceMinorInCurrency(assetId, accountCurrency, command.date)
                ?: throw InvalidRequestException(
                    "No asset price in $accountCurrency for the selected asset and date " +
                        "(record a price, pick another date, or provide asset quantity with cash)"
                )
            val scale = TradeLegMath.DEFAULT_QUANTITY_SCALE
            val derivedQty = TradeLegMath.deriveQuantityFromCash(
                cashMinorMagnitude = command.amount,
                priceMinorPerUnit = unitPrice.priceMinorPerUnit,
                quantityScale = scale
            )
            return ResolvedTradeLegs(command.amount, derivedQty, scale)
        }

        val qm = qtyMinorIn!!
        val scale = qtyScaleUser ?: TradeLegMath.DEFAULT_QUANTITY_SCALE
        val port = assetTradePricingPort
            ?: throw InvalidRequestException(
                "Trade pricing is not configured; provide cash amount or enable pricing integration"
            )
        val unitPrice = port.findUnitPriceMinorInCurrency(assetId, accountCurrency, command.date)
            ?: throw InvalidRequestException(
                "No asset price in $accountCurrency for the selected asset and date " +
                    "(record a price, pick another date, or provide cash amount with quantity)"
            )
        val derivedCash = TradeLegMath.deriveCashMinorFromQuantity(
            quantityMinor = qm,
            priceMinorPerUnit = unitPrice.priceMinorPerUnit,
            quantityScale = scale
        )
        return ResolvedTradeLegs(derivedCash, qm, scale)
    }

    private data class ResolvedTradeLegs(
        val cashMinorMagnitude: Long,
        val qtyMinor: Long?,
        val qtyScale: Int?
    )
}
