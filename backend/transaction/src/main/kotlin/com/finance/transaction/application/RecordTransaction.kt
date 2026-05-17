package com.finance.transaction.application

import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import com.finance.shared.error.NotFoundException
import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionRepository
import com.finance.transaction.domain.TransactionType
import com.finance.transaction.domain.ports.AccountAccessPort
import java.time.LocalDate
import java.util.UUID

class RecordTransaction(
    private val transactionRepository: TransactionRepository,
    private val accountAccessPort: AccountAccessPort
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
        val appliedFxTargetCurrency: Currency? = null
    )

    data class Result(val transactionId: UUID)

    fun execute(command: Command): Result {
        if (command.label.isBlank()) throw InvalidRequestException("Transaction label must not be blank")
        if (command.amount == 0L) throw InvalidRequestException("Transaction amount must not be zero")
        val account = accountAccessPort.findAccountForUser(command.accountId, command.requestingUserId)
            ?: throw NotFoundException("Account not found: ${command.accountId}")
        if (!account.active) throw InvalidRequestException("Cannot record transactions for a closed account")

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

        val transaction = Transaction(
            id = UUID.randomUUID(),
            accountId = command.accountId,
            assetId = command.assetId,
            type = command.type,
            amount = command.amount,
            currency = command.currency,
            date = command.date,
            label = command.label,
            notes = command.notes,
            appliedFxRate = command.appliedFxRate,
            appliedFxRateScale = command.appliedFxRateScale,
            appliedFxRateDate = command.appliedFxRateDate,
            appliedFxSourceCurrency = command.appliedFxSourceCurrency,
            appliedFxTargetCurrency = command.appliedFxTargetCurrency
        )
        return Result(transactionId = transactionRepository.save(transaction).id)
    }
}