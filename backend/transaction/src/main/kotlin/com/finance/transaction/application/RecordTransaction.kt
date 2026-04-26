package com.finance.transaction.application

import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import com.finance.transaction.domain.Transaction
import com.finance.transaction.domain.TransactionRepository
import com.finance.transaction.domain.TransactionType
import java.time.LocalDate
import java.util.UUID

class RecordTransaction(
    private val transactionRepository: TransactionRepository
) {
    data class Command(
        val accountId: UUID,
        val assetId: UUID?,
        val type: TransactionType,
        val amount: Long,
        val currency: Currency,
        val date: LocalDate,
        val label: String,
        val notes: String?
    )

    data class Result(val transactionId: UUID)

    fun execute(command: Command): Result {
        if (command.label.isBlank()) throw InvalidRequestException("Transaction label must not be blank")
        if (command.amount == 0L) throw InvalidRequestException("Transaction amount must not be zero")

        val transaction = Transaction(
            id = UUID.randomUUID(),
            accountId = command.accountId,
            assetId = command.assetId,
            type = command.type,
            amount = command.amount,
            currency = command.currency,
            date = command.date,
            label = command.label,
            notes = command.notes
        )
        return Result(transactionId = transactionRepository.save(transaction).id)
    }
}