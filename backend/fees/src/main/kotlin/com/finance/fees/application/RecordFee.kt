package com.finance.fees.application

import com.finance.fees.domain.Fee
import com.finance.fees.domain.FeeRepository
import com.finance.fees.domain.FeeType
import com.finance.shared.Currency
import com.finance.shared.error.InvalidRequestException
import java.time.LocalDate
import java.util.UUID

class RecordFee(
    private val feeRepository: FeeRepository
) {
    data class Command(
        val accountId: UUID,
        val transactionId: UUID?,
        val type: FeeType,
        val amount: Long,
        val currency: Currency,
        val date: LocalDate,
        val label: String
    )

    data class Result(val feeId: UUID)

    fun execute(command: Command): Result {
        if (command.label.isBlank()) throw InvalidRequestException("Fee label must not be blank")
        if (command.amount <= 0) throw InvalidRequestException("Fee amount must be positive")

        val fee = Fee(
            id = UUID.randomUUID(),
            accountId = command.accountId,
            transactionId = command.transactionId,
            type = command.type,
            amount = command.amount,
            currency = command.currency,
            date = command.date,
            label = command.label
        )
        return Result(feeId = feeRepository.save(fee).id)
    }
}